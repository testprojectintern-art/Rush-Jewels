import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Search, RefreshCw, Gem, FileText, ArrowLeft, Award, Sparkles } from 'lucide-react';
import axiosReal from 'axios';

export default function PublicWarrantyCheckPage() {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('serial'); // 'serial' or 'invoice'
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            let res;
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

            if (searchType === 'serial') {
                res = await axiosReal.get(`${apiBase}/public/warranty-check/${searchTerm.trim()}`);
                if (res.data.success) {
                    setResult({ type: 'serial', data: res.data });
                } else {
                    setError(res.data.message || 'An error occurred during verification.');
                }
            } else {
                res = await axiosReal.get(`${apiBase}/public/invoice-warranty/${searchTerm.trim()}`);
                if (res.data.success) {
                    setResult({ type: 'invoice', data: res.data });
                } else {
                    setError(res.data.message || 'Invoice not found.');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Could not verify details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div 
            className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100"
            style={{ fontFamily: "'Outfit', sans-serif" }}
        >
            {/* Visual background gradient glow effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Premium Top Left Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:shadow-lg hover:shadow-amber-500/5 active:scale-95 transition-all duration-200 backdrop-blur-md"
            >
                <ArrowLeft size={14} className="text-amber-500" />
                <span>Back to Showroom</span>
            </button>

            {/* Center Box Container */}
            <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-xl border border-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 relative z-10 space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl">
                        <Gem size={26} className="animate-pulse text-amber-450" />
                    </div>
                    <div>
                        <h1 
                            className="text-2xl md:text-3xl font-normal tracking-tight text-white"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Rush Jewels <span className="font-extrabold italic bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">Portal</span>
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                            Verify authenticity & check active warranty status
                        </p>
                    </div>
                </div>

                {/* Tabs Selector */}
                <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-slate-850">
                    <button
                        type="button"
                        onClick={() => {
                            setSearchType('serial');
                            setSearchTerm('');
                            setResult(null);
                            setError('');
                        }}
                        className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all ${
                            searchType === 'serial'
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Jewelry Serial No
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchType('invoice');
                            setSearchTerm('');
                            setResult(null);
                            setError('');
                        }}
                        className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all ${
                            searchType === 'invoice'
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Invoice Number
                    </button>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={searchType === 'serial' ? 'ENTER SERIAL NUMBER (E.G. VAL-SN-9999)' : 'ENTER INVOICE NUMBER (E.G. INV-11)'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={loading}
                            className="w-full bg-slate-950/60 border border-slate-850 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl pl-12 pr-14 py-4 text-xs font-bold text-white placeholder-slate-650 focus:outline-none transition-all uppercase tracking-wider"
                        />
                        {searchType === 'serial' ? (
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        ) : (
                            <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        )}
                        
                        <button
                            type="submit"
                            disabled={loading || !searchTerm.trim()}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-amber-505 to-yellow-600 hover:from-amber-600 hover:to-yellow-705 text-white rounded-xl transition duration-200 disabled:opacity-50 disabled:hover:from-amber-500"
                        >
                            {loading ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <Search size={14} />
                            )}
                        </button>
                    </div>
                </form>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-rose-950/30 border border-rose-900/35 rounded-2xl text-xs font-semibold text-rose-400 text-center">
                        {error}
                    </div>
                )}

                {/* Results - Serial Number details */}
                {result && result.type === 'serial' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {result.data.authentic ? (
                            <>
                                {/* Verification Success banner */}
                                <div className="flex items-center gap-3.5 p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl">
                                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-450 border border-emerald-550/20 rounded-xl flex items-center justify-center shrink-0">
                                        <ShieldCheck size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-emerald-400">Authenticity Verified</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">This article is cataloged in the Rush Jewels registry</p>
                                    </div>
                                </div>

                                {/* Spec Details */}
                                <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-3.5">
                                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-850">
                                        <span className="text-slate-400 font-medium">Model Name</span>
                                        <span className="font-extrabold text-white text-right" style={{ fontFamily: "'Playfair Display', serif" }}>{result.data.productName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-850">
                                        <span className="text-slate-400 font-medium">Model Code</span>
                                        <span className="font-bold text-white font-mono">{result.data.productCode}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-850">
                                        <span className="text-slate-400 font-medium">Brand</span>
                                        <span className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">{result.data.brandName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-850">
                                        <span className="text-slate-400 font-medium">Serial Number</span>
                                        <span className="font-extrabold text-amber-500 font-mono tracking-widest">{result.data.serialNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-medium">Warranty Expiry</span>
                                        <span className="font-bold text-white">{formatDate(result.data.warrantyExpiryDate)}</span>
                                    </div>
                                </div>

                                {/* Warranty Status Badge card */}
                                <div className={`p-5 rounded-2xl border text-center ${
                                    result.data.warrantyStatus === 'active' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                                    result.data.warrantyStatus === 'expired' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                                    'bg-slate-900/50 border-slate-850 text-slate-400'
                                }`}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1">
                                        <Award size={12} />
                                        <span>Warranty Status</span>
                                    </p>
                                    <p className="text-2xl font-black mt-1.5 uppercase tracking-widest">
                                        {result.data.warrantyStatus === 'active' ? 'Active' :
                                         result.data.warrantyStatus === 'expired' ? 'Expired' : 'Not Activated'}
                                    </p>
                                    {result.data.warrantyStatus === 'active' && result.data.daysRemaining > 0 && (
                                        <p className="text-[11px] font-medium mt-1.5 text-slate-400">
                                            {result.data.daysRemaining} days of warranty coverage remaining
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Inauthentic alert banner */
                            <div className="p-5 bg-rose-950/30 border border-rose-500/25 rounded-2xl text-center space-y-4">
                                <div className="inline-flex p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
                                    <ShieldAlert size={28} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-rose-400">Verification Failed</p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed px-2 font-light">
                                        This serial number was not found in our database. The article may be inauthentic, unregistered, or bought from an unauthorized showroom.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Results - Invoice details */}
                {result && result.type === 'invoice' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Invoice Info card */}
                        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-3.5">
                            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-850">
                                <span className="text-slate-400 font-medium">Invoice Number</span>
                                <span className="font-bold text-white font-mono">{result.data.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-850">
                                <span className="text-slate-400 font-medium">Purchase Date</span>
                                <span className="font-bold text-white">{formatDate(result.data.invoiceDate)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Valued Customer</span>
                                <span className="font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{result.data.customerName}</span>
                            </div>
                        </div>

                        {/* List of items */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">
                                Purchased Articles & Expirations
                            </span>
                            {result.data.items.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/20 border border-slate-900 rounded-2xl">
                                    No serial numbered items found on this bill.
                                </p>
                            ) : (
                                result.data.items.map((item) => (
                                    <div key={item.serialNumber} className="bg-slate-950/30 border border-slate-900 rounded-2xl p-4.5 space-y-3.5">
                                        <div className="flex justify-between items-start gap-3">
                                            <div>
                                                <p className="text-xs font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{item.productName}</p>
                                                <p className="text-[10px] text-slate-450 font-mono mt-0.5">SN: {item.serialNumber} • {item.productCode}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 border ${
                                                item.warrantyStatus === 'active' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                    : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                                            }`}>
                                                {item.warrantyStatus === 'active' ? 'Active' : 'Expired'}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-850 pt-2 flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500">Warranty Expiration</span>
                                            <span className="font-semibold text-slate-350">{formatDate(item.warrantyExpiryDate)}</span>
                                        </div>
                                        {item.warrantyStatus === 'active' && item.daysRemaining > 0 && (
                                            <p className="text-[10px] text-amber-500 font-semibold bg-amber-500/5 border border-amber-500/10 rounded-xl py-1.5 px-3 text-center">
                                                {item.daysRemaining} days remaining of coverage
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <p className="text-[9px] uppercase tracking-widest text-slate-600 mt-10 relative z-10">
                &copy; {new Date().getFullYear()} Rush Jewels Pvt Ltd. Consolidated Control Platform.
            </p>
        </div>
    );
}
