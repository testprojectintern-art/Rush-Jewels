import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Gem, Clock, UserCheck, ShieldCheck, Moon, Sun, Sparkles, Star, Award, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SafeImage({ src, alt, className, onError }) {
    const [failed, setFailed] = useState(false);
    return (
        <img
            src={failed || !src ? "/luxury_jewelry_placeholder.png" : src}
            alt={alt}
            className={className}
            onError={() => {
                setFailed(true);
                if (onError) onError();
            }}
        />
    );
}

export default function PublicCatalogPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [warehouses, setWarehouses] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    });

    // Theme Toggle
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    // Load Luxury Google Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

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

    // Dynamic Categories extraction
    const categories = ['all', ...new Set(products.map(p => p.category?.toLowerCase()).filter(Boolean))];

    // Filter products
    const filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory = selectedCategory === 'all' || 
            product.category?.toLowerCase() === selectedCategory;

        if (!matchesCategory) return false;

        // Warehouse filter
        if (selectedWarehouse === 'all') {
            return matchesSearch;
        } else {
            const warehouseStock = product.stocks?.find(s => s.warehouseId === selectedWarehouse);
            if (!warehouseStock || warehouseStock.available <= 0) return false;

            const selectedWhObj = warehouses.find(w => w.id === selectedWarehouse);
            if (selectedWhObj) {
                const whNameUpper = selectedWhObj.name.toUpperCase();
                if (whNameUpper.includes('KANDY')) {
                    return matchesSearch && product.portal === 'kandy';
                } else if (whNameUpper.includes('MAIN')) {
                    return matchesSearch && (product.portal === 'main' || !product.portal);
                }
            }
            return matchesSearch;
        }
    });

    const fmt = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(n || 0);

    return (
        <div 
            className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden"
            style={{ fontFamily: "'Outfit', sans-serif" }}
        >
            {/* Glowing background orbs for dark mode */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[60vh] right-1/4 w-[600px] h-[600px] bg-yellow-500/5 dark:bg-yellow-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

            {/* Elegant Glassmorphic Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-900 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px] shadow-md shadow-amber-500/10">
                            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[11px] flex items-center justify-center">
                                <Gem className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-amber-500 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <span 
                                className="text-base sm:text-xl font-black tracking-wider bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent block"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                RUSH JEWELS
                            </span>
                            <span className="hidden sm:block text-[8px] tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase font-bold">
                                Luxury Jewelry Collection
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Warranty Verification Link */}
                        <button
                            onClick={() => navigate('/public-warranty-check')}
                            title="Verify Warranty"
                            className="px-2.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-200 flex items-center space-x-1.5 active:scale-95"
                        >
                            <ShieldCheck size={15} className="text-amber-500" />
                            <span className="hidden md:inline">Verify Warranty</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsDark(!isDark)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 active:scale-95"
                        >
                            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-650" />}
                        </button>

                        {/* Staff Portal CTA Button */}
                        <button
                            onClick={() => navigate('/portal-select')}
                            title="Staff Portal Login"
                            className="px-2.5 sm:px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all duration-200 flex items-center space-x-2 border border-amber-400/20"
                        >
                            <UserCheck size={15} />
                            <span className="hidden sm:inline">Staff Portal</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Premium Hero Banner Section */}
            <section className="relative overflow-hidden bg-slate-950 text-white py-24 md:py-32 px-6">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-105 opacity-55"
                    style={{ backgroundImage: 'url("/luxury_jewelry_login.png")' }}
                />
                {/* Visual dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/65 to-slate-950" />
                
                {/* Hero Content */}
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs text-amber-400 font-semibold tracking-wider uppercase"
                    >
                        <Sparkles size={13} className="text-amber-400 animate-spin-slow" />
                        <span>Exclusive Masterpieces</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-normal leading-tight tracking-tight text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Where Elegance Meets<br />
                        <span className="font-extrabold italic bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                            Infinite Brilliance
                        </span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-slate-350 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light"
                    >
                        Immerse yourself in our premium catalog of exquisitely designed rings, necklaces, and jewelry items. Real-time availability computed dynamically across all showrooms.
                    </motion.p>

                    {/* Subtle Luxury Scroll Indicator line */}
                    <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto pt-4"
                    />
                </div>
            </section>

            {/* Filter and Content Controls Section */}
            <main className="max-w-7xl mx-auto px-6 py-6 space-y-12">
                
                {/* Search & Filter bar (Glassmorphic) */}
                <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 shadow-sm flex flex-col lg:flex-row gap-6 justify-between items-center transition-all duration-300 backdrop-blur-md">
                    {/* Search Input */}
                    <div className="relative w-full lg:w-1/2">
                        <Search className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={17} />
                        <input
                            type="text"
                            placeholder="Search by jewelry name, brand, or SKU code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-sm font-light placeholder-slate-400"
                        />
                    </div>

                    {/* Warehouse filter and statistics summary */}
                    <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-center justify-end">
                        {/* Warehouse selector */}
                        <div className="relative w-full sm:w-64 flex items-center space-x-3">
                            <MapPin className="text-amber-500 flex-shrink-0" size={17} />
                            <select
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-sm cursor-pointer font-medium"
                            >
                                <option value="all">📍 All Showrooms Stock</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>Showroom: {w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Categories Navigation Bar */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/50 dark:border-slate-900/50 overflow-x-auto no-scrollbar flex-nowrap md:flex-wrap">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mr-2 flex items-center space-x-1 flex-shrink-0">
                        <Layers size={10} />
                        <span>Filter Categories:</span>
                    </span>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-250 border flex-shrink-0 ${
                                selectedCategory === cat
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:border-amber-500/30 hover:text-amber-500'
                            }`}
                        >
                            {cat === 'all' ? 'All Collections' : cat}
                        </button>
                    ))}
                </div>

                {/* Grid Layout for Products */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32 space-y-4">
                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 text-xs tracking-wider animate-pulse">Consulting the royal treasury...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-24 bg-white/50 dark:bg-slate-900/20 border border-dashed border-slate-250 dark:border-slate-900 rounded-3xl p-12">
                        <Gem className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-800 mb-4 animate-bounce" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                            No Jewelry Items Found
                        </h3>
                        <p className="text-slate-450 dark:text-slate-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                            We couldn't find any premium articles matching your filter parameters. Try clearing the search query or selecting "All Showrooms".
                        </p>
                    </div>
                ) : (
                    <motion.div 
                        layout 
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => {
                                const inStock = product.stocks?.some(s => s.available > 0) ?? false;

                                return (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.94, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.94, y: -15 }}
                                        transition={{ duration: 0.35, ease: 'easeOut' }}
                                        key={product._id} 
                                        onClick={() => setSelectedProduct(product)}
                                        className="group flex flex-col justify-between bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_10px_35px_rgba(245,158,11,0.06)] hover:border-amber-500/20 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 relative"
                                    >
                                        {/* Luxury status indicator */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide backdrop-blur-md border ${
                                                inStock 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                <span>{inStock ? 'Available' : 'Unavailable'}</span>
                                            </span>
                                        </div>

                                        {/* Jewelry Image Showcase */}
                                        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                                            <SafeImage 
                                                src={product.image} 
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                            />
                                            {/* Luxury Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
                                            
                                            {/* Brand Logo overlay */}
                                            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800">
                                                <span className="text-[9px] font-semibold text-slate-400 tracking-widest font-mono uppercase">
                                                    {product.brand}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Jewelry Details */}
                                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                                                        Code: {product.productCode}
                                                    </span>
                                                    {product.warrantyPeriod > 0 && (
                                                        <span className="text-[8px] font-bold text-amber-500/90 tracking-wide uppercase px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                                                            {product.warrantyPeriod}M Warranty
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <h3 
                                                    className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-amber-500 transition-colors line-clamp-1"
                                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                                >
                                                    {product.name}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {product.description || "Exquisitely crafted premium luxury jewelry item engineered for elegance."}
                                                </p>
                                            </div>

                                            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-900/60">
                                                {/* Pricing */}
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Price</span>
                                                    <span className="text-base font-extrabold text-amber-500 dark:text-amber-400">
                                                        {fmt(product.basePrice)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </main>

            {/* Premium Footer */}
            <footer className="bg-slate-950 text-slate-500 py-12 mt-32 border-t border-slate-900 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-center">
                    <div className="flex items-center space-x-2">
                        <Gem size={15} className="text-amber-500" />
                        <span className="font-bold tracking-widest text-slate-400 font-mono">RUSH JEWELS SHOWROOMS</span>
                    </div>
                    <div>
                        <p className="font-light">© 2026 Rush Jewels Premium System. Consolidated Treasury Control Platform.</p>
                    </div>
                </div>
            </footer>

            {/* Jewelry Details Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.94, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.94, y: 20 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="bg-white dark:bg-slate-900 border border-slate-205/80 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
                        >
                            {/* Close button */}
                            <button 
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition duration-200 shadow-sm"
                            >
                                ✕
                            </button>

                            {/* Image left panel */}
                            <div className="w-full md:w-1/2 aspect-video md:aspect-square bg-slate-50 dark:bg-slate-950 relative">
                                <SafeImage 
                                   src={selectedProduct.image} 
                                   alt={selectedProduct.name}
                                   className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800">
                                    <span className="text-[10px] font-bold text-amber-400 tracking-widest font-mono uppercase">
                                        {selectedProduct.brand}
                                    </span>
                                </div>
                            </div>

                            {/* Details right panel */}
                            <div className="w-full md:w-1/2 p-7 flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                                                SKU: {selectedProduct.productCode}
                                            </span>
                                            {selectedProduct.warrantyPeriod > 0 ? (
                                                <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-amber-500 uppercase px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">
                                                    <Award size={10} />
                                                    <span>{selectedProduct.warrantyPeriod} Months Warranty</span>
                                                </span>
                                            ) : (
                                                <span className="text-[9px] text-slate-450 font-mono uppercase">No Warranty</span>
                                            )}
                                        </div>
                                        <h2 
                                            className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight"
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                        >
                                            {selectedProduct.name}
                                        </h2>
                                        <span className="inline-block text-[9px] tracking-wider uppercase font-semibold text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
                                            Collection: {selectedProduct.category}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3.5 border-y border-slate-100 dark:border-slate-800/80">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Standard Price</span>
                                        <span className="text-2xl font-black text-amber-500 dark:text-amber-400">
                                            {fmt(selectedProduct.basePrice)}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Product Details</span>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed max-h-[110px] overflow-y-auto pr-1">
                                            {selectedProduct.description || "Exquisitely crafted premium luxury jewelry item engineered for elegance. Crafted with premium precious metals and brilliant stones."}
                                        </p>
                                    </div>
                                </div>

                                {/* Stock Availability Breakdown */}
                                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                        Showroom Availability Breakdown
                                    </span>
                                    <div className="space-y-2.5">
                                        {selectedProduct.stocks && selectedProduct.stocks.length > 0 ? (
                                            selectedProduct.stocks.map(s => (
                                                <div key={s.warehouseId} className="flex justify-between items-center text-xs text-slate-650 dark:text-slate-450 border-b border-slate-100 dark:border-slate-900/60 pb-1.5 last:border-none last:pb-0">
                                                    <span className="flex items-center space-x-1.5">
                                                        <MapPin size={11} className="text-slate-400" />
                                                        <span className="font-medium">{s.warehouseName}</span>
                                                    </span>
                                                    <span className={`font-bold ${s.available > 0 ? 'text-green-500' : 'text-rose-500'}`}>
                                                        {s.available > 0 ? `${s.available} Units` : 'Out of stock'}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-xs text-rose-500 italic block">No stock records</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
