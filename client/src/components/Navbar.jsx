import React, { useState, useRef, useEffect } from 'react';
import { assets, menuLinks } from '../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
    User, 
    LogOut, 
    LayoutDashboard, 
    Calendar, 
    ShieldCheck, 
    Car, 
    HelpCircle, 
    ChevronDown, 
    Menu, 
    X, 
    Sparkles,
    MapPin,
    Navigation,
    Bell
} from 'lucide-react';
import LocationSelectorModal from './LocationSelectorModal';

const Navbar = () => {
    const { 
        setShowLogin, 
        user, 
        logout, 
        isOwner, 
        axios, 
        setIsOwner,
        customerLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        notifications,
        unreadCount,
        markNotificationsRead,
        clearNotifications
    } = useAppContext();

    const location = useLocation();
    const [openMobile, setOpenMobile] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchNav, setSearchNav] = useState('');
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeRole = async () => {
        try {
            const { data } = await axios.post('/api/owner/change-role');
            if (data.success) {
                setIsOwner(true);
                toast.success(data.message || "Upgraded to Host/Admin successfully!");
                navigate('/owner');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchNav.trim()) {
            navigate(`/cars?search=${encodeURIComponent(searchNav.trim())}`);
            setSearchNav('');
        }
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Explore Cars", path: "/cars" },
        { name: "My Bookings", path: "/my-bookings", authRequired: true },
        { name: "Contact & FAQ", path: "/contact" }
    ];

    return (
        <>
            <motion.nav 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-300 border-b ${
                    location.pathname === "/" 
                        ? "bg-white/90 border-slate-200/80 shadow-xs" 
                        : "bg-white/95 border-slate-200 shadow-xs"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    
                    {/* Brand Logo & Location Pill */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link to='/' className="flex items-center gap-2 group shrink-0">
                            <motion.div 
                                whileHover={{ scale: 1.05 }} 
                                className="flex items-center gap-2"
                            >
                                <img src={assets.logo} alt="CarRental" className="h-8 md:h-9 object-contain" />
                                <span className="hidden sm:inline-block text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                                    SmartDrive AI
                                </span>
                            </motion.div>
                        </Link>

                        {/* Customer Live Location Pill (Click to Open Location Modal) */}
                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-600 transition-all cursor-pointer max-w-44 sm:max-w-64 truncate"
                            title="Click to change your live pickup/delivery location"
                        >
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">
                                {customerLocation 
                                    ? customerLocation.address.split(',')[0]
                                    : "Set Pickup Location"}
                            </span>
                            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                        </button>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-2">
                        {navLinks.map((link) => {
                            if (link.authRequired && !user) return null;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link 
                                    key={link.name} 
                                    to={link.path}
                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                                        isActive 
                                            ? "text-blue-600 bg-blue-50/80 font-semibold" 
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex items-center bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all border border-slate-200 rounded-full px-3.5 py-1.5 w-44 xl:w-56">
                        <img src={assets.search_icon} alt="search" className="w-4 h-4 opacity-50 mr-2" />
                        <input 
                            type="text" 
                            value={searchNav}
                            onChange={(e) => setSearchNav(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                            className="bg-transparent text-xs w-full outline-none text-slate-800 placeholder-slate-400" 
                            placeholder="Search cars..."
                        />
                    </div>

                    {/* Right Action Buttons */}
                    <div className="hidden sm:flex items-center gap-3">
                        {user && (
                            <button 
                                onClick={() => isOwner ? navigate('/owner') : changeRole()} 
                                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                                    isOwner 
                                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" 
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                {isOwner ? "Admin Hub" : "Become Host"}
                            </button>
                        )}

                        {/* Real-Time Notification Bell */}
                        {user && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => {
                                        setNotifOpen(!notifOpen);
                                        markNotificationsRead();
                                    }}
                                    className="relative p-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer text-slate-600 bg-white"
                                    title="Real-Time Booking Notifications"
                                >
                                    <Bell className="w-4 h-4 text-slate-700" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {notifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                                        >
                                            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                                <div className="flex items-center gap-1.5">
                                                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                                                    <span className="text-xs font-bold text-slate-800">Real-Time Alerts</span>
                                                </div>
                                                {notifications.length > 0 && (
                                                    <button
                                                        onClick={clearNotifications}
                                                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                                                {notifications.length === 0 ? (
                                                    <div className="py-8 text-center text-slate-400">
                                                        <p className="text-xs">No new notifications</p>
                                                        <p className="text-[10px] text-slate-300 mt-1">Live booking events appear here instantly</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((n, i) => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => {
                                                                setNotifOpen(false);
                                                                if (isOwner) navigate('/owner/manage-bookings');
                                                                else navigate('/my-bookings');
                                                            }}
                                                            className="p-3 hover:bg-slate-50 transition cursor-pointer"
                                                        >
                                                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                                                <span className="font-bold text-blue-600 uppercase">⚡ Live Update</span>
                                                                <span>{n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                                                            </div>
                                                            <p className="font-semibold text-slate-800 leading-tight">{n.message}</p>
                                                            {n.booking && (
                                                                <p className="text-[10px] text-slate-500 mt-1">
                                                                    Status: <strong className="text-emerald-600 uppercase">{n.booking.status}</strong> • Total: <strong>${n.booking.price}</strong>
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {notifications.length > 0 && (
                                                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setNotifOpen(false);
                                                            if (isOwner) navigate('/owner/manage-bookings');
                                                            else navigate('/my-bookings');
                                                        }}
                                                        className="text-[11px] font-bold text-blue-600 hover:underline"
                                                    >
                                                        {isOwner ? "View All Reservations ➔" : "View My Bookings ➔"}
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer bg-white"
                                >
                                    <span className="text-xs font-medium text-slate-700 max-w-28 truncate">{user.name}</span>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden ring-2 ring-white">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                {user.phone && <p className="text-[10px] text-slate-400 mt-0.5">📱 {user.phone}</p>}
                                                <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    isOwner ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                                }`}>
                                                    {user.role === 'owner' ? 'Host / Admin' : user.role === 'admin' ? 'Administrator' : 'Verified Member'}
                                                </span>
                                            </div>

                                            <div className="py-1">
                                                <Link 
                                                    to="/profile" 
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                                                >
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    My Profile & Settings
                                                </Link>
                                                <Link 
                                                    to="/my-bookings" 
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                                                >
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    My Bookings & Delivery
                                                </Link>

                                                {isOwner && (
                                                    <Link 
                                                        to="/owner" 
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-amber-700 bg-amber-50/50 hover:bg-amber-50 font-medium transition"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-amber-600" />
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                            </div>

                                            <div className="border-t border-slate-100 pt-1">
                                                <button 
                                                    onClick={() => { setDropdownOpen(false); logout(); }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium transition text-left cursor-pointer"
                                                >
                                                    <LogOut className="w-4 h-4 text-red-500" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowLogin(true)} 
                                    className="px-5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition cursor-pointer"
                                >
                                    Sign In
                                </button>
                                <button 
                                    onClick={() => setShowLogin(true)} 
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <button 
                        onClick={() => setOpenMobile(!openMobile)}
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Toggle Menu"
                    >
                        {openMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {openMobile && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-6 py-5 shadow-xl space-y-3"
                        >
                            <button
                                onClick={() => { setOpenMobile(false); setIsLocationModalOpen(true); }}
                                className="w-full py-2.5 px-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-between"
                            >
                                <span className="flex items-center gap-1.5 truncate">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    {customerLocation ? customerLocation.address.split(',')[0] : "Set Live Pickup Location"}
                                </span>
                                <span className="text-[10px] text-blue-600 uppercase">Change</span>
                            </button>

                            <div className="flex flex-col gap-2">
                                {navLinks.map((link) => {
                                    if (link.authRequired && !user) return null;
                                    return (
                                        <Link 
                                            key={link.name} 
                                            to={link.path}
                                            onClick={() => setOpenMobile(false)}
                                            className="py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            {link.name}
                                        </Link>
                                    );
                                })}

                                {user ? (
                                    <>
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setOpenMobile(false)}
                                            className="py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            Profile Settings
                                        </Link>
                                        <button 
                                            onClick={() => { setOpenMobile(false); isOwner ? navigate('/owner') : changeRole(); }}
                                            className="text-left py-2.5 px-3 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                        >
                                            {isOwner ? "Open Admin Dashboard" : "Become a Host / List Car"}
                                        </button>
                                        <button 
                                            onClick={() => { setOpenMobile(false); logout(); }}
                                            className="text-left py-2.5 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer mt-2"
                                        >
                                            Logout ({user.name})
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => { setOpenMobile(false); setShowLogin(true); }}
                                        className="w-full py-3 mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
                                    >
                                        Sign In / Register
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Global Location Selector Modal */}
            <LocationSelectorModal 
                isOpen={isLocationModalOpen} 
                onClose={() => setIsLocationModalOpen(false)} 
            />
        </>
    );
};

export default Navbar;
