'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Eye, EyeOff, Store, TrendingUp, ShieldCheck } from 'lucide-react';
import { Suspense } from 'react';

function SellerLoginContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Check if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace('/dashboard');
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
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });
            if (error) throw error;
            if (error) throw error;

            // Check onboarding status
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: sellerInfo } = await supabase
                    .from('seller_info')
                    .select('onboarding_step')
                    .eq('id', user.id)
                    .single();

                if (sellerInfo && sellerInfo.onboarding_step < 5) {
                    router.push('/seller/register'); // Resume registration
                } else {
                    router.push('/dashboard');
                }
            } else {
                router.push('/dashboard'); // Fallback
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Column: Branding & Value Prop */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-90"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
                        <Store size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-6 leading-tight">
                        Welcome Back to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Personalised Wallah</span>
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        Manage your store, track orders, and grow your business with our powerful seller dashboard.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Real-time Analytics</h3>
                                <p className="text-sm text-slate-400">Track your sales and performance instantly.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Secure Payments</h3>
                                <p className="text-sm text-slate-400">Guaranteed payouts and secure transactions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="max-w-md w-full">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </button>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Seller Login</h2>
                        <p className="text-slate-500">
                            Don't have an account?{' '}
                            <Link href="/seller/register" className="text-indigo-600 font-bold hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-1">
                                <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Sign In to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-200 text-center">
                        <p className="text-xs text-slate-400">
                            By logging in, you agree to our <Link href="/terms" className="underline hover:text-slate-600">Terms</Link> and <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SellerLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}>
            <SellerLoginContent />
        </Suspense>
    );
}
