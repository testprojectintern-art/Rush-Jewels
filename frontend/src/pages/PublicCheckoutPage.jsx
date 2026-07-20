import { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, CheckCircle2, Truck, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SRI_LANKA_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
];

export default function PublicCheckoutPage() {
    const navigate = useNavigate();
    const { cart, clearCart, fmtPrice } = useOutletContext();

    // Form inputs
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [deliveryDistrict, setDeliveryDistrict] = useState('Colombo');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');
    const [engravingText, setEngravingText] = useState('');
    const [giftWrap, setGiftWrap] = useState(false);

    // States
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    // Autocomplete details from LocalStorage if they exist
    useEffect(() => {
        const savedProfile = localStorage.getItem('customer_profile_defaults');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                if (parsed.name) setName(parsed.name);
                if (parsed.phone) setPhone(parsed.phone);
                if (parsed.address) setAddress(parsed.address);
                if (parsed.email) setEmail(parsed.email);
            } catch (err) {
                console.error(err);
            }
        }
    }, []);

    // Redirect to catalog if cart is empty and order wasn't just placed
    useEffect(() => {
        if (cart.length === 0 && !orderSuccess) {
            navigate('/catalog');
        }
    }, [cart, orderSuccess, navigate]);

    // Calculate delivery cost based on district
    const getDeliveryCost = () => {
        if (deliveryDistrict === 'Colombo') return 250;
        if (deliveryDistrict === 'Kandy') return 350;
        return 450;
    };

    const giftWrapFee = giftWrap ? 250 : 0;

    const totals = cart.reduce((acc, item) => {
        let originalUnit = item.basePrice;
        let discountedUnit = item.basePrice;

        if (item.discountPrice > 0) {
            discountedUnit = item.discountPrice;
        } else if (item.discountPercent > 0) {
            discountedUnit = item.basePrice * (1 - item.discountPercent / 100);
        }

        const subtotal = originalUnit * item.qty;
        const total = discountedUnit * item.qty;

        acc.subtotal += subtotal;
        acc.grandTotal += total;
        acc.count += item.qty;

        return acc;
    }, { subtotal: 0, grandTotal: 0, count: 0 });

    const finalGrandTotal = totals.grandTotal + getDeliveryCost() + giftWrapFee;

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (!name || !phone || !address) {
            toast.error('Please fill in Name, Phone number, and Address details');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Submitting your order details to the salon...');
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

            // Build items format
            const orderItemsPayload = cart.map(item => ({
                productId: item._id,
                variationId: item.variationId,
                qty: item.qty
            }));

            const res = await axios.post(`${apiBase}/public/orders`, {
                name,
                phone: phone.trim(),
                address,
                email,
                items: orderItemsPayload,
                paymentMethod,
                deliveryDistrict,
                deliveryService: 'Domex Delivery',
                notes,
                engravingText,
                giftWrap
            });

            if (res.data?.success) {
                toast.success('Online order submitted successfully!', { id: toastId });
                
                // Save customer profile defaults
                localStorage.setItem('customer_profile_defaults', JSON.stringify({
                    name,
                    phone: phone.trim(),
                    address,
                    email
                }));

                setOrderSuccess(res.data.data);
                clearCart();
            }
        } catch (err) {
            console.error('Failed to submit order', err);
            const msg = err.response?.data?.message || 'Order submission failed';
            toast.error(msg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // If order was successfully placed
    if (orderSuccess) {
        return (
            <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-8">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-6"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={36} className="animate-pulse" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Order Placed Successfully!
                        </h2>
                        <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
                            Thank you for shopping at Rush Jewels. Your order has been registered and is pending review by our treasury team.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60 text-xs space-y-3 text-left">
                        <div className="flex justify-between">
                            <span className="text-slate-450 font-light">Order Number:</span>
                            <span className="font-bold text-slate-805 dark:text-white">{orderSuccess.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-450 font-light">Total Value:</span>
                            <span className="font-bold text-amber-500">{fmtPrice(orderSuccess.grandTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-450 font-light">Payment Method:</span>
                            <span className="font-semibold uppercase text-slate-700 dark:text-slate-300">{orderSuccess.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-450 font-light">Delivery District:</span>
                            <span className="font-semibold text-slate-750 dark:text-slate-300">{orderSuccess.deliveryDistrict}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => navigate(`/customer/profile?phone=${phone}`)}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-white font-bold text-xs uppercase tracking-widest shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
                        >
                            <Truck size={14} />
                            <span>Track Order Status</span>
                        </button>
                        <Link
                            to="/catalog"
                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 active:scale-95"
                        >
                            <span>Back to Catalog</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
            <div className="flex items-center space-x-3">
                <Link to="/cart" className="p-2.5 rounded-xl border border-slate-205 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Checkout Details</h1>
                    <p className="text-slate-400 text-xs font-light">Enter shipping details and customize final parameters.</p>
                </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Inputs panel */}
                <div className="lg:col-span-2 p-6 sm:p-8 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 rounded-3xl shadow-sm backdrop-blur-md space-y-6">
                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        <ClipboardCheck size={16} className="text-amber-500" />
                        <span>Billing & Shipping Information</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g., Dilum Perera"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone Number *</label>
                            <input
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="E.g., 0771234567"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Address */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Delivery Address *</label>
                            <input
                                type="text"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Line 1, Line 2, City"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="dilum@example.com"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* District */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Delivery District *</label>
                            <select
                                value={deliveryDistrict}
                                onChange={(e) => setDeliveryDistrict(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            >
                                {SRI_LANKA_DISTRICTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment Mode *</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            >
                                <option value="cod">Cash on Delivery (COD)</option>
                                <option value="bank_transfer">Bank Deposit / Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    {/* Customizations (Engraving / Gift wrapping) */}
                    <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-slate-950/50 border border-amber-500/10 space-y-4">
                        <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-500">Luxury Customization Options</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Ring/Pendant Engraving (E.g. "D & S 2026")</label>
                                <input
                                    type="text"
                                    maxLength={25}
                                    value={engravingText}
                                    onChange={(e) => setEngravingText(e.target.value)}
                                    placeholder="Enter engraving text (Max 25 chars)"
                                    className="w-full px-3 py-2 text-[11px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center space-x-2.5 pt-4">
                                <input
                                    type="checkbox"
                                    id="giftWrap"
                                    checked={giftWrap}
                                    onChange={(e) => setGiftWrap(e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                                />
                                <label htmlFor="giftWrap" className="font-semibold text-slate-700 dark:text-slate-350 cursor-pointer">
                                    Apply Premium Gift Wrapping (+LKR 250)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Delivery Notes</label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add specific instructions for delivery reps..."
                            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                    </div>
                </div>

                {/* Summary panel */}
                <div className="space-y-6">
                    <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 rounded-3xl shadow-sm backdrop-blur-md space-y-6">
                        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Items Review
                        </h2>

                        <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-56 overflow-y-auto pr-1">
                            {cart.map(item => (
                                <div key={`${item._id}-${item.variationId || 'none'}`} className="py-2.5 flex justify-between items-center gap-3 text-xs">
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate text-slate-800 dark:text-slate-250">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 font-light">Qty: {item.qty} {item.variationName && `| Option: ${item.variationName}`}</p>
                                    </div>
                                    <span className="font-bold text-amber-500 shrink-0">{fmtPrice(item.basePrice * item.qty)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-4">
                            <div className="flex justify-between">
                                <span className="font-light">Subtotal</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">LKR {totals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-light">Shipping Cost ({deliveryDistrict})</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">LKR {getDeliveryCost().toLocaleString()}</span>
                            </div>
                            {giftWrap && (
                                <div className="flex justify-between text-amber-500">
                                    <span>Gift Wrap Fee</span>
                                    <span className="font-bold">LKR 250</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Grand Total</span>
                            <span className="text-lg font-black text-amber-500 dark:text-amber-450">
                                {fmtPrice(finalGrandTotal)}
                            </span>
                        </div>

                        {paymentMethod === 'bank_transfer' && (
                            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-amber-500 leading-relaxed font-light">
                                <p className="font-bold uppercase tracking-wider mb-1">🏦 Bank Deposit Instructions</p>
                                <p>Please deposit LKR {finalGrandTotal.toLocaleString()} to: </p>
                                <p className="font-mono font-bold mt-1">Rush Jewels (Pvt) Ltd</p>
                                <p className="font-mono">Account: 1000-2345-6789 | Sampath Bank</p>
                                <p className="mt-1 text-[9px] text-slate-400">Please send a photo of the deposit slip/receipt to inquiries@rushjewels.lk or WhatsApp +94 77 123 4567 along with your Order Number after submission.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-white font-bold text-xs uppercase tracking-widest shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <CreditCard size={14} />
                            <span>{loading ? 'Processing Order...' : 'Confirm Order Placement'}</span>
                        </button>
                    </div>

                    {/* Security statement */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850/50 flex items-start space-x-3 text-[10px] leading-relaxed text-slate-500">
                        <ShieldCheck size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">Secure Order Channel</p>
                            <p className="font-light mt-0.5">Your personal information is encrypted and transmitted directly to the showroom registrar. We do not store financial details on this platform.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
