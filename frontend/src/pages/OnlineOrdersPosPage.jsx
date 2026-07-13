import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, ShoppingCart, Trash2, ArrowLeft, Gem, MapPin, Plus, Minus, CreditCard, ChevronRight, LogOut } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const SRI_LANKA_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
];

const DELIVERY_SERVICES = [
    'Domex Delivery',
    'Domex COD Service',
    'Pronto Lanka',
    'Prompt Express',
    'Certis Lanka',
    'Courier Sri Lanka'
];

export default function OnlineOrdersPosPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form fields
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [deliveryDistrict, setDeliveryDistrict] = useState('Colombo');
    const [deliveryService, setDeliveryService] = useState('Domex Delivery');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [deliveryCharges, setDeliveryCharges] = useState(350);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
    const [fulfillmentWarehouse, setFulfillmentWarehouse] = useState('');
    const [warehouses, setWarehouses] = useState([]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch public products containing warehouse stock levels
                const prodRes = await api.get(`/public/products?portal=all&t=${Date.now()}`);
                if (prodRes.data?.success) {
                    setProducts(prodRes.data.data);
                }

                // Fetch bank accounts
                const bankRes = await api.get('/bank-accounts');
                if (bankRes.data?.success) {
                    const activeAccounts = bankRes.data.data.filter(b => b.isActive);
                    setBankAccounts(activeAccounts);
                    if (activeAccounts.length > 0) setSelectedBankAccountId(activeAccounts[0]._id);
                }

                // Fetch warehouses
                const whRes = await api.get('/warehouses');
                if (whRes.data?.success) {
                    const activeWhs = whRes.data.data.filter(w => w.isActive);
                    setWarehouses(activeWhs);
                    const defaultWh = activeWhs.find(w => w.isDefault) || activeWhs[0];
                    if (defaultWh) setFulfillmentWarehouse(defaultWh._id);
                }

            } catch (err) {
                console.error('Failed to load data for online POS', err);
                toast.error('Failed to load initial configuration data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchQuery.toLowerCase());

        if (!fulfillmentWarehouse) return matchesSearch;

        // Find stock for selected warehouse
        const warehouseStock = product.stocks?.find(s => s.warehouseId === fulfillmentWarehouse);
        if (!warehouseStock || warehouseStock.available <= 0) return false;

        // Check selected warehouse name to restrict by business portal
        const selectedWhObj = warehouses.find(w => w._id === fulfillmentWarehouse);
        if (selectedWhObj) {
            const whNameUpper = selectedWhObj.name.toUpperCase();
            if (whNameUpper.includes('KANDY')) {
                return matchesSearch && product.portal === 'kandy';
            } else if (whNameUpper.includes('MAIN')) {
                return matchesSearch && (product.portal === 'main' || !product.portal);
            }
        }
        return matchesSearch;
    });

    const addToCart = (product) => {
        // Use stock of the selected warehouse
        const whStock = product.stocks?.find(s => s.warehouseId === fulfillmentWarehouse);
        const available = whStock ? whStock.available : 0;
        
        if (available <= 0) {
            toast.error('Item is out of stock in the selected warehouse!');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                if (existing.qty >= available) {
                    toast.error(`Cannot add more. Only ${available} available in selected warehouse.`);
                    return prev;
                }
                return prev.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
            } else {
                return [...prev, { ...product, qty: 1 }];
            }
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item._id !== id) return item;
            const newQty = item.qty + delta;
            
            // Validate stock
            const whStock = item.stocks?.find(s => s.warehouseId === fulfillmentWarehouse);
            const available = whStock ? whStock.available : 0;

            if (newQty > available) {
                toast.error(`Max available stock is ${available} in selected warehouse.`);
                return item;
            }
            if (newQty <= 0) return null;
            return { ...item, qty: newQty };
        }).filter(Boolean));
    };

    const cartTotals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.qty * item.basePrice), 0);
        const charges = parseFloat(deliveryCharges) || 0;
        const grandTotal = subtotal + charges;
        return {
            subtotal,
            grandTotal,
            itemCount: cart.reduce((sum, item) => sum + item.qty, 0)
        };
    }, [cart, deliveryCharges]);

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        if (!customerName || !customerPhone || !customerAddress) {
            toast.error('Please fill in all customer details');
            return;
        }
        if (!fulfillmentWarehouse) {
            toast.error('Please select a fulfillment warehouse');
            return;
        }
        if (!selectedBankAccountId) {
            toast.error('Please select a payment bank/cash account');
            return;
        }

        const toastId = toast.loading('Placing online order...');
        try {
            // 1. Auto-create/find customer
            const customerRes = await api.post('/customers', {
                displayName: customerName,
                primaryContact: {
                    name: customerName,
                    phone: customerPhone
                },
                billingAddress: {
                    line1: customerAddress,
                    city: deliveryDistrict,
                    country: 'Sri Lanka'
                },
                customerType: 'individual',
                status: 'active'
            });

            const customerId = customerRes.data.data._id;

            // 2. Prepare sales order payload
            const payload = {
                customerId,
                sourceWarehouseId: fulfillmentWarehouse,
                source: 'pos', // triggers invoice creation
                status: 'approved', // auto-deducts stock
                items: cart.map(item => ({
                    productId: item._id,
                    orderedQuantity: item.qty,
                    unitPrice: item.basePrice,
                    discountPercent: 0
                })),
                shippingCost: parseFloat(deliveryCharges) || 0,
                deliveryDistrict,
                deliveryService,
                trackingNumber,
                bankAccountId: selectedBankAccountId,
                paymentMethod
            };

            const orderRes = await api.post('/sales-orders', payload);
            if (orderRes.data?.success) {
                toast.success('Online Order Placed successfully!', { id: toastId });
                setCart([]);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerAddress('');
                setTrackingNumber('');
                setDeliveryCharges(350);
            }
        } catch (err) {
            console.error('Failed to create online order', err);
            const msg = err.response?.data?.message || err.message || 'Order creation failed';
            toast.error(msg, { id: toastId });
        }
    };

    const fmt = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(n || 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => navigate('/portal-select')}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>Online Order POS Register</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono tracking-wide uppercase">
                                Portal Active
                            </span>
                        </h1>
                        <p className="text-[10px] text-slate-400">Place and manage web/online deliveries</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/online-orders/list')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center space-x-2"
                    >
                        <span>View Orders List</span>
                        <ChevronRight size={14} />
                    </button>
                    <button
                        onClick={() => {
                            useAuthStore.getState().logout();
                            navigate('/login');
                            toast.success('Logged out successfully');
                        }}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        title="Logout from System"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content split panel */}
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                
                {/* Left Side: Product catalog with warehouse-wise stock */}
                <div className="w-full lg:w-7/12 xl:w-8/12 p-6 flex flex-col space-y-6 overflow-y-auto">
                    {/* Search & Warehouse Selection */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search jewelry by name, brand, or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                            />
                        </div>
                        <div className="w-full sm:w-64 flex-shrink-0">
                            <select
                                value={fulfillmentWarehouse}
                                onChange={e => {
                                    setFulfillmentWarehouse(e.target.value);
                                    setCart([]);
                                    toast.success('Switched warehouse catalog. Cart reset.');
                                }}
                                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                            >
                                <option value="">Select Shipping Warehouse</option>
                                {warehouses.map(w => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                            <p className="text-slate-400 text-sm">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProducts.map(product => {
                                const totalStock = product.stocks?.reduce((s, i) => s + i.available, 0) || 0;
                                return (
                                    <div 
                                        key={product._id} 
                                        onClick={() => addToCart(product)}
                                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex-shrink-0">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={e => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/luxury_jewelry_placeholder.png";
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-grow">
                                                <span className="text-[9px] text-slate-400 font-mono tracking-wider block">{product.productCode}</span>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                                                    {product.name}
                                                </h4>
                                                <span className="text-xs font-bold text-amber-500">{fmt(product.basePrice)}</span>
                                            </div>
                                        </div>

                                        {/* Stocks breakdown */}
                                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[10px] space-y-1">
                                            <span className="font-bold text-slate-400 block mb-0.5">Stock by Warehouse:</span>
                                            {product.stocks?.map(s => (
                                                <div key={s.warehouseId} className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400">{s.warehouseName}</span>
                                                    <span className={s.available > 0 ? 'text-green-500 font-medium' : 'text-rose-500'}>
                                                        {s.available} available
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="pt-1 border-t border-slate-100 dark:border-slate-800/50 flex justify-between font-bold">
                                                <span className="text-slate-500">Total Stock</span>
                                                <span className={totalStock > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                                                    {totalStock} in stock
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Side: Cart and checkout form */}
                <div className="w-full lg:w-5/12 xl:w-4/12 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
                    <form onSubmit={handleSubmitOrder} className="p-6 flex flex-col space-y-6">
                        
                        {/* Cart Summary */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                                <ShoppingCart size={16} className="text-amber-500" />
                                <span>Order items ({cartTotals.itemCount})</span>
                            </h3>

                            {cart.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                                    Click products to add to cart
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                                            <div className="min-w-0 flex-grow pr-3">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                                                <span className="text-slate-400 font-mono text-[9px]">{item.productCode} - {fmt(item.basePrice)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => updateQty(item._id, -1)}
                                                    className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-6 text-center font-bold text-slate-800 dark:text-slate-200">{item.qty}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => updateQty(item._id, 1)}
                                                    className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Customer Form */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Customer Delivery Information</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter customer name"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="077XXXXXXX"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Address *</label>
                                    <textarea
                                        required
                                        rows={2}
                                        placeholder="Street name, house number, area"
                                        value={customerAddress}
                                        onChange={e => setCustomerAddress(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery Settings */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Delivery Parameters</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">District</label>
                                    <select
                                        value={deliveryDistrict}
                                        onChange={e => setDeliveryDistrict(e.target.value)}
                                        className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        {SRI_LANKA_DISTRICTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Service</label>
                                    <input
                                        type="text"
                                        list="delivery-services-list"
                                        placeholder="Type or select service..."
                                        value={deliveryService}
                                        onChange={e => setDeliveryService(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                    <datalist id="delivery-services-list">
                                        {DELIVERY_SERVICES.map(d => (
                                            <option key={d} value={d} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tracking Number</label>
                                    <input
                                        type="text"
                                        placeholder="Optional tracking #"
                                        value={trackingNumber}
                                        onChange={e => setTrackingNumber(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Charges</label>
                                    <input
                                        type="number"
                                        placeholder="350"
                                        value={deliveryCharges}
                                        onChange={e => setDeliveryCharges(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fulfillment and Payments Settings */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fulfillment & Payment</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Shipping Warehouse</label>
                                    <select
                                        value={fulfillmentWarehouse}
                                        onChange={e => setFulfillmentWarehouse(e.target.value)}
                                        className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        {warehouses.map(w => (
                                            <option key={w._id} value={w._id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                            className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            <option value="cod">Cash On Delivery (COD)</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cash / Bank Account</label>
                                        <select
                                            value={selectedBankAccountId}
                                            onChange={e => setSelectedBankAccountId(e.target.value)}
                                            className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            {bankAccounts.map(b => (
                                                <option key={b._id} value={b._id}>{b.accountName} ({b.bankName})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Totals Panel */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl mt-4 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-500">
                                <span>Items Subtotal</span>
                                <span>{fmt(cartTotals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Delivery Charges</span>
                                <span>{fmt(parseFloat(deliveryCharges) || 0)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800/80 pt-2">
                                <span>Total Amount</span>
                                <span className="text-amber-500">{fmt(cartTotals.grandTotal)}</span>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            type="submit"
                            className="w-full py-3.5 mt-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/10 hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            <CreditCard size={14} />
                            <span>Confirm & Place Online Order</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
