import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["owner", "user", "admin"], default: 'user' },
    image: { type: String, default: '' },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '' },
    lastKnownLocation: {
        address: { type: String, default: '' },
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
