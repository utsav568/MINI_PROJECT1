import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { dummyCarData } from "../assets/assets";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY || '$';

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    
    // Customer Live Location System
    const [customerLocation, setCustomerLocation] = useState(null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Global booking state
    const [pickupLocation, setPickupLocation] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    // Inventory & filter options (seeded with dummyCarData so vehicles & images always show immediately)
    const [cars, setCars] = useState(dummyCarData);
    const [loadingCars, setLoadingCars] = useState(false);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableFuelTypes, setAvailableFuelTypes] = useState([]);
    const [availableTransmissions, setAvailableTransmissions] = useState([]);

    // Real-Time Socket.IO & Notification System
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize Socket.IO connection
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
        const socketInstance = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10
        });

        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            console.log("⚡ Connected to Real-Time Socket server:", socketInstance.id);
            if (user) {
                socketInstance.emit("join", { 
                    userId: user._id, 
                    role: user.role 
                });
            }
        });

        // Real-Time Notification for Admins/Owners
        socketInstance.on("new_booking", (data) => {
            console.log("⚡ [Real-Time Admin Event] New booking:", data);
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 text-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border border-blue-500/40`}>
                    <div className="flex-1 w-0">
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">🚘</span>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-400">⚡ New Reservation Alert</p>
                                <p className="text-sm font-semibold mt-0.5 text-slate-100">{data.message}</p>
                                <p className="text-[11px] text-slate-400 mt-1">Status: <strong className="text-emerald-400 uppercase">{data.booking?.status || 'Confirmed'}</strong> • Total: <strong className="text-white">${data.booking?.price}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 6000 });
        });

        // Real-Time Notification for Customers
        socketInstance.on("customer_booking_updated", (data) => {
            console.log("⚡ [Real-Time Customer Event] Booking update:", data);
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);

            toast.success(`📢 ${data.message}`, {
                duration: 6000,
                icon: '🚘'
            });
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Re-join socket rooms whenever user authentication state updates
    useEffect(() => {
        if (socket && socket.connected && user) {
            socket.emit("join", { 
                userId: user._id, 
                role: user.role 
            });
        }
    }, [user, socket]);

    const markNotificationsRead = () => {
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Fetch User Profile
    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/data');
            if (data.success) {
                setUser(data.user);
                setIsOwner(data.user.role === 'owner' || data.user.role === 'admin');
                if (data.user.lastKnownLocation && data.user.lastKnownLocation.lat) {
                    setCustomerLocation(data.user.lastKnownLocation);
                }
            } else {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                setIsOwner(false);
            }
        } catch (error) {
            console.error("fetchUser error:", error.message);
        }
    };

    // Fetch Cars with optional filter params and location awareness
    const fetchCars = async (filters = {}) => {
        setLoadingCars(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category && filters.category !== 'All') params.append('category', filters.category);
            if (filters.fuel_type && filters.fuel_type !== 'All') params.append('fuel_type', filters.fuel_type);
            if (filters.transmission && filters.transmission !== 'All') params.append('transmission', filters.transmission);
            if (filters.location && filters.location !== 'All') params.append('location', filters.location);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.maxDistanceKm) params.append('maxDistanceKm', filters.maxDistanceKm);

            // Coordinates
            const uLat = filters.userLat || customerLocation?.lat;
            const uLng = filters.userLng || customerLocation?.lng;
            if (uLat && uLng) {
                params.append('userLat', uLat);
                params.append('userLng', uLng);
            }

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const { data } = await axios.get(`/api/user/cars${queryString}`);
            if (data.success && Array.isArray(data.cars) && data.cars.length > 0) {
                setCars(data.cars);
            } else {
                setCars(prev => (prev && prev.length > 0 ? prev : dummyCarData));
            }
        } catch (error) {
            console.error("fetchCars error:", error.message);
            setCars(prev => (prev && prev.length > 0 ? prev : dummyCarData));
        } finally {
            setLoadingCars(false);
        }
    };

    // Fetch dynamic locations, categories, fuels
    const fetchMetadata = async () => {
        try {
            const { data } = await axios.get('/api/user/locations');
            if (data.success) {
                setAvailableLocations(data.locations || []);
                setAvailableCategories(data.categories || []);
                setAvailableFuelTypes(data.fuelTypes || []);
                setAvailableTransmissions(data.transmissions || []);
            }
        } catch (error) {
            console.error("fetchMetadata error:", error.message);
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsOwner(false);
        axios.defaults.headers.common['Authorization'] = '';
        toast.success('Successfully logged out');
        navigate('/');
    };

    // Check localStorage token and saved location on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }

        const storedLocation = localStorage.getItem('customer_location');
        if (storedLocation) {
            try {
                const parsed = JSON.parse(storedLocation);
                setCustomerLocation(parsed);
                fetchCars({ userLat: parsed.lat, userLng: parsed.lng });
            } catch (e) {
                fetchCars();
            }
        } else {
            fetchCars();
        }

        fetchMetadata();
    }, []);

    // Fetch user when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        }
    }, [token]);

    const value = {
        navigate,
        currency,
        axios,
        user,
        setUser,
        token,
        setToken,
        isOwner,
        setIsOwner,
        fetchUser,
        showLogin,
        setShowLogin,
        logout,
        fetchCars,
        cars,
        setCars,
        loadingCars,
        pickupLocation,
        setPickupLocation,
        pickupDate,
        setPickupDate,
        returnDate,
        setReturnDate,
        availableLocations,
        availableCategories,
        availableFuelTypes,
        availableTransmissions,
        fetchMetadata,
        customerLocation,
        setCustomerLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        socket,
        notifications,
        unreadCount,
        markNotificationsRead,
        clearNotifications
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
