'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle, Package, Tag, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setNotifications(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <Package size={20} className="text-blue-600" />;
            case 'offer': return <Tag size={20} className="text-pink-600" />;
            case 'success': return <CheckCircle size={20} className="text-green-600" />;
            default: return <Info size={20} className="text-slate-600" />;
        }
    };

    const getBg = (type: string) => {
        switch (type) {
            case 'order': return 'bg-blue-50';
            case 'offer': return 'bg-pink-50';
            case 'success': return 'bg-green-50';
            default: return 'bg-slate-50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
                    </div>
                    {notifications.some(n => !n.is_read) && (
                        <button onClick={markAllAsRead} className="text-indigo-600 text-xs font-bold hover:text-indigo-700">
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No notifications</h3>
                        <p className="text-slate-500">We will update you with offers and order details here.</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            className={`relative bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer hover:shadow-md ${n.is_read ? 'border-slate-100 opacity-80' : 'border-indigo-100 ring-1 ring-indigo-50'
                                }`}
                        >
                            {!n.is_read && (
                                <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
                            )}

                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBg(n.type)}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div>
                                    <h4 className={`text-slate-900 text-sm mb-1 ${n.is_read ? 'font-semibold' : 'font-bold'}`}>{n.title}</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed">{n.message}</p>
                                    <p className="text-slate-400 text-[10px] mt-2 font-medium">
                                        {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
