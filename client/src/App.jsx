import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import CarDetails from './pages/CarDetails';
import Cars from './pages/Cars';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import Layout from './pages/owner/Layout';
import Dashboard from './pages/owner/Dashboard';
import AddCar from './pages/owner/AddCar';
import ManageCars from './pages/owner/ManageCars';
import ManageBookings from './pages/owner/ManageBookings';
import ManageUsers from './pages/owner/ManageUsers';
import ManageReviews from './pages/owner/ManageReviews';
import Login from './components/Login';
import CarAIAssistant from './components/CarAIAssistant';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './context/AppContext';

const App = () => {
    const { showLogin } = useAppContext();
    const isOwnerPath = useLocation().pathname.startsWith('/owner');

    return (
        <div className="min-h-screen flex flex-col justify-between bg-white text-slate-800">
            <Toaster 
                position="top-right" 
                toastOptions={{
                    duration: 3500,
                    style: {
                        borderRadius: '16px',
                        background: '#0F172A',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '500'
                    }
                }}
            />

            {showLogin && <Login />}

            {!isOwnerPath && <Navbar />}

            <main className="flex-grow">
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/car-details/:id' element={<CarDetails />} />
                    <Route path='/cars' element={<Cars />} />
                    <Route path='/my-bookings' element={<MyBookings />} />
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='/owner' element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="add-car" element={<AddCar />} />
                        <Route path="manage-cars" element={<ManageCars />} />
                        <Route path="manage-bookings" element={<ManageBookings />} />
                        <Route path="manage-users" element={<ManageUsers />} />
                        <Route path="manage-reviews" element={<ManageReviews />} />
                    </Route>
                </Routes>
            </main>

            {/* Floating Car AI Assistant available on every page */}
            <CarAIAssistant />

            {!isOwnerPath && <Footer />}
        </div>
    );
};

export default App;
