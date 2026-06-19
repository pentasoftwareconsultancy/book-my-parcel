
import { useState } from "react";
import {  FiMapPin,FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ServerUrl from "../../core/constants/serverUrl.constant";
import ApiService from "../../core/services/api.service";
import RoutePath from "../../core/constants/routes.constant";
import SearchSection from  "./SearchSection"


import SearchTravellerInfo from "./requestform/SearchTravellerInfo";

export default function TravellerSearchPage() {
    const navigate = useNavigate();
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedVehicleType, setSelectedVehicleType] = useState("All");

    const normalizeVehicleType = (value) => {
        if (!value) return "";
        return value
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[_-]/g, " ")
            .split(" ")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const matchesSelectedVehicle = (vehicleType, selectedType) => {
        if (!selectedType || selectedType === "All") return true;
        const normalized = vehicleType?.toString().toLowerCase() || "";
        const selected = selectedType.toString().toLowerCase();

        if (selected === "Bike") return /bike|bicycle|motorcycle/.test(normalized);
        if (selected === "Car") return /\bcar\b|sedan|hatchback|coupe/.test(normalized);
        if (selected === "Suv") return normalized.includes("suv");
        if (selected === "Van") return normalized.includes("van");
        if (selected === "Tempo") return normalized.includes("Tempo");
        if (selected === "Truck") return normalized.includes("truck") || normalized.includes("tempo") || normalized.includes("lorry");

        return normalized.includes(selected);
    };

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

    const filteredRoutes = routes
        .filter((route) => {
            const vehicleType = route.vehicle_type || route.travellerProfile?.vehicle_type || "";
            return matchesSelectedVehicle(vehicleType, selectedVehicleType);
        })
        .sort((a, b) => {
            const aType = normalizeVehicleType(a.vehicle_type || a.travellerProfile?.vehicle_type || "");
            const bType = normalizeVehicleType(b.vehicle_type || b.travellerProfile?.vehicle_type || "");
            return aType.localeCompare(bType);
        });

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="h-18" />
            <div className="max-w-5xl mx-auto px-4 py-8">
<header className="relative overflow-hidden  px-6 sm:px-8 py-6 text-white mb-8">
  {/* Gradient Background */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(180deg, #1F2AFF 0%, #5C9DF2 139.02%)",
    }}
  />

  {/* Pattern Background Image */}
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: "url('/whychooseus-bg.png')",
      backgroundSize: "1150px",
      backgroundRepeat: "repeat",
      opacity: 1,
      mixBlendMode: "invert",
      zIndex: 1,
    }}
  />

  {/* Header Content */}
  <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
        <FiSearch size={24} />
        Find Travellers
      </h1>

      <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/90">
        Search for verified travellers heading to your destination and find
        the best match for safe, reliable, and timely parcel delivery.
      </p>
    </div>

    <button
      onClick={() => navigate(RoutePath.PUBLIC_HOME)}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
        bg-white text-blue-700 font-semibold shadow-md
        hover:bg-gray-100 transition-all duration-300"
    >
      <span>←</span>
      Back to Home
    </button>
  </div>
</header>

                {/* Search Form */}
                <SearchSection
  origin={origin}
  setOrigin={setOrigin}
  destination={destination}
  setDestination={setDestination}
  handleSearch={handleSearch}
  loading={loading}
  error={error}
  selectedVehicleType={selectedVehicleType}
  onVehicleTypeChange={setSelectedVehicleType}
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
                                    Available Travellers ({filteredRoutes.length})
                                </h3>
                                <div className="text-sm text-gray-500">
                                    {selectedVehicleType && selectedVehicleType !== "All"
                                        ? `Filtered by ${selectedVehicleType}`
                                        : "Sorted by vehicle type"}
                                </div>
                            </div>

                            {filteredRoutes.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 border border-yellow-200 shadow-sm text-sm text-yellow-800">
                                    No travellers match the selected vehicle type. Try selecting All Vehicles or a different vehicle.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRoutes.map((route) => {
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
                                            <div key={route.id}>
                                                {/* Traveller Info */}
                                                <SearchTravellerInfo
                                                    travellerName={travellerName}
                                                    rating={rating}
                                                    completedTrips={completedTrips}
                                                    transportMode={transportMode}
                                                    vehicleType={vehicleType}
                                                    cardOrigin={cardOrigin}
                                                    cardDestination={cardDestination}
                                                    weight={weight}
                                                    transitInfo={transitInfo}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="h-20" />
        </div>
    );
}