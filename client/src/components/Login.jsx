import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';

const Login = () => {
    const { setShowLogin, axios, setToken, setUser, setIsOwner, navigate } = useAppContext();

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await axios.post(`/api/user/${state}`, { name, email, password });

            if (data.success) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                if (data.user) {
                    setUser(data.user);
                    setIsOwner(data.user.role === 'owner' || data.user.role === 'admin');
                }
                toast.success(state === "login" ? `Welcome back, ${data.user?.name || "Driver"}!` : "Account created successfully!");
                setShowLogin(false);
            } else {
                toast.error(data.message || "Authentication failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            onClick={() => setShowLogin(false)} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-8"
            >
                {/* Close Button */}
                <button 
                    onClick={() => setShowLogin(false)}
                    className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {state === "login" ? "Welcome Back" : "Join CarRental"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {state === "login" 
                            ? "Sign in to manage your bookings and unlock member rates" 
                            : "Create an account to experience seamless premium car rentals"}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                    <button 
                        type="button"
                        onClick={() => setState("login")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            state === "login" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Sign In
                    </button>
                    <button 
                        type="button"
                        onClick={() => setState("register")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            state === "register" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmitHandler} className="space-y-4">
                    {state === "register" && (
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative flex items-center">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="e.g. John Doe"
                                    required 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="name@example.com"
                                required 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative flex items-center">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Minimum 6 characters"
                                required 
                                minLength={6}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : state === "login" ? (
                            "Sign In to Your Account"
                        ) : (
                            "Agree & Create Account"
                        )}
                    </button>
                </form>

                {/* Footer notes */}
                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                        {state === "login" ? (
                            <>Don't have an account yet? <span onClick={() => setState("register")} className="text-blue-600 font-semibold cursor-pointer hover:underline">Sign up free</span></>
                        ) : (
                            <>Already registered? <span onClick={() => setState("login")} className="text-blue-600 font-semibold cursor-pointer hover:underline">Log in here</span></>
                        )}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
