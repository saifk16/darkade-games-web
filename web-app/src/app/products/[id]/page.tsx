import { createClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingCart, MessageCircle, Share2, ShieldCheck, Truck, Star,
  ChevronDown, Heart, Package, RotateCcw, Check, Zap
} from 'lucide-react';
import ProductActions from '@/components/ProductActions';
import ShareButton from '@/components/ShareButton';
import ProductGallery from '@/components/ProductGallery';
import ProductReviews from '@/components/ProductReviews';
import StickyAddToCart from '@/components/StickyAddToCart';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetails({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Unavailable</h1>
          <p className="text-slate-500 mb-6">This product is currently not available or under review.</p>
          <Link href="/collections" className="btn-primary w-full block py-3 rounded-full font-bold bg-slate-900 text-white">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === product.seller_id;
  const status = product.status || 'pending';

  // If product is NOT active and user is NOT the owner -> Show Unavailable
  if (status !== 'active' && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Unavailable</h1>
          <p className="text-slate-500 mb-6">This product is currently not available or under review.</p>
          <Link href="/collections" className="btn-primary w-full block py-3 rounded-full font-bold bg-slate-900 text-white">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isPending = status !== 'active';

  const whatsappNumber = "919876543210";
  const message = `Hi, I'm interested in *${product.name}* (Price: ₹${product.price}). Is it available?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-0">

      {/* 🟢 Sticky Bar (Scrolls into view) */}
      <StickyAddToCart product={product} />

      {/* 🟢 Navbar (Simple & Transparent) */}
      <nav className="fixed top-0 left-0 right-0 p-4 z-50 flex justify-between items-center pointer-events-none">
        <Link href="/collections" className="pointer-events-auto w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-white transition-colors">
          <ArrowLeft size={20} className="text-slate-800" />
        </Link>
        <div className="flex gap-2 pointer-events-auto">
          <ShareButton title={product.name} text={`Check out this ${product.name}!`} />
        </div>
      </nav>


      <main className="pt-20 pb-12 px-4 lg:px-8">

        {isPending && (
          <div className="max-w-7xl mx-auto mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-center gap-3">
            <ShieldCheck size={20} />
            <p className="font-bold text-sm">
              This product is currently <span className="uppercase">{status}</span> and is not visible to the public.
            </p>
          </div>
        )}

        {/* 📦 Product Card */}
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row mb-8">

          {/* 📸 Left: Gallery */}
          <div className="lg:w-1/2 p-4 lg:p-8 bg-white lg:border-r border-slate-50">
            <ProductGallery
              images={[product.image_url, ...(product.additional_images || [])]}
              productName={product.name}
            />
          </div>

          {/* 📝 Right: Details */}
          <div className="lg:w-1/2 flex flex-col p-6 lg:p-12">

            <div className="mb-2">
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-1 block">{product.category}</span>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-[1.1] mb-2 tracking-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{(product.discount_price || product.price).toLocaleString('en-IN')}
                  </span>
                  {product.discount_price && (
                    <span className="text-lg text-slate-400 font-medium line-through">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {product.discount_price && (
                  <div className="bg-[#f43397]/10 text-[#f43397] px-3 py-1 rounded-full text-xs font-bold">
                    Save {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock_quantity > 0 ? (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.stock_quantity < 5 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'} flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {product.stock_quantity < 5 ? `Only ${product.stock_quantity} left` : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            {/* Description */}
            <div className="mb-8 space-y-6">
              <div>
                <h3 className="font-bold text-md mb-2 flex items-center gap-2">Description</h3>
                <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed text-xs md:text-sm">
                  <p>{product.description || "Transform your living space with this exquisitely crafted piece."}</p>
                </div>
              </div>

              {/* Shipping & Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                  <Truck size={16} className="text-indigo-600" /> Shipping & Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-500 block mb-0.5">Delivery</span>
                    <span>Ships in 2-5 business days</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block mb-0.5">Return Policy</span>
                    <span>7-day replacement guarantee</span>
                  </div>
                  {(product.weight || (product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height))) && (
                    <>
                      {product.weight && (
                        <div>
                          <span className="font-bold text-slate-500 block mb-0.5">Weight</span>
                          <span>{product.weight} kg</span>
                        </div>
                      )}
                      {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                        <div>
                          <span className="font-bold text-slate-500 block mb-0.5">Dimensions</span>
                          <span>{product.dimensions.length || '-'} x {product.dimensions.width || '-'} x {product.dimensions.height || '-'} cm</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-3">
              <ProductActions
                product={product}
                customizationOptions={product.customization_options || []}
              />

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-slate-400 font-bold text-xs hover:text-green-600 transition-colors"
              >
                Or discuss on WhatsApp
              </a>
            </div>

          </div>
        </div>

        {/* ⭐ Reviews Card */}
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-12">
          <ProductReviews productId={product.id} />
        </div>

      </main>

    </div>
  );
}