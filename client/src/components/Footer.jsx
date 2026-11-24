import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Shield, Heart, Sparkles } from "lucide-react";

const Footer = () => {
    return (
        <footer className="mt-24 border-t border-slate-200 bg-slate-900 text-slate-400 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    
                    {/* Brand Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="inline-block">
                            <div className="flex items-center gap-2">
                                <img src={assets.logo} alt="SmartDrive AI" className="h-8 brightness-200" />
                                <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                                    SMARTDRIVE AI
                                </span>
                            </div>
                        </Link>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                            SmartDrive AI is India's premier AI-powered, location-based car rental and doorstep delivery platform. Enjoy instant booking, real-time fleet GPS tracking, and 24/7 AI concierge.
                        </p>
                        
                        <div className="pt-2 flex items-center gap-3">
                            {[
                                { icon: assets.facebook_logo, label: "Facebook" },
                                { icon: assets.instagram_logo, label: "Instagram" },
                                { icon: assets.twitter_logo, label: "Twitter" },
                                { icon: assets.gmail_logo, label: "Gmail" }
                            ].map((item, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    aria-label={item.label}
                                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-all"
                                >
                                    <img src={item.icon} alt="" className="w-4 h-4 brightness-200" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Quick Links</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                            <li><Link to="/cars" className="hover:text-white transition">Browse Vehicles</Link></li>
                            <li><Link to="/my-bookings" className="hover:text-white transition">My Bookings</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition">Contact & Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Vehicle Types */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Categories</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link to="/cars?category=SUV" className="hover:text-white transition">Luxury SUVs</Link></li>
                            <li><Link to="/cars?category=Sedan" className="hover:text-white transition">Executive Sedans</Link></li>
                            <li><Link to="/cars?category=Electric" className="hover:text-white transition">Green Electric</Link></li>
                            <li><Link to="/cars?category=Van" className="hover:text-white transition">Spacious Vans</Link></li>
                        </ul>
                    </div>

                    {/* Contact info */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Support & Concierge</h4>
                        <ul className="space-y-3 text-xs">
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                                <span>+1 (800) 555-RENTAL</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                                <span>concierge@smartdriveai.com</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <span>Available across India & worldwide hub airports</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© 2026 SmartDrive AI Platform Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
                        <a href="#" className="hover:text-slate-400 transition">Security</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
