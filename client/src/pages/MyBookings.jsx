import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import CarImage from '../components/CarImage';
import { 
    Calendar, 
    MapPin, 
    CreditCard, 
    AlertCircle, 
    XCircle, 
    CheckCircle, 
    Clock, 
    ArrowRight,
    ShieldAlert,
    Truck,
    Building2,
    RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
    const { axios, user, currency, setShowLogin, socket } = useAppContext();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmModalId, setConfirmModalId] = useState(null);

    const fetchMyBookings = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/bookings/user');
            if (data.success) {
                setBookings(data.bookings);
            } else {
                toast.error(data.message || "Failed to load bookings");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyBookings();
        } else {
            setLoading(false);
        }
    }, [user]);

    // Real-Time Socket Listener: Update customer reservations without page refresh
    useEffect(() => {
        if (!socket) return;

        const handleBookingUpdate = (data) => {
            console.log("⚡ Customer received live status update:", data);
            if (data.booking) {
                setBookings(prev => prev.map(b => b._id === data.booking._id ? data.booking : b));
            } else {
                fetchMyBookings();
            }
        };

        socket.on("customer_booking_updated", handleBookingUpdate);

        return () => {
            socket.off("customer_booking_updated", handleBookingUpdate);
        };
    }, [socket]);

    const handleCancelBooking = async (bookingId) => {
        setCancellingId(bookingId);
        try {
            const { data } = await axios.post('/api/bookings/cancel', { bookingId });
            if (data.success) {
                toast.success(data.message || "Booking cancelled successfully!");
                setConfirmModalId(null);
                fetchMyBookings();
            } else {
                toast.error(data.message || "Failed to cancel booking");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCancellingId(null);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="w-12 h-12 text-blue-600 mb-3" />
                <h2 className="text-xl font-bold text-slate-800">Sign in to View Your Bookings</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Access your active reservations, vehicle keys, and booking receipts.
                </p>
                <button 
                    onClick={() => setShowLogin(true)}
                    className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-md transition"
                >
                    Sign In
                </button>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirmed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Approval
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected by Host
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelled
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                
                {/* Header with Live Indicator */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Booking History</h1>
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Real-Time Sync
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Track upcoming trips, manage dates, and receive real-time host status updates.
                        </p>
                    </div>

                    <button 
                        onClick={fetchMyBookings}
                        className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer text-slate-700 shadow-2xs"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        Refresh
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs animate-pulse flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-48 aspect-[16/10] bg-slate-200 rounded-2xl" />
                                <div className="flex-1 space-y-3 py-2">
                                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-800">No Reservations Found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            You have not booked any rental vehicle yet. Browse our premium fleet and plan your next journey!
                        </p>
                        <button 
                            onClick={() => navigate('/cars')}
                            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-md transition"
                        >
                            Browse Vehicles
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                key={booking._id} 
                                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                    
                                    {/* Car Thumbnail & Model */}
                                    <div className="md:col-span-1">
                                        <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 mb-3 shadow-xs border border-slate-200">
                                            <CarImage 
                                                src={booking.car?.image} 
                                                alt={`${booking.car?.brand || 'Car'} ${booking.car?.model || ''}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="font-bold text-base text-slate-900 truncate">
                                            {booking.car?.brand} {booking.car?.model}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {booking.car?.category} • {booking.car?.year}
                                        </p>
                                    </div>

                                    {/* Dates & Location */}
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                ID: #{booking._id.slice(-6).toUpperCase()}
                                            </span>
                                            {getStatusBadge(booking.status)}
                                            {booking.deliveryOption === 'delivery' && (
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                                    booking.deliveryStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                                    booking.deliveryStatus === 'On the Way' ? 'bg-purple-50 text-purple-800 border-purple-200 animate-pulse' :
                                                    booking.deliveryStatus === 'Accepted' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                                    booking.deliveryStatus === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                                    'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}>
                                                    🚚 Delivery: {booking.deliveryStatus || 'Pending'}
                                                </span>
                                            )}
                                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                Payment: {booking.paymentStatus === 'paid' ? 'Verified Online' : booking.paymentStatus}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-xs text-slate-600 pt-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                                                <span>
                                                    <strong>Pickup:</strong> {booking.pickupDate ? booking.pickupDate.split('T')[0] : 'N/A'} &nbsp;➔&nbsp; 
                                                    <strong>Return:</strong> {booking.returnDate ? booking.returnDate.split('T')[0] : 'N/A'}
                                                </span>
                                            </div>

                                            {booking.deliveryOption === 'delivery' ? (
                                                <div className="flex items-start gap-2 text-indigo-700 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                                                    <Truck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold text-[11px]">Doorstep Delivery Address ({booking.deliveryDistanceKm || 5} km):</p>
                                                        <p className="text-[11px] text-slate-700">{booking.deliveryAddress}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                                                    <span><strong>Pickup Hub:</strong> {booking.car?.hubAddress || booking.car?.location || "City Location"}</span>
                                                </div>
                                            )}

                                            {booking.status === 'rejected' && (
                                                <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                                                    Notice: This booking was declined by the host. Any pre-authorized charges have been marked for full refund.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="md:col-span-1 flex flex-col justify-between items-start md:items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="md:text-right">
                                            <span className="text-[11px] font-medium text-slate-400">Total Price</span>
                                            <h4 className="text-2xl font-extrabold text-blue-600">
                                                {currency}{booking.price}
                                            </h4>
                                            <p className="text-[10px] text-slate-400">
                                                Booked {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''}
                                            </p>
                                        </div>

                                        {/* Cancel Button if eligible */}
                                        {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'rejected' && (
                                            <button
                                                onClick={() => setConfirmModalId(booking._id)}
                                                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                                            >
                                                Cancel Reservation
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

            </div>

            {/* Cancellation Confirmation Modal */}
            <AnimatePresence>
                {confirmModalId && (
                    <div 
                        onClick={() => setConfirmModalId(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Cancel Reservation?</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Are you sure you want to cancel this booking? This will immediately free the vehicle dates and initiate your refund.
                            </p>

                            <div className="flex gap-2.5 mt-6">
                                <button
                                    onClick={() => setConfirmModalId(null)}
                                    disabled={cancellingId !== null}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={() => handleCancelBooking(confirmModalId)}
                                    disabled={cancellingId !== null}
                                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50"
                                >
                                    {cancellingId ? "Cancelling..." : "Confirm Cancel"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default MyBookings;
