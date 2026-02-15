'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('wishlist')
            .select('product_id, products (*)')
            .eq('user_id', user.id);

        if (data) {
            const formattedProducts = data.map((item: any) => item.products);
            setProducts(formattedProducts);
        }
        setLoading(false);
    };

    const removeFromWishlist = async (productId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic update
        setProducts(products.filter(p => p.id !== productId));

        await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">My Wishlist ({products.length})</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                            <Heart size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-slate-500 mb-6">Save items you love to buy later.</p>
                        <Link href="/collections" className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors">
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <Link href={`/products/${product.id}`}>
                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWishlist(product.id);
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-pink-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                            {product.category}
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <Link href={`/products/${product.id}`}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</h3>
                                        </div>
                                    </Link>

                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
                                        <Link href={`/products/${product.id}`} className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200">
                                            <ShoppingBag size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
