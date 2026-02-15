'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle, Clock, Download, Printer } from 'lucide-react';
import SellerFooter from '@/components/SellerFooter';

export default function VendorPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/seller" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Vendor Agreement</h1>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                        <Printer size={16} /> Print
                    </button>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 relative overflow-hidden">
                    {/* Watermark */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <FileText size={400} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-10 border-b border-slate-100 pb-10">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">The Main Contract</h2>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Active</span>
                                        <span>•</span>
                                        <span>Last Updated: February 2026</span>
                                    </div>
                                </div>
                            </div>
                            <button className="hidden md:flex items-center justify-center w-12 h-12 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors" title="Download PDF">
                                <Download size={20} />
                            </button>
                        </div>

                        <div className="prose prose-lg prose-slate hover:prose-a:text-indigo-600 prose-headings:font-black prose-headings:tracking-tight max-w-none">
                            <p className="lead text-xl text-slate-600 font-medium">
                                This Vendor Agreement ("Agreement") serves as a binding contract between <span className="text-indigo-600 font-bold">Personalised-Wallah</span> ("Platform") and the Seller ("Vendor") regarding the scale of goods on our marketplace.
                            </p>

                            <div className="space-y-12 mt-12">
                                {/* 1. Quality Guarantee */}
                                <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                                    <div className="flex gap-5">
                                        <div className="shrink-0 mt-1 p-3 bg-white rounded-xl shadow-sm text-emerald-500">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 mt-0">1. Quality Guarantee</h3>
                                            <p className="text-slate-600">
                                                The Seller guarantees that the product delivered to the customer will be <strong>exactly as shown in the product images</strong> and description.
                                            </p>
                                            <ul className="marker:text-emerald-500 text-slate-600 mt-4 space-y-2">
                                                <li>Materials used must match the description.</li>
                                                <li>Personalization (names, photos) must be accurate as per user input.</li>
                                                <li>Defective or poor-quality items will be refunded from the Seller's payout.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Commission */}
                                <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-50 transition-colors">
                                    <div className="flex gap-5">
                                        <div className="shrink-0 mt-1 p-3 bg-white rounded-xl shadow-sm text-indigo-600 font-black text-lg w-12 h-12 flex items-center justify-center">
                                            %
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 mt-0">2. Commission & Fees</h3>
                                            <p className="text-slate-600">
                                                Personalised-Wallah charges a flat commission on every successful sale.
                                            </p>
                                            <div className="bg-white p-5 rounded-xl mt-4 border border-indigo-100 shadow-sm">
                                                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-base">
                                                    <div className="text-slate-500">Standard Commission</div>
                                                    <div className="font-bold text-slate-900 text-right">10% per sale</div>
                                                    <div className="border-t border-slate-100 col-span-2"></div>
                                                    <div className="text-slate-500">Payment Gateway Fee</div>
                                                    <div className="font-bold text-slate-900 text-right">2% (Standard)</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Lead Time */}
                                <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100 hover:bg-orange-50 transition-colors">
                                    <div className="flex gap-5">
                                        <div className="shrink-0 mt-1 p-3 bg-white rounded-xl shadow-sm text-orange-500">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 mt-0">3. Lead Time & Shipping</h3>
                                            <p className="text-slate-600">
                                                Since our marketplace focuses on personalized gifts, we understand that production takes time. However, strict adherence to timelines is mandatory.
                                            </p>
                                            <ul className="marker:text-orange-500 text-slate-600 mt-4 space-y-2">
                                                <li><strong>Dispatch Time:</strong> Product must be marked 'Ready to Ship' within <strong>48-72 hours</strong> of receiving the order.</li>
                                                <li>Delays beyond this may result in order cancellation by the customer.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Penalties */}
                                <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors">
                                    <div className="flex gap-5">
                                        <div className="shrink-0 mt-1 p-3 bg-white rounded-xl shadow-sm text-red-500">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 mt-0">4. Penalties & Cancellations</h3>
                                            <p className="text-slate-600">
                                                To maintain a high-quality experience for buyers, the following penalties apply:
                                            </p>
                                            <div className="mt-4 space-y-3">
                                                <div className="bg-white p-4 rounded-xl border border-red-100 text-red-700 shadow-sm flex gap-3">
                                                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                                    <span><strong>Wrong Product Sent:</strong> 100% Refund to customer + Reverse Shipping cost borne by Seller.</span>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-red-100 text-red-700 shadow-sm flex gap-3">
                                                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                                    <span><strong>Seller Cancellation:</strong> A penalty of ₹50 per order will be deducted if seller cancels a confirmed order without valid reason.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-slate-400 text-sm font-medium mb-2">Digital Signature Verified</p>
                    <p className="text-slate-500 text-sm">
                        By registering as a seller, you automatically agree to these terms.
                    </p>
                </div>
            </main>
            <SellerFooter />
        </div>
    );
}
