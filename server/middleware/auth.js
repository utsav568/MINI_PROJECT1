import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }
    try {
        if (typeof token === 'string' && token.startsWith("Bearer ")) {
            token = token.slice(7).trim();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: "Token verification failed" });
        }

        const userId = typeof decoded === 'object' ? (decoded.id || decoded.userId || decoded._id) : decoded;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Authentication failed: " + error.message });
    }
};

export const adminProtect = async (req, res, next) => {
    if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'admin')) {
        return res.status(403).json({ success: false, message: "Access denied. Admin or Owner privileges required." });
    }
    next();
};
