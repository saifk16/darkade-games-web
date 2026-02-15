'use client';
import { Play, ArrowRight } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative h-[60vh] w-full overflow-hidden bg-black">
            {/* Video Background */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-50"
                >
                    {/* Using a high-quality placeholder video - replace with actual brand video */}
                    <source src="https://cdn.coverr.co/videos/support_your_local_business_--_coverr/1080p.mp4" type="video/mp4" />
                </video>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto mt-8 md:mt-0">
                <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Handcrafted with Love ❤️
                </span>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-xl">
                    Gifts that tell a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Story</span>
                </h1>

                <p className="text-base md:text-lg text-slate-200 mb-8 max-w-xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 text-shadow-sm">
                    Discover unique, personalized treasures from India's best independent creators. From custom neon signs to hand-painted decor.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <button
                        onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-base hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        Start Personalising
                        <ArrowRight size={18} />
                    </button>

                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold text-base hover:bg-white/20 transition-all shadow-lg flex items-center justify-center gap-2">
                        <Play size={18} fill="white" />
                        Watch Our Story
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
                <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
                    <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse"></div>
                </div>
            </div>
        </section>
    );
}
