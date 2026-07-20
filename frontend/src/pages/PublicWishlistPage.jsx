import { useOutletContext, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Gem } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicWishlistPage() {
    const { wishlist, toggleWishlist, addToCart, fmtPrice } = useOutletContext();

    if (wishlist.length === 0) {
        return (
            <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                    <Heart size={24} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Your Wishlist is Empty
                    </h2>
                    <p className="text-slate-450 dark:text-slate-500 text-xs font-light">
                        Add items you love to your wishlist to track them here and easily move them to your shopping cart.
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
                    <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>My Wishlist</h1>
                    <p className="text-slate-400 text-xs font-light">Your curated catalog of favorite items.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {wishlist.map(product => {
                    let originalPrice = product.basePrice;
                    let percent = product.discountPercent || 0;
                    let discPrice = product.discountPrice || 0;

                    let currentPrice = originalPrice;
                    if (discPrice > 0) {
                        currentPrice = discPrice;
                    } else if (percent > 0) {
                        currentPrice = originalPrice * (1 - percent / 100);
                    }

                    const hasDiscount = percent > 0 || discPrice > 0;

                    return (
                        <div
                            key={product._id}
                            className="group flex flex-col justify-between bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition relative"
                        >
                            {/* delete */}
                            <button
                                onClick={() => toggleWishlist(product)}
                                className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                                title="Remove from Wishlist"
                            >
                                <Trash2 size={13} />
                            </button>

                            {/* discount tag */}
                            {hasDiscount && (
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[9px] font-bold shadow-md shadow-rose-500/10">
                                        -{percent}%
                                    </span>
                                </div>
                            )}

                            {/* image */}
                            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                                <img
                                    src={product.image || "/luxury_jewelry_placeholder.png"}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-103 transition"
                                />
                            </div>

                            {/* details */}
                            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                <div className="space-y-1.5">
                                    <span className="text-[9px] text-slate-400 font-mono tracking-wider block">SKU: {product.productCode}</span>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-900/60 flex items-end justify-between">
                                    <div>
                                        {hasDiscount && (
                                            <span className="text-[10px] text-slate-400 line-through block">LKR {originalPrice.toLocaleString()}</span>
                                        )}
                                        <span className="text-sm font-extrabold text-amber-500 dark:text-amber-450">{fmtPrice(currentPrice)}</span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            addToCart(product, 1);
                                            toggleWishlist(product);
                                        }}
                                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider transition active:scale-95 flex items-center space-x-1"
                                    >
                                        <ShoppingBag size={11} />
                                        <span>Move to Cart</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
