import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, RefreshCw, Truck, CheckCircle, XCircle, Search, Edit3, Save } from 'lucide-react';
import api from '../api/axios';

export default function OnlineOrdersListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [tempTracking, setTempTracking] = useState('');
    const [tempService, setTempService] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch sales orders. The backend authMiddleware filters by portal header automatically!
            const res = await api.get('/sales-orders');
            if (res.data?.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch online orders', err);
            toast.error('Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders
    const filteredOrders = orders.filter(o => {
        const text = (o.orderNumber + ' ' + (o.customerId?.displayName || '') + ' ' + (o.trackingNumber || '')).toLowerCase();
        return text.includes(searchQuery.toLowerCase());
    });

    const handleUpdateStatus = async (orderId, newStatus, trackingNum = '', serviceName = '') => {
        const toastId = toast.loading('Updating delivery status...');
        try {
            const res = await api.patch(`/sales-orders/${orderId}/delivery-status`, {
                deliveryStatus: newStatus,
                trackingNumber: trackingNum,
                deliveryService: serviceName
            });

            if (res.data?.success) {
                toast.success('Order delivery status updated successfully!', { id: toastId });
                fetchOrders();
                setShowModal(false);
                setSelectedOrder(null);
            }
        } catch (err) {
            console.error('Failed to update status', err);
            const msg = err.response?.data?.message || 'Update failed';
            toast.error(msg, { id: toastId });
        }
    };

    const openHandoverModal = (order) => {
        setSelectedOrder(order);
        setTempTracking(order.trackingNumber || '');
        setTempService(order.deliveryService || '');
        setShowModal(true);
    };

    const fmt = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(n || 0);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
            case 'pending_handover':
                return <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">Pending Handover</span>;
            case 'handed_to_delivery':
                return <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">In Transit</span>;
            case 'completed':
                return <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Delivered</span>;
            case 'returned':
                return <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">Returned</span>;
            default:
                return <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-500/10 text-slate-500 border border-slate-500/20">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => navigate('/online-orders/pos')}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Online Deliveries Tracker</h1>
                        <p className="text-[10px] text-slate-400">Manage handovers and tracking statuses</p>
                    </div>
                </div>

                <button
                    onClick={fetchOrders}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw size={16} />
                </button>
            </header>

            {/* List Panel */}
            <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-grow flex flex-col space-y-6">
                
                {/* Search controls */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by order #, customer, or tracking..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                {/* Orders table list */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                        <p className="text-slate-400 text-xs">No online delivery orders found.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="p-4">Order Info</th>
                                        <th className="p-4">Customer Details</th>
                                        <th className="p-4">Delivery & District</th>
                                        <th className="p-4">Method / Total</th>
                                        <th className="p-4">Tracking</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {filteredOrders.map(o => (
                                        <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                                            <td className="p-4">
                                                <span className="font-bold text-slate-900 dark:text-white block">{o.orderNumber}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{new Date(o.orderDate).toLocaleDateString('en-LK')}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{o.customerId?.displayName || 'Walk-in Customer'}</span>
                                                <span className="text-[10px] text-slate-400">{o.customerId?.primaryContact?.phone || ''}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="block font-medium">{o.deliveryService || 'Courier'}</span>
                                                <span className="text-[10px] text-slate-400">{o.deliveryDistrict || 'Sri Lanka'}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="block font-bold text-amber-500">{fmt(o.grandTotal)}</span>
                                                <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400">{o.paymentMethod || 'COD'}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
                                                    {o.trackingNumber || 'Not assigned'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(o.deliveryStatus || 'pending_handover')}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {(o.deliveryStatus === 'pending_handover' || o.deliveryStatus === 'pending' || !o.deliveryStatus) && (
                                                    <button
                                                        onClick={() => openHandoverModal(o)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-[10px] font-bold transition-all inline-flex items-center space-x-1"
                                                    >
                                                        <Truck size={10} />
                                                        <span>Handover to Courier</span>
                                                    </button>
                                                )}

                                                {o.deliveryStatus === 'handed_to_delivery' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(o._id, 'completed', o.trackingNumber)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-[10px] font-bold transition-all inline-flex items-center space-x-1"
                                                        >
                                                            <CheckCircle size={10} />
                                                            <span>Mark Delivered</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(o._id, 'returned', o.trackingNumber)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 text-[10px] font-bold transition-all inline-flex items-center space-x-1"
                                                        >
                                                            <XCircle size={10} />
                                                            <span>Returned</span>
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Handover Dialog / Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                                <Truck size={18} className="text-amber-500" />
                                <span>Courier Handover Details</span>
                            </h3>
                            <button 
                                onClick={() => { setShowModal(false); setSelectedOrder(null); }}
                                className="text-slate-400 hover:text-slate-600 text-sm"
                            >
                                Close
                            </button>
                        </div>
                        
                        <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Order:</span>
                                <span className="font-bold">{selectedOrder.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Customer:</span>
                                <span className="font-semibold">{selectedOrder.customerId?.displayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Courier Service:</span>
                                <span className="font-semibold">{selectedOrder.deliveryService}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Service</label>
                            <input
                                type="text"
                                list="modal-delivery-services-list"
                                placeholder="Type or select delivery service..."
                                value={tempService}
                                onChange={e => setTempService(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <datalist id="modal-delivery-services-list">
                                {['Domex Delivery', 'Pronto Lanka', 'Prompt Xpress', 'Koombiyo Delivery', 'Fardar Express', 'Certis Lanka'].map(d => (
                                    <option key={d} value={d} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tracking / Airway Bill (AWB) Number</label>
                            <input
                                type="text"
                                placeholder="Enter tracking number"
                                value={tempTracking}
                                onChange={e => setTempTracking(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                Note: Saving this will immediately update status to "In Transit" and trigger an SMS alert to the customer containing their tracking info and delivery service.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                onClick={() => { setShowModal(false); setSelectedOrder(null); }}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedOrder._id, 'handed_to_delivery', tempTracking, tempService)}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-semibold rounded-xl text-white shadow"
                            >
                                Dispatch & Send SMS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
