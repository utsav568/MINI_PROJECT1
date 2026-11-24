import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import CarImage from '../components/CarImage';
import { 
    Users, 
    Fuel, 
    Gauge, 
    MapPin, 
    Calendar, 
    ShieldCheck, 
    Check, 
    ArrowLeft, 
    Star, 
    CreditCard, 
    AlertCircle, 
    Lock,
    Zap,
    Truck,
    Building2,
    Phone,
    Navigation,
    Info,
    CheckCircle2,
    CalendarDays,
    AlertTriangle,
    Clock,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Send,
    ThumbsUp
} from 'lucide-react';

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        cars, 
        axios, 
        pickupDate, 
        setPickupDate, 
        returnDate, 
        setReturnDate, 
        user, 
        setShowLogin,
        currency,
        customerLocation,
        setIsLocationModalOpen,
        socket
    } = useAppContext();

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingInProgress, setBookingInProgress] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Image Gallery State
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Doorstep Delivery & Customer Contact Phone
    const [deliveryOption, setDeliveryOption] = useState('delivery'); // 'pickup' | 'delivery'
    const [deliveryAddress, setDeliveryAddress] = useState(customerLocation?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');

    // Booking Calendar & Reserved Dates
    const [reservedDates, setReservedDates] = useState([]);
    const [loadingReserved, setLoadingReserved] = useState(false);

    // Customer Reviews & Ratings State
    const [reviewsData, setReviewsData] = useState({
        totalReviews: 0,
        avgRating: 4.8,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: []
    });
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Synchronize delivery address and phone when context/user loads
    useEffect(() => {
        if (customerLocation?.address && !deliveryAddress) {
            setDeliveryAddress(customerLocation.address);
        }
    }, [customerLocation]);

    useEffect(() => {
        if (user?.phone && !phone) {
            setPhone(user.phone);
        }
    }, [user]);

    // Fetch Reserved Dates for this specific car
    const fetchReservedDates = async () => {
        if (!id) return;
        try {
            setLoadingReserved(true);
            const { data } = await axios.get(`/api/bookings/car-reserved-dates/${id}`);
            if (data.success && data.reservedDates) {
                setReservedDates(data.reservedDates);
            }
        } catch (err) {
            console.error("fetchReservedDates error:", err.message);
        } finally {
            setLoadingReserved(false);
        }
    };

    // Fetch Verified Reviews for this car
    const fetchCarReviews = async () => {
        if (!id) return;
        try {
            const { data } = await axios.get(`/api/reviews/car/${id}`);
            if (data.success) {
                setReviewsData({
                    totalReviews: data.totalReviews || 0,
                    avgRating: data.avgRating || 4.8,
                    distribution: data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                    reviews: data.reviews || []
                });
            }
        } catch (err) {
            console.error("fetchCarReviews error:", err.message);
        }
    };

    // Handle Submitting a New Review
    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please sign in to submit a verified trip review");
            setShowLogin(true);
            return;
        }

        if (!userComment.trim()) {
            toast.error("Please enter a short review of your driving experience");
            return;
        }

        try {
            setSubmittingReview(true);
            const { data } = await axios.post('/api/reviews/add', {
                carId: id,
                rating: userRating,
                comment: userComment.trim()
            });

            if (data.success) {
                toast.success(data.message || "Review published!");
                setUserComment('');
                fetchCarReviews();
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Review submission failed");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Fetch car details directly from backend to guarantee fresh coordinates and details
    useEffect(() => {
        const fetchSingleCar = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/user/cars/${id}`);
                if (data.success && data.car) {
                    setCar(data.car);
                } else {
                    const found = cars.find(c => c._id === id);
                    if (found) setCar(found);
                }
            } catch (err) {
                const found = cars.find(c => c._id === id);
                if (found) setCar(found);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSingleCar();
            fetchReservedDates();
            fetchCarReviews();
        }
    }, [id, cars]);

    // Real-Time Socket Listener: Auto-update reserved calendar when any customer confirms a reservation
    useEffect(() => {
        if (!socket || !id) return;

        socket.emit("join_car_room", id);

        const handleGlobalBooking = (data) => {
            if (data.carId === id) {
                console.log("⚡ Real-time calendar refresh for car:", id);
                fetchReservedDates();
            }
        };

        const handleCalendarUpdated = (data) => {
            if (data.carId === id) {
                fetchReservedDates();
            }
        };

        socket.on("booking_created_global", handleGlobalBooking);
        socket.on("car_dates_updated", handleCalendarUpdated);

        return () => {
            socket.off("booking_created_global", handleGlobalBooking);
            socket.off("car_dates_updated", handleCalendarUpdated);
        };
    }, [socket, id]);

    // Set default dates if empty
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 2);

        if (!pickupDate) {
            setPickupDate(today.toISOString().split('T')[0]);
        }
        if (!returnDate) {
            setReturnDate(tomorrow.toISOString().split('T')[0]);
        }
    }, []);

    // Construct image gallery array
    const galleryImages = useMemo(() => {
        if (!car) return [];
        const list = [];
        if (car.image) list.push(car.image);
        if (Array.isArray(car.images)) {
            car.images.forEach(img => {
                if (img && !list.includes(img)) list.push(img);
            });
        }
        // Complement with high-definition multi-angle views
        if (list.length === 1) {
            list.push("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800");
            list.push("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800");
            list.push("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800");
        }
        return list;
    }, [car]);

    // Check if a given date or range overlaps with active reserved bookings
    const checkDateOverlap = (startStr, endStr) => {
        if (!startStr || !endStr || !reservedDates.length) return false;
        const start = new Date(startStr);
        const end = new Date(endStr);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return reservedDates.some(res => {
            const resStart = new Date(res.pickupDate);
            const resEnd = new Date(res.returnDate);
            resStart.setHours(0, 0, 0, 0);
            resEnd.setHours(23, 59, 59, 999);
            return start <= resEnd && end >= resStart;
        });
    };

    const hasDateConflict = useMemo(() => {
        return checkDateOverlap(pickupDate, returnDate);
    }, [pickupDate, returnDate, reservedDates]);

    // Calculate Haversine Distance between Hub and Customer
    const calcDistanceKm = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.max(1, Math.round(R * c * 10) / 10);
    };

    const deliveryDistance = useMemo(() => {
        if (!car) return 0;
        const carLat = car.coordinates?.lat || 0;
        const carLng = car.coordinates?.lng || 0;
        const userLat = customerLocation?.lat || 0;
        const userLng = customerLocation?.lng || 0;
        if (carLat && carLng && userLat && userLng) {
            return calcDistanceKm(userLat, userLng, carLat, carLng);
        }
        return 4.5;
    }, [car, customerLocation]);

    // Live calculation of rental days & pricing with delivery charges
    const calcPricing = () => {
        if (!car || !pickupDate || !returnDate) {
            return { days: 1, baseTotal: car ? car.pricePerDay : 0, taxes: 0, deliveryFee: 0, grandTotal: car ? car.pricePerDay : 0 };
        }

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        let diffDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        if (isNaN(diffDays) || diffDays <= 0) diffDays = 1;

        const baseTotal = car.pricePerDay * diffDays;
        const taxes = Math.round(baseTotal * 0.05); // 5% service fee

        // Doorstep Delivery Charge: base ₹50 + ₹15/km
        let deliveryFee = 0;
        if (deliveryOption === 'delivery') {
            const perKmRate = car.deliveryFeePerKm || 15;
            deliveryFee = Math.round(50 + (deliveryDistance * perKmRate));
        }

        const grandTotal = baseTotal + taxes + deliveryFee;

        return { days: diffDays, baseTotal, taxes, deliveryFee, grandTotal };
    };

    const { days, baseTotal, taxes, deliveryFee, grandTotal } = calcPricing();

    // Trigger Checkout & Validate inputs
    const handleProceedToPayment = (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please sign in or create an account to reserve this car");
            setShowLogin(true);
            return;
        }

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        if (returned < picked) {
            toast.error("Drop-off date cannot be earlier than pickup date");
            return;
        }

        // Strict Check: Prevent overlapping dates before proceeding
        if (hasDateConflict) {
            toast.error("This car is already booked for these dates. Please select another date or car.");
            return;
        }

        // Validate Mobile Phone Number (8-15 digits)
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        const phoneRegex = /^\+?[0-9]{8,15}$/;
        if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
            toast.error("Please enter a valid mobile phone number (8-15 digits)");
            return;
        }

        // Validate Delivery Address if doorstep delivery is chosen
        if (deliveryOption === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
            toast.error("Please provide a complete doorstep delivery address");
            return;
        }

        setShowPaymentModal(true);
    };

    // Execute backend verified payment + booking creation
    const handleConfirmBookingWithPayment = async () => {
        setBookingInProgress(true);
        try {
            // Step 1: Create Payment Order on Backend
            const orderRes = await axios.post('/api/payment/create-order', {
                amount: grandTotal,
                currency: currency === '$' ? 'USD' : currency
            });

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message || "Failed to initiate payment");
            }

            const { orderId, signatureToken, mode } = orderRes.data;

            // Step 2: Verify Payment on Backend
            const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const verifyRes = await axios.post('/api/payment/verify', {
                orderId,
                paymentId: mockPaymentId,
                amount: grandTotal,
                signatureToken,
                mode
            });

            if (!verifyRes.data.success || !verifyRes.data.verified) {
                throw new Error("Payment verification failed on server");
            }

            // Step 3: Create Confirmed Booking with concurrency validation on backend
            const bookingRes = await axios.post('/api/bookings/create', {
                car: id,
                pickupDate,
                returnDate,
                paymentId: verifyRes.data.paymentId,
                paymentMethod: "Razorpay (Verified Test)",
                paymentStatus: "paid",
                customerPhone: phone.trim(),
                customerName: user?.name || "Customer",
                deliveryOption,
                deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress.trim() : (car.hubAddress || car.location),
                deliveryCoordinates: customerLocation ? { lat: customerLocation.lat, lng: customerLocation.lng } : (car.coordinates || { lat: 0, lng: 0 }),
                deliveryDistanceKm: deliveryOption === 'delivery' ? deliveryDistance : 0,
                deliveryFee
            });

            if (bookingRes.data.success) {
                toast.success("Payment verified! SmartDrive AI booking confirmed in real time!");
                fetchReservedDates();
                setTimeout(() => {
                    setShowPaymentModal(false);
                    navigate('/my-bookings');
                }, 1200);
            } else {
                toast.error(bookingRes.data.message || "This car is already booked for these dates. Please select another date or car.");
            }

        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            toast.error(msg || "This car is already booked for these dates. Please select another date or car.");
            fetchReservedDates();
        } finally {
            setBookingInProgress(false);
        }
    };

    const todayString = new Date().toISOString().split('T')[0];

    // Generate upcoming 21 days for the interactive calendar strip
    const calendarDays = useMemo(() => {
        const daysArr = [];
        const base = new Date();
        base.setHours(0, 0, 0, 0);

        for (let i = 0; i < 21; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            const iso = d.toISOString().split('T')[0];

            // Check if this single date falls inside any active reservation
            const isBooked = reservedDates.some(res => {
                const s = new Date(res.pickupDate).toISOString().split('T')[0];
                const e = new Date(res.returnDate).toISOString().split('T')[0];
                return iso >= s && iso <= e;
            });

            daysArr.push({
                date: d,
                iso,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate(),
                monthName: d.toLocaleDateString('en-US', { month: 'short' }),
                isBooked
            });
        }
        return daysArr;
    }, [reservedDates]);

    if (loading) return <Loader />;
    if (!car) {
        return (
            <div className="py-24 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-slate-800">Car Not Found</h2>
                <p className="text-sm text-slate-500 mt-1">The vehicle you are looking for is unavailable or removed.</p>
                <button onClick={() => navigate('/cars')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-xs font-semibold">
                    Browse All Cars
                </button>
            </div>
        );
    }

    const featuresList = [
        "Comprehensive Collision Damage Waiver (CDW)",
        "24/7 SmartDrive AI Roadside Assistance & Breakdown Support",
        "GPS Navigation & Real-Time Traffic Updates",
        "Bluetooth & Apple CarPlay / Android Auto",
        "Pre-Delivery Sanitization & Safety Inspection",
        "Free Cancellation up to 24 Hours Prior"
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Back button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-6 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to vehicle catalog
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left 2 Columns: Image Gallery, Specifications, Booking Calendar, Customer Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Main Interactive Car Image Gallery */}
                        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
                            
                            {/* Main Display Image */}
                            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden group">
                                <CarImage 
                                    src={galleryImages[activeImageIndex] || car.image} 
                                    alt={`${car.brand} ${car.model}`}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />

                                {/* Top Badges */}
                                <div className="absolute top-4 left-4 flex gap-2 z-10">
                                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                        {car.category || "Luxury"}
                                    </span>
                                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${
                                        car.isAvaliable ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                    }`}>
                                        {car.isAvaliable ? "Available Now" : "Currently Booked"}
                                    </span>
                                </div>

                                {/* Gallery Arrow Controls */}
                                {galleryImages.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                            title="Previous Photo"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                            title="Next Photo"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {/* Image Counter Badge */}
                                <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                                    Photo {activeImageIndex + 1} of {galleryImages.length}
                                </div>
                            </div>

                            {/* Thumbnail Selector Strip */}
                            {galleryImages.length > 1 && (
                                <div className="p-3 bg-slate-100/70 border-t border-slate-100 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                                                activeImageIndex === idx 
                                                    ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105' 
                                                    : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="p-6 sm:p-8">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                            {car.brand} {car.model}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm font-medium text-slate-500">
                                                Model Year: <span className="font-semibold text-slate-800">{car.year}</span> • City: <span className="font-semibold text-slate-800">{car.location}</span>
                                            </p>
                                            <span className="text-slate-300">•</span>
                                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                <span>{reviewsData.avgRating} ({reviewsData.totalReviews} reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                                            {currency}{car.pricePerDay}
                                            <span className="text-xs font-normal text-slate-400"> / day</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Vehicle Station / Hub Badge */}
                                <div className="mt-5 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Vehicle Base Station</p>
                                            <p className="text-xs font-bold text-slate-800">{car.hubAddress || `${car.location} Central Hub`}</p>
                                        </div>
                                    </div>
                                    {car.coordinates && car.coordinates.lat !== 0 && (
                                        <span className="text-[11px] font-mono bg-white px-3 py-1 rounded-full text-slate-600 border border-slate-200 shadow-2xs">
                                            📍 {car.coordinates.lat.toFixed(3)}°N, {car.coordinates.lng.toFixed(3)}°E
                                        </span>
                                    )}
                                </div>

                                {/* Key Specs Bar */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                                    <div className="bg-slate-50 p-3.5 rounded-2xl flex flex-col items-center text-center">
                                        <Users className="w-5 h-5 text-blue-600 mb-1" />
                                        <span className="text-[11px] text-slate-400 font-medium">Capacity</span>
                                        <span className="text-xs font-bold text-slate-800">{car.seating_capacity} Passengers</span>
                                    </div>
                                    <div className="bg-slate-50 p-3.5 rounded-2xl flex flex-col items-center text-center">
                                        <Fuel className="w-5 h-5 text-amber-500 mb-1" />
                                        <span className="text-[11px] text-slate-400 font-medium">Fuel Type</span>
                                        <span className="text-xs font-bold text-slate-800">{car.fuel_type || "Petrol"}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3.5 rounded-2xl flex flex-col items-center text-center">
                                        <Gauge className="w-5 h-5 text-emerald-500 mb-1" />
                                        <span className="text-[11px] text-slate-400 font-medium">Transmission</span>
                                        <span className="text-xs font-bold text-slate-800">{car.transmission || "Automatic"}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3.5 rounded-2xl flex flex-col items-center text-center">
                                        <MapPin className="w-5 h-5 text-rose-500 mb-1" />
                                        <span className="text-[11px] text-slate-400 font-medium">Location</span>
                                        <span className="text-xs font-bold text-slate-800 truncate max-w-full">{car.location || "City Hub"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Booking Calendar & Reserved Dates Strip */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <CalendarDays className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Vehicle Availability & Reserved Schedule</h3>
                                        <p className="text-xs text-slate-500">Live booking calendar showing currently booked and available dates.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                                    </span>
                                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Booked
                                    </span>
                                </div>
                            </div>

                            {/* Active Reservations Badges */}
                            {reservedDates.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Currently Reserved Periods:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {reservedDates.map((res, idx) => (
                                            <div 
                                                key={idx}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
                                            >
                                                <Lock className="w-3.5 h-3.5 text-rose-600" />
                                                <span>
                                                    <strong>{new Date(res.pickupDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</strong> to <strong>{new Date(res.returnDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</strong> ({res.days || 1}d)
                                                </span>
                                                <span className="text-[10px] uppercase font-bold bg-rose-200/80 px-1.5 py-0.5 rounded text-rose-900">
                                                    {res.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>No active conflicting bookings found for this car. All upcoming dates are open!</span>
                                </div>
                            )}

                            {/* 14-Day Interactive Visual Strip */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                                    Upcoming 2-Week Schedule (Click date to select):
                                </p>
                                <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-14 gap-2">
                                    {calendarDays.slice(0, 14).map((day, idx) => {
                                        const isSelected = pickupDate === day.iso || returnDate === day.iso;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    if (day.isBooked) {
                                                        toast.error("This date is already reserved. Please select another date.");
                                                    } else {
                                                        setPickupDate(day.iso);
                                                    }
                                                }}
                                                className={`p-2 rounded-xl text-center border transition flex flex-col items-center cursor-pointer ${
                                                    day.isBooked
                                                        ? 'bg-rose-50 border-rose-200 text-rose-700 opacity-90 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20'
                                                            : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-800'
                                                }`}
                                                title={day.isBooked ? "Reserved / Unavailable" : "Available"}
                                            >
                                                <span className="text-[10px] uppercase font-medium">{day.dayName}</span>
                                                <span className="text-sm font-black my-0.5">{day.dayNum}</span>
                                                <span className="text-[9px] font-bold">{day.isBooked ? 'Booked' : 'Open'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Description & Included Perks */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Vehicle Overview</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                                    {car.description || "Experience the exhilarating performance and refined comfort of this exceptional vehicle. Built with state-of-the-art engineering and designed for both executive comfort and leisure drives."}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Included SmartDrive AI Privileges</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {featuresList.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Customer Reviews & Verified Ratings Section */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                        Customer Reviews & Verified Ratings
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Real feedback from verified customers who completed trips in this vehicle.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-black text-slate-900">{reviewsData.avgRating}</div>
                                    <div>
                                        <div className="flex items-center text-amber-400">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className="w-4 h-4 fill-amber-400" />
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-medium">
                                            {reviewsData.totalReviews} verified trips
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviewsData.reviews.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        Be the first customer to leave a verified review for this car!
                                    </div>
                                ) : (
                                    reviewsData.reviews.map((rev) => (
                                        <div key={rev._id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                                                        {rev.userImage ? (
                                                            <img src={rev.userImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            rev.userName?.charAt(0) || "U"
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                                                            {rev.isVerifiedTrip && (
                                                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                                    ✓ Verified Trip
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">
                                                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent trip'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-amber-400">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star 
                                                            key={star} 
                                                            className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                                {rev.comment}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Review Form */}
                            <form onSubmit={handleAddReview} className="pt-6 border-t border-slate-100 space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave a Verified Review</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                                    <div className="flex items-center gap-1 cursor-pointer">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setUserRating(star)}
                                                className="cursor-pointer focus:outline-none"
                                            >
                                                <Star 
                                                    className={`w-5 h-5 transition ${
                                                        star <= userRating 
                                                            ? 'fill-amber-400 text-amber-400 scale-110' 
                                                            : 'text-slate-300 hover:text-amber-300'
                                                    }`} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 ml-1">{userRating} / 5</span>
                                </div>
                                <textarea
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    placeholder="Write your feedback regarding vehicle comfort, cleanliness, and handover experience..."
                                    rows={3}
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {submittingReview ? "Submitting..." : "Submit Verified Review"}
                                </button>
                            </form>
                        </div>

                    </div>

                    {/* Right Column: Interactive Booking Form with Doorstep Delivery & Real-time Overlap Guard */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl sticky top-24 space-y-5">
                            
                            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <span className="text-2xl font-black text-slate-900">{currency}{car.pricePerDay}</span>
                                    <span className="text-xs text-slate-400"> / 24 hours</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    <span>{reviewsData.avgRating} ({reviewsData.totalReviews} reviews)</span>
                                </div>
                            </div>

                            <form onSubmit={handleProceedToPayment} className="space-y-4">
                                
                                {/* Delivery Mode Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Pickup & Delivery Option
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryOption('delivery')}
                                            className={`p-3 rounded-2xl border text-left transition flex flex-col cursor-pointer ${
                                                deliveryOption === 'delivery'
                                                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20'
                                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <Truck className={`w-4 h-4 ${deliveryOption === 'delivery' ? 'text-blue-600' : 'text-slate-500'}`} />
                                                {deliveryOption === 'delivery' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">Doorstep Delivery</span>
                                            <span className="text-[10px] text-slate-500">Delivered to your home</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setDeliveryOption('pickup')}
                                            className={`p-3 rounded-2xl border text-left transition flex flex-col cursor-pointer ${
                                                deliveryOption === 'pickup'
                                                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20'
                                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <Building2 className={`w-4 h-4 ${deliveryOption === 'pickup' ? 'text-blue-600' : 'text-slate-500'}`} />
                                                {deliveryOption === 'pickup' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">Self Pickup</span>
                                            <span className="text-[10px] text-emerald-600 font-semibold">Free from Hub</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Doorstep Address Field (if Doorstep Delivery selected) */}
                                {deliveryOption === 'delivery' && (
                                    <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                                Delivery Address
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsLocationModalOpen(true)}
                                                className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                                            >
                                                Change Location
                                            </button>
                                        </div>
                                        <input 
                                            type="text"
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Enter your street address, apartment, city..."
                                            required
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                            <span>Est. Distance from Hub:</span>
                                            <span className="font-bold text-slate-800">{deliveryDistance} km</span>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Contact Phone Field */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Contact Phone Number <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <Phone className="w-4 h-4 text-blue-600 absolute left-3.5" />
                                        <input 
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 9876543210"
                                            required
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Used by host for delivery coordination & booking alerts.</p>
                                </div>

                                {/* Pickup Date Picker */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Pick-Up Date
                                    </label>
                                    <div className="relative flex items-center">
                                        <Calendar className="w-4 h-4 text-blue-600 absolute left-3.5" />
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
                                            required
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Drop-Off Date Picker */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Drop-Off Date
                                    </label>
                                    <div className="relative flex items-center">
                                        <Calendar className="w-4 h-4 text-blue-600 absolute left-3.5" />
                                        <input 
                                            type="date"
                                            value={returnDate}
                                            min={pickupDate || todayString}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Overlap Warning Banner if selected dates conflict with existing bookings */}
                                {hasDateConflict && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs shadow-xs"
                                    >
                                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-rose-900">Dates Currently Unavailable</p>
                                            <p className="mt-0.5 text-rose-700 leading-relaxed">
                                                This car is already booked for these dates. Please select another date or car.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Dynamic Price Breakdown */}
                                <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Rental Duration</span>
                                        <span className="font-semibold text-slate-900">{days} {days === 1 ? 'day' : 'days'}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>{currency}{car.pricePerDay} × {days} days</span>
                                        <span className="font-semibold text-slate-900">{currency}{baseTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Platform Service & CDW</span>
                                        <span className="font-semibold text-slate-900">{currency}{taxes}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Doorstep Delivery ({deliveryOption === 'delivery' ? `${deliveryDistance} km` : 'Self Pickup'})</span>
                                        <span className={`font-semibold ${deliveryOption === 'delivery' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                            {deliveryOption === 'delivery' ? `${currency}${deliveryFee}` : 'FREE'}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                                        <span>Total Estimated Price</span>
                                        <span className="text-base text-blue-600">{currency}{grandTotal}</span>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={hasDateConflict}
                                    className={`w-full py-3.5 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        hasDateConflict 
                                            ? 'bg-slate-400 cursor-not-allowed opacity-75' 
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:shadow-lg'
                                    }`}
                                >
                                    <Zap className="w-4 h-4" />
                                    {hasDateConflict ? "Dates Unavailable (Choose Other Dates)" : "Reserve & Proceed to Payment"}
                                </button>

                                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>256-Bit SSL Encrypted & Verified Checkout</span>
                                </div>
                            </form>

                        </div>
                    </div>

                </div>

            </div>

            {/* Payment & Verification Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div 
                        onClick={() => setShowPaymentModal(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-slate-100"
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Confirm Reservation</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    SmartDrive AI Test Payment Gateway (Razorpay Verified Integration)
                                </p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs mb-6">
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Vehicle:</span>
                                    <span className="font-bold text-slate-900">{car.brand} {car.model}</span>
                                </div>
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Contact Phone:</span>
                                    <span className="font-bold text-slate-900">{phone}</span>
                                </div>
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Delivery Mode:</span>
                                    <span className="font-bold text-blue-600 capitalize">
                                        {deliveryOption === 'delivery' ? 'Doorstep Delivery' : 'Self Pickup'}
                                    </span>
                                </div>
                                {deliveryOption === 'delivery' && (
                                    <div className="flex justify-between font-medium text-slate-600">
                                        <span>Address:</span>
                                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{deliveryAddress}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Rental Dates:</span>
                                    <span className="font-bold text-slate-900">{pickupDate} to {returnDate}</span>
                                </div>
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Total Payable:</span>
                                    <span className="text-sm font-extrabold text-blue-600">{currency}{grandTotal}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                                    <span>Method: </span>
                                    <span className="font-semibold text-emerald-600">Razorpay Test Gateway (HMAC Verified)</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    disabled={bookingInProgress}
                                    className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmBookingWithPayment}
                                    disabled={bookingInProgress}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                                >
                                    {bookingInProgress ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Verify & Pay {currency}{grandTotal}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CarDetails;