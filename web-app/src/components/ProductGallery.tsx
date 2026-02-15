'use client';

import { useState, useRef, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;

        const { left, top, width, height } = imageRef.current.getBoundingClientRect();

        // Calculate position as percentage (0 to 100)
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;

        // Clamp values between 0 and 100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setZoomPosition({ x: clampedX, y: clampedY });
    };

    // Ensure we have at least one image
    const validImages = images.filter(Boolean);
    const displayImages = validImages.length > 0 ? validImages : ['https://via.placeholder.com/800'];

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
            {/* Thumbnails (Desktop: Left Column, Mobile: Bottom Row) */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto scrollbar-hide shrink-0 lg:w-20 justify-center lg:justify-start">
                {displayImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative w-16 h-16 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${selectedImage === idx
                            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <img
                            src={img}
                            alt={`${productName} thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Main Stage */}
            <div
                className="relative flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-crosshair group"
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
            >
                {/* Main Image */}
                <div className="relative w-full h-[35vh] lg:h-[450px] flex items-center justify-center bg-slate-50">
                    <img
                        ref={imageRef}
                        src={displayImages[selectedImage]}
                        alt={productName}
                        className="max-h-full max-w-full object-contain transition-opacity duration-300"
                    />
                </div>

                {/* Zoom Lens / Overlay (Desktop Only) */}
                {showZoom && (
                    <div
                        className="hidden lg:block absolute inset-0 pointer-events-none bg-no-repeat z-20"
                        style={{
                            backgroundImage: `url(${displayImages[selectedImage]})`,
                            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            backgroundSize: '200%', // 2x Zoom level
                        }}
                    />
                )}

                {/* Mobile: Simple Image Hints */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full lg:hidden">
                    {selectedImage + 1} / {displayImages.length}
                </div>
            </div>
        </div>
    );
}
