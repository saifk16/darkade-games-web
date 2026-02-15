'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, EyeOff, Database, Lock, Server } from 'lucide-react';
import SellerFooter from '@/components/SellerFooter';

export default function SellerPrivacy() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/seller" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600">Seller Privacy Policy</h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-16">
                <div className="text-center mb-16 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-3xl text-emerald-600 mb-6 shadow-sm border border-emerald-100">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Your Privacy Matters</h2>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        We understand that as a seller, you trust us with sensitive business and personal data. Here is exactly how we protect it.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* 1. KYC Data */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-start hover:border-emerald-100 transition-colors group">
                        <div className="shrink-0 w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                            <Database size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">1. KYC & Banking Data</h3>
                            <p className="text-slate-600 leading-relaxed text-lg mb-6">
                                We collect your <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">Aadhaar</strong>, <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">PAN</strong>, and <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">Bank Account</strong> details solely for identity verification and processing payouts.
                            </p>
                            <div className="flex items-center gap-3 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl inline-block">
                                <Lock size={16} /> 256-bit Encrypted Storage
                            </div>
                        </div>
                    </div>

                    {/* 2. Data Sharing */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-start hover:border-indigo-100 transition-colors group">
                        <div className="shrink-0 w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                            <Server size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Limited Data Sharing</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                We ONLY share your <strong className="text-slate-900">Pickup Address</strong> and <strong className="text-slate-900">Contact Number</strong> with our logistics partner (e.g., Shiprocket) strictly to enable order pickups. No other personal info is shared.
                            </p>
                        </div>
                    </div>

                    {/* 3. No Public Display */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-start hover:border-slate-300 transition-colors group">
                        <div className="shrink-0 w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-200 transition-colors">
                            <EyeOff size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">3. No Public Display policy</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Your personal mobile number and home address are <strong className="text-red-600">NOT visible to buyers</strong>. Buyers only see your Brand Name. All communication happens securely through our platform chat.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center border-t border-slate-200 pt-10">
                    <p className="text-slate-400 font-medium mb-4">Last Updated: February 9, 2026</p>
                    <p className="text-slate-500">
                        For any privacy concerns, contact <a href="mailto:privacy@personalisedwallah.com" className="font-bold text-emerald-600 hover:underline">privacy@personalisedwallah.com</a>
                    </p>
                </div>
            </main>
            <SellerFooter />
        </div>
    );
}
