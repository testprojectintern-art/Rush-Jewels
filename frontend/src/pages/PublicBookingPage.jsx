import { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Sparkles, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PublicBookingPage() {
    // Form states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [showroom, setShowroom] = useState('Colombo');
    const [serviceType, setServiceType] = useState('Custom Jewelry Design');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [notes, setNotes] = useState('');

    const [loading, setLoading] = useState(false);
    const [successBooking, setSuccessBooking] = useState(null);

    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        if (!name || !phone || !preferredDate || !preferredTime) {
            toast.error('Please enter Name, Phone, Date, and Time');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Registering appointment in showroom schedules...');
        try {
            let apiBase = '';
            if (import.meta.env.VITE_API_URL) {
                apiBase = import.meta.env.VITE_API_URL;
            } else {
                const hostname = window.location.hostname;
                apiBase = (hostname === 'localhost' || hostname === '127.0.0.1') 
                    ? 'http://localhost:5005/api' 
                    : 'https://rush-jewels.onrender.com/api';
            }

            const res = await axios.post(`${apiBase}/public/appointments`, {
                customerName: name,
                phone: phone.trim(),
                email,
                showroom,
                serviceType,
                preferredDate,
                preferredTime,
                notes
            });

            if (res.data?.success) {
                toast.success('Salon appointment scheduled successfully!', { id: toastId });
                setSuccessBooking(res.data.data);
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Appointment booking failed';
            toast.error(msg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (successBooking) {
        return (
            <div className="max-w-md mx-auto px-6 py-20 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-xl space-y-6"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={36} className="animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Appointment Scheduled!
                        </h2>
                        <p className="text-slate-400 text-xs font-light">
                            Your elite consulting lounge slot is confirmed. An SMS reminder has been dispatched to your contact number.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60 text-xs space-y-3 text-left font-light">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Consultant:</span>
                            <span className="font-semibold text-slate-800 dark:text-white">{successBooking.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Showroom Location:</span>
                            <span className="font-semibold text-slate-808 dark:text-white">{successBooking.showroom} Lounge</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Requested Service:</span>
                            <span className="font-semibold text-slate-800 dark:text-white">{successBooking.serviceType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Date & Slot Time:</span>
                            <span className="font-bold text-amber-500">{new Date(successBooking.preferredDate).toLocaleDateString()} at {successBooking.preferredTime}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setSuccessBooking(null)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-white font-bold text-xs uppercase tracking-widest shadow-md transition active:scale-95"
                    >
                        Schedule Another Appointment
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-[10px] text-amber-550 font-bold uppercase tracking-widest"
                >
                    <Calendar size={11} className="text-amber-550" />
                    <span>Lounge Scheduling Desk</span>
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Book Showroom Appointment
                </h1>
                <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
                <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
                    Reserve a private consultant lounge slot in Colombo or Kandy for customized design and fitting.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                
                {/* Visual info card left */}
                <div className="md:col-span-1 p-6 bg-slate-950 text-white rounded-3xl border border-slate-900 shadow-xl space-y-6 relative overflow-hidden aspect-[4/5] flex flex-col justify-end">
                    <img 
                        src="/luxury_jewelry_placeholder.png" 
                        alt="lounge room" 
                        className="absolute inset-0 w-full h-full object-cover opacity-25" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    <div className="relative z-10 space-y-4">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">Consultation lounges</span>
                        <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Rush Premium Lounge</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-light">Experience luxury with a private Gemologist consultant. Inspect loose diamonds, sapphires, and size fittings with complete discretion.</p>
                    </div>
                </div>

                {/* Form desk right */}
                <div className="md:col-span-2 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm">
                    <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
                        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <Send size={15} className="text-amber-500" />
                            <span>Salon Reservation Ticket</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone Number *</label>
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="E.g., 0771234567"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none"
                                />
                            </div>

                            {/* Showroom */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferred Showroom Location *</label>
                                <select
                                    value={showroom}
                                    onChange={(e) => setShowroom(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 rounded-xl focus:outline-none cursor-pointer"
                                >
                                    <option value="Colombo">Colombo Flagship Showroom</option>
                                    <option value="Kandy">Kandy Elite Lounge</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Service Type */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Service Requested *</label>
                                <select
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 rounded-xl focus:outline-none cursor-pointer"
                                >
                                    <option value="Custom Jewelry Design">Custom Jewelry Consultation</option>
                                    <option value="Diamond Ring Fitting">Diamond Ring Fitting & Size Checks</option>
                                    <option value="Gemstone Inspections">Loose Sapphire / Gemstone Selection</option>
                                    <option value="Polish and Repair">Jewelry Polishing & Repair Service</option>
                                </select>
                            </div>

                            {/* Preferred Date */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferred Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/50 rounded-xl focus:outline-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Preferred Time */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferred Time Slot *</label>
                                <select
                                    value={preferredTime}
                                    onChange={(e) => setPreferredTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 rounded-xl focus:outline-none cursor-pointer"
                                >
                                    <option value="10:00 AM">10:00 AM – 11:30 AM</option>
                                    <option value="11:30 AM">11:30 AM – 01:00 PM</option>
                                    <option value="02:00 PM">02:00 PM – 03:30 PM</option>
                                    <option value="03:30 PM">03:30 PM – 05:00 PM</option>
                                    <option value="05:00 PM">05:00 PM – 06:30 PM</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Consultation Notes (Optional)</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="E.g., Looking for GIA certified oval diamond..."
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                        >
                            <span>{loading ? 'Submitting Reservation Ticket...' : 'Confirm Lounge Reservation'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
