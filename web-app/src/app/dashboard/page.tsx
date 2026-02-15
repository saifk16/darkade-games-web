'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Package, ShoppingBag, Settings, LogOut,
    Plus, Search, Bell, ChevronRight, DollarSign,
    TrendingUp, Clock, CheckCircle, AlertCircle, Upload, Trash2, Loader2, ShieldCheck, Truck
} from 'lucide-react';
import SettingsView from '@/components/dashboard/SettingsView';

// Removed Hardcoded Tags - Now fetching from DB

export default function DashboardPage() {
    const [sellerStatus, setSellerStatus] = useState<string>('loading');
    const [storeName, setStoreName] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [blockReason, setBlockReason] = useState<string>('');
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState({
        revenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        totalEarnings: 0
    });

    const router = useRouter();

    // Form States (Add/Edit Product)
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Data for form
    const [collections, setCollections] = useState<any[]>([]);
    const [subCollections, setSubCollections] = useState<any[]>([]);
    const [availableSubCollections, setAvailableSubCollections] = useState<any[]>([]);

    // Dynamic Attributes
    const [occasionTags, setOccasionTags] = useState<any[]>([]);
    const [relationTags, setRelationTags] = useState<any[]>([]);

    const [productForm, setProductForm] = useState({
        name: '', price: '', discount_price: '',
        description: '',
        collection_id: '',
        sub_collection_id: '',
        sku: '', stock_quantity: '0',
        weight: '', dimensions: { length: '', width: '', height: '' },
        customization_options: [] as any[],
        imageFile: null as File | null, imageUrl: '',
        additionalImageFiles: [] as File[],
        additionalImageUrls: [] as string[],
        // New Fields
        preparation_time: '',
        moq: '1',
        customization_instructions: '',
        tags: '', // This is where the tags will be input as a string
        brand: '',
        status: 'pending'
    });

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [shippingLoading, setShippingLoading] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (!user) return;

        // Fetch initial notifications
        fetchNotifications();

        // Subscribe to realtime notifications
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotif = payload.new;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    // Optional: Play sound or show toast
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
    };




    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log("No user session found.");
            setSellerStatus('unauthenticated');
            setLoading(false);
            return;
        }

        // Check Seller Status
        const { data: sellerInfo, error: sellerError } = await supabase
            .from('seller_info')
            .select('seller_status, block_reason, onboarding_step, store_name, avatar_url')
            .eq('id', user.id)
            .single();

        if (sellerError && sellerError.code !== 'PGRST116') {
            console.error("Error fetching seller info:", sellerError);
        }

        if (sellerInfo) {
            if (sellerInfo.store_name) setStoreName(sellerInfo.store_name);
            if (sellerInfo.avatar_url) setAvatarUrl(sellerInfo.avatar_url);

            setSellerStatus(sellerInfo.seller_status);

            if (sellerInfo.seller_status === 'blocked') {
                setBlockReason(sellerInfo.block_reason || 'Violation of terms');
                setLoading(false);
                return;
            }
            if (sellerInfo.seller_status === 'rejected') {
                setLoading(false);
                return;
            }
            if (sellerInfo.seller_status !== 'approved') {
                setLoading(false);
                return;
            }
        } else {
            console.log("No seller info found for", user.id);
            setSellerStatus('unregistered');
            setLoading(false);
            return;
        }

        setUser(user);
        await fetchDashboardData(user.id);
        fetchMyProducts(user.id);
        fetchCollections();
    };

    const updateOrderStatus = async (itemId: number, newStatus: string) => {
        const { error } = await supabase
            .from('order_items')
            .update({ status: newStatus })
            .eq('id', itemId);

        if (error) alert("Failed to update status");
        else {
            // Optimistic Update
            setOrders(prev => prev.map(o => o.item_id === itemId ? { ...o, status: newStatus } : o));
        }
    };

    const handleShipItem = async (itemId: number) => {
        setShippingLoading(String(itemId));
        // Simulate API delay or actual shipping logic here
        // For now, just update status to Shipped
        try {
            const { error } = await supabase
                .from('order_items')
                .update({ status: 'Shipped' })
                .eq('id', itemId);

            if (error) throw error;

            setOrders(prev => prev.map(o => o.item_id === itemId ? { ...o, status: 'Shipped' } : o));
            // Optional: Show success toast
        } catch (error) {
            console.error("Shipping failed:", error);
            alert("Failed to ship item");
        } finally {
            setShippingLoading(null);
        }
    };

    const toggleTag = (tag: string) => {
        const currentTags = productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        if (currentTags.includes(tag)) {
            setProductForm({ ...productForm, tags: currentTags.filter(t => t !== tag).join(', ') });
        } else {
            setProductForm({ ...productForm, tags: [...currentTags, tag].join(', ') });
        }
    };


    // Filter sub-collections when collection changes
    useEffect(() => {
        if (productForm.collection_id) {
            const filtered = subCollections.filter(sc => sc.collection_id === productForm.collection_id);
            setAvailableSubCollections(filtered);
        } else {
            setAvailableSubCollections([]);
        }
    }, [productForm.collection_id, subCollections]);


    const fetchDashboardData = async (userId: string) => {
        // Fetch Orders
        const { data: orderData } = await supabase
            .from('order_items')
            .select('*, orders(*), products(*)')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });

        if (orderData) {
            const formattedOrders = orderData.map((item: any) => ({
                id: item.orders?.id.slice(0, 8).toUpperCase(),
                item_id: item.id,
                name: item.products?.name || 'Unknown Product',
                image: item.products?.image_url || '/placeholder.jpg',
                amount: item.price,
                status: item.status || 'Pending',
                date: new Date(item.created_at).toLocaleDateString(),
                items: item.quantity,
                customization: item.customization_details
            }));
            setOrders(formattedOrders);

            // Calc Stats
            const totalRevenue = orderData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const pending = orderData.filter(o => o.status === 'Pending').length;

            setStats(prev => ({
                ...prev,
                revenue: totalRevenue, // Available to withdraw (mock logic)
                totalEarnings: totalRevenue * 1.5, // Mock total
                totalOrders: orderData.length,
                pendingOrders: pending
            }));
        }
        setLoading(false);
    };

    const fetchMyProducts = async (userId: string) => {
        const { data } = await supabase.from('products').select('*').eq('seller_id', userId).order('created_at', { ascending: false });
        if (data) {
            setProducts(data);
            setStats(prev => ({ ...prev, totalProducts: data?.length || 0 }));
        }
    };

    const fetchCollections = async () => {
        const { data: cols } = await supabase.from('collections').select('*').order('name');
        setCollections(cols || []);

        const { data: subCols } = await supabase.from('sub_collections').select('*').order('name');
        setSubCollections(subCols || []);

        // Fetch Dynamic Attributes
        const { data: occ } = await supabase.from('occasions').select('label, is_active').eq('is_active', true);
        if (occ) setOccasionTags(occ.map(o => o.label));

        const { data: rel } = await supabase.from('relations').select('label, is_active').eq('is_active', true);
        if (rel) setRelationTags(rel.map(r => r.label));

        // Set default collection if available
        if (cols && cols.length > 0 && !productForm.collection_id) {
            setProductForm(prev => ({ ...prev, collection_id: cols[0].id }));
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/seller');
    };

    const handleImageUpload = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let mainImageUrl = productForm.imageUrl;
            const additionalUrls = [...productForm.additionalImageUrls];

            // 1. Upload Main Image
            if (productForm.imageFile) {
                mainImageUrl = await handleImageUpload(productForm.imageFile);
            }

            // 2. Upload Additional Images
            if (productForm.additionalImageFiles.length > 0) {
                for (const file of productForm.additionalImageFiles) {
                    const url = await handleImageUpload(file);
                    additionalUrls.push(url);
                }
            }

            const payload = {
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                discount_price: parseFloat(productForm.discount_price) || 0,
                collection_id: productForm.collection_id,
                sub_collection_id: productForm.sub_collection_id || null,
                sku: productForm.sku,
                stock_quantity: parseInt(productForm.stock_quantity),
                image_url: mainImageUrl,
                additional_images: additionalUrls,
                customization_options: productForm.customization_options,
                weight: parseFloat(productForm.weight) || 0,
                dimensions: productForm.dimensions,
                seller_id: user.id,
                // New Fields
                preparation_time: productForm.preparation_time,
                moq: parseInt(productForm.moq) || 1,
                customization_instructions: productForm.customization_instructions,
                tags: productForm.tags ? productForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                brand: productForm.brand,
                status: productForm.status
            };

            let productId = editId;

            if (isEditing && editId) {
                const { error } = await supabase.from('products').update(payload).eq('id', editId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('products').insert([payload]).select().single();
                if (error) throw error;
                productId = data.id;
            }

            // 4. Update Status in product_status_info
            const { error: statusError } = await supabase
                .from('product_status_info')
                .upsert({
                    id: productId,
                    status: productForm.status
                }, { onConflict: 'id' });

            if (statusError) throw statusError;

            // Reset Form
            setProductForm({
                name: '', price: '', discount_price: '', description: '',
                collection_id: collections[0]?.id || '', sub_collection_id: '',
                sku: '', stock_quantity: '0',
                weight: '', dimensions: { length: '', width: '', height: '' },
                customization_options: [], imageFile: null, imageUrl: '',
                additionalImageFiles: [], additionalImageUrls: [],
                preparation_time: '', moq: '1', customization_instructions: '', tags: '', brand: '', status: 'pending'
            });
            setIsEditing(false);
            setEditId(null);
            fetchMyProducts(user.id);
            setActiveTab('products');

        } catch (error: any) {
            alert(error.message || "Error saving product");
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product: any) => {
        setActiveTab('add-product');
        setIsEditing(true);
        setEditId(product.id);

        // Parse dimensions if string or object
        let dims = { length: '', width: '', height: '' };
        if (typeof product.dimensions === 'object') dims = product.dimensions;

        setProductForm({
            name: product.name,
            price: String(product.price),
            discount_price: String(product.discount_price || ''),
            description: product.description || '',
            collection_id: product.collection_id || '',
            sub_collection_id: product.sub_collection_id || '',
            sku: product.sku || '',
            stock_quantity: String(product.stock_quantity),
            weight: String(product.weight || ''),
            dimensions: dims,
            customization_options: product.customization_options || [],
            imageFile: null,
            imageUrl: product.image_url || '',
            additionalImageFiles: [],
            additionalImageUrls: product.additional_images || [],
            preparation_time: product.preparation_time || '',
            moq: product.moq ? String(product.moq) : '1',
            customization_instructions: product.customization_instructions || '',
            tags: product.tags ? product.tags.join(', ') : '',
            brand: product.brand || '',
            status: product.status || 'draft'
        });
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) fetchMyProducts(user.id);
    };


    if (loading || sellerStatus === 'loading') return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold"><Loader2 className="animate-spin mr-2" /> Loading Dashboard...</div>;

    if (sellerStatus === 'pending') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-slate-100">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Application Under Review</h2>
                    <p className="text-slate-500 mb-8">
                        Thanks for registering! Your seller account is currently pending approval. Our team will verify your details within 24 hours.
                    </p>
                    <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors mb-4">
                        Refresh Status
                    </button>
                    <button onClick={handleLogout} className="text-slate-400 font-bold text-sm hover:text-slate-600">
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    if (sellerStatus === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-slate-200">
                    <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogOut size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Session Expired</h2>
                    <p className="text-slate-500 mb-8">
                        Your session has expired or you are not logged in. Please log in again to access your dashboard.
                    </p>
                    <button onClick={() => router.push('/seller/login')} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        Login to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (sellerStatus === 'rejected') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Application Rejected</h2>
                    <p className="text-slate-500 mb-8">
                        Unfortunately, your seller application was not approved. Please contact support for more details or to re-apply.
                    </p>
                    <button onClick={handleLogout} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    if (sellerStatus === 'blocked') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-red-200">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Account Blocked</h2>
                    <p className="text-slate-500 mb-2">
                        Your seller account has been blocked by the administrator.
                    </p>
                    {/* Fetch and show block reason if available */}
                    <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm mb-8 text-left">
                        <span className="font-bold block mb-1">Reason:</span>
                        {blockReason}
                    </div>

                    <button onClick={handleLogout} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    if (sellerStatus === 'unregistered') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-indigo-100">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Complete Your Profile</h2>
                    <p className="text-slate-500 mb-8">
                        It seems you haven&apos;t completed your seller registration yet. Please finish setting up your account to start selling.
                    </p>
                    <button onClick={() => router.push('/seller/register')} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors mb-4">
                        Complete Registration
                    </button>
                    <button onClick={handleLogout} className="text-slate-400 font-bold text-sm hover:text-slate-600">
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F4F8] flex">
            {/* SIDEBAR */}
            <aside className={`bg-slate-900 text-white w-64 fixed h-full transition-transform z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} lg:translate-x-0`}>
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg"></div>
                    <span className="font-bold text-lg tracking-tight">SellerHub</span>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: stats.pendingOrders },
                        { id: 'products', label: 'My Products', icon: Package },
                        { id: 'add-product', label: 'Add Product', icon: Plus },
                        { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>
                            {item.badge ? <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span> : null}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={`flex-1 lg:ml-64 p-4 lg:p-8 transition-all`}>
                {/* TOP BAR */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">
                            {activeTab === 'overview' && 'Dashboard Overview'}
                            {activeTab === 'orders' && 'Order Management'}
                            {activeTab === 'products' && 'Product Listings'}
                            {activeTab === 'add-product' && (isEditing ? 'Edit Product' : 'Add New Product')}
                            {activeTab === 'wallet' && 'Financial Overview'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Welcome back, {storeName || user?.user_metadata?.full_name || 'Seller'} 👋
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-indigo-600 transition-colors relative"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                                        {/* {unreadCount} */}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                        <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllAsRead} className="text-[10px] font-bold text-indigo-600 hover:underline">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400">
                                                <p className="text-xs">No notifications yet.</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif: any) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                                                >
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                                                    <div>
                                                        <p className={`text-xs text-slate-800 ${!notif.is_read ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                        <p className="text-[8px] text-slate-400 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-2 border-t border-slate-50 text-center">
                                        <button onClick={() => setShowNotifications(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden transition-all hover:ring-2 hover:ring-indigo-100 cursor-pointer bg-slate-100"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-indigo-700 font-bold">
                                    {user?.email?.[0].toUpperCase()}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* DYNAMIC CONTENT */}
                <div className="space-y-6">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
                                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
                                    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-orange-500' },
                                    { label: 'Active Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color}`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Orders Preview */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                                    <button onClick={() => setActiveTab('orders')} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                        View All <ChevronRight size={16} />
                                    </button>
                                </div>
                                {orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.slice(0, 5).map((order, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <img src={order.image} alt={order.name} className="w-12 h-12 rounded-xl object-cover bg-slate-200" />
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{order.name}</h4>
                                                        <p className="text-xs text-slate-500">Ordered on {order.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-800">₹{order.amount}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-400">No orders yet.</div>
                                )}
                            </div>
                        </>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-800">Your Inventory</h3>
                                <button onClick={() => { setIsEditing(false); setProductForm({ ...productForm, status: 'draft' } as any); setActiveTab('add-product'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                                    <Plus size={16} /> Add Product
                                </button>
                            </div>

                            {/* Blocked/Rejected Alert Section */}
                            {products.filter(p => p.status === 'blocked' || p.status === 'rejected').length > 0 && (
                                <div className="mx-6 mt-6 bg-red-50 border border-red-100 rounded-2xl p-4">
                                    <h4 className="flex items-center gap-2 text-red-700 font-bold mb-3">
                                        <AlertCircle size={20} /> Attention Needed
                                    </h4>
                                    <div className="space-y-3">
                                        {products.filter(p => p.status === 'blocked' || p.status === 'rejected').map(p => (
                                            <div key={p.id} className="bg-white p-3 rounded-xl border border-red-100 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover bg-slate-200" alt={p.name} />
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                                                        <p className="text-xs text-red-600 font-medium">
                                                            {p.status === 'blocked' ? 'Blocked by Admin' : 'Rejected'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 mb-1 max-w-xs">{p.block_reason || "No reason provided."}</p>
                                                    <button
                                                        onClick={() => handleEditProduct(p)}
                                                        className="text-xs font-bold text-indigo-600 hover:underline"
                                                    >
                                                        Edit & Resubmit
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {products.map((p) => (
                                    <div key={p.id} className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all overflow-hidden relative">
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button onClick={() => handleEditProduct(p)} className="bg-white p-2 rounded-full shadow-sm text-indigo-600 hover:bg-indigo-50"><Settings size={14} /></button>
                                            <button onClick={() => deleteProduct(p.id)} className="bg-white p-2 rounded-full shadow-sm text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                                        </div>
                                        <div className="aspect-square bg-slate-50 relative overflow-hidden">
                                            <img src={p.image_url || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-slate-800 line-clamp-1 mb-1">{p.name}</h4>
                                            <div className="flex items-center justify-between">
                                                {p.discount_price > 0 ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-[#f43397] font-black text-sm">₹{p.discount_price}</p>
                                                        <p className="text-slate-400 text-xs line-through">₹{p.price}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-[#f43397] font-black text-sm">₹{p.price}</p>
                                                )}
                                                <p className={`text-[10px] font-bold mt-0.5 ${p.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Out of Stock'}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-start gap-1 mt-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    p.status === 'rejected' || p.status === 'blocked' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-orange-50 text-orange-600 border-orange-100'
                                                    }`}>
                                                    {p.status || 'Pending'}
                                                </span>
                                                {p.status === 'blocked' && p.block_reason && (
                                                    <p className="text-[10px] text-red-500 font-medium leading-tight">
                                                        Reason: {p.block_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Notifications</h3>
                                    <p className="text-sm text-slate-500">Stay updated with latest news and order updates.</p>
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors">
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="divide-y divide-slate-100">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Bell size={24} />
                                        </div>
                                        <h3 className="text-slate-900 font-bold mb-1">No notifications</h3>
                                        <p className="text-slate-500 text-sm">You&apos;re all caught up!</p>
                                    </div>
                                ) : (
                                    notifications.map((notif: any) => (
                                        <div
                                            key={notif.id}
                                            className={`p-6 hover:bg-slate-50 transition-colors group ${!notif.is_read ? 'bg-indigo-50/20' : ''}`}
                                        >
                                            <div className="flex gap-4 items-start">
                                                <div className={`mt-1.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                                    notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                                        notif.type === 'error' ? 'bg-red-100 text-red-600' :
                                                            'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {notif.type === 'success' ? <CheckCircle size={20} /> :
                                                        notif.type === 'warning' ? <AlertCircle size={20} /> :
                                                            notif.type === 'error' ? <AlertCircle size={20} /> :
                                                                <Bell size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-base text-slate-900 ${!notif.is_read ? 'font-bold' : 'font-semibold'}`}>
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                                            {new Date(notif.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        {!notif.is_read && (
                                                            <button
                                                                onClick={() => markAsRead(notif.id)}
                                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                            >
                                                                <CheckCircle size={14} /> Mark as read
                                                            </button>
                                                        )}
                                                        {/* Could add delete functionality here if API supported it */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && user && (
                        <SettingsView userId={user.id} />
                    )}

                    {/* ADD/EDIT PRODUCT TAB */}
                    {
                        activeTab === 'add-product' && (
                            <div className="max-w-7xl mx-auto">
                                <form onSubmit={handleProductSubmit} className="space-y-6">

                                    {/* Header Actions */}
                                    <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-10">
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                                            <p className="text-sm text-slate-500">Fill in the details below</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setProductForm({ ...productForm, status: productForm.status === 'draft' ? 'pending' : 'draft' })}
                                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${productForm.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-600'}`}
                                            >
                                                {productForm.status === 'draft' ? 'Save as Draft' : 'Submit for Approval'}
                                            </button>
                                            <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all">
                                                {loading ? 'Saving...' : (productForm.status === 'pending' ? 'Submit' : 'Save Draft')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                        {/* LEFT COLUMN (MAIN - 70% approx) */}
                                        <div className="lg:col-span-8 space-y-6">

                                            {/* Basic Details Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                                <h4 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-2 mb-2">Basic Information</h4>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2 md:col-span-1 space-y-1">
                                                        <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                                                        <input type="text" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="e.g. Neon Love Sign" />
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1 space-y-1">
                                                        <label className="text-xs font-bold text-slate-500 uppercase">SKU</label>
                                                        <input type="text" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="e.g. NEON-001" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                                    <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm h-40" placeholder="Describe your product..."></textarea>
                                                    <p className="text-[10px] text-slate-400 text-right">Rich text formatting coming soon.</p>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Occasions Selector */}
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Occasion (Select Multiple)</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {occasionTags.map(tag => {
                                                                const isSelected = productForm.tags.includes(tag);
                                                                return (
                                                                    <button
                                                                        key={tag}
                                                                        type="button"
                                                                        onClick={() => toggleTag(tag)}
                                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isSelected
                                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                                                            }`}
                                                                    >
                                                                        {tag}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Relations Selector */}
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Relation (Select Multiple)</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {relationTags.map(tag => {
                                                                const isSelected = productForm.tags.includes(tag);
                                                                return (
                                                                    <button
                                                                        key={tag}
                                                                        type="button"
                                                                        onClick={() => toggleTag(tag)}
                                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isSelected
                                                                            ? 'bg-pink-600 text-white border-pink-600 shadow-md transform scale-105'
                                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-pink-300'
                                                                            }`}
                                                                    >
                                                                        {tag}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Media Gallery Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                                <h4 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-2 mb-2">Media Gallery</h4>

                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Main Image */}
                                                    <div className="md:w-1/3">
                                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Main Image</label>
                                                        <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer relative flex flex-col items-center justify-center">
                                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setProductForm({ ...productForm, imageFile: e.target.files?.[0] || null })} />
                                                            {productForm.imageFile || productForm.imageUrl ? (
                                                                <img src={productForm.imageFile ? URL.createObjectURL(productForm.imageFile) : productForm.imageUrl} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                                                            ) : (
                                                                <>
                                                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2"><Upload size={24} /></div>
                                                                    <p className="text-xs font-bold text-slate-600">Upload Main</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Additional Images Grid */}
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gallery (Max 4)</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {[...Array(4)].map((_, i) => {
                                                                const numUrls = productForm.additionalImageUrls.length;
                                                                const numFiles = productForm.additionalImageFiles.length;
                                                                const isUrlSlot = i < numUrls;
                                                                const isFileSlot = i >= numUrls && i < (numUrls + numFiles);
                                                                const fileIndex = i - numUrls;

                                                                return (
                                                                    <div key={i} className="aspect-square border-2 border-dashed border-slate-200 rounded-xl relative hover:border-indigo-500 hover:bg-indigo-50/50 transition-all">
                                                                        {isFileSlot ? (
                                                                            <div className="absolute inset-0 p-1">
                                                                                <div className="w-full h-full relative rounded-lg overflow-hidden group">
                                                                                    <img src={URL.createObjectURL(productForm.additionalImageFiles[fileIndex])} className="w-full h-full object-cover" />
                                                                                    <button type="button" onClick={() => {
                                                                                        const newFiles = [...productForm.additionalImageFiles];
                                                                                        newFiles.splice(fileIndex, 1);
                                                                                        setProductForm({ ...productForm, additionalImageFiles: newFiles });
                                                                                    }} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm"><Trash2 size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (isUrlSlot ? (
                                                                            <div className="absolute inset-0 p-1">
                                                                                <div className="w-full h-full relative rounded-lg overflow-hidden group">
                                                                                    <img src={productForm.additionalImageUrls[i]} className="w-full h-full object-cover" />
                                                                                    <button type="button" onClick={() => {
                                                                                        const newUrls = [...productForm.additionalImageUrls];
                                                                                        newUrls.splice(i, 1);
                                                                                        setProductForm({ ...productForm, additionalImageUrls: newUrls });
                                                                                    }} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm"><Trash2 size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) setProductForm({ ...productForm, additionalImageFiles: [...productForm.additionalImageFiles, file] });
                                                                                }}
                                                                                    disabled={numUrls + numFiles >= 4}
                                                                                />
                                                                                <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none"><Plus size={20} /></div>
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Personalization Builder Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-slate-800">Personalization Fields</h4>
                                                        <p className="text-xs text-slate-400">Define what inputs the customer needs to fill.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProductForm({
                                                            ...productForm,
                                                            customization_options: [...productForm.customization_options, { id: crypto.randomUUID(), label: '', type: 'text', required: true }]
                                                        })}
                                                        className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                                                    >
                                                        <Plus size={14} /> Add Field
                                                    </button>
                                                </div>

                                                <div className="space-y-1 mb-4">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Instructions for Customer</label>
                                                    <input type="text" value={productForm.customization_instructions} onChange={e => setProductForm({ ...productForm, customization_instructions: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none text-sm" placeholder="e.g. Please upload a high-res photo..." />
                                                </div>

                                                <div className="space-y-3">
                                                    {productForm.customization_options.map((opt, idx) => (
                                                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-3 items-start md:items-center">
                                                            <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm border border-slate-100">{idx + 1}</span>

                                                            <input
                                                                type="text"
                                                                placeholder="Label (e.g. Name)"
                                                                value={opt.label}
                                                                onChange={(e) => {
                                                                    const newOpts = [...productForm.customization_options];
                                                                    newOpts[idx].label = e.target.value;
                                                                    setProductForm({ ...productForm, customization_options: newOpts });
                                                                }}
                                                                className="flex-1 p-2 bg-white rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500"
                                                            />

                                                            <select
                                                                value={opt.type}
                                                                onChange={(e) => {
                                                                    const newOpts = [...productForm.customization_options];
                                                                    newOpts[idx].type = e.target.value;
                                                                    setProductForm({ ...productForm, customization_options: newOpts });
                                                                }}
                                                                className="p-2 bg-white rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 w-32"
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="number">Number</option>
                                                                <option value="dropdown">Dropdown</option>
                                                                <option value="image">Image</option>
                                                                <option value="checkbox">Checkbox</option>
                                                                <option value="date">Date</option>
                                                            </select>

                                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none whitespace-nowrap">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={opt.required}
                                                                    onChange={(e) => {
                                                                        const newOpts = [...productForm.customization_options];
                                                                        newOpts[idx].required = e.target.checked;
                                                                        setProductForm({ ...productForm, customization_options: newOpts });
                                                                    }}
                                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                Req.
                                                            </label>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newOpts = productForm.customization_options.filter((_, i) => i !== idx);
                                                                    setProductForm({ ...productForm, customization_options: newOpts });
                                                                }}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {productForm.customization_options.length === 0 && (
                                                        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                                                            No custom fields added yet. Click &quot;Add Field&quot; to start.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>

                                        {/* RIGHT COLUMN (SIDEBAR - 30% approx) */}
                                        <div className="lg:col-span-4 space-y-6">

                                            {/* Pricing Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                                <h4 className="font-bold text-md text-slate-800 flex items-center gap-2"><DollarSign size={18} /> Pricing</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Price (₹)</label>
                                                        <input type="number" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none font-bold text-slate-900" placeholder="0" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Discount (₹)</label>
                                                        <input type="number" value={productForm.discount_price} onChange={e => setProductForm({ ...productForm, discount_price: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none font-bold text-slate-900" placeholder="0" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Inventory Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                                <h4 className="font-bold text-md text-slate-800 flex items-center gap-2"><Package size={18} /> Inventory</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Stock</label>
                                                        <input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none font-bold text-slate-900" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">MOQ</label>
                                                        <input type="number" value={productForm.moq} onChange={e => setProductForm({ ...productForm, moq: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none font-bold text-slate-900" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                                <h4 className="font-bold text-md text-slate-800 flex items-center gap-2"><TrendingUp size={18} /> Shipping</h4>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Prep Time</label>
                                                    <input type="text" value={productForm.preparation_time} onChange={e => setProductForm({ ...productForm, preparation_time: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none text-sm" placeholder="e.g. 2-3 Days" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Weight (kg)</label>
                                                        <input type="number" step="0.1" value={productForm.weight} onChange={e => setProductForm({ ...productForm, weight: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none text-sm" placeholder="0.5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Dims (LxWxH)</label>
                                                        <div className="flex gap-1">
                                                            <input type="number" placeholder="L" className="w-full p-1 bg-slate-50 rounded border-none text-xs" value={productForm.dimensions.length} onChange={e => setProductForm({ ...productForm, dimensions: { ...productForm.dimensions, length: e.target.value } })} />
                                                            <input type="number" placeholder="W" className="w-full p-1 bg-slate-50 rounded border-none text-xs" value={productForm.dimensions.width} onChange={e => setProductForm({ ...productForm, dimensions: { ...productForm.dimensions, width: e.target.value } })} />
                                                            <input type="number" placeholder="H" className="w-full p-1 bg-slate-50 rounded border-none text-xs" value={productForm.dimensions.height} onChange={e => setProductForm({ ...productForm, dimensions: { ...productForm.dimensions, height: e.target.value } })} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Organization Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                                <h4 className="font-bold text-md text-slate-800 flex items-center gap-2"><Settings size={18} /> Organization</h4>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Collection</label>
                                                    <select value={productForm.collection_id} onChange={e => setProductForm({ ...productForm, collection_id: e.target.value, sub_collection_id: '' })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none text-sm">
                                                        <option value="" disabled>Select Collection</option>
                                                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Sub-Collection</label>
                                                    <select value={productForm.sub_collection_id} onChange={e => setProductForm({ ...productForm, sub_collection_id: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none text-sm" disabled={!availableSubCollections.length}>
                                                        <option value="" disabled>Select Sub-Collection</option>
                                                        {availableSubCollections.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Brand</label>
                                                    <input type="text" value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none text-sm" placeholder="Your Brand" />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Additional Tags</label>
                                                    <input
                                                        type="text"
                                                        value={productForm.tags}
                                                        onChange={e => setProductForm({ ...productForm, tags: e.target.value })}
                                                        className="w-full p-2 bg-slate-50 rounded-lg border-none outline-none text-sm"
                                                        placeholder="gift, neon, love"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        )
                    }

                    {/* WALLET TAB */}
                    {
                        activeTab === 'wallet' && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Card */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                        <div>
                                            <p className="text-slate-400 font-medium mb-1">Available to Withdraw</p>
                                            <h2 className="text-5xl font-black tracking-tight">₹{stats.revenue.toLocaleString()}</h2>
                                            <p className="text-sm text-slate-500 mt-2 font-medium">Total Lifetime Earnings: ₹{stats.totalEarnings.toLocaleString()}</p>
                                        </div>
                                        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                            Withdraw Money
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="font-bold text-lg text-slate-800 mb-6">Transaction History</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                        <TrendingUp size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">Order Payout #ORD-775{i}</p>
                                                        <p className="text-xs text-slate-400">Today, 2:30 PM</p>
                                                    </div>
                                                </div>
                                                <span className="font-black text-green-600">+ ₹1,200</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* ORDERS TAB */}
                    {
                        activeTab === 'orders' && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-bold text-lg text-slate-800">All Orders</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="p-4 px-6">Item</th>
                                                <th className="p-4 px-6">Personalization</th>
                                                <th className="p-4 px-6">Order ID</th>
                                                <th className="p-4 px-6">Status</th>
                                                <th className="p-4 px-6">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {orders.map((order, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <img src={order.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm line-clamp-1">{order.name}</p>
                                                                <p className="text-xs text-slate-400">Qty: {order.items}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 px-6">
                                                        {order.customization && (Array.isArray(order.customization) || order.customization.text || order.customization.file_url) ? (
                                                            <div className="space-y-2">
                                                                {/* New Array Format */}
                                                                {Array.isArray(order.customization) && order.customization.map((c: any, idx: number) => (
                                                                    <div key={idx} className="flex flex-col gap-1">
                                                                        <span className="font-bold text-slate-500 uppercase text-[10px] break-all">{c.label}</span>

                                                                        {c.type === 'image' && c.value ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <a href={c.value} target="_blank" rel="noopener noreferrer" className="group relative block w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                    <img
                                                                                        src={c.value}
                                                                                        alt={c.label}
                                                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                                                    />
                                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                                                </a>
                                                                                <a href={c.value} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                                                    View <Upload size={10} />
                                                                                </a>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="font-medium text-slate-700 text-xs break-words">{c.value}</span>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {/* Legacy Support */}
                                                                {!Array.isArray(order.customization) && (
                                                                    <div className="flex flex-col gap-1">
                                                                        {order.customization.text && (
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="font-bold text-slate-500 uppercase text-[10px]">Note</span>
                                                                                <p className="font-medium text-slate-700 text-xs">&quot; {order.customization.text} &quot;</p>
                                                                            </div>
                                                                        )}
                                                                        {order.customization.file_url && (
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="font-bold text-slate-500 uppercase text-[10px]">Attachment</span>
                                                                                <a href={order.customization.file_url} target="_blank" className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                                                                                    <Upload size={12} /> View File
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No customization</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 px-6 font-bold text-indigo-600">{order.id}</td>
                                                    <td className="p-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => updateOrderStatus(order.item_id, e.target.value)}
                                                                className={`text-[10px] font-bold px-2 py-1 rounded-full border-none outline-none cursor-pointer ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Processing">Processing</option>
                                                                <option value="Shipped">Shipped</option>
                                                                <option value="Delivered">Delivered</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                            </select>

                                                            {order.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => handleShipItem(order.item_id)}
                                                                    disabled={shippingLoading === String(order.item_id)}
                                                                    className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                                >
                                                                    {shippingLoading === String(order.item_id) ? <Loader2 size={10} className="animate-spin" /> : <Truck size={10} />}
                                                                    Ship
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 px-6 font-bold text-slate-900">₹{order.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                </div >
            </main >
        </div >
    );
}
