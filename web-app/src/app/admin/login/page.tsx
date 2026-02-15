'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Eye, EyeOff, ShieldAlert, Lock, Activity } from 'lucide-react';
import { Suspense } from 'react';

function AdminLoginContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Check if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Verify role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.role === 'admin') {
                    router.replace('/admin');
                }
            }
        };
        checkSession();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Sign In
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) throw error;

            // 2. Verify Admin Role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError || !profile) {
                throw new Error("Failed to fetch user profile.");
            }

            if (profile.role !== 'admin') {
                await supabase.auth.signOut(); // Security: Sign them out immediately
                throw new Error("Access Denied: You do not have administrator privileges.");
            }

            // 3. Success
            router.push('/admin');

        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Left Side: Branding (Dark/Serious for Admin) */}
                <div className="w-full md:w-1/2 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden text-white">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/10">
                            <ShieldAlert className="text-red-500" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
                        <p className="text-slate-400">Restricted access area.</p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <Activity size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">System Status</h3>
                                <p className="text-xs text-slate-500">Operational</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Lock size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Secure Connection</h3>
                                <p className="text-xs text-slate-500">256-bit Encryption</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-slate-600 mt-12">
                        &copy; {new Date().getFullYear()} Personalised Wallah. Internal Use Only.
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
                        <p className="text-slate-500 text-sm">Please enter your admin credentials.</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ShieldAlert className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                placeholder="admin@domain.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Access Dashboard'}
                            </button>
                        </div>
                    </form>

                </div>

            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-900" /></div>}>
            <AdminLoginContent />
        </Suspense>
    );
}
