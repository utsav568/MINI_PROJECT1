import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
    Users, 
    Search, 
    Shield, 
    ShieldCheck, 
    Trash2, 
    Mail, 
    Calendar,
    UserCheck,
    UserX,
    Phone,
    MapPin
} from 'lucide-react';

const ManageUsers = () => {
    const { axios, isOwner, user: currentUser } = useAppContext();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/owner/users');
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message || "Failed to load users");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOwner) fetchAllUsers();
    }, [isOwner]);

    const handleRoleChange = async (targetUserId, currentRole) => {
        const newRole = currentRole === 'owner' ? 'user' : 'owner';
        try {
            const { data } = await axios.post('/api/owner/change-user-role', {
                targetUserId,
                newRole
            });
            if (data.success) {
                toast.success(data.message || `User role updated to ${newRole}`);
                fetchAllUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteUser = async (targetUserId) => {
        if (targetUserId === currentUser?._id) {
            toast.error("You cannot delete your own active admin account");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this user account?")) {
            return;
        }

        try {
            const { data } = await axios.post('/api/owner/delete-user', { targetUserId });
            if (data.success) {
                toast.success(data.message || "User account removed");
                fetchAllUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 p-6 md:p-10 bg-slate-50/50 min-h-screen">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Registered Customers & Hosts</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage customer accounts, view contact phone numbers, assign host privileges, and review security access.
                </p>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, phone, or role..."
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                    />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                    Total: <strong className="text-slate-900">{filteredUsers.length}</strong> registered accounts
                </span>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">Customer Name</th>
                                <th className="p-4">Contact Phone</th>
                                <th className="p-4">Email Address</th>
                                <th className="p-4">Role Privileges</th>
                                <th className="p-4">Total Trips</th>
                                <th className="p-4">Member Since</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        Loading user directory...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-slate-400">
                                        No users found matching query.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50/50 transition">
                                        
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 shadow-2xs">
                                                {u.image ? (
                                                    <img src={u.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    u.name?.charAt(0) || "U"
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{u.name}</p>
                                                {u.lastKnownLocation?.address && (
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[150px] flex items-center gap-1">
                                                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                                        {u.lastKnownLocation.address}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Contact Phone Number */}
                                        <td className="p-4">
                                            {u.phone ? (
                                                <a 
                                                    href={`tel:${u.phone}`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 transition"
                                                    title="Call customer"
                                                >
                                                    <Phone className="w-3 h-3 text-blue-500" />
                                                    <span>{u.phone}</span>
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">Not set</span>
                                            )}
                                        </td>

                                        <td className="p-4 text-slate-600 font-medium">
                                            {u.email}
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                u.role === 'owner' || u.role === 'admin'
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                            }`}>
                                                {u.role === 'owner' ? 'Host / Admin' : u.role === 'admin' ? 'Superadmin' : 'Standard User'}
                                            </span>
                                        </td>

                                        <td className="p-4 font-bold text-slate-900">
                                            {u.bookingCount || 0} trips
                                        </td>

                                        <td className="p-4 text-slate-400">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>

                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRoleChange(u._id, u.role)}
                                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                                                        u.role === 'owner'
                                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                    }`}
                                                    title="Toggle Role"
                                                >
                                                    {u.role === 'owner' ? "Demote to User" : "Promote to Host"}
                                                </button>

                                                {u._id !== currentUser?._id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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

export default ManageUsers;