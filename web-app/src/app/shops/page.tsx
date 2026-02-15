'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MapPin, ArrowRight, Verified, ShoppingBag, Search, Store, Star } from 'lucide-react';

// --- SKELETON COMPONENT FOR BETTER UX ---
const ShopSkeleton = () => (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
        <div className="h-32 bg-slate-200" />
        <div className="p-6 pt-0 relative">
            <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl bg-slate-300 border-4 border-white" />
            <div className="mt-12 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-50 rounded w-full mt-4" />
            </div>
        </div>
    </div>
);

export default function ShopsPage() {
    const [sellers, setSellers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 1. Fetch Seller Info (Base Data)
                const { data: sellersData, error: fetchError } = await supabase
                    .from('seller_info')
                    .select('*') // Select all fields needed
                    .eq('seller_status', 'approved')
                    .order('rating', { ascending: false })
                    .order('total_sales', { ascending: false });http://localhost:3000/shops

                if (fetchError) throw fetchError;
                if (!sellersData || sellersData.length === 0) {
                    setSellers([]);
                    return;
                }

                // 2. Removed Profiles Fetching
                // Since public users cannot access 'profiles' table due to RLS policies we cannot change,
                // we rely solely on 'seller_info' which has all necessary display data (store_name, city, etc.)

                setSellers(sellersData);
            } catch (err: any) {
                console.error("Fetch Error:", err);
                // setError("Sellers fetch nahi ho paye. Ek baar refresh karein.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellers();
    }, []);

    // --- CLIENT SIDE FILTERING ---
    const filteredSellers = useMemo(() => {
        return sellers.filter(seller => {
            const name = (seller.store_name || "").toLowerCase();
            const category = (seller.business_category || "").toLowerCase();
            const query = searchQuery.toLowerCase();
            return name.includes(query) || category.includes(query);
        });
    }, [searchQuery, sellers]);

    return (
        <main className="min-h-screen bg-[#fafafa]">
            {/* --- MINIMAL STICKY HEADER --- */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm">P</div>
                        <span className="font-bold text-lg tracking-tight text-slate-900">Partner Shops</span>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search for creators..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* --- SELLERS GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        [...Array(8)].map((_, i) => <ShopSkeleton key={i} />)
                    ) : (
                        filteredSellers.map((seller) => (
                            <Link
                                key={seller.id}
                                href={`/shops/${seller.id}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col"
                            >
                                {/* Minimal Banner Area */}
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    <img
                                        src={seller.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"}
                                        alt="Banner"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Glass Overlay for Avatar */}
                                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full border-2 border-white bg-white shadow-lg overflow-hidden shrink-0">
                                            <img
                                                src={seller.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${seller.store_name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm">
                                            <h3 className="font-bold text-slate-900 text-sm truncate max-w-[120px]">
                                                {seller.store_name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Rating Badge */}
                                    {seller.rating > 0 && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 shadow-sm">
                                            <Star size={10} className="fill-black text-black" />
                                            {Number(seller.rating).toFixed(1)}
                                        </div>
                                    )}
                                </div>

                                {/* Minimal Info Body */}
                                <div className="p-4 flex flex-col gap-3">
                                    {/* Bio / Description */}
                                    {seller.bio && (
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {seller.bio}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <MapPin size={12} /> {seller.city || "India"}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-black group-hover:text-white transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* --- EMPTY STATE --- */}
                {!isLoading && filteredSellers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                            <Search size={24} />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">No shops found</h3>
                        <p className="text-slate-500 text-sm">Try searching for something else.</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-6 text-sm font-bold text-indigo-600 hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}