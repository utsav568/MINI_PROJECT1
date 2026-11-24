import React, { useState } from 'react';
import Title from '../../components/owner/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Upload, Check, Sparkles, Car, ImagePlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddCar = () => {
    const { axios, currency, fetchCars } = useAppContext();
    const navigate = useNavigate();

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [car, setCar] = useState({
        brand: '',
        model: '',
        year: 2024,
        pricePerDay: 50,
        category: 'Sedan',
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        seating_capacity: 5,
        location: 'Bengaluru',
        description: '',
        images: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleImageSelection = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (!image) {
            toast.error("Please upload an image of the car");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('carData', JSON.stringify(car));

            const { data } = await axios.post('/api/owner/add-car', formData);

            if (data.success) {
                toast.success(data.message || "Car successfully added to fleet!");
                setImage(null);
                setPreviewUrl('');
                setCar({
                    brand: '',
                    model: '',
                    year: 2024,
                    pricePerDay: 50,
                    category: 'Sedan',
                    transmission: 'Automatic',
                    fuel_type: 'Petrol',
                    seating_capacity: 5,
                    location: 'Bengaluru',
                    description: '',
                });
                fetchCars();
                navigate('/owner/manage-cars');
            } else {
                toast.error(data.message || "Failed to add car");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-slate-50/50 min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">List a New Vehicle</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Upload vehicle photos and specifications to add to active fleet.</p>
                </div>
                <button
                    onClick={() => navigate('/owner/manage-cars')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition self-start sm:self-auto cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Inventory</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-3xl">
                
                <form onSubmit={onSubmitHandler} className="space-y-6 text-xs font-medium text-slate-700">
                    
                    {/* ImageKit Upload Area */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Vehicle Photo (Uploaded & Optimized via ImageKit)
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100/50 transition">
                            {previewUrl ? (
                                <div className="relative w-44 h-28 rounded-2xl overflow-hidden shadow-md bg-slate-900 shrink-0">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-44 h-28 rounded-2xl bg-slate-200/70 border border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                    <ImagePlus className="w-8 h-8 mb-1" />
                                    <span className="text-[10px]">No image chosen</span>
                                </div>
                            )}

                            <div className="space-y-2 text-center sm:text-left">
                                <label className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition">
                                    {previewUrl ? "Change Photo" : "Upload High-Res Car Image"}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        required={!image}
                                        className="hidden" 
                                        onChange={handleImageSelection}
                                    />
                                </label>
                                <p className="text-[11px] text-slate-400">
                                    PNG, JPG or WebP (Max 5MB). ImageKit automatically applies WebP conversion and responsive CDN delivery.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Brand & Model */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Car Brand / Make</label>
                            <input 
                                type="text"
                                placeholder="e.g. BMW, Mercedes-Benz, Audi, Tesla"
                                required
                                value={car.brand}
                                onChange={e => setCar({...car, brand: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Model Name</label>
                            <input 
                                type="text"
                                placeholder="e.g. X5, E-Class, Model S, M4"
                                required
                                value={car.model}
                                onChange={e => setCar({...car, model: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Year, Daily Rate, Capacity */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Model Year</label>
                            <input 
                                type="number"
                                placeholder="2024"
                                min="2000"
                                max="2027"
                                required
                                value={car.year}
                                onChange={e => setCar({...car, year: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Daily Rate ({currency})</label>
                            <input 
                                type="number"
                                placeholder="75"
                                min="10"
                                required
                                value={car.pricePerDay}
                                onChange={e => setCar({...car, pricePerDay: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Seating Capacity</label>
                            <input 
                                type="number"
                                placeholder="5"
                                min="2"
                                max="15"
                                required
                                value={car.seating_capacity}
                                onChange={e => setCar({...car, seating_capacity: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    {/* Category, Transmission, Fuel */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Vehicle Category</label>
                            <select 
                                value={car.category}
                                onChange={e => setCar({...car, category: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                            >
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Van">Van</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Electric">Electric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Transmission</label>
                            <select 
                                value={car.transmission}
                                onChange={e => setCar({...car, transmission: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                            >
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                                <option value="Semi-Automatic">Semi-Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fuel Type</label>
                            <select 
                                value={car.fuel_type}
                                onChange={e => setCar({...car, fuel_type: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                            >
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Gas">Gas</option>
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Hub / City Location</label>
                        <input 
                            type="text"
                            placeholder="e.g. Bengaluru, Mumbai, Delhi, Shimla"
                            required
                            value={car.location}
                            onChange={e => setCar({...car, location: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Additional Gallery Image URLs */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Additional Gallery Image URLs <span className="text-slate-400 font-normal lowercase">(optional, comma-separated)</span>
                        </label>
                        <input 
                            type="text"
                            placeholder="https://images.unsplash.com/... , https://images.unsplash.com/..."
                            value={car.images || ''}
                            onChange={e => setCar({...car, images: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Allows the car details page to render an interactive multi-angle photo gallery.</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Vehicle Description</label>
                        <textarea 
                            rows={4}
                            placeholder="Highlight performance features, leather interior, sound system, fuel efficiency..."
                            required
                            value={car.description}
                            onChange={e => setCar({...car, description: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Submit CTA */}
                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            <Check className="w-4 h-4" />
                            {isLoading ? "Optimizing & Listing Vehicle..." : "Publish Car to Live Platform"}
                        </button>
                    </div>

                </form>

            </div>

        </div>
    );
};

export default AddCar;
