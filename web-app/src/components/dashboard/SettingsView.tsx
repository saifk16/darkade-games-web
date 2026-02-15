'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Store, Building2, Landmark, Save, Loader2, Upload, CheckCircle } from 'lucide-react';

export default function SettingsView({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    // Combined State
    const [formData, setFormData] = useState({
        // Profile
        store_name: '',
        bio: '',
        mobile: '',
        state: '',
        avatar_url: '',

        // Business
        business_legal_name: '',
        gstin: '',
        pan_card_number: '',
        registered_address: '',
        pickup_address: '',

        // Bank
        bank_account_holder_name: '',
        bank_account_number: '',
        ifsc_code: ''
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        fetchSellerData();
    }, [userId]);

    const fetchSellerData = async () => {
        setLoading(true);
        try {
            // Fetch Seller Info
            const { data: info } = await supabase
                .from('seller_info')
                .select('*')
                .eq('id', userId)
                .single();

            // Fetch Business Details
            const { data: business } = await supabase
                .from('seller_business_details')
                .select('*')
                .eq('id', userId)
                .single();

            setFormData(prev => ({
                ...prev,
                ...info,
                ...business,
                // Ensure defaults
                store_name: info?.store_name || '',
                bio: info?.bio || '',
                mobile: info?.mobile || '',
                state: info?.state || '',
                avatar_url: info?.avatar_url || '',
                business_legal_name: business?.business_legal_name || '',
                gstin: business?.gstin || '',
                pan_card_number: business?.pan_card_number || '',
                registered_address: business?.registered_address || '',
                pickup_address: business?.pickup_address || '',
                bank_account_holder_name: business?.bank_account_holder_name || '',
                bank_account_number: business?.bank_account_number || '',
                ifsc_code: business?.ifsc_code || ''
            }));

        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let newAvatarUrl = formData.avatar_url;

            // 1. Upload Logo if changed
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `logo-${Date.now()}.${fileExt}`;
                const filePath = `${userId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('shop-assets')
                    .upload(filePath, logoFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('shop-assets').getPublicUrl(filePath);
                newAvatarUrl = data.publicUrl;
            }

            // 2. Update seller_info
            const { error: infoError } = await supabase
                .from('seller_info')
                .update({
                    store_name: formData.store_name,
                    bio: formData.bio,
                    mobile: formData.mobile,
                    state: formData.state,
                    avatar_url: newAvatarUrl
                })
                .eq('id', userId);

            if (infoError) throw infoError;

            // 3. Update seller_business_details
            const { error: businessError } = await supabase
                .from('seller_business_details')
                .update({
                    business_legal_name: formData.business_legal_name,
                    gstin: formData.gstin,
                    pan_card_number: formData.pan_card_number,
                    registered_address: formData.registered_address,
                    pickup_address: formData.pickup_address,
                    bank_account_holder_name: formData.bank_account_holder_name,
                    bank_account_number: formData.bank_account_number,
                    ifsc_code: formData.ifsc_code
                })
                .eq('id', userId);

            if (businessError) throw businessError;

            alert('Settings saved successfully!');
            // Update local state if needed (e.g. avatar)
            setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
            setLogoFile(null);

        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert('Failed to save: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    const tabs = [
        { id: 'profile', label: 'Store Profile', icon: Store },
        { id: 'business', label: 'Business Info', icon: Building2 },
        { id: 'bank', label: 'Bank Details', icon: Landmark },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Account Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSection === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">

                    {/* PROFILE SETTINGS */}
                    {activeSection === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Store className="text-indigo-600" /> Store Profile
                            </h2>

                            {/* Logo Upload */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border-4 border-white shadow-lg">
                                    {(logoFile || formData.avatar_url) ? (
                                        <img
                                            src={logoFile ? URL.createObjectURL(logoFile) : formData.avatar_url}
                                            alt="Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Store size={32} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm cursor-pointer hover:bg-indigo-100 transition-colors">
                                        <Upload size={16} /> Upload New Logo
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </label>
                                    <p className="text-xs text-slate-400 mt-2">Recommended: 500x500px</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <Input label="Store Display Name" name="store_name" value={formData.store_name} onChange={handleChange} />
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Store Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 resize-none"
                                        placeholder="Tell customers about your brand..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Contact Mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                                    <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BUSINESS SETTINGS */}
                    {activeSection === 'business' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Building2 className="text-indigo-600" /> Business Details
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <Input label="Legal Business Name" name="business_legal_name" value={formData.business_legal_name} onChange={handleChange} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} />
                                    <Input label="PAN Number" name="pan_card_number" value={formData.pan_card_number} onChange={handleChange} />
                                </div>
                                <Input label="Registered Address" name="registered_address" value={formData.registered_address} onChange={handleChange} />
                                <Input label="Pickup Address" name="pickup_address" value={formData.pickup_address} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* BANK SETTINGS */}
                    {activeSection === 'bank' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Landmark className="text-indigo-600" /> Bank Details
                            </h2>
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm mb-6 border border-yellow-100 flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                Changing bank details may require re-verification and could delay your next payout by up to 7 days.
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <Input label="Account Holder Name" name="bank_account_holder_name" value={formData.bank_account_holder_name} onChange={handleChange} />
                                <Input label="Account Number" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} />
                                <Input label="IFSC Code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
        />
    </div>
);

const AlertCircle = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
