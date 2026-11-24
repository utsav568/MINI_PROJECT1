import React, { useEffect, useState } from 'react';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import CarImage from '../../components/CarImage';
import { 
    CalendarCheck, 
    Search, 
    Calendar, 
    User, 
    DollarSign, 
    Clock, 
    CheckCircle, 
    XCircle,
    Check,
    Filter,
    Truck,
    MapPin,
    Phone,
    ExternalLink,
    AlertCircle,
    Navigation,
    Building2,
    CheckCircle2,
    RotateCcw,
    Radio
} from 'lucide-react';

const ManageBookings = () => {
    const { currency, axios, isOwner, socket } = useAppContext();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOwnerBookings = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/bookings/owner');
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

    // Change overall booking status (pending, confirmed, rejected, cancelled, completed)
    const changeBookingStatus = async (bookingId, status) => {
        try {
            const { data } = await axios.post('/api/bookings/change-status', { bookingId, status });
            if (data.success) {
                toast.success(`Booking #${bookingId.slice(-6).toUpperCase()} updated to ${status.toUpperCase()}!`);
                // State is also updated via Socket.IO, but update locally for instant response
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: status.toLowerCase() } : b));
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Update Doorstep Delivery Status (Pending, Accepted, On the Way, Delivered, Rejected)
    const handleUpdateDeliveryStatus = async (bookingId, deliveryStatus) => {
        setUpdatingId(bookingId);
        try {
            const { data } = await axios.post('/api/bookings/update-delivery-status', {
                bookingId,
                deliveryStatus
            });
            if (data.success) {
                toast.success(`Delivery status updated to: ${deliveryStatus}`);
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, deliveryStatus } : b));
            } else {
                toast.error(data.message || "Failed to update delivery status");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Initial Load
    useEffect(() => {
        if (isOwner) fetchOwnerBookings();
    }, [isOwner]);

    // Real-Time Socket.IO Listener: Receive live bookings and status updates without refresh
    useEffect(() => {
        if (!socket) return;

        const handleNewBooking = (data) => {
            console.log("⚡ ManageBookings received real-time new_booking:", data);
            if (data.booking) {
                setBookings(prev => {
                    // Check if already in state
                    const exists = prev.some(b => b._id === data.booking._id);
                    if (exists) return prev;
                    return [data.booking, ...prev];
                });
            }
        };

        const handleBookingStatusUpdated = (data) => {
            console.log("⚡ ManageBookings received real-time status update:", data);
            if (data.booking) {
                setBookings(prev => prev.map(b => b._id === data.booking._id ? data.booking : b));
            }
        };

        socket.on("new_booking", handleNewBooking);
        socket.on("booking_status_updated", handleBookingStatusUpdated);

        return () => {
            socket.off("new_booking", handleNewBooking);
            socket.off("booking_status_updated", handleBookingStatusUpdated);
        };
    }, [socket]);

    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter === 'All' || 
            b.status?.toLowerCase() === statusFilter.toLowerCase() ||
            b.deliveryStatus?.toLowerCase() === statusFilter.toLowerCase();
        
        const matchesSearch = 
            (b.car?.brand && b.car.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (b.car?.model && b.car.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (b.customerName && b.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (b.user?.name && b.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (b.user?.email && b.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (b.customerPhone && b.customerPhone.includes(searchQuery)) ||
            (b.deliveryAddress && b.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesStatus && matchesSearch;
    });

    const statusTabs = ['All', 'Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed', 'Doorstep Delivery'];

    const getDeliveryStatusBadge = (status) => {
        switch (status) {
            case 'Accepted':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'On the Way':
                return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
            case 'Delivered':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Rejected':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'Pending':
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    const getBookingStatusStyle = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-emerald-50 text-emerald-800 border-emerald-300';
            case 'pending':
                return 'bg-amber-50 text-amber-800 border-amber-300';
            case 'rejected':
                return 'bg-rose-100 text-rose-800 border-rose-300';
            case 'cancelled':
                return 'bg-slate-100 text-slate-700 border-slate-300';
            case 'completed':
                return 'bg-blue-50 text-blue-800 border-blue-300';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-slate-50/50 min-h-screen">
            
            {/* Header with Real-Time Indicator */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Admin Booking & Delivery Hub
                        </h1>
                        <span className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Live Real-Time
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Live real-time reservation stream, doorstep car delivery dispatch, and customer contact management.
                    </p>
                </div>

                <button 
                    onClick={fetchOwnerBookings}
                    className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer text-slate-700 shadow-2xs"
                >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Refresh
                </button>
            </div>

            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative w-full lg:w-96 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by customer, phone, email, car, or address..."
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
                    {statusTabs.map(tab => {
                        const isSelected = 
                            tab === 'Doorstep Delivery' 
                                ? statusFilter === 'delivery' 
                                : statusFilter.toLowerCase() === tab.toLowerCase();

                        return (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab === 'Doorstep Delivery' ? 'delivery' : tab)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
                                    isSelected
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">Car Reserved</th>
                                <th className="p-4">Customer & Contact</th>
                                <th className="p-4">Pickup / Delivery Location</th>
                                <th className="p-4">Rental Duration</th>
                                <th className="p-4">Price & Payment</th>
                                <th className="p-4">Delivery Status</th>
                                <th className="p-4">Reservation Status</th>
                                <th className="p-4 text-right">Quick Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">
                                        Loading live reservations...
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center text-slate-400">
                                        No bookings recorded under this filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b._id} className="hover:bg-slate-50/50 transition">
                                        
                                        {/* Car Details */}
                                        <td className="p-4 flex items-center gap-3">
                                            <CarImage 
                                                src={b.car?.image} 
                                                alt={`${b.car?.brand || 'Car'} ${b.car?.model || ''}`}
                                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200" 
                                            />
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{b.car?.brand} {b.car?.model}</p>
                                                <p className="text-[10px] text-slate-400">{b.car?.category} • {b.car?.location}</p>
                                            </div>
                                        </td>

                                        {/* Customer Details: Name, Email & Verified Mobile Phone */}
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{b.customerName || b.user?.name || "Customer"}</p>
                                            <p className="text-[10px] text-slate-500">{b.user?.email || "No email"}</p>
                                            
                                            {/* Customer Mobile Phone (Securely displayed for authorized admins) */}
                                            {(b.customerPhone || b.user?.phone) ? (
                                                <a 
                                                    href={`tel:${b.customerPhone || b.user?.phone}`}
                                                    className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 transition"
                                                    title="Call customer regarding booking"
                                                >
                                                    <Phone className="w-3 h-3 text-blue-500" />
                                                    <span>{b.customerPhone || b.user?.phone}</span>
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">No phone provided</span>
                                            )}
                                        </td>

                                        {/* Delivery & Pickup Location */}
                                        <td className="p-4">
                                            {b.deliveryOption === 'delivery' ? (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                                        <Truck className="w-3 h-3 text-indigo-600" />
                                                        Doorstep Delivery
                                                    </span>
                                                    <p className="text-[11px] font-semibold text-slate-800 line-clamp-2 max-w-[200px]" title={b.deliveryAddress}>
                                                        📍 {b.deliveryAddress || "Customer Address"}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                        <span>Est: <strong>{b.deliveryDistanceKm || 5} km</strong></span>
                                                        <span>• Fee: <strong>{currency}{b.deliveryFee || 0}</strong></span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                                        <Building2 className="w-3 h-3 text-slate-500" />
                                                        Self Pickup
                                                    </span>
                                                    <p className="text-[10px] text-slate-500">
                                                        Hub: {b.car?.hubAddress || b.car?.location || "City Hub"}
                                                    </p>
                                                </div>
                                            )}
                                        </td>

                                        {/* Rental Dates */}
                                        <td className="p-4 text-slate-600">
                                            <p className="font-semibold text-slate-900">
                                                {b.pickupDate ? b.pickupDate.split('T')[0] : ''} ➔ {b.returnDate ? b.returnDate.split('T')[0] : ''}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                Duration: {b.days || 1} {b.days === 1 ? 'day' : 'days'}
                                            </p>
                                        </td>

                                        {/* Price & Payment Status */}
                                        <td className="p-4">
                                            <p className="font-extrabold text-blue-600 text-sm">
                                                {currency}{b.price}
                                            </p>
                                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                b.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                                b.paymentStatus === 'refunded' ? 'bg-slate-100 text-slate-700' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                                {b.paymentStatus === 'paid' ? 'Paid Online' : b.paymentStatus}
                                            </span>
                                        </td>

                                        {/* Delivery Management Status */}
                                        <td className="p-4">
                                            {b.deliveryOption === 'delivery' ? (
                                                <div className="space-y-1.5">
                                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDeliveryStatusBadge(b.deliveryStatus)}`}>
                                                        {b.deliveryStatus || 'Pending'}
                                                    </span>
                                                    <select 
                                                        value={b.deliveryStatus || 'Pending'}
                                                        disabled={updatingId === b._id}
                                                        onChange={(e) => handleUpdateDeliveryStatus(b._id, e.target.value)}
                                                        className="block w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Accepted">Accept Delivery</option>
                                                        <option value="On the Way">On the Way</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Rejected">Reject</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">Self Pickup at Hub</span>
                                            )}
                                        </td>

                                        {/* 5 Reservation Statuses: Pending, Confirmed, Rejected, Cancelled, Completed */}
                                        <td className="p-4">
                                            <select 
                                                value={b.status}
                                                onChange={(e) => changeBookingStatus(b._id, e.target.value)}
                                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${getBookingStatusStyle(b.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>

                                        {/* Quick Action Button for Instant Confirm / Reject */}
                                        <td className="p-4 text-right">
                                            {b.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => changeBookingStatus(b._id, 'confirmed')}
                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition cursor-pointer flex items-center gap-1"
                                                        title="Confirm booking"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => changeBookingStatus(b._id, 'rejected')}
                                                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                                                        title="Reject booking"
                                                    >
                                                        <XCircle className="w-3 h-3" />
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 capitalize">{b.status}</span>
                                            )}
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ManageBookings;
