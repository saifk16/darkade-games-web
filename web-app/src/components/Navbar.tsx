'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, ShoppingCart, Menu, X, Bell, LayoutDashboard, Users } from 'lucide-react';

import { Suspense } from 'react';

function NavbarContent() {
    const pathname = usePathname();

    // Hide Navbar on Seller and Admin pages
    if (pathname?.startsWith('/seller') || pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
        return null;
    }

    return <NavbarInner />;
}

function NavbarInner() {
    const [cartCount, setCartCount] = useState(0);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        let channel: any;

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Initial Fetch
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }

            // Subscribe to realtime notifications for THIS user only
            channel = supabase
                .channel(`notifications:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('New notification received:', payload);
                        const newNotif = payload.new as any;
                        setNotifications(prev => [newNotif, ...prev]);
                        setUnreadCount(prev => prev + 1);

                        // Optional: Play sound or show toast here
                    }
                )
                .subscribe();
        };

        setupRealtime();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false); // Mark all unread as read

        if (!error) {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && unreadCount > 0) {
            markAsRead();
        }
    };

    const router = useRouter();
    const searchParams = useSearchParams();

    // Sync search input with URL
    useEffect(() => {
        const q = searchParams.get('search');
        if (q) setSearchTerm(q);
    }, [searchParams]);

    const updateCartCount = () => {
        const savedCart = JSON.parse(localStorage.getItem('personalised-cart') || '[]');
        setCartCount(savedCart.length);
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setUserRole(profile?.role || 'user');
            }
        };

        checkUser();
        updateCartCount();

        // Listen for events
        window.addEventListener('cart-updated', updateCartCount);
        window.addEventListener('storage', updateCartCount);

        // Auth state listener to update UI immediately on login/logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setIsLoggedIn(true);
                checkUser(); // Re-fetch role
            } else if (event === 'SIGNED_OUT') {
                setIsLoggedIn(false);
                setUserRole(null);
                setCartCount(0); // Optional: clear cart badge logic if needed
            }
        });

        return () => {
            window.removeEventListener('cart-updated', updateCartCount);
            window.removeEventListener('storage', updateCartCount);
            subscription.unsubscribe();
        };
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        // Update URL query param to allow pages to react
        // Debouncing could be added here for performance
        if (term) {
            router.push(`/?search=${encodeURIComponent(term)}`);
        } else {
            router.push('/');
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                <div className="flex items-center justify-between gap-4 md:gap-8">
                    {/* Left: Logo & Nav Links */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="group relative z-10">
                            <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tighter">
                                Personalised Wallah
                                <span className="text-pink-500 inline-block group-hover:-translate-y-1 transition-transform">.</span>
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                                Home
                            </Link>
                            <Link href="/collections" className="text-sm font-bold text-slate-700 hover:text-pink-600 transition-colors">
                                Collections
                            </Link>
                            <Link href="/shops" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                                Shops
                            </Link>
                        </nav>
                    </div>

                    {/* Middle: Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                {/* <Search size={18} /> */}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-full outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-sm text-slate-700"
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {/* Seller Link - Kept as icon only for neatness */}
                        {userRole === 'seller' && (
                            <Link href="/dashboard" className="p-2 text-slate-600 hover:text-indigo-600 rounded-full hover:bg-slate-100" title="Seller Dashboard">
                                <LayoutDashboard size={20} />
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <Link href="/profile" className="text-slate-600 hover:text-indigo-600 transition-colors">
                                <div className="flex flex-col items-center">
                                    <Users size={20} />
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                                    Login
                                </Link>
                                <Link href="/signup" className="text-sm font-bold text-white bg-indigo-700 hover:bg-indigo-600 px-4 py-1.5 rounded-full transition-colors shadow-sm hover:shadow-md">
                                    Signup
                                </Link>
                            </div>
                        )}

                        <Link href="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button onClick={toggleNotifications} className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors outline-none">
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                                        <h4 className="font-bold text-slate-800">Notifications</h4>
                                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-indigo-50/50' : ''}`}>
                                                    <p className="font-bold text-slate-800 text-sm mb-1">{n.title}</p>
                                                    <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function Navbar() {
    return (
        <Suspense fallback={null}>
            <NavbarContent />
        </Suspense>
    );
}
