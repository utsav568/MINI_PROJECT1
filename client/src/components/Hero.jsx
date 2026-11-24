import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { MapPin, Calendar, Search, Sparkles, ShieldCheck, Zap, Award, Navigation } from 'lucide-react';
import CarImage from './CarImage';

const Hero = () => {
    const { 
        pickupLocation, 
        setPickupLocation, 
        pickupDate, 
        setPickupDate, 
        returnDate, 
        setReturnDate, 
        availableLocations, 
        customerLocation,
        setIsLocationModalOpen,
        navigate 
    } = useAppContext();

    const [selectedCategoryPill, setSelectedCategoryPill] = useState('All');

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (pickupLocation && pickupLocation !== 'All') params.append('location', pickupLocation);
        if (pickupDate) params.append('pickupDate', pickupDate);
        if (returnDate) params.append('returnDate', returnDate);
        if (selectedCategoryPill && selectedCategoryPill !== 'All') params.append('category', selectedCategoryPill);

        navigate(`/cars?${params.toString()}`);
    };

    const todayString = new Date().toISOString().split('T')[0];

    const categoryPills = ['All', 'SUV', 'Sedan', 'Electric', 'Luxury'];

    const displayLocations = Array.from(new Set([
        ...availableLocations,
        'Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Shimla', 'Lucknow', 'Pondicherry', 'Ranchi'
    ])).filter(Boolean);

    return (
        <div className="relative min-h-[90vh] bg-gradient-to-b from-slate-50 via-blue-50/30 to-white flex flex-col items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
            
            {/* Background decorative glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Badges Bar */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-2 mb-6"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>SmartDrive AI — Next-Gen Geospatial & Autonomous Car Rental</span>
                </div>

                <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-blue-600 transition cursor-pointer"
                >
                    <Navigation className="w-3.5 h-3.5 text-amber-300" />
                    <span>{customerLocation ? `Near: ${customerLocation.address.split(',')[0]}` : "Detect GPS Location"}</span>
                </button>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 text-center tracking-tight max-w-4xl leading-tight"
            >
                Drive the Extraordinary. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
                    Seamless Doorstep Car Delivery
                </span>.
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 text-base sm:text-lg text-slate-600 text-center max-w-2xl font-normal leading-relaxed"
            >
                Find nearest cars within 5 km to 50 km radius or get them delivered directly to your doorstep with live GPS tracking.
            </motion.p>

            {/* Quick Category Filter Pills */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-2 mt-6 flex-wrap justify-center"
            >
                {categoryPills.map((pill) => (
                    <button
                        key={pill}
                        type="button"
                        onClick={() => setSelectedCategoryPill(pill)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                            selectedCategoryPill === pill
                                ? "bg-slate-900 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                        {pill}
                    </button>
                ))}
            </motion.div>

            {/* Search Booking Bar */}
            <motion.form 
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                onSubmit={handleSearch}
                className="mt-8 w-full max-w-4xl bg-white rounded-3xl sm:rounded-full p-4 sm:p-3 shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
            >
                {/* Location Select */}
                <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pickup Hub</span>
                        <select 
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                        >
                            <option value="">All Locations / Cities</option>
                            {displayLocations.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pickup Date */}
                <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pick-up Date</span>
                        <input 
                            type="date"
                            value={pickupDate}
                            min={todayString}
                            onChange={(e) => {
                                setPickupDate(e.target.value);
                                if (returnDate && returnDate < e.target.value) {
                                    setReturnDate(e.target.value);
                                }
                            }}
                            className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Return Date */}
                <div className="flex-1 flex items-center gap-3 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Return Date</span>
                        <input 
                            type="date"
                            value={returnDate}
                            min={pickupDate || todayString}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Search CTA */}
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl sm:rounded-full shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                    <Search className="w-4 h-4" />
                    <span>Find Vehicles</span>
                </motion.button>
            </motion.form>

            {/* Trust Highlights */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500"
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Verified Insured Vehicles</span>
                </div>
                <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span>Doorstep Delivery Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Instant Booking Confirmation</span>
                </div>
            </motion.div>

            {/* Hero Main Car Image */}
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-10 max-w-4xl w-full px-4 flex justify-center"
            >
                <img 
                    src={assets.main_car} 
                    alt="Luxury Performance Car" 
                    className="w-full max-h-[380px] object-contain drop-shadow-2xl hover:scale-102 transition-transform duration-500" 
                />
            </motion.div>
        </div>
    );
};

export default Hero;
