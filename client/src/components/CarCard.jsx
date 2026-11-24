import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Users, Fuel, Gauge, MapPin, Star, ArrowRight, Navigation, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import CarImage from './CarImage';

const CarCard = ({ car }) => {
    const { currency, customerLocation } = useAppContext();
    const navigate = useNavigate();

    if (!car) return null;

    const isAvailable = car.isAvaliable !== false;

    return (
        <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
                navigate(`/car-details/${car._id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-blue-200/80 shadow-md hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
            {/* Image Container with Fallback */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <CarImage 
                    src={car.image} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                        isAvailable 
                            ? "bg-emerald-500/90 text-white" 
                            : "bg-rose-500/90 text-white"
                    }`}>
                        {isAvailable ? "Available" : "Reserved"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                        {car.category || "Car"}
                    </span>
                </div>

                {/* Live Distance Pill if user location exists */}
                {car.distanceKm !== undefined && car.distanceKm !== null && car.distanceKm < 9000 && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        <Navigation className="w-3 h-3 text-amber-300" />
                        <span>{car.distanceKm} km away</span>
                    </div>
                )}

                {/* Price Overlay Banner */}
                <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl flex items-baseline gap-1 shadow-lg z-10">
                    <span className="text-base font-extrabold text-blue-400">{currency}{car.pricePerDay}</span>
                    <span className="text-[11px] text-slate-300 font-normal">/day</span>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {car.brand} {car.model}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {car.year} • {car.category}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full text-slate-800 text-[11px] font-semibold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>4.9</span>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                            <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{car.seating_capacity} Seats</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                            <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{car.fuel_type || "Petrol"}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                            <Gauge className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{car.transmission || "Automatic"}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl" title={car.hubAddress || car.location}>
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{car.location || "City Hub"}</span>
                        </div>
                    </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 transition">
                        View Details & Book
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Doorstep Delivery
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default CarCard;
