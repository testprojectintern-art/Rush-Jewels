import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, DollarSign, PieChart, Layers, HelpCircle, Activity, LogOut } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function OwnerDashboardPage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]; // start of current month
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0]; // today
    });

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.get('/owner/analytics', {
                params: { startDate, endDate }
            });
            if (res.data?.success) {
                setAnalytics(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch owner analytics data', err);
            toast.error('Failed to load owner dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [startDate, endDate]);

    const handleLogout = () => {
        logout();
        toast.success('Logged out from Executive Owner Console.');
        navigate('/login');
    };

    const fmt = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(n || 0);

    const getPortalColor = (portal) => {
        switch (portal) {
            case 'main': return 'bg-indigo-500 text-indigo-500';
            case 'kandy': return 'bg-amber-500 text-amber-500';
            case 'online_orders': return 'bg-emerald-500 text-emerald-500';
            default: return 'bg-slate-500 text-slate-500';
        }
    };

    const getPortalLabel = (portal) => {
        switch (portal) {
            case 'main': return 'Main POS & ERP';
            case 'kandy': return 'Kandy Branch POS';
            case 'online_orders': return 'Online Orders POS';
            default: return portal;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Topbar */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 py-4 px-6 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleLogout}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Exit Executive Owner Console"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>Executive Owner Console</span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono tracking-wide uppercase">
                                Consolidated View
                            </span>
                        </h1>
                        <p className="text-[10px] text-slate-400">Comparing Kandy Branch, Online POS and Main ERP operations</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Date Filters */}
                    <div className="flex items-center space-x-2 text-xs">
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={fetchAnalytics}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Refresh Statistics"
                    >
                        <RefreshCw size={16} />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-950 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        title="Logout from Executive Owner Console"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-grow flex flex-col space-y-8">
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : !analytics ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <p className="text-slate-400 text-xs">Failed to load consolidated analytics.</p>
                    </div>
                ) : (
                    <>
                        {/* Consolidated KPI Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            
                            {/* Sales card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-2 relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consolidated Revenue</span>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white block truncate">{fmt(analytics.summary.sales)}</span>
                                <div className="text-[10px] text-blue-500 font-semibold flex items-center space-x-1">
                                    <Activity size={10} />
                                    <span>Total invoice billing</span>
                                </div>
                            </div>

                            {/* COGS card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-2 relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost of Goods (COGS)</span>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white block truncate">{fmt(analytics.summary.cogs)}</span>
                                <div className="text-[10px] text-amber-500 font-semibold flex items-center space-x-1">
                                    <Activity size={10} />
                                    <span>Jewelry purchase cost</span>
                                </div>
                            </div>

                            {/* Gross Profit card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-2 relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Profit</span>
                                <span className="text-xl font-extrabold text-emerald-500 dark:text-emerald-400 block truncate">{fmt(analytics.summary.grossProfit)}</span>
                                <div className="text-[10px] text-emerald-500 font-semibold flex items-center space-x-1">
                                    <TrendingUp size={10} />
                                    <span>Revenue minus COGS</span>
                                </div>
                            </div>

                            {/* Expenses card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-2 relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-rose-500/5 blur-xl pointer-events-none" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operating Expenses</span>
                                <span className="text-xl font-extrabold text-rose-500 dark:text-rose-400 block truncate">{fmt(analytics.summary.expenses)}</span>
                                <div className="text-[10px] text-rose-500 font-semibold flex items-center space-x-1">
                                    <Activity size={10} />
                                    <span>Bills + general costs</span>
                                </div>
                            </div>

                            {/* Net Profit card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-2 relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-purple-500/5 blur-xl pointer-events-none" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Profit</span>
                                <span className={`text-xl font-extrabold block truncate ${analytics.summary.netProfit >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
                                    {fmt(analytics.summary.netProfit)}
                                </span>
                                <div className="text-[10px] text-indigo-500 font-semibold flex items-center space-x-1">
                                    {analytics.summary.netProfit >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    <span>Bottom-line earnings</span>
                                </div>
                            </div>

                        </div>

                        {/* Breakdown by Portal */}
                        <div className="space-y-4">
                            <h3 className="text-base font-extrabold tracking-tight">Portal Breakdown comparison</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {analytics.portals.map(p => {
                                    const colorCls = getPortalColor(p.portal).split(' ')[1];
                                    const bgCls = getPortalColor(p.portal).split(' ')[0];

                                    return (
                                        <div 
                                            key={p.portal} 
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6"
                                        >
                                            {/* Portal Title header */}
                                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`w-3 h-3 rounded-full ${bgCls}`} />
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{getPortalLabel(p.portal)}</h4>
                                                </div>
                                                <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                                                    Active
                                                </span>
                                            </div>

                                            {/* Figures comparison */}
                                            <div className="space-y-3.5 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Sales / Invoiced Revenue</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{fmt(p.sales)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Cost of Goods Sold (COGS)</span>
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{fmt(p.cogs)}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold border-t border-slate-50 dark:border-slate-800/50 pt-2">
                                                    <span className="text-slate-500">Gross Profit</span>
                                                    <span className="text-emerald-500">{fmt(p.grossProfit)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Local Bills & Expenses</span>
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{fmt(p.expenses)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-extrabold border-t border-slate-100 dark:border-slate-800 pt-3">
                                                    <span className="text-slate-800 dark:text-slate-200">Net Profit</span>
                                                    <span className={p.netProfit >= 0 ? 'text-indigo-500 dark:text-indigo-400' : 'text-rose-500'}>
                                                        {fmt(p.netProfit)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Monthly revenue comparison trends */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Sales Trends comparison</h3>
                            {analytics.trend && analytics.trend.length > 0 ? (
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                                    <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                                        <span>Month</span>
                                        <span>Portal Source</span>
                                        <span className="text-right">Revenue Billing</span>
                                    </div>
                                    {analytics.trend.map((t, idx) => (
                                        <div key={idx} className="grid grid-cols-3 items-center text-xs py-2 border-b border-slate-50 dark:border-slate-800/50">
                                            <span className="font-medium">{t.monthLabel}</span>
                                            <span className="capitalize">{getPortalLabel(t.portal)}</span>
                                            <span className="text-right font-bold text-amber-500">{fmt(t.revenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-xs py-4 text-center">No trend statistics found for this date range.</p>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
