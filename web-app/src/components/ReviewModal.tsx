'use client';

import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: string;
    orderId: string;
    userId: string;
    userName: string;
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, productName, productId, orderId, userId, userName, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [headline, setHeadline] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase.from('reviews').insert({
                product_id: productId,
                user_name: userName,
                user_id: userId,
                rating: rating,
                headline: headline,
                comment: comment,
                is_verified: true // Since it's from Orders page, it is verified
            });

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Rate & Review</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-500 mb-4">You are reviewing: <span className="font-bold text-slate-900">{productName}</span></p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Overall Rating</label>
                            <div className="flex gap-2 justify-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110 p-1"
                                    >
                                        <Star
                                            size={32}
                                            fill={star <= rating ? "gold" : "none"}
                                            className={star <= rating ? "text-yellow-400" : "text-slate-300"}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="What's most important to know?"
                                value={headline}
                                onChange={e => setHeadline(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Written Review</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                                placeholder="What did you like or dislike?"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
