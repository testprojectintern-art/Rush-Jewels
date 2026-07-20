import { useState } from 'react';
import { Ruler, Sparkles, Scale, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SIZE_TABLE = [
    { us: '3', diameter: 14.1, circumference: 44.2 },
    { us: '4', diameter: 14.9, circumference: 46.8 },
    { us: '5', diameter: 15.7, circumference: 49.3 },
    { us: '6', diameter: 16.5, circumference: 51.8 },
    { us: '7', diameter: 17.3, circumference: 54.4 },
    { us: '8', diameter: 18.2, circumference: 56.9 },
    { us: '9', diameter: 19.0, circumference: 59.5 },
    { us: '10', diameter: 19.8, circumference: 62.1 },
    { us: '11', diameter: 20.6, circumference: 64.6 },
    { us: '12', diameter: 21.4, circumference: 67.2 }
];

export default function PublicSizeGuidePage() {
    // Calibration state
    const [cardWidthPx, setCardWidthPx] = useState(300); // slider adjustment
    const [ringSizePx, setRingSizePx] = useState(80); // slider adjustment for ring inner circle

    // Standard dimensions: credit card is 85.6mm wide
    const mmPerPx = 85.6 / cardWidthPx;
    const ringDiameterMm = ringSizePx * mmPerPx;

    // Find nearest US size
    const getNearestUsSize = () => {
        let nearest = SIZE_TABLE[0];
        let minDiff = Math.abs(ringDiameterMm - nearest.diameter);

        for (let i = 1; i < SIZE_TABLE.length; i++) {
            const diff = Math.abs(ringDiameterMm - SIZE_TABLE[i].diameter);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = SIZE_TABLE[i];
            }
        }
        return nearest;
    };

    const nearestSize = getNearestUsSize();

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-[10px] text-amber-550 font-bold uppercase tracking-widest"
                >
                    <Ruler size={11} className="text-amber-550" />
                    <span>Fitment Assistant</span>
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Ring Size Guide & Calculator
                </h1>
                <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
                <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
                    Calibrate your screen using a card to measure your ring size visually.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Sizing Tool Left */}
                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm space-y-8">
                    
                    {/* Step 1: Calibrate */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                            <span>Calibrate Screen Scale</span>
                        </h3>
                        <p className="text-[11px] text-slate-450 leading-relaxed font-light">
                            Hold a standard plastic card (e.g., credit card or ATM card) against the screen. Drag the slider until the blue rectangle matches the card's width exactly.
                        </p>
                        
                        {/* Blue card rectangle */}
                        <div className="flex justify-center py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div 
                                className="bg-indigo-600/10 border-2 border-dashed border-indigo-500 rounded-lg flex items-center justify-center text-indigo-500 text-[10px] font-bold"
                                style={{ width: `${cardWidthPx}px`, height: `${cardWidthPx * 0.63}px`, minWidth: '150px' }}
                            >
                                Place Card Here
                            </div>
                        </div>

                        <div className="space-y-1">
                            <input
                                type="range"
                                min="150"
                                max="450"
                                value={cardWidthPx}
                                onChange={(e) => setCardWidthPx(Number(e.target.value))}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <span className="text-[10px] text-slate-400 font-mono block text-right">Scale width: {cardWidthPx}px</span>
                        </div>
                    </div>

                    {/* Step 2: Measure Ring */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                            <span>Measure Ring Diameter</span>
                        </h3>
                        <p className="text-[11px] text-slate-450 leading-relaxed font-light">
                            Place a ring that fits you on top of the circle below. Adjust the slider until the gold circle fills the inner diameter of your ring perfectly.
                        </p>

                        {/* Gold ring circle */}
                        <div className="flex justify-center py-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div 
                                className="rounded-full bg-amber-500/15 border-4 border-amber-500 shadow-lg shadow-amber-500/20 flex items-center justify-center text-amber-500 text-[10px] font-bold"
                                style={{ width: `${ringSizePx}px`, height: `${ringSizePx}px` }}
                            >
                            </div>
                        </div>

                        <div className="space-y-1">
                            <input
                                type="range"
                                min="40"
                                max="150"
                                value={ringSizePx}
                                onChange={(e) => setRingSizePx(Number(e.target.value))}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <span className="text-[10px] text-slate-400 font-mono block text-right">Ring circle width: {ringSizePx}px</span>
                        </div>
                    </div>

                    {/* Display Result */}
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                        <span className="text-[9px] font-bold text-amber-550 uppercase tracking-widest block">Calculated Result</span>
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-slate-500">Inner Diameter: <span className="font-bold text-slate-800 dark:text-white font-mono">{ringDiameterMm.toFixed(1)} mm</span></span>
                            <span className="text-base text-slate-800 dark:text-white font-light">Estimated US Size: <span className="text-xl font-black text-amber-500">{nearestSize.us}</span></span>
                        </div>
                    </div>
                </div>

                {/* Sizing Chart Right */}
                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        <Scale size={16} className="text-amber-500" />
                        <span>International Ring Sizing Chart</span>
                    </h2>

                    <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    <th className="py-2.5">US Size</th>
                                    <th className="py-2.5">Inner Diameter (mm)</th>
                                    <th className="py-2.5">Inner Circumference (mm)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-850 font-light">
                                {SIZE_TABLE.map(item => (
                                    <tr 
                                        key={item.us} 
                                        className={nearestSize.us === item.us ? "bg-amber-500/5 font-bold text-amber-600" : "text-slate-600 dark:text-slate-400"}
                                    >
                                        <td className="py-2.5">Size {item.us}</td>
                                        <td className="py-2.5 font-mono">{item.diameter.toFixed(1)} mm</td>
                                        <td className="py-2.5 font-mono">{item.circumference.toFixed(1)} mm</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/50 flex items-start space-x-2.5 text-[10px] text-slate-550 leading-normal">
                        <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="font-light">If your ring falls between two sizes, we recommend ordering the larger size. Showcase showrooms offer free sizing adjustments within 30 days of purchase.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
