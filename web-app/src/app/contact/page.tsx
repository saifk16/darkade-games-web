'use client';

import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send, ChevronDown, ChevronUp, Facebook, Instagram, Twitter } from 'lucide-react';

export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate sending
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSent(false), 5000);
        }, 1500);
    };

    const faqs = [
        {
            question: "How long does customization take?",
            answer: "Most customized orders are processed within 2-3 business days. Shipping creates an additional 3-5 days depending on your location."
        },
        {
            question: "Can I return a personalized item?",
            answer: "Because these items are made specifically for you, we cannot accept returns unless the item is defective or damaged upon arrival."
        },
        {
            question: "Do you ship internationally?",
            answer: "Currently, we ship to all major cities across India. International shipping is coming soon!"
        },
        {
            question: "How can I track my order?",
            answer: "Once shipped, you will receive a tracking link via SMS and Email. You can also track it from your 'Orders' page."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-100/20 rounded-full blur-3xl -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">We are here for you</span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Conversation</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Have a question about your order or want to discuss a bulk purchase? Our team is ready to help you create something special.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">

                    {/* Contact Info Section */}
                    <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
                        {/* Info Cards */}
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Details</h3>
                            <div className="space-y-6">
                                <a href="mailto:support@personalised-wallah.in" className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <Mail size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase mb-0.5">Email Us</p>
                                        <p className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors">support@personalised-wallah.in</p>
                                    </div>
                                </a>

                                <a href="tel:+919876543210" className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <Phone size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase mb-0.5">Call Us</p>
                                        <p className="text-slate-900 font-bold group-hover:text-pink-600 transition-colors">+91 98765 43210</p>
                                        <p className="text-xs text-slate-500">Mon-Sat, 10 AM - 7 PM</p>
                                    </div>
                                </a>

                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <MapPin size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase mb-0.5">Visit HQ</p>
                                        <p className="text-slate-900 font-bold">123/45, Civil Lines, Kanpur</p>
                                        <p className="text-sm text-slate-500">Uttar Pradesh - 208001</p>
                                    </div>
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <p className="text-sm font-bold text-slate-400 uppercase mb-4">Follow Us</p>
                                <div className="flex gap-4">
                                    {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                        <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all duration-300">
                                            <Icon size={18} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Banner */}
                        <a href="https://wa.me/919876543210" target="_blank" className="block relative group overflow-hidden rounded-3xl shadow-xl shadow-emerald-500/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 transition-transform duration-500 group-hover:scale-105" />
                            <div className="relative p-8 flex items-center justify-between">
                                <div className="text-white">
                                    <p className="font-bold text-lg mb-1">Chat on WhatsApp</p>
                                    <p className="text-emerald-100 text-sm opacity-90">Get instant replies for urgent queries</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-emerald-600 transition-all duration-300">
                                    <MessageCircle size={24} />
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Contact Form Section */}
                    <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-6 duration-700 delay-200">
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-indigo-100 border border-slate-100 h-full relative overflow-hidden">
                            {sent ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 animate-in fade-in duration-300">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                        <Send size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Message Sent!</h3>
                                    <p className="text-slate-500 text-center max-w-xs">We've received your message and will get back to you within 24 hours.</p>
                                    <button onClick={() => setSent(false)} className="mt-8 text-indigo-600 font-bold hover:underline">Send another message</button>
                                </div>
                            ) : null}

                            <h3 className="text-2xl font-black text-slate-900 mb-6">Send us a Message</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        placeholder="Order Inquiry / Customization"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                                        placeholder="Tell us more about what you need..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {sending ? 'Sending...' : (
                                        <>Send Message <Send size={18} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <h3 className="text-2xl font-black text-center text-slate-900 mb-8">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openFaq === i ? 'border-indigo-200 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-slate-300'}`}
                            >
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className={`font-bold text-lg transition-colors ${openFaq === i ? 'text-indigo-600' : 'text-slate-800'}`}>{faq.question}</span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>
                                <div
                                    className={`px-6 text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
