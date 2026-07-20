import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicCartPage() {
    const navigate = useNavigate();
    const { cart, updateCartQty, removeFromCart, fmtPrice } = useOutletContext();

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
        const discount = subtotal - total;

        acc.subtotal += subtotal;
        acc.grandTotal += total;
        acc.savings += discount;
        acc.count += item.qty;

        return acc;
    }, { subtotal: 0, grandTotal: 0, savings: 0, count: 0 });

    if (cart.length === 0) {
        return (
            <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                    <ShoppingBag size={24} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Your Shopping Cart is Empty
                    </h2>
                    <p className="text-slate-450 dark:text-slate-500 text-xs font-light">
                        You haven't added any luxury pieces to your cart yet. Browse our collections to find your perfect match.
                    </p>
                </div>
                <Link
                    to="/catalog"
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest transition active:scale-95 shadow-md shadow-amber-500/10"
                >
                    <ArrowLeft size={14} />
                    <span>Go to Catalog</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
            <div className="flex items-center space-x-3">
                <Link to="/catalog" className="p-2.5 rounded-xl border border-slate-205 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Shopping Bag</h1>
                    <p className="text-slate-400 text-xs font-light">Review your selected pieces and customize parameters.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart list */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => {
                        const itemKey = `${item._id}-${item.variationId || 'none'}`;
                        let originalPrice = item.basePrice;
                        let percent = item.discountPercent || 0;
                        let discPrice = item.discountPrice || 0;

                        let currentPrice = originalPrice;
                        if (discPrice > 0) {
                            currentPrice = discPrice;
                        } else if (percent > 0) {
                            currentPrice = originalPrice * (1 - percent / 100);
                        }

                        const hasDiscount = percent > 0 || discPrice > 0;

                        return (
                            <motion.div
                                layout
                                key={itemKey}
                                className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 rounded-2xl flex gap-4 items-center shadow-sm relative"
                            >
                                {/* Image */}
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden shrink-0">
                                    <img
                                        src={item.image || "/luxury_jewelry_placeholder.png"}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-grow space-y-1.5 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {item.name}
                                        </h3>
                                        <button
                                            onClick={() => removeFromCart(item._id, item.variationId)}
                                            className="text-slate-400 hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 shrink-0"
                                            title="Remove Item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {item.variationName && (
                                        <span className="inline-block text-[9px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                            Option: {item.variationName}
                                        </span>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                                        {/* Qty controller */}
                                        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-200/50 dark:border-slate-850">
                                            <button
                                                onClick={() => updateCartQty(item._id, item.variationId, item.qty - 1)}
                                                className="text-slate-450 hover:text-slate-800 dark:hover:text-white transition"
                                            >
                                                <Minus size={11} />
                                            </button>
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-1.5">{item.qty}</span>
                                            <button
                                                onClick={() => updateCartQty(item._id, item.variationId, item.qty + 1)}
                                                className="text-slate-455 hover:text-slate-800 dark:hover:text-white transition"
                                            >
                                                <Plus size={11} />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            {hasDiscount && (
                                                <span className="text-[10px] text-slate-400 line-through block">LKR {(originalPrice * item.qty).toLocaleString()}</span>
                                            )}
                                            <span className="text-xs font-black text-amber-500 dark:text-amber-450">
                                                {fmtPrice(currentPrice * item.qty)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary panel */}
                <div className="space-y-6">
                    <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 rounded-3xl shadow-sm backdrop-blur-md space-y-6">
                        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Order Summary
                        </h2>

                        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-5">
                            <div className="flex justify-between">
                                <span className="font-light">Subtotal ({totals.count} articles)</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">LKR {totals.subtotal.toLocaleString()}</span>
                            </div>
                            {totals.savings > 0 && (
                                <div className="flex justify-between text-rose-500 bg-rose-500/5 px-2.5 py-1.5 rounded-lg border border-rose-500/10">
                                    <span className="flex items-center space-x-1.5">
                                        <Tag size={12} />
                                        <span>Treasury Discount Savings</span>
                                    </span>
                                    <span className="font-bold">-LKR {totals.savings.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-light">Shipping Cost</span>
                                <span className="text-[10px] uppercase font-bold text-slate-450 italic">Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline pt-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Est. Grand Total</span>
                            <span className="text-lg font-black text-amber-500 dark:text-amber-450">
                                {fmtPrice(totals.grandTotal)}
                            </span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-xs uppercase tracking-widest shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Guarantees banner */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850/50 flex items-start space-x-3 text-[10px] leading-relaxed text-slate-500">
                        <ShieldCheck size={16} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">Rush Jewels Luxury Promise</p>
                            <p className="font-light mt-0.5">Secure transit distribution, lifetime metal purity guarantee, and free GIA certificate verification lookup on all items.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
