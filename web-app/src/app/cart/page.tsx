'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ChevronLeft, ShoppingBag, MessageCircle, Loader2, ShieldCheck, RefreshCcw, Headset, Ticket, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';



export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [shippingCalculated, setShippingCalculated] = useState(false);

  // 1. Initial Load & Sync
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = JSON.parse(localStorage.getItem('personalised-cart') || '[]');

      if (savedCart.length > 0) {
        // Validate Existence & Status
        const ids = savedCart.map((i: any) => i.id);

        // Check if products exist in 'products' table AND fetch status
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .in('id', ids);

        const { data: statusData } = await supabase
          .from('product_status_info')
          .select('id, status')
          .in('id', ids);

        const validProductIds = new Set(products?.map((p: any) => p.id));

        // Filter out invalid items
        const validCart = savedCart.filter((item: any) => {
          // 1. Must exist in products table (FK check)
          if (!validProductIds.has(item.id)) return false;

          // 2. If status info exists, must be active
          const statusItem = statusData?.find((s: any) => s.id === item.id);
          if (statusItem && statusItem.status !== 'active') return false;

          return true;
        });

        if (validCart.length !== savedCart.length) {
          alert("Some items in your cart are no longer available and have been removed.");
          localStorage.setItem('personalised-cart', JSON.stringify(validCart));
          setCartItems(validCart.map((item: any) => ({ ...item, quantity: item.quantity || 1 })));
        } else {
          setCartItems(savedCart.map((item: any) => ({ ...item, quantity: item.quantity || 1 })));
        }
      } else {
        setCartItems([]);
      }
    };
    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    saveAndSync(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    saveAndSync(updated);
  };

  const saveAndSync = (items: any[]) => {
    setCartItems(items);
    localStorage.setItem('personalised-cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  };

  // 2. Calculations
  const totalMRP = cartItems.reduce((acc, item) => acc + (item.price * 1.4 * item.quantity), 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = totalMRP - subtotal;
  const shipping = shippingCalculated ? 50 : 0;
  const couponDiscount = couponApplied ? 100 : 0;
  const finalTotal = subtotal + shipping - couponDiscount;

  // 3. Checkout
  const handleCheckout = async () => {
    setIsOrdering(true);
    const whatsappNumber = "919876543210";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;

        await supabase.from('orders').insert({
          id: orderId,
          user_id: user.id,
          total_amount: finalTotal,
          status: 'Placed'
        });

        const orderItems = cartItems.map(item => ({
          order_id: orderId,
          product_name: item.name,
          product_id: item.id,
          price: item.price,
          quantity: item.quantity,
          image_url: item.imageUrl || item.image_url,
          seller_id: item.seller_id, // Important: Save Seller ID
          status: 'Pending',
          customization_details: item.customization // Save Personalization
        }));


        await supabase.from('order_items').insert(orderItems);

        // Add Notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Order Placed Successfully',
          message: `Your order #${orderId} has been placed. We will notify you once it ships.`,
          type: 'order'
        });
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }

    let message = `*New Order from Personalised Wallah*%0A%0A`;
    cartItems.forEach((item, i) => {
      message += `${i + 1}. ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
      if (Array.isArray(item.customization)) {
        item.customization.forEach((c: any) => {
          if (c.type !== 'image') {
            message += `   - ${c.label}: ${c.value}%0A`;
          } else {
            message += `   - ${c.label}: [Image Attached in Order]%0A`;
          }
        });
      }
    });
    message += `%0A*Subtotal: ₹${subtotal}*`;
    if (couponApplied) message += `%0A*Coupon Discount: -₹${couponDiscount}*`;
    if (shippingCalculated) message += `%0A*Shipping: ₹${shipping}*`;
    message += `%0A*Final Total: ₹${finalTotal}*%0A%0APlease confirm my order!`;

    setIsOrdering(false);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  // Empty State
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white p-4 animate-in fade-in">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-8 max-w-sm text-center">Looks like you haven't found the perfect gift yet. Explore our collections for inspiration!</p>
        <Link href="/" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Steps Indicator */}
      <div className="bg-white border-b border-slate-100 py-4 mb-8 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 md:gap-8 text-xs md:text-sm font-bold text-slate-400">
          <span className="text-indigo-600 flex items-center gap-2"><span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">1</span> Cart</span>
          <span className="h-0.5 w-8 md:w-16 bg-slate-200"></span>
          <span className="flex items-center gap-2"><span className="w-6 h-6 border-2 border-slate-200 rounded-full flex items-center justify-center">2</span> Information</span>
          <span className="h-0.5 w-8 md:w-16 bg-slate-200"></span>
          <span className="flex items-center gap-2"><span className="w-6 h-6 border-2 border-slate-200 rounded-full flex items-center justify-center">3</span> Shipping</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left: Product List (70%) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-black text-slate-900">Your Cart</h1>
              <span className="text-slate-500 font-medium">{cartItems.length} Items</span>
            </div>

            {/* List Items */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="group bg-white p-4 rounded-2xl flex gap-4 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300">
                  {/* Image */}
                  <div className="h-28 w-28 bg-slate-50 rounded-xl overflow-hidden shrink-0 relative">
                    <img src={item.imageUrl || item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item.name}</h3>
                        <div className="text-sm text-slate-500 mb-2 space-y-1">
                          {Array.isArray(item.customization) ? item.customization.map((c: any, idx: number) => (
                            <div key={idx} className="flex gap-1">
                              <span className="font-bold text-xs uppercase">{c.label}:</span>
                              {c.type === 'image' ? (
                                <a href={c.value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs underline">View Image</a>
                              ) : (
                                <span className="text-xs">{c.value}</span>
                              )}
                            </div>
                          )) : (
                            <span>{item.category}</span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded-md">In Stock</div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer p-1">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer">
                          <Minus size={14} className="text-slate-900" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer">
                          <Plus size={14} className="text-slate-900" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-black text-slate-900 text-xl">₹{item.price * item.quantity}</span>
                        {item.quantity > 1 && <span className="block text-xs text-slate-400 font-medium">₹{item.price} / unit</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>


          </div>

          {/* Right: Order Summary (30%) - Sticky */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Shipping</span>
                    {shippingCalculated ? (
                      <span className="font-bold text-slate-900">₹{shipping}</span>
                    ) : (
                      <button onClick={() => setShippingCalculated(true)} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Calculate</button>
                    )}
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Tax (Included)</span>
                    <span className="font-bold text-slate-900">₹0</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                      <span className="font-bold flex items-center gap-1"><Ticket size={14} /> Coupon Code</span>
                      <span className="font-bold">-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-lg text-slate-900">Total</span>
                    <span className="font-black text-2xl text-slate-900">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied}
                        style={{ color: '#000000', backgroundColor: '#ffffff', caretColor: '#000000' }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (couponCode === 'SAVE100') setCouponApplied(true);
                        else alert('Invalid Code (Try SAVE100)');
                      }}
                      disabled={couponApplied}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      {couponApplied ? <Check size={18} /> : 'Apply'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/checkout'}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg hover:bg-black hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </button>

                <p className="text-xs text-center text-slate-400 font-medium mt-4">
                  Secure Checkout
                </p>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center flex flex-col items-center gap-1">
                  <ShieldCheck size={20} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">Secure</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center flex flex-col items-center gap-1">
                  <RefreshCcw size={20} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">Returns</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center flex flex-col items-center gap-1">
                  <Headset size={20} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">Support</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}