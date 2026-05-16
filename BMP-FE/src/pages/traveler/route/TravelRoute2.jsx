import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoCarOutline } from "react-icons/io5";
import { IoCarSport } from "react-icons/io5";
import { FaBus, FaTrainSubway } from "react-icons/fa6";
import RoutePath from "../../../core/constants/routes.constant";
import { APPLICATION_CONSTANTS } from "../../../core/constants/app.constant";
import { validateRequired, validateVehicleNumber, validateWeight } from "../../../core/utils/validation";
import PrivateVehicleForm from "../../../components/traveler/PrivateVehicleForm";
import PublicTransportForm from "../../../components/traveler/PublicTransportForm";

const TRANSPORT_MODES = [
  { value: "private", label: "Private Vehicle", icon: <IoCarSport /> },
  { value: "bus",     label: "Bus",             icon: <FaBus /> },
  { value: "train",   label: "Train",           icon: <FaTrainSubway /> },
];

const INITIAL_STATE = {
  vehicleType: "bike",
  vehicleNumber: "",
  maxWeightKg: "",
  transportMode: "private",
  busServiceName: "",
  busNumber: "",
  trainNumber: "",
  trainName: "",
  classType: "",
  hasReservation: false,
  pnrNumber: "",
  seatNumbers: "",
};

export default function TravelRoute2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validate = () => {
    const e = {};
    if (formData.transportMode === "private") {
      const err = validateRequired(formData.vehicleType, "Vehicle type");
      if (err) e.vehicleType = err;
      if (formData.vehicleNumber) {
        const err2 = validateVehicleNumber(formData.vehicleNumber);
        if (err2) e.vehicleNumber = err2;
      }
    }
    if (formData.transportMode === "bus") {
      if (!formData.busServiceName) e.busServiceName = "Bus service name is required";
    }
    if (formData.transportMode === "train") {
      if (!formData.trainNumber) e.trainNumber = "Train number is required";
      else if (!/^\d{5}$/.test(formData.trainNumber)) e.trainNumber = "Train number must be 5 digits";
      if (!formData.trainName) e.trainName = "Train name is required";
      if (!formData.classType) e.classType = "Class type is required";
      if (formData.hasReservation) {
        if (!formData.pnrNumber) e.pnrNumber = "PNR number is required";
        else if (!/^\d{10}$/.test(formData.pnrNumber)) e.pnrNumber = "PNR must be 10 digits";
        if (!formData.seatNumbers) e.seatNumbers = "Please enter seat numbers";
      }
    }
    const weightErr = validateWeight(formData.maxWeightKg, "Max weight");
    if (weightErr) e.maxWeightKg = weightErr;
    else if (formData.transportMode !== "private" && Number(formData.maxWeightKg) > 5)
      e.maxWeightKg = "Maximum weight for public transport is 5 kg";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) { toast.error("Please complete all required fields"); return; }
    localStorage.setItem(APPLICATION_CONSTANTS.STORAGE.ROUTE_STEP_2, JSON.stringify(formData));
    navigate(RoutePath.TRAVELLER_ROUTE3);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="h-18" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">Add Your Travel Route</h1>
        <p className="text-gray-500 mb-6 text-sm">Set up your route and start earning by delivering parcels along the way</p>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${s === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
              {i < 2 && <div className="w-16 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 shadow-lg">
          <div className="flex items-center gap-2 mb-4 font-bold">
            <IoCarOutline size={20} className="text-gray-500" />
            <span>Vehicle & Capacity</span>
          </div>

          {/* Transport Mode */}
          <p className="text-sm text-gray-500 font-semibold mb-2">Transport Mode *</p>
          <div className="flex gap-3 mb-6 flex-wrap">
            {TRANSPORT_MODES.map((mode) => {
              const selected = formData.transportMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => handleChange("transportMode", mode.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors
                    ${selected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}
                >
                  {mode.icon} {mode.label}
                </button>
              );
            })}
          </div>

          {formData.transportMode === "private"
            ? <PrivateVehicleForm formData={formData} errors={errors} onChange={handleChange} />
            : <PublicTransportForm formData={formData} errors={errors} onChange={handleChange} />}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate(RoutePath.TRAVELLER_ROUTE)}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
