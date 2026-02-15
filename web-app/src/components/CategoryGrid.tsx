'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Category {
    id: string | number;
    name: string;
    image_url: string | null;
}

export default function CategoryGrid() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            // Fetch from 'collections' table
            const { data } = await supabase
                .from('collections')
                .select('id, name, image_url')
                .limit(6); // Fetch top 6

            if (data) {
                // Map to Category interface if needed, but structure is same
                setCategories(data as unknown as Category[]);
            }
            setLoading(false);
        };

        fetchCategories();
    }, []);

    if (loading) return null;
    if (categories.length === 0) return null;

    return (
        <section className="py-12 px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Shop by Category</h2>
                    <p className="text-slate-500">Find the perfect gift for every need</p>
                </div>
                <Link href="/collections" className="text-indigo-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    View All <ArrowRight size={18} />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                    <Link
                        href={`/search?category=${encodeURIComponent(cat.name)}`}
                        key={cat.id}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 block"
                    >
                        {/* Image Background */}
                        {cat.image_url ? (
                            <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                <span className="text-4xl font-black opacity-20">{cat.name[0]}</span>
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Label */}
                        <div className="absolute bottom-0 left-0 w-full p-4">
                            <h3 className="text-white font-bold text-sm md:text-lg drop-shadow-md transform translate-y-0 group-hover:-translate-y-1 transition-transform">
                                {cat.name}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
