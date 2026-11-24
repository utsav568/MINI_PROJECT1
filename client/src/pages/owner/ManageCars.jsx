import React, { useEffect, useState } from 'react';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import CarImage from '../../components/CarImage';
import { 
    Car, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    Search, 
    PlusCircle, 
    X, 
    Check, 
    Upload,
    SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const ManageCars = () => {
    const { isOwner, axios, currency, fetchCars: refreshGlobalCars } = useAppContext();
    const navigate = useNavigate();

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Edit Modal State
    const [editingCar, setEditingCar] = useState(null);
    const [editForm, setEditForm] = useState({
        brand: '',
        model: '',
        year: 2024,
        pricePerDay: 50,
        category: 'Sedan',
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        seating_capacity: 4,
        location: 'Bengaluru',
        description: ''
    });
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const fetchOwnerCars = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/owner/cars');
            if (data.success) {
                setCars(data.cars);
            } else {
                toast.error(data.message || "Failed to load cars");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOwner) fetchOwnerCars();
    }, [isOwner]);

    const toggleAvailability = async (carId) => {
        try {
            const { data } = await axios.post('/api/owner/toggle-car', { carId });
            if (data.success) {
                toast.success(data.message);
                fetchOwnerCars();
                refreshGlobalCars();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteCar = async (carId) => {
        if (!window.confirm('Are you sure you want to permanently delete this car from the platform?')) {
            return;
        }

        try {
            const { data } = await axios.post('/api/owner/delete-car', { carId });
            if (data.success) {
                toast.success(data.message || "Car removed successfully");
                fetchOwnerCars();
                refreshGlobalCars();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openEditModal = (car) => {
        setEditingCar(car);
        setEditForm({
            brand: car.brand || '',
            model: car.model || '',
            year: car.year || 2024,
            pricePerDay: car.pricePerDay || 50,
            category: car.category || 'Sedan',
            transmission: car.transmission || 'Automatic',
            fuel_type: car.fuel_type || 'Petrol',
            seating_capacity: car.seating_capacity || 4,
            location: car.location || 'Bengaluru',
            description: car.description || '',
            images: Array.isArray(car.images) ? car.images.join(', ') : (car.images || '')
        });
        setEditImagePreview(car.image || '');
        setEditImageFile(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setIsSavingEdit(true);
        try {
            const formData = new FormData();
            formData.append('carData', JSON.stringify(editForm));
            if (editImageFile) {
                formData.append('image', editImageFile);
            }

            const { data } = await axios.put(`/api/owner/update-car/${editingCar._id}`, formData);
            if (data.success) {
                toast.success("Car details updated successfully!");
                setEditingCar(null);
                fetchOwnerCars();
                refreshGlobalCars();
            } else {
                toast.error(data.message || "Failed to update car");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const filteredCars = cars.filter(c => 
        c.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 p-6 md:p-10 bg-slate-50/50 min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Fleet Inventory Management</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">View, update specifications, toggle availability, or remove vehicles.</p>
                </div>
                <button
                    onClick={() => navigate('/owner/add-car')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add New Vehicle</span>
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by make, model, category, city..."
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                    />
                </div>
                <span className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
                    Total: <strong className="text-slate-900">{filteredCars.length}</strong> vehicles listed
                </span>
            </div>

            {/* Cars Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">Car Details</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Daily Rate</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">
                                        Loading fleet inventory...
                                    </td>
                                </tr>
                            ) : filteredCars.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-slate-400">
                                        No vehicles found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredCars.map((car) => (
                                    <tr key={car._id} className="hover:bg-slate-50/50 transition">
                                        
                                        {/* Image & Model */}
                                        <td className="p-4 flex items-center gap-3">
                                            <CarImage 
                                                src={car.image} 
                                                alt={`${car.brand} ${car.model}`} 
                                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200" 
                                            />
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{car.brand} {car.model}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    Year: {car.year} • {car.seating_capacity} Seats • {car.transmission}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                                                {car.category || "Sedan"}
                                            </span>
                                        </td>

                                        <td className="p-4 font-bold text-blue-600 text-sm">
                                            {currency}{car.pricePerDay}
                                            <span className="text-[10px] font-normal text-slate-400"> /day</span>
                                        </td>

                                        <td className="p-4 text-slate-600">
                                            {car.location || "City"}
                                        </td>

                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleAvailability(car._id)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                                                    car.isAvaliable 
                                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                                                        : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                                                }`}
                                            >
                                                {car.isAvaliable ? "Available" : "Unavailable"}
                                            </button>
                                        </td>

                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(car)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                                                    title="Edit Car"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteCar(car._id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                                    title="Delete Car"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Car Modal */}
            <AnimatePresence>
                {editingCar && (
                    <div 
                        onClick={() => setEditingCar(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Edit Vehicle Specifications</h3>
                                    <p className="text-xs text-slate-500">Update car attributes, pricing, or media.</p>
                                </div>
                                <button onClick={() => setEditingCar(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-medium text-slate-700">
                                
                                {/* Image Replacement */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Vehicle Image</label>
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={editImagePreview} 
                                            alt="" 
                                            className="w-20 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200" 
                                        />
                                        <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition">
                                            Replace Image (ImageKit)
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const f = e.target.files[0];
                                                    if (f) {
                                                        setEditImageFile(f);
                                                        setEditImagePreview(URL.createObjectURL(f));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Brand</label>
                                        <input 
                                            type="text" 
                                            value={editForm.brand} 
                                            onChange={e => setEditForm({...editForm, brand: e.target.value})}
                                            required 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Model</label>
                                        <input 
                                            type="text" 
                                            value={editForm.model} 
                                            onChange={e => setEditForm({...editForm, model: e.target.value})}
                                            required 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Year</label>
                                        <input 
                                            type="number" 
                                            value={editForm.year} 
                                            onChange={e => setEditForm({...editForm, year: e.target.value})}
                                            required 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Daily Price ({currency})</label>
                                        <input 
                                            type="number" 
                                            value={editForm.pricePerDay} 
                                            onChange={e => setEditForm({...editForm, pricePerDay: e.target.value})}
                                            required 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Capacity</label>
                                        <input 
                                            type="number" 
                                            value={editForm.seating_capacity} 
                                            onChange={e => setEditForm({...editForm, seating_capacity: e.target.value})}
                                            required 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                                        <select 
                                            value={editForm.category}
                                            onChange={e => setEditForm({...editForm, category: e.target.value})}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        >
                                            <option value="Sedan">Sedan</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Van">Van</option>
                                            <option value="Luxury">Luxury</option>
                                            <option value="Electric">Electric</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Fuel Type</label>
                                        <select 
                                            value={editForm.fuel_type}
                                            onChange={e => setEditForm({...editForm, fuel_type: e.target.value})}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        >
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City Location</label>
                                        <input 
                                            type="text" 
                                            value={editForm.location} 
                                            onChange={e => setEditForm({...editForm, location: e.target.value})}
                                            required 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Gallery Image URLs <span className="text-slate-400 font-normal lowercase">(comma-separated)</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editForm.images || ''} 
                                        onChange={e => setEditForm({...editForm, images: e.target.value})}
                                        placeholder="https://... , https://..."
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                                    <textarea 
                                        rows={3} 
                                        value={editForm.description}
                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingCar(null)}
                                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSavingEdit}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-60"
                                    >
                                        {isSavingEdit ? "Saving Changes..." : "Save Updates"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ManageCars;
