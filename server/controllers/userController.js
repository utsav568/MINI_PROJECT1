import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Car from "../models/Car.js";
import { calculateDistanceKm, validatePhoneNumber } from "../utils/geoUtils.js";

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register User (with Mobile Number validation)
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || password.length < 6) {
            return res.json({ success: false, message: 'Please provide all fields. Password must be at least 6 characters.' });
        }

        if (phone && !validatePhoneNumber(phone)) {
            return res.json({ success: false, message: 'Please provide a valid phone number (8-15 digits).' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.json({ success: false, message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone ? phone.trim() : ''
        });

        const token = generateToken(user._id.toString());
        const userSafe = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            phone: user.phone,
            address: user.address,
            lastKnownLocation: user.lastKnownLocation
        };

        res.json({ success: true, token, user: userSafe });

    } catch (error) {
        console.error("registerUser error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Login User 
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: "Please provide email and password" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(user._id.toString());
        const userSafe = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            phone: user.phone,
            address: user.address,
            lastKnownLocation: user.lastKnownLocation
        };

        res.json({ success: true, token, user: userSafe });
    } catch (error) {
        console.error("loginUser error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get User data using Token (JWT)
export const getUserData = async (req, res) => {
    try {
        const { user } = req;
        res.json({ success: true, user });
    } catch (error) {
        console.error("getUserData error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
    try {
        const { _id } = req.user;
        const { name, phone, address, image, lastKnownLocation } = req.body;

        if (phone && !validatePhoneNumber(phone)) {
            return res.json({ success: false, message: "Please provide a valid contact phone number" });
        }

        const updatedFields = {};
        if (name !== undefined) updatedFields.name = name.trim();
        if (phone !== undefined) updatedFields.phone = phone.trim();
        if (address !== undefined) updatedFields.address = address.trim();
        if (image !== undefined) updatedFields.image = image;
        if (lastKnownLocation !== undefined) updatedFields.lastKnownLocation = lastKnownLocation;

        const updatedUser = await User.findByIdAndUpdate(_id, updatedFields, { new: true }).select("-password");

        res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("updateUserProfile error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Save customer's live / manual location in MongoDB
export const saveCustomerLocation = async (req, res) => {
    try {
        const { address, lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: "Valid coordinates (lat, lng) are required" });
        }

        const locationData = {
            address: address || "Selected Customer Location",
            lat: Number(lat),
            lng: Number(lng)
        };

        if (req.user?._id) {
            await User.findByIdAndUpdate(req.user._id, { lastKnownLocation: locationData });
        }

        res.json({ success: true, message: "Location saved successfully", location: locationData });
    } catch (error) {
        console.error("saveCustomerLocation error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get All Cars with optional Location Distance & Geo filters
export const getCars = async (req, res) => {
    try {
        const { 
            search, 
            category, 
            fuel_type, 
            transmission, 
            location, 
            minPrice, 
            maxPrice, 
            sort,
            userLat,
            userLng,
            maxDistanceKm 
        } = req.query;

        const query = { isAvaliable: true };

        if (category && category !== 'All') {
            query.category = new RegExp(`^${category}$`, 'i');
        }
        if (fuel_type && fuel_type !== 'All') {
            query.fuel_type = new RegExp(`^${fuel_type}$`, 'i');
        }
        if (transmission && transmission !== 'All') {
            query.transmission = new RegExp(`^${transmission}$`, 'i');
        }
        if (location && location !== 'All') {
            query.location = new RegExp(`^${location}$`, 'i');
        }
        if (minPrice || maxPrice) {
            query.pricePerDay = {};
            if (minPrice) query.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }

        let cars = await Car.find(query).lean();

        // Calculate distance if userLat and userLng provided
        const hasUserLocation = userLat && userLng && !isNaN(Number(userLat)) && !isNaN(Number(userLng));
        if (hasUserLocation) {
            const uLat = Number(userLat);
            const uLng = Number(userLng);

            cars = cars.map(car => {
                const carLat = car.coordinates?.lat || 0;
                const carLng = car.coordinates?.lng || 0;
                const dist = calculateDistanceKm(uLat, uLng, carLat, carLng);
                return {
                    ...car,
                    distanceKm: dist !== null ? dist : 9999
                };
            });

            // Distance filtering (5 km, 10 km, 20 km, 50 km)
            if (maxDistanceKm && !isNaN(Number(maxDistanceKm))) {
                const maxD = Number(maxDistanceKm);
                cars = cars.filter(c => c.distanceKm <= maxD);
            }

            // Default sort by distance if user provided location and no explicit sort specified
            if (!sort || sort === 'distance_asc') {
                cars.sort((a, b) => a.distanceKm - b.distanceKm);
            }
        }

        // Additional sorts
        if (sort === 'price_asc') cars.sort((a, b) => a.pricePerDay - b.pricePerDay);
        if (sort === 'price_desc') cars.sort((a, b) => b.pricePerDay - a.pricePerDay);
        if (sort === 'year_desc') cars.sort((a, b) => b.year - a.year);

        res.json({ 
            success: true, 
            count: cars.length, 
            hasUserLocation: Boolean(hasUserLocation),
            cars 
        });

    } catch (error) {
        console.error("getCars error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Single Car by ID
export const getCarById = async (req, res) => {
    try {
        const { id } = req.params;
        const car = await Car.findById(id).populate('owner', 'name email image phone');
        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }
        res.json({ success: true, car });
    } catch (error) {
        console.error("getCarById error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Distinct Locations & Filter metadata
export const getDistinctLocations = async (req, res) => {
    try {
        const locations = await Car.distinct("location", { isAvaliable: true });
        const categories = await Car.distinct("category", { isAvaliable: true });
        const fuelTypes = await Car.distinct("fuel_type", { isAvaliable: true });
        const transmissions = await Car.distinct("transmission", { isAvaliable: true });

        res.json({
            success: true,
            locations: locations.filter(Boolean),
            categories: categories.filter(Boolean),
            fuelTypes: fuelTypes.filter(Boolean),
            transmissions: transmissions.filter(Boolean)
        });
    } catch (error) {
        console.error("getDistinctLocations error:", error.message);
        res.json({ success: false, message: error.message });
    }
};
