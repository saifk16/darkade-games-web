'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Tags, PackageX, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function SubCollectionsPage() {
    const params = useParams();
    const router = useRouter();
    const categoryName = decodeURIComponent(params.category as string);

    const [category, setCategory] = useState<any>(null);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubCategories = async () => {
            let currentCat = null;
            // Fetch relevant collection
            const { data: catData } = await supabase
                .from('collections')
                .select('*')
                .ilike('name', categoryName)
                .single();

            if (catData) {
                currentCat = catData;
            }

            if (!currentCat) {
                setLoading(false);
                return;
            }

            setCategory(currentCat);

            // Fetch sub-collections linked to this collection
            const { data: subData } = await supabase
                .from('sub_collections')
                .select('*')
                .eq('collection_id', currentCat.id)
                .order('name');

            if (subData && subData.length > 0) {
                setSubCategories(subData);
            } else {
                // If no sub-collections, try fetching products directly linked to this collection
                // Note: Products table needs 'collection_id' column, which migration adds.
                // We should check if products have collection_id set.
                // Fallback to searching by category name if collection_id is generic text in products.
                // But migration added collection_id UUID.
                // Let's try to fetch by collection_id first if available in product, or name string matches.

                const { data: activeProds } = await supabase
                    .from('products')
                    .select('*')
                    .eq('status', 'active')
                    .or(`collection_id.eq.${currentCat.id},category.ilike.${categoryName}`);

                setProducts(activeProds || []);

                if (activeProds) {
                    const uniqueProds = Array.from(new Map(activeProds.map((p: any) => [p.id, p])).values());
                    setProducts(uniqueProds);
                } else {
                    setProducts([]);
                }
            }
            setLoading(false);
        };

        if (categoryName) {
            fetchSubCategories();
        }
    }, [categoryName]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
    );

    if (!category) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
                <PackageX className="text-slate-200 mb-6" size={64} />
                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Category Not Found.</h1>
                <p className="text-slate-500 mb-10 max-w-sm font-medium text-sm leading-relaxed">
                    We couldn't locate this collection. It may have been moved or renamed.
                </p>
                <Link href="/collections" className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3">
                    <ArrowLeft size={16} /> All Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* 1. Compact Category Header */}
            <header className="bg-white border-b border-slate-100 py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Navigation Bar - Compact */}
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex-wrap">
                        <Link href="/collections" className="hover:text-slate-900 transition-colors">Collections</Link>
                        <ChevronRight size={10} className="text-slate-200" />
                        <span className="text-slate-900 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100">{category.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3">
                                {category.name}.
                            </h1>
                            <p className="text-slate-500 text-sm font-medium max-w-xl leading-relaxed">
                                Curated picks within {category.name}. Handcrafted for quality and uniqueness.
                            </p>
                        </div>

                        <div className="flex shrink-0">
                            <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all group bg-white shadow-sm">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Higher Density Sub-category Cards */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {subCategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                        {subCategories.map((sub) => (
                            <Link
                                href={`/collections/${encodeURIComponent(categoryName)}/${encodeURIComponent(sub.name)}`}
                                key={sub.id}
                                className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                            >
                                <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                                    {sub.image_url ? (
                                        <img
                                            src={sub.image_url}
                                            alt={sub.name}
                                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Tags className="text-slate-200" size={32} />
                                        </div>
                                    )}
                                    {/* Minimal accent line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                </div>

                                <div className="p-4 flex flex-col items-center text-center">
                                    <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate w-full">{sub.name}</h3>
                                    <div className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                                        <span>Browse</span>
                                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                imageUrl={product.image_url}
                                additionalImages={product.additional_images}
                                sellerId={product.seller_id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <PackageX className="mx-auto text-slate-200 mb-6" size={48} />
                        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Gallery Underway.</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto italic text-xs leading-relaxed px-4">
                            "Art takes time. We're currently curating this specific selection of items just for you."
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
