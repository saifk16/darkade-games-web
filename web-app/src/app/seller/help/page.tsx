'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Package, DollarSign, PenTool, LayoutDashboard, Truck, Mail, MessageCircle } from 'lucide-react';
import SellerFooter from '@/components/SellerFooter';

export default function SellerHelpDesk() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            category: "Onboarding",
            icon: LayoutDashboard,
            items: [
                { q: "How long does it take for the account to be approved?", a: "After uploading documents, our team will verify your details. This process usually takes 24-48 hours. You will receive an SMS/Email upon approval." }
            ]
        },
        {
            category: "Listing & Products",
            icon: Package,
            items: [
                { q: "How many products can I add at once?", a: "Unlimited! You can list as many products as you want. There is no limit and listing is completely free." },
                { q: "Can I change my product photos later?", a: "Absolutely. You can edit product images, description, and price from your Seller Dashboard at any time." }
            ]
        },
        {
            category: "Customization & Orders",
            icon: PenTool,
            items: [
                { q: "Where will the user's photo appear?", a: "When a customer places a personalized order, you will receive a notification. You can download the assets (photo/text) directly from the 'Orders' section in your Seller Dashboard." }
            ]
        },
        {
            category: "Payments & Earnings",
            icon: DollarSign,
            items: [
                { q: "When will I receive my money?", a: "Your payment will be automatically transferred to your registered bank account 7 days after the order is successfully delivered." }
            ]
        },
        {
            category: "Shipping",
            icon: Truck,
            items: [
                { q: "Do I have to go to the courier myself?", a: "No, absolutely not! Our courier partner (Shiprocket) will come to your pickup address (home/shop) to collect the packet." }
            ]
        }
    ];

    const filteredFaqs = faqs.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.items.length > 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navbar */}
            <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/seller" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Seller Help Desk</h1>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-16 relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">How can we help you?</h2>
                    <p className="text-slate-500 text-lg md:text-xl font-medium mb-10">Find answers regarding payments, shipping, and listing.</p>

                    <div className="relative max-w-xl mx-auto group">
                        <input
                            type="text"
                            placeholder="Search for answers (e.g., payment, shipping)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-slate-100 shadow-xl shadow-indigo-100/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-lg font-medium bg-white"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
                    </div>
                </div>

                <div className="space-y-8">
                    {filteredFaqs.map((section, sIndex) => (
                        <div key={sIndex} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <section.icon size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">{section.category}</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {section.items.map((item, i) => {
                                    const index = sIndex * 100 + i;
                                    const isOpen = openIndex === index;
                                    return (
                                        <div key={i} className="group">
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                                className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-slate-50 transition-colors gap-4"
                                            >
                                                <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-700 group-hover:text-slate-900'}`}>{item.q}</span>
                                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                    <ChevronDown size={20} />
                                                </div>
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <div className="px-8 pb-8 text-slate-600 leading-relaxed text-base md:text-lg">
                                                    {item.a}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>

                <div className="mt-20 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <h3 className="text-3xl font-black mb-4 relative z-10">Still need help?</h3>
                    <p className="text-indigo-100 mb-10 text-lg max-w-lg mx-auto relative z-10">Our seller support team is available Mon-Sat, 10 AM - 7 PM to assist you.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                        <a href="mailto:sellers@personalisedwallah.com" className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                            <Mail size={20} /> Email Support
                        </a>
                        <a href="#" className="bg-indigo-500/30 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
                            <MessageCircle size={20} /> Chat on WhatsApp
                        </a>
                    </div>
                </div>

            </main>
            <SellerFooter />
        </div>
    );
}
