'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Loader2, Tags } from 'lucide-react';

export default function CollectionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('collections').select('*').order('name');

      if (!data || data.length === 0) {
        setCategories([]);
      } else {
        setCategories(data);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 1. Compact Luxury Hero - Smaller Headings */}
      <section className="bg-white border-b border-slate-100 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-0.5 w-6 bg-slate-900"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Boutique Collections</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                Our Gallery.
              </h1>
            </div>
            <p className="text-slate-500 text-xs font-medium max-w-sm leading-relaxed">
              Explore our precisely curated collections of handcrafted gifts and artisanal masterpieces.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Denser Collection Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                href={`/collections/${encodeURIComponent(cat.name)}`}
                key={cat.id}
                className="group flex flex-col transition-all duration-300"
              >
                {/* Compact Card with smaller radius */}
                <div className="aspect-[4/5] relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm group-hover:shadow-lg transition-all duration-500">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <Tags className="text-slate-200" size={32} />
                    </div>
                  )}
                  {/* Minimal Subtle Overlay */}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>

                  {/* Hidden Arrow appears on hover - Compact */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight size={16} />
                  </div>
                </div>

                {/* Compact Text Labels */}
                <div className="mt-3 px-1">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors truncate">
                    {cat.name}
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Catalog Select
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Refined Minimal Footer Callout - Smaller */}
      {!loading && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">Need a Custom Creation?</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Our artisans can bring your unique vision to life.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                Back to Home
              </Link>
              <button className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                Support
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
