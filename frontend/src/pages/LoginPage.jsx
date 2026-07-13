import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Package, Sun, Moon, Gem, Clock, Sparkles } from 'lucide-react';

import { authApi } from '../features/auth/authApi';
import { loginSchema } from '../features/auth/authSchemas';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestedPortal = searchParams.get('portal') || 'main';
    const { login, isAuthenticated } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

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

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (response) => {
            const { token, ...user } = response.data;
            
            // Check portal permissions
            const isPrivileged = ['admin', 'owner'].includes(user.role);
            const hasAccess = user.allowedPortals && user.allowedPortals.includes(requestedPortal);
            
            if (!isPrivileged && !hasAccess) {
                toast.error(`Access Denied: You do not have permissions to access the ${requestedPortal.replace('_', ' ')} portal.`);
                return;
            }

            // Save user with active portal context
            const userWithActivePortal = { ...user, activePortal: requestedPortal };
            login(userWithActivePortal, token);
            toast.success(`Welcome back, ${user.firstName}!`);

            // Route based on portal
            if (requestedPortal === 'online_orders') {
                navigate('/online-orders/pos');
            } else if (requestedPortal === 'owner_dashboard') {
                navigate('/owner-dashboard');
            } else {
                if (user.role === 'cashier') {
                    navigate('/pos');
                } else if (user.role === 'employee') {
                    navigate('/leaves');
                } else {
                    navigate('/dashboard');
                }
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
        },
    });

    // Handle redirect/switch inside useEffect to avoid updating state during rendering
    useEffect(() => {
        if (isAuthenticated) {
            const currentUser = useAuthStore.getState().user;
            if (!currentUser) return;

            const isPrivileged = ['admin', 'owner'].includes(currentUser.role);
            const hasAccess = currentUser.allowedPortals && currentUser.allowedPortals.includes(requestedPortal);

            if (currentUser.activePortal !== requestedPortal) {
                if (isPrivileged || hasAccess) {
                    useAuthStore.getState().updateUser({ ...currentUser, activePortal: requestedPortal });
                    toast.success(`Switched to ${requestedPortal.replace('_', ' ').toUpperCase()} portal`);

                    if (requestedPortal === 'online_orders') navigate('/online-orders/pos', { replace: true });
                    else if (requestedPortal === 'owner_dashboard') navigate('/owner-dashboard', { replace: true });
                    else navigate('/dashboard', { replace: true });
                } else {
                    toast.error(`Access Denied: You do not have permissions to access the ${requestedPortal.replace('_', ' ')} portal.`);
                    const currentActivePortal = currentUser.activePortal || 'main';
                    if (currentActivePortal === 'online_orders') navigate('/online-orders/pos', { replace: true });
                    else if (currentActivePortal === 'owner_dashboard') navigate('/owner-dashboard', { replace: true });
                    else {
                        if (currentUser.role === 'cashier') navigate('/pos', { replace: true });
                        else if (currentUser.role === 'employee') navigate('/leaves', { replace: true });
                        else navigate('/dashboard', { replace: true });
                    }
                }
            } else {
                const currentActivePortal = currentUser.activePortal || 'main';
                if (currentActivePortal === 'online_orders') navigate('/online-orders/pos', { replace: true });
                else if (currentActivePortal === 'owner_dashboard') navigate('/owner-dashboard', { replace: true });
                else {
                    if (currentUser.role === 'cashier') navigate('/pos', { replace: true });
                    else if (currentUser.role === 'employee') navigate('/leaves', { replace: true });
                    else navigate('/dashboard', { replace: true });
                }
            }
        }
    }, [isAuthenticated, requestedPortal, navigate]);

    // Show a loading screen during redirection to prevent render warnings
    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading portal context...</p>
                </div>
            </div>
        );
    }

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
            
            {/* Left Side: Premium jewelry image cover panel (Visible only on md screens and up) */}
            <div className="hidden lg:flex lg:w-7/12 xl:w-8/12 relative overflow-hidden bg-slate-900">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105"
                    style={{ backgroundImage: 'url("/luxury_jewelry_login.png")' }}
                />
                
                {/* Modern Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/70 to-transparent opacity-90" />
                
                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 text-white">
                    {/* Top: Branding */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
                            <Gem className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                                RUSH JEWELS
                            </span>
                            <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                                POS & DISTRIBUTION
                            </span>
                        </div>
                    </div>

                    {/* Middle: Floating Premium Feature Cards */}
                    <div className="max-w-md space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                                Brilliance in Design,<br />
                                <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                                    Excellence in Jewelry.
                                </span>
                            </h2>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Manage inventory, sales tracking, warehouse logistics, and customer invoices under a single unified dashboard built for luxury jewelry distribution.
                            </p>
                        </div>

                        {/* Floating Stats Board */}
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-lg space-y-4 shadow-2xl">
                            <div className="flex items-center space-x-3 text-amber-400">
                                <Sparkles size={16} />
                                <span className="text-xs font-semibold uppercase tracking-wider">System Snapshot</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div>
                                    <span className="block text-2xl font-bold text-white">46+</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-medium">Jewelry Collections</span>
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold text-white">100%</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-medium">Real-time Stock Control</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Luxury Motto */}
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                        <Gem size={14} className="text-amber-500" />
                        <span>JEWELRY RETAIL & WHOLESALE ENTERPRISE</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Professional Glassmorphic Login Form */}
            <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col justify-between p-8 md:p-12 bg-white dark:bg-slate-950 relative shadow-2xl border-l border-slate-100 dark:border-slate-900">
                
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    {/* Small brand shown on mobile */}
                    <div className="flex lg:hidden items-center space-x-2">
                        <Gem className="w-6 h-6 text-amber-500" />
                        <span className="font-bold tracking-wider text-slate-900 dark:text-white">RUSH JEWELS</span>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate('/portal-select')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
                        >
                            ← Change Portal
                        </button>
                    </div>

                    {/* Theme Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsDark(!isDark)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
                    </button>
                </div>

                {/* Form Main Container */}
                <div className="my-auto max-w-sm w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Sign In
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Enter your credentials to access the Rush Jewels POS portal.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                error={errors.email?.message}
                                {...register('email')}
                            />
                        </div>

                        <div className="space-y-1 relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                error={errors.password?.message}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-[38px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loginMutation.isPending}
                            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all duration-200"
                        >
                            {loginMutation.isPending ? 'Authenticating...' : 'Secure Sign In'}
                        </Button>
                    </form>

                    <div className="text-center">
                        <a href="#" className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:underline">
                            Forgot your password? Contact system administrator.
                        </a>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="text-center text-xs text-slate-400 dark:text-slate-500">
                    <p>© 2026 Rush Jewels Shop. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}