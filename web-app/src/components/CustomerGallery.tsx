'use client';
import { Heart, Instagram, ArrowRight } from 'lucide-react';

const socialPosts = [
    { img: 'https://images.unsplash.com/photo-1513205869406-8c4d9e9929f7?auto=format&fit=crop&w=400&q=80', user: '@happy_customer', likes: '2.4k' },
    { img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', user: '@gift_lover', likes: '1.8k' },
    { img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=400&q=80', user: '@neon_vibes', likes: '3.1k' },
    { img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80', user: '@decor_diaries', likes: '956' },
    { img: 'https://images.unsplash.com/photo-1550920040-cb64c58cf32d?auto=format&fit=crop&w=400&q=80', user: '@art_soul', likes: '1.2k' },
];

export default function CustomerGallery() {
    return (
        <section className="py-20 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 text-center mb-12">
                <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
                    <Instagram size={14} /> As seen on Instagram
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Family</span>
                </h2>
                <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg"> Tag us @PersonalisedWallah to get featured!</p>
            </div>

            {/* Marquee Effect (CSS needed for smooth scroll, using overflow-x for now) */}
            <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar px-4 pb-8 snap-x">
                {/* Loop twice for continuous feel mockup */}
                {[...socialPosts, ...socialPosts].map((post, i) => (
                    <div key={i} className="min-w-[280px] md:min-w-[320px] bg-white p-3 rounded-2xl shadow-lg border border-slate-100 snap-center group select-none">
                        <div className="aspect-[4/5] rounded-xl overflow-hidden relative mb-3">
                            <img src={post.img} alt="Customer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            <div className="absolute bottom-3 left-3 text-white text-xs font-bold drop-shadow-md">
                                {post.user}
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-1.5 text-slate-700">
                                <Heart size={16} className="text-red-500 fill-red-500" />
                                <span className="text-sm font-bold">{post.likes}</span>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Post</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <a href="https://instagram.com" target="_blank" className="inline-flex items-center gap-2 font-bold text-slate-900 border-b-2 border-slate-900 pb-0.5 hover:text-pink-600 hover:border-pink-600 transition-colors">
                    Follow us on Instagram <ArrowRight size={16} />
                </a>
            </div>
        </section>
    );
}
