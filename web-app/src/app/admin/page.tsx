'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, ShieldCheck, Check, X,
    Loader2, DollarSign, LogOut, Trash2, Package, Eye,
    Bell, MessageSquare, Send, Folder, Layers,
    ChevronRight, ChevronDown, Plus, Upload, Lock, Shield
} from 'lucide-react';

interface Stats {
    total_users: number;
    total_sellers: number;
    total_orders: number;
    total_revenue: number;
}

interface Seller {
    id: string;
    company_name: string;
    full_name: string;
    email: string;
    instagram_id?: string;
    seller_status: string;
    block_reason?: string;
    // Extended properties for viewing details
    mobile?: string;
    city?: string;
    pincode?: string;
    business_category?: string;
    website?: string;
    kyc_url?: string;
    created_at?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    status: string;
    block_reason?: string;
    stock_quantity?: number;
    seller?: {
        company_name?: string;
        full_name?: string;
        email?: string;
    };
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    payment_status: string;
    transaction_id?: string;
    screenshot_url?: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

interface Payout {
    seller_id: string;
    seller_name: string;
    seller_email: string;
    total_amount: number;
    count: number;
}

interface Occasion {
    id: string;
    label: string;
    emoji: string;
    color: string;
}

interface Relation {
    id: string;
    label: string;
    emoji: string;
    color: string;
}

interface Collection {
    id: string;
    name: string;
    image_url?: string;
}

interface SubCollection {
    id: string;
    collection_id: string;
    name: string;
    image_url?: string;
}

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    gender?: string;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({ total_users: 0, total_sellers: 0, total_orders: 0, total_revenue: 0 });

    // Tab Data States
    const [pendingSellers, setPendingSellers] = useState<Seller[]>([]);
    const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    // Dynamic Attributes State
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [relations, setRelations] = useState<Relation[]>([]);
    const [newAttribute, setNewAttribute] = useState({ label: '', emoji: '', type: 'occasion' }); // type: 'occasion' | 'relation'

    // Collections State
    const [collections, setCollections] = useState<Collection[]>([]);
    const [subCollections, setSubCollections] = useState<SubCollection[]>([]);
    const [newCollection, setNewCollection] = useState<{ name: string, image_url: string, imageFile: File | null }>({ name: '', image_url: '', imageFile: null });
    const [newSubCollection, setNewSubCollection] = useState<{ name: string, image_url: string, collection_id: string, imageFile: File | null }>({ name: '', image_url: '', collection_id: '', imageFile: null });
    const [expandedCollectionId, setExpandedCollectionId] = useState<string | null>(null);

    // Block/Unblock State
    const [allSellers, setAllSellers] = useState<Seller[]>([]);
    const [allUsers, setAllUsers] = useState<Profile[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: string, type: 'seller' | 'product', name: string } | null>(null);
    const [blockReason, setBlockReason] = useState('');

    // View Seller Details State
    const [viewSeller, setViewSeller] = useState<Seller | null>(null);
    const [viewProduct, setViewProduct] = useState<Product | null>(null);

