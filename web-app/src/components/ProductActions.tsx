'use client';

import { ShoppingCart, Zap, Check, Heart, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CustomizationOption {
    id: string;
    label: string;
    type: 'text' | 'number' | 'dropdown' | 'image';
    required: boolean;
    options?: string[];
}

interface ProductActionsProps {
    product: {
        id: string;
        name: string;
        price: number;
        image_url: string;
    };
    customizationOptions: CustomizationOption[];
}

export default function ProductActions({ product, customizationOptions = [] }: ProductActionsProps) {
    const router = useRouter();

    // State for dynamic inputs: Record<field_label, value>
    const [customValues, setCustomValues] = useState<Record<string, any>>({});
    // State for file uploads: Record<field_label, File>
    const [fileInputs, setFileInputs] = useState<Record<string, File | null>>({});

    // Legacy support (if no options defined, show default text/image)
    // Actually, let's migrate: if no options, show nothing? 
    // Or maybe we should ADD default options to old products?
    // Let's stick to: if options exist, use them. If not, show legacy simple personalization?
    // User said "seller decide...". If seller didn't decide, maybe no personalization?
    // Let's assume if array is empty, no personalization. 
    // BUT we might want a global "Note" field?
    // Let's strictly follow the options. If empty, just Buy.

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loadingAction, setLoadingAction] = useState<'add' | 'buy' | null>(null);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        checkWishlistStatus();
    }, []);

    const checkWishlistStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .maybeSingle();

        if (data) setIsWishlisted(true);
    };

    const toggleWishlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        if (isWishlisted) {
            setIsWishlisted(false);
            await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', product.id);
        } else {
            setIsWishlisted(true);
            await supabase.from('wishlist').insert({ user_id: user.id, product_id: product.id });
        }
    };

    const handleFileChange = (label: string, file: File | null) => {
        setFileInputs(prev => ({ ...prev, [label]: file }));
        // Also update customValues to show something selected? 
        // We'll handle the actual value (URL) during submission
    };

    const validate = () => {
        for (const opt of customizationOptions) {
            if (opt.required) {
                if (opt.type === 'image') {
                    if (!fileInputs[opt.label]) {
                        alert(`Please upload an image for "${opt.label}"`);
                        return false;
                    }
                } else {
                    if (!customValues[opt.label] || customValues[opt.label].toString().trim() === '') {
                        alert(`Please enter a value for "${opt.label}"`);
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const addToCart = async (action: 'add' | 'buy') => {
        if (!validate()) return;
        setLoadingAction(action);

        // Process Uploads
        const processedCustomization: Record<string, string> = { ...customValues };

        try {
            for (const [label, file] of Object.entries(fileInputs)) {
                if (file) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                    const filePath = `user-uploads/${fileName}`;

                    const { error: upErr } = await supabase.storage.from('customization-files').upload(filePath, file);
                    if (upErr) throw upErr;

                    const { data: urlData } = supabase.storage.from('customization-files').getPublicUrl(filePath);
                    processedCustomization[label] = urlData.publicUrl;
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Image upload failed. Please try again.");
            setLoadingAction(null);
            return;
        }

        // Format as array of key-value pairs for cleaner display in Cart/Orders
        const customizationArray = Object.entries(processedCustomization).map(([key, value]) => ({
            label: key,
            value: value
        }));

        const cartItem = {
            ...product,
            quantity: 1,
            customization: processedCustomization // Store as object for now, or use array if flexible?
            // Let's store as object to map easily, but for display might need to know if it's an image?
            // The value for image is URL. We can detect URL? 
            // Better: Store { label, value, type }
        };

        // Let's refine the customization storage to include metadata
        const finalCustomization = customizationOptions.map(opt => ({
            label: opt.label,
            value: processedCustomization[opt.label],
            type: opt.type
        })).filter(c => c.value); // Only save provided values

        const cart = JSON.parse(localStorage.getItem('personalised-cart') || '[]');

        // Add as new item always if customized
        // Using a unique ID for the cart item helps
        const newItem = {
            ...cartItem,
            cartItemId: crypto.randomUUID(),
            customization: finalCustomization
        };

        cart.push(newItem);
        localStorage.setItem('personalised-cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));

        setTimeout(() => {
            setLoadingAction(null);
            if (action === 'buy') {
                router.push('/cart');
            } else {
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2000);
                // Reset ONLY if staying on page
                if (action === 'add') {
                    setCustomValues({});
                    setFileInputs({});
                }
            }
        }, 500);
    };

    return (
        <div className="flex flex-col gap-4 max-w-md mx-auto lg:max-w-none">

            {/* Dynamic Personalization Section */}
            {/* Dynamic Personalization Section (Mini & Cute Design) */}
            {customizationOptions.length > 0 && (
                <div className="bg-[#fff0f5] p-3 rounded-2xl border border-pink-100 space-y-3">
                    <p className="font-bold text-xs text-[#d63384] flex items-center gap-1.5 uppercase tracking-wide">
                        <Zap size={14} className="fill-current" />
                        Personalize Me ✨
                    </p>

                    <div className="space-y-2.5">
                        {customizationOptions.map((opt, idx) => (
                            <div key={idx} className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between ml-1">
                                    {opt.label}
                                    {opt.required && <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">Required</span>}
                                </label>

                                {opt.type === 'image' ? (
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleFileChange(opt.label, e.target.files?.[0] || null)}
                                        />
                                        <div className={`w-full p-2 text-xs border border-dashed rounded-xl flex items-center justify-center gap-2 transition-all ${fileInputs[opt.label]
                                            ? 'bg-white border-pink-300 text-pink-600'
                                            : 'bg-white/50 border-pink-200 text-slate-400 hover:bg-white hover:border-pink-300'
                                            }`}>
                                            {fileInputs[opt.label] ? (
                                                <>
                                                    <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 shrink-0">
                                                        <Check size={10} />
                                                    </span>
                                                    <span className="truncate font-medium">{fileInputs[opt.label]?.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={12} />
                                                    <span>Tap to upload photo</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : opt.type === 'dropdown' ? (
                                    <div className="relative">
                                        <select
                                            className="w-full py-2 pl-3 pr-8 text-xs border border-pink-100 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 bg-white text-slate-700 font-medium appearance-none"
                                            value={customValues[opt.label] || ''}
                                            onChange={(e) => setCustomValues({ ...customValues, [opt.label]: e.target.value })}
                                        >
                                            <option value="" disabled>Select...</option>
                                            {opt.options?.map((o, i) => (
                                                <option key={i} value={o}>{o}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-pink-300">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type={opt.type === 'number' ? 'number' : 'text'}
                                        className="w-full p-2 text-xs border border-pink-100 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 bg-white text-slate-700 placeholder:text-slate-300 font-medium"
                                        placeholder={`Type ${opt.label.toLowerCase()}...`}
                                        value={customValues[opt.label] || ''}
                                        onChange={(e) => setCustomValues({ ...customValues, [opt.label]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                {/* Buy Direct Button */}
                <button
                    onClick={() => addToCart('buy')}
                    disabled={!!loadingAction}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                >
                    <Zap size={20} className="fill-white" />
                    {loadingAction === 'buy' ? 'Processing...' : 'Buy Direct'}
                </button>

                {/* Add To Cart Button */}
                <button
                    onClick={() => addToCart('add')}
                    disabled={!!loadingAction || isAdded}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 ${isAdded ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-black'
                        }`}
                >
                    {isAdded ? (
                        <>
                            <Check size={20} className="animate-bounce" />
                            Added!
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={20} />
                            {loadingAction === 'add' ? 'Adding...' : 'Add to Cart'}
                        </>
                    )}
                </button>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className={`w-14 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105 active:scale-95 ${isWishlisted
                        ? 'border-pink-500 bg-pink-50 text-pink-500'
                        : 'border-slate-200 text-slate-400 hover:border-pink-200 hover:text-pink-400'
                        }`}
                >
                    <Heart size={24} className={isWishlisted ? 'fill-current' : ''} />
                </button>
            </div>

            {/* Disclaimer Note */}
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex gap-2 items-start text-xs text-orange-800">
                <div className="shrink-0 mt-0.5 font-bold">⚠️ Note:</div>
                <div className="flex flex-col gap-1">
                    <p>Customized products cannot be returned or exchanged unless damaged on arrival or incorrectly personalized.</p>
                    <p className="font-bold text-red-600">* Unboxing video is mandatory for any damage claims.</p>
                </div>
            </div>
        </div>
    );
}
