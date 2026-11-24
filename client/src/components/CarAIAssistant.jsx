import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import CarImage from './CarImage';
import { 
    Sparkles, 
    X, 
    Send, 
    Bot, 
    User, 
    Car, 
    ArrowRight, 
    AlertTriangle, 
    RotateCcw, 
    ChevronDown,
    Zap,
    ExternalLink,
    MapPin,
    Navigation,
    Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CarAIAssistant = () => {
    const { axios, currency, customerLocation, setIsLocationModalOpen } = useAppContext();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            text: "Hello! I'm your **SmartDrive AI Assistant**. I have live access to our vehicle inventory, doorstep delivery system, and GPS routing. How can I help you today? You can ask me for car recommendations by budget, passenger capacity, or cars nearest to your current location!",
            suggestedCars: []
        }
    ]);
    const [errorMsg, setErrorMsg] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const quickPrompts = [
        "Find 5-seater cars near my location under $70/day",
        "How does doorstep car delivery work?",
        "Best luxury SUV for a weekend road trip",
        "What are the nearest cars available right now?"
    ];

    const sendMessage = async (messageText) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || loading) return;

        const userMessage = { sender: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setErrorMsg(null);

        try {
            // Send conversation history and customer location to backend
            const historyPayload = messages.map(m => ({
                sender: m.sender,
                text: m.text
            }));

            const { data } = await axios.post('/api/ai/chat', {
                message: textToSend,
                history: historyPayload,
                customerLocation
            });

            if (data.success && data.reply) {
                const aiResponse = {
                    sender: 'ai',
                    text: data.reply,
                    suggestedCars: data.suggestedCars || []
                };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                setErrorMsg(data.message || "AI Assistant service is temporarily unavailable.");
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            const isMissingKey = error.response?.data?.aiUnavailable;
            if (isMissingKey) {
                setErrorMsg(serverMsg || "Google Gemini API key is missing in server/.env. Please configure GEMINI_API_KEY.");
            } else {
                setErrorMsg(serverMsg || "Failed to connect to AI Assistant. Please check backend connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                sender: 'ai',
                text: "Chat cleared. I'm ready to help you find the best rental car from our live fleet!",
                suggestedCars: []
            }
        ]);
        setErrorMsg(null);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative flex items-center gap-2.5 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-blue-500/30 transition-all cursor-pointer group"
                    aria-label="Open Car AI Assistant"
                >
                    <div className="relative">
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold tracking-tight">Car AI Assistant</span>
                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                        LIVE
                    </span>
                </motion.button>
            </div>

            {/* Chat Drawer / Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[430px] max-h-[82vh] h-[640px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-amber-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm tracking-tight">SmartDrive AI Assistant</h3>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    </div>
                                    <p className="text-[11px] text-blue-200">Grounded in MongoDB & Live Fleet Location</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={clearChat}
                                    title="Reset chat"
                                    className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Customer Location Pill inside AI Assistant */}
                        <div className="bg-slate-100/90 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-700 truncate max-w-[280px]">
                                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-semibold text-slate-900 truncate">
                                    {customerLocation?.address || "Location: India (Default)"}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsLocationModalOpen(true)}
                                className="text-[10px] font-bold text-blue-600 hover:underline shrink-0 cursor-pointer"
                            >
                                Change
                            </button>
                        </div>

                        {/* Error Notification Banner if AI service fails or key missing */}
                        {errorMsg && (
                            <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-start gap-2.5 text-xs text-amber-800">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold">{errorMsg}</p>
                                    <p className="text-[10px] text-amber-600 mt-0.5">
                                        Add your key in <code className="bg-amber-100 px-1 py-0.5 rounded">server/.env</code>: <code className="font-mono">GEMINI_API_KEY=your_key</code>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.sender === 'ai' && (
                                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                                    }`}>
                                        <div 
                                            className="whitespace-pre-wrap font-normal"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.text
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                    .replace(/\n/g, '<br />')
                                            }}
                                        />

                                        {/* Suggested Car Preview Cards attached to AI reply */}
                                        {msg.suggestedCars && msg.suggestedCars.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    Recommended From Inventory:
                                                </p>
                                                {msg.suggestedCars.map(car => (
                                                    <div 
                                                        key={car._id}
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            navigate(`/car-details/${car._id}`);
                                                        }}
                                                        className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer shadow-2xs group"
                                                    >
                                                        <CarImage 
                                                            src={car.image} 
                                                            alt={`${car.brand} ${car.model}`} 
                                                            className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100" 
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate text-xs">
                                                                    {car.brand} {car.model}
                                                                </p>
                                                                {car.distanceKm !== null && car.distanceKm !== undefined && (
                                                                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">
                                                                        {car.distanceKm} km
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 truncate">
                                                                {car.category} • {car.location} • <span className="font-semibold text-blue-600">{currency}{car.pricePerDay}/day</span>
                                                            </p>
                                                        </div>
                                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {msg.sender === 'user' && (
                                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-[10px]">
                                            U
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing / Thinking Loader */}
                            {loading && (
                                <div className="flex gap-2.5 items-center">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-slate-100 rounded-2xl px-4 py-3 border border-slate-200/60 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts Suggestions */}
                        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
                            {quickPrompts.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q)}
                                    disabled={loading}
                                    className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 rounded-full transition cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input Footer */}
                        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition"
                            >
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask for nearby cars, budget, doorstep delivery..."
                                    disabled={loading}
                                    className="w-full pl-3 pr-2 py-1.5 bg-transparent text-xs text-slate-900 outline-none placeholder-slate-400"
                                />
                                <button 
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition cursor-pointer shadow-xs"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CarAIAssistant;