'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Plus, Trash2, ShieldCheck, Landmark, Smartphone, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
    const [methods, setMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCardForm, setShowCardForm] = useState(false);
    const [showUpiForm, setShowUpiForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Card Form State
    const [cardData, setCardData] = useState({
        card_holder_name: '',
        card_number: '',
        expiry_date: '',
        cvv: ''
    });

    // UPI Form State
    const [upiData, setUpiData] = useState({
        vpa_id: ''
    });

    const fetchMethods = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setMethods(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleCardSubmit = async (e: any) => {
        e.preventDefault();
        setSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Simulate secure storage (Only storing last 4 digits)
        const last4 = cardData.card_number.slice(-4);
        let provider = 'Visa';
        if (cardData.card_number.startsWith('5')) provider = 'MasterCard';
        if (cardData.card_number.startsWith('6')) provider = 'Rupay';

        const { error } = await supabase
            .from('payment_methods')
            .insert({
                user_id: user.id,
                method_type: 'card',
                provider: provider,
                card_number_last4: last4,
                card_holder_name: cardData.card_holder_name,
                expiry_date: cardData.expiry_date
            });

        if (error) {
            console.error(error);
            alert('Failed to save card');
        } else {
            setShowCardForm(false);
            setCardData({ card_holder_name: '', card_number: '', expiry_date: '', cvv: '' });
            fetchMethods();
        }
        setSaving(false);
    };

    const handleUpiSubmit = async (e: any) => {
        e.preventDefault();
        setSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let provider = 'UPI';
        if (upiData.vpa_id.includes('@oksbi')) provider = 'Google Pay';
        if (upiData.vpa_id.includes('@ybl')) provider = 'PhonePe';
        if (upiData.vpa_id.includes('@paytm')) provider = 'Paytm';

        const { error } = await supabase
            .from('payment_methods')
            .insert({
                user_id: user.id,
                method_type: 'upi',
                provider: provider,
                vpa_id: upiData.vpa_id
            });

        if (error) {
            console.error(error);
            alert('Failed to save UPI ID');
        } else {
            setShowUpiForm(false);
            setUpiData({ vpa_id: '' });
            fetchMethods();
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this payment method?')) return;

        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchMethods();
        }
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
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">Payment Methods</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* Secure Banner */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <ShieldCheck className="text-green-600" size={24} />
                    <div>
                        <h4 className="font-bold text-green-800 text-sm">100% Secure Payments</h4>
                        <p className="text-green-600 text-xs">We do not store your full card details.</p>
                    </div>
                </div>

                {/* Add Buttons */}
                {!showCardForm && !showUpiForm && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowCardForm(true)}
                            className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-400 transition-colors cursor-pointer"
                        >
                            <CreditCard size={24} />
                            <span>Add New Card</span>
                        </button>
                        <button
                            onClick={() => setShowUpiForm(true)}
                            className="bg-white border-2 border-dashed border-pink-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-pink-600 font-bold hover:bg-pink-50 hover:border-pink-400 transition-colors cursor-pointer"
                        >
                            <Smartphone size={24} />
                            <span>Add UPI ID</span>
                        </button>
                    </div>
                )}

                {/* Add Card Form */}
                {showCardForm && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Add Credit / Debit Card</h2>
                            <button onClick={() => setShowCardForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCardSubmit} className="space-y-4">
                            <input
                                placeholder="Card Number"
                                required
                                maxLength={16}
                                value={cardData.card_number}
                                onChange={(e) => setCardData({ ...cardData, card_number: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="MM / YY"
                                    required
                                    value={cardData.expiry_date}
                                    onChange={(e) => setCardData({ ...cardData, expiry_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="password"
                                    placeholder="CVV"
                                    required
                                    maxLength={3}
                                    value={cardData.cvv}
                                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <input
                                placeholder="Card Holder Name"
                                required
                                value={cardData.card_holder_name}
                                onChange={(e) => setCardData({ ...cardData, card_holder_name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                            />

                            <div className="pt-4 flex gap-3">
                                <button type="submit" disabled={saving} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70 flex justify-center cursor-pointer">
                                    {saving ? <Loader2 className="animate-spin" /> : 'Save Card'}
                                </button>
                                <button type="button" onClick={() => setShowCardForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Add UPI Form */}
                {showUpiForm && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Add UPI ID</h2>
                            <button onClick={() => setShowUpiForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpiSubmit} className="space-y-4">
                            <input
                                placeholder="Enter UPI ID (e.g. user@oksbi)"
                                required
                                value={upiData.vpa_id}
                                onChange={(e) => setUpiData({ ...upiData, vpa_id: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-pink-500"
                            />

                            <div className="pt-4 flex gap-3">
                                <button type="submit" disabled={saving} className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors disabled:opacity-70 flex justify-center cursor-pointer">
                                    {saving ? <Loader2 className="animate-spin" /> : 'verify & Save'}
                                </button>
                                <button type="button" onClick={() => setShowUpiForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Saved Methods List */}
                <div className="space-y-4">
                    {methods.length > 0 && <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Your Saved Methods</h3>}

                    {methods.map((method) => (
                        <div key={method.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(method.id)} className="text-red-400 hover:text-red-600 cursor-pointer">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.method_type === 'card' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                                    {method.method_type === 'card' ? <CreditCard size={24} /> : <Smartphone size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">
                                        {method.method_type === 'card' ? '**** **** **** ' + method.card_number_last4 : method.vpa_id}
                                    </h4>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        {method.provider}
                                        {method.method_type === 'card' && <span className="w-1 h-1 rounded-full bg-slate-300"></span>}
                                        {method.method_type === 'card' && <span>Expires {method.expiry_date}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {methods.length === 0 && !showCardForm && !showUpiForm && (
                        <div className="text-center py-8 text-slate-400">
                            No saved payment methods. Add one to checkout faster!
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
