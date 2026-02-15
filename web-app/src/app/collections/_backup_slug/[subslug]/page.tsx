'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubCollectionPage() {
    const params = useParams();
    const categoryName = decodeURIComponent(params.slug as string);
    const subCategoryName = decodeURIComponent(params.subslug as string);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            // NOTE: Since our DB might not have 'sub_category' column yet, 
            // we are mimicking this behavior. In a real app, you'd add .eq('sub_category', subCategoryName)
            // For now, I'll search by name or description to simulate results, 
            // OR just show all category products for demo purposes.

            const { data } = await supabase
                .from('products')
                .select('*')
                .ilike('category', categoryName)
                // .ilike('name', `%${subCategoryName}%`) // Optional: Try to match sub-cat name in product name
                .order('created_at', { ascending: false });

            // Client-side simulation of filtering if DB doesn't have field
            // This is just to make the demo feel "real" if the user has products named appropriately
            const filtered = data?.filter(p =>
                p.name.toLowerCase().includes(subCategoryName.toLowerCase().split(' ')[0]) ||
                p.description?.toLowerCase().includes(subCategoryName.toLowerCase())
            );

            // If strict filter yields nothing (likely), show all category products as fallback
            setProducts((filtered && filtered.length > 0) ? filtered : (data || []));

            setLoading(false);
        };

        if (categoryName && subCategoryName) {
            fetchProducts();
        }
    }, [categoryName, subCategoryName]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* Header Banner */}
            <div className="bg-slate-900 text-white py-12 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-400">
                        <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
                        <span>/</span>
                        <Link href={`/collections/${params.slug}`} className="hover:text-white transition-colors">{categoryName}</Link>
                        <span>/</span>
                        <span className="text-white">{subCategoryName}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{subCategoryName}</h1>
                    <p className="text-slate-400">Curated {subCategoryName} just for you.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
                ) : products.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="text-6xl mb-4">✨</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
                        <p className="text-slate-500 mb-6">We are currently curating the best {subCategoryName} for you.</p>
                        <Link href={`/collections/${params.slug}`} className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Back to {categoryName}
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 text-slate-500 font-medium">Found {products.length} items</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                            {products.map((product) => (
                                <div key={product.id} className="hover:-translate-y-2 transition-transform duration-500 ease-out">
                                    <ProductCard
                                        id={product.id}
                                        name={product.name}
                                        price={product.price}
                                        imageUrl={product.image_url}
                                        sellerName="✨ Premium Partner"
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
