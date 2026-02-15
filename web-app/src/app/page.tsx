'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/HeroSection';
import OccasionNav from '@/components/OccasionNav';
import RelationNav from '@/components/RelationNav';
import HorizontalScroll from '@/components/HorizontalScroll';
import ProductCard from '@/components/ProductCard'; // Added Import
import Link from 'next/link'; // Added Import

import CategoryGrid from '@/components/CategoryGrid';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

// Main Home Content Component
function HomeContent() {
  const [occasionProducts, setOccasionProducts] = useState<any[]>([]);
  const [relationProducts, setRelationProducts] = useState<any[]>([]);
  const [mixProducts, setMixProducts] = useState<any[]>([]); // Added State
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleNavSelect = (category: string) => {
    // Navigate to search page with the selected tag
    router.push(`/search?tag=${encodeURIComponent(category)}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch Active Products
        const { data: allProds, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');

        if (prodError) throw prodError;

        if (!allProds) {
          setIsLoading(false);
          return;
        }

        // Fetch Dynamic Occasions & Relations for filtering
        const { data: occData, error: occError } = await supabase.from('occasions').select('label').eq('is_active', true);
        if (occError) console.error("Error fetching occasions:", occError);

        const { data: relData, error: relError } = await supabase.from('relations').select('label').eq('is_active', true);
        if (relError) console.error("Error fetching relations:", relError);

        const occTags = occData?.map(o => o.label) || ['Birthday', 'Anniversary', 'Wedding'];
        const relTags = relData?.map(r => r.label) || ['For Her', 'For Him', 'Mom', 'Dad'];

        // 1. Best for Every Occasion
        const occasionMix = allProds.filter((p: any) =>
          p.tags?.some((t: string) => occTags.includes(t)) ||
          occTags.some(tag => p.name.includes(tag))
        ).slice(0, 10);

        // 2. Best for Every Relation
        const relationMix = allProds.filter((p: any) =>
          p.tags?.some((t: string) => relTags.includes(t)) ||
          relTags.some(tag => p.name.includes(tag))
        ).slice(0, 10);

        // 3. Mix Products (Random Shuffle)
        const shuffled = [...allProds].sort(() => 0.5 - Math.random());
        const mix = shuffled.slice(0, 20); // Show top 20 random products

        setOccasionProducts(occasionMix);
        setRelationProducts(relationMix);
        setMixProducts(mix);
      } catch (err: any) {
        console.error('Error fetching homepage data:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Shop by Occasion */}
      <OccasionNav onSelect={handleNavSelect} />



      {/* 2.2 Horizontal Scroll: Best of Occasions */}
      {!isLoading && occasionProducts.length > 0 && (
        <HorizontalScroll
          title="Best for Every Occasion"
          products={occasionProducts}
          link="/search"
        />
      )}

      {/* 2.3 Category Grid (New) */}
      <CategoryGrid />



      {/* 3. Shop by Relation */}
      <RelationNav onSelect={handleNavSelect} />

      {/* 3.1 Horizontal Scroll: Best for Every Relation */}
      {!isLoading && relationProducts.length > 0 && (
        <HorizontalScroll
          title="Best for Every Relation"
          products={relationProducts}
          link="/search"
        />
      )}

      {/* 4. Discover More (Mix Products) */}
      {!isLoading && mixProducts.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs">Curated For You</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Discover More</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {mixProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                imageUrl={p.image_url}
                additionalImages={p.additional_images}
                sellerId={p.seller_id}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/search" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-200">
              View All Products
            </Link>
          </div>
        </section>
      )}

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}