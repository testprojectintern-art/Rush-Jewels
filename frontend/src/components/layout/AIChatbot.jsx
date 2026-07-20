import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, HelpCircle, User, Bot } from 'lucide-react';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: 'ආයුබෝවන්! Welcome to RUSH JEWELS AI Assistant. ✨ How can I help you select, customize, or order your perfect jewelry today? (Sinhala / English)',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatEndRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const suggestions = [
        { label: 'Custom orders?', query: 'custom order' },
        { label: 'Verify GIA certificate?', query: 'gia verification' },
        { label: 'සිංහල සහාය?', query: 'sinhala support' },
        { label: 'Book appointment?', query: 'appointment booking' }
    ];

    // Simple keyword mapping engine supporting Sinhala and English
    const getAIResponse = (userQuery) => {
        const query = userQuery.toLowerCase().trim();

        // 1. Sinhala Support Query
        if (query.includes('sinhala') || query.includes('සිංහල') || query.includes('singlish')) {
            return "ඔව්, මට සිංහල භාෂාවෙන් පිළිතුරු දිය හැක! ඔබට RUSH JEWELS වෙතින් අවශ්‍ය ඕනෑම නිෂ්පාදනයක්, Customization (කැමති මැණික් හා රන් තේරීම) හෝ GIA සහතික පරීක්ෂා කිරීම පිළිබඳ සිංහලෙන් විමසිය හැක.";
        }

        // 2. Custom Jewelry Orders
        if (query.includes('custom') || query.includes('kamathi') || query.includes('තෝර') || query.includes('හදන්න') || query.includes('design')) {
            return "RUSH JEWELS වෙතින් ඔබට අවශ්‍ය රන් ප්‍රමාණය (18K, 22K, 24K White/Yellow/Rose Gold) සහ කැමති මැණික් වර්ගය (Gem: Diamond, Sapphire, Ruby) තෝරාගෙන 2D/3D Customizer එක මඟින් සජීවීව බලා Custom Order එකක් සාදාගත හැක. මේ සඳහා ඉහළ මෙනුවේ ඇති 'Customizer' පිටුවට පිවිසෙන්න.";
        }

        // 3. GIA Certificate Verification
        if (query.includes('gia') || query.includes('certificate') || query.includes('verify') || query.includes('සහතික') || query.includes('පරීක්ෂා')) {
            return "GIA සහතික පත්‍රයක් Verify කිරීම සඳහා අපගේ Home Page එකෙහි පහළින් ඇති 'GIA Certificate Lookup' කොටසට ගොස් ඔබ සතු 10-digit සහතික අංකය ඇතුළත් කර Verify කරන්න. එවිට එහි විස්තර ක්ෂණිකව ලැබෙනු ඇත.";
        }

        // 4. Appointment Booking
        if (query.includes('appointment') || query.includes('book') || query.includes('day') || query.includes('time') || query.includes('වෙලාව') || query.includes('හමුවෙන්න')) {
            return "ඔබට අපගේ ප්‍රධාන මධ්‍යස්ථානයට පැමිණ ආභරණ පරීක්ෂා කිරීමට හෝ සාකච්ඡා කිරීමට Appointment එකක් වෙන් කරගත හැක. මේ සඳහා 'Appointment' පිටුවට ගොස් ඔබට පහසු දිනයක් හා වේලාවක් වෙන් කරන්න. ඔබට SMS/Email මඟින් තහවුරු කිරීමක් ලැබෙනු ඇත.";
        }

        // 5. Prices & Discounts
        if (query.includes('price') || query.includes('gana') || query.includes('ganan') || query.includes('මිල') || query.includes('discount') || query.includes('aduvata')) {
            return "අපගේ සියලුම ආභරණ සඳහා දැනට විශේෂ සෘතුමය වට්ටම් (Seasonal Discounts) පිරිනමනු ලැබේ! නිෂ්පාදනවල මිල ගණන් සහ වට්ටම් පැහැදිලිව Catalog එකෙහි දක්වා ඇත. මිල ගණන් LKR, USD හෝ AED වලින් බලාගත හැක.";
        }

        // 6. Ring sizes
        if (query.includes('size') || query.includes('ring size') || query.includes('ප්‍රමාණය') || query.includes('මිණුම')) {
            return "ඔබේ ඇඟිල්ලේ මුදු ප්‍රමාණය (Ring size) නිවැරදිව මැන ගැනීමට අපගේ 'Size Guide' පිටුවට පිවිසෙන්න. එහි ඇති විස්තර මඟින් නිවැරදි ප්‍රමාණය පහසුවෙන් සොයාගත හැක.";
        }

        // 7. Store / Contact Info
        if (query.includes('shop') || query.includes('location') || query.includes('where') || query.includes('phone') || query.includes('call') || query.includes('තැන') || query.includes('කෝල්')) {
            return "අපගේ ප්‍රදර්ශනාගාරය කොළඹ පිහිටා ඇත. වැඩිදුර විස්තර සඳහා අපව +94 77 123 4567 අංකයෙන් හෝ info@rushjewels.com ලිපිනයෙන් සම්බන්ධ කරගත හැක.";
        }

        // 8. General Greetings
        if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('halo') || query.includes('ආයුබෝවන්') || query.includes('kohomada')) {
            return "ආයුබෝවන්! RUSH JEWELS වෙතින් ඔබට අවශ්‍ය සහාය කුමක්ද? මට සිංහලෙන් හෝ ඉංග්‍රීසියෙන් විමසන්න. (Rings, Necklaces, Customization, GIA Verification)";
        }

        // Default Fallback
        return "RUSH JEWELS සහායකයා: මට ඔබ පැවසූ දේ පැහැදිලි නැත. කරුණාකර Custom Orders, GIA Verification, Booking හෝ සිංහල සහාය ගැන විමසන්න. / Sorry, I couldn't understand that. Please ask about Custom Orders, GIA Certificate Lookup, or Bookings.";
    };

    const handleSend = (textToSend) => {
        const text = textToSend || inputValue;
        if (!text.trim()) return;

        // Add user message
        const userMsg = {
            sender: 'user',
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simulate AI thinking and reply
        setTimeout(() => {
            const botReply = {
                sender: 'bot',
                text: getAIResponse(text),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botReply]);
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Collapsed Chat Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-95 transition-transform"
                whileHover={{ scale: 1.06 }}
                layoutId="chatbot-panel"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>

            {/* Chatbot Window Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden backdrop-blur-lg"
                    >
                        {/* Header banner */}
                        <div className="p-4 bg-gradient-to-r from-amber-400 to-yellow-600 text-white flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black tracking-wider uppercase">RUSH JEWELS</h4>
                                    <span className="text-[9px] text-white/80 flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse" />
                                        AI assistant online
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 text-white/80 hover:text-white transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Message Panel list */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/10">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className="flex items-start space-x-2 max-w-[85%]">
                                        {msg.sender === 'bot' && (
                                            <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5">
                                                <Bot size={13} />
                                            </div>
                                        )}
                                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                            msg.sender === 'user'
                                                ? 'bg-amber-500 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                                        }`}>
                                            <p>{msg.text}</p>
                                            <span className={`text-[8px] mt-1 block text-right ${
                                                msg.sender === 'user' ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {msg.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Suggestion Chips */}
                        <div className="p-2 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(s.query)}
                                    className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 transition-all flex items-center space-x-1"
                                >
                                    <HelpCircle size={10} className="text-amber-500" />
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Message Input Panel */}
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="p-3 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center space-x-2"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="අහන්න / Type message..."
                                className="flex-grow px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 dark:focus:border-amber-500 transition"
                            />
                            <button
                                type="submit"
                                className="p-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
