import React, { useEffect, useState } from 'react';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import CarImage from '../../components/CarImage';
import { 
    Star, 
    Trash2, 
    Search, 
    ShieldCheck, 
    Car, 
    User, 
    MessageSquare, 
    Calendar,
    Sparkles,
    Filter
} from 'lucide-react';

const ManageReviews = () => {
    const { axios, isOwner } = useAppContext();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');

    const fetchAllReviews = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/reviews/admin/all');
            if (data.success) {
                setReviews(data.reviews || []);
            } else {
                toast.error(data.message || 'Failed to fetch customer reviews');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error loading reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOwner) {
            fetchAllReviews();
        }
    }, [isOwner]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to remove this customer review?")) return;

        try {
            const { data } = await axios.delete(`/api/reviews/admin/${reviewId}`);
            if (data.success) {
                toast.success(data.message || 'Review deleted successfully');
                setReviews(prev => prev.filter(r => r._id !== reviewId));
            } else {
                toast.error(data.message || 'Failed to delete review');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error deleting review');
        }
    };

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = 
            (r.car?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (r.car?.model?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
        
        const matchesRating = ratingFilter === 'all' ? true : r.rating === Number(ratingFilter);
        return matchesSearch && matchesRating;
    });

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : '5.0';

    const verifiedCount = reviews.filter(r => r.isVerifiedTrip).length;

    return (
        <div className="flex-1 p-6 md:p-10 bg-slate-50/50 min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <MessageSquare className="w-7 h-7 text-blue-600" />
                        Customer Reviews & Ratings
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Moderate customer feedback, inspect verified trip reviews, and maintain fleet trust ratings.
                    </p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reviews</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{reviews.length}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Across all fleet vehicles</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</p>
                        <h3 className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
                            {averageRating} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        </h3>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">High satisfaction</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Trips</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{verifiedCount}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Booked & delivered drivers</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search by customer name, vehicle, or comment..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">All Ratings (1-5 ★)</option>
                        <option value="5">5 Stars only</option>
                        <option value="4">4 Stars only</option>
                        <option value="3">3 Stars only</option>
                        <option value="2">2 Stars or lower</option>
                    </select>
                </div>
            </div>

            {/* Review Cards / List */}
            {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500">Loading customer reviews...</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No reviews found</h3>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or rating filters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((rev) => (
                        <div 
                            key={rev._id}
                            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                            {/* Left: Car and User Info */}
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                    <CarImage 
                                        src={rev.car?.image} 
                                        alt={rev.car?.brand} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-slate-900 text-sm">
                                            {rev.car ? `${rev.car.brand} ${rev.car.model}` : 'SmartDrive Fleet Vehicle'}
                                        </span>
                                        {rev.car?.category && (
                                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                {rev.car.category}
                                            </span>
                                        )}
                                        {rev.isVerifiedTrip && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                <ShieldCheck className="w-3 h-3" />
                                                Verified Trip
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                                            <User className="w-3.5 h-3.5 text-blue-600" />
                                            {rev.userName || 'Verified Customer'}
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center text-amber-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                                />
                                            ))}
                                            <span className="ml-1 font-bold text-slate-700 text-xs">({rev.rating}/5)</span>
                                        </div>
                                        <span>•</span>
                                        <span className="text-[11px] text-slate-400">
                                            {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed italic mt-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                                        "{rev.comment}"
                                    </p>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <button
                                    onClick={() => handleDeleteReview(rev._id)}
                                    title="Delete Review"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageReviews;
