'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, Shield, Smartphone, Key } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        if (passwords.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswords({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">Account Security</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Password Change Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <Key size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                            <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* 2FA Section (Mock) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 opacity-60 pointer-events-none">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h2>
                            <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600">Status: Disabled</span>
                        <button className="text-indigo-600 text-sm font-bold">Enable (Coming Soon)</button>
                    </div>
                </div>

                {/* Login History (Mock) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Login Activity</h2>
                            <p className="text-sm text-slate-500">Recent devices that have accessed your account.</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">PC</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Windows PC</p>
                                    <p className="text-xs text-green-600 font-bold">Active Now</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Bhopal, India</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
