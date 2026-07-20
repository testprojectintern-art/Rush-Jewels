import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Gem, Heart, ShoppingBag, Phone, ShieldCheck, Award, X, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicCatalogPage() {
    const { fmtPrice, addToCart, toggleWishlist, isWishlisted, convertPrice } = useOutletContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [warehouses, setWarehouses] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Sync category URL param
    useEffect(() => {
        const catParam = searchParams.get('category');
        if (catParam) {
            setSelectedCategory(catParam);
        }
    }, [searchParams]);

    // Fetch public products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let apiBase = '';
                if (import.meta.env.VITE_API_URL) {
                    apiBase = import.meta.env.VITE_API_URL;
                } else {
                    const hostname = window.location.hostname;
                    if (hostname === 'localhost' || hostname === '127.0.0.1') {
                        apiBase = 'http://localhost:5005/api';
                    } else {
                        apiBase = 'https://rush-jewels.onrender.com/api';
                    }
                }

                const res = await axios.get(`${apiBase}/public/products?portal=all`);
                if (res.data?.success) {
                    const data = res.data.data;
                    setProducts(data);

                    // Extract unique warehouses from all product stocks
                    const warehouseSet = new Map();
                    data.forEach(p => {
                        p.stocks?.forEach(s => {
                            if (s.warehouseId) {
                                warehouseSet.set(s.warehouseId, s.warehouseName);
                            }
                        });
                    });
                    
                    const extracted = Array.from(warehouseSet.entries()).map(([id, name]) => ({
                        id,
                        name
                    }));
                    setWarehouses(extracted);
                }
            } catch (err) {
                console.error('Failed to fetch public catalog products', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Set default variation when product is selected
    useEffect(() => {
        if (selectedProduct) {
            if (selectedProduct.variations && selectedProduct.variations.length > 0) {
                setSelectedVariant(selectedProduct.variations[0]);
            } else {
                setSelectedVariant(null);
            }
        }
    }, [selectedProduct]);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        if (cat === 'all') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        setSearchParams(searchParams);
    };

    const categories = ['all', ...new Set(products.map(p => p.category?.toLowerCase()).filter(Boolean))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || 
            product.category?.toLowerCase() === selectedCategory;

        if (!matchesCategory) return false;

        if (selectedWarehouse === 'all') {
            return matchesSearch;
        } else {
            const warehouseStock = product.stocks?.find(s => s.warehouseId === selectedWarehouse);
            if (!warehouseStock || warehouseStock.available <= 0) return false;
            return matchesSearch;
        }
    });

    const getPriceDetails = (product, variant = null) => {
        let originalPrice = product.basePrice;
        let percent = product.discountPercent || 0;
        let discPrice = product.discountPrice || 0;

        if (variant) {
            originalPrice = variant.price || product.basePrice;
            percent = variant.discountPercent || 0;
            discPrice = variant.discountPrice || 0;
        }

        let currentPrice = originalPrice;
        if (discPrice > 0) {
            currentPrice = discPrice;
        } else if (percent > 0) {
            currentPrice = originalPrice * (1 - percent / 100);
        }

        return {
            originalPrice,
            currentPrice,
            hasDiscount: percent > 0 || discPrice > 0,
            percent: percent || Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        };
    };

    const getWhatsAppLink = (product, variant = null) => {
        const { currentPrice } = getPriceDetails(product, variant);
        const variantText = variant ? ` (Variant: ${variant.name})` : '';
        const msg = `Hello Rush Jewels! I am interested in inquiring about "${product.name}"${variantText} with Product Code: ${product.productCode}, priced at ${fmtPrice(currentPrice)}. Please let me know its availability.`;
        return `https://wa.me/94771234567?text=${encodeURIComponent(msg)}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
            {/* Header info */}
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Our Masterpiece Catalog
                </h1>
                <p className="text-slate-400 text-xs font-light">
                    Browse and customize rings, pendants, necklaces, and bangles with live showroom stock.
                </p>
            </div>

            {/* Filter controls */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
                {/* Search */}
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by SKU, code, name or collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-light"
                    />
                </div>

                {/* Warehouse */}
                <div className="relative w-full md:w-64 flex items-center space-x-3">
                    <MapPin className="text-amber-500 shrink-0" size={16} />
                    <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs font-semibold cursor-pointer"
                    >
                        <option value="all">📍 All Showrooms Stock</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>Showroom: {w.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Categories scroll menu */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-900/50 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border shrink-0 ${
                            selectedCategory === cat
                                ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:border-amber-500/40 hover:text-amber-500'
                        }`}
                    >
                        {cat === 'all' ? 'All Collections' : cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-24 space-y-3">
                    <div className="w-9 h-9 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-xs tracking-wider animate-pulse">Accessing the vault...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-900 rounded-3xl p-12">
                    <Gem className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-800 mb-4" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-355" style={{ fontFamily: "'Playfair Display', serif" }}>
                        No items found
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-1 max-w-xs mx-auto leading-relaxed">
                        We couldn't locate any products matching your active search filters. Try toggling other showrooms or categories.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {filteredProducts.map((product) => {
                            const { originalPrice, currentPrice, hasDiscount, percent } = getPriceDetails(product);
                            const inStock = product.stocks?.some(s => s.available > 0) ?? false;
                            const isWish = isWishlisted(product._id);

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.3 }}
                                    key={product._id}
                                    onClick={() => setSelectedProduct(product)}
                                    className="group flex flex-col justify-between bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/20 cursor-pointer transition-all duration-300 hover:-translate-y-1 relative"
                                >
                                    {/* stock tag */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide backdrop-blur-md border ${
                                            inStock ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                        }`}>
                                            <span className={`w-1 h-1 rounded-full ${inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            <span>{inStock ? 'In Stock' : 'Out of Stock'}</span>
                                        </span>
                                    </div>

                                    {/* discount percent tag */}
                                    {hasDiscount && (
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[9px] font-bold shadow-md shadow-rose-500/10">
                                                -{percent}%
                                            </span>
                                        </div>
                                    )}

                                    {/* product image */}
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                                        <img
                                            src={product.image || "/luxury_jewelry_placeholder.png"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800">
                                            <span className="text-[9px] font-semibold text-slate-400 tracking-wider font-mono uppercase">
                                                {product.brand}
                                            </span>
                                        </div>
                                    </div>

                                    {/* details */}
                                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                                                <span>Code: {product.productCode}</span>
                                                {product.warrantyPeriod > 0 && (
                                                    <span className="text-[8px] font-bold text-amber-500 px-1 bg-amber-500/10 rounded">
                                                        {product.warrantyPeriod}M Warranty
                                                    </span>
                                                )}
                                            </div>
                                            <h3 
                                                className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition"
                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                            >
                                                {product.name}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {product.description || 'Exquisitely crafted luxury jewelry article.'}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-900/60 flex items-end justify-between">
                                            <div>
                                                {hasDiscount && (
                                                    <span className="text-[10px] text-slate-400 line-through block">LKR {originalPrice.toLocaleString()}</span>
                                                )}
                                                <span className="text-sm font-extrabold text-amber-500 dark:text-amber-450">{fmtPrice(currentPrice)}</span>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 transition active:scale-90 bg-white dark:bg-slate-950"
                                                >
                                                    <Heart size={13} className={isWish ? "fill-rose-500 text-rose-500" : ""} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                                                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition active:scale-90"
                                                >
                                                    <ShoppingBag size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Jewelry Details Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.94, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.94, y: 20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
                        >
                            {/* Close */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition shadow-sm"
                            >
                                <X size={15} />
                            </button>

                            {/* Image Left */}
                            <div className="w-full md:w-1/2 aspect-square bg-slate-50 dark:bg-slate-950 relative">
                                <img
                                    src={selectedProduct.image || "/luxury_jewelry_placeholder.png"}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800">
                                    <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-mono">
                                        {selectedProduct.brand}
                                    </span>
                                </div>
                            </div>

                            {/* Details Right */}
                            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-6 overflow-y-auto md:overflow-visible">
                                <div className="space-y-4">
                                    {/* sku & warranty */}
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                        <span>SKU: {selectedProduct.productCode}</span>
                                        {selectedProduct.warrantyPeriod > 0 && (
                                            <span className="inline-flex items-center space-x-1 text-amber-500 font-bold uppercase">
                                                <Award size={10} />
                                                <span>{selectedProduct.warrantyPeriod}M Warranty</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* name */}
                                    <h2 
                                        className="text-xl font-bold text-slate-900 dark:text-white leading-tight"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        {selectedProduct.name}
                                    </h2>

                                    {/* collection name */}
                                    <span className="inline-block text-[8px] tracking-widest uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        Collection: {selectedProduct.category}
                                    </span>

                                    {/* Product description */}
                                    <p className="text-[11px] text-slate-550 dark:text-slate-350 leading-relaxed font-light">
                                        {selectedProduct.description || 'Exquisitely crafted luxury jewelry article engineered for maximum visual excellence and comfort.'}
                                    </p>

                                    {/* Variant Selector (e.g. Ring Size or Metal Weight) */}
                                    {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Select Variant / Option:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProduct.variations.map((v) => (
                                                    <button
                                                        key={v._id}
                                                        onClick={() => setSelectedVariant(v)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                                            selectedVariant?._id === v._id
                                                                ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                                                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:border-amber-500/30'
                                                        }`}
                                                    >
                                                        {v.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Displayed Price */}
                                    <div className="py-3 border-y border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Consolidated Price</span>
                                        <div className="text-right">
                                            {getPriceDetails(selectedProduct, selectedVariant).hasDiscount && (
                                                <span className="text-xs text-slate-400 line-through block">LKR {getPriceDetails(selectedProduct, selectedVariant).originalPrice.toLocaleString()}</span>
                                            )}
                                            <span className="text-xl font-black text-amber-500 dark:text-amber-450">
                                                {fmtPrice(getPriceDetails(selectedProduct, selectedVariant).currentPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Showrooms Stock availability */}
                                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 text-xs">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Showroom Availability</span>
                                    <div className="space-y-1.5">
                                        {selectedProduct.stocks && selectedProduct.stocks.length > 0 ? (
                                            selectedProduct.stocks.map(s => {
                                                // Adjust available count if a variant is selected and its stock is set
                                                const finalAvailable = selectedVariant ? Math.min(s.available, selectedVariant.stock || 99) : s.available;
                                                return (
                                                    <div key={s.warehouseId} className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400">
                                                        <span className="flex items-center space-x-1.5 font-light">
                                                            <MapPin size={11} className="text-slate-400" />
                                                            <span>{s.warehouseName}</span>
                                                        </span>
                                                        <span className={`font-bold ${finalAvailable > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {finalAvailable > 0 ? `${finalAvailable} Units Available` : 'Out of Stock'}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-rose-500 italic text-[11px]">No showrooms stocked</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {/* Cart add */}
                                    <button
                                        onClick={() => {
                                            const details = getPriceDetails(selectedProduct, selectedVariant);
                                            addToCart(selectedProduct, 1, selectedVariant?._id, selectedVariant?.name, details.originalPrice);
                                            setSelectedProduct(null);
                                        }}
                                        className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-xs uppercase tracking-widest shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
                                    >
                                        <ShoppingBag size={14} />
                                        <span>Add to Cart</span>
                                    </button>

                                    {/* WhatsApp inquiry */}
                                    <a
                                        href={getWhatsAppLink(selectedProduct, selectedVariant)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-3 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/5 text-emerald-500 font-bold text-xs uppercase tracking-widest transition active:scale-95 flex items-center justify-center space-x-2 text-center"
                                    >
                                        <Phone size={14} />
                                        <span>Inquire WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
