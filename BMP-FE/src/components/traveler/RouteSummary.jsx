const Row = ({ label, value }) => (
  <>
    <span className="text-gray-500">{label}</span>
    <span className="text-right font-medium">{value || "Not set"}</span>
  </>
);

export default function RouteSummary({ step1Data, step2Data, parcelCount }) {
  // Get the vehicle display: for plane, show "Plane" instead of the mapped vehicle_type
  const getVehicleDisplay = () => {
    const transitType = step2Data.transitDetails?.type || step2Data.transit_details?.type;
    if (transitType === "plane") return "Plane";
    if (transitType === "bus") return "Bus";
    if (transitType === "train") return "Train";
    return step2Data.vehicleType || null;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <p className="font-bold mb-3"> Route Summary</p>
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <Row label="Route:" value={step1Data.originCity && step1Data.destinationCity
          ? `${step1Data.originCity} → ${step1Data.destinationCity}` : null} />
        <Row label="Departure:" value={step1Data.departureDate} />
        <Row label="Vehicle:" value={getVehicleDisplay()} />
        <Row label="Max Weight:" value={step2Data.maxWeightKg ? `${step2Data.maxWeightKg} kg` : null} />
        <Row label="Parcel Types:" value={`${parcelCount} types`} />
      </div>
    </div>
  );
}
