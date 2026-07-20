import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PublicContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!name || !email || !message) {
            toast.error('Please fill in all form fields');
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            toast.success('Your message has been sent! Our client relations manager will contact you shortly.');
            setName('');
            setEmail('');
            setMessage('');
            setSubmitting(false);
        }, 1200);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            {/* Title */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Get in Touch
                </h1>
                <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
                <p className="text-slate-400 text-xs font-light">
                    Have questions about customized jewelry or GIA stones? Contact our concierge desk.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Contact Info Card */}
                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm space-y-8">
                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        <MessageSquare size={16} className="text-amber-500" />
                        <span>Showrooms & Concierge Desk</span>
                    </h2>

                    <div className="space-y-6 text-xs leading-relaxed font-light">
                        <div className="flex items-start space-x-3.5">
                            <MapPin className="text-amber-500 shrink-0 mt-0.5" size={16} />
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-205">Colombo Flagship Showroom</h3>
                                <p className="text-slate-450 dark:text-slate-400 mt-0.5">42, Galle Road, Colombo 03, Sri Lanka</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3.5">
                            <MapPin className="text-amber-500 shrink-0 mt-0.5" size={16} />
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-205">Kandy Elite Lounge</h3>
                                <p className="text-slate-450 dark:text-slate-400 mt-0.5">12, Temple Road, Kandy, Sri Lanka</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5 border-t border-slate-100 dark:border-slate-850 pt-5">
                            <Phone className="text-amber-500 shrink-0" size={16} />
                            <div>
                                <h3 className="font-bold text-slate-808 dark:text-slate-205">Phone Lines</h3>
                                <p className="text-slate-450 dark:text-slate-400 mt-0.5">+94 11 234 5678 / +94 77 123 4567</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5">
                            <Mail className="text-amber-500 shrink-0" size={16} />
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-205">Emails</h3>
                                <p className="text-slate-455 dark:text-slate-400 mt-0.5">concierge@rushjewels.lk / inquiries@rushjewels.lk</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5 border-t border-slate-100 dark:border-slate-850 pt-5">
                            <Clock className="text-amber-500 shrink-0" size={16} />
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-205">Showroom Timing</h3>
                                <p className="text-slate-455 dark:text-slate-400 mt-0.5">Monday - Friday: 9:30 AM – 7:00 PM | Saturday: 10:00 AM – 6:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm">
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <Send size={15} className="text-amber-500" />
                            <span>Send Message</span>
                        </h2>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Message *</label>
                            <textarea
                                required
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message about jewelry designs, custom orders, or quotes..."
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                        >
                            <Send size={13} />
                            <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
