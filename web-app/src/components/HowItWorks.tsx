'use client';
import { PenTool, ShoppingBag, Truck } from 'lucide-react';

const steps = [
    {
        icon: ShoppingBag,
        title: 'Pick a Product',
        desc: 'Browse our curated collection of neon signs, decor & gifts.',
        color: 'bg-pink-100 text-pink-600'
    },
    {
        icon: PenTool,
        title: 'Add Your Details',
        desc: 'Upload photos, add names, or choose colors to make it yours.',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        icon: Truck,
        title: 'Get it Delivered',
        desc: 'Handcrafted with love and shipped safely to your doorstep.',
        color: 'bg-indigo-100 text-indigo-600'
    }
];

export default function HowItWorks() {
    return (
        <section className="bg-white py-16 md:py-24 border-y border-slate-50">
            <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">
                    Simple Process
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12">How it Works</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 -z-10 border-t-2 border-dashed border-slate-200"></div>

                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center group cursor-default">
                            <div className={`w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center text-3xl mb-6 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                                <step.icon size={32} />
                                <div className="absolute -top-3 -right-3 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-white">
                                    {i + 1}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                            <p className="text-slate-500 max-w-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
