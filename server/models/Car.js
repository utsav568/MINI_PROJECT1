import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const carSchema = new mongoose.Schema({
    owner: { type: ObjectId, ref: 'User' },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] }, // Multi-image gallery support
    year: { type: Number, required: true },
    category: { type: String, required: true },
    seating_capacity: { type: Number, required: true },
    fuel_type: { type: String, required: true },
    transmission: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    location: { type: String, required: true },
    hubAddress: { type: String, default: '' },
    coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    locationGeo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    deliveryFeePerKm: { type: Number, default: 15 },
    description: { type: String, required: true },
    isAvaliable: { type: Boolean, default: true },
    ratingsAverage: { type: Number, default: 4.8 },
    ratingsCount: { type: Number, default: 0 }
}, { timestamps: true });

carSchema.index({ locationGeo: '2dsphere' });

const Car = mongoose.model('Car', carSchema);

export default Car;