import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Camera, 
    ShieldCheck, 
    Calendar, 
    Save, 
    Car,
    Clock,
    LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, setUser, axios, fetchUser, isOwner, navigate } = useAppContext();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setPreviewImage(user.image || '');
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = async () => {
        if (!imageFile) return;
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const { data } = await axios.post('/api/owner/update-image', formData);
            if (data.success) {
                toast.success("Profile picture updated!");
                setImageFile(null);
                fetchUser();
            } else {
                toast.error(data.message || "Failed to upload image");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await axios.put('/api/user/profile', {
                name,
                phone,
                address
            });

            if (data.success) {
                toast.success("Profile updated successfully!");
                if (data.user) setUser(data.user);
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="py-24 text-center">
                <p className="text-slate-500">Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Profile & Settings</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage your personal details, contact information, and verified credentials.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Avatar & Summary Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md text-center space-y-4">
                            
                            {/* Avatar with Upload Icon */}
                            <div className="relative inline-block mx-auto group">
                                <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 ring-4 ring-blue-500/20 shadow-md mx-auto">
                                    {previewImage ? (
                                        <img src={previewImage} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-3xl">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <label 
                                    htmlFor="profile-photo"
                                    className="absolute bottom-0 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer transition"
                                >
                                    <Camera className="w-4 h-4" />
                                    <input 
                                        type="file" 
                                        id="profile-photo" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            {imageFile && (
                                <button
                                    onClick={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
                                >
                                    {uploadingImage ? "Uploading..." : "Save Photo"}
                                </button>
                            )}

                            <div>
                                <h3 className="font-bold text-base text-slate-900">{user.name}</h3>
                                <p className="text-xs text-slate-500">{user.email}</p>
                                <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                    isOwner ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                }`}>
                                    {isOwner ? "Platform Host / Admin" : "Verified Driver"}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-left">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Identity Verified</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span>Member since {new Date(user.createdAt || Date.now()).getFullYear()}</span>
                                </div>
                            </div>

                            {isOwner && (
                                <button
                                    onClick={() => navigate('/owner')}
                                    className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Switch to Admin Dashboard
                                </button>
                            )}

                        </div>
                    </div>

                    {/* Right Column: Edit Profile Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h3>

                            <form onSubmit={handleSaveProfile} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Full Name
                                    </label>
                                    <div className="relative flex items-center">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                                        <input 
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Email Address (Immutable)
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                                        <input 
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Contact Phone Number
                                    </label>
                                    <div className="relative flex items-center">
                                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                                        <input 
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Residential Address / City
                                    </label>
                                    <div className="relative flex items-center">
                                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5" />
                                        <input 
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="City, State, Country"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? "Saving Changes..." : "Save Profile Details"}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Profile;
