'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Occasion {
    id: number;
    label: string;
    emoji: string;
    color: string;
}

export default function OccasionGrid() {
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOccasions = async () => {
            const { data } = await supabase
                .from('occasions')
                .select('id, label, emoji, color')
                .eq('is_active', true)
                .order('created_at')
                .limit(8); // Fetch top 8

            if (data) {
                setOccasions(data);
            }
            setLoading(false);
        };

        fetchOccasions();
    }, []);

    if (loading) return null;
    if (occasions.length === 0) return null;

    return (
        <section className="py-12 px-4 max-w-7xl mx-auto bg-slate-50">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Shop by Occasion</h2>
                    <p className="text-slate-500">Find the perfect gift for every special moment</p>
                </div>
                {/* Optional: Link to a full list of occasions if you have one, or just search */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {occasions.map((occ) => (
                    <Link
                        href={`/search?tag=${encodeURIComponent(occ.label)}`}
                        key={occ.id}
                        className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 hover:-translate-y-1"
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 ${occ.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                            {occ.emoji}
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg text-center group-hover:text-indigo-600 transition-colors">
                            {occ.label}
                        </h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}
