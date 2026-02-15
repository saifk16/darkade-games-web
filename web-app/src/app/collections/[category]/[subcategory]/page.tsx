'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, PackageX, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function SubCollectionProductsPage() {
    const params = useParams();
    const router = useRouter();
    const categoryName = decodeURIComponent(params.category as string);
    const subCategoryName = decodeURIComponent(params.subcategory as string);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // 1. Find Collection ID
                const { data: collectionData } = await supabase
                    .from('collections')
                    .select('id')
                    .ilike('name', categoryName)
                    .single();

                if (!collectionData) {
                    console.error('Collection not found');
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // 2. Find Sub-Collection ID
                const { data: subCollectionData } = await supabase
                    .from('sub_collections')
                    .select('id')
                    .eq('collection_id', collectionData.id)
                    .ilike('name', subCategoryName)
                    .single();

                if (!subCollectionData) {
                    console.error('Sub-collection not found');
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // 3. Fetch Products by ID
                const { data: activeProds } = await supabase
                    .from('products')
                    .select('*')
                    .eq('status', 'active')
                    .eq('sub_collection_id', subCollectionData.id)
                    // .ilike('category', categoryName) // OLD
                    // .ilike('sub_category', subCategoryName); // OLD
                    .order('created_at', { ascending: false });

                setProducts(activeProds || []);

                if (activeProds) {
                    const uniqueProds = Array.from(new Map(activeProds.map((p: any) => [p.id, p])).values());
                    setProducts(uniqueProds);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (categoryName && subCategoryName) {
            fetchProducts();
        }
    }, [categoryName, subCategoryName]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* 1. Compact Luxury Product Header */}
            <header className="bg-white border-b border-slate-100 py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Breadcrumbs - Minimal */}
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <Link href="/collections" className="hover:text-slate-900 transition-colors">Collections</Link>
                        <ChevronRight size={10} className="text-slate-200" />
                        <Link href={`/collections/${encodeURIComponent(categoryName)}`} className="hover:text-slate-900 transition-colors">{categoryName}</Link>
                        <ChevronRight size={10} className="text-slate-200" />
                        <span className="text-indigo-600 font-black px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100">{subCategoryName}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">{subCategoryName}.</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">
                                    Catalog Archive / {products.length} {products.length === 1 ? 'Item' : 'Items'} Found
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0">
                            <button onClick={() => router.back()} className="px-5 py-2.5 bg-white border border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Navigation
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Denser Product Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {products.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <PackageX className="mx-auto text-slate-200 mb-6" size={48} />
                        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tighter uppercase">No Entries Found.</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto text-xs italic opacity-80 leading-relaxed px-4">
                            "The curation for {subCategoryName.toLowerCase()} is currently being updated. Check back soon for new arrivals."
                        </p>
                        <div className="mt-8">
                            <button
                                onClick={() => router.push(`/collections/${encodeURIComponent(categoryName)}`)}
                                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                Category Selection
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-5">
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
                )}
            </div>

            {/* 3. Catalog Footer Ornament */}
            {!loading && products.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 text-center mt-10 mb-16">
                    <p className="text-[8px] font-black text-slate-200 uppercase tracking-[0.5em]">System.002 — End of Catalog</p>
                </div>
            )}
        </div>
    );
}
