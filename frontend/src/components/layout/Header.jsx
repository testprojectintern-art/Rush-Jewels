import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Menu, Sun, Moon, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../features/auth/authApi';
import api from '../../api/axios';

export default function Header({ onToggleSidebar }) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    });
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchPendingOrders = async () => {
            if (!user) return;
            try {
                const res = await api.get('/sales-orders?status=pending_approval', {
                    headers: { 'x-portal-context': 'online_orders' }
                });
                if (res.data?.success) {
                    const data = res.data.data;
                    setPendingOrders(data);
                    setPendingCount(data.length);
                }
            } catch (err) {
                console.error('Failed to fetch pending online orders', err);
            }
        };

        fetchPendingOrders();
        const interval = setInterval(fetchPendingOrders, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            // Even if backend fails, log out locally
        }
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const roleLabel = {
        admin: 'Administrator',
        manager: 'Manager',
        accountant: 'Accountant',
        sales_manager: 'Sales Manager',
        sales_rep: 'Sales Rep',
        warehouse_staff: 'Warehouse Staff',
        production_staff: 'Production Staff',
        staff: 'Staff',
    }[user?.role] || 'User';

    return (
        <header className="h-16 bg-white border-b border-gray-50 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
                {/* Hamburger toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden md:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Workspace</p>
                    <button
                        onClick={() => navigate('/portal-select')}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition"
                        title="Switch Portal"
                    >
                        {user?.activePortal === 'owner_dashboard' 
                            ? 'Executive Dashboard' 
                            : user?.activePortal === 'online_orders' 
                            ? 'Online Orders POS' 
                            : 'Main POS & ERP'}
                        <span className="text-[9px] font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded hover:bg-gray-200">(Switch)</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-800 transition relative"
                        aria-label="Notifications"
                        title="Online Orders Notifications"
                    >
                        <Bell size={20} className={pendingCount > 0 ? "text-amber-500 animate-pulse" : ""} />
                        {pendingCount > 0 && (
                            <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 text-left">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Pending Online Orders</h3>
                            {pendingOrders.length === 0 ? (
                                <p className="text-xs text-gray-400 py-2">No pending online orders.</p>
                            ) : (
                                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                                    {pendingOrders.map(o => (
                                        <div 
                                            key={o._id} 
                                            onClick={() => {
                                                setShowNotifications(false);
                                                navigate(`/sales-orders/${o._id}`);
                                            }}
                                            className="p-2.5 border border-gray-50 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition text-xs"
                                        >
                                            <div className="flex justify-between font-bold">
                                                <span className="text-indigo-650 dark:text-indigo-400">{o.orderNumber}</span>
                                                <span className="text-gray-400 font-mono text-[10px]">{new Date(o.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 font-semibold mt-1">
                                                {o.customerSnapshot?.name || 'Customer'}
                                            </div>
                                            <div className="text-[10px] text-amber-500 font-bold mt-0.5">
                                                Total: LKR {o.grandTotal.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-slate-850 text-center">
                                <button 
                                    onClick={() => {
                                        setShowNotifications(false);
                                        navigate('/online-orders/list');
                                    }}
                                    className="text-xs text-indigo-650 hover:text-indigo-800 font-bold uppercase tracking-wider"
                                >
                                    View All Online Deliveries
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme toggle button */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-label="Toggle Theme"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-600" />}
                </button>

                <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50/50 border border-gray-100 rounded-xl">
                    <div className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                        <button onClick={() => navigate('/profile')}>
                            <UserIcon className="w-4 h-4 text-indigo-600" />
                        </button>
                    </div>
                    <div className="hidden sm:block text-sm">
                        <p className="font-bold text-gray-900 leading-none">{user?.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{roleLabel}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
}