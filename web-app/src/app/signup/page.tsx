'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, Eye, EyeOff, Star, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        // 📝 Signup Logic
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'user', // Explicitly set as user
                },
            },
        });

        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
            return;
        }

        if (data?.session) {
            // Immediate login (if email confirmation is disabled)
            router.push('/');
        } else {
            // Email confirmation required
            alert("Account Created! Please check your email to verify your account.");
            router.push('/login');
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
                        <span className="font-black text-3xl">P.</span>
                    </div>
                    <h1 className="text-5xl font-black mb-6 leading-tight">
                        Join the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Family</span>
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        Create an account to unlock exclusive benefits, track your orders, and save your favorite items.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                                <Star size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Exclusive Offers</h3>
                                <p className="text-sm text-slate-400">Get access to member-only deals and discounts.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Secure & Fast</h3>
                                <p className="text-sm text-slate-400">Enjoy a seamless and secure shopping experience.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="max-w-md w-full">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group w-fit font-medium">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    className="w-full pl-11 pr-4 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                                    onChange={(e) => setFullName(e.target.value)}
                                    value={fullName}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-11 pr-4 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {errorMsg}
                            </div>
                        )}

                        {/* Signup Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
}
