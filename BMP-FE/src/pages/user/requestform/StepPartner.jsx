import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "../../../core/common/Button";
import Confetti from "../../../components/common/Confetti";
import AcceptanceRouteMap from "../../../components/map/AcceptanceRouteMap";
import TravellerCard from "../../../components/user/TravellerCard";
import TravellerSelectionErrorModal from "../../../components/modals/TravellerSelectionErrorModal";
import { useStepPartner } from "../../../core/hooks/useStepPartner";

const StepPartner = ({ data, updateFields, onNext, onBack, parcelId }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // ✅ ERROR MODAL STATE
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
  });

  const {
    selectedId,
    travellers,
    loading,
    parcelData,
    sortBy,
    setSortBy,
    selectedRouteId,
    highlightedRouteId,
    newlyAcceptedIds,
    fetchTravellers,
    handleSelect,
    handleRouteClick,
    handleNext,
    selectionError,
    clearSelectionError,
  } = useStepPartner({ data, updateFields, onNext, parcelId });

  // ✅ ERROR → MODAL BRIDGE
  useEffect(() => {
    if (selectionError) {
      setErrorModal({
        open: true,
        message: selectionError,
      });

      clearSelectionError();
    }
  }, [selectionError]);

  const acceptancesForMap = travellers.map((t) => ({
    acceptance_id: t.acceptanceId,
    traveller: {
      id: t.id,
      email: t.email,
      phone: t.phone,
      travellerProfile: {
        rating: t.rating,
        total_deliveries: t.trips,
        vehicle_type: t.vehicleType,
        last_known_location:
          t.lat && t.lng ? { coordinates: [t.lng, t.lat] } : null,
      },
    },
    detour_km: t.detourKm,
    detour_percentage: t.detourPercentage,
    match_score: t.matchScore,
    acceptance_price: t.price,
    drive_time_minutes: t.driveTimeMinutes,
    accepted_at: t.acceptedAt,
  }));

  return (
    <>
      <style>{`
        @keyframes pulse-border {
          0%,100% { border-color:rgb(34,197,94); box-shadow:0 0 20px rgba(34,197,94,0.4); }
          50% { border-color:rgb(74,222,128); box-shadow:0 0 30px rgba(34,197,94,0.6); }
        }
      `}</style>

      {showConfetti && (
        <Confetti duration={3000} onComplete={() => setShowConfetti(false)} />
      )}

      <div className="space-y-4 sm:space-y-8">

        {/* MAP */}
        <section className="relative bg-white rounded-3xl shadow-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Travellers Who Accepted</h2>
          </div>

          <div className="h-56 sm:h-80 overflow-hidden">
            {!parcelData?.pickupLocation ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading map...
              </div>
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
        <section className="p-4 sm:p-6 bg-white rounded-3xl shadow-card">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Select Traveller</h2>
            <button
              onClick={() => fetchTravellers(true)}
              className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-lg"
            >
              {loading ? "Searching..." : "Refresh"}
            </button>
          </div>

          {/* VEHICLE FILTER */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["detour", "rating"].map((s) => (
              <Button key={s} size="sm" onClick={() => setSortBy(s)}>
                {s}
              </Button>
            ))}
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {loading ? (
              <p>Loading...</p>
            ) : travellers.length === 0 ? (
              <p>No travellers found</p>
            ) : (
              travellers.map((t) => (
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

          {/* NAV */}
          <div className="flex gap-3 mt-6">
            <Button onClick={onBack} variant="outline" fullWidth>
              <ChevronLeft size={16} /> Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedId || loading}
              fullWidth
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </section>
      </div>

      {/* ✅ ERROR MODAL (FIXED PROPERLY) */}
      <TravellerSelectionErrorModal
        open={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: "" })}
        onAction={() => fetchTravellers(true)}
        actionLabel="Find Another Traveller"
      />
    </>
  );
};

export default StepPartner;