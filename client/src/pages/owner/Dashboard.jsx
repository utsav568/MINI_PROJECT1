import React, { useEffect, useState } from 'react';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import CarImage from '../../components/CarImage';
import { 
    Users, 
    Car, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Sparkles, 
    PlusCircle,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { axios, isOwner, currency } = useAppContext();
    const navigate = useNavigate();

    const [data, setData] = useState({
        totalUsers: 0,
        totalCars: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        recentBookings: [],
        categoryCounts: {},
        monthlyTrends: []
    });

    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/owner/dashboard');
            if (data.success && data.dashboardData) {
                setData(data.dashboardData);
            } else {
                toast.error(data.message || "Failed to load admin stats");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOwner) {
            fetchDashboardData();
        }
    }, [isOwner]);

    const statCards = [
        {
            title: "Total Registered Users",
            value: data.totalUsers,
            icon: Users,
            color: "text-blue-600 bg-blue-50 border-blue-100",
            subtitle: "Verified platform accounts"
        },
        {
            title: "Total Fleet Vehicles",
            value: data.totalCars,
            icon: Car,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
            subtitle: "Available in active inventory"
        },
        {
            title: "Total Bookings",
            value: data.totalBookings,
            icon: Calendar,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            subtitle: `${data.completedBookings} confirmed / completed`
        },
        {
            title: "Total Revenue Generated",
            value: `${currency}${data.totalRevenue}`,
            icon: DollarSign,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
            subtitle: `Monthly: ${currency}${data.monthlyRevenue}`
        }
    ];

    // Find highest monthly revenue for scaling chart bars
    const maxMonthlyRev = Math.max(...(data.monthlyTrends?.map(m => m.revenue) || [100]), 100);

    return (
        <div className="flex-1 p-6 md:p-10 bg-slate-50/50 min-h-screen">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Admin & Platform Overview</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Real-time statistics, booking performance, and fleet metrics.</p>
                </div>
                <button
                    onClick={() => navigate('/owner/add-car')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add New Vehicle</span>
                </button>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div 
                            key={idx}
                            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex items-start justify-between gap-4"
                        >
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                                <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
                                <p className="text-[11px] text-slate-400 font-medium">{card.subtitle}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${card.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts & Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                
                {/* Revenue & Booking Trends Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Revenue & Booking Trends</h3>
                            <p className="text-xs text-slate-500">Performance over the past 6 months</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Live Data</span>
                        </div>
                    </div>

                    {/* SVG / Flex Bar Chart */}
                    <div className="h-60 pt-6 flex items-end justify-between gap-4 sm:gap-8 px-2 border-b border-slate-100">
                        {data.monthlyTrends && data.monthlyTrends.map((trend, i) => {
                            const barHeight = Math.max(Math.round((trend.revenue / maxMonthlyRev) * 160), 20);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {currency}{trend.revenue}
                                    </div>
                                    <div 
                                        style={{ height: `${barHeight}px` }}
                                        className="w-full max-w-[48px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-xl transition-all duration-500 group-hover:brightness-110 shadow-xs"
                                    />
                                    <span className="text-xs font-semibold text-slate-600 mt-2">{trend.month}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{trend.bookings} trips</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Fleet Category Distribution */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Fleet Composition</h3>
                        <p className="text-xs text-slate-500">Vehicles distribution by body category</p>
                    </div>

                    <div className="space-y-4 pt-2">
                        {data.categoryCounts && Object.keys(data.categoryCounts).length > 0 ? (
                            Object.entries(data.categoryCounts).map(([cat, count]) => {
                                const percentage = data.totalCars ? Math.round((count / data.totalCars) * 100) : 0;
                                return (
                                    <div key={cat} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                                            <span>{cat}</span>
                                            <span className="text-slate-400">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${percentage}%` }}
                                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-slate-400">No categories recorded.</p>
                        )}
                    </div>
                </div>

            </div>

            {/* Recent Customer Bookings Table */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Recent Customer Bookings</h3>
                        <p className="text-xs text-slate-500">Latest reservations made on the platform</p>
                    </div>
                    <button
                        onClick={() => navigate('/owner/manage-bookings')}
                        className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                        <span>View All Bookings</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                                <th className="pb-3">Vehicle</th>
                                <th className="pb-3">Customer</th>
                                <th className="pb-3">Rental Dates</th>
                                <th className="pb-3">Total Amount</th>
                                <th className="pb-3">Booking Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {data.recentBookings && data.recentBookings.length > 0 ? (
                                data.recentBookings.map((b, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition">
                                        <td className="py-3 flex items-center gap-3">
                                            <CarImage 
                                                src={b.car?.image} 
                                                alt={`${b.car?.brand || 'Car'} ${b.car?.model || ''}`} 
                                                className="w-10 h-10 rounded-lg object-cover border border-slate-200" 
                                            />
                                            <div>
                                                <p className="font-bold text-slate-900">{b.car?.brand} {b.car?.model}</p>
                                                <p className="text-[10px] text-slate-400">{b.car?.category}</p>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <p className="font-semibold text-slate-900">{b.user?.name || "Customer"}</p>
                                            <p className="text-[10px] text-slate-400">{b.user?.email}</p>
                                        </td>
                                        <td className="py-3 text-slate-500">
                                            {b.pickupDate ? b.pickupDate.split('T')[0] : ''} to {b.returnDate ? b.returnDate.split('T')[0] : ''}
                                        </td>
                                        <td className="py-3 font-bold text-blue-600">
                                            {currency}{b.price}
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-400">
                                        No recent bookings recorded.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
