import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Gem, ShoppingCart, Heart, Moon, Sun, Menu, X, Globe, Phone, MapPin, Mail, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AIChatbot from './AIChatbot';

export default function PublicLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('public_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('public_wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('public_currency') || 'LKR';
    });
    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Scroll listener to update scroll progress and auto-hide header
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // 1. Calculate scroll progress percentage
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (currentScrollY / totalHeight) * 100;
                setScrollProgress(progress);
            }

            // 2. Hide header on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 120) {
                setShowHeader(false); // scrolling down
            } else {
                setShowHeader(true); // scrolling up
            }

            // 3. Show/hide floating scroll-to-top button
            if (currentScrollY > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }

            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Save cart to LocalStorage
    useEffect(() => {
        localStorage.setItem('public_cart', JSON.stringify(cart));
    }, [cart]);

    // Save wishlist to LocalStorage
    useEffect(() => {
        localStorage.setItem('public_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // Save currency to LocalStorage
    useEffect(() => {
        localStorage.setItem('public_currency', currency);
    }, [currency]);

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

    // Load Luxury Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;950&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    // Cart Actions
    const addToCart = (product, qty = 1, variationId = null, variationName = '', customPrice = null) => {
        setCart(prev => {
            const finalPrice = customPrice !== null ? customPrice : product.basePrice;
            const cartKey = `${product._id}-${variationId || 'none'}`;
            const existing = prev.find(item => `${item._id}-${item.variationId || 'none'}` === cartKey);
            
            if (existing) {
                toast.success(`Updated ${product.name} quantity in cart!`);
                return prev.map(item => `${item._id}-${item.variationId || 'none'}` === cartKey 
                    ? { ...item, qty: item.qty + qty } 
                    : item
                );
            } else {
                toast.success(`Added ${product.name} to cart!`);
                return [...prev, {
                    _id: product._id,
                    name: product.name,
                    productCode: product.productCode,
                    image: product.image,
                    basePrice: finalPrice,
                    discountPercent: product.discountPercent || 0,
                    discountPrice: product.discountPrice || 0,
                    variationId,
                    variationName,
                    qty
                }];
            }
        });
    };

    const removeFromCart = (productId, variationId = null) => {
        const cartKey = `${productId}-${variationId || 'none'}`;
        setCart(prev => prev.filter(item => `${item._id}-${item.variationId || 'none'}` !== cartKey));
        toast.success('Item removed from cart');
    };

    const updateCartQty = (productId, variationId = null, qty) => {
        const cartKey = `${productId}-${variationId || 'none'}`;
        if (qty <= 0) {
            removeFromCart(productId, variationId);
            return;
        }
        setCart(prev => prev.map(item => `${item._id}-${item.variationId || 'none'}` === cartKey 
            ? { ...item, qty } 
            : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    // Wishlist Actions
    const toggleWishlist = (product) => {
        const isWish = wishlist.some(item => item._id === product._id);
        if (isWish) {
            setWishlist(prev => prev.filter(item => item._id !== product._id));
            toast.success('Removed from wishlist');
        } else {
            setWishlist(prev => [...prev, product]);
            toast.success('Added to wishlist');
        }
    };

    const isWishlisted = (productId) => wishlist.some(item => item._id === productId);

    // Pricing & Currency
    const exchangeRate = 300; // 1 USD = 300 LKR
    const toggleCurrency = () => setCurrency(prev => prev === 'LKR' ? 'USD' : 'LKR');
    const convertPrice = (priceLkr) => currency === 'LKR' ? priceLkr : priceLkr / exchangeRate;
    const fmtPrice = (priceLkr) => {
        const converted = convertPrice(priceLkr);
        if (currency === 'LKR') {
            return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(converted);
        } else {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted);
        }
    };

    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Catalog', path: '/catalog' },
        { label: 'Customizer', path: '/customizer' },
        { label: 'Size Guide', path: '/size-guide' },
        { label: 'Book Appointment', path: '/book-appointment' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact Us', path: '/contact' }
    ];

    return (
        <div 
            className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col justify-between overflow-x-hidden"
            style={{ fontFamily: "'Outfit', sans-serif" }}
        >
            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/[0.01] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-yellow-500/5 dark:bg-yellow-500/[0.01] rounded-full blur-[150px] pointer-events-none" />

            {/* Premium Header */}
            <header className={`sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-900 transition-all duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center space-x-2.5 group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/10">
                            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[11px] flex items-center justify-center">
                                <Gem className="w-5 h-5 text-amber-500 group-hover:scale-110 transition duration-300" />
                            </div>
                        </div>
                        <div>
                            <span 
                                className="text-lg font-black tracking-wider bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent block"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                RUSH JEWELS
                            </span>
                            <span className="text-[8px] tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                                Royal Craftsmanship
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        {navLinks.map(link => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                className={`text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:text-amber-500 ${
                                    location.pathname === link.path 
                                        ? 'text-amber-500 border-b-2 border-amber-500 pb-1' 
                                        : 'text-slate-550 dark:text-slate-400'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Action Utilities */}
                    <div className="flex items-center space-x-3.5">
                        {/* Currency Toggle */}
                        <button
                            onClick={toggleCurrency}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center space-x-1"
                            title="Toggle Currency"
                        >
                            <Globe size={13} className="text-amber-500" />
                            <span>{currency}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition active:scale-95"
                            title="Toggle Dark Mode"
                        >
                            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-650" />}
                        </button>

                        {/* Wishlist Link */}
                        <Link
                            to="/wishlist"
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition relative active:scale-95"
                            title="Wishlist"
                        >
                            <Heart size={15} className={wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart Link */}
                        <Link
                            to="/cart"
                            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 transition relative active:scale-95 flex items-center justify-center"
                            title="Shopping Cart"
                        >
                            <ShoppingCart size={15} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border border-white dark:border-slate-950">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Customer Profile Icon */}
                        <Link
                            to="/customer/profile"
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition active:scale-95 hidden sm:flex"
                            title="Order History / Profile"
                        >
                            <Globe size={15} className="text-amber-500 rotate-12" />
                            <span className="text-[10px] uppercase tracking-wider font-bold ml-1.5">My Account</span>
                        </Link>

                        {/* Mobile Drawer Trigger */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 lg:hidden rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                        >
                            {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative z-40 overflow-hidden"
                    >
                        <div className="px-6 py-4 space-y-3">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block text-sm font-semibold uppercase tracking-wider py-2.5 border-b border-slate-100 dark:border-slate-900 ${
                                        location.pathname === link.path ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                to="/customer/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-sm font-semibold uppercase tracking-wider py-2.5 text-amber-500"
                            >
                                My Account (Orders)
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Page Content Outlet Container */}
            <main className="flex-grow w-full relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="w-full"
                    >
                        <Outlet context={{ 
                            cart, 
                            addToCart, 
                            removeFromCart, 
                            updateCartQty, 
                            clearCart, 
                            wishlist, 
                            toggleWishlist, 
                            isWishlisted, 
                            currency, 
                            toggleCurrency, 
                            convertPrice, 
                            fmtPrice 
                        }} />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Premium Footer */}
            <footer className="bg-slate-950 text-slate-400 py-16 mt-20 border-t border-slate-900 relative z-10 text-xs">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand Details */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2.5">
                            <Gem size={18} className="text-amber-500" />
                            <span 
                                className="text-base font-bold tracking-widest text-white uppercase"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                RUSH JEWELS
                            </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 font-light">
                            Crafting eternity in precious metals and pure brilliant gemstones. GIA certified natural diamonds and fine Sri Lankan sapphires curated for royalty.
                        </p>
                        <div className="flex items-center space-x-2 text-slate-500">
                            <Award size={14} className="text-amber-500 shrink-0" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Certified Authenticity Guaranteed</span>
                        </div>
                    </div>

                    {/* Showroom Locations */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">Showrooms</h4>
                        <div className="space-y-3 font-light text-[11px]">
                            <div className="flex items-start space-x-2">
                                <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-slate-350">Main Flagship Showroom</p>
                                    <p className="text-slate-500">42, Galle Road, Colombo 03, Sri Lanka</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-slate-350">Kandy Elite Lounge</p>
                                    <p className="text-slate-500">12, Temple Road, Kandy, Sri Lanka</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">Opening Hours</h4>
                        <div className="space-y-2 font-light text-[11px]">
                            <div className="flex items-center space-x-2">
                                <Clock size={14} className="text-amber-500" />
                                <span>Weekdays: 9:30 AM – 7:00 PM</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock size={14} className="text-amber-500" />
                                <span>Saturday: 10:00 AM – 6:00 PM</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock size={14} className="text-amber-500" />
                                <span>Sunday: Closed (Appointment Only)</span>
                            </div>
                        </div>
                    </div>

                    {/* Support Contact */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">Support & Inquiries</h4>
                        <div className="space-y-2 font-light text-[11px]">
                            <div className="flex items-center space-x-2">
                                <Phone size={14} className="text-amber-500" />
                                <span>+94 11 234 5678 / +94 77 123 4567</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail size={14} className="text-amber-500" />
                                <span>inquiries@rushjewels.lk</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 text-center">
                    <p>© 2026 Rush Jewels Treasury Platform. All Rights Reserved. Crafted for Elegance.</p>
                    <div className="flex space-x-4">
                        <Link to="/about" className="hover:text-amber-500">Brand Story</Link>
                        <Link to="/contact" className="hover:text-amber-500">Contact</Link>
                        <Link to="/size-guide" className="hover:text-amber-500">Size Guide</Link>
                        <Link to="/public-warranty-check" className="hover:text-amber-500">Warranty Checker</Link>
                    </div>
                </div>
            </footer>

            {/* Floating Circular Scroll Progress / Scroll-to-Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-24 right-6 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg text-amber-500 z-[999] active:scale-95 transition-transform group"
                        title="Scroll to Top"
                    >
                        {/* SVG Circular Progress Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle 
                                cx="22" cy="22" r="18" 
                                fill="none" stroke="rgba(212, 169, 106, 0.15)" strokeWidth="2" 
                            />
                            <motion.circle 
                                cx="22" cy="22" r="18" 
                                fill="none" stroke="#d4a96a" strokeWidth="2.5" 
                                strokeDasharray="113" 
                                strokeDashoffset={113 - (113 * scrollProgress) / 100}
                                style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
                            />
                        </svg>
                        <Gem className="w-4 h-4 text-amber-500 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Floating AI Chatbot Widget */}
            <AIChatbot />
        </div>
    );
}
