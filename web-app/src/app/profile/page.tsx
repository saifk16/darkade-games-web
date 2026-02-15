'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    LogOut, User, Package, Settings, ChevronRight, Loader2, ShieldCheck,
    Heart, MapPin, CreditCard, Bell, HelpCircle, Camera
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        wishlistCount: 0,
        memberSince: new Date().getFullYear(),
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // 2. Fetch Orders Stats
            const { data: orders } = await supabase
                .from('orders')
                .select('id, status')
                .eq('user_id', user.id);

            const totalOrders = orders?.length || 0;
            const activeOrders = orders?.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length || 0;

            // 3. Fetch Wishlist Count
            const { count: wishlistCount } = await supabase
                .from('wishlist')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setUser({ ...user, ...profile });
            setStats({
                totalOrders,
                activeOrders,
                wishlistCount: wishlistCount || 0,
                memberSince: new Date(user.created_at).getFullYear(),
            });
            setLoading(false);
        };

        getUserData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <h3 className="text-xl font-black text-slate-900">{value}</h3>
            </div>
        </div>
    );

    const MenuLink = ({ icon: Icon, label, subLabel, color, bg, href }: any) => (
        <Link href={href || '#'} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{label}</h4>
                <p className="text-xs text-slate-400 font-medium">{subLabel}</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" size={18} />
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* 🌟 Hero Header */}
            <div className="h-54 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 p-6 flex justify-between items-start max-w-7xl mx-auto">
                    <Link href="/" className="text-white/80 hover:text-white font-bold text-sm flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full transition-colors border border-white/10 hover:bg-white/20">
                        <ChevronRight className="rotate-180" size={16} /> Back to Home
                    </Link>
                    <button onClick={handleLogout} className="text-white hover:text-white font-bold text-sm flex items-center gap-2 bg-rose-600 hover:bg-rose-500 backdrop-blur-md px-5 py-2.5 rounded-full transition-all border border-rose-500/30 hover:border-transparent hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 hover:scale-105 cursor-pointer">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Column: Profile Card */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white/50 relative overflow-hidden text-center backdrop-blur-xl">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-50 to-pink-50"></div>

                            <div className="relative z-10">
                                <div className="w-32 h-32 mx-auto rounded-full bg-white p-1.5 shadow-2xl mb-4 relative group cursor-pointer">
                                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-4xl font-black text-indigo-600 overflow-hidden relative">
                                        {user.email?.charAt(0).toUpperCase()}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </div>

                                <h1 className="text-2xl font-black text-slate-900 mb-1">{user.full_name || 'Personalised User'}</h1>
                                <p className="text-slate-500 font-medium text-sm mb-4">{user.email}</p>

                                <div className="flex justify-center gap-2 mb-6">
                                    {user.role === 'seller' ? (
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <ShieldCheck size={12} /> VERIFIED SELLER
                                        </span>
                                    ) : (
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <User size={12} /> MEMBER
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Orders</p>
                                        <p className="text-lg font-black text-slate-800">{stats.totalOrders}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Member Since</p>
                                        <p className="text-lg font-black text-slate-800">{stats.memberSince}</p>
                                    </div>
                                </div>

                                <button onClick={() => router.push('/profile/edit')} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Need Help?</h4>
                                    <p className="text-indigo-100 text-xs font-medium mb-3">Our support team is here for you.</p>
                                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">Chat Now</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="flex-1 space-y-6">

                        {/* Stats Row */}
                        {!loading && user.role !== 'seller' && (
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard icon={Package} label="Active Orders" value={stats.activeOrders.toString()} color="text-indigo-600" bg="bg-indigo-50" />
                                <StatCard icon={Heart} label="Wishlist" value={stats.wishlistCount.toString()} color="text-pink-600" bg="bg-pink-50" />
                                {/* removed wallet card as requested */}
                            </div>
                        )}

                        {/* Seller Dashboard Link (If Seller) */}
                        {user.role === 'seller' && (
                            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all" onClick={() => router.push('/dashboard')}>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide mb-2 inline-block">Seller Zone</span>
                                        <h2 className="text-3xl font-black mb-2">Seller Dashboard</h2>
                                        <p className="text-slate-400 max-w-md">Manage your products, track orders, and view your earnings in one place.</p>
                                    </div>
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform border border-white/10">
                                        <ChevronRight size={32} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Menu Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Account Settings</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <MenuLink icon={Package} label="My Orders" subLabel="Track, return, or buy again" color="text-blue-600" bg="bg-blue-50" href="/orders" />
                                <MenuLink icon={MapPin} label="Addresses" subLabel="Manage delivery locations" color="text-orange-600" bg="bg-orange-50" href="/profile/addresses" />
                                <MenuLink icon={CreditCard} label="Payment Methods" subLabel="Saved cards & wallets" color="text-violet-600" bg="bg-violet-50" href="/profile/payments" />
                                <MenuLink icon={Bell} label="Notifications" subLabel="Offers, updates & news" color="text-yellow-600" bg="bg-yellow-50" href="/profile/notifications" />
                                <MenuLink icon={Settings} label="Account Security" subLabel="Password & 2FA" color="text-slate-600" bg="bg-slate-50" href="/profile/security" />
                                <MenuLink icon={Heart} label="My Wishlist" subLabel="Your saved items" color="text-pink-600" bg="bg-pink-50" href="/wishlist" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
