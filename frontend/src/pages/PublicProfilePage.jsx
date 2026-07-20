import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Truck, Search, ShoppingBag, ShieldCheck, ClipboardCheck, ArrowRight, UserCircle, Calendar, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
    const { fmtPrice } = useOutletContext();
    const [searchParams] = useSearchParams();

    // Profile state (LocalStorage)
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        address: '',
        email: ''
    });
    const [editingProfile, setEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState({ name: '', phone: '', address: '', email: '' });

    // Order History state
    const [orderPhone, setOrderPhone] = useState(searchParams.get('phone') || '');
    const [orders, setOrders] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Load profile
    useEffect(() => {
        const saved = localStorage.getItem('customer_profile_defaults');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setProfile(parsed);
                setTempProfile(parsed);
                if (!orderPhone && parsed.phone) {
                    setOrderPhone(parsed.phone);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }, [orderPhone]);

    // Auto-search if phone query param is present
    useEffect(() => {
        const phoneParam = searchParams.get('phone');
        if (phoneParam) {
            fetchOrderHistory(phoneParam);
        }
    }, [searchParams]);

    const fetchOrderHistory = async (phoneToSearch) => {
        const num = phoneToSearch || orderPhone;
        if (!num.trim()) {
            toast.error('Please enter a phone number to track orders');
            return;
        }
        setHistoryLoading(true);
        setSearched(true);
        try {
            let apiBase = '';
            if (import.meta.env.VITE_API_URL) {
                apiBase = import.meta.env.VITE_API_URL;
            } else {
                const hostname = window.location.hostname;
                apiBase = (hostname === 'localhost' || hostname === '127.0.0.1') 
                    ? 'http://localhost:5005/api' 
                    : 'https://rush-jewels.onrender.com/api';
            }
            const res = await axios.get(`${apiBase}/public/orders/history?phone=${num.trim()}`);
            if (res.data?.success) {
                setOrders(res.data.data);
                if (res.data.data.length > 0) {
                    toast.success(`Found ${res.data.data.length} orders!`);
                } else {
                    toast.error('No orders found for this phone number.');
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load order history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        localStorage.setItem('customer_profile_defaults', JSON.stringify(tempProfile));
        setProfile(tempProfile);
        setEditingProfile(false);
        toast.success('Profile preferences updated!');
    };

    const getOrderStatusStep = (status, deliveryStatus) => {
        // Steps: 0 = Placed/Pending, 1 = Approved/Preparing, 2 = Shipped, 3 = Out for Delivery, 4 = Delivered
        if (status === 'cancelled') return -1;
        if (status === 'draft' || status === 'pending_approval') return 0;
        
        if (status === 'approved') {
            if (deliveryStatus === 'pending_handover' || deliveryStatus === 'pending') return 1;
            if (deliveryStatus === 'handed_to_delivery' || deliveryStatus === 'given_to_delivery') return 2;
            if (deliveryStatus === 'completed') return 4;
            return 1;
        }
        if (status === 'dispatched') return 2;
        if (status === 'delivered') return 3;
        if (status === 'completed') return 4;
        
        return 0;
    };

    const steps = [
        { label: 'Order Placed', desc: 'Pending validation' },
        { label: 'Approved', desc: 'Preparing in Treasury' },
        { label: 'In Transit', desc: 'Courier Handover' },
        { label: 'Out for Delivery', desc: 'Arrived at City' },
        { label: 'Delivered', desc: 'Completed' }
    ];

    const getStatusText = (status, deliveryStatus) => {
        if (status === 'cancelled') return 'Cancelled';
        const stepIdx = getOrderStatusStep(status, deliveryStatus);
        if (stepIdx === -1) return 'Cancelled';
        return steps[stepIdx].label;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            {/* Page Header */}
            <div className="text-center lg:text-left space-y-1">
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    My Account & Tracking
                </h1>
                <p className="text-slate-400 text-xs font-light">
                    Manage defaults and track live delivery status of your orders.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left panel: Profile Defaults */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold tracking-wider uppercase text-slate-800 dark:text-white flex items-center space-x-2">
                            <UserCircle size={16} className="text-amber-500" />
                            <span>My Profile Defaults</span>
                        </h2>
                        {!editingProfile && (
                            <button
                                onClick={() => setEditingProfile(true)}
                                className="text-[10px] font-bold text-amber-500 uppercase hover:underline"
                            >
                                Edit Settings
                            </button>
                        )}
                    </div>

                    {!editingProfile ? (
                        <div className="space-y-4 text-xs font-light">
                            {profile.name ? (
                                <>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Name</span>
                                        <span className="font-semibold text-slate-808 dark:text-slate-200">{profile.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone Number</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Default Address</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-relaxed">{profile.address}</span>
                                    </div>
                                    {profile.email && (
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.email}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-slate-450 italic py-2">No defaults saved. When you place an order, your profile settings will be saved here automatically for faster checkouts.</p>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={tempProfile.name}
                                    onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    value={tempProfile.phone}
                                    onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase">Default Address</label>
                                <input
                                    type="text"
                                    required
                                    value={tempProfile.address}
                                    onChange={(e) => setTempProfile(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase">Email Address</label>
                                <input
                                    type="email"
                                    value={tempProfile.email}
                                    onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setTempProfile(profile); setEditingProfile(false); }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-850"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Right panel: Order Tracking */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search box */}
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex-grow w-full relative">
                            <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Enter phone number to track orders (E.g. 0771234567)"
                                value={orderPhone}
                                onChange={(e) => setOrderPhone(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-mono"
                            />
                        </div>
                        <button
                            onClick={() => fetchOrderHistory(orderPhone)}
                            disabled={historyLoading}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2 shrink-0 active:scale-95 disabled:opacity-50"
                        >
                            <span>{historyLoading ? 'Searching...' : 'Track Orders'}</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Orders listing */}
                    {historyLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : searched && orders.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-900/20 border border-slate-205 dark:border-slate-900 rounded-3xl p-8">
                            <p className="text-slate-400 text-xs font-light">No online delivery orders found for this phone number.</p>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Order History ({orders.length} orders)</h3>
                            <div className="space-y-4">
                                {orders.map(o => {
                                    const stepIdx = getOrderStatusStep(o.status, o.deliveryStatus);
                                    const isCancelled = o.status === 'cancelled';
                                    const isSelected = selectedOrder?._id === o._id;

                                    return (
                                        <div 
                                            key={o._id}
                                            onClick={() => setSelectedOrder(isSelected ? null : o)}
                                            className={`p-5 bg-white dark:bg-slate-900/40 border ${
                                                isSelected ? 'border-amber-500/50 shadow-md' : 'border-slate-200/80 dark:border-slate-900'
                                            } rounded-2xl shadow-sm cursor-pointer hover:border-amber-500/30 transition-all duration-200`}
                                        >
                                            {/* Top info */}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{o.orderNumber}</span>
                                                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                                                        <Calendar size={11} />
                                                        <span>{new Date(o.createdAt).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </span>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <span className="font-black text-amber-500 text-sm block">{fmtPrice(o.grandTotal)}</span>
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                                        isCancelled 
                                                            ? 'bg-rose-500/10 text-rose-500' 
                                                            : o.status === 'completed' 
                                                            ? 'bg-emerald-500/10 text-emerald-500' 
                                                            : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {getStatusText(o.status, o.deliveryStatus)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Stepper display */}
                                            {!isCancelled && (
                                                <div className="pt-6 pb-2 grid grid-cols-5 relative items-center gap-1">
                                                    {/* line backer */}
                                                    <div className="absolute left-[10%] right-[10%] top-[40%] h-[2px] bg-slate-100 dark:bg-slate-800 -z-10" />
                                                    <div 
                                                        className="absolute left-[10%] top-[40%] h-[2px] bg-amber-500 -z-10 transition-all duration-500" 
                                                        style={{ width: `${(stepIdx / 4) * 80}%` }}
                                                    />

                                                    {steps.map((step, idx) => {
                                                        const active = idx <= stepIdx;
                                                        return (
                                                            <div key={step.label} className="flex flex-col items-center text-center space-y-2">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                                    active 
                                                                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                                                }`}>
                                                                    {idx === 4 ? '✓' : idx + 1}
                                                                </div>
                                                                <div className="hidden sm:block">
                                                                    <p className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-slate-800 dark:text-slate-205' : 'text-slate-400'}`}>{step.label}</p>
                                                                    <p className="text-[8px] text-slate-450 dark:text-slate-500 font-light mt-0.5">{step.desc}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Dropdown Items list */}
                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4 cursor-default"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Ordered Items</span>
                                                        <div className="divide-y divide-slate-50 dark:divide-slate-850">
                                                            {o.items.map((item, idx) => (
                                                                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                                                                    <div>
                                                                        <p className="font-semibold text-slate-800 dark:text-slate-300">{item.productName}</p>
                                                                        <p className="text-[10px] text-slate-400">Qty: {item.orderedQuantity} | Price: {fmtPrice(item.unitPrice)}</p>
                                                                    </div>
                                                                    <span className="font-bold text-slate-700 dark:text-white">{fmtPrice(item.lineTotal)}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {o.trackingNumber && (
                                                            <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-slate-950 border border-amber-500/10 text-xs flex justify-between items-center">
                                                                <div>
                                                                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Courier Tracker</span>
                                                                    <span className="font-bold font-mono text-slate-800 dark:text-slate-300">{o.deliveryService}: {o.trackingNumber}</span>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-amber-500 uppercase px-2 py-0.5 bg-amber-500/10 rounded-lg">In Transit</span>
                                                            </div>
                                                        )}

                                                        {(o.engravingText || o.giftWrap) && (
                                                            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl text-[10px] space-y-1 text-slate-500 leading-normal">
                                                                {o.engravingText && <p>✒️ <span className="font-bold uppercase">Custom Engraving:</span> "{o.engravingText}"</p>}
                                                                {o.giftWrap && <p>🎁 <span className="font-bold">Premium Gift Wrapping Applied</span></p>}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8">
                            <ShoppingBag className="mx-auto w-10 h-10 text-slate-300 dark:text-slate-800 mb-3" />
                            <p className="text-slate-400 text-xs font-light">Enter your phone number above to search and track online order states.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
