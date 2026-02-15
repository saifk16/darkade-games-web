'use client';

import Link from 'next/link';
import { ArrowLeft, Lock, Copyright, Ban, Gavel, CheckCircle2 } from 'lucide-react';
import SellerFooter from '@/components/SellerFooter';

export default function SellerTerms() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/seller" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Seller Terms Included</h1>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Rules of Engagement</h2>
                    <p className="text-lg text-slate-500">To build a safe and trusted marketplace for everyone, we have established these core principles.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* 1. Account Security */}
                    <div className="bg-slate-50 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100 group">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                            <Lock size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Account Security</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            The Seller is responsible for maintaining the confidentiality of their login credentials (Email & Password).
                        </p>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 flex gap-3 items-start">
                            <CheckCircle2 className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                            <span>Do not share your account access with anyone outside your trusted business team.</span>
                        </div>
                    </div>

                    {/* 2. Content Rights */}
                    <div className="bg-slate-50 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100 group">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                            <Copyright size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Content Ownership</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            You represent and warrant that you own or have the necessary licenses for all content (photos, descriptions) you upload.
                        </p>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-medium text-red-700 flex gap-3 items-start">
                            <Ban className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <span>STRICTLY PROHIBITED: Copying images from Pinterest, Google, or Competitors.</span>
                        </div>
                    </div>

                    {/* 3. Prohibited Items */}
                    <div className="bg-slate-50 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100 group">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                            <Ban size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Prohibited Items</h3>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Sellers must NOT list:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex gap-3 items-center text-slate-600 font-medium bg-white px-4 py-2 rounded-lg border border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Illegal or hazardous items
                            </li>
                            <li className="flex gap-3 items-center text-slate-600 font-medium bg-white px-4 py-2 rounded-lg border border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Copyright infringing goods (Fake Disney/Marvel)
                            </li>
                            <li className="flex gap-3 items-center text-slate-600 font-medium bg-white px-4 py-2 rounded-lg border border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Offensive/Hateful content
                            </li>
                        </ul>
                    </div>

                    {/* 4. Platform Rights */}
                    <div className="bg-slate-50 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100 group">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                            <Gavel size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Platform Rights</h3>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            'Personalised-Wallah' reserves the right to:
                        </p>

                        <ul className="space-y-3">
                            <li className="flex gap-3 items-center text-slate-600 font-medium bg-white px-4 py-2 rounded-lg border border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Modify/Delete violating listings
                            </li>
                            <li className="flex gap-3 items-center text-slate-600 font-medium bg-white px-4 py-2 rounded-lg border border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Withhold payments for fraud
                            </li>
                            <li className="flex gap-3 items-center text-slate-600 font-medium bg-white px-4 py-2 rounded-lg border border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Suspend accounts instantly
                            </li>
                        </ul>
                    </div>

                </div>
            </main>
            <SellerFooter />
        </div>
    );
}
