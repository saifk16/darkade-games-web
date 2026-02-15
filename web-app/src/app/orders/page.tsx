'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2, Star, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';
import OrderStepper from '@/components/OrderStepper';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewItem, setReviewItem] = useState<any>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Fetch Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (ordersError) {
                console.error("Error fetching orders:", ordersError);
                setLoading(false);
                return;
            }

            // Fetch Items for each order
            const ordersWithItems = await Promise.all(ordersData.map(async (order) => {
                const { data: items } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', order.id);

                return { ...order, items: items || [] };
            }));

            setOrders(ordersWithItems);
            setLoading(false);
        };

        fetchOrders();
    }, [router]);

    const handleOpenReview = (item: any, orderId: string) => {
        setReviewItem({ ...item, orderId: orderId });
        setIsReviewOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">My Orders</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No orders yet</h3>
                        <p className="text-slate-500 mb-6">Start shopping to see your orders here.</p>
                        <Link href="/" className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm">Start Shopping</Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-slate-50 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
                                    <p className="font-bold text-slate-800 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                                    <span className="font-black text-slate-900 text-lg">₹{order.total_amount?.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Order Items with Tracking */}
                            <div className="space-y-8">
                                {order.items.map((item: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                                {item.image_url && <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate mb-1">{item.product_name}</h4>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold">Qty: {item.quantity}</span>
                                                    <span>₹{item.price}</span>
                                                </div>

                                                {/* Tracking Info if Shipped */}
                                                {(item.status === 'Shipped' || item.status === 'Delivered') && (item.awb_code || item.shiprocket_order_id) && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {item.awb_code ? (
                                                            <a
                                                                href={`https://shiprocket.co/tracking/${item.awb_code}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                                                            >
                                                                <Truck size={12} /> Track Shipment <ExternalLink size={10} />
                                                            </a>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
                                                                <Clock size={12} /> Tracking Updating...
                                                            </span>
                                                        )}
                                                        {item.courier_name && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">via {item.courier_name}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stepper for Item Status */}
                                        <OrderStepper status={item.status || 'Pending'} createdAt={item.created_at} updatedAt={item.updated_at} />

                                        {/* Action Buttons */}
                                        <div className="flex justify-end pt-2">
                                            {item.status === 'Delivered' && (
                                                <button
                                                    onClick={() => handleOpenReview(item, order.id)}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors px-4 py-2 hover:bg-indigo-50 rounded-lg"
                                                >
                                                    <Star size={14} /> Write a Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Delivery Address Summary */}
                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-slate-400">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm mb-1">Delivery Location</p>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            {(() => {
                                                try {
                                                    const addr = typeof order.delivery_address === 'string'
                                                        ? JSON.parse(order.delivery_address)
                                                        : order.delivery_address;
                                                    if (!addr) return 'Address details unavailable';
                                                    return `${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
                                                } catch (e) { return 'Address details unavailable'; }
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Modal */}
            {user && reviewItem && (
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    productName={reviewItem.product_name}
                    productId={reviewItem.product_id}
                    orderId={reviewItem.orderId}
                    userId={user.id}
                    userName={user.user_metadata?.first_name || "Verified Customer"} // Fallback name
                    onSuccess={() => {
                        // Optional: Show success toast
                        alert("Review submitted successfully!");
                    }}
                />
            )}
        </div>
    );
}
