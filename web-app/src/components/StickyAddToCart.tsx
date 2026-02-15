'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StickyAddToCartProps {
    product: {
        id: string;
        name: string;
        price: number;
        image_url: string;
    };
}

export default function StickyAddToCart({ product }: StickyAddToCartProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling 500px (past the main image usually)
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const addToCart = () => {
        if (isAdded) return;

        const cart = JSON.parse(localStorage.getItem('personalised-cart') || '[]');
        const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('personalised-cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));

        // Show feedback instead of redirecting immediately for Sticky Header
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-md z-50 transform transition-transform duration-300 animate-in slide-in-from-top px-4 py-3 flex items-center justify-between lg:justify-center gap-4 lg:gap-8 border-b border-indigo-50">

            {/* Product Info (Left) */}
            <div className="flex items-center gap-3">
                <img
                    src={product.image_url || 'https://via.placeholder.com/50'}
                    alt={product.name}
                    className="w-10 h-10 rounded-md object-cover border border-slate-200"
                />
                <div className="hidden md:block">
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{product.name}</h3>
                    <p className="text-xs text-indigo-600 font-bold">In Stock</p>
                </div>
            </div>

            {/* Price & Action (Right) */}
            <div className="flex items-center gap-4">
                <span className="font-black text-slate-900 text-lg">₹{product.price.toLocaleString('en-IN')}</span>
                <button
                    onClick={addToCart}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${isAdded
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                        }`}
                >
                    {isAdded ? (
                        <>
                            <Check size={16} />
                            Added!
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={16} />
                            Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
