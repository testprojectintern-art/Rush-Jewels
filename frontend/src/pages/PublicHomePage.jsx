import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, Gem, Sparkles, ChevronRight, Star, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import IntroOverlay from '../components/layout/IntroOverlay';

export default function PublicHomePage() {
    const navigate = useNavigate();
    const { fmtPrice, addToCart, toggleWishlist, isWishlisted } = useOutletContext();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // GIA lookup form
    const [giaInput, setGiaInput] = useState('');
    const [giaResult, setGiaResult] = useState(null);
    const [giaLoading, setGiaLoading] = useState(false);
    const [introActive, setIntroActive] = useState(() => !sessionStorage.getItem('rush_intro_played'));

    useEffect(() => {
        const fetchDeals = async () => {
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
                    // Filter products with discounts
                    const discounted = res.data.data.filter(p => p.discountPercent > 0 || p.discountPrice > 0);
                    setDeals(discounted.slice(0, 4));
                }
            } catch (err) {
                console.error('Failed to load deals', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    const handleGiaLookup = async (e) => {
        e.preventDefault();
        if (!giaInput.trim()) {
            toast.error('Please enter a certificate number');
            return;
        }
        setGiaLoading(true);
        setGiaResult(null);
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
            const res = await axios.get(`${apiBase}/public/certificates/${giaInput.trim()}`);
            if (res.data?.success) {
                setGiaResult(res.data);
                if (res.data.found) {
                    toast.success('GIA Certificate Verified!');
                } else {
                    toast.error('No record found for this certificate');
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to lookup certificate');
        } finally {
            setGiaLoading(false);
        }
    };

    const categories = [
        { name: 'Rings', image: '/luxury_jewelry_placeholder.png', query: 'rings', desc: 'Precious gold, diamonds, and solitaire engagement bands.' },
        { name: 'Necklaces', image: '/luxury_jewelry_login.png', query: 'necklaces', desc: 'Exquisite necklaces, chokers, and designer pendants.' },
        { name: 'Bracelets', image: '/luxury_jewelry_placeholder.png', query: 'bracelets', desc: 'Crafted cuffs, tennis bracelets, and luxury bangles.' },
        { name: 'Earrings', image: '/luxury_watch_login.png', query: 'earrings', desc: 'Classic studs, diamond hoops, and custom drops.' }
    ];

    return (
        <>
            {introActive && <IntroOverlay onComplete={() => setIntroActive(false)} />}
            <div className="space-y-24 pb-20 relative overflow-hidden">
            {/* Parallax Hero Banner */}
            <section className="relative h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden bg-slate-950">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-105"
                    style={{ 
                        backgroundImage: 'url("/luxury_jewelry_login.png")',
                        transform: 'translate3d(0, 0, 0)'
                    }}
                />
                {/* Visual Premium Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-955" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950/80" />

                <div className="relative z-10 max-w-4xl space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs text-amber-400 font-semibold uppercase tracking-wider"
                    >
                        <Sparkles size={12} className="animate-pulse text-amber-400" />
                        <span>Consolidated Luxury Treasury</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-4xl sm:text-6xl font-normal leading-tight text-white tracking-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Where Precision Meets<br />
                        <span className="font-extrabold italic bg-gradient-to-r from-amber-250 via-yellow-400 to-amber-550 bg-clip-text text-transparent">
                            Timeless Purity
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-light"
                    >
                        Explore customized masterpieces engineered with GIA diamonds and 22-karat gold. Live stock computed dynamically across Colombo & Kandy salons.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
                    >
                        <Link 
                            to="/catalog" 
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
                        >
                            <span>Explore Catalog</span>
                            <ArrowRight size={14} />
                        </Link>
                        <Link 
                            to="/customizer" 
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/20 hover:border-amber-500/50 backdrop-blur-md bg-white/5 hover:bg-amber-500/5 text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
                        >
                            <span>Design Custom Jewelry</span>
                            <Gem size={14} className="text-amber-400" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Curated Categories Grid */}
            <section className="max-w-7xl mx-auto px-6 space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Shop by Curated Collections
                    </h2>
                    <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
                    <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
                        Handcrafted styles tailored with precious elements and precise dimensions.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((cat, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            key={cat.name}
                            onClick={() => navigate(`/catalog?category=${cat.query}`)}
                            className="group cursor-pointer bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1.5"
                        >
                            <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                                <img 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    className="w-full h-full object-cover group-hover:scale-108 transition-all duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent opacity-60 group-hover:opacity-85 transition-opacity" />
                                <div className="absolute bottom-4 left-4 text-white space-y-0.5">
                                    <h3 className="font-bold text-base tracking-wider uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>{cat.name}</h3>
                                    <span className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold group-hover:underline flex items-center">
                                        <span>Discover</span>
                                        <ChevronRight size={10} className="ml-0.5" />
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">{cat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Exclusive Promotional Discounts Section */}
            <section className="bg-amber-500/5 dark:bg-amber-500/[0.01] border-y border-amber-500/10 py-20 px-6">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Promotional Deals & Treasury Offers
                            </h2>
                            <p className="text-slate-450 dark:text-slate-500 text-xs font-light">
                                Exclusive price drops computed dynamically with instant savings.
                            </p>
                        </div>
                        <Link 
                            to="/catalog" 
                            className="text-xs uppercase tracking-widest font-bold text-amber-500 hover:text-amber-600 flex items-center space-x-1.5 active:scale-95"
                        >
                            <span>View All Offers</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : deals.length === 0 ? (
                        <div className="text-center py-16 bg-white/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-2xl">
                            <p className="text-slate-450 text-xs">No active discounted products available today. Visit again shortly!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {deals.map(product => {
                                const isWish = isWishlisted(product._id);
                                return (
                                    <div 
                                        key={product._id}
                                        className="group bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(245,158,11,0.04)] transition-all duration-300 relative flex flex-col justify-between"
                                    >
                                        {/* discount tag */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[9px] font-black tracking-wider uppercase shadow-md shadow-rose-500/10">
                                                -{product.discountPercent}% OFF
                                            </span>
                                        </div>

                                        <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            />
                                            {/* wishlist heart */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                                className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition active:scale-90"
                                            >
                                                <Heart size={14} className={isWish ? "fill-rose-500 text-rose-500" : ""} />
                                            </button>
                                        </div>

                                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase block">SKU: {product.productCode}</span>
                                                <h3 
                                                    onClick={() => navigate(`/catalog`)}
                                                    className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-amber-500 cursor-pointer transition"
                                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                                >
                                                    {product.name}
                                                </h3>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                                                    {product.description || 'Exclusive premium handcrafted jewelry article.'}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[9px] text-slate-400 line-through block">LKR {product.basePrice.toLocaleString()}</span>
                                                    <span className="text-sm font-extrabold text-amber-500 dark:text-amber-450">{fmtPrice(product.discountPrice || (product.basePrice * (1 - product.discountPercent / 100)))}</span>
                                                </div>
                                                <button
                                                    onClick={() => addToCart(product, 1)}
                                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition active:scale-95 text-slate-600 dark:text-slate-400 flex items-center justify-center"
                                                    title="Quick Add to Cart"
                                                >
                                                    <ShoppingBag size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* GIA Certificate Verification & Authenticity lookup widget */}
            <section className="max-w-3xl mx-auto px-6 space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Verify Jewelry GIA Certificate
                    </h2>
                    <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
                    <p className="text-slate-400 text-xs font-light">
                        Verify diamond/stone certifications directly with our laboratory database.
                    </p>
                </div>

                <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 shadow-sm backdrop-blur-md space-y-6">
                    <form onSubmit={handleGiaLookup} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Enter GIA Certificate ID (e.g., GIA-12345678)"
                            value={giaInput}
                            onChange={(e) => setGiaInput(e.target.value)}
                            className="flex-grow px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-xs font-mono tracking-wider uppercase placeholder-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={giaLoading}
                            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2 shrink-0 active:scale-95 disabled:opacity-50"
                        >
                            <ShieldCheck size={14} />
                            <span>{giaLoading ? 'Verifying...' : 'Verify Authenticity'}</span>
                        </button>
                    </form>

                    {/* Result printout */}
                    {giaResult && giaResult.found && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/[0.02] border border-emerald-500/10 space-y-4"
                        >
                            <div className="flex items-center space-x-2 text-emerald-600">
                                <ShieldCheck size={16} />
                                <span className="font-bold text-xs uppercase tracking-wider">{giaResult.data.authenticity}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Shape</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{giaResult.data.shape}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Carat Weight</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{giaResult.data.caratWeight}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Color Grade</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{giaResult.data.colorGrade}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Clarity Grade</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{giaResult.data.clarityGrade}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cut Grade</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{giaResult.data.cutGrade}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Symmetry / Polish</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{giaResult.data.symmetry} / {giaResult.data.polish}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {giaResult && !giaResult.found && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-500 flex items-center space-x-2"
                        >
                            <span>⚠️</span>
                            <span>{giaResult.message}</span>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
        </>
    );
}
