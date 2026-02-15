'use client';
import { useRef } from 'react';
import ProductCard from './ProductCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HorizontalScrollProps {
    title: string;
    products: any[];
    link: string;
}

export default function HorizontalScroll({ title, products, link }: HorizontalScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (products.length === 0) return null;

    return (
        <section className="py-12 bg-white border-b border-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <div className="flex items-center gap-4">
                        <Link href={link} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest hidden md:block">
                            View All
                        </Link>
                        <div className="flex gap-2">
                            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                                <ArrowLeft size={18} />
                            </button>
                            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 snap-x scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product) => {
                        if (!product) return null;
                        return (
                            <div key={product.id || Math.random()} className="min-w-[280px] md:min-w-[320px] snap-start">
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    imageUrl={product.image_url}
                                    additionalImages={product.additional_images || []}
                                    sellerId={product.seller_id}
                                />
                            </div>
                        );
                    })}

                    {/* View All Card at the end */}
                    <div className="min-w-[200px] flex items-center justify-center snap-start">
                        <Link href={link} className="flex flex-col items-center gap-4 group">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <ArrowRight size={24} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">View All</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
