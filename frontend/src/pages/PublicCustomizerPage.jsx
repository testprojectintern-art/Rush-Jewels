import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Gem, ShoppingBag, Heart, RefreshCw, Star, Sparkles, Check, HelpCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PublicCustomizerPage() {
    const navigate = useNavigate();
    const { addToCart, fmtPrice } = useOutletContext();

    // Selections state
    const [jewelryType, setJewelryType] = useState('ring'); // ring | necklace
    const [material, setMaterial] = useState('yellow_gold'); // yellow_gold | rose_gold | white_gold | platinum
    const [gemType, setGemType] = useState('diamond'); // diamond | ruby | sapphire | emerald | none
    const [carat, setCarat] = useState(1.0); // 0.5 | 1.0 | 1.5 | 2.0
    const [designStyle, setDesignStyle] = useState('solitaire'); // solitaire | halo | three_stone | box | snake | rope

    // Dynamic price and recommendations
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    // Sync designStyle based on jewelryType
    useEffect(() => {
        if (jewelryType === 'ring') {
            setDesignStyle('solitaire');
        } else {
            setDesignStyle('snake');
        }
    }, [jewelryType]);

    // Calculate Price in LKR
    useEffect(() => {
        let baseMetalCost = jewelryType === 'ring' ? 75000 : 135000;
        
        // Material multipliers
        const metalFactors = {
            yellow_gold: 1.0,
            rose_gold: 0.88,
            white_gold: 0.90,
            platinum: 1.25
        };
        const metalCost = baseMetalCost * (metalFactors[material] || 1.0);

        // Gem cost per carat
        const gemRates = {
            diamond: 140000,
            ruby: 70000,
            sapphire: 85000,
            emerald: 95000,
            none: 0
        };
        const gemCost = gemType === 'none' ? 0 : gemRates[gemType] * carat;

        // Design style cost
        const designCosts = {
            solitaire: 5000,
            halo: 20000,
            three_stone: 15000,
            snake: 12000,
            box: 10000,
            rope: 18000
        };
        const designCost = designCosts[designStyle] || 0;

        const total = metalCost + gemCost + designCost;
        setCalculatedPrice(Math.round(total));
    }, [jewelryType, material, gemType, carat, designStyle]);

    // Fetch pre-made products matching selected style
    useEffect(() => {
        const fetchRecs = async () => {
            setLoadingRecs(true);
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
                const res = await axios.get(`${apiBase}/public/products?portal=all`);
                if (res.data?.success) {
                    // Match category (rings/necklaces) and see if name contains design cues (snake, solitaire, etc.)
                    const allProducts = res.data.data;
                    const matched = allProducts.filter(p => {
                        const matchesCategory = p.category?.toLowerCase().includes(jewelryType);
                        return matchesCategory;
                    }).slice(0, 3);
                    setRecommendations(matched);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingRecs(false);
            }
        };

        fetchRecs();
    }, [jewelryType, designStyle]);

    const handleAddToCart = () => {
        const customProduct = {
            _id: `custom-${Date.now()}`,
            name: `Custom Handcrafted ${jewelryType === 'ring' ? 'Ring' : 'Necklace'}`,
            productCode: `CUST-${jewelryType.toUpperCase()}`,
            image: `/luxury_jewelry_placeholder.png`,
            basePrice: calculatedPrice,
            discountPercent: 0,
            discountPrice: 0
        };

        const variationName = `Metal: ${material.replace('_', ' ').toUpperCase()} | Gem: ${gemType.toUpperCase()} (${gemType === 'none' ? '0' : carat}ct) | Design: ${designStyle.toUpperCase()}`;

        addToCart(customProduct, 1, `var-${Date.now()}`, variationName, calculatedPrice);
        toast.success('Custom jewelry added to your shopping bag!');
    };

    // Resolving colors for vector graphics
    const getMetalGradients = () => {
        switch (material) {
            case 'yellow_gold':
                return { start: '#fbbf24', end: '#d97706', shadow: '#78350f' };
            case 'rose_gold':
                return { start: '#fca5a5', end: '#e11d48', shadow: '#9f1239' };
            case 'white_gold':
                return { start: '#e2e8f0', end: '#94a3b8', shadow: '#475569' };
            case 'platinum':
                return { start: '#f1f5f9', end: '#cbd5e1', shadow: '#64748b' };
            default:
                return { start: '#fbbf24', end: '#d97706', shadow: '#78350f' };
        }
    };

    const getGemColor = () => {
        switch (gemType) {
            case 'diamond':
                return { fill: 'url(#diamondGlow)', stroke: '#93c5fd' };
            case 'ruby':
                return { fill: '#f43f5e', stroke: '#be123c' };
            case 'sapphire':
                return { fill: '#3b82f6', stroke: '#1d4ed8' };
            case 'emerald':
                return { fill: '#10b981', stroke: '#047857' };
            default:
                return null;
        }
    };

    const metalColors = getMetalGradients();
    const gemColors = getGemColor();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-[10px] text-amber-550 font-bold uppercase tracking-widest"
                >
                    <Sparkles size={11} className="text-amber-500" />
                    <span>Treasury Design Studio</span>
                </motion.div>
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Custom Jewelry Builder
                </h1>
                <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
                <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
                    Design rings or necklaces with certified precious metals and GIA natural gemstones in real time.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                
                {/* Visualizer Canvas Left */}
                <div className="p-8 bg-slate-950 rounded-3xl border border-slate-900 shadow-2xl relative aspect-square flex items-center justify-center overflow-hidden">
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        Visual Simulator (2D Vector)
                    </div>

                    <motion.div 
                        key={`${jewelryType}-${material}-${gemType}-${carat}-${designStyle}`}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, type: 'spring' }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {/* Dynamic SVG canvas drawing ring / chain */}
                        <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_15px_30px_rgba(245,158,11,0.06)]">
                            <defs>
                                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={metalColors.start} />
                                    <stop offset="50%" stopColor="#fff" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor={metalColors.end} />
                                </linearGradient>
                                <radialGradient id="diamondGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="70%" stopColor="#e0f2fe" />
                                    <stop offset="100%" stopColor="#bae6fd" />
                                </radialGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Draw RING */}
                            {jewelryType === 'ring' && (
                                <g>
                                    {/* Main Band ring */}
                                    <circle cx="100" cy="115" r="45" stroke="url(#metalGrad)" strokeWidth="8" fill="none" />
                                    {/* Inner band shadow */}
                                    <circle cx="100" cy="115" r="41" stroke={metalColors.shadow} strokeWidth="1" fill="none" opacity="0.3" />

                                    {/* Halo design decoration */}
                                    {designStyle === 'halo' && gemType !== 'none' && (
                                        <circle cx="100" cy="65" r="14" fill="none" stroke="#bae6fd" strokeWidth="2.5" strokeDasharray="3 2" filter="url(#glow)" />
                                    )}

                                    {/* Three-Stone design side stones */}
                                    {designStyle === 'three_stone' && gemType !== 'none' && (
                                        <>
                                            <polygon points="82,69 88,62 94,69 88,76" fill={gemColors.fill} stroke={gemColors.stroke} strokeWidth="1" filter="url(#glow)" />
                                            <polygon points="106,69 112,62 118,69 112,76" fill={gemColors.fill} stroke={gemColors.stroke} strokeWidth="1" filter="url(#glow)" />
                                            {/* prongs side */}
                                            <line x1="82" y1="69" x2="88" y2="76" stroke={metalColors.shadow} strokeWidth="1" />
                                            <line x1="112" y1="76" x2="118" y2="69" stroke={metalColors.shadow} strokeWidth="1" />
                                        </>
                                    )}

                                    {/* Main Gemstone setting prongs */}
                                    {gemType !== 'none' && (
                                        <>
                                            <path d="M 90 70 L 100 80 L 110 70" fill="none" stroke="url(#metalGrad)" strokeWidth="3" />
                                            {/* Gem facets polygon */}
                                            <polygon 
                                                points="100,48 112,60 100,72 88,60" 
                                                fill={gemColors.fill} 
                                                stroke={gemColors.stroke} 
                                                strokeWidth="1" 
                                                filter="url(#glow)"
                                                style={{ transformOrigin: '100px 60px', transform: `scale(${0.7 + carat * 0.3})` }}
                                            />
                                        </>
                                    )}
                                </g>
                            )}

                            {/* Draw NECKLACE */}
                            {jewelryType === 'necklace' && (
                                <g>
                                    {/* Chain representation */}
                                    {designStyle === 'snake' && (
                                        <path d="M 50 50 Q 100 150 150 50" fill="none" stroke="url(#metalGrad)" strokeWidth="3.5" strokeDasharray="2 1" />
                                    )}
                                    {designStyle === 'box' && (
                                        <path d="M 50 50 Q 100 150 150 50" fill="none" stroke="url(#metalGrad)" strokeWidth="4.5" strokeDasharray="4 2" />
                                    )}
                                    {designStyle === 'rope' && (
                                        <path d="M 50 50 Q 100 150 150 50" fill="none" stroke="url(#metalGrad)" strokeWidth="5.5" strokeDasharray="1.5 1" />
                                    )}

                                    {/* Pendant holder hook */}
                                    <circle cx="100" cy="115" r="5" fill="none" stroke="url(#metalGrad)" strokeWidth="3" />

                                    {/* Gemstone Pendant */}
                                    {gemType !== 'none' && (
                                        <g style={{ transformOrigin: '100px 130px', transform: `scale(${0.7 + carat * 0.3})` }}>
                                            <polygon 
                                                points="100,118 112,130 100,145 88,130" 
                                                fill={gemColors.fill} 
                                                stroke={gemColors.stroke} 
                                                strokeWidth="1.5" 
                                                filter="url(#glow)"
                                            />
                                            {/* prongs */}
                                            <circle cx="100" cy="118" r="1.5" fill="#fff" />
                                            <circle cx="100" cy="145" r="1.5" fill="#fff" />
                                        </g>
                                    )}
                                </g>
                            )}
                        </svg>
                    </motion.div>
                </div>

                {/* Selections Panel Right */}
                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        <Gem size={16} className="text-amber-500" />
                        <span>Select Configuration</span>
                    </h2>

                    <div className="space-y-4 text-xs">
                        {/* 1. Jewelry Type */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Jewelry Article</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setJewelryType('ring')}
                                    className={`py-2.5 rounded-xl font-bold uppercase border transition ${
                                        jewelryType === 'ring' ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                                    }`}
                                >
                                    Rings
                                </button>
                                <button
                                    onClick={() => setJewelryType('necklace')}
                                    className={`py-2.5 rounded-xl font-bold uppercase border transition ${
                                        jewelryType === 'necklace' ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                                    }`}
                                >
                                    Necklaces
                                </button>
                            </div>
                        </div>

                        {/* 2. Metal Purity */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Gold / Metal Purity</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    { id: 'yellow_gold', label: '22K Gold' },
                                    { id: 'rose_gold', label: '18K Rose' },
                                    { id: 'white_gold', label: '18K White' },
                                    { id: 'platinum', label: 'Platinum' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setMaterial(item.id)}
                                        className={`py-2 rounded-xl font-semibold border transition ${
                                            material === item.id ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Gemstone */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Gemstone Selection</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {[
                                    { id: 'diamond', label: 'Diamond' },
                                    { id: 'ruby', label: 'Ruby' },
                                    { id: 'sapphire', label: 'Sapphire' },
                                    { id: 'emerald', label: 'Emerald' },
                                    { id: 'none', label: 'Plain' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setGemType(item.id)}
                                        className={`py-2 rounded-xl font-semibold border transition ${
                                            gemType === item.id ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Carat Size */}
                        {gemType !== 'none' && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Gem Carat Size</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[0.5, 1.0, 1.5, 2.0].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCarat(c)}
                                            className={`py-2 rounded-xl font-semibold border transition ${
                                                carat === c ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                                            }`}
                                        >
                                            {c} Carat
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. Design style */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Design Layout / Chain Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {jewelryType === 'ring' ? (
                                    <>
                                        {[
                                            { id: 'solitaire', label: 'Solitaire' },
                                            { id: 'halo', label: 'Halo' },
                                            { id: 'three_stone', label: 'Three-Stone' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => setDesignStyle(item.id)}
                                                className={`py-2 rounded-xl font-semibold border transition ${
                                                    designStyle === item.id ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {[
                                            { id: 'snake', label: 'Snake Chain' },
                                            { id: 'box', label: 'Box Chain' },
                                            { id: 'rope', label: 'Rope Chain' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => setDesignStyle(item.id)}
                                                className={`py-2 rounded-xl font-semibold border transition ${
                                                    designStyle === item.id ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Calculated Price */}
                    <div className="py-4 border-y border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Estimated Cost</span>
                        <span className="text-xl font-black text-amber-500 dark:text-amber-450">{fmtPrice(calculatedPrice)}</span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-white font-bold text-xs uppercase tracking-widest shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
                    >
                        <ShoppingBag size={14} />
                        <span>Add Custom Design to Cart</span>
                    </button>
                </div>
            </div>

            {/* Recommendations Widget Bottom */}
            <section className="space-y-8 pt-8 border-t border-slate-200/50 dark:border-slate-900/50">
                <div className="space-y-1 text-center lg:text-left">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Pre-made Styles Ready to Ship
                    </h3>
                    <p className="text-slate-400 text-xs font-light">
                        Similar configurations available immediately in Colombo & Kandy showrooms.
                    </p>
                </div>

                {loadingRecs ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : recommendations.length === 0 ? (
                    <p className="text-slate-450 text-xs italic">No matched pre-made configurations available in catalog.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {recommendations.map(p => (
                            <div 
                                key={p._id}
                                onClick={() => navigate(`/catalog`)}
                                className="group p-4 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-900 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-amber-500/20 transition shadow-sm"
                            >
                                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-950">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{p.name}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{p.brand}</p>
                                    <p className="text-[11px] font-bold text-amber-505 dark:text-amber-450 mt-1">{fmtPrice(p.basePrice)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
