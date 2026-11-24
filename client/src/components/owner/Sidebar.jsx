import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, 
    PlusCircle, 
    Car, 
    CalendarCheck, 
    Users, 
    ArrowLeft, 
    Camera, 
    Check, 
    ShieldCheck,
    MessageSquare
} from 'lucide-react';

const Sidebar = () => {
    const { user, axios, fetchUser } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);

    const updateImage = async () => {
        if (!image) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', image);

            const { data } = await axios.post('/api/owner/update-image', formData);
            if (data.success) {
                fetchUser();
                toast.success(data.message || "Admin photo updated");
                setImage('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const adminLinks = [
        { name: "Overview", path: "/owner", icon: LayoutDashboard },
        { name: "Add Vehicle", path: "/owner/add-car", icon: PlusCircle },
        { name: "Manage Cars", path: "/owner/manage-cars", icon: Car },
        { name: "Manage Bookings", path: "/owner/manage-bookings", icon: CalendarCheck },
        { name: "Customer Reviews", path: "/owner/manage-reviews", icon: MessageSquare },
        { name: "Manage Users", path: "/owner/manage-users", icon: Users },
    ];

    return (
        <aside className="w-16 md:w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] flex flex-col justify-between p-3 md:p-5 shrink-0">
            
            {/* Top User Badge */}
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
                    <div className="relative group">
                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden bg-slate-100 ring-2 ring-blue-500/20 shadow-xs mx-auto">
                            {image ? (
                                <img src={URL.createObjectURL(image)} alt="" className="w-full h-full object-cover" />
                            ) : user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm md:text-xl">
                                    {user?.name?.charAt(0) || "A"}
                                </div>
                            )}
                        </div>

                        <label 
                            htmlFor="admin-avatar"
                            className="absolute -bottom-1 -right-1 p-1 md:p-1.5 bg-blue-600 text-white rounded-full shadow cursor-pointer hover:bg-blue-700 transition"
                            title="Change photo"
                        >
                            <Camera className="w-3 h-3" />
                            <input 
                                type="file" 
                                id="admin-avatar" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => setImage(e.target.files[0])}
                            />
                        </label>
                    </div>

                    {image && (
                        <button 
                            onClick={updateImage}
                            disabled={uploading}
                            className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                            <Check className="w-3 h-3" />
                            {uploading ? "Saving..." : "Save Photo"}
                        </button>
                    )}

                    <div className="hidden md:block mt-3">
                        <p className="font-bold text-sm text-slate-900 truncate max-w-44">{user?.name || "Administrator"}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1 border border-amber-200">
                            <ShieldCheck className="w-3 h-3" />
                            Authorized Admin
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5">
                    {adminLinks.map(link => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="hidden md:inline-block">{link.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom: Return to main website */}
            <div className="pt-4 border-t border-slate-100">
                <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span className="hidden md:inline-block">Back to Customer View</span>
                </button>
            </div>

        </aside>
    );
};

export default Sidebar;
