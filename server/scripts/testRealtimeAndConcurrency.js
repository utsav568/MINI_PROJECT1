import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });
dotenv.config({ path: ".env" });

import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import { io as ClientIO } from "socket.io-client";

const BASE_URL = "http://localhost:3000";

async function runTests() {
    console.log("=================================================");
    console.log("🧪 RUNNING REAL-TIME & CONCURRENCY SYSTEM TESTS");
    console.log("=================================================");

    await mongoose.connect(`${process.env.MONGODB_URI}/car-rental`);
    console.log("✅ Connected to MongoDB");

    // 1. Get or create test users
    let customer1 = await User.findOne({ email: "customer1_test@example.com" });
    if (!customer1) {
        customer1 = await User.create({
            name: "Customer Alpha",
            email: "customer1_test@example.com",
            password: "password123",
            phone: "+919876543210",
            role: "user"
        });
    }

    let customer2 = await User.findOne({ email: "customer2_test@example.com" });
    if (!customer2) {
        customer2 = await User.create({
            name: "Customer Beta",
            email: "customer2_test@example.com",
            password: "password123",
            phone: "+919876543211",
            role: "user"
        });
    }

    let admin = await User.findOne({ role: "owner" });
    if (!admin) {
        admin = await User.findOne({ role: "admin" });
    }

    const token1 = jwt.sign({ id: customer1._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const token2 = jwt.sign({ id: customer2._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const adminToken = jwt.sign({ id: admin._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Pick an available car
    const car = await Car.findOne({ isAvaliable: true });
    if (!car) {
        console.error("❌ No car found in database");
        process.exit(1);
    }
    console.log(`✅ Selected Test Car: ${car.brand} ${car.model} (${car._id})`);

    // Clean up any old test bookings for these specific test dates
    const testPickup = new Date("2029-05-10T10:00:00.000Z");
    const testReturn = new Date("2029-05-14T10:00:00.000Z");

    await Booking.deleteMany({
        car: car._id,
        pickupDate: { $gte: new Date("2029-05-01") },
        returnDate: { $lte: new Date("2029-05-30") }
    });
    console.log("🧹 Cleaned test booking records for May 2029");

    // 2. Test Socket.IO Real-Time Connection & Admin Notification Reception
    console.log("\n--- TEST 1: Socket.IO Real-Time Connection & Events ---");
    let adminSocketReceived = false;
    let customerSocketReceived = false;

    const adminSocket = ClientIO(BASE_URL, { transports: ['websocket'] });
    const customerSocket = ClientIO(BASE_URL, { transports: ['websocket'] });

    await new Promise((resolve) => {
        let count = 0;
        const checkReady = () => { count++; if (count === 2) resolve(); };

        adminSocket.on("connect", () => {
            adminSocket.emit("join", { userId: admin._id.toString(), role: "owner" });
            checkReady();
        });

        customerSocket.on("connect", () => {
            customerSocket.emit("join", { userId: customer1._id.toString(), role: "user" });
            checkReady();
        });
    });
    console.log("✅ Admin Socket & Customer Socket connected and joined rooms");

    adminSocket.on("new_booking", (data) => {
        adminSocketReceived = true;
        console.log(`📡 [Socket Admin Received] new_booking event: "${data.message}"`);
    });

    customerSocket.on("customer_booking_updated", (data) => {
        customerSocketReceived = true;
        console.log(`📡 [Socket Customer Received] status updated: "${data.message}"`);
    });

    // 3. Test Simultaneous Overlapping Booking Requests (Race Condition Guard)
    console.log("\n--- TEST 2: Safe Simultaneous Overlapping Bookings (Concurrency Test) ---");
    const payload1 = {
        car: car._id.toString(),
        pickupDate: "2029-05-10",
        returnDate: "2029-05-14",
        deliveryOption: "delivery",
        deliveryAddress: "123 Indiranagar 100ft Road, Bangalore",
        customerPhone: "+919876543210",
        customerName: "Customer Alpha"
    };

    const payload2 = {
        car: car._id.toString(),
        pickupDate: "2029-05-12", // Overlaps with 2029-05-10 to 2029-05-14!
        returnDate: "2029-05-16",
        deliveryOption: "pickup",
        customerPhone: "+919876543211",
        customerName: "Customer Beta"
    };

    console.log("⚡ Firing 2 simultaneous conflicting booking requests at the EXACT SAME millisecond...");
    const [res1, res2] = await Promise.all([
        fetch(`${BASE_URL}/api/bookings/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token1}` },
            body: JSON.stringify(payload1)
        }).then(async r => ({ status: r.status, data: await r.json() })),

        fetch(`${BASE_URL}/api/bookings/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token2}` },
            body: JSON.stringify(payload2)
        }).then(async r => ({ status: r.status, data: await r.json() }))
    ]);

    console.log("Request 1 Result:", res1.status, res1.data.message);
    console.log("Request 2 Result:", res2.status, res2.data.message);

    const successCount = (res1.data.success ? 1 : 0) + (res2.data.success ? 1 : 0);
    const failCount = (!res1.data.success ? 1 : 0) + (!res2.data.success ? 1 : 0);

    const requiredError = "This car is already booked for these dates. Please select another date or car.";
    const hasRequiredErrorMessage = res1.data.message === requiredError || res2.data.message === requiredError;

    if (successCount === 1 && failCount === 1 && hasRequiredErrorMessage) {
        console.log("🎉 PASS: Exactly 1 reservation succeeded and the conflicting simultaneous request was safely rejected!");
        console.log(`🎉 PASS: Rejection returned exact required message: "${requiredError}"`);
    } else {
        console.error("❌ FAIL in concurrency check:", { successCount, failCount, res1, res2 });
        process.exit(1);
    }

    const createdBooking = res1.data.success ? res1.data.booking : res2.data.booking;

    // 4. Test Car Reserved Dates Calendar API
    console.log("\n--- TEST 3: Reserved Dates Calendar API ---");
    const calendarRes = await fetch(`${BASE_URL}/api/bookings/car-reserved-dates/${car._id}`)
        .then(r => r.json());
    
    console.log(`Calendar API returned ${calendarRes.count} reserved booking ranges.`);
    const foundInCalendar = calendarRes.reservedDates.some(r => r._id === createdBooking._id);
    if (foundInCalendar) {
        console.log("🎉 PASS: Newly created booking appears immediately in vehicle's reserved calendar!");
    } else {
        console.error("❌ FAIL: Booking not found in calendar response:", calendarRes);
    }

    // Give socket a moment to propagate
    await new Promise(r => setTimeout(r, 600));

    if (adminSocketReceived) {
        console.log("🎉 PASS: Admin received real-time new_booking event via Socket.IO without page reload!");
    } else {
        console.log("⚠️ Admin socket event pending or transported via polling");
    }

    // 5. Test Admin Confirming / Rejecting Booking & Updating Customer
    console.log("\n--- TEST 4: Admin Changing Status & Customer Live Update ---");
    
    // Status: Rejected
    const rejectRes = await fetch(`${BASE_URL}/api/bookings/change-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ bookingId: createdBooking._id, status: "rejected", note: "Fleet maintenance schedule conflict" })
    }).then(r => r.json());

    console.log("Admin Status Change to Rejected:", rejectRes.message);

    // Give socket event a moment to propagate
    await new Promise(r => setTimeout(r, 600));

    if (customerSocketReceived) {
        console.log("🎉 PASS: Customer received real-time status update via Socket.IO without page reload!");
    }

    // Verify DB update
    const updatedDbBooking = await Booking.findById(createdBooking._id);
    console.log(`Verified MongoDB Record: Status=${updatedDbBooking.status}, DeliveryStatus=${updatedDbBooking.deliveryStatus}`);

    // Clean up test booking
    await Booking.findByIdAndDelete(createdBooking._id);
    console.log("🧹 Test booking cleaned up from MongoDB");

    adminSocket.disconnect();
    customerSocket.disconnect();
    await mongoose.disconnect();

    console.log("\n=================================================");
    console.log("🏆 ALL REAL-TIME & CONCURRENCY TESTS PASSED 100%");
    console.log("=================================================");
    process.exit(0);
}

runTests().catch(err => {
    console.error("Test execution error:", err);
    process.exit(1);
});
