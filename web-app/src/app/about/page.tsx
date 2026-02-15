'use client';

import { Heart, Star, Users, Award } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[400px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2897&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                        Crafting Emotions, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                            One Gift at a Time
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto">
                        We are Personalised Wallah. We believe that every gift should tell a story, capture a memory, and touch a heart.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-12 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Happy Customers", value: "50K+", icon: Users },
                        { label: "Products Customised", value: "100K+", icon: Star },
                        { label: "Design Awards", value: "12", icon: Award },
                        { label: "Years of Love", value: "5+", icon: Heart }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm mb-3">
                                <stat.icon size={24} />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Story */}
            <div className="py-24 max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Our Story</h2>
                        <div className="prose prose-lg text-slate-600">
                            <p className="mb-4">
                                It all started in a small workshop in Kanpur with a simple idea: <strong>Why give something generic when you can give something unique?</strong>
                            </p>
                            <p className="mb-4">
                                We understood that the true value of a gift lies not in its price tag, but in the thought behind it. A generic mug is just a mug, but a mug with a cherished family photo is a morning treasure.
                            </p>
                            <p>
                                Today, <strong>Personalised Wallah</strong> has grown into India's premier destination for customized gifting. We combine cutting-edge printing technology with artisanal craftsmanship to deliver products that are as durable as the memories they hold.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-3xl rotate-3 transform opacity-20"></div>
                        <div className="relative bg-slate-100 rounded-3xl overflow-hidden aspect-square">
                            {/* Placeholder image logic since we don't have files */}
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                <span className="font-bold">Team Photo Placeholder</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="py-24 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-5xl md:text-4xl font-black mb-16">Why We Do It</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700">
                            <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Emotional Connection</h3>
                            <p className="text-slate-400">We don't just sell products; we facilitate emotional connections between people through thoughtful gifting.</p>
                        </div>
                        <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700">
                            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Quality Obsession</h3>
                            <p className="text-slate-400">We are obsessed with quality. From the raw material to the final print, every step is checked for perfection.</p>
                        </div>
                        <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700">
                            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Customer First</h3>
                            <p className="text-slate-400">Your happiness is our success. We go to great lengths to ensure your order arrives on time and exactly as you imagined.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
