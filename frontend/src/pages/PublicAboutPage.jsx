import { Award, ShieldCheck, Heart, Sparkles, Gem } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicAboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-20 relative">
            {/* Ambient glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Title */}
            <div className="text-center space-y-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs text-amber-550 font-semibold uppercase tracking-wider"
                >
                    <Sparkles size={12} />
                    <span>Our Legacy</span>
                </motion.div>
                <h1 className="text-3xl sm:text-5xl font-normal tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    The Art of Pure Brilliance
                </h1>
                <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
                <p className="text-slate-450 dark:text-slate-400 text-xs font-light max-w-md mx-auto leading-relaxed">
                    Forged with passion, designed with geometric perfection, and hand-finished by master Sri Lankan jewelers since 1998.
                </p>
            </div>

            {/* Content grids */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Uncompromising Gold Purity
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                        At Rush Jewels, we believe that luxury is defined by authenticity. Every gold piece is cast in certified 22-karat (91.6% pure) yellow gold or premium 18-karat gold for diamond settings. 
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                        Each article carries the official stamp of the Sri Lanka State Gem & Jewellery Authority, ensuring international standards of metal fineness.
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden aspect-video flex items-center justify-center">
                    <img 
                        src="/luxury_jewelry_placeholder.png" 
                        alt="Gold craft" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60" 
                    />
                    <div className="absolute inset-0 bg-slate-950/40" />
                    <Gem size={42} className="text-amber-400 relative z-10 animate-bounce" />
                </div>
            </section>

            {/* Core Values */}
            <section className="space-y-10">
                <h3 className="text-lg font-bold text-center uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Our Pillars of Excellence
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 space-y-4">
                        <Award size={20} className="text-amber-500" />
                        <h4 className="font-bold text-sm">Fine GIA Diamonds</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-light">Every diamond above 0.3 carats is GIA-registered, featuring a unique microscopic laser inscription matching its report.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 space-y-4">
                        <ShieldCheck size={20} className="text-amber-500" />
                        <h4 className="font-bold text-sm">Secure Transit</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-light">Online orders are sealed in tamper-proof treasury bags and shipped via premium courier services with full insurance coverage.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 space-y-4">
                        <Heart size={20} className="text-amber-500" />
                        <h4 className="font-bold text-sm">Lifetime Exchange</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-light">We offer guaranteed buyback and exchanges on our gold items, respecting current market values with minimal wastage fees.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
