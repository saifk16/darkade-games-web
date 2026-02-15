'use client';

import { Search, Package, Truck, Map, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setIsSearching(true);
        // Simulate API delay
        setTimeout(() => {
            setIsSearching(false);
            alert(`Tracking functionality for ${orderId} will be integrated with Shiprocket API.`);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <Search size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Track Your Order</h1>
                    <p className="text-slate-600 text-lg">Enter your Order ID or Tracking ID to see current status</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <form onSubmit={handleTrack} className="flex gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter Order ID / AWB Number"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-medium text-slate-900"
                            />
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !orderId}
                            className="bg-slate-900 text-white px-8 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-70"
                        >
                            {isSearching ? 'Tracking...' : 'Track'}
                        </button>
                    </form>

                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                <Package size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Order Placed</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-50">
                            <div className="w-10 h-10 mx-auto bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-3">
                                <Truck size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Shipped</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-50">
                            <div className="w-10 h-10 mx-auto bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-3">
                                <Map size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Delivered</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Having trouble tracking? <a href="/contact" className="text-purple-600 font-bold hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
