'use client';
import Link from 'next/link';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProductCard({ id, name, price, imageUrl, additionalImages = [], sellerId }: any) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkWishlistStatus();
  }, [id]);

  const checkWishlistStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .maybeSingle();

    if (data) setIsLiked(true);
  };

  const toggleWishlist = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (isLiked) {
      setIsLiked(false);
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', id);
    } else {
      setIsLiked(true);
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: id });
    }
  };

  const handleAddToCart = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdded) return;

    const cart = JSON.parse(localStorage.getItem('personalised-cart') || '[]');
    const existingItemIndex = cart.findIndex((item: any) => item.id === id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
      cart.push({ id, name, price, imageUrl, quantity: 1, additional_images: additionalImages });
    }

    localStorage.setItem('personalised-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-slate-100 flex flex-col h-full relative group">
      <div className="flex-1 flex flex-col relative">
        <div className="aspect-[6/4] overflow-hidden bg-slate-100 relative">
          <Link href={`/products/${id}`} className="absolute inset-0 z-10">
            <span className="sr-only">View {name}</span>
          </Link>

          {/* Main Image */}
          <img
            src={imageUrl}
            alt={name}
            className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${additionalImages?.[0] ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
          />

          {/* Hover Image (if available) */}
          {additionalImages?.[0] && (
            <img
              src={additionalImages[0]}
              alt={name + " view 2"}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-in-out"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase text-pink-600 shadow-sm z-20 pointer-events-none">
            Best Seller
          </div>

          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:bg-white hover:text-red-500 transition-colors shadow-sm z-20"
          >
            <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>

        <div className="p-4 pb-0 flex-1 flex flex-col">
          <Link href={`/products/${id}`} className="group-hover:text-indigo-600 transition-colors">
            <h3 className="text-slate-800 text-sm font-bold line-clamp-2 leading-tight mb-2">
              {name}
            </h3>
          </Link>

          <p className="text-[10px] text-slate-500 font-medium mb-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Customisable with Name & Photo
          </p>

          {/* Seller Link (New) */}
          {sellerId && (
            <Link
              href={`/shops/${sellerId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 mb-2 block uppercase tracking-wide w-fit"
            >
              View Seller Info
            </Link>
          )}

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-black text-slate-900">₹{Number(price || 0).toLocaleString()}</span>
              {price && <span className="text-xs text-slate-400 line-through decoration-slate-400">₹{Math.round(Number(price) * 1.5).toLocaleString()}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer relative z-10 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 ${isAdded ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-[#f43397]'
            }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 animate-bounce" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 group-hover/btn:animate-bounce" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div >
  );
}