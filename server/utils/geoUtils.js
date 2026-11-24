// Calculate distance in kilometers using Haversine formula
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
    const nLat1 = Number(lat1);
    const nLon1 = Number(lon1);
    const nLat2 = Number(lat2);
    const nLon2 = Number(lon2);

    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

    const R = 6371; // Earth radius in km
    const dLat = (nLat2 - nLat1) * Math.PI / 180;
    const dLon = (nLon2 - nLon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(nLat1 * Math.PI / 180) * Math.cos(nLat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Number(d.toFixed(1));
};

// Calculate delivery charge based on distance and rate
export const calculateDeliveryCharge = (distanceKm, ratePerKm = 15) => {
    if (!distanceKm || distanceKm <= 0) return 0;
    // Base fee ₹50 + rate per km
    const baseFee = 50;
    return Math.round(baseFee + (distanceKm * ratePerKm));
};

// Validate phone number format
export const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    const cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');
    return /^[0-9]{8,15}$/.test(cleaned);
};