    // Notification State
    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        recipientType: 'all_users', // 'all_users' | 'all_sellers' | 'specific_user'
        specificEmail: ''
    });
    const [sendingNotification, setSendingNotification] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all' | 'approved' | 'blocked' | 'rejected' | 'pending'
    const [debugError, setDebugError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState('overview');

    // MFA State
    const [mfaEnrollmentData, setMfaEnrollmentData] = useState<any>(null);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [showMfaSetup, setShowMfaSetup] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                alert("ACCESS DENIED: Admins only.");
                router.push('/');
                return;
            }

            fetchData();
            checkMfaStatus();
            setLoading(false);
        };
        checkAdmin();
    }, [router]);

    const checkMfaStatus = async () => {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (data && data.totp.length > 0) {
            const verifiedFactor = data.totp.find(f => f.status === 'verified');
            if (verifiedFactor) setMfaEnabled(true);
        }
    };

    const handleEnableMfa = async () => {
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            issuer: 'Personalised Wallah Admin',
            friendlyName: 'Admin Account'
        });
        if (error) {
            alert('Error starting enrollment: ' + error.message);
            return;
        }
        setMfaEnrollmentData(data);
        setShowMfaSetup(true);
    };

    const handleVerifyMfaInfo = async () => {
        if (!mfaEnrollmentData) return;
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId: mfaEnrollmentData.id,
            code: mfaCode
        });
        if (error) {
            alert('Invalid code: ' + error.message);
            return;
        }
        setMfaEnabled(true);
        setShowMfaSetup(false);
        setMfaEnrollmentData(null);
        setMfaCode('');
        alert('2FA Enabled Successfully!');
    };

    const handleDisableMfa = async () => {
        if (!confirm("Are you sure you want to disable 2FA? This will lower your account security.")) return;

        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (!factors || factors.totp.length === 0) return;

        // Unenroll all TOTP factors
        for (const factor of factors.totp) {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }

        setMfaEnabled(false);
        alert('2FA Disabled.');
    };

    const fetchData = async () => {
        // Fetch Stats
        const { data: statsData } = await supabase.rpc('get_admin_stats');
        if (statsData && statsData.length > 0) {
            setStats(statsData[0]);
        }

        // Fetch All Users (non-admin)
        const { data: usersData } = await supabase
            .from('profiles')
            .select('*')
            .neq('role', 'admin')
            .neq('role', 'seller') // Exclude sellers from "All Users"
            .order('created_at', { ascending: false });

        if (usersData) {
            setAllUsers(usersData);
        }

        // Fetch Dynamic Attributes
        const { data: occData } = await supabase.from('occasions').select('*').order('created_at');
        if (occData) setOccasions(occData);

        const { data: relData } = await supabase.from('relations').select('*').order('created_at');
        if (relData) setRelations(relData);

        // Fetch Collections
        const { data: collData } = await supabase.from('collections').select('*').order('name');
        if (collData) setCollections(collData);

        const { data: subCollData } = await supabase.from('sub_collections').select('*').order('name');
        if (subCollData) setSubCollections(subCollData);

        // Fetch Pending Sellers from seller_info
        const { data: sellers } = await supabase
            .from('seller_info')
            .select('*, profiles(full_name, email, company_name)')
            .eq('seller_status', 'pending');

        if (sellers) {
            console.log("Pending Sellers Raw:", sellers);
        }

        // Transform to match interface
        const formattedSellers = sellers?.map((s: any) => ({
            id: s.id,
            company_name: s.profiles?.company_name || s.company_name || 'Unknown',
            full_name: s.profiles?.full_name || 'Unknown',
            email: s.profiles?.email || '',
            seller_status: s.seller_status
        })) || [];

        setPendingSellers(formattedSellers);

        // Fetch Pending Products from product_status_info
        const { data: statusInfo } = await supabase
            .from('product_status_info')
            .select(`
                status,
                products (
                    *,
                    profiles (
                        full_name,
                        email,
                        company_name
                    )
                )
            `)
            .eq('status', 'pending');

        const pendingProds = statusInfo?.map((info: any) => ({
            ...info.products,
            status: info.status,
            seller: info.products?.profiles // Map profiles to seller
        })) || [];

        setPendingProducts(pendingProds);

        // Fetch Pending UPI Orders
        const { data: orders } = await supabase
            .from('orders')
            .select('*, profiles(full_name, email)')
            .eq('payment_method', 'UPI')
            .eq('payment_status', 'Pending')
            .order('placed_at', { ascending: false });

        setPendingOrders(orders || []);

        // Fetch Recent Orders (All)
        const { data: recOrders } = await supabase
            .from('orders')
            .select('*, profiles(full_name, email)')
            .order('placed_at', { ascending: false })
            .limit(5);

        setRecentOrders(recOrders || []);

        // Fetch Pending Payouts
        const { data: items } = await supabase
            .from('order_items')
            .select(`
seller_earning,
    seller_id,
    profiles!orders_seller_id_fkey(
        full_name,
        email,
        company_name
    )
            `)
            .eq('status', 'Delivered')
            .eq('payout_status', 'pending');

        // Fetch All Sellers
        const { data: allSellersData, error: sellerError } = await supabase
            .from('seller_info')
            .select('*, profiles(full_name, email, company_name, role)')
            .order('created_at', { ascending: false });

        if (sellerError) {
            console.error("Error fetching all sellers:", sellerError);
            setDebugError("All Sellers: " + sellerError.message);
        }

        const formattedAllSellers = allSellersData
            ?.filter((s: any) => s.profiles?.role !== 'admin')
            .map((s: any) => ({
                id: s.id,
                company_name: s.profiles?.company_name || s.company_name || 'Unknown',
                full_name: s.profiles?.full_name || 'Unknown',
                email: s.profiles?.email || '',
                seller_status: s.seller_status,
                block_reason: s.block_reason,
                mobile: s.mobile,
                city: s.city,
                pincode: s.pincode,
                business_category: s.business_category,
                website: s.website,
                kyc_url: s.kyc_url,
                created_at: s.created_at
            })) || [];
        setAllSellers(formattedAllSellers);

        // Fetch All Products
        const { data: allProductsData } = await supabase
            .from('products')
            .select('*, profiles(full_name, company_name)')
            .order('created_at', { ascending: false });

        const formattedAllProds = allProductsData?.map((p: any) => ({
            ...p,
            seller: p.profiles
        })) || [];
        setAllProducts(formattedAllProds);

        // Note: Relation name 'profiles' might be tricky if multiple FKs exist. 
        // If the query above fails, change 'profiles!orders_seller_id_fkey' to just 'profiles' or correct relation name.
        // Assuming 'profiles' works based on previous successful queries or standard Supabase join.
        // Fallback to simple query if complex one fails in your environment.

        if (items) {
            const aggregated: Record<string, Payout> = {};
            items.forEach((item: any) => {
                const sId = item.seller_id;
                if (!sId) return;

                if (!aggregated[sId]) {
                    aggregated[sId] = {
                        seller_id: sId,
                        seller_name: item.profiles?.company_name || item.profiles?.full_name || 'Unknown',
                        seller_email: item.profiles?.email || '',
                        total_amount: 0,
                        count: 0
                    };
                }
                aggregated[sId].total_amount += (item.seller_earning || 0);
                aggregated[sId].count += 1;
            });
            setPendingPayouts(Object.values(aggregated));
        }
    };



    const handleApproval = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        const { error } = await supabase
            .from('seller_info') // Update seller_info, NOT profiles
            .update({ seller_status: status })
            .eq('id', id);

        if (error) {
            alert('Error updating status');
            console.error(error);
        } else {
            setPendingSellers(prev => prev.filter(s => s.id !== id));
            alert(`Seller ${status} successfully!`);
        }
    };

    const handleProductApproval = async (id: string, status: 'active' | 'rejected' | 'pending') => {
        try {
            const { error } = await supabase.rpc('approve_product', {
                p_id: id,
                p_status: status
            });

            if (error) throw error;

            setPendingProducts(prev => prev.filter(p => p.id !== id));
            alert(`Product ${status} successfully!`);
            fetchData();

        } catch (error: any) {
            alert('Error updating product: ' + error.message);
            console.error("Product Approval Error:", error);
        }
    };

    const handlePaymentAction = async (orderId: string, action: 'confirmed' | 'rejected') => {
        const { error } = await supabase
            .from('orders')
            .update({
                payment_status: action === 'confirmed' ? 'Confirmed' : 'Rejected',
                status: action === 'confirmed' ? 'Processing' : 'Cancelled'
            })
            .eq('id', orderId);

        if (error) {
            alert("Error updating payment status");
        } else {
            setPendingOrders(prev => prev.filter(o => o.id !== orderId));
            alert(`Payment ${action} successfully!`);
        }
    };

    const handleMarkPaid = async (sellerId: string) => {
        if (!confirm("Are you sure you want to mark all pending items for this seller as PAID?")) return;

        const { error } = await supabase
            .from('order_items')
            .update({
                payout_status: 'paid',
                payout_date: new Date().toISOString()
            })
            .eq('seller_id', sellerId)
            .eq('status', 'Delivered')
            .eq('payout_status', 'pending');

        if (error) {
            alert("Error updating payouts");
        } else {
            alert("Payout marked as successful!");
            fetchData();
        }
    };

    const handleAddAttribute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAttribute.label || !newAttribute.emoji) return alert("Please fill all fields");

        const table = newAttribute.type === 'occasion' ? 'occasions' : 'relations';
        const color = newAttribute.type === 'occasion' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'; // Default color

        const { error } = await supabase
            .from(table)
            .insert([{ label: newAttribute.label, emoji: newAttribute.emoji, color }]);

        if (error) {
            alert("Error adding attribute: " + error.message);
        } else {
            setNewAttribute({ label: '', emoji: '', type: newAttribute.type });
            fetchData();
        }
    };

    const handleDeleteAttribute = async (id: string, type: 'occasion' | 'relation') => {
        if (!confirm("Create users might be using this tag. Are you sure?")) return;
        const table = type === 'occasion' ? 'occasions' : 'relations';
        const { error } = await supabase.from(table).delete().eq('id', id);

        if (error) alert("Error deleting: " + error.message);
        else fetchData();
    };

    const uploadImage = async (file: File, bucket: string = 'collections') => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    };

    // Collections Handlers
    const handleAddCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollection.name) return;

        let imageUrl = newCollection.image_url;
        if (newCollection.imageFile) {
            try {
                imageUrl = await uploadImage(newCollection.imageFile);
            } catch (error: any) {
                alert("Error uploading image: " + error.message);
                return;
            }
        }

        const { error } = await supabase.from('collections').insert([{ name: newCollection.name, image_url: imageUrl }]);

        if (error) {
            alert("Error adding collection: " + error.message);
        } else {
            setNewCollection({ name: '', image_url: '', imageFile: null });
            fetchData();
        }
    };

    const handleDeleteCollection = async (id: string) => {
        if (!confirm("Delete this collection? All sub-collections will also be deleted.")) return;
        const { error } = await supabase.from('collections').delete().eq('id', id);

        if (error) alert("Error deleting: " + error.message);
        else fetchData();
    };

    const handleAddSubCollection = async (e: React.FormEvent, collectionId: string) => {
        e.preventDefault();
        if (!newSubCollection.name) return;

        let imageUrl = newSubCollection.image_url;
        if (newSubCollection.imageFile) {
            try {
                imageUrl = await uploadImage(newSubCollection.imageFile);
            } catch (error: any) {
                alert("Error uploading image: " + error.message);
                return;
            }
        }

        const { error } = await supabase.from('sub_collections').insert([{
            name: newSubCollection.name,
            image_url: imageUrl,
            collection_id: collectionId
        }]);

        if (error) {
            alert("Error adding sub-collection: " + error.message);
        } else {
            setNewSubCollection({ name: '', image_url: '', collection_id: '', imageFile: null });
            fetchData();
        }
    };

    const handleDeleteSubCollection = async (id: string) => {
        if (!confirm("Delete this sub-collection?")) return;
        const { error } = await supabase.from('sub_collections').delete().eq('id', id);

        if (error) alert("Error deleting: " + error.message);
        else fetchData();
    };

    const openBlockModal = (id: string, type: 'seller' | 'product', name: string) => {
        setSelectedItem({ id, type, name });
        setBlockReason('');
        setBlockModalOpen(true);
    };

    const handleBlock = async () => {
        if (!selectedItem || !blockReason) return alert("Please provide a reason.");

        const table = selectedItem.type === 'seller' ? 'seller_info' : 'products';
        const field = selectedItem.type === 'seller' ? 'seller_status' : 'status';

        const { error } = await supabase
            .from(table)
            .update({ [field]: 'blocked', block_reason: blockReason })
            .eq('id', selectedItem.id);

        if (error) {
            alert("Error blocking: " + error.message);
        } else {
            alert(`${selectedItem.type.toUpperCase()} Blocked!`);
            setBlockModalOpen(false);
            fetchData();
        }
    };

    const handleUnblock = async (id: string, type: 'seller' | 'product') => {
        if (!confirm("Are you sure you want to unblock?")) return;

        const table = type === 'seller' ? 'seller_info' : 'products';
        const field = type === 'seller' ? 'seller_status' : 'status';
        const status = type === 'seller' ? 'approved' : 'active'; // Default status after unblock

        const { error } = await supabase
            .from(table)
            .update({ [field]: status, block_reason: null })
            .eq('id', id);

        if (error) {
            alert("Error unblocking: " + error.message);
        } else {
            alert(`${type.toUpperCase()} Unblocked!`);
            fetchData();
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingNotification(true);

        try {
            const { title, message, recipientType, specificEmail } = notificationForm;
            let targetUserIds: string[] = [];

            if (recipientType === 'specific_user') {
                const { data: user, error } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', specificEmail)
                    .single();

                if (error || !user) throw new Error("User not found with that email.");
                targetUserIds = [user.id];
            } else if (recipientType === 'all_users') {
                // Send to all users
                const { error } = await supabase.from('notifications').insert(
                    allUsers.map(user => ({
                        user_id: user.id,
                        title: notificationForm.title,
                        message: notificationForm.message,
                        type: 'system',
                        is_read: false
                    }))
                );
                if (error) {
                    console.error('Error sending to all users:', error);
                    alert('Failed to send notifications.');
                } else {
                    alert('Notification sent to all users!');
                    setNotificationForm({ title: '', message: '', recipientType: 'all_users', specificEmail: '' });
                    setActiveTab('overview');
                }
            } else if (recipientType === 'all_sellers') {
                // Get all seller IDs
                const { data: sellers } = await supabase.from('seller_info').select('id');
                if (sellers) targetUserIds = sellers.map(s => s.id);
            } else {
                // This else block should ideally not be reached if recipientType is one of the defined values.
                // If it's meant for a general "all users" fallback, it's now handled by the 'all_users' block above.
                // Keeping it for now, but it might be redundant.
                const { data: users } = await supabase.from('profiles').select('id').limit(1000);
                if (users) targetUserIds = users.map(u => u.id);
            }

            // If targetUserIds were populated (for specific_user or all_sellers), send notifications
            if (targetUserIds.length > 0 && recipientType !== 'all_users') { // Avoid double sending for 'all_users'
                const notifications = targetUserIds.map(uid => ({
                    user_id: uid,
                    title,
                    message,
                    type: 'info',
                    is_read: false
                }));

                const { error: insertError } = await supabase
                    .from('notifications')
                    .insert(notifications);

                if (insertError) throw insertError;

                alert("Notification Sent!");
                setNotificationForm({ title: '', message: '', recipientType: 'all_users', specificEmail: '' });
            } else if (targetUserIds.length === 0 && recipientType !== 'all_users') {
                throw new Error("No recipients found.");
            }


        } catch (error: any) {
            alert("Failed to send: " + error.message);
        } finally {
            setSendingNotification(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-black flex items-center gap-2">
                        <ShieldCheck className="text-red-500" />
                        ADMIN<span className="text-slate-500">PANEL</span>
                    </h1>
                </div>
                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <LayoutDashboard size={20} /> Overview
                    </button>

                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Management</div>

                    <button onClick={() => setActiveTab('sellers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'sellers' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <Users size={20} />
                        Seller Approvals
                        {pendingSellers.length > 0 && <span className="ml-auto bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingSellers.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('all_users')}
                        className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 font-bold transition-all ${activeTab === 'all_users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-white/10'}`}
                    >
                        <Users size={20} />
                        All Users
                    </button>
                    <button
                        onClick={() => setActiveTab('all_sellers')}
                        className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 font-bold transition-all ${activeTab === 'all_sellers' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-white/10'}`}
                    >
                        <Users size={20} /> All Sellers
                    </button>

                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory</div>

                    <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <ShieldCheck size={20} />
                        Product Approvals
                        {pendingProducts.length > 0 && <span className="ml-auto bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingProducts.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('all_products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'all_products' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <Package size={20} /> All Products
                    </button>

                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Finance & Ops</div>

                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <Check size={20} />
                        UPI Verifications
                        {pendingOrders.length > 0 && <span className="ml-auto bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingOrders.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('payouts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'payouts' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <DollarSign size={20} />
                        Payouts
                        {pendingPayouts.length > 0 && <span className="ml-auto bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingPayouts.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('attributes')} className={`w - full flex items - center gap - 3 px - 4 py - 3 rounded - xl transition - all ${activeTab === 'attributes' ? 'bg-red-600 font-bold' : 'hover:bg-white/10 text-slate-400'} `}>
                        <LayoutDashboard size={20} />
                        Dynamic Tags
                    </button>
                    <button onClick={() => setActiveTab('collections')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'collections' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <Layers size={20} />
                        Collections
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <Bell size={20} />
                        Notifications
                    </button>

                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">System</div>

                    <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-indigo-600 font-bold' : 'hover:bg-white/10 text-slate-400'}`}>
                        <ShieldCheck size={20} />
                        Security
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-slate-400 text-left transition-all">
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">A</div>
                    </div>
                </header>

                <div className="p-8">
                    {debugError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <strong className="font-bold">Debug Error: </strong>
                            <span className="block sm:inline">{debugError}</span>
                        </div>
                    )}
                    {activeTab === 'all_sellers' && allSellers.length === 0 && !loading && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
                            No sellers found in the database. (Count: 0)
                        </div>
                    )}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-500 text-xs font-bold uppercase">Total Revenue</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-2">₹{stats.total_revenue?.toLocaleString() || 0}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-500 text-xs font-bold uppercase">Total Orders</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.total_orders || 0}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-500 text-xs font-bold uppercase">Total Sellers</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.total_sellers || 0}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-500 text-xs font-bold uppercase">Total Users</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.total_users || 0}</h3>
                            </div>

                            {/* Recent Activity */}
                            <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900">Recent Orders</h3>
                                    <button onClick={() => setActiveTab('all_users')} className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <tr>
                                                <th className="p-4">ID</th>
                                                <th className="p-4">Customer</th>
                                                <th className="p-4">Amount</th>
                                                <th className="p-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {recentOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-slate-50">
                                                    <td className="p-4 text-xs font-mono text-slate-500">#{order.id.slice(0, 8)}</td>
                                                    <td className="p-4 font-bold text-slate-900">{order.profiles?.full_name || 'Guest'}</td>
                                                    <td className="p-4 font-bold">₹{order.total_amount}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {recentOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-slate-400">No recent orders.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900">New Sellers</h3>
                                    <button onClick={() => setActiveTab('all_sellers')} className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <tr>
                                                <th className="p-4">Company</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {allSellers.slice(0, 5).map(seller => (
                                                <tr key={seller.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold text-slate-900">{seller.company_name}</td>
                                                    <td className="p-4 text-xs text-slate-500">{new Date(seller.created_at || '').toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${seller.seller_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {seller.seller_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {allSellers.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center text-slate-400">No sellers found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sellers' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">Pending Seller Requests</h3>
                            </div>
                            {pendingSellers.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    No pending requests at the moment.
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 px-6">Company</th>
                                            <th className="p-4 px-6">Applicant</th>
                                            <th className="p-4 px-6">Email</th>
                                            <th className="p-4 px-6">Instagram</th>
                                            <th className="p-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingSellers.map((seller) => (
                                            <tr key={seller.id} className="hover:bg-slate-50">
                                                <td className="p-4 px-6 font-bold text-slate-900">{seller.company_name}</td>
                                                <td className="p-4 px-6 text-slate-600">{seller.full_name}</td>
                                                <td className="p-4 px-6 text-slate-500">{seller.email}</td>
                                                <td className="p-4 px-6 text-indigo-600">{seller.instagram_id || '-'}</td>
                                                <td className="p-4 px-6 text-indigo-600">{seller.instagram_id || '-'}</td>
                                                <td className="p-4 px-6 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewSeller(seller)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(seller.id, 'rejected')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(seller.id, 'approved')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">Pending Product Approvals</h3>
                            </div>
                            {pendingProducts.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    No pending products at the moment.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {pendingProducts.map((product: any) => (
                                        <div key={product.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col h-full">
                                            <div className="aspect-square bg-white rounded-lg overflow-hidden mb-3 relative">
                                                {product.image_url ? (
                                                    <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold uppercase">No Image</div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm text-center">
                                                    Stock: {product.stock_quantity}
                                                </div>
                                            </div>

                                            <div className="mb-4 flex-1">
                                                <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h4>
                                                <p className="text-sm text-slate-500 mb-2 font-mono">₹{product.price}</p>

                                                {/* Seller Details Section */}
                                                <div className="bg-white p-3 rounded-lg border border-slate-100 mb-3 text-xs">
                                                    <p className="text-slate-400 font-bold uppercase tracking-wider mb-1">Seller</p>
                                                    <p className="font-bold text-slate-800">{product.seller?.company_name || product.seller?.full_name || 'Unknown'}</p>
                                                    <p className="text-slate-500 truncate">{product.seller?.email}</p>
                                                </div>

                                                <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                <button
                                                    onClick={() => handleProductApproval(product.id, 'rejected')}
                                                    className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleProductApproval(product.id, 'active')}
                                                    className="flex-1 py-2 text-white bg-slate-900 hover:bg-black rounded-lg font-bold text-sm transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">Pending UPI Verifications</h3>
                            </div>
                            {pendingOrders.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    No pending UPI verifications.
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 px-6">Order ID</th>
                                            <th className="p-4 px-6">Customer</th>
                                            <th className="p-4 px-6">Details</th>
                                            <th className="p-4 px-6">Evidence</th>
                                            <th className="p-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50">
                                                <td className="p-4 px-6 font-bold text-slate-900">{order.id}</td>
                                                <td className="p-4 px-6">
                                                    <p className="font-bold text-slate-800">{order.profiles?.full_name || 'Guest'}</p>
                                                    <p className="text-xs text-slate-500">{order.profiles?.email}</p>
                                                </td>
                                                <td className="p-4 px-6">
                                                    <p className="font-black text-slate-900">₹{order.total_amount}</p>
                                                    <p className="text-xs text-slate-500 font-mono">UTR: {order.transaction_id || 'N/A'}</p>
                                                </td>
                                                <td className="p-4 px-6">
                                                    {order.screenshot_url ? (
                                                        <a href={order.screenshot_url} target="_blank" className="text-indigo-600 font-bold hover:underline text-sm flex items-center gap-1">
                                                            View Receipt
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">No Upload</span>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handlePaymentAction(order.id, 'rejected')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                        title="Reject Payment"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePaymentAction(order.id, 'confirmed')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                                        title="Confirm Payment"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'payouts' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-800">Pending Payouts</h3>
                                <button className="text-sm font-bold text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50">Export CSV</button>
                            </div>
                            {pendingPayouts.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    No pending payouts found.
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 px-6">Seller</th>
                                            <th className="p-4 px-6">Pending Items</th>
                                            <th className="p-4 px-6">Total Amount</th>
                                            <th className="p-4 px-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingPayouts.map((payout, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="p-4 px-6">
                                                    <p className="font-bold text-slate-900">{payout.seller_name}</p>
                                                    <p className="text-xs text-slate-500">{payout.seller_email}</p>
                                                </td>
                                                <td className="p-4 px-6 font-medium text-slate-700">{payout.count} Items</td>
                                                <td className="p-4 px-6 font-black text-green-600 text-lg">₹{payout.total_amount.toLocaleString()}</td>
                                                <td className="p-4 px-6 text-right">
                                                    <button
                                                        onClick={() => handleMarkPaid(payout.seller_id)}
                                                        className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-black transition-colors"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'all_users' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-800">All Users</h3>
                                <div className="text-sm text-slate-500 font-medium">Total: {allUsers.length}</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 px-6">User</th>
                                            <th className="p-4 px-6">Role</th>
                                            <th className="p-4 px-6">Joined Date</th>
                                            <th className="p-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50">
                                                <td className="p-4 px-6">
                                                    <p className="font-bold text-slate-900">{user.full_name || 'N/A'}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </td>
                                                <td className="p-4 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'seller' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 px-6 text-sm text-slate-600">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 px-6 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setNotificationForm(prev => ({ ...prev, recipientType: 'specific_user', specificEmail: user.email }));
                                                            setActiveTab('notifications');
                                                        }}
                                                        className="text-indigo-600 font-bold hover:underline text-xs"
                                                    >
                                                        Send Message
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'all_sellers' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-800">All Sellers</h3>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-600 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="all">Every Seller</option>
                                    <option value="approved">Approved</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 px-6">Company</th>
                                            <th className="p-4 px-6">Contact</th>
                                            <th className="p-4 px-6">Status</th>
                                            <th className="p-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allSellers
                                            .filter(s => filterStatus === 'all' ? true : s.seller_status === filterStatus)
                                            .map(seller => (
                                                <tr key={seller.id} className="hover:bg-slate-50">
                                                    <td className="p-4 px-6 font-bold text-slate-900">{seller.company_name}</td>
                                                    <td className="p-4 px-6 text-sm">
                                                        <p className="font-bold">{seller.full_name}</p>
                                                        <p className="text-slate-500">{seller.email}</p>
                                                    </td>
                                                    <td className="p-4 px-6">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${seller.seller_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            seller.seller_status === 'blocked' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {seller.seller_status}
                                                        </span>
                                                        {seller.seller_status === 'blocked' && (
                                                            <p className="text-xs text-red-500 mt-1">{seller.block_reason}</p>
                                                        )}
                                                    </td>
                                                    <td className="p-4 px-6 text-right">
                                                        {seller.seller_status === 'approved' && (
                                                            <button onClick={() => handleApproval(seller.id, 'pending')} className="text-orange-500 font-bold hover:underline text-xs mr-3">Unapprove</button>
                                                        )}
                                                        {seller.seller_status === 'blocked' ? (
                                                            <button onClick={() => handleUnblock(seller.id, 'seller')} className="text-green-600 font-bold hover:underline text-xs mr-3">Unblock</button>
                                                        ) : (
                                                            <button onClick={() => openBlockModal(seller.id, 'seller', seller.company_name)} className="text-red-600 font-bold hover:underline text-xs mr-3">Block</button>
                                                        )}
                                                        <button onClick={() => setViewSeller(seller)} className="text-indigo-600 font-bold hover:underline text-xs">View Details</button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'all_products' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-800">All Products</h3>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-600 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="all">Every Product</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 px-6">Product</th>
                                            <th className="p-4 px-6">Seller</th>
                                            <th className="p-4 px-6">Price</th>
                                            <th className="p-4 px-6">Status</th>
                                            <th className="p-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allProducts
                                            .filter(p => filterStatus === 'all' ? true : p.status === filterStatus)
                                            .map(product => (
                                                <tr key={product.id} className="hover:bg-slate-50">
                                                    <td className="p-4 px-6 flex items-center gap-3">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">IMG</div>
                                                        )}
                                                        <span className="font-bold text-slate-900">{product.name}</span>
                                                    </td>
                                                    <td className="p-4 px-6 text-sm">
                                                        <p className="font-bold text-slate-800">{product.seller?.company_name || 'Unknown'}</p>
                                                    </td>
                                                    <td className="p-4 px-6 font-bold text-slate-900">₹{product.price}</td>
                                                    <td className="p-4 px-6">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${product.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            product.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {product.status}
                                                        </span>
                                                        {product.status === 'blocked' && (
                                                            <p className="text-xs text-red-500 mt-1">{product.block_reason}</p>
                                                        )}
                                                    </td>
                                                    <td className="p-4 px-6 text-right">
                                                        {product.status === 'blocked' ? (
                                                            <button onClick={() => handleUnblock(product.id, 'product')} className="text-green-600 font-bold hover:underline text-xs mr-3">Unblock</button>
                                                        ) : (
                                                            <button onClick={() => openBlockModal(product.id, 'product', product.name)} className="text-red-600 font-bold hover:underline text-xs mr-3">Block</button>
                                                        )}
                                                        <button onClick={() => setViewProduct(product)} className="text-indigo-600 font-bold hover:underline text-xs">View Details</button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl mx-auto">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <MessageSquare className="text-indigo-600" />
                                    Send Notification
                                </h3>
                            </div>
                            <div className="p-8">
                                <form onSubmit={handleSendNotification} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Title</label>
                                        <input
                                            required
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            placeholder="Important Update"
                                            value={notificationForm.title}
                                            onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Message</label>
                                        <textarea
                                            required
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium h-32 resize-none"
                                            placeholder="Draft your message here..."
                                            value={notificationForm.message}
                                            onChange={e => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Recipient</label>
                                        <select
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white"
                                            value={notificationForm.recipientType}
                                            onChange={e => setNotificationForm({ ...notificationForm, recipientType: e.target.value })}
                                        >
                                            <option value="all_users">All Users</option>
                                            <option value="all_sellers">All Sellers</option>
                                            <option value="specific_user">Specific User (Email)</option>
                                        </select>
                                    </div>

                                    {notificationForm.recipientType === 'specific_user' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-sm font-bold text-slate-700">User Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                                placeholder="user@example.com"
                                                value={notificationForm.specificEmail}
                                                onChange={e => setNotificationForm({ ...notificationForm, specificEmail: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={sendingNotification}
                                        className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendingNotification ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Notification</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                    {activeTab === 'attributes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Occasions */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-slate-800">Occasions</h3>
                                </div>
                                <div className="p-6 bg-slate-50 border-b border-slate-100">
                                    <form onSubmit={handleAddAttribute} className="flex gap-2">
                                        <input
                                            placeholder="Label (e.g. Diwali)"
                                            className="flex-1 p-2 rounded-lg border border-slate-200 text-sm"
                                            value={newAttribute.type === 'occasion' ? newAttribute.label : ''}
                                            onChange={e => setNewAttribute({ ...newAttribute, label: e.target.value, type: 'occasion' })}
                                        />
                                        <input
                                            placeholder="Emoji (🪔)"
                                            className="w-20 p-2 rounded-lg border border-slate-200 text-sm text-center"
                                            value={newAttribute.type === 'occasion' ? newAttribute.emoji : ''}
                                            onChange={e => setNewAttribute({ ...newAttribute, emoji: e.target.value, type: 'occasion' })}
                                        />
                                        <button type="submit" className="bg-slate-900 text-white px-4 rounded-lg font-bold text-sm">+</button>
                                    </form>
                                </div>
                                <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                                    {occasions.map(occ => (
                                        <div key={occ.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{occ.emoji}</span>
                                                <span className="font-bold text-slate-700">{occ.label}</span>
                                            </div>
                                            <button onClick={() => handleDeleteAttribute(occ.id, 'occasion')} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Relations */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-slate-800">Relations</h3>
                                </div>
                                <div className="p-6 bg-slate-50 border-b border-slate-100">
                                    <form onSubmit={handleAddAttribute} className="flex gap-2">
                                        <input
                                            placeholder="Label (e.g. Boss)"
                                            className="flex-1 p-2 rounded-lg border border-slate-200 text-sm"
                                            value={newAttribute.type === 'relation' ? newAttribute.label : ''}
                                            onChange={e => setNewAttribute({ ...newAttribute, label: e.target.value, type: 'relation' })}
                                        />
                                        <input
                                            placeholder="Emoji (👔)"
                                            className="w-20 p-2 rounded-lg border border-slate-200 text-sm text-center"
                                            value={newAttribute.type === 'relation' ? newAttribute.emoji : ''}
                                            onChange={e => setNewAttribute({ ...newAttribute, emoji: e.target.value, type: 'relation' })}
                                        />
                                        <button type="submit" className="bg-slate-900 text-white px-4 rounded-lg font-bold text-sm">+</button>
                                    </form>
                                </div>
                                <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                                    {relations.map(rel => (
                                        <div key={rel.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{rel.emoji}</span>
                                                <span className="font-bold text-slate-700">{rel.label}</span>
                                            </div>
                                            <button onClick={() => handleDeleteAttribute(rel.id, 'relation')} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COLLECTIONS TAB */}
                    {activeTab === 'collections' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
                            {/* Left Col: Collections List */}
                            <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Layers size={20} /> Collections</h3>
                                    <form onSubmit={handleAddCollection} className="space-y-3">
                                        <input
                                            placeholder="Collection Name"
                                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newCollection.name}
                                            onChange={e => setNewCollection({ ...newCollection, name: e.target.value })}
                                        />
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-full">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="collection-image-upload"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setNewCollection({ ...newCollection, imageFile: file, image_url: URL.createObjectURL(file) });
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="collection-image-upload"
                                                    className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                                >
                                                    {newCollection.imageFile ? (
                                                        <>
                                                            <span className="truncate max-w-[150px]">{newCollection.imageFile.name}</span>
                                                            <span className="text-emerald-500 text-xs font-bold">(Selected)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={16} /> Upload Image
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                            {newCollection.image_url && (
                                                <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                                                    <img src={newCollection.image_url} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2">
                                            <Plus size={16} /> Add Collection
                                        </button>
                                    </form>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {collections.length === 0 && <div className="text-center text-slate-400 text-sm p-4">No collections found.</div>}
                                    {collections.map(col => (
                                        <div
                                            key={col.id}
                                            onClick={() => setExpandedCollectionId(col.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-indigo-50 flex items-center justify-between group ${expandedCollectionId === col.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                                                    {col.image_url ? <img src={col.image_url} className="w-full h-full object-cover" /> : <Folder size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{col.name}</p>
                                                    <p className="text-[10px] text-slate-500">{subCollections.filter(sc => sc.collection_id === col.id).length} Sub-collections</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCollection(col.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-full transition-colors"><Trash2 size={14} /></button>
                                                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedCollectionId === col.id ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Col: Sub-Collections */}
                            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                                {expandedCollectionId ? (
                                    <>
                                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                    <span className="text-slate-400 font-medium">Collection:</span>
                                                    {collections.find(c => c.id === expandedCollectionId)?.name}
                                                </h3>
                                                <p className="text-xs text-slate-500">Manage sub-categories for this collection</p>
                                            </div>
                                        </div>
                                        <div className="p-6 border-b border-slate-100 bg-white">
                                            <form onSubmit={(e) => handleAddSubCollection(e, expandedCollectionId)} className="flex gap-3">
                                                <input
                                                    placeholder="Sub-Collection Name"
                                                    className="flex-1 p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                    value={newSubCollection.name}
                                                    onChange={e => setNewSubCollection({ ...newSubCollection, name: e.target.value })}
                                                />
                                                <div className="w-1/3 flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="sub-collection-image-upload"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setNewSubCollection({ ...newSubCollection, imageFile: file, image_url: URL.createObjectURL(file) });
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="sub-collection-image-upload"
                                                        className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                                    >
                                                        {newSubCollection.imageFile ? (
                                                            <span className="truncate">{newSubCollection.imageFile.name}</span>
                                                        ) : (
                                                            <Upload size={16} />
                                                        )}
                                                    </label>
                                                    {newSubCollection.image_url && (
                                                        <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                                                            <img src={newSubCollection.image_url} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="submit" className="bg-indigo-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                                                    Add
                                                </button>
                                            </form>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                                            {subCollections.filter(sc => sc.collection_id === expandedCollectionId).length === 0 && (
                                                <div className="col-span-2 text-center text-slate-400 py-12 border-2 border-dashed border-slate-100 rounded-xl">
                                                    No sub-collections yet. Add one above.
                                                </div>
                                            )}
                                            {subCollections.filter(sc => sc.collection_id === expandedCollectionId).map(sc => (
                                                <div key={sc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                                                            {sc.image_url ? <img src={sc.image_url} className="w-full h-full object-cover" /> : <Layers size={18} />}
                                                        </div>
                                                        <span className="font-bold text-slate-700">{sc.name}</span>
                                                    </div>
                                                    <button onClick={() => handleDeleteSubCollection(sc.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Folder size={40} className="text-slate-300" />
                                        </div>
                                        <p className="font-bold text-lg text-slate-500">Select a Collection</p>
                                        <p className="text-sm">Click on a collection from the left to manage its sub-collections.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Security Settings</h2>
                                <p className="text-slate-500 font-medium">Manage your account security and 2-Step Verification.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${mfaEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        2-Step Verification (2FA)
                                        {mfaEnabled && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide">Enabled</span>}
                                    </h3>
                                    <p className="text-slate-500 mt-2 leading-relaxed">
                                        Add an extra layer of security to your admin account by requiring a one-time code from your authenticator app (Google Authenticator, Authy, etc.) when logging in.
                                    </p>

                                    {!mfaEnabled && !showMfaSetup && (
                                        <button
                                            onClick={handleEnableMfa}
                                            className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                                        >
                                            <Shield size={18} />
                                            Enable 2FA
                                        </button>
                                    )}

                                    {mfaEnabled && (
                                        <button
                                            onClick={handleDisableMfa}
                                            className="mt-6 px-6 py-3 bg-white text-red-600 border border-slate-200 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-all flex items-center gap-2"
                                        >
                                            <Lock size={18} />
                                            Disable 2FA
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Setup Flow */}
                            {showMfaSetup && mfaEnrollmentData && (
                                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                                    <h4 className="font-bold text-slate-900 mb-4">Scan QR Code</h4>
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                                            {mfaEnrollmentData.totp.qr_code ? (
                                                <img src={mfaEnrollmentData.totp.qr_code} alt="QR Code" className="w-40 h-40" />
                                            ) : (
                                                <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">QR Loading...</div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <p className="text-sm text-slate-600">
                                                1. Open your authenticator app.<br />
                                                2. Scan the QR code.<br />
                                                3. Enter the 6-digit code below.
                                            </p>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="123456"
                                                    value={mfaCode}
                                                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="w-full text-center text-2xl tracking-[0.5em] font-black p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleVerifyMfaInfo}
                                                    disabled={mfaCode.length !== 6}
                                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Verify & Enable
                                                </button>
                                                <button
                                                    onClick={() => setShowMfaSetup(false)}
                                                    className="px-4 py-3 text-slate-500 font-bold hover:text-slate-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-slate-400 break-all text-center">
                                        Secret: {mfaEnrollmentData.totp.secret}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* View Seller Modal */}
            {viewSeller && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Users size={24} className="text-indigo-600" />
                                {viewSeller.company_name}
                            </h3>
                            <button onClick={() => setViewSeller(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/2 space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Business Details</p>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-sm font-bold text-slate-900 mb-1">{viewSeller.company_name}</p>
                                            <p className="text-xs text-slate-500 mb-2">Category: {viewSeller.business_category}</p>
                                            <p className="text-xs text-slate-500 mb-2">City: {viewSeller.city}, {viewSeller.pincode}</p>
                                            {viewSeller.website && <a href={viewSeller.website} target="_blank" className="text-xs text-indigo-600 hover:underline">Visit Website</a>}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Info</p>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-sm font-bold text-slate-900 mb-1">{viewSeller.full_name}</p>
                                            <p className="text-xs text-slate-500 mb-2">📞 {viewSeller.mobile}</p>
                                            <p className="text-xs text-slate-500 mb-2">✉️ {viewSeller.email}</p>
                                            <p className="text-xs text-indigo-600">@{viewSeller.instagram_id}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase ${viewSeller.seller_status === 'approved' ? 'bg-green-100 text-green-700' : viewSeller.seller_status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {viewSeller.seller_status}
                                            </span>
                                            {viewSeller.block_reason && <span className="text-xs text-red-500 self-center">{viewSeller.block_reason}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-1/2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">KYC Document</p>
                                    <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 min-h-[300px] flex items-center justify-center relative overflow-hidden group">
                                        {viewSeller.kyc_url ? (
                                            viewSeller.kyc_url.toLowerCase().endsWith('.pdf') ? (
                                                <div className="text-center">
                                                    <p className="font-bold text-slate-700 mb-2">PDF Document</p>
                                                    <a href={`https://vkrfslqopclpccoztztz.supabase.co/storage/v1/object/public/seller-documents/${viewSeller.kyc_url}`} target="_blank" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 inline-block">
                                                        Download / View PDF
                                                    </a>
                                                </div>
                                            ) : (
                                                <a href={`https://vkrfslqopclpccoztztz.supabase.co/storage/v1/object/public/seller-documents/${viewSeller.kyc_url}`} target="_blank">
                                                    <img
                                                        src={`https://vkrfslqopclpccoztztz.supabase.co/storage/v1/object/public/seller-documents/${viewSeller.kyc_url}`}
                                                        className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform"
                                                        alt="KYC Document"
                                                    />
                                                </a>
                                            )
                                        ) : (
                                            <p className="text-slate-400 font-bold">No Document Uploaded</p>
                                        )}
                                    </div>
                                    <p className="text-center text-xs text-slate-400 mt-2">Click image to view full size</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
                            {viewSeller.seller_status === 'pending' && (
                                <>
                                    <button onClick={() => { handleApproval(viewSeller.id, 'rejected'); setViewSeller(null); }} className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors">
                                        Reject Application
                                    </button>
                                    <button onClick={() => { handleApproval(viewSeller.id, 'approved'); setViewSeller(null); }} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                                        Approve Seller
                                    </button>
                                </>
                            )}
                            <button onClick={() => setViewSeller(null)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Product Modal */}
            {viewProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Package size={24} className="text-indigo-600" />
                                Product Details
                            </h3>
                            <button onClick={() => setViewProduct(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/2">
                                    <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                                        {viewProduct.image_url ? (
                                            <img src={viewProduct.image_url} alt={viewProduct.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase">No Image</div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name</p>
                                        <h4 className="text-lg font-bold text-slate-900">{viewProduct.name}</h4>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                                        <p className="text-2xl font-black text-slate-900">₹{viewProduct.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{viewProduct.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seller</p>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="font-bold text-slate-900">{viewProduct.seller?.company_name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{viewProduct.seller?.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase ${viewProduct.status === 'active' ? 'bg-green-100 text-green-700' : viewProduct.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {viewProduct.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
                            {viewProduct.status === 'active' && (
                                <button
                                    onClick={() => { handleProductApproval(viewProduct.id, 'rejected'); setViewProduct(null); }}
                                    className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors"
                                >
                                    Unapprove / Reject
                                </button>
                            )}
                            {viewProduct.status === 'pending' && (
                                <>
                                    <button onClick={() => { handleProductApproval(viewProduct.id, 'rejected'); setViewProduct(null); }} className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors">
                                        Reject
                                    </button>
                                    <button onClick={() => { handleProductApproval(viewProduct.id, 'active'); setViewProduct(null); }} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                                        Approve
                                    </button>
                                </>
                            )}
                            <button onClick={() => setViewProduct(null)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Modal */}
            {blockModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Block {selectedItem.type === 'seller' ? 'Seller' : 'Product'}</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            You are about to block <span className="font-bold text-slate-900">{selectedItem.name}</span>.
                            Please provide a reason for this action.
                        </p>
                        <textarea
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 h-32 resize-none"
                            placeholder="Reason for blocking..."
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setBlockModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleBlock} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">Confirm Block</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
