import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { 
    MapPin, 
    Navigation, 
    Search, 
    X, 
    Check, 
    Compass, 
    Building, 
    AlertCircle,
    Loader2
} from 'lucide-react';

const POPULAR_HUBS = [
    { city: "Bengaluru", address: "Indiranagar 100ft Road Luxury Depot, Bengaluru", lat: 12.9716, lng: 77.5946 },
    { city: "Delhi / NCR", address: "Connaught Place Central Hub, New Delhi", lat: 28.6139, lng: 77.2090 },
    { city: "Mumbai", address: "Bandra Kurla Complex (BKC) Terminal, Mumbai", lat: 19.0760, lng: 72.8777 },
    { city: "Shimla", address: "The Mall Road Fleet Station, Shimla", lat: 31.1048, lng: 77.1734 },
    { city: "Lucknow", address: "Gomti Nagar Premium Hub, Lucknow", lat: 26.8467, lng: 80.9462 },
    { city: "Pondicherry", address: "White Town Promenade Depot, Pondicherry", lat: 11.9416, lng: 79.8083 },
    { city: "Chennai", address: "Anna Nagar West Fleet Hub, Chennai", lat: 13.0827, lng: 80.2707 },
    { city: "Ranchi", address: "Doranda Main Road Terminal, Ranchi", lat: 23.3441, lng: 85.3096 }
];

const LocationSelectorModal = ({ isOpen, onClose }) => {
    const { 
        customerLocation, 
        setCustomerLocation, 
        axios, 
        user, 
        fetchCars 
    } = useAppContext();

    const [detectingGps, setDetectingGps] = useState(false);
    const [manualAddress, setManualAddress] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    if (!isOpen) return null;

    // Detect GPS with browser Geolocation API
    const handleDetectCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setDetectingGps(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                let addressName = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

                try {
                    // Reverse geocoding via OpenStreetMap Nominatim
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`);
                    if (res.ok) {
                        const data = await res.json();
                        addressName = data.display_name || addressName;
                    }
                } catch (e) {
                    console.warn("Reverse geocode fallback used:", e.message);
                }

                saveLocation({
                    address: addressName,
                    lat,
                    lng,
                    source: 'gps'
                });
                setDetectingGps(false);
            },
            (error) => {
                setDetectingGps(false);
                let message = "Unable to retrieve your location.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Location permission was denied. You can select your city or enter address below.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = "GPS location is currently unavailable.";
                }
                toast(message, { icon: '📍' });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    // Search manual address using OpenStreetMap Nominatim search
    const handleSearchAddress = async (e) => {
        e.preventDefault();
        if (!manualAddress.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=5`);
            if (res.ok) {
                const data = await res.json();
                if (data.length === 0) {
                    toast.error("No locations found matching search");
                }
                setSearchResults(data);
            }
        } catch (error) {
            toast.error("Failed to search location");
        } finally {
            setIsSearching(false);
        }
    };

    // Save location to State, LocalStorage, and DB
    const saveLocation = async (loc) => {
        setCustomerLocation(loc);
        localStorage.setItem('customer_location', JSON.stringify(loc));
        toast.success(`Pickup location set: ${loc.address.split(',')[0]}`);

        // Sync to backend DB if logged in
        if (user) {
            try {
                await axios.post('/api/user/save-location', {
                    address: loc.address,
                    lat: loc.lat,
                    lng: loc.lng
                });
            } catch (err) {
                console.error("save-location sync err:", err);
            }
        }

        // Refresh cars sorted by distance
        fetchCars({ userLat: loc.lat, userLng: loc.lng });
        onClose();
    };

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Compass className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Select Your Pickup / Delivery Location</h3>
                            <p className="text-xs text-slate-500">Find nearest cars and calculate delivery distance.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Option 1: Live Browser GPS */}
                <div>
                    <button
                        onClick={handleDetectCurrentLocation}
                        disabled={detectingGps}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
                    >
                        {detectingGps ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Detecting your precise GPS location...</span>
                            </>
                        ) : (
                            <>
                                <Navigation className="w-4 h-4 text-amber-300" />
                                <span>Use My Current Live Location</span>
                            </>
                        )}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2">
                        Prompts browser for one-time location permission.
                    </p>
                </div>

                <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                        Or Search Address
                    </span>
                </div>

                {/* Option 2: Search Manual Address */}
                <form onSubmit={handleSearchAddress} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 flex items-center">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                            <input 
                                type="text"
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                placeholder="Type your street, area, landmark, or city..."
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-60"
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="border border-slate-200 rounded-2xl bg-white shadow-lg overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                            {searchResults.map((result, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => saveLocation({
                                        address: result.display_name,
                                        lat: Number(result.lat),
                                        lng: Number(result.lon),
                                        source: 'search'
                                    })}
                                    className="w-full p-3 text-left hover:bg-blue-50/50 flex items-start gap-2.5 transition cursor-pointer"
                                >
                                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <div className="flex-1 text-xs">
                                        <p className="font-semibold text-slate-900 line-clamp-1">{result.display_name.split(',')[0]}</p>
                                        <p className="text-[10px] text-slate-400 line-clamp-1">{result.display_name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </form>

                {/* Option 3: Quick Select Major Hubs */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Select a Major Fleet Hub
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {POPULAR_HUBS.map((hub, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => saveLocation(hub)}
                                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                    customerLocation?.city === hub.city 
                                        ? "border-blue-600 bg-blue-50/60" 
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <p className="font-bold text-xs text-slate-900">{hub.city}</p>
                                <p className="text-[10px] text-slate-400 truncate">{hub.address.split(',')[0]}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Currently Selected Location Footer */}
                {customerLocation && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate text-slate-700 font-medium">{customerLocation.address}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            Active
                        </span>
                    </div>
                )}

            </motion.div>
        </div>
    );
};

export default LocationSelectorModal;
