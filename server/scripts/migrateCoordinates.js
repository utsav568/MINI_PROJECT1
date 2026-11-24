import "dotenv/config";
import mongoose from "mongoose";
import Car from "../models/Car.js";

const cityCoordinatesMap = {
    "shimla": { lat: 31.1048, lng: 77.1734, hub: "The Mall Road Fleet Station, Shimla" },
    "lucknow": { lat: 26.8467, lng: 80.9462, hub: "Gomti Nagar Premium Hub, Lucknow" },
    "pondicherry": { lat: 11.9416, lng: 79.8083, hub: "White Town Promenade Depot, Pondicherry" },
    "ranchi": { lat: 23.3441, lng: 85.3096, hub: "Doranda Main Road Terminal, Ranchi" },
    "bengaluru": { lat: 12.9716, lng: 77.5946, hub: "Indiranagar 100ft Road Luxury Depot, Bengaluru" },
    "bangalore": { lat: 12.9716, lng: 77.5946, hub: "Indiranagar 100ft Road Luxury Depot, Bengaluru" },
    "delhi": { lat: 28.6139, lng: 77.2090, hub: "Connaught Place Central Hub, New Delhi" },
    "new delhi": { lat: 28.6139, lng: 77.2090, hub: "Connaught Place Central Hub, New Delhi" },
    "mumbai": { lat: 19.0760, lng: 72.8777, hub: "Bandra Kurla Complex (BKC) Terminal, Mumbai" },
    "chennai": { lat: 13.0827, lng: 80.2707, hub: "Anna Nagar West Fleet Hub, Chennai" },
    "hyderabad": { lat: 17.3850, lng: 78.4867, hub: "Hitec City Cyber Towers Hub, Hyderabad" },
    "pune": { lat: 18.5204, lng: 73.8567, hub: "Koregaon Park Terminal, Pune" },
    "goa": { lat: 15.2993, lng: 74.1240, hub: "Dabolim Airport Express Depot, Goa" },
    "jaipur": { lat: 26.9124, lng: 75.7873, hub: "C-Scheme Central Hub, Jaipur" },
    "kolkata": { lat: 22.5726, lng: 88.3639, hub: "Park Street Transit Depot, Kolkata" },
    "chandigarh": { lat: 30.7333, lng: 76.7794, hub: "Sector 17 City Hub, Chandigarh" }
};

export function getCityCoordinates(cityName) {
    if (!cityName) return { lat: 12.9716, lng: 77.5946, hub: "Main City Hub" };
    const lower = cityName.toLowerCase().trim();
    for (const [key, val] of Object.entries(cityCoordinatesMap)) {
        if (lower.includes(key)) {
            // Add slight jitter (0.005 - 0.02 deg ~ 500m - 2km) to spread individual cars across the city hub
            const jitterLat = (Math.random() - 0.5) * 0.03;
            const jitterLng = (Math.random() - 0.5) * 0.03;
            return {
                lat: Number((val.lat + jitterLat).toFixed(6)),
                lng: Number((val.lng + jitterLng).toFixed(6)),
                hub: val.hub
            };
        }
    }
    // Default to Bengaluru if unknown city
    return { lat: 12.9716, lng: 77.5946, hub: `${cityName} General Hub` };
}

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI + "/car-rental");
        console.log("Connected to MongoDB for coordinates migration...");

        const cars = await Car.find();
        let updatedCount = 0;

        for (const car of cars) {
            const locInfo = getCityCoordinates(car.location);
            car.coordinates = {
                lat: locInfo.lat,
                lng: locInfo.lng
            };
            car.locationGeo = {
                type: 'Point',
                coordinates: [locInfo.lng, locInfo.lat] // GeoJSON is [longitude, latitude]
            };
            if (!car.hubAddress) {
                car.hubAddress = locInfo.hub;
            }
            if (!car.deliveryFeePerKm) {
                car.deliveryFeePerKm = 15;
            }
            await car.save();
            updatedCount++;
        }

        console.log(`Successfully migrated ${updatedCount} cars with GeoJSON coordinates & Hub addresses!`);
        process.exit(0);
    } catch (err) {
        console.error("Migration error:", err);
        process.exit(1);
    }
}

// Only execute if called directly
if (process.argv[1]?.endsWith('migrateCoordinates.js')) {
    migrate();
}
