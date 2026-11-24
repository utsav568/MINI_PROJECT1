import React from 'react';
import { assets } from '../assets/assets';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

const Banner = () => {
    const { user, isOwner, setIsOwner, axios, setShowLogin } = useAppContext();
    const navigate = useNavigate();

    const handleHostClick = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        if (isOwner) {
            navigate('/owner');
        } else {
            try {
                const { data } = await axios.post('/api/owner/change-role');
                if (data.success) {
                    setIsOwner(true);
                    toast.success("Congratulations! Your account is now upgraded to Host.");
                    navigate('/owner/add-car');
                } else {
                    toast.error(data.message);
                }
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    return (
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-8 sm:p-12 lg:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10"
            >
                {/* Glow decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-xl z-10">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-white/15 px-3.5 py-1.5 rounded-full mb-4 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        Host With Us & Earn
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                        Turn Your Luxury Car Into High Income.
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
                        List your vehicle effortlessly. We handle background checks, comprehensive insurance, and verified online payments so you earn passive income worry-free.
                    </p>

                    <div className="flex flex-wrap gap-4 mt-6 text-xs text-blue-100">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            <span>100% Insured Trips</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-amber-300" />
                            <span>Top Host Earnings</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleHostClick}
                        className="mt-8 px-8 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                        <span>{isOwner ? "Go to Host Dashboard" : "List Your Vehicle Now"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative z-10 max-w-sm sm:max-w-md w-full">
                    <img 
                        src={assets.banner_car_image} 
                        alt="Earn with your car" 
                        className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Banner;
