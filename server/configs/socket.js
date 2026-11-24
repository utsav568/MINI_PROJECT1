import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on("connection", (socket) => {
        // Authenticated users or admins join rooms
        socket.on("join", ({ userId, role }) => {
            if (userId) {
                const userRoom = `user_${userId}`;
                socket.join(userRoom);
                console.log(`Socket ${socket.id} joined user room: ${userRoom}`);
            }

            if (role === "admin" || role === "owner") {
                socket.join("admin_room");
                console.log(`Socket ${socket.id} joined admin_room`);
            }
        });

        socket.on("join_car_room", (carId) => {
            if (carId) {
                socket.join(`car_${carId}`);
            }
        });

        socket.on("disconnect", () => {
            // connection cleanly closed
        });
    });

    console.log("⚡ Socket.IO initialized successfully");
    return io;
};

export const getIO = () => {
    return io;
};

// Helper: Notify admin about new booking in real time
export const emitNewBooking = (booking) => {
    if (!io) return;
    try {
        io.to("admin_room").emit("new_booking", {
            booking,
            message: `New booking received for ${booking.car?.brand || 'Car'} ${booking.car?.model || ''} by ${booking.customerName || 'Customer'}`,
            timestamp: new Date()
        });
        // Also broadcast to public for general live reservation counter updates
        io.emit("booking_created_global", {
            carId: booking.car?._id || booking.car,
            pickupDate: booking.pickupDate,
            returnDate: booking.returnDate
        });
    } catch (err) {
        console.error("Socket emission error (new_booking):", err.message);
    }
};

// Helper: Notify both admin and customer about status change
export const emitBookingStatusUpdated = (booking) => {
    if (!io) return;
    try {
        const userId = booking.user?._id || booking.user;
        const userRoom = `user_${userId}`;

        // Notify Admin
        io.to("admin_room").emit("booking_status_updated", {
            booking,
            message: `Booking #${booking._id.toString().slice(-6).toUpperCase()} status changed to ${booking.status}`,
            timestamp: new Date()
        });

        // Notify Customer
        io.to(userRoom).emit("customer_booking_updated", {
            booking,
            status: booking.status,
            message: `Your booking for ${booking.car?.brand || 'Car'} ${booking.car?.model || ''} has been ${booking.status}!`,
            timestamp: new Date()
        });
    } catch (err) {
        console.error("Socket emission error (status_updated):", err.message);
    }
};

// Helper: Notify car room about date changes
export const emitCarCalendarUpdated = (carId, reservedDates) => {
    if (!io) return;
    try {
        io.to(`car_${carId}`).emit("car_dates_updated", {
            carId,
            reservedDates
        });
    } catch (err) {
        console.error("Socket emission error (car_calendar):", err.message);
    }
};
