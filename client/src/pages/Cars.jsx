import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import CarCard from '../components/CarCard';
import InteractiveCarMap from '../components/InteractiveCarMap';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Search, 
    Filter, 
    X, 
    RotateCcw, 
    SlidersHorizontal,
    Car,
    Navigation,
    MapPin,
    Map,
    LayoutGrid,
    Sparkles,
    Compass
} from 'lucide-react';

const Cars = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { 
        cars, 
        loadingCars, 
        fetchCars, 
        availableLocations, 
        availableCategories, 
        availableFuelTypes, 
        availableTransmissions,
        currency,
        axios,
        customerLocation,
        setIsLocationModalOpen
    } = useAppContext();

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'All');
    const [selectedFuel, setSelectedFuel] = useState('All');
    const [selectedTransmission, setSelectedTransmission] = useState('All');
    const [maxPrice, setMaxPrice] = useState(500);
    const [maxDistanceKm, setMaxDistanceKm] = useState('All'); // 5, 10, 20, 50, All
    const [sortBy, setSortBy] = useState('distance_asc');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Pickup & Return dates from URL if user came from Hero search
    const pickupLocationParam = searchParams.get('pickupLocation') || searchParams.get('location');
    const pickupDateParam = searchParams.get('pickupDate');
    const returnDateParam = searchParams.get('returnDate');

    const [filteredCars, setFilteredCars] = useState([]);

    // Check date availability if date params present
    const checkDateAvailability = async () => {
        if (!pickupDateParam || !returnDateParam) return;
        try {
            const { data } = await axios.post('/api/bookings/check-availability', {
                location: pickupLocationParam,
                pickupDate: pickupDateParam,
                returnDate: returnDateParam
            });
            if (data.success && data.availableCars) {
                setFilteredCars(data.availableCars);
            }
        } catch (error) {
            console.error("checkDateAvailability error:", error);
        }
    };

    // Client-side + backend filtering
    useEffect(() => {
        if (pickupDateParam && returnDateParam) {
            checkDateAvailability();
            return;
        }

        let list = [...cars];

        // Search text (brand, model, category, location)
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => 
                c.brand.toLowerCase().includes(q) ||
                c.model.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.location.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            list = list.filter(c => c.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        // Location filter
        if (selectedLocation !== 'All') {
            list = list.filter(c => c.location?.toLowerCase() === selectedLocation.toLowerCase());
        }

        // Fuel filter
        if (selectedFuel !== 'All') {
            list = list.filter(c => c.fuel_type?.toLowerCase() === selectedFuel.toLowerCase());
        }

        // Transmission filter
        if (selectedTransmission !== 'All') {
            list = list.filter(c => c.transmission?.toLowerCase() === selectedTransmission.toLowerCase());
        }

        // Distance Radius Filter
        if (maxDistanceKm !== 'All' && !isNaN(Number(maxDistanceKm))) {
            const maxD = Number(maxDistanceKm);
            list = list.filter(c => c.distanceKm !== undefined && c.distanceKm <= maxD);
        }

        // Max price filter
        list = list.filter(c => c.pricePerDay <= maxPrice);

        // Sorting
        if (sortBy === 'distance_asc') {
            list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        } else if (sortBy === 'price_asc') {
            list.sort((a, b) => a.pricePerDay - b.pricePerDay);
        } else if (sortBy === 'price_desc') {
            list.sort((a, b) => b.pricePerDay - a.pricePerDay);
        } else if (sortBy === 'year_desc') {
            list.sort((a, b) => b.year - a.year);
        }

        setFilteredCars(list);
    }, [
        cars, 
        search, 
        selectedCategory, 
        selectedLocation, 
        selectedFuel, 
        selectedTransmission, 
        maxDistanceKm,
        maxPrice, 
        sortBy,
        pickupDateParam,
        returnDateParam
    ]);

    const resetFilters = () => {
        setSearch('');
        setSelectedCategory('All');
        setSelectedLocation('All');
        setSelectedFuel('All');
        setSelectedTransmission('All');
        setMaxDistanceKm('All');
        setMaxPrice(500);
        setSortBy('distance_asc');
        setSearchParams({});
    };

    const categoriesList = ['All', ...(availableCategories.length ? availableCategories : ['SUV', 'Sedan', 'Van', 'Luxury', 'Electric'])];
    const fuelList = ['All', ...(availableFuelTypes.length ? availableFuelTypes : ['Petrol', 'Diesel', 'Electric', 'Hybrid'])];
    const transmissionList = ['All', ...(availableTransmissions.length ? availableTransmissions : ['Automatic', 'Manual', 'Semi-Automatic'])];
    const locationList = ['All', ...(availableLocations.length ? availableLocations : ['Bengaluru', 'Delhi', 'Mumbai', 'Chennai', 'Shimla', 'Lucknow'])];
    const distanceOptions = ['All', '5', '10', '20', '50'];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" />
                        Live Geospatial Fleet
                    </span>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Explore Vehicles Near You
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                        Find verified cars nearest to your doorstep. Filter by radius, body type, fuel, or rent rate.
                    </p>

                    {/* Prominent "Find Cars Near Me" & Live Location Banner */}
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer"
                        >
                            <Navigation className="w-4 h-4 text-amber-300" />
                            <span>{customerLocation ? "Update Pickup / Delivery Location" : "Find Cars Near Me (GPS)"}</span>
                        </button>

                        {customerLocation && (
                            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-full text-xs text-slate-700">
                                <MapPin className="w-4 h-4 text-rose-500" />
                                <span>Near: <strong>{customerLocation.address.split(',')[0]}</strong></span>
                                <button 
                                    onClick={() => setIsLocationModalOpen(true)}
                                    className="text-blue-600 hover:underline font-semibold text-[11px] ml-1 cursor-pointer"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main Search Input */}
                    <div className="pt-2 max-w-2xl mx-auto relative flex items-center">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                        <input 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search make, model, or city (e.g. BMW, SUV, Bengaluru)..."
                            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs text-slate-900"
                        />
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className="absolute right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                
                {/* Control Bar: View Mode Switch (Grid vs Map), Results Count & Sort */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setMobileFilterOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                            Filters
                        </button>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700">
                            Showing <span className="text-blue-600">{filteredCars.length}</span> {filteredCars.length === 1 ? 'vehicle' : 'vehicles'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle: Grid vs Map */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Grid View</span>
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'map' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Map className="w-3.5 h-3.5" />
                                <span>Map View</span>
                            </button>
                        </div>

                        {/* Sort by */}
                        <div className="flex items-center gap-2 text-xs">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white border border-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-xl outline-none cursor-pointer text-xs"
                            >
                                <option value="distance_asc">Nearest Distance First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="year_desc">Newest Models</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                    
                    {/* Desktop Sidebar Filters */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 sticky top-24">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-blue-600" />
                                    Filter Vehicles
                                </h3>
                                <button 
                                    onClick={resetFilters}
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                </button>
                            </div>

                            {/* Distance Radius Filter (5 km, 10 km, 20 km, 50 km) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Distance Radius
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {distanceOptions.map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setMaxDistanceKm(opt)}
                                            className={`py-1.5 px-2 text-xs font-semibold rounded-xl transition text-center cursor-pointer ${
                                                maxDistanceKm === opt
                                                    ? "bg-blue-600 text-white shadow-xs"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                                            }`}
                                        >
                                            {opt === 'All' ? 'Any km' : `${opt} km`}
                                        </button>
                                    ))}
                                </div>
                                {!customerLocation && maxDistanceKm !== 'All' && (
                                    <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                                        <Compass className="w-3 h-3 shrink-0" />
                                        <span>Click "Find Cars Near Me" to set your live origin</span>
                                    </p>
                                )}
                            </div>

                            {/* Max Daily Rate Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Price / Day</label>
                                    <span className="text-xs font-extrabold text-blue-600">{currency}{maxPrice}</span>
                                </div>
                                <input 
                                    type="range"
                                    min="20"
                                    max="500"
                                    step="10"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-blue-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>{currency}20</span>
                                    <span>{currency}500+</span>
                                </div>
                            </div>

                            {/* Vehicle Body Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Body Type</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {categoriesList.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${
                                                selectedCategory === cat 
                                                    ? "bg-blue-600 text-white font-semibold shadow-xs" 
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* City / Hub Location */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">City Hub</label>
                                <select 
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 p-2.5 rounded-xl outline-none cursor-pointer"
                                >
                                    {locationList.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fuel Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Fuel Type</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {fuelList.map(fuel => (
                                        <button
                                            key={fuel}
                                            type="button"
                                            onClick={() => setSelectedFuel(fuel)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${
                                                selectedFuel === fuel 
                                                    ? "bg-blue-600 text-white font-semibold shadow-xs" 
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                                            }`}
                                        >
                                            {fuel}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transmission */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Transmission</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {transmissionList.map(tr => (
                                        <button
                                            key={tr}
                                            type="button"
                                            onClick={() => setSelectedTransmission(tr)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${
                                                selectedTransmission === tr 
                                                    ? "bg-blue-600 text-white font-semibold shadow-xs" 
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                                            }`}
                                        >
                                            {tr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Main Area: Grid View or Map View */}
                    <div className="lg:col-span-3">
                        
                        {viewMode === 'map' ? (
                            <div className="space-y-6">
                                <InteractiveCarMap 
                                    userLocation={customerLocation} 
                                    cars={filteredCars} 
                                    currency={currency} 
                                    height="560px"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCars.map((car) => (
                                        <CarCard key={car._id} car={car} />
                                    ))}
                                </div>
                            </div>
                        ) : loadingCars ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="bg-white rounded-3xl overflow-hidden border border-slate-100 p-4 space-y-4 shadow-xs">
                                        <div className="aspect-[16/10] skeleton-shimmer rounded-2xl" />
                                        <div className="h-5 bg-slate-200 rounded-md w-3/4 skeleton-shimmer" />
                                        <div className="h-4 bg-slate-200 rounded-md w-1/2 skeleton-shimmer" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredCars.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
                                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                                    <Car className="w-8 h-8 opacity-60" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No Vehicles Found in this Range</h3>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Try expanding your distance filter radius (e.g. 50 km or Any km) or resetting filters.
                                </p>
                                <button 
                                    onClick={resetFilters}
                                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold transition cursor-pointer shadow-xs"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCars.map((car) => (
                                    <CarCard key={car._id} car={car} />
                                ))}
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {mobileFilterOpen && (
                    <div 
                        onClick={() => setMobileFilterOpen(false)}
                        className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end"
                    >
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xs bg-white h-full overflow-y-auto p-6 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 text-sm">Filter Vehicles</h3>
                                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Distance Radius */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Distance Radius</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {distanceOptions.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setMaxDistanceKm(opt)}
                                            className={`py-1.5 text-xs font-semibold rounded-xl text-center ${
                                                maxDistanceKm === opt ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {opt === 'All' ? 'Any' : `${opt}km`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Max Price */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                                    <span>Max Daily Price</span>
                                    <span className="text-blue-600 font-bold">{currency}{maxPrice}</span>
                                </div>
                                <input 
                                    type="range"
                                    min="20"
                                    max="500"
                                    step="10"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Category</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {categoriesList.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 text-xs rounded-xl font-medium ${
                                                selectedCategory === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => { resetFilters(); setMobileFilterOpen(false); }}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                >
                                    Reset
                                </button>
                                <button 
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Cars;
