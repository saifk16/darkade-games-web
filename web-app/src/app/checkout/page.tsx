'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShieldCheck, CreditCard, CheckCircle2, Truck, MapPin, Check, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment
    const [cart, setCart] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [agreed, setAgreed] = useState(false);

    // Address Management
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        type: 'Home'
    });

    // Serviceability State
    const [isServiceable, setIsServiceable] = useState(true);
    const [sellerPincodes, setSellerPincodes] = useState<Record<string, number>>({});
    const [deliveryStatus, setDeliveryStatus] = useState<Record<string, { serviceable: boolean, courier?: string, etd?: string }>>({});

    // Fetch Seller Pincodes when cart loads
    useEffect(() => {
        const fetchSellerPincodes = async () => {
            if (cart.length === 0) return;

            // Get unique seller IDs
            const sellerIds = [...new Set(cart.map(item => item.seller_id).filter(Boolean))];
            if (sellerIds.length === 0) return;

            const { data: sellers } = await supabase
                .from('seller_info')
                .select('id, pincode')
                .in('id', sellerIds);

            if (sellers) {
                const pincodeMap: Record<string, number> = {};
                sellers.forEach(s => {
                    if (s.pincode) pincodeMap[s.id] = parseInt(s.pincode);
                });
                setSellerPincodes(pincodeMap);
            }
        };
        fetchSellerPincodes();
    }, [cart]);

    const checkDelivery = async (pincode: string) => {
        if (pincode.length !== 6) return;

        // Reset status
        setDeliveryStatus({});
        let allServiceable = true;

        const uniqueSellers = Object.keys(sellerPincodes);
        if (uniqueSellers.length === 0) {
            // Fallback if no seller info (e.g. old cart items or admin products)
            // Treat as serviceable or default pincode? Let's assume serviceable for now to not block.
            setIsServiceable(true);
            return;
        }

        const newStatus: Record<string, any> = {};

        // Check for EACH seller
        await Promise.all(uniqueSellers.map(async (sellerId) => {
            const pickup = sellerPincodes[sellerId];
            try {
                const res = await fetch('/api/shiprocket/serviceability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pickup_pincode: pickup,
                        delivery_pincode: pincode,
                        weight: 0.5,
                        cod: 0
                    })
                });
                const data = await res.json();

                if (data.data && data.data.available_courier_companies.length > 0) {
                    newStatus[sellerId] = {
                        serviceable: true,
                        courier: data.data.available_courier_companies[0].courier_name,
                        etd: data.data.available_courier_companies[0].etd
                    };
                } else {
                    newStatus[sellerId] = { serviceable: false };
                    allServiceable = false;
                }
            } catch (error) {
                console.error(`Serviceability check failed for seller ${sellerId}:`, error);
                // Fail open or closed? Let's fail open (allow) but warn? No, fail closed for shipping implies we can't ship.
                // But to be safe against API errors, maybe allow.
                // For now, mark as serviceable but unknown courier
                newStatus[sellerId] = { serviceable: true, courier: 'Standard Courier' };
            }
        }));

        setDeliveryStatus(newStatus);
        setIsServiceable(allServiceable);
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login?redirect=/checkout'); return; }
            setUser(user);

            // Load Cart
            const cartItems = JSON.parse(localStorage.getItem('personalised-cart') || '[]');
            setCart(cartItems);
            const sum = cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
            setTotal(sum);

            // Load ALL Saved Addresses
            const { data: addresses } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (addresses && addresses.length > 0) {
                setSavedAddresses(addresses);
                // Auto-select default
                const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
                selectAddress(defaultAddr);
                setShowAddressForm(false);
            } else {
                setShowAddressForm(true); // No addresses, show form
                // Pre-fill from meta if possible
                if (user.user_metadata) {
                    setFormData(prev => ({
                        ...prev,
                        full_name: user.user_metadata.full_name || '',
                        phone: user.phone || ''
                    }));
                }
            }

            setLoading(false);
        };
        init();
    }, [router]);

    const selectAddress = (addr: any) => {
        setSelectedAddressId(addr.id);
        setFormData({
            full_name: addr.name,
            phone: addr.phone,
            address_line1: addr.address_line1,
            address_line2: '', // Schema check?
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            type: addr.type
        });
        setShowAddressForm(false);
        checkDelivery(addr.pincode);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'pincode' && e.target.value.length === 6) {
            checkDelivery(e.target.value);
        }
    };

    const handleAddNewAddress = () => {
        setSelectedAddressId(null);
        setFormData({
            full_name: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            pincode: '',
            type: 'Home'
        });
        setShowAddressForm(true);
    }

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Validation
        if (!formData.full_name || !formData.address_line1 || !formData.city || !formData.pincode || !formData.phone) {
            alert("Please fill in all required fields.");
            setProcessing(false);
            return;
        }

        if (!isServiceable) {
            alert("Sorry, we cannot deliver to this pincode. Please choose another address.");
            setProcessing(false);
            return;
        }

        try {
            // Save Address Logic: If "Add New" mode (no ID selected) OR changed?
            // User requested: "if new address given, save it".
            // We can check if exact address exists, if not insert.

            // Trigger check when address is selected (existing logic)
            // ...

            if (!selectedAddressId) {
                // Check serviceability for new address
                await checkDelivery(formData.pincode);

                // It's a new address form submission
                const { data: existing } = await supabase
                    .from('addresses')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('address_line1', formData.address_line1)
                    .eq('pincode', formData.pincode)
                    .maybeSingle();

                if (!existing) {
                    // Insert new
                    const { data: newAddr, error } = await supabase
                        .from('addresses')
                        .insert([{
                            user_id: user.id,
                            name: formData.full_name,
                            phone: formData.phone,
                            address_line1: formData.address_line1,
                            city: formData.city,
                            state: formData.state,
                            pincode: formData.pincode,
                            type: formData.type,
                            is_default: savedAddresses.length === 0 // First one is default
                        }])
                        .select()
                        .single();

                    if (newAddr) {
                        setSavedAddresses(prev => [newAddr, ...prev]);
                        setSelectedAddressId(newAddr.id);
                    }
                }
            } else {
                // Existing address selected. User might have edited it?
                // For now, let's assume if they selected a card, they didn't edit the form unless they clicked "Edit".
                // But wait, the form populates. If they change it, `selectedAddressId` remains?
                // If they change fields, effectively it becomes new or update.
                // Ideally, we should detect change.
                // Simplification: We proceed with formData for the Order. We don't update the address book to avoid overwriting accidentally.
            }

            setTimeout(() => {
                setStep(2);
                setProcessing(false);
                window.scrollTo(0, 0);
            }, 300);

        } catch (error) {
            console.error("Address save error:", error);
            // Proceed anyway, don't block checkout
            setStep(2);
            setProcessing(false);
        }
    };

    const handlePayment = async () => {
        if (!agreed) {
            alert("Please agree to the Terms & Conditions.");
            return;
        }

        setProcessing(true);

        try {
            // 1. Create Order on Server
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total + 50, currency: 'INR' }), // Add Shipping
            });

            const order = await response.json();
            if (order.error) throw new Error(order.error);

            // 2. Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Personalised Wallah",
                description: "Order Payment",
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            await createOrderInDb(response);
                        } else {
                            alert('Payment verification failed');
                            setProcessing(false);
                        }
                    } catch (error) {
                        console.error(error);
                        alert('Payment failed during verification');
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: formData.full_name,
                    email: user?.email || '',
                    contact: formData.phone
                },
                theme: {
                    color: "#4F46E5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(response.error.description);
                setProcessing(false);
            });
            rzp.open();

        } catch (error: any) {
            console.error(error);
            alert("Payment init failed: " + error.message);
            setProcessing(false);
        }
    };

    const createOrderInDb = async (paymentDetails: any) => {
        try {
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    total_amount: total + 50,
                    status: 'Confirmed',
                    payment_status: 'Paid',
                    payment_method: 'Razorpay',
                    transaction_id: paymentDetails.razorpay_payment_id,
                    razorpay_order_id: paymentDetails.razorpay_order_id,
                    razorpay_payment_id: paymentDetails.razorpay_payment_id,
                    razorpay_signature: paymentDetails.razorpay_signature,
                    placed_at: new Date().toISOString(),
                    delivery_address: JSON.stringify(formData)
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Shiprocket Order (Async)
            try {
                await fetch('/api/shiprocket/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderData: orderData,
                        user: user,
                        address: formData
                    })
                });
            } catch (srError) {
                console.error("Shiprocket Order Failed:", srError);
                // Don't block success UI, just log it. Admin can manually ship.
            }

            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                user_id: user.id,
                seller_id: item.seller_id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                image_url: item.image_url,
                status: 'Pending',
                customization_details: item.customization || null,
                payout_status: 'pending'
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            localStorage.removeItem('personalised-cart');
            window.dispatchEvent(new Event('cart-updated')); // Notify Navbar to update cart count
            router.push('/profile');
            alert("Payment Successful! Order Placed.");

        } catch (error: any) {
            console.error("DB Error:", JSON.stringify(error, null, 2));
            alert(`Order creation failed. ${error.message || error.code || ''}`);
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h1 className="text-2xl font-black text-slate-800 mb-4">Cart seems empty...</h1>
                <Link href="/cart" className="text-indigo-600 font-bold hover:underline">Return to Cart</Link>
            </div>
        );
    }

    // Helper for Step Indicator
    const StepItem = ({ num, label, isActive, isCompleted }: { num: number, label: string, isActive: boolean, isCompleted: boolean }) => (
        <span className={`flex items-center gap-2 ${isActive || isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-current ${isActive ? 'bg-indigo-100 border-indigo-200' : isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'}`}>
                {isCompleted ? <Check size={14} strokeWidth={3} /> : num}
            </span>
            {label}
        </span>
    );

    const StepDivider = ({ isActive }: { isActive: boolean }) => (
        <span className={`h-0.5 w-8 md:w-16 ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}></span>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Sticky Steps Indicator (Consistent with Cart) */}
            <div className="bg-white border-b border-slate-100 py-4 mb-8 sticky top-0 z-20 shadow-sm animate-in slide-in-from-top-4 duration-300">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 md:gap-8 text-xs md:text-sm font-bold">
                    <StepItem num={1} label="Cart" isActive={false} isCompleted={true} />
                    <StepDivider isActive={true} />

                    <StepItem num={2} label="Information" isActive={step === 1} isCompleted={step > 1} />
                    <StepDivider isActive={step > 1} />

                    <StepItem num={3} label="Shipping" isActive={step === 2} isCompleted={step > 2} />
                    <StepDivider isActive={step > 2} />

                    <StepItem num={4} label="Payment" isActive={step === 3} isCompleted={step > 3} />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 lg:px-8">
                {/* Header (Back Link) */}
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/cart" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm">
                        <ArrowLeft size={18} /> Back to Cart
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Secure Checkout</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Form Steps (7 Columns) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Step 1: Information */}
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ${step !== 1 ? 'hidden' : ''} animate-in fade-in slide-in-from-left-4 duration-300`}>
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-slate-900">Contact Information</h2>
                                <p className="text-slate-500 text-sm">Where should we create your masterpiece?</p>
                            </div>

                            {/* Address Selection (If saved addresses exist) */}
                            {savedAddresses.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    <h3 className="text-sm font-bold text-slate-700">Saved Addresses</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedAddresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                onClick={() => selectAddress(addr)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{addr.type}</span>
                                                    {selectedAddressId === addr.id && <CheckCircle2 size={18} className="text-indigo-600" />}
                                                </div>
                                                <p className="font-bold text-slate-900 text-sm line-clamp-1">{addr.name}</p>
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{addr.address_line1}, {addr.city}, {addr.pincode}</p>
                                                <p className="text-xs text-slate-500 mt-1">{addr.phone}</p>
                                            </div>
                                        ))}
                                        {/* Add New Button Block */}
                                        <div
                                            onClick={handleAddNewAddress}
                                            className={`p-4 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${!selectedAddressId && showAddressForm ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                                        >
                                            <Plus size={24} className="text-slate-400" />
                                            <span className="font-bold text-sm text-slate-600">Add New Address</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Address Form (Show if no saved or "Add New" clicked) */}
                            {(showAddressForm || savedAddresses.length === 0) && (
                                <form onSubmit={handleInfoSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-slate-700">New Address Details</h3>
                                        {savedAddresses.length > 0 && (
                                            <button type="button" onClick={() => { setShowAddressForm(false); if (savedAddresses.length > 0) selectAddress(savedAddresses[0]); }} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                                            <input type="text" name="full_name" required value={formData.full_name} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" placeholder="John Doe" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                                            <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" placeholder="+91 98765 43210" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pincode</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                required
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                maxLength={6}
                                                className={`w-full p-3 bg-slate-50 border ${!isServiceable ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl outline-none transition-all font-medium text-slate-900`}
                                                placeholder="110001"
                                            />
                                            {!isServiceable && (
                                                <p className="text-xs text-red-500 mt-1 font-semibold">❌ Some items are not deliverable here.</p>
                                            )}
                                            {isServiceable && formData.pincode.length === 6 && (
                                                <p className="text-xs text-green-600 mt-1 font-semibold">
                                                    ✅ Delivery available for all items.
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address Line 1</label>
                                            <input type="text" name="address_line1" required value={formData.address_line1} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" placeholder="House No, Building, Street" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address Line 2 (Optional)</label>
                                            <input type="text" name="address_line2" value={formData.address_line2} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" placeholder="Landmark, Area" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                                            <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" placeholder="New Delhi" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                                            <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" placeholder="Delhi" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address Type</label>
                                            <div className="flex gap-4">
                                                {['Home', 'Work', 'Other'].map(t => (
                                                    <label key={t} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                                                        <input type="radio" name="type" value={t} checked={formData.type === t} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                                        <span className="text-sm font-bold text-slate-700">{t}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6 flex justify-end">
                                        <button type="submit" disabled={processing} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 flex items-center gap-2">
                                            {processing ? <Loader2 className="animate-spin" size={18} /> : 'Save & Continue'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Continue Button (If Address Selected & Form Hidden) */}
                            {!showAddressForm && savedAddresses.length > 0 && (
                                <div className="pt-6 flex justify-end">
                                    <button onClick={handleInfoSubmit} disabled={processing} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 flex items-center gap-2">
                                        {processing ? <Loader2 className="animate-spin" size={18} /> : 'Continue to Shipping'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Shipping */}
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ${step !== 2 ? 'hidden' : ''} animate-in fade-in slide-in-from-right-4 duration-300`}>
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-slate-900">Shipping Method</h2>
                                <p className="text-slate-500 text-sm">Select how you want your order delivered.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Review Address */}
                                <div className="border border-slate-200 rounded-xl p-4 flex items-start gap-4">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><MapPin size={20} /></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 text-sm">Ship to</p>
                                        <p className="text-slate-600 text-sm mt-1">{formData.address_line1}, {formData.city}, {formData.pincode}</p>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-indigo-600 text-xs font-bold hover:underline">Change</button>
                                </div>

                                {/* Shipping Options */}
                                <div className="border-2 border-indigo-600 bg-indigo-50/50 rounded-xl p-4 flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 rounded-full border-4 border-indigo-600 bg-white"></div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Standard Shipping</p>
                                            <p className="text-slate-500 text-xs mt-0.5">Estimated delivery: 5-7 days</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-slate-900">₹50.00</div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between items-center">
                                <button onClick={() => setStep(1)} className="text-slate-500 font-bold text-sm hover:text-slate-800 flex items-center gap-2"><ArrowLeft size={16} /> Return to Info</button>
                                <button onClick={() => setStep(3)} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                                    Continue to Payment
                                </button>
                            </div>
                        </div>

                        {/* Step 3: Payment */}
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ${step !== 3 ? 'hidden' : ''} animate-in fade-in slide-in-from-right-4 duration-300`}>
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-slate-900">Payment</h2>
                                <p className="text-slate-500 text-sm">All transactions are secure and encrypted.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Summary of Steps */}
                                <div className="space-y-3 text-sm border border-slate-200 rounded-xl p-4 bg-slate-50">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">Contact</span>
                                        <span className="font-medium text-slate-900">{formData.phone}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">Ship to</span>
                                        <span className="font-medium text-slate-900 text-right w-1/2 truncate">{formData.address_line1}, {formData.city}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Method</span>
                                        <span className="font-medium text-slate-900">Standard (₹50)</span>
                                    </div>
                                </div>

                                {/* Terms */}
                                <label className="flex gap-3 items-start cursor-pointer p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="text-sm text-slate-600">
                                        <p className="font-bold text-slate-800">I agree to the Return Policy</p>
                                        <p className="text-xs mt-1">This is a <strong>customized product</strong> and cannot be returned unless damaged.</p>
                                    </div>
                                </label>

                                <div className="pt-4 flex justify-between items-center">
                                    <button onClick={() => setStep(2)} className="text-slate-500 font-bold text-sm hover:text-slate-800 flex items-center gap-2"><ArrowLeft size={16} /> Return to Shipping</button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={processing || !agreed}
                                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:grayscale flex items-center gap-3"
                                    >
                                        {processing ? (
                                            <><Loader2 className="animate-spin" /> Processing...</>
                                        ) : (
                                            <>Pay ₹{total + 50}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary (5 Columns) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
                            <h3 className="font-black text-lg text-slate-900 mb-4">Order Summary</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                                {cart.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-100 relative shrink-0 overflow-hidden">
                                            {item.image_url ? (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                    <ShoppingBag size={20} />
                                                </div>
                                            )}
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm z-10">{item.quantity}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-sm line-clamp-2">{item.name}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                                            <div className="mt-1">
                                                {deliveryStatus[item.seller_id]?.serviceable ? (
                                                    <p className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 font-bold border border-green-100">
                                                        <Truck size={10} />
                                                        {deliveryStatus[item.seller_id]?.etd ? `Delivers by ${deliveryStatus[item.seller_id]?.etd}` : 'Delivery Available'}
                                                    </p>
                                                ) : deliveryStatus[item.seller_id] ? (
                                                    <p className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 font-bold border border-red-100">
                                                        ❌ Not Deliverable
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-slate-400">Checking...</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm">₹{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-900">₹{total}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="font-bold text-slate-900">{step >= 2 ? '₹50.00' : 'Calculated next step'}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                                <span className="font-bold text-lg text-slate-900">Total</span>
                                <span className="font-black text-2xl text-slate-900">₹{step >= 2 ? total + 50 : total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
