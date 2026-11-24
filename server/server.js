import express from "express";
import http from "http";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { initSocket } from "./configs/socket.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect Database
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ success: true, message: "Car Rental Real-Time API is running smoothly!" }));
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/ai', aiRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/reviews', reviewRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Car Rental Server running on port ${PORT} with Real-Time Socket.IO`));
