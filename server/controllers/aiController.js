import Car from "../models/Car.js";
import { calculateDistanceKm } from "../utils/geoUtils.js";

export const chatWithAI = async (req, res) => {
    try {
        const { message, history = [], customerLocation = null } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ success: false, message: "Please enter a message" });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Fetch live available car inventory directly from MongoDB
        const availableCars = await Car.find({ isAvaliable: true })
            .select('_id brand model year category seating_capacity fuel_type transmission pricePerDay location hubAddress coordinates description')
            .lean();

        // Calculate distance if customer location is provided
        const hasLocation = customerLocation && customerLocation.lat && customerLocation.lng;
        const cLat = hasLocation ? Number(customerLocation.lat) : null;
        const cLng = hasLocation ? Number(customerLocation.lng) : null;

        // Format inventory for AI context with real distance
        const inventoryContext = availableCars.map(c => {
            let dist = null;
            if (hasLocation && c.coordinates?.lat && c.coordinates?.lng) {
                dist = calculateDistanceKm(cLat, cLng, c.coordinates.lat, c.coordinates.lng);
            }

            return {
                id: c._id.toString(),
                name: `${c.brand} ${c.model}`,
                year: c.year,
                category: c.category,
                seats: c.seating_capacity,
                fuel: c.fuel_type,
                transmission: c.transmission,
                pricePerDay: `$${c.pricePerDay} (approx ₹${c.pricePerDay * 80})`,
                locationCity: c.location,
                hubAddress: c.hubAddress || `${c.location} Fleet Station`,
                distanceKm: dist !== null ? `${dist} km from customer` : "Distance unknown (location not selected)",
                features: c.description
            };
        });

        // Sort by distance if customer location available
        if (hasLocation) {
            inventoryContext.sort((a, b) => {
                const dA = parseFloat(a.distanceKm) || 9999;
                const dB = parseFloat(b.distanceKm) || 9999;
                return dA - dB;
            });
        }

        if (!apiKey) {
            return res.status(503).json({
                success: false,
                aiUnavailable: true,
                message: "Gemini API key is not configured in server/.env. Please add GEMINI_API_KEY to enable live AI responses from Google Gemini.",
                tip: "You can obtain a free Gemini API key from https://aistudio.google.com/app/apikey"
            });
        }

        const locationNotice = hasLocation 
            ? `CUSTOMER LIVE LOCATION: "${customerLocation.address || 'Selected Location'}" (Lat: ${cLat}, Lng: ${cLng}). Prioritize cars closest to this customer!`
            : "CUSTOMER LOCATION: Not yet provided. If the user asks for cars near them, politely suggest enabling location or choosing a city.";

        const systemInstruction = `You are "SmartDrive AI Assistant", the intelligent automotive concierge and geospatial reservation advisor for SmartDrive AI – India's premier AI-powered Car Rental & Doorstep Delivery platform.
Your mission is to help customers find, compare, and book the perfect vehicle based on their budget, passenger count, preferred category (SUV, Sedan, Van, Luxury, Electric), or current live location.

${locationNotice}

ACTUAL REAL INVENTORY IN OUR DATABASE (Count: ${inventoryContext.length} vehicles):
${JSON.stringify(inventoryContext, null, 2)}

STRICT OPERATING INSTRUCTIONS:
1. ONLY recommend vehicles from the actual inventory above. NEVER invent or hallucinate vehicles, prices, locations, or distances.
2. When the user asks for cars "near my location" or "near me", check the real "distanceKm" and "hubAddress" from the inventory above and clearly state the approximate distance (e.g. "Only 4.2 km away from your location at Indiranagar Depot").
3. When recommending a vehicle, clearly state brand, model, daily rate ($ / ₹), seating capacity, fuel type, transmission, and distance/hub.
4. If the user asks about doorstep delivery, explain that we deliver vehicles directly to their address with transparent distance-based fees (₹15/km), and they can track delivery status ('Pending' -> 'Accepted' -> 'On the Way' -> 'Delivered') in their booking dashboard.
5. If the user mentions a budget in Rupees (₹) or Dollars ($), match against the pricePerDay values.
6. If the user mentions passenger count (e.g. 5-seater, 7-seater), filter strictly by seating capacity.
7. Keep responses concise, helpful, and formatted with clean bullet points.`;

        // Format history for Gemini API
        const contents = [];

        if (Array.isArray(history)) {
            for (const item of history.slice(-8)) {
                if (item.sender === 'user' || item.role === 'user') {
                    contents.push({ role: 'user', parts: [{ text: item.text || item.message }] });
                } else if (item.sender === 'ai' || item.role === 'model') {
                    contents.push({ role: 'model', parts: [{ text: item.text || item.message }] });
                }
            }
        }

        contents.push({ role: 'user', parts: [{ text: message }] });

        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const payload = {
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Gemini API error status:", response.status, errData);
            return res.status(response.status).json({
                success: false,
                aiUnavailable: true,
                message: errData.error?.message || `AI service error (${response.status}). Please check your GEMINI_API_KEY.`,
            });
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const aiReply = candidate?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response at this moment.";

        // Match mentioned car IDs to render preview cards in UI
        const matchedCars = availableCars.filter(car => {
            const fullName = `${car.brand} ${car.model}`.toLowerCase();
            return aiReply.toLowerCase().includes(fullName) || aiReply.toLowerCase().includes(car.model.toLowerCase());
        }).slice(0, 3).map(car => {
            const d = hasLocation ? calculateDistanceKm(cLat, cLng, car.coordinates?.lat, car.coordinates?.lng) : null;
            return {
                ...car,
                distanceKm: d
            };
        });

        res.json({
            success: true,
            reply: aiReply,
            suggestedCars: matchedCars
        });

    } catch (error) {
        console.error("chatWithAI error:", error.message);
        res.status(500).json({
            success: false,
            aiUnavailable: true,
            message: "Unable to reach AI Assistant: " + error.message
        });
    }
};

// Endpoint to get AI quick suggested prompts with location-aware suggestions
export const getAISuggestions = async (req, res) => {
    try {
        const suggestions = [
            "Find nearest available cars to my location",
            "I need a 5-seater car near me under ₹2,000/day",
            "Can you deliver a luxury SUV to my doorstep?",
            "What electric vehicles are closest to me?",
            "Explain delivery charges and booking procedures"
        ];
        res.json({ success: true, suggestions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
