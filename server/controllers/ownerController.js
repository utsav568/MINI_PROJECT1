import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
import { getCityCoordinates } from "../scripts/migrateCoordinates.js";

// API to Change Role of User to Owner/Admin
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findByIdAndUpdate(_id, { role: "owner" }, { new: true });
        res.json({ success: true, message: "Role upgraded to Owner/Admin. You can now manage vehicles and dashboard.", user });
    } catch (error) {
        console.error("changeRoleToOwner error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to List / Add a New Car
export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        let image = car.image || "";

        // If file uploaded, upload to ImageKit
        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: '/cars'
            });

            if (fs.existsSync(imageFile.path)) {
                fs.unlinkSync(imageFile.path);
            }

            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { width: '1280' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ]
            });
            image = optimizedImageUrl;
        }

        if (!image) {
            return res.json({ success: false, message: "Car image is required" });
        }

        // Compute coordinates
        const locInfo = getCityCoordinates(car.location);
        const lat = car.coordinates?.lat || locInfo.lat;
        const lng = car.coordinates?.lng || locInfo.lng;

        // Process gallery images
        let galleryImages = [];
        if (Array.isArray(car.images) && car.images.length > 0) {
            galleryImages = car.images;
        } else if (typeof car.images === 'string' && car.images.trim()) {
            galleryImages = car.images.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (!galleryImages.includes(image)) {
            galleryImages.unshift(image);
        }

        const newCar = await Car.create({
            ...car,
            year: Number(car.year),
            pricePerDay: Number(car.pricePerDay),
            seating_capacity: Number(car.seating_capacity),
            owner: _id,
            image,
            images: galleryImages,
            coordinates: { lat, lng },
            locationGeo: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            hubAddress: car.hubAddress || locInfo.hub,
            deliveryFeePerKm: Number(car.deliveryFeePerKm) || 15,
            isAvaliable: true
        });

        res.json({ success: true, message: "Car added to inventory successfully!", car: newCar });

    } catch (error) {
        console.error("addCar error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Update an Existing Car
export const updateCar = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { carId } = req.params;
        let updateData = req.body.carData ? JSON.parse(req.body.carData) : req.body;
        const imageFile = req.file;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        const isOwner = car.owner && car.owner.toString() === _id.toString();
        const isAdmin = role === 'admin' || role === 'owner';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized to edit this car" });
        }

        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: '/cars'
            });

            if (fs.existsSync(imageFile.path)) {
                fs.unlinkSync(imageFile.path);
            }

            updateData.image = imagekit.url({
                path: response.filePath,
                transformation: [
                    { width: '1280' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ]
            });
        }

        if (updateData.year) updateData.year = Number(updateData.year);
        if (updateData.pricePerDay) updateData.pricePerDay = Number(updateData.pricePerDay);
        if (updateData.seating_capacity) updateData.seating_capacity = Number(updateData.seating_capacity);

        // Process gallery images if provided
        if (updateData.images) {
            if (typeof updateData.images === 'string') {
                updateData.images = updateData.images.split(',').map(s => s.trim()).filter(Boolean);
            }
            const activePrimary = updateData.image || car.image;
            if (activePrimary && !updateData.images.includes(activePrimary)) {
                updateData.images.unshift(activePrimary);
            }
        } else if (updateData.image) {
            updateData.images = [updateData.image, ...(car.images || []).filter(img => img !== updateData.image)];
        }

        // Update coordinates if location changed
        if (updateData.location && updateData.location !== car.location) {
            const locInfo = getCityCoordinates(updateData.location);
            updateData.coordinates = { lat: locInfo.lat, lng: locInfo.lng };
            updateData.locationGeo = { type: 'Point', coordinates: [locInfo.lng, locInfo.lat] };
            if (!updateData.hubAddress) updateData.hubAddress = locInfo.hub;
        }

        const updatedCar = await Car.findByIdAndUpdate(carId, updateData, { new: true });

        res.json({ success: true, message: "Car updated successfully", car: updatedCar });

    } catch (error) {
        console.error("updateCar error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to List Owner/Admin Cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const query = (role === 'admin' || role === 'owner') ? {} : { owner: _id };
        const cars = await Car.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: cars.length, cars });
    } catch (error) {
        console.error("getOwnerCars error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        const isOwner = car.owner && car.owner.toString() === _id.toString();
        const isAdmin = role === 'admin' || role === 'owner';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save();

        res.json({ 
            success: true, 
            message: `Car is now ${car.isAvaliable ? 'Available' : 'Unavailable'}`,
            isAvaliable: car.isAvaliable 
        });
    } catch (error) {
        console.error("toggleCarAvailability error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Delete a Car
export const deleteCar = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        const isOwner = car.owner && car.owner.toString() === _id.toString();
        const isAdmin = role === 'admin' || role === 'owner';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Car.findByIdAndDelete(carId);
        res.json({ success: true, message: "Car removed from platform successfully" });
    } catch (error) {
        console.error("deleteCar error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Comprehensive Dashboard Data & Analytics
export const getDashboardData = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'owner' && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized. Admin access required." });
        }

        const [
            totalUsers,
            totalCars,
            allBookings,
            allCars
        ] = await Promise.all([
            User.countDocuments(),
            Car.countDocuments(),
            Booking.find()
                .populate('car', 'brand model image category location coordinates hubAddress')
                .populate('user', 'name email phone')
                .sort({ createdAt: -1 }),
            Car.find().select('category pricePerDay isAvaliable location coordinates')
        ]);

        const totalBookings = allBookings.length;
        const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
        const completedBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
        const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;

        // Delivery Stats
        const doorstepDeliveriesCount = allBookings.filter(b => b.deliveryOption === 'delivery').length;
        const pendingDeliveriesCount = allBookings.filter(b => b.deliveryOption === 'delivery' && b.deliveryStatus === 'Pending').length;

        // Calculate Revenue
        const totalRevenue = allBookings
            .filter(b => b.status === 'confirmed' || b.status === 'completed')
            .reduce((sum, b) => sum + (b.price || 0), 0);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = allBookings
            .filter(b => {
                const bDate = new Date(b.createdAt);
                return (b.status === 'confirmed' || b.status === 'completed') &&
                    bDate.getMonth() === currentMonth &&
                    bDate.getFullYear() === currentYear;
            })
            .reduce((sum, b) => sum + (b.price || 0), 0);

        // Category breakdown
        const categoryCounts = {};
        allCars.forEach(car => {
            const cat = car.category || 'Other';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        // Booking Trends (last 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTrends = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth();
            const y = d.getFullYear();
            const count = allBookings.filter(b => {
                const bDate = new Date(b.createdAt);
                return bDate.getMonth() === m && bDate.getFullYear() === y;
            }).length;
            const rev = allBookings.filter(b => {
                const bDate = new Date(b.createdAt);
                return (b.status === 'confirmed' || b.status === 'completed') &&
                    bDate.getMonth() === m && bDate.getFullYear() === y;
            }).reduce((sum, b) => sum + (b.price || 0), 0);

            monthlyTrends.push({
                month: monthNames[m],
                bookings: count,
                revenue: rev
            });
        }

        const dashboardData = {
            totalUsers,
            totalCars,
            totalBookings,
            pendingBookings,
            completedBookings,
            cancelledBookings,
            doorstepDeliveriesCount,
            pendingDeliveriesCount,
            totalRevenue,
            monthlyRevenue: monthlyRevenue || totalRevenue,
            recentBookings: allBookings.slice(0, 6),
            categoryCounts,
            monthlyTrends
        };

        res.json({ success: true, dashboardData });

    } catch (error) {
        console.error("getDashboardData error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Manage Users (List All Registered Users with Phone)
export const getAllUsers = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'owner' && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
        }

        const users = await User.find().select('-password').sort({ createdAt: -1 });

        const usersWithStats = await Promise.all(users.map(async (u) => {
            const bookingCount = await Booking.countDocuments({ user: u._id });
            return {
                ...u.toObject(),
                bookingCount
            };
        }));

        res.json({ success: true, count: usersWithStats.length, users: usersWithStats });
    } catch (error) {
        console.error("getAllUsers error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Change User Role
export const changeUserRole = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'owner' && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
        }

        const { targetUserId, newRole } = req.body;
        if (!['user', 'owner', 'admin'].includes(newRole)) {
            return res.status(400).json({ success: false, message: "Invalid role specified" });
        }

        const user = await User.findByIdAndUpdate(targetUserId, { role: newRole }, { new: true }).select('-password');
        res.json({ success: true, message: `User role changed to ${newRole}`, user });
    } catch (error) {
        console.error("changeUserRole error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Delete a User
export const deleteUser = async (req, res) => {
    try {
        const { _id, role } = req.user;
        if (role !== 'owner' && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
        }

        const { targetUserId } = req.body;
        if (targetUserId === _id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
        }

        await User.findByIdAndDelete(targetUserId);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("deleteUser error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to update user profile image
export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file;

        if (!imageFile) {
            return res.json({ success: false, message: "No image file provided" });
        }

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        });

        if (fs.existsSync(imageFile.path)) {
            fs.unlinkSync(imageFile.path);
        }

        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '400' },
                { quality: 'auto' },
                { format: 'webp' }
            ]
        });

        const updatedUser = await User.findByIdAndUpdate(_id, { image: optimizedImageUrl }, { new: true }).select("-password");
        res.json({ success: true, message: "Profile picture updated successfully", image: optimizedImageUrl, user: updatedUser });

    } catch (error) {
        console.error("updateUserImage error:", error.message);
        res.json({ success: false, message: error.message });
    }
};
