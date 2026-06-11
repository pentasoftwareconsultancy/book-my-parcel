import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Bike, Car, Truck, Bus, Train, Plane } from "lucide-react";
import Button from "../../../core/common/Button";
import Confetti from "../../../components/common/Confetti";
import AcceptanceRouteMap from "../../../components/map/AcceptanceRouteMap";
import TravellerCard from "../../../components/user/TravellerCard";
import { useStepPartner } from "../../../core/hooks/useStepPartner";

const VEHICLE_OPTIONS = [
  { type: "bike",  label: "Bike",       icon: <Bike size={16} /> },
  { type: "car",   label: "Car",        icon: <Car size={16} /> },
  { type: "suv",   label: "SUV",        icon: <Truck size={16} /> },
  { type: "van",   label: "Van",        icon: <Truck size={16} /> },
  { type: "truck", label: "Truck",      icon: <Truck size={16} /> },
  { type: "tempo", label: "Tempo",      icon: <Truck size={16} /> },
  { type: "bus",   label: "Bus",        icon: <Bus size={16} /> },
  { type: "train", label: "Train",      icon: <Train size={16} /> },
  { type: "plane", label: "Plane",      icon: <Plane size={16} /> },
];

const StepPartner = ({ data, updateFields, onNext, onBack, parcelId }) => {
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    selectedId, travellers, loading, parcelData,
    sortBy, setSortBy,
    selectedRouteId, highlightedRouteId, newlyAcceptedIds,
    fetchTravellers, handleSelect, handleRouteClick, handleNext,
  } = useStepPartner({ data, updateFields, onNext, parcelId });

  const filteredTravelers = selectedVehicle
    ? travellers.filter((t) => t.vehicleType === selectedVehicle)
    : travellers;

  const acceptancesForMap = filteredTravelers.map((t) => ({
    acceptance_id: t.acceptanceId,
    traveller: {
      id: t.id, email: t.email, phone: t.phone,
      travellerProfile: {
        rating: t.rating, total_deliveries: t.trips, vehicle_type: t.vehicleType,
        last_known_location: t.lat && t.lng ? { coordinates: [t.lng, t.lat] } : null,
      },
    },
    detour_km: t.detourKm, detour_percentage: t.detourPercentage,
    match_score: t.matchScore, acceptance_price: t.price,
    drive_time_minutes: t.driveTimeMinutes, accepted_at: t.acceptedAt,
  }));

  return (
    <>
      <style>{`
        @keyframes pulse-border {
          0%,100% { border-color:rgb(34,197,94); box-shadow:0 0 20px rgba(34,197,94,0.4); }
          50%      { border-color:rgb(74,222,128); box-shadow:0 0 30px rgba(34,197,94,0.6); }
        }
        @keyframes scale-in {
          0%   { transform:scale(0.95); opacity:0; }
          100% { transform:scale(1);    opacity:1; }
        }
      `}</style>

      {showConfetti && <Confetti duration={3000} onComplete={() => setShowConfetti(false)} />}

      <div className="space-y-4 sm:space-y-8">
        {/* MAP */}
        <section className="relative overflow-hidden bg-white rounded-3xl shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Step 2 of 3</p>
              <h2 className="text-base sm:text-lg font-semibold text-primary">Travellers Who Accepted</h2>
            </div>
            <p className="text-xs text-gray-500">{filteredTravelers.length} travellers accepted</p>
          </div>
          <div className="overflow-hidden h-56 sm:h-80 rounded-2xl">
            {!parcelData?.pickupLocation ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading map...</div>
            ) : (
              <AcceptanceRouteMap
                acceptances={acceptancesForMap}
                pickupLocation={parcelData.pickupLocation}
                dropLocation={parcelData.dropLocation}
                onRouteClick={handleRouteClick}
                selectedAcceptanceId={selectedRouteId}
                parcelId={parcelId}
                highlightedRouteId={highlightedRouteId}
              />
            )}
          </div>
        </section>

        {/* SELECT TRAVELLER */}
        <section className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white rounded-3xl shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl sm:text-3xl font-bold text-primary">Select Traveller</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                {filteredTravelers.length} Accepted <span className="text-green-500">•</span>
              </p>
              <button
                onClick={() => fetchTravellers(true)}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
              >
                {loading ? "Searching..." : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {/* Sort & Filter */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white shadow rounded-3xl">
            <span className="text-sm text-gray-500">Sort by:</span>
            {["detour", "rating"].map((s) => (
              <Button key={s} size="sm"
                className={`!rounded-full !px-4 ${sortBy === s ? "" : "!bg-gray-200 !text-gray-700"}`}
                onClick={() => setSortBy(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
            {parcelData?.parcelDistanceKm <= 50 && (
              <Button size="sm"
                className={`!rounded-full !px-4 ${sortBy === "nearby" ? "" : "!bg-gray-200 !text-gray-700"}`}
                onClick={() => setSortBy("nearby")}
              >
                Nearby
              </Button>
            )}

            <div className="relative">
              <Button size="sm" variant="outline"
                className="!rounded-full !px-4 flex items-center gap-2"
                onClick={() => setShowVehicleMenu((p) => !p)}
              >
                {selectedVehicle ? VEHICLE_OPTIONS.find(v => v.type === selectedVehicle)?.label || selectedVehicle : "Vehicle"} <ChevronDown size={14} />
              </Button>
              {showVehicleMenu && (
                <div className="absolute right-0 z-30 mt-2 bg-white border shadow-lg w-44 rounded-xl">
                  {VEHICLE_OPTIONS.map((v) => (
                    <button key={v.type} type="button"
                      onClick={() => { setSelectedVehicle(v.type); setShowVehicleMenu(false); }}
                      className="flex items-center w-full gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <span className="text-primary">{v.icon}</span>
                      <span>{v.label}</span>
                    </button>
                  ))}
                  <button onClick={() => { setSelectedVehicle(null); setShowVehicleMenu(false); }}
                    className="w-full px-4 py-2 text-xs text-gray-500 hover:bg-gray-50"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                Loading travellers who accepted your request...
              </div>
            ) : filteredTravelers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-gray-500">No travellers have accepted your request yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {parcelId ? "Please wait for travellers to accept your parcel request" : "Please complete step 1 first"}
                  </p>
                  <button onClick={() => fetchTravellers(true)}
                    className="mt-3 px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              filteredTravelers.map((t) => (
                <TravellerCard
                  key={t.id}
                  t={t}
                  active={selectedId === t.id}
                  isNewlyAccepted={newlyAcceptedIds.has(t.acceptanceId)}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button type="button" variant="outline" size="lg" fullWidth onClick={onBack}
              className="flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} /> View Parcel Details
            </Button>
            <Button type="button" size="lg" fullWidth onClick={handleNext}
              disabled={!selectedId || loading}
              className="flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Selecting Traveller..." : "Next: Review & Confirm"} <ChevronRight size={16} />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default StepPartner;
