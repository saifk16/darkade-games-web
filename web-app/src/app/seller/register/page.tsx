'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Check, Upload, ChevronRight, ChevronLeft, Loader2, FileText, Building2, Landmark, User, Store, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SellerRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch existing data on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                fetchExistingData(session.user.id);
            }
        };
        checkSession();
    }, []);

    const fetchExistingData = async (uid: string) => {
        setIsLoading(true);
        try {
            // 1. Get Seller Info (Step & Basic)
            const { data: sellerInfo } = await supabase
                .from('seller_info')
                .select('*')
                .eq('id', uid)
                .single();

            // 2. Get Business Details
            const { data: businessDetails } = await supabase
                .from('seller_business_details')
                .select('*')
                .eq('id', uid)
                .single();

            if (sellerInfo) {
                // Resume step
                const nextStep = (sellerInfo.onboarding_step || 0) + 1;
                setStep(Math.min(nextStep, 5));

                setFormData(prev => ({
                    ...prev,
                    fullName: sellerInfo.owner_name || prev.fullName, // Ensure we map owner name if available
                    phoneNumber: sellerInfo.mobile || prev.phoneNumber,
                    storeDisplayName: sellerInfo.store_name || prev.storeDisplayName,
                }));
            }

            if (businessDetails) {
                setFormData(prev => ({
                    ...prev,
                    businessLegalName: businessDetails.business_legal_name || prev.businessLegalName,
                    businessType: businessDetails.business_type || prev.businessType,
                    gstin: businessDetails.gstin || prev.gstin,
                    panNumber: businessDetails.pan_card_number || prev.panNumber,
                    accountHolderName: businessDetails.bank_account_holder_name || prev.accountHolderName,
                    bankAccountNumber: businessDetails.bank_account_number || prev.bankAccountNumber,
                    ifscCode: businessDetails.ifsc_code || prev.ifscCode,
                    registeredAddress: businessDetails.registered_address || prev.registeredAddress,
                    pickupAddress: businessDetails.pickup_address || prev.pickupAddress,
                    storeDescription: businessDetails.store_description || prev.storeDescription,
                    // Files are harder to pre-fill in input type=file, but valid logic handles re-upload
                }));
            }

        } catch (error) {
            console.error("Error fetching draft:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to save progress after each step
    const saveProgress = async (stepCompleted: number) => {
        if (!userId) return;

        try {
            // Update step in seller_info
            await supabase.from('seller_info').upsert({
                id: userId,
                onboarding_step: stepCompleted,
                // Also save partial data corresponding to the step if needed,
                // but most data is in seller_business_details or specific columns.
                // Let's save specific fields based on step.
            });

            // Save form data to business details (partial upsert)
            const businessData: any = { id: userId };
            if (stepCompleted >= 2) {
                businessData.business_legal_name = formData.businessLegalName;
                businessData.business_type = formData.businessType;
                businessData.gstin = formData.gstin;
                businessData.pan_card_number = formData.panNumber;
            }
            if (stepCompleted >= 3) {
                businessData.bank_account_holder_name = formData.accountHolderName;
                businessData.bank_account_number = formData.bankAccountNumber;
                businessData.ifsc_code = formData.ifscCode;
            }
            if (stepCompleted >= 4) {
                businessData.registered_address = formData.registeredAddress;
                businessData.pickup_address = formData.pickupAddress;
            }
            // Step 5 handles final submit

            if (Object.keys(businessData).length > 1) {
                await supabase.from('seller_business_details').upsert(businessData);
            }

        } catch (e) {
            console.error("Auto-save failed:", e);
        }
    };

    const nextStep = async () => {
        setIsLoading(true);
        await saveProgress(step); // Save current step as completed
        setStep(prev => prev + 1);
        setIsLoading(false);
    }

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Basic
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',

        // Step 2: Business
        businessLegalName: '',
        storeDisplayName: '',
        businessType: 'Sole Proprietorship',
        gstin: '',
        panNumber: '',

        // Step 3: Address
        registeredAddress: '',
        pickupAddress: '',
        city: '',
        state: '',
        pincode: '',

        // Step 4: Bank
        accountHolderName: '',
        bankAccountNumber: '',
        ifscCode: '',

        // Step 5: Customization
        storeDescription: '',
        instagramHandle: '',
        facebookHandle: '',
    });

    // File State
    const [files, setFiles] = useState<{
        cheque: File | null;
        logo: File | null;
    }>({
        cheque: null,
        logo: null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cheque' | 'logo') => {
        if (e.target.files && e.target.files[0]) {
            setFiles({ ...files, [type]: e.target.files[0] });
        }
    };

    // Step 1: Sign Up User (or Save if already logged in)
    const handleInitialSignUp = async () => {
        setIsLoading(true);
        try {
            // Check if we are already logged in
            if (userId) {
                // Just save details and move next
                // We might want to update user metadata here if needed
                await saveProgress(1); // Ensure Step 1 is marked done
                setStep(2);
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phoneNumber,
                        role: 'seller' // Important for RLS if using custom claims later
                    }
                }
            });

            if (error) throw error;
            if (data.user) {
                setUserId(data.user.id);
                setStep(2);
                saveProgress(1); // Mark step 1 completed
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Final Submission
    const handleSubmit = async () => {
        if (!userId) return;
        setIsLoading(true);

        try {
            // 1. Upload Files
            let chequeUrl = '';
            let logoUrl = '';

            if (files.cheque) {
                const { data, error } = await supabase.storage
                    .from('seller-docs')
                    .upload(`${userId}/cheque-${Date.now()}`, files.cheque);
                if (error) throw error;
                chequeUrl = data.path; // Store path, or getPublicUrl if public (but this is private)
            }

            if (files.logo) {
                const { data, error } = await supabase.storage
                    .from('shop-assets')
                    .upload(`${userId}/logo-${Date.now()}`, files.logo);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage.from('shop-assets').getPublicUrl(data.path);
                logoUrl = publicUrl;
            }

            // 2. Insert into seller_info (Base profile)
            // Note: If profile trigger created row, we update. If not, insert.
            const { error: infoError } = await supabase
                .from('seller_info')
                .upsert({
                    id: userId,
                    store_name: formData.storeDisplayName,
                    mobile: formData.phoneNumber,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    business_category: formData.businessType,
                    avatar_url: logoUrl, // Save logo to avatar_url for shop page
                    bio: formData.storeDescription, // Save description to bio for shop page
                    seller_status: 'pending',
                    onboarding_step: 5 // Max step completed
                });

            if (infoError) throw infoError;

            // 3. Insert into seller_business_details (Extended info)
            const { error: businessError } = await supabase
                .from('seller_business_details')
                .upsert({
                    id: userId,
                    business_legal_name: formData.businessLegalName,
                    business_type: formData.businessType,
                    gstin: formData.gstin,
                    pan_card_number: formData.panNumber,
                    bank_account_holder_name: formData.accountHolderName,
                    bank_account_number: formData.bankAccountNumber,
                    ifsc_code: formData.ifscCode,
                    cancelled_cheque_url: chequeUrl,
                    registered_address: formData.registeredAddress,
                    pickup_address: formData.pickupAddress,
                    store_description: formData.storeDescription
                });

            if (businessError) throw businessError;

            // Success!
            alert('Registration Successful! Please wait for approval.');
            router.push('/dashboard'); // or login

        } catch (error: any) {
            console.error(error);
            alert('Error submitting details: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Column: Stepper & Branding (Matches Login Style) */}
            <div className="hidden lg:flex lg:w-1/3 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-90"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 text-white">
                    <Link href="/" className="flex items-center gap-2 mb-12 group w-fit">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                            <span className="font-bold text-xl">P</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">Personalised Wallah</span>
                    </Link>

                    <h2 className="text-4xl font-black mb-2">Partner Onboarding</h2>
                    <p className="text-slate-400 mb-12">Complete these simple steps to start selling.</p>

                    <div className="space-y-8 relative pl-2">
                        {/* Connector Line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

                        {[
                            { step: 1, label: 'Profile', desc: 'Basic details' },
                            { step: 2, label: 'Business', desc: 'Legal info' },
                            { step: 3, label: 'Bank', desc: 'Payouts' },
                            { step: 4, label: 'Address', desc: 'Pickups' },
                            { step: 5, label: 'Store', desc: 'Branding' }
                        ].map((s) => (
                            <div key={s.step} className={`flex items-start gap-4 transition-all duration-500 ${step >= s.step ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4'}`}>
                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${step > s.step ? 'bg-indigo-500 text-white shadow-indigo-500/30' :
                                    step === s.step ? 'bg-white text-slate-900 scale-110 shadow-white/20 ring-4 ring-white/10' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}>
                                    {step > s.step ? <Check size={16} /> : s.step}
                                </div>
                                <div>
                                    <span className={`block font-bold text-lg leading-none mb-1 ${step === s.step ? 'text-white' : 'text-slate-300'}`}>{s.label}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{s.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-500 mt-12 flex justify-between items-center">
                    <span>© 2024 Personalised Wallah</span>
                    <a href="#" className="hover:text-white transition-colors">Need Help?</a>
                </div>
            </div>

            {/* Right Column: Main Form Area */}
            <div className="flex-1 bg-slate-50 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-20">
                    <Link href="/" className="font-black text-slate-900 tracking-tight">PW.</Link>
                    <div className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                        Step {step} of 5
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-2xl mx-auto p-6 md:p-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Back Button */}
                        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 group font-medium text-sm">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            {step > 1 ? 'Back to previous step' : 'Back to Home'}
                        </button>

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                {step === 1 && "Create your Seller Account"}
                                {step === 2 && "Business Information"}
                                {step === 3 && "Bank Account Details"}
                                {step === 4 && "Operational Addresses"}
                                {step === 5 && "Customize your Store"}
                            </h1>
                            <p className="text-slate-500 text-lg">
                                {step === 1 && "Start your journey with us today."}
                                {step === 2 && "Tell us about your legal entity."}
                                {step === 3 && "Where should we send your payouts?"}
                                {step === 4 && "Where will we need to pick up orders?"}
                                {step === 5 && "Make your shop stand out."}
                            </p>
                        </div>

                        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200/60 space-y-6">
                            {/* STEP 1: BASIC PROFILE */}
                            {step === 1 && (
                                <>
                                    <div className="space-y-4">
                                        <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Rahul Kumar" icon={<User size={18} />} />
                                        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="rahul@example.com" />
                                        <Input label="Phone Number" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+91 98765 43210" />
                                        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" />
                                    </div>
                                    <div className="pt-4">
                                        <Button onClick={handleInitialSignUp} loading={isLoading}>
                                            {userId ? "Save & Continue" : "Create Account & Continue"} <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                    <p className="text-center text-sm text-slate-500 mt-2">
                                        Already have an account? <Link href="/seller/login" className="text-indigo-600 font-bold hover:underline">Login here</Link>
                                    </p>
                                </>
                            )}

                            {/* STEP 2: BUSINESS INFO */}
                            {step === 2 && (
                                <>
                                    <Input label="Business Legal Name" name="businessLegalName" value={formData.businessLegalName} onChange={handleChange} placeholder="Registered Business Name" icon={<Building2 size={18} />} />
                                    <Input label="Store Display Name" name="storeDisplayName" value={formData.storeDisplayName} onChange={handleChange} placeholder="Shop Name for Customers" icon={<Store size={18} />} />

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Business Type</label>
                                        <div className="relative">
                                            <select
                                                name="businessType"
                                                value={formData.businessType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 appearance-none"
                                            >
                                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Private Limited">Private Limited</option>
                                                <option value="LLP">LLP</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ChevronRight className="rotate-90" size={16} /></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="GST Number" />
                                        <Input label="PAN Card" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number" />
                                    </div>

                                    <div className="pt-6">
                                        <Button onClick={nextStep}>Next Step <ChevronRight size={18} /></Button>
                                    </div>
                                </>
                            )}

                            {/* STEP 3: BANK DETALS */}
                            {step === 3 && (
                                <>
                                    <Input label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Name as per Bank" icon={<Landmark size={18} />} />
                                    <Input label="Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} placeholder="XXXXXXXXXXXX" />
                                    <Input label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="SBIN000XXXX" />

                                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all group">
                                        <label className="flex flex-col items-center justify-center cursor-pointer">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                                                <Upload size={20} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Upload Cancelled Cheque</span>
                                            <span className="text-xs text-slate-400 mt-1 font-medium">JPG, PNG or PDF (Max 5MB)</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'cheque')} />
                                        </label>
                                        {files.cheque && (
                                            <div className="mt-4 p-2 bg-green-50 rounded-lg text-xs font-bold text-green-700 flex items-center gap-2 justify-center border border-green-100">
                                                <CheckCircle size={14} /> {files.cheque.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6">
                                        <Button onClick={nextStep}>Next Step <ChevronRight size={18} /></Button>
                                    </div>
                                </>
                            )}


                            {/* STEP 4: ADDRESS */}
                            {step === 4 && (
                                <>
                                    <Input label="Registered Office Address" name="registeredAddress" value={formData.registeredAddress} onChange={handleChange} placeholder="Street Address" />
                                    <Input label="Warehouse/Pickup Address" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} placeholder="Where orders ship from (if different)" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                                        <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                                    </div>
                                    <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="ZIP Code" />

                                    <div className="pt-6">
                                        <Button onClick={nextStep}>Next Step <ChevronRight size={18} /></Button>
                                    </div>
                                </>
                            )}

                            {/* STEP 5: CUSTOMIZATION */}
                            {step === 5 && (
                                <>
                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:border-indigo-400 transition-all text-center group">
                                        <label className="flex flex-col items-center justify-center cursor-pointer">
                                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:-translate-y-1 transition-transform">
                                                {files.logo ? (
                                                    <img src={URL.createObjectURL(files.logo)} className="w-full h-full object-cover rounded-2xl" />
                                                ) : <Store size={32} />}
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">Upload Store Logo</span>
                                            <span className="text-xs text-slate-400 mt-1">Recommended: 500x500px</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                                        </label>
                                    </div>

                                    <Input label="Store Bio" name="storeDescription" value={formData.storeDescription} onChange={handleChange} placeholder="Tell us about your brand..." />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Instagram Handle" name="instagramHandle" value={formData.instagramHandle} onChange={handleChange} placeholder="@username" />
                                        <Input label="Facebook URL" name="facebookHandle" value={formData.facebookHandle} onChange={handleChange} placeholder="facebook.com/page" />
                                    </div>

                                    <div className="pt-6">
                                        <Button onClick={handleSubmit} loading={isLoading} variant="primary">
                                            Submit Application <Check size={18} />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// UI Components
const Input = ({ label, icon, ...props }: any) => (
    <div className="w-full">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input
                {...props}
                className={`w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

const Button = ({ children, variant = 'primary', loading, ...props }: any) => (
    <button
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variant === 'primary'
            ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10'
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
        {...props}
    >
        {loading ? <Loader2 className="animate-spin" /> : children}
    </button>
);
