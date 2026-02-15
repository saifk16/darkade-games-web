'use client';
import { Verified, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedSeller() {
    // Hardcoded for now, ideally fetch random active seller from DB
    const seller = {
        name: "Artistic Aura",
        handle: "@artistic_aura",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
        bio: "Creating magical resin art and custom neon signs since 2020. Every piece tells a story.",
        rating: 4.9,
        reviews: 128,
        products: [
            "https://images.unsplash.com/photo-1550920040-cb64c58cf32d?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1513205869406-8c4d9e9929f7?auto=format&fit=crop&w=400&q=80"
        ]
    };

    return (
        <section className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-16 md:py-24 relative overflow-hidden my-12">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Seller Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-white/20">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            Seller of the Week
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Creator</span>
                        </h2>

                        <div className="flex items-center gap-4 justify-center md:justify-start mb-6">
                            <div className="relative">
                                <img src={seller.image} alt={seller.name} className="w-20 h-20 rounded-full border-4 border-white/20" />
                                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-indigo-900">
                                    <Verified size={12} />
                                </div>
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-bold">{seller.name}</h3>
                                <p className="text-slate-300 text-sm">{seller.handle}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-bold">{seller.rating}</span>
                                    <span className="text-xs text-slate-400">({seller.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-lg text-slate-200 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed italic">
                            "{seller.bio}"
                        </p>

                        <Link href="/collections" className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2 mx-auto md:mx-0 w-fit">
                            Visit Shop <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Product Showcase */}
                    <div className="flex-1 w-full relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-8">
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500 hover:z-10 bg-slate-800">
                                    <img src={seller.products[0]} className="w-full h-full object-cover" alt="Work 1" />
                                </div>
                                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-[2deg] hover:rotate-0 transition-transform duration-500 hover:z-10 bg-slate-800">
                                    <img src={seller.products[2]} className="w-full h-full object-cover" alt="Work 3" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-[3deg] hover:rotate-0 transition-transform duration-500 hover:z-10 bg-slate-800">
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/50 text-4xl font-black">
                                        +12
                                    </div>
                                </div>
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl rotate-[-3deg] hover:rotate-0 transition-transform duration-500 hover:z-10 bg-slate-800">
                                    <img src={seller.products[1]} className="w-full h-full object-cover" alt="Work 2" />
                                </div>
                            </div>
                        </div>
                        {/* Floating Elements */}
                        <div className="absolute -top-6 -right-6 animate-bounce delay-700">
                            <div className="bg-white text-indigo-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg rotate-12">
                                Best Seller!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
