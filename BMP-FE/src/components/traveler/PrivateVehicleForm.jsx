import { vehicleNumberTypingPattern } from "../../core/utils/validation";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const VEHICLES = [
  { label: "Bike",  value: "bike",  icon: <DirectionsBikeIcon />,  suggestedWeight: 5 },
  { label: "Car",   value: "car",   icon: <DirectionsCarIcon />,   suggestedWeight: 20 },
  { label: "SUV",   value: "suv",   icon: <AirportShuttleIcon />,  suggestedWeight: 50 },
  { label: "Van",   value: "van",   icon: <LocalShippingIcon />,   suggestedWeight: 100 },
  { label: "Truck", value: "truck", icon: <LocalShippingIcon />,   suggestedWeight: 200 },
  { label: "Tempo", value: "tempo", icon: <DirectionsBusIcon />,   suggestedWeight: 300 },
];

export default function PrivateVehicleForm({ formData, errors, onChange }) {
  return (
    <>
      <p className="text-sm text-gray-500 font-semibold mb-3">Select Vehicle Type</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
        {VEHICLES.map((v) => {
          const selected = formData.vehicleType === v.value;
          return (
            <button
              key={v.value}
              type="button"
              onClick={() => { onChange("vehicleType", v.value); onChange("maxWeightKg", String(v.suggestedWeight)); }}
              className={`border rounded-xl p-3 text-center cursor-pointer transition-all
                ${selected ? "border-blue-600 bg-indigo-50" : "border-gray-200 bg-white hover:border-blue-300"}`}
            >
              <div className={`text-3xl mb-1 flex justify-center ${selected ? "text-blue-600" : "text-slate-500"}`}>{v.icon}</div>
              <p className="font-semibold text-sm">{v.label}</p>
              <p className="text-xs text-gray-400">Suggested: {v.suggestedWeight} kg</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Vehicle Number (Optional)</label>
          <input
            className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white
              ${errors.vehicleNumber ? "border-red-500" : "border-gray-300"}`}
            placeholder="e.g. MH-02-AX-1234"
            value={formData.vehicleNumber}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              if (vehicleNumberTypingPattern.test(val)) onChange("vehicleNumber", val);
            }}
          />
          {errors.vehicleNumber && <p className="text-xs text-red-600">{errors.vehicleNumber}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Max Weight (kg) *</label>
          <input
            type="number"
            className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white
              ${errors.maxWeightKg ? "border-red-500" : "border-gray-300"}`}
            placeholder="e.g. 20"
            value={formData.maxWeightKg}
            onChange={(e) => onChange("maxWeightKg", e.target.value)}
            onWheel={(e) => e.target.blur()}
          />
          {errors.maxWeightKg
            ? <p className="text-xs text-red-600">{errors.maxWeightKg}</p>
            : <p className="text-xs text-gray-400">Auto-filled based on vehicle, but you can adjust</p>}
        </div>
      </div>
    </>
  );
}
