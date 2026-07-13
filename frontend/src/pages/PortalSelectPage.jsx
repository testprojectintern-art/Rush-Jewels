import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Gem, Monitor, Truck, ShieldAlert, BookOpen, Sun, Moon } from 'lucide-react';

export default function PortalSelectPage() {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const portals = [
        {
            id: 'main',
            title: 'Main POS & ERP System',
            description: 'Core retail dashboard, warehouse stock, sales invoicing, finance, employee attendance, and purchasing reports.',
            icon: Monitor,
            gradient: 'from-blue-600 to-indigo-700',
            textColor: 'text-indigo-400',
            badge: 'Head Office',
            route: '/login?portal=main'
        },
        {
            id: 'online_orders',
            title: 'Online Orders POS',
            description: 'Place internet orders, log COD and Bank Transfer payments, update delivery tracking number and trigger customer SMS.',
            icon: Truck,
            gradient: 'from-emerald-500 to-teal-600',
            textColor: 'text-teal-400',
            badge: 'Distribution',
            route: '/login?portal=online_orders'
        },
        {
            id: 'owner_dashboard',
            title: 'Executive Owner Dashboard',
            description: 'Executive consolidated views. Compare sales, net profit, expenditures, and branch trends across all portals.',
            icon: ShieldAlert,
            gradient: 'from-rose-600 to-red-700',
            textColor: 'text-rose-400',
            badge: 'Owner & Admin',
            route: '/login?portal=owner_dashboard'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
            {/* Background luxury gradient blurs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

            {/* Topbar */}
            <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <Gem className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
                            RUSH JEWELS
                        </span>
                        <span className="block text-[8px] tracking-widest text-slate-500 uppercase font-mono">
                            Jewelry Enterprise
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={() => setIsDark(!isDark)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200"
                    >
                        {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
                    </button>
                    
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 flex items-center space-x-2"
                    >
                        <BookOpen size={14} />
                        <span>Public Catalog</span>
                    </button>
                </div>
            </header>

            {/* Main Selection Area */}
            <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-grow flex flex-col justify-center relative z-10 space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <span className="text-xs font-bold font-mono tracking-widest text-amber-500 uppercase">
                        Rush Jewels POS Gateway
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Select System Portal
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        To maintain separation of duties, choose the portal matching your job scope. You will be prompted to log in with credentials authorized for that specific portal.
                    </p>
                </div>

                {/* Portals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {portals.map((portal) => {
                        const Icon = portal.icon;
                        return (
                            <div
                                key={portal.id}
                                onClick={() => navigate(portal.route)}
                                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                            >
                                {/* Subtle portal gradient background on hover */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/1 group-hover:to-amber-500/5 transition-all duration-300 pointer-events-none" />

                                <div className="flex items-start space-x-5">
                                    {/* Icon container */}
                                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${portal.gradient} text-white shadow-md transition-all duration-300 group-hover:scale-105`}>
                                        <Icon size={24} />
                                    </div>

                                    {/* Text Details */}
                                    <div className="flex-grow space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold tracking-wider font-mono text-amber-500 uppercase">
                                                {portal.badge}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                            {portal.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {portal.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full text-center py-6 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-900 relative z-10">
                <p>© 2026 Rush Jewels Enterprise Distribution System. All rights reserved.</p>
            </footer>
        </div>
    );
}
