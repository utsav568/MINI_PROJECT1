import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema({
    car: { type: ObjectId, ref: "Car", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    owner: { type: ObjectId, ref: "User" },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ["pending", "confirmed", "rejected", "cancelled", "completed"], 
        default: "pending" 
    },
    price: { type: Number, required: true },
    days: { type: Number, default: 1 },
    
    // Delivery Details
    deliveryOption: { 
        type: String, 
        enum: ["pickup", "delivery"], 
        default: "pickup" 
    },
    deliveryAddress: { type: String, default: "" },
    deliveryCoordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    deliveryDistanceKm: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    deliveryStatus: { 
        type: String, 
        enum: ["Not Applicable", "Pending", "Accepted", "On the Way", "Delivered", "Rejected"], 
        default: "Not Applicable" 
    },

    // Customer Contact (never publicly exposed; visible only to authorized admin/owner)
    customerPhone: { type: String, required: true },
    customerName: { type: String, default: "" },

    paymentStatus: { 
        type: String, 
        enum: ["pending", "paid", "refunded"], 
        default: "pending" 
    },
    paymentId: { type: String, default: "" },
    paymentMethod: { type: String, default: "online" }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
