import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send, 
    HelpCircle, 
    ChevronDown, 
    Sparkles, 
    ShieldCheck, 
    Clock, 
    CheckCircle2 
} from 'lucide-react';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Booking Inquiry');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // FAQ Accordion active state
    const [activeFaq, setActiveFaq] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            toast.success("Thank you! Your message has been routed to our concierge team.");
            setName('');
            setEmail('');
            setMessage('');
        }, 800);
    };

    const faqs = [
        {
            q: "What documents do I need to rent a vehicle?",
            a: "All drivers must present a valid government-issued driver's license (held for at least 1 year) and a valid government ID or passport. International travelers may need an International Driving Permit (IDP)."
        },
        {
            q: "How does the Car AI Assistant help me choose?",
            a: "Our built-in Car AI Assistant has live real-time access to our entire MongoDB fleet inventory. You can ask it for cars under a specific daily budget, vehicles with 5+ seats, comparisons between SUVs and Sedans, or rental guidelines."
        },
        {
            q: "What is your reservation cancellation policy?",
            a: "We offer 100% free cancellation up to 24 hours prior to your scheduled pickup time with an instant refund to your original payment method. You can cancel directly from your 'My Bookings' dashboard."
        },
        {
            q: "Is insurance included in the daily rate?",
            a: "Yes! Every rental includes comprehensive Collision Damage Waiver (CDW), third-party liability coverage, and 24/7 complimentary roadside assistance."
        },
        {
            q: "How are payments processed and verified?",
            a: "All online payments are securely verified on our backend using cryptographic HMAC signatures (Razorpay payment integration in live and test modes). Your transaction is verified before any booking is created."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-16">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Dedicated Concierge
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        We're Here to Assist You 24/7
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-slate-500 font-normal">
                        Have questions about vehicle availability, special bookings, or hosting your car? Reach out to our customer care team or consult our quick FAQs.
                    </p>
                </div>

                {/* Contact Channels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900">24/7 Support Hotline</h3>
                            <p className="text-xs text-slate-500 mt-1">Round-the-clock road & booking support</p>
                            <p className="text-sm font-extrabold text-blue-600 mt-2">+1 (800) 555-RENTAL</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900">Concierge Email</h3>
                            <p className="text-xs text-slate-500 mt-1">Typical response within 2 hours</p>
                            <p className="text-sm font-extrabold text-indigo-600 mt-2">concierge@carrental.com</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900">Hub Locations</h3>
                            <p className="text-xs text-slate-500 mt-1">Operating in 10+ major cities & airports</p>
                            <p className="text-sm font-extrabold text-emerald-600 mt-2">Bengaluru, Mumbai, Delhi & more</p>
                        </div>
                    </div>
                </div>

                {/* Main Section: Contact Form + FAQ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Send Us a Message</h3>
                            <p className="text-xs text-slate-500 mt-1">Fill out the form below and an agent will reply promptly.</p>
                        </div>

                        {submitted ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                                <h4 className="font-bold text-emerald-900 text-sm">Message Sent Successfully!</h4>
                                <p className="text-xs text-emerald-700">
                                    Our concierge will respond to your email address within 2 hours.
                                </p>
                                <button 
                                    onClick={() => setSubmitted(false)}
                                    className="text-xs font-semibold text-emerald-800 underline cursor-pointer"
                                >
                                    Send another inquiry
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        placeholder="John Doe"
                                        required 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="name@example.com"
                                        required 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Inquiry Subject</label>
                                    <select 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                                    >
                                        <option value="Booking Inquiry">Booking Inquiry</option>
                                        <option value="Host Listing Question">Host / Vehicle Listing Question</option>
                                        <option value="Billing & Refund">Billing & Refund Assistance</option>
                                        <option value="Corporate Fleet">Corporate / Long-Term Fleet Rental</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Message</label>
                                    <textarea 
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we assist your trip?..."
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    <Send className="w-4 h-4" />
                                    {submitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* FAQ Accordion */}
                    <div className="space-y-4">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
                            <p className="text-xs text-slate-500 mt-1">Answers to common inquiries regarding car booking, policies, and AI assistance.</p>
                        </div>

                        {faqs.map((faq, index) => {
                            const isOpen = activeFaq === index;
                            return (
                                <div 
                                    key={index} 
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                                >
                                    <button 
                                        type="button"
                                        onClick={() => setActiveFaq(isOpen ? null : index)}
                                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-blue-600 transition cursor-pointer"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                                            isOpen ? "rotate-180 text-blue-600" : ""
                                        }`} />
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-3"
                                            >
                                                {faq.a}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Contact;
