'use client';


import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Star, Verified, Instagram, MessageCircle, Share2, MapPin, Package, Users } from 'lucide-react';
import Link from 'next/link';

export default function ShopPage() {
    const { id: sellerId } = useParams();
    const [seller, setSeller] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchShopData = async () => {
            if (!sellerId) return;
            setIsLoading(true);

            // 1. Fetch Seller Info directly
            const { data: sellerInfo, error: sellerError } = await supabase
                .from('seller_info')
                .select('*')
                .eq('id', sellerId)
                .single();

            if (sellerInfo) {
                if (sellerInfo.seller_status === 'approved') {
                    // Wrap in expected structure or just use sellerInfo
                    // existing code expects 'seller' object which might have nested 'seller_info' array if from profile,
                    // OR we can just set 'seller' to this object and adjust usage below.
                    // Let's adjust usage below to be cleaner.
                    setSeller(sellerInfo);
                } else {
                    console.log("Shop is not approved:", sellerInfo.seller_status);
                }
            } else if (sellerError) {
                console.error("Error fetching seller:", sellerError);
            }

            // 2. Fetch Seller's Active Products
            const { data: productData } = await supabase
                .from('product_status_info')
                .select(`
                    status,
                    products (*)
                `)
                .eq('status', 'active')
                .eq('products.seller_id', sellerId);

            if (productData) {
                const prods = productData
                    .filter(item => item.products !== null)
                    .map(item => ({
                        ...item.products,
                        status: item.status
                    }));
                setProducts(prods);
            }

            setIsLoading(false);
        };

        fetchShopData();
    }, [sellerId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Shop not found</h1>
                <Link href="/" className="text-indigo-600 font-bold hover:underline">Back to Home</Link>
            </div>
        );
    }

    const info = seller || {};
    const stats = {
        products: products.length,
        sales: info.total_sales || '1.2k+',
        rating: info.rating || '4.9',
        followers: info.follower_count || '850'
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* 1. Header Section (YouTube/Insta Style) */}
            <div className="relative">
                {/* Banner */}
                <div className="h-48 md:h-72 w-full bg-slate-200 overflow-hidden relative">
                    <img
                        src={info.banner_url || "https://images.unsplash.com/photo-1614850523296-62c0af475430?auto=format&fit=crop&q=80&w=1200"}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                {/* Profile Info Overlay */}
                <div className="max-w-7xl mx-auto px-4 -mt-16 md:-mt-24 relative z-10 pb-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-white bg-white overflow-hidden shadow-2xl">
                                <img
                                    src={info.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${info.store_name || 'shop'}`}
                                    alt={info.store_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 bg-blue-500 text-white p-1.5 md:p-2 rounded-full border-4 border-white shadow-xl">
                                <Verified size={20} className="md:w-6 md:h-6" />
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 pb-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                    {info.store_name || "Shop Name"}
                                </h1>
                                <div className="flex gap-2">
                                    {info.instagram_handle && (
                                        <a href={`https://instagram.com/${info.instagram_handle}`} target="_blank" className="p-2 bg-white rounded-full text-pink-600 shadow-md hover:scale-110 transition-transform">
                                            <Instagram size={20} />
                                        </a>
                                    )}
                                    <button className="p-2 bg-white rounded-full text-slate-600 shadow-md hover:scale-110 transition-transform">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-500 text-lg md:text-xl font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                                <MapPin size={18} className="text-slate-400" />
                                {info.city || 'India'} • @{info.instagram_handle || 'seller'}
                            </p>

                            <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">
                                {info.bio || "Crafting moments into memories. Specialized in personalized home decor and unique gifts."}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pb-4">
                            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                + Follow
                            </button>
                            <button className="bg-white text-slate-900 p-3 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-colors border border-slate-100">
                                <MessageCircle size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="text-center md:border-r border-slate-100 last:border-0 p-4">
                            <div className="flex items-center justify-center gap-2 text-indigo-600 mb-1">
                                <Package size={20} />
                                <span className="font-bold uppercase tracking-widest text-xs">Products</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{stats.products}</div>
                        </div>
                        <div className="text-center md:border-r border-slate-100 last:border-0 p-4">
                            <div className="flex items-center justify-center gap-2 text-pink-600 mb-1">
                                <Star size={20} />
                                <span className="font-bold uppercase tracking-widest text-xs">Rating</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{stats.rating}</div>
                        </div>
                        <div className="text-center md:border-r border-slate-100 last:border-0 p-4">
                            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                                <Users size={20} />
                                <span className="font-bold uppercase tracking-widest text-xs">Happy Givers</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{stats.sales}</div>
                        </div>
                        <div className="text-center md:border-r border-slate-100 last:border-0 p-4">
                            <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                                <Instagram size={20} />
                                <span className="font-bold uppercase tracking-widest text-xs">Fans</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{stats.followers}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Product Feed (YouTube Grid Style) */}
            <section className="max-w-7xl mx-auto px-4 pb-24">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                        Shop the Collection
                        <span className="text-sm bg-slate-200 px-3 py-1 rounded-full text-slate-600">{products.length}</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="hover:-translate-y-1 transition-transform duration-300">
                            <ProductCard
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                imageUrl={product.image_url}
                                additionalImages={product.additional_images}
                                sellerId={product.seller_id}
                            />
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No products yet</h3>
                        <p className="text-slate-500">This creator is preparing some magic. Stay tuned!</p>
                    </div>
                )}
            </section>
        </main>
    );
}
