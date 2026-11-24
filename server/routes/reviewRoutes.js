import express from "express";
import { 
    addReview, 
    deleteReview, 
    getAllAdminReviews, 
    getCarReviews 
} from "../controllers/reviewController.js";
import { protect, adminProtect } from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.get("/car/:carId", getCarReviews);
reviewRouter.post("/add", protect, addReview);
reviewRouter.get("/admin/all", protect, adminProtect, getAllAdminReviews);
reviewRouter.delete("/admin/:reviewId", protect, adminProtect, deleteReview);

export default reviewRouter;