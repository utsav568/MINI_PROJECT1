import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
    car: { type: ObjectId, ref: 'Car', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    userName: { type: String, required: true },
    userImage: { type: String, default: '' },
    isVerifiedTrip: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ car: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;