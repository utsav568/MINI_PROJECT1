import React, { useState } from 'react';
import Title from './Title';
import CarCard from './CarCard';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

const FeaturedSection = () => {
    const navigate = useNavigate();
    const { cars, loadingCars } = useAppContext();
    const [selectedTab, setSelectedTab] = useState('All');

    const tabs = ['All', 'SUV', 'Sedan', 'Electric', 'Luxury'];

    const filteredCars = selectedTab === 'All' 
        ? cars 
        : cars.filter(car => 
            car.category?.toLowerCase() === selectedTab.toLowerCase() ||
            car.fuel_type?.toLowerCase() === selectedTab.toLowerCase()
        );

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Section Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Our Handpicked Fleet
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Featured Luxury & Everyday Cars
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl">
                        Carefully maintained, fully insured, and ready for your next road trip or business meeting.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl overflow-x-auto self-start md:self-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                                selectedTab === tab
                                    ? "bg-white text-blue-600 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid of Cars or Skeleton */}
            {loadingCars ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs">
                            <div className="aspect-[16/10] skeleton-shimmer" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 bg-slate-200 rounded-md w-3/4 skeleton-shimmer" />
                                <div className="h-4 bg-slate-200 rounded-md w-1/2 skeleton-shimmer" />
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <div className="h-6 bg-slate-100 rounded-lg skeleton-shimmer" />
                                    <div className="h-6 bg-slate-100 rounded-lg skeleton-shimmer" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredCars.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
                    <p className="text-slate-500 font-medium text-sm">No cars found under '{selectedTab}'.</p>
                    <button 
                        onClick={() => setSelectedTab('All')}
                        className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
                    >
                        View all vehicles
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCars.slice(0, 6).map((car) => (
                        <CarCard key={car._id} car={car} />
                    ))}
                </div>
            )}

            {/* View All CTA */}
            <div className="mt-14 text-center">
                <button
                    onClick={() => {
                        navigate('/cars');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold shadow-md transition-all duration-300 cursor-pointer"
                >
                    <span>Browse All Available Vehicles ({cars.length})</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </section>
    );
};

export default FeaturedSection;
