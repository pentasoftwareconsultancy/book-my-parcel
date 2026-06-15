
import { useState } from "react";
import {  FiMapPin, FiPackage, FiUser, FiStar,  } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ServerUrl from "../../core/constants/serverUrl.constant";
import ApiService from "../../core/services/api.service";
import RoutePath from "../../core/constants/routes.constant";
import SearchSection from  "./SearchSection"

import {
  FiTruck,
} from "react-icons/fi";
export default function TravellerSearchPage() {
    const navigate = useNavigate();
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    //  API CALL INSIDE SAME FILE
    const handleSearch = async () => {
        if (!origin.trim() || !destination.trim()) {
            setError("Please enter origin and destination");
            return;
        }

        setError("");
        setLoading(true);

        console.log("Origin Selected:", origin);
        console.log("Destination Selected:", destination);

        try {
            // First, geocode the addresses to get coordinates
            const [originGeocode, destinationGeocode] = await Promise.all([
                ApiService.geocodeAddress(origin),
                ApiService.geocodeAddress(destination)
            ]);

            console.log("Origin Geocode:", originGeocode);
            console.log("Destination Geocode:", destinationGeocode);

            // Debug the actual structure
            console.log("Origin data structure:", {
                data: originGeocode.data,
                lat: originGeocode.data?.data?.lat,
                lng: originGeocode.data?.data?.lng,
                fullStructure: JSON.stringify(originGeocode.data, null, 2)
            });

            // Extract coordinates from Google Maps API response format
            const originResult = originGeocode.data?.results?.[0];
            const destResult = destinationGeocode.data?.results?.[0];

            const originLat = originResult?.geometry?.location?.lat;
            const originLng = originResult?.geometry?.location?.lng;
            const destLat = destResult?.geometry?.location?.lat;
            const destLng = destResult?.geometry?.location?.lng;

            console.log("Extracted coordinates:", {
                origin: { lat: originLat, lng: originLng },
                destination: { lat: destLat, lng: destLng }
            });

            if (!originLat || !originLng) {
                console.error("Missing origin coordinates:", { originLat, originLng, originResult });
                setError("Could not find coordinates for origin location");
                return;
            }

            if (!destLat || !destLng) {
                console.error("Missing destination coordinates:", { destLat, destLng, destResult });
                setError("Could not find coordinates for destination location");
                return;
            }

            // Now search for routes using coordinates
            const response = await ApiService.apiget(
                ServerUrl.API_TRAVELER_ROUTE_SEARCH,
                {
                    origin_lat: originLat,
                    origin_lng: originLng,
                    destination_lat: destLat,
                    destination_lng: destLng,
                }
            );

            console.log("Full Response:", response);
            console.log("Response Data:", response.data);
            console.log("Routes:", response.data.data);

            console.log("API RESPONSE:", response.data);

            const data = response.data;

            if (data.success) {
                setRoutes(data.data || []);
            } else {
                setRoutes([]);
                setError(data.message || "No routes found");
            }
        } catch (err) {
            console.error("Route search error:", err);

            setRoutes([]);

            // Provide more specific error messages
            let errorMessage = "Server error. Please try again.";

            if (err.response?.status === 400) {
                errorMessage = "Invalid location coordinates. Please try different locations.";
            } else if (err.response?.status === 404) {
                errorMessage = "No routes found for the selected locations.";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="h-18" />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(RoutePath.PUBLIC_HOME)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
             bg-gradient-to-r from-blue-600 to-indigo-600
             text-white text-sm font-semibold
             shadow-md hover:shadow-lg
             hover:from-blue-700 hover:to-indigo-700
             transform hover:-translate-y-0.5 hover:scale-105
             transition-all duration-300 ease-in-out"
                    >
                        <span className="text-base">←</span>
                        Back to Home
                    </button>
                </div>

                <h1 className="text-xl font-bold mb-1">Find Travellers</h1>
                <p className="text-gray-500 mb-6 text-sm">
                    Search for verified travellers on your route and get your parcels delivered
                </p>

                {/* Search Form */}
                <SearchSection
  origin={origin}setOrigin={setOrigin}destination={destination}setDestination={setDestination}handleSearch={handleSearch}loading={loading}error={error}
/>
                {/* Results Section */}
                <div className="space-y-4">
                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100 shadow-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && routes.length === 0 && !error && (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-lg">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <FiMapPin className="text-xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No routes found</h3>
                            <p className="text-gray-500 text-sm">Try searching different locations or check back later for new travellers.</p>
                        </div>
                    )}

                    {/* Traveller Cards */}
                    {!loading && routes.length > 0 && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Available Travellers ({routes.length})
                                </h3>
                                <div className="text-sm text-gray-500">
                                    Sorted by relevance
                                </div>
                            </div>

                            <div className="space-y-4">
                                {routes.map((route) => {
                                    const travellerName =
                                        route.traveller_name ||
                                        route.travellerProfile?.user?.profile?.name ||
                                        route.travellerProfile?.user?.name ||
                                        route.travellerProfile?.user?.email ||
                                        route.travellerProfile?.user?.phone_number ||
                                        route.user?.profile?.name ||
                                        route.user?.name ||
                                        route.user?.email ||
                                        route.user?.phone_number ||
                                        "Verified Traveller";
                                    const rating = route.rating || route.travellerProfile?.rating || "4.8";
                                    const completedTrips = route.completed_trips || route.travellerProfile?.total_deliveries || "25+";
                                    const transportMode = route.transport_mode === 'private' ? 'Private Vehicle' : (route.transport_mode || "Available");
                                    const vehicleType = route.vehicle_type || route.travellerProfile?.vehicle_type || "Personal Vehicle";
                                    const weight = route.max_weight_kg ? `${route.max_weight_kg} kg` : (route.available_capacity_kg ? `${route.available_capacity_kg} kg` : "—");
                                    const transitInfo = route.transit_details ? (typeof route.transit_details === 'string' ? route.transit_details : JSON.stringify(route.transit_details)) : null;

                                    const cardOrigin = route.originAddress?.formatted_address || route.originAddress?.address || origin;
                                    const cardDestination = route.destAddress?.formatted_address || route.destAddress?.address || destination;

                                    return (
                                
                                    <div
                                        key={route.id}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-100"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Traveller Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <FiUser className="text-white text-2xl" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">✓</span>
                                                </div>
                                            </div>

                                            {/* Traveller Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-lg">
                                                            {travellerName}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <FiStar className="text-yellow-500 fill-current" />
                                                                <span className="font-medium">{rating}</span>
                                                            </div>
                                                            <span>•</span>
                                                            <span>{completedTrips} trips completed</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            {transportMode}
                                                        </span>
                                                        <div className="text-sm text-gray-500 mt-1 capitalize">
                                                            {vehicleType}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Route Details */}
                                                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
  <div className="flex gap-4">
    {/* Icon */}
    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <FiTruck className="text-blue-600 text-2xl" />
    </div>

    {/* Content */}
    <div className="flex-1">
      {/* Route */}
            <h3 className="font-semibold text-base text-gray-900 leading-6">
                {cardOrigin} → {cardDestination}
            </h3>

      {/* Pickup */}
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                <FiMapPin className="text-green-500 mt-1 flex-shrink-0" size={14} />
                <span>{cardOrigin}</span>
            </div>

      {/* Destination */}
            <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
                <FiMapPin className="text-red-500 mt-1 flex-shrink-0" size={14} />
                <span>{cardDestination}</span>
            </div>

      {/* Info */}
      <div className="flex flex-wrap gap-6 mt-3 text-sm">
                <div>
                    <span className="text-gray-500">Vehicle:</span>{" "}
                    <span className="font-semibold text-gray-800">
                        {vehicleType}
                    </span>
                </div>

                <div>
                    <span className="text-gray-500">Mode:</span>{" "}
                    <span className="font-semibold text-gray-800 capitalize">
                        {transportMode}
                    </span>
                </div>

                <div>
                    <span className="text-gray-500">Weight:</span>{" "}
                    <span className="font-semibold text-gray-800">
                        {weight}
                    </span>
                </div>
      </div>

      {/* Transit Badge */}
      {transitInfo && (
        <div className="mt-3 inline-flex bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
          {transitInfo}
        </div>
      )}
    </div>
  </div>
</div>
           

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <button className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2">
                                                        <FiPackage className="text-sm" />
                                                        Book Now
                                                    </button>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="h-20" />
        </div>
    );
}