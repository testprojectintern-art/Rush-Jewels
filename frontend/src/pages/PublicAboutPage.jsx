import { Award, ShieldCheck, Heart, Gem, Compass, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicAboutPage() {
    return (
        <div className="w-full bg-white">
            {/* ══════════════════════════════════════════════════════════
                DIVISION 1: HERO HEADER (Pure White)
               ══════════════════════════════════════════════════════════ */}
            <section className="w-full py-20 px-6 border-b border-stone-200/70 bg-white">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <span className="text-[11px] font-semibold tracking-[0.3em] text-amber-800 uppercase block">
                        Our Heritage &bull; Established 1998
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-normal tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                        The Art of Pure Brilliance
                    </h1>
                    <div className="w-12 h-[2px] bg-amber-500 mx-auto" />
                    <p className="text-slate-600 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed pt-2">
                        Forged with passion, sculpted with geometric perfection, and hand-finished by master Sri Lankan goldsmiths and gemologists for over two decades.
                    </p>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                DIVISION 2: CRAFTSMANSHIP & METALLURGY (Light Champagne / Pale Gold)
               ══════════════════════════════════════════════════════════ */}
            <section className="w-full py-20 px-6 bg-[#FAF7F0] border-b border-amber-200/60">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
                    <div className="space-y-6">
                        <span className="text-[11px] font-semibold tracking-[0.25em] text-amber-800 uppercase block">
                            Assay & Metallurgy
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Uncompromising Gold Purity
                        </h2>
                        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                            <p>
                                At Rush Jewels, luxury is defined by rigorous authenticity. Every gold creation is sculpted in certified 22-karat (91.6% pure) yellow gold or premium 18-karat gold for diamond settings.
                            </p>
                            <p>
                                Each article carries the official assay hallmark of the Sri Lanka State Gem & Jewellery Authority, alongside our maker's mark and certified purity guarantee.
                            </p>
                        </div>
                        <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
                            <div className="flex items-center space-x-2">
                                <CheckCircle2 size={16} className="text-amber-700" />
                                <span>916 (22K) & 750 (18K) Assayed</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle2 size={16} className="text-amber-700" />
                                <span>GIA Certified Solitaires</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white border border-stone-200 p-4 shadow-sm overflow-hidden aspect-[4/3] relative">
                        <img 
                            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80" 
                            alt="Fine Gold Craftsmanship" 
                            className="w-full h-full object-cover rounded-2xl" 
                        />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                DIVISION 3: PILLARS OF EXCELLENCE (Pure White)
               ══════════════════════════════════════════════════════════ */}
            <section className="w-full py-20 px-6 bg-white border-b border-stone-200/70">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-2">
                        <span className="text-[11px] font-semibold tracking-[0.25em] text-amber-800 uppercase block">
                            Our Standards
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Pillars of Excellence
                        </h3>
                        <div className="w-12 h-[2px] bg-amber-500 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                                <Award size={20} />
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">Fine GIA Diamonds</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-light">
                                Every diamond above 0.3 carats is GIA-registered, featuring a unique microscopic laser inscription matching its worldwide laboratory dossier.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">Insured Vault Transit</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-light">
                                Orders are sealed in tamper-evident security parcels and dispatched with full comprehensive transit insurance across the island.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                                <Heart size={20} />
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">Lifetime Care & Exchange</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-light">
                                Guaranteed lifetime ultrasonic cleansing, annual prong checks, and buyback or exchange policies based on prevailing gold market rates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                DIVISION 4: SALONS & HERITAGE (Light Warm Champagne)
               ══════════════════════════════════════════════════════════ */}
            <section className="w-full py-20 px-6 bg-[#FAF7F0]">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <span className="text-[11px] font-semibold tracking-[0.25em] text-amber-800 uppercase block">
                        Our Salons
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-normal text-slate-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Colombo &bull; Kandy &bull; Galle Fort
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-light max-w-lg mx-auto leading-relaxed">
                        Experience private viewing suites with dedicated gemological consultants to explore our bespoke catalog in complete privacy and comfort.
                    </p>
                </div>
            </section>
        </div>
    );
}
