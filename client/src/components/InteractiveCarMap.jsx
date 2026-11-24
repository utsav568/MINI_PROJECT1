import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ExternalLink, Fuel, Users, Gauge } from 'lucide-react';
import CarImage from './CarImage';

// Custom User Location Pin Icon (Blue pulsating radar beacon)
const createUserIcon = () => {
    return L.divIcon({
        className: 'custom-user-marker',
        html: `
            <div style="position: relative; width: 28px; height: 28px;">
                <div style="position: absolute; inset: 0; background: rgba(37, 99, 235, 0.35); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; background: #2563EB; border: 3px solid white; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
};

// Custom Car Marker Icon (Sleek dark vehicle badge with price)
const createCarIcon = (price, currency = '$') => {
    return L.divIcon({
        className: 'custom-car-marker',
        html: `
            <div style="display: flex; align-items: center; gap: 4px; background: #0F172A; color: white; border: 2px solid white; border-radius: 9999px; padding: 3px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.35); font-weight: 700; font-size: 11px; white-space: nowrap; cursor: pointer;">
                <span style="display: inline-block; width: 6px; height: 6px; background: #10B981; border-radius: 9999px;"></span>
                <span>${currency}${price}</span>
            </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12]
    });
};

// Component to adjust map view when center or cars change
const MapUpdater = ({ center, cars }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat && center.lng) {
            map.setView([center.lat, center.lng], 12, { animate: true });
        }
    }, [center, map]);
    return null;
};

const InteractiveCarMap = ({ 
    userLocation = null, 
    cars = [], 
    currency = '$', 
    height = '480px',
    onMapClick = null 
}) => {
    const navigate = useNavigate();

    // Default center (e.g. Bengaluru or Delhi if no user location)
    const defaultCenter = userLocation && userLocation.lat && userLocation.lng 
        ? [userLocation.lat, userLocation.lng]
        : cars.length > 0 && cars[0].coordinates?.lat 
            ? [cars[0].coordinates.lat, cars[0].coordinates.lng]
            : [12.9716, 77.5946];

    return (
        <div style={{ height }} className="w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md relative z-10">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={userLocation} cars={cars} />

                {/* User Live Marker */}
                {userLocation && userLocation.lat && userLocation.lng && (
                    <>
                        <Marker 
                            position={[userLocation.lat, userLocation.lng]} 
                            icon={createUserIcon()}
                        >
                            <Popup>
                                <div className="p-1 text-center font-sans">
                                    <div className="flex items-center justify-center gap-1.5 text-blue-600 font-bold text-xs mb-1">
                                        <Navigation className="w-3.5 h-3.5" />
                                        <span>Your Current Location</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium max-w-xs">{userLocation.address || 'Selected Location'}</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* 5 km and 10 km service radius circles */}
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={5000}
                            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.05, weight: 1, dashArray: '4, 4' }}
                        />
                    </>
                )}

                {/* Car Pins on Map */}
                {cars.map((car) => {
                    const lat = car.coordinates?.lat;
                    const lng = car.coordinates?.lng;
                    if (!lat || !lng) return null;

                    return (
                        <Marker
                            key={car._id}
                            position={[lat, lng]}
                            icon={createCarIcon(car.pricePerDay, currency)}
                        >
                            <Popup>
                                <div className="p-1 font-sans max-w-xs">
                                    <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-slate-100">
                                        <CarImage 
                                            src={car.image} 
                                            alt={car.model} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xs">{car.brand} {car.model}</h4>
                                            <p className="text-[10px] text-slate-500">{car.category} • {car.year}</p>
                                        </div>
                                        <span className="text-xs font-extrabold text-blue-600 shrink-0">
                                            {currency}{car.pricePerDay}/day
                                        </span>
                                    </div>

                                    {car.distanceKm !== undefined && (
                                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full my-1 border border-emerald-200">
                                            <span>Approx {car.distanceKm} km away</span>
                                        </div>
                                    )}

                                    <p className="text-[10px] text-slate-500 truncate mb-2">
                                        📍 {car.hubAddress || car.location}
                                    </p>

                                    <button
                                        onClick={() => navigate(`/car-details/${car._id}`)}
                                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                                    >
                                        <span>View Details & Book</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default InteractiveCarMap;
