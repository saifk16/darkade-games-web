'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
    const handleShare = async () => {
        const shareData = {
            title,
            text,
            url: url || window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                // We can't use alert() as per user request to be "silent", 
                // but for Share, a layout feedback is usually expected.
                // Since I can't add a toast easily without a library, 
                // I'll just change the icon color temporarily or do nothing silent.
                // Let's rely on standard browser behavior or just console log.
                console.log('Copied to clipboard');
            } catch (err) {
                console.error('Failed to copy code', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-white transition-colors"
            title="Share"
        >
            <Share2 size={20} className="text-slate-800" />
        </button>
    );
}
