import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sun, Moon, Gem, Sparkles, Star, Crown } from 'lucide-react';

import { authApi } from '../features/auth/authApi';
import { loginSchema } from '../features/auth/authSchemas';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function LoginPage() {
    const navigate = useNavigate();
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
            login(user, token);
            toast.success(`Welcome back, ${user.firstName}!`);
            if (user.role === 'cashier') {
                navigate('/pos');
            } else if (user.role === 'employee') {
                navigate('/leaves');
            } else {
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
        },
    });

    // Already logged in? Go to dashboard
    if (isAuthenticated) {
        const user = useAuthStore.getState().user;
        if (user?.role === 'cashier') return <Navigate to="/pos" replace />;
        if (user?.role === 'employee') return <Navigate to="/leaves" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">

            {/* ── Left Side: Luxury Jewelry Cover Panel ── */}
            <div className="hidden lg:flex lg:w-7/12 xl:w-8/12 relative overflow-hidden bg-slate-900">

                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[12s] hover:scale-105"
                    style={{ backgroundImage: 'url("/luxury_jewelry_login.png")' }}
                />

                {/* Rich Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-purple-950/60 to-rose-950/30 opacity-90" />

                {/* Shimmer accent lines */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 text-white">

                    {/* Top: Branding */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-400/30 backdrop-blur-md shadow-lg shadow-rose-500/10">
                            <Gem className="w-6 h-6 text-rose-300" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-widest bg-gradient-to-r from-rose-200 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                                RUSH JEWELS
                            </span>
                            <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                                POS &amp; Management System
                            </span>
                        </div>
                    </div>

                    {/* Middle: Feature Cards */}
                    <div className="max-w-md space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Crown size={16} className="text-amber-400" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">Premium Jewellery</span>
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                                Timeless Elegance,<br />
                                <span className="bg-gradient-to-r from-rose-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                                    Precious Excellence.
                                </span>
                            </h2>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Manage your jewellery inventory, sales, customer orders, and staff — all from one powerful, elegant dashboard built for luxury retail.
                            </p>
                        </div>

                        {/* Floating Stats Board */}
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-lg space-y-4 shadow-2xl shadow-black/40">
                            <div className="flex items-center space-x-3 text-rose-400">
                                <Sparkles size={16} />
                                <span className="text-xs font-semibold uppercase tracking-wider">System Highlights</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div>
                                    <span className="block text-2xl font-bold text-white">100%</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-medium">Real-time Stock Tracking</span>
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold text-white">Gold &amp; Gems</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-medium">Full Product Management</span>
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold text-white">POS</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-medium">Cashier &amp; Sales Point</span>
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold text-white">Reports</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-medium">Financial &amp; Analytics</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Motto */}
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span>LUXURY JEWELLERY RETAIL &amp; WHOLESALE ENTERPRISE</span>
                    </div>
                </div>
            </div>

            {/* ── Right Side: Login Form ── */}
            <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col justify-between p-8 md:p-12 bg-white dark:bg-slate-950 relative shadow-2xl border-l border-slate-100 dark:border-slate-800">

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 via-amber-400 to-purple-500 opacity-80" />

                {/* Header Section */}
                <div className="flex justify-between items-center">
                    {/* Small brand on mobile */}
                    <div className="flex lg:hidden items-center space-x-2">
                        <Gem className="w-5 h-5 text-rose-500" />
                        <span className="font-bold tracking-widest text-slate-900 dark:text-white text-sm">RUSH JEWELS</span>
                    </div>
                    <div className="lg:block hidden" />

                    {/* Theme Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsDark(!isDark)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
                    </button>
                </div>

                {/* Form Main Container */}
                <div className="my-auto max-w-sm w-full mx-auto space-y-8">

                    {/* Brand mark (desktop) */}
                    <div className="hidden lg:flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-400/30 flex items-center justify-center">
                            <Gem size={18} className="text-rose-400" />
                        </div>
                        <div>
                            <span className="font-bold tracking-widest text-slate-900 dark:text-white text-sm">RUSH JEWELS</span>
                            <span className="block text-[9px] tracking-widest text-slate-400 uppercase">Management Portal</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Sign in to access the <span className="text-rose-500 font-medium">Rush Jewels</span> POS &amp; Management portal.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="admin@rushjewels.com"
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
                                className="absolute right-3.5 top-[38px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loginMutation.isPending}
                            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:via-pink-600 hover:to-amber-600 shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.98] transition-all duration-200"
                        >
                            {loginMutation.isPending ? 'Authenticating...' : '✦ Secure Sign In'}
                        </Button>
                    </form>

                    <div className="text-center">
                        <a href="#" className="text-xs font-medium text-rose-500 dark:text-rose-400 hover:underline">
                            Forgot your password? Contact system administrator.
                        </a>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                    <div className="flex items-center justify-center space-x-1 text-slate-300 dark:text-slate-600">
                        <div className="h-px w-8 bg-current" />
                        <Gem size={10} className="text-rose-400/60" />
                        <div className="h-px w-8 bg-current" />
                    </div>
                    <p>© 2026 Rush Jewels. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}