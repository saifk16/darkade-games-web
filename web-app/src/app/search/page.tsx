'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft, Loader2, PackageX, Filter, X } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTag = searchParams.get('tag'); // Single tag from URL
    const query = searchParams.get('q');
    const categoryParam = searchParams.get('category');

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [occasions, setOccasions] = useState<any[]>([]);
    const [relations, setRelations] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Selections
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
    const [selectedRelations, setSelectedRelations] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Sort & Price
    const [sortBy, setSortBy] = useState('relevance');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Initial load handling
    useEffect(() => {
        if (initialTag) {
            // Determine if it's an occasion or relation (simple heuristic or check both)
        }
    }, [initialTag]);

    // Fetch Filters & Products
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // 1. Fetch Filter Options
            const { data: occData } = await supabase.from('occasions').select('label, emoji').eq('is_active', true);
            const { data: relData } = await supabase.from('relations').select('label, emoji').eq('is_active', true);
            const { data: catData } = await supabase.from('categories').select('id, name');

            if (occData) setOccasions(occData);
            if (relData) setRelations(relData);
            if (catData) setCategories(catData.map(c => ({ id: c.id, name: c.name })));

            // 2. Fetch Products
            let queryBuilder = supabase
                .from('products')
                .select('*')
                .eq('status', 'active');

            const { data: allProds } = await queryBuilder;
            let filtered = allProds || [];

            // 3. Apply Filters
            // Text Search
            if (query) {
                filtered = filtered.filter((p: any) =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
                );
            }

            // Category Param
            if (categoryParam) {
                filtered = filtered.filter((p: any) =>
                    p.category?.toLowerCase() === categoryParam.toLowerCase()
                );
            }

            // Initial Tag Param handling
            if (initialTag) {
                filtered = filtered.filter((p: any) =>
                    p.tags?.includes(initialTag) ||
                    p.category?.toLowerCase() === initialTag.toLowerCase()
                );

                // Auto-select in checkboxes if it matches known tags
                if (occData?.some(o => o.label === initialTag) && !selectedOccasions.includes(initialTag)) {
                    setSelectedOccasions(prev => [...prev, initialTag]);
                }
                if (relData?.some(r => r.label === initialTag) && !selectedRelations.includes(initialTag)) {
                    setSelectedRelations(prev => [...prev, initialTag]);
                }
            }

            setProducts(filtered);
            setLoading(false);
        };

        fetchData();
    }, [query, categoryParam, initialTag]); // Refetch on URL change (except tag if it was handled)

    // Client-side Filter & Sort Logic
    let filteredProducts = products.filter(p => {
        // Tag Filters
        const hasOccasion = selectedOccasions.length === 0 || selectedOccasions.some(tag => p.tags?.includes(tag));
        const hasRelation = selectedRelations.length === 0 || selectedRelations.some(tag => p.tags?.includes(tag));
        const hasCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);

        // Price Filter
        const price = parseFloat(p.price);
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        const inPriceRange = price >= min && price <= max;

        return hasOccasion && hasRelation && hasCategory && inPriceRange;
    });

    // Sorting Logic
    if (sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'newest') {
        filteredProducts.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
    }

    const toggleOccasion = (label: string) => {
        setSelectedOccasions(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
    };

    const toggleRelation = (label: string) => {
        setSelectedRelations(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
    };

    const toggleCategory = (name: string) => {
        setSelectedCategories(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
    };

    const clearFilters = () => {
        setSelectedOccasions([]);
        setSelectedRelations([]);
        setSelectedCategories([]);
        setMinPrice('');
        setMaxPrice('');
        setSortBy('relevance');
        router.push('/search'); // Clear URL params too
    };

    const activeFiltersCount = selectedOccasions.length + selectedRelations.length + selectedCategories.length;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">

            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-50 rounded-full lg:hidden">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <Link href="/" className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Home</span>
                        </Link>
                        <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate max-w-[200px] md:max-w-none">
                            {initialTag || query || categoryParam || 'All Products'}
                            <span className="ml-2 text-slate-400 font-medium text-sm">({filteredProducts.length})</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Sort Dropdown */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="newest">Newest Arrivals</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden p-2 hover:bg-slate-50 rounded-full relative"
                        >
                            <Filter size={20} className="text-slate-600" />
                            {activeFiltersCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border border-white"></span>}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8 items-start">

                {/* Sidebar Filters (Desktop) */}
                <aside className="hidden lg:block w-64 sticky top-24 shrink-0 h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Filters</h3>
                            {(activeFiltersCount > 0 || minPrice !== '' || maxPrice !== '') && (
                                <button onClick={clearFilters} className="text-xs text-indigo-600 font-bold hover:underline">Clear All</button>
                            )}
                        </div>

                        {/* Price Range */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Price Range</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder:text-slate-400"
                                />
                                <span className="text-slate-300">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Category</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {categories.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedCategories.includes(cat.name) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white group-hover:border-indigo-300'}`}>
                                            {selectedCategories.includes(cat.name) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors ${selectedCategories.includes(cat.name) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {cat.name}
                                        </span>
                                        <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat.name)} onChange={() => toggleCategory(cat.name)} />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Occasions */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Occasion</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {occasions.map(occ => (
                                    <label key={occ.label} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedOccasions.includes(occ.label) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white group-hover:border-indigo-300'}`}>
                                            {selectedOccasions.includes(occ.label) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors ${selectedOccasions.includes(occ.label) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {occ.emoji} {occ.label}
                                        </span>
                                        <input type="checkbox" className="hidden" checked={selectedOccasions.includes(occ.label)} onChange={() => toggleOccasion(occ.label)} />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Relations */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Relation</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {relations.map(rel => (
                                    <label key={rel.label} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedRelations.includes(rel.label) ? 'bg-pink-600 border-pink-600' : 'border-slate-200 bg-white group-hover:border-pink-300'}`}>
                                            {selectedRelations.includes(rel.label) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors ${selectedRelations.includes(rel.label) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {rel.emoji} {rel.label}
                                        </span>
                                        <input type="checkbox" className="hidden" checked={selectedRelations.includes(rel.label)} onChange={() => toggleRelation(rel.label)} />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Filter Drawer */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto pb-32">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-slate-900">Filters & Sort</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-50 rounded-full">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Mobile Sort */}
                            <div className="mb-8 p-4 bg-slate-50 rounded-2xl">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Sort By</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 font-bold"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="newest">Newest Arrivals</option>
                                </select>
                            </div>

                            {/* Mobile Price */}
                            <div className="mb-8">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Price Range</h4>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                                    <span className="text-slate-300">-</span>
                                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                                </div>
                            </div>

                            {/* Mobile Categories */}
                            <div className="mb-8">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Category</h4>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.name)}
                                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selectedCategories.includes(cat.name) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Occasions */}
                            <div className="mb-8">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Occasion</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {occasions.map(occ => (
                                        <button
                                            key={occ.label}
                                            onClick={() => toggleOccasion(occ.label)}
                                            className={`px-3 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${selectedOccasions.includes(occ.label) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-600'}`}
                                        >
                                            <span>{occ.emoji}</span> {occ.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Relations */}
                            <div className="mb-8">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Relation</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {relations.map(rel => (
                                        <button
                                            key={rel.label}
                                            onClick={() => toggleRelation(rel.label)}
                                            className={`px-3 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${selectedRelations.includes(rel.label) ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-white border-slate-100 text-slate-600'}`}
                                        >
                                            <span>{rel.emoji}</span> {rel.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-slate-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                                <button onClick={() => setShowMobileFilters(false)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg">
                                    Show {filteredProducts.length} Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="flex-1">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <PackageX className="mx-auto text-slate-200 mb-6" size={64} />
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Products Found</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">We couldn't find any matches for your filters. Try adjusting your price range or clearing some tags.</p>
                            <button onClick={clearFilters} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">Clear All Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.map((product) => (
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

            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-400" size={32} /></div>}>
            <SearchContent />
        </Suspense>
    );
}
