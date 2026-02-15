'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Relation {
    id: number;
    label: string;
    emoji: string;
    color: string;
}

export default function RelationGrid() {
    const [relations, setRelations] = useState<Relation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelations = async () => {
            const { data } = await supabase
                .from('relations')
                .select('id, label, emoji, color')
                .eq('is_active', true)
                .order('created_at')
                .limit(8); // Fetch top 8

            if (data) {
                setRelations(data);
            }
            setLoading(false);
        };

        fetchRelations();
    }, []);

    if (loading) return null;
    if (relations.length === 0) return null;

    return (
        <section className="py-12 px-4 max-w-7xl mx-auto bg-slate-50">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Shop by Relation</h2>
                    <p className="text-slate-500">Find the perfect gift for your loved ones</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relations.map((rel) => (
                    <Link
                        href={`/search?tag=${encodeURIComponent(rel.label)}`}
                        key={rel.id}
                        className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 hover:-translate-y-1"
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 ${rel.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                            {rel.emoji}
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg text-center group-hover:text-pink-600 transition-colors">
                            {rel.label}
                        </h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}
