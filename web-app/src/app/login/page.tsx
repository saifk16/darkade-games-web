'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Eye, EyeOff, Gift, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // MFA State
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // 🔐 1. Login with Password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // 🔐 2. Check for MFA (2FA) Requirement
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = factors?.totp?.some(factor => factor.status === 'verified');

    if (hasVerifiedTotp) {
      // Prepare for MFA Challenge
      // We need to show a simplified UI for code input, but for this iteration, I'll use a prompt or a quick overlay state.
      // Better UX: State variable 'needsMfa' -> renders input field instead of email/pass.
      setNeedsMfa(true); // Need to add this state
      setLoading(false);
      return;
    }

    await finalizeLogin(data.user.id);
  };

  const finalizeLogin = async (userId: string) => {
    // 👤 Role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    setLoading(false);

    // 🚀 Redirect
    if (profile?.role === 'seller') {
      router.push('/dashboard');
    } else if (profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.totp?.find(f => f.status === 'verified');

    if (!totpFactor) {
      setErrorMsg("No 2FA factor found. Please contact support.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: totpFactor.id,
      code: mfaCode,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // Success!
    await finalizeLogin(data.user.id);
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
            Discover Unique <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Personalised Gifts</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Join our community to explore hand-crafted treasures, track your orders, and find the perfect gift for every occasion.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Curated Collections</h3>
                <p className="text-sm text-slate-400">Find gifts for birthdays, weddings, and more.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Support Small Business</h3>
                <p className="text-sm text-slate-400">Directly support independent creators and sellers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group w-fit font-medium">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-600 font-bold hover:underline">
                Create one here
              </Link>
            </p>
          </div>

          <form onSubmit={needsMfa ? handleMfaVerify : handleLogin} className="space-y-5">
            {needsMfa ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                <div className="bg-indigo-50 p-4 rounded-xl flex items-center gap-3 border border-indigo-100 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-900">2-Step Verification</p>
                    <p className="text-xs text-indigo-700">Enter the code from your app.</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Authenticator Code</label>
                  <input
                    type="text"
                    placeholder="123456"
                    required
                    autoFocus
                    className="w-full pl-4 pr-4 p-4 text-center text-2xl tracking-[0.5em] font-black bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    value={mfaCode}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={() => setNeedsMfa(false)}
                  className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 py-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
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
                  <div className="flex justify-end mt-1">
                    <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {errorMsg}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </>
            )}
          </form>


        </div>
      </div>
    </div>
  );
}