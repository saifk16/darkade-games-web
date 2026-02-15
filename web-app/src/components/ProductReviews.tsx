'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Review {
    id: string;
    product_id: string;
    user_name: string;
    rating: number;
    headline?: string;
    comment: string;
    is_verified: boolean;
    created_at: string;
    helpful: number;
}

export default function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Most Recent');

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReviews(data as any);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    const distribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
        return { stars: star, percent, count };
    });

    return (
        <div className="py-12 bg-white" id="reviews">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Customer Reviews</h2>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left: Summary & Distribution */}
                <div className="lg:w-1/3 space-y-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-5xl font-black text-slate-900">{averageRating}</span>
                            <div className="mb-2">
                                <div className="flex text-yellow-500 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={16} fill={i <= Math.round(Number(averageRating)) ? "currentColor" : "none"} className={i <= Math.round(Number(averageRating)) ? "text-yellow-500" : "text-slate-300"} />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">{totalReviews} Reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-900">Rating Breakdown</h3>
                        {distribution.map((stat) => (
                            <div key={stat.stars} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-600 w-12 flex items-center gap-1">
                                    {stat.stars} <Star size={12} className="text-slate-400" />
                                </span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${stat.percent}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 w-8 text-right">{stat.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Review List */}
                <div className="flex-1">

                    {/* Filter Bar */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Top Reviews from India 🇮🇳</h3>
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <Filter size={16} />
                                {filter}
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500 font-medium mb-2">No reviews yet</p>
                            <p className="text-sm text-slate-400">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-slate-50 pb-8 last:border-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    fill={i < review.rating ? "currentColor" : "none"}
                                                    className={i < review.rating ? "text-yellow-500" : "text-slate-200"}
                                                />
                                            ))}
                                        </div>
                                        {review.headline && <h4 className="font-bold text-slate-900">{review.headline}</h4>}
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                            {review.user_name[0]}
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">{review.user_name}</span>
                                        {review.is_verified && (
                                            <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                                <CheckCircle size={10} /> Verified Purchase
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-300">•</span>
                                        <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        {review.comment}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <button className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                            <ThumbsUp size={14} /> Helpful
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
