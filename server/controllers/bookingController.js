import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import { calculateDistanceKm, calculateDeliveryCharge, validatePhoneNumber } from "../utils/geoUtils.js";
import { emitNewBooking, emitBookingStatusUpdated } from "../configs/socket.js";
import { sendNewBookingEmails, sendStatusChangeEmail } from "../services/emailService.js";

// In-Memory Concurrency Mutex per Car to safely serialize simultaneous reservation attempts
const carMutexes = new Map();

const acquireCarLock = async (carId) => {
    const key = carId.toString();
    while (carMutexes.has(key)) {
        await carMutexes.get(key);
    }
    let release;
    const promise = new Promise((resolve) => { release = resolve; });
    carMutexes.set(key, promise);
    return () => {
        carMutexes.delete(key);
        release();
    };
};

// Helper Function to Check Availability of Car for a given Date range
export const checkAvailability = async (carId, pickupDate, returnDate) => {
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    const overlappingBookings = await Booking.find({
        car: carId,
        status: { $nin: ["cancelled", "rejected"] },
        pickupDate: { $lte: returnD },
        returnDate: { $gte: pickup },
    });

    return overlappingBookings.length === 0;
};

// API to Check Availability of Cars for given Date and optional location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        if (!pickupDate || !returnDate) {
            return res.json({ success: false, message: "Please select both pickup and return dates" });
        }

        const query = { isAvaliable: true };
        if (location && location !== 'All' && location.trim() !== '') {
            query.location = new RegExp(`^${location.trim()}$`, 'i');
        }

        const cars = await Car.find(query);

        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
            return isAvailable ? car : null;
        });

        const results = await Promise.all(availableCarsPromises);
        const availableCars = results.filter(Boolean);

        res.json({ success: true, count: availableCars.length, availableCars });

    } catch (error) {
        console.error("checkAvailabilityOfCar error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Fetch Reserved Dates for a Specific Car (For Booking Calendar)
export const getCarReservedDates = async (req, res) => {
    try {
        const { carId } = req.params;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const reservedBookings = await Booking.find({
            car: carId,
            status: { $nin: ["cancelled", "rejected"] },
            returnDate: { $gte: now }
        })
        .select('pickupDate returnDate status days customerName')
        .sort({ pickupDate: 1 });

        res.json({ 
            success: true, 
            count: reservedBookings.length, 
            reservedDates: reservedBookings 
        });

    } catch (error) {
        console.error("getCarReservedDates error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to Create Booking with Concurrency Protection, Doorstep Delivery, Real-Time Socket, and Email Notifications
export const createBooking = async (req, res) => {
    let releaseLock = null;
    try {
        const { _id, name, email, phone: profilePhone } = req.user;
        const { 
            car, 
            pickupDate, 
            returnDate, 
            paymentId, 
            paymentMethod, 
            paymentStatus,
            customerPhone,
            customerName,
            deliveryOption = "pickup",
            deliveryAddress = "",
            deliveryCoordinates = { lat: 0, lng: 0 }
        } = req.body;

        if (!car || !pickupDate || !returnDate) {
            return res.status(400).json({ success: false, message: "Car and dates are required" });
        }

        // Validate Contact Phone Number (8-15 digits)
        const phoneToUse = customerPhone || profilePhone;
        if (!phoneToUse || !validatePhoneNumber(phoneToUse)) {
            return res.status(400).json({ 
                success: false, 
                message: "A valid mobile phone number (8-15 digits) is required for car reservation and delivery confirmation." 
            });
        }

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (isNaN(picked.getTime()) || isNaN(returned.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        if (returned < picked) {
            return res.status(400).json({ success: false, message: "Return date cannot be earlier than pickup date" });
        }

        // 1. Acquire mutex lock on this car to strictly prevent concurrent double-booking races
        releaseLock = await acquireCarLock(car);

        // 2. Strict backend availability check inside mutex
        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.status(400).json({ 
                success: false, 
                message: "This car is already booked for these dates. Please select another date or car." 
            });
        }

        const carData = await Car.findById(car);
        if (!carData) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        // Calculate days and base price
        const diffTime = Math.abs(returned - picked);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const days = diffDays === 0 ? 1 : diffDays;
        const baseRentalPrice = carData.pricePerDay * days;

        // Delivery Fee Calculation if doorstep delivery is requested
        let deliveryFee = 0;
        let deliveryDistanceKm = 0;
        let initialDeliveryStatus = "Not Applicable";

        if (deliveryOption === "delivery") {
            if (!deliveryAddress || !deliveryAddress.trim()) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Complete doorstep delivery address is required when selecting delivery option." 
                });
            }

            const carLat = carData.coordinates?.lat || 0;
            const carLng = carData.coordinates?.lng || 0;
            const delLat = deliveryCoordinates?.lat || 0;
            const delLng = deliveryCoordinates?.lng || 0;

            deliveryDistanceKm = calculateDistanceKm(delLat, delLng, carLat, carLng) || 5;
            deliveryFee = calculateDeliveryCharge(deliveryDistanceKm, carData.deliveryFeePerKm || 15);
            initialDeliveryStatus = "Pending";
        }

        const totalPrice = baseRentalPrice + deliveryFee;

        // Create booking record in MongoDB
        const booking = await Booking.create({
            car,
            owner: carData.owner || _id,
            user: _id,
            pickupDate: picked,
            returnDate: returned,
            days,
            price: totalPrice,
            deliveryOption,
            deliveryAddress: deliveryAddress.trim(),
            deliveryCoordinates,
            deliveryDistanceKm,
            deliveryFee,
            deliveryStatus: initialDeliveryStatus,
            customerPhone: phoneToUse.trim(),
            customerName: customerName || name || "Customer",
            status: "confirmed",
            paymentStatus: paymentStatus || "paid",
            paymentId: paymentId || ("PAY-" + Date.now()),
            paymentMethod: paymentMethod || "card"
        });

        // Release mutex lock immediately after record is committed
        if (releaseLock) {
            releaseLock();
            releaseLock = null;
        }

        const populatedBooking = await Booking.findById(booking._id)
            .populate('car')
            .populate('user', 'name email phone')
            .populate('owner', 'name email phone');

        // Real-Time Socket.IO Notification to Admin & Global Listeners
        emitNewBooking(populatedBooking);

        // Async Email Notification to Customer & Admin
        sendNewBookingEmails({
            booking: populatedBooking,
            car: carData,
            user: { name: customerName || name || "Customer", email: email || req.user.email },
            adminEmail: process.env.ADMIN_EMAIL
        }).catch(e => console.error("Async email error:", e.message));

        res.json({ 
            success: true, 
            message: deliveryOption === "delivery" 
                ? "Car booked with doorstep delivery request submitted!" 
                : "Car booked successfully for self pickup!", 
            booking: populatedBooking 
        });

    } catch (error) {
        console.error("createBooking error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (releaseLock) releaseLock();
    }
};

// API to List User Bookings 
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id })
            .populate("car")
            .populate("owner", "name email phone")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: bookings.length, bookings });

    } catch (error) {
        console.error("getUserBookings error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Cancel Booking (User or Admin/Owner)
export const cancelBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findById(bookingId)
            .populate('car')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const isUser = booking.user._id.toString() === _id.toString();
        const isOwner = booking.owner && booking.owner.toString() === _id.toString();
        const isAdmin = req.user.role === 'owner' || req.user.role === 'admin';

        if (!isUser && !isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
        }

        if (booking.status === 'cancelled') {
            return res.json({ success: false, message: "Booking is already cancelled" });
        }

        booking.status = 'cancelled';
        if (booking.deliveryStatus !== 'Not Applicable') {
            booking.deliveryStatus = 'Rejected';
        }
        if (booking.paymentStatus === 'paid') {
            booking.paymentStatus = 'refunded';
        }
        await booking.save();

        // Emit real-time status update to Admin and Customer dashboards
        emitBookingStatusUpdated(booking);

        // Send cancellation email
        sendStatusChangeEmail({
            booking,
            car: booking.car,
            user: booking.user,
            newStatus: 'cancelled',
            reason: isUser ? "Cancelled by customer" : "Cancelled by platform administrator"
        }).catch(e => console.error("Cancel email error:", e.message));

        res.json({ success: true, message: "Booking cancelled successfully. Payment marked for refund.", booking });

    } catch (error) {
        console.error("cancelBooking error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Owner/Admin Bookings with customer phone and delivery details
export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
        }

        const query = req.user.role === 'admin' ? {} : { owner: req.user._id };
        const bookings = await Booking.find(query)
            .populate('car')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        console.error("getOwnerBookings error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API for Admins to Change Booking Status (pending, confirmed, rejected, cancelled, completed)
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { bookingId, status, note } = req.body;

        if (!bookingId || !status) {
            return res.status(400).json({ success: false, message: "Booking ID and status are required" });
        }

        const allowedStatuses = ["pending", "confirmed", "rejected", "cancelled", "completed"];
        const normStatus = status.toLowerCase();
        if (!allowedStatuses.includes(normStatus)) {
            return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` });
        }

        const booking = await Booking.findById(bookingId)
            .populate('car')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const isOwner = booking.owner && booking.owner.toString() === _id.toString();
        const isAdmin = role === 'owner' || role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        booking.status = normStatus;
        if (normStatus === 'cancelled' && booking.paymentStatus === 'paid') {
            booking.paymentStatus = 'refunded';
        }
        if (normStatus === 'rejected') {
            if (booking.deliveryStatus !== 'Not Applicable') {
                booking.deliveryStatus = 'Rejected';
            }
            if (booking.paymentStatus === 'paid') {
                booking.paymentStatus = 'refunded';
            }
        }
        await booking.save();

        // Emit real-time Socket.IO notification to customer and admin
        emitBookingStatusUpdated(booking);

        // Send status change email
        sendStatusChangeEmail({
            booking,
            car: booking.car,
            user: booking.user,
            newStatus: normStatus,
            reason: note || ""
        }).catch(e => console.error("Status change email error:", e.message));

        res.json({ 
            success: true, 
            message: `Booking status updated to ${normStatus}`, 
            booking 
        });

    } catch (error) {
        console.error("changeBookingStatus error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for Admins to Accept/Reject or Update Delivery Status
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { bookingId, deliveryStatus } = req.body;

        if (!bookingId || !deliveryStatus) {
            return res.status(400).json({ success: false, message: "Booking ID and delivery status are required" });
        }

        const allowedStatuses = ["Pending", "Accepted", "On the Way", "Delivered", "Rejected"];
        if (!allowedStatuses.includes(deliveryStatus)) {
            return res.status(400).json({ success: false, message: "Invalid delivery status" });
        }

        const booking = await Booking.findById(bookingId).populate('car user');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const isOwner = booking.owner && booking.owner.toString() === _id.toString();
        const isAdmin = role === 'owner' || role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        booking.deliveryStatus = deliveryStatus;
        await booking.save();

        // Real-Time Socket.IO notification
        emitBookingStatusUpdated(booking);

        res.json({ 
            success: true, 
            message: `Delivery status updated to ${deliveryStatus}`, 
            booking 
        });

    } catch (error) {
        console.error("updateDeliveryStatus error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
