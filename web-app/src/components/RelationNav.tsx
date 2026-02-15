'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function RelationNav({ onSelect }: { onSelect: (category: string) => void }) {
    const [relations, setRelations] = useState<any[]>([]);

    useEffect(() => {
        const fetchRelations = async () => {
            const { data } = await supabase.from('relations').select('*').eq('is_active', true).order('created_at');
            if (data && data.length > 0) {
                setRelations(data);
            }
        };
        fetchRelations();
    }, []);

    // Fallback if no data
    if (relations.length === 0) return null;

    return (
        <div className="bg-white border-b border-slate-100 py-3 shadow-sm bg-white/90">
            <div className="max-w-7xl mx-auto px-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Shop by Relation</h3>

                <div className="flex gap-4 md:gap-8 overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth snap-x">
                    {relations.map((rel) => (
                        <button
                            key={rel.id}
                            onClick={() => onSelect(rel.label)}
                            className="flex flex-col items-center gap-2 min-w-[72px] snap-center group"
                        >
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-sm border-2 border-white ring-2 ring-transparent group-hover:ring-offset-2 transition-all duration-300 ${rel.color} group-hover:ring-pink-400 group-hover:scale-110 relative z-10`}>
                                {rel.emoji}
                            </div>
                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                {rel.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
