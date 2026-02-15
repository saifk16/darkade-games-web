'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.slug as string);

  const [products, setProducts] = useState<any[]>([]);
  const [subCollections, setSubCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. Get Category ID from Name (needed to fetch sub-cats)
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', categoryName)
        .single();

      if (catData) {
        // 2. Fetch Sub-categories
        const { data: subData } = await supabase
          .from('sub_categories')
          .select('*')
          .eq('category_id', catData.id);

        setSubCollections(subData || []);
      }

      // 3. Fetch Products
      const { data } = await supabase
        .from('products')
        .select('*')
        .ilike('category', categoryName) // Case insensitive match
        .order('created_at', { ascending: false });

      setProducts(data || []);
      setLoading(false);
    };

    if (categoryName) {
      init();
    }
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/collections" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-medium">
            <ArrowLeft size={18} /> Back to Collections
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{categoryName}</h1>
          <p className="text-slate-400">Discover the best curations from {categoryName}.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Render Sub-collections IF they exist */}
        {subCollections.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Explore {categoryName}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {subCollections.map((sub, idx) => (
                <Link
                  key={idx}
                  href={`/collections/${encodeURIComponent(categoryName)}/${encodeURIComponent(sub.name)}`}
                  className="group relative h-40 md:h-56 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="absolute inset-0 bg-slate-200">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-lg md:text-xl font-bold text-center px-2">{sub.name}</h3>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    <ArrowRight className="text-white w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{subCollections.length > 0 ? `All ${categoryName} Products` : `Products`}</h2>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No products found</h2>
            <p className="text-slate-500 mb-6">We couldn't find any items in this category yet. Check back soon!</p>
            <Link href="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Explore All Products
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
