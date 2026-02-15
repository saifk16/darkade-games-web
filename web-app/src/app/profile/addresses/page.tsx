'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Plus, CheckCircle, Trash2, Edit, Loader2, X, Home, Briefcase, Map } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address_line1: '',
        city: '',
        state: '',
        pincode: '',
        type: 'Home',
        is_default: false
    });

    const fetchAddresses = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false }) // Default first
            .order('created_at', { ascending: false });

        if (data) setAddresses(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, [router]);

    const handleOpenForm = (address: any = null) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                name: address.name,
                phone: address.phone,
                address_line1: address.address_line1,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                type: address.type,
                is_default: address.is_default
            });
        } else {
            setEditingAddress(null);
            setFormData({
                name: '', phone: '', address_line1: '',
                city: '', state: '', pincode: '',
                type: 'Home', is_default: false
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = { ...formData, user_id: user.id };

        let error;
        if (editingAddress) {
            const { error: updateError } = await supabase
                .from('addresses')
                .update(payload)
                .eq('id', editingAddress.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('addresses')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            alert('Failed to save address: ' + error.message);
        } else {
            setIsFormOpen(false);
            fetchAddresses();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        const { error } = await supabase.from('addresses').delete().eq('id', id);
        if (!error) fetchAddresses();
    };

    const handleSetDefault = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // The trigger in DB handles setting others to false, but we can do it optimistically or just update
        const { error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id);

        if (!error) fetchAddresses();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">Saved Addresses</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {!isFormOpen && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="w-full bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                        <Plus size={20} /> Add New Address
                    </button>
                )}

                {/* Form */}
                {isFormOpen && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">{editingAddress ? 'Edit Address' : 'New Address'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                                    <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+91 9876543210" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                                <textarea required value={formData.address_line1} onChange={e => setFormData({ ...formData, address_line1: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="House No, Street, Area" rows={2} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                                    <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pincode</label>
                                    <input required value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
                                <input required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Type</label>
                                <div className="flex gap-2">
                                    {['Home', 'Work', 'Other'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`flex-1 py-2 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${formData.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                        >
                                            {type === 'Home' && <Home size={16} />}
                                            {type === 'Work' && <Briefcase size={16} />}
                                            {type === 'Other' && <Map size={16} />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setFormData({ ...formData, is_default: !formData.is_default })}>
                                <div className={`w-5 h-5 rounded border border-slate-300 flex items-center justify-center ${formData.is_default ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white'}`}>
                                    {formData.is_default && <CheckCircle size={14} />}
                                </div>
                                <span className="text-sm font-bold text-slate-700">Make this my default address</span>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="submit" disabled={saving} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70 flex justify-center cursor-pointer">
                                    {saving ? <Loader2 className="animate-spin" /> : 'Save Address'}
                                </button>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${addr.is_default ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-slate-100'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wide ${addr.type === 'Home' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {addr.type}
                                </span>
                                {addr.is_default ? (
                                    <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                        <CheckCircle size={14} /> Default
                                    </span>
                                ) : (
                                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-bold text-indigo-600 hover:underline">Set as Default</button>
                                )}
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg">{addr.name}</h3>
                            <p className="text-slate-500 text-sm mt-1">{addr.address_line1}</p>
                            <p className="text-slate-500 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-slate-500 text-sm mt-2 font-medium">Phone: {addr.phone}</p>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50">
                                <button onClick={() => handleOpenForm(addr)} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Edit size={16} /> Edit
                                </button>
                                <button onClick={() => handleDelete(addr.id)} className="flex-1 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Trash2 size={16} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && !isFormOpen && (
                        <div className="text-center py-12 text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin size={32} className="opacity-50" />
                            </div>
                            <p>No saved addresses found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
