
import { useState } from "react";
import { FiSearch, FiMapPin, FiClock, FiPackage, FiUser, FiStar, FiMessageCircle, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ServerUrl from "../../core/constants/serverUrl.constant";
import ApiService from "../../core/services/api.service";
import AddressAutoComplete from "../../core/common/AddressAutocomplete";
import RoutePath from "../../core/constants/routes.constant";

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
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
                
                <h1 className="text-xl font-bold mb-1">Find Travellers</h1>
                <p className="text-gray-500 mb-6 text-sm">
                    Search for verified travellers on your route and get your parcels delivered
                </p>

                {/* Search Form */}
                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-lg">
                    <div className="flex items-center gap-2 mb-4 font-bold">
                        <FiSearch className="text-gray-500" size={20} />
                        <span>Search Routes</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-semibold">From Location *</label>
                            <AddressAutoComplete
                                value={origin}
                                onChange={setOrigin}
                                placeholder="Enter pickup location (e.g. Pune)"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-semibold">To Location *</label>
                            <AddressAutoComplete
                                value={destination}
                                onChange={setDestination}
                                placeholder="Enter destination (e.g. Mumbai)"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <FiSearch className="text-sm" />
                        {loading ? "Finding routes..." : "Search Travellers"}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                </div>

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
                                {routes.map((route) => (
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
                                                            {route.traveller_name || route.user?.name || "Verified Traveller"}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <FiStar className="text-yellow-500 fill-current" />
                                                                <span className="font-medium">{route.rating || "4.8"}</span>
                                                            </div>
                                                            <span>•</span>
                                                            <span>{route.completed_trips || "25+"} trips completed</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            {route.transport_mode === 'private' ? 'Private Vehicle' : route.transport_mode || "Available"}
                                                        </span>
                                                        <div className="text-sm text-gray-500 mt-1 capitalize">
                                                            {route.vehicle_type || "Personal Vehicle"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Route Details */}
                                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                            <span className="font-medium text-gray-700">
                                                                {route.originAddress?.city || origin.split(',')[0] || "Origin"}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 mx-4">
                                                            <div className="h-px bg-gray-300 relative">
                                                                <div className="absolute inset-0 bg-blue-500 w-3/4"></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                            <span className="font-medium text-gray-700">
                                                                {route.destAddress?.city || destination.split(',')[0] || "Destination"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div className="text-sm">
                                                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                                <FiMapPin className="text-xs" />
                                                            </div>
                                                            <div className="font-medium">{route.total_distance_km || "120"} km</div>
                                                            <div className="text-xs text-gray-500">Distance</div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                                <FiClock className="text-xs" />
                                                            </div>
                                                            <div className="font-medium">
                                                                {Math.floor((route.total_duration_minutes || 180) / 60)}h {(route.total_duration_minutes || 180) % 60}m
                                                            </div>
                                                            <div className="text-xs text-gray-500">Duration</div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                                <FiPackage className="text-xs" />
                                                            </div>
                                                            <div className="font-medium">{route.available_capacity_kg || "15"} kg</div>
                                                            <div className="text-xs text-gray-500">Capacity</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <button className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2">
                                                        <FiPackage className="text-sm" />
                                                        Book Now
                                                    </button>
                                                    <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                                                        <FiMessageCircle className="text-sm" />
                                                        Chat
                                                    </button>
                                                    <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="h-20" />
        </div>
    );
}