'use client';

import Link from 'next/link';
import {
    ArrowRight, CheckCircle, Wallet, Truck, LayoutDashboard, Percent,
    DollarSign, ShieldCheck, MapPin, Package, HelpCircle, X, Check,
    Star, Users, TrendingUp, Mail, Phone, Instagram, Facebook, Layout
} from 'lucide-react';
import { useState } from 'react';
import SellerFooter from '@/components/SellerFooter';

export default function SellerLandingPage() {
    // FAQ Data
    const faqs = [
        { q: "When will I receive my payment?", a: "Your payment is processed automatically within 7 days of successful delivery to the customer. We support UPI and Bank Transfers." },
        { q: "Who provides the packaging material?", a: "You don't need to worry! We can provide branded packaging materials at minimal cost, or you can use your own standard packaging initially." },
        { q: "Is GST registration mandatory?", a: "To start, an MSME/Udyam registration is sufficient! You can update your GST details later once your business scales." },
        { q: "Is there a listing fee?", a: "Absolutely not! Listing products on Personalised-Wallah is 100% FREE. You only pay a small commission fee when you make a sale." },
        { q: "How do I ship my orders?", a: "We have partnered with top courier services. Just pack the order, print the label from your dashboard, and our delivery partner will pick it up from your doorstep." },
    ];

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">

            {/* 1. Navbar: Minimal & Elegant */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <Link href="/seller" className="group flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">P</div>
                        <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                            Personalised Wallah
                        </span>
                    </Link>
                    <div className="flex items-center gap-3 md:gap-6">
                        <Link href="/seller/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
                            Login
                        </Link>
                        <Link href="/seller/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center gap-2">
                            Start Selling <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section: High Impact */}
            <header className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 text-center overflow-hidden bg-slate-900">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-pink-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700 fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-indigo-300 text-xs md:text-sm font-medium mb-8 border border-white/10 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Join 2,000+ Creators earning daily
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                        Turn Your Creativity <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">into a Business</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        The easiest way for artists, crafters, and makers to sell personalized gifts across India. <span className="text-white font-medium">Zero upfront cost.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/seller/register" className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                            Register Now - It's Free
                        </Link>
                        <div className="text-slate-400 text-sm font-medium">
                            <span className="block sm:hidden mt-2">No credit card required</span>
                            <span className="hidden sm:block ml-4">No credit card required</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. Value Proposition (Cards) */}
            <section className="py-24 px-4 max-w-7xl mx-auto relative z-20">
                <div className="grid md:grid-cols-3 gap-8 -mt-32">
                    {[
                        {
                            icon: Percent,
                            title: "0% Listing Fee",
                            desc: "Don't pay a penny until you sell. List unlimited products for free and only pay a small commission on successful orders.",
                            color: "text-indigo-600",
                            bg: "bg-indigo-50"
                        },
                        {
                            icon: DollarSign,
                            title: "Fast 7-Day Payouts",
                            desc: "Keep your cash flow healthy. Get automated transfers to your bank account every week for all delivered orders.",
                            color: "text-pink-600",
                            bg: "bg-pink-50"
                        },
                        {
                            icon: MapPin,
                            title: "Kanpur Hub Support",
                            desc: "Local advantage! Drop off shipments at our city hub or schedule a doorstep pickup. Real humans, real support.",
                            color: "text-emerald-600",
                            bg: "bg-emerald-50"
                        }
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className={`w-16 h-16 ${card.bg} rounded-2xl flex items-center justify-center ${card.color} mb-6 group-hover:scale-110 transition-transform`}>
                                <card.icon size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{card.title}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Comparison Table */}
            <section className="py-20 px-4 bg-slate-50 border-y border-slate-200">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm mb-2 block">Why Choose Us?</span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900">Better than the rest.</h2>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-3 bg-slate-900 text-white p-6 md:p-8 font-bold text-sm md:text-lg uppercase tracking-wider">
                            <div className="flex items-center">Feature</div>
                            <div className="text-center text-indigo-300 bg-white/10 rounded-lg py-2 mx-2 border border-white/10">Personalised-Wallah</div>
                            <div className="text-center text-slate-400 py-2">Other Marketplaces</div>
                        </div>

                        {[
                            { feature: "Listing Fees", us: "₹0 (Always Free)", others: "₹10 - ₹50 per item", good: true },
                            { feature: "Commission Rate", us: "Flat 5-10%", others: "15-25% + Hidden Fees", good: true },
                            { feature: "Payout Cycle", us: "Weekly (7 Days)", others: "15-30 Days", good: true },
                            { feature: "Seller Support", us: "1-on-1 (WhatsApp/Call)", others: "Automated Chatbots", good: true },
                            { feature: "Marketing", us: "Free Social Promotion", others: "Expensive Ads", good: true }
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-3 p-6 md:p-8 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors items-center text-sm md:text-base">
                                <div className="font-bold text-slate-700">{row.feature}</div>
                                <div className="text-center font-bold text-indigo-600 flex justify-center items-center gap-2 bg-indigo-50/50 py-3 rounded-xl mx-2">
                                    <CheckCircle size={18} className="fill-indigo-100" /> {row.us}
                                </div>
                                <div className="text-center text-slate-400 font-medium flex justify-center items-center gap-2">
                                    {row.others}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 italic">"Switching to Personalised-Wallah saved me 15% on every order!" - <span className="font-bold text-slate-700">Riya S., Kanpur</span></p>
                    </div>
                </div>
            </section>

            {/* 5. How It Works (Visual Steps) */}
            <section className="py-24 bg-white px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Start selling in minutes</h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">No complex paperwork. No hidden hurdles. Just a simple 3-step process to launch your store.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-200 via-pink-200 to-indigo-200 -z-10"></div>

                        {[
                            { step: 1, title: "Register Instantly", desc: "Sign up with your mobile number. Basic KYC (Aadhaar/PAN) and Udyam is all you need.", icon: Users, color: "bg-indigo-600" },
                            { step: 2, title: "List Your Products", desc: "Upload clear photos, add descriptions, and set your price. We verify listings in 24 hours.", icon: Package, color: "bg-pink-600" },
                            { step: 3, title: "Ship & Earn", desc: "Get orders, pack them, and let our courier partners handle the rest. Get paid weekly.", icon: TrendingUp, color: "bg-slate-900" }
                        ].map((item, i) => (
                            <div key={i} className="text-center group cursor-default">
                                <div className={`w-24 h-24 ${item.color} rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-200 rotate-3 group-hover:rotate-6 transition-transform duration-300`}>
                                    <item.icon size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="/seller/register" className="inline-flex items-center gap-2 text-indigo-600 font-bold border-b-2 border-indigo-600 hover:text-indigo-800 hover:border-indigo-800 transition-colors pb-1">
                            Sellers guide regarding GST & Shipping <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6. FAQ Section: Accordion */}
            <section className="py-24 px-4 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-center text-slate-900 mb-16">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'border-indigo-200 shadow-lg ring-2 ring-indigo-50' : 'border-slate-200 shadow-sm hover:border-indigo-200'}`}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 md:p-8 text-left font-bold text-lg text-slate-800"
                                >
                                    {faq.q}
                                    <span className={`transform transition-transform duration-300 ${openFaq === i ? 'rotate-45 text-indigo-600' : 'text-slate-400'}`}>
                                        <X size={24} />
                                    </span>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 md:p-8 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. CTA Section */}
            <section className="py-24 px-4 bg-slate-900 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[100px]"></div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to start your journey?</h2>
                    <p className="text-xl text-slate-300 mb-10">Join the community of creators making a living doing what they love.</p>
                    <Link href="/seller/register" className="inline-block bg-white text-slate-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-indigo-50 hover:scale-105 transition-all shadow-2xl">
                        Create Seller Account
                    </Link>
                </div>
            </section>

            {/* 8. Detailed Seller Footer */}
            <SellerFooter />

        </div>
    );
}
