import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RoutePath from "../../../core/constants/routes.constant";
import { APPLICATION_CONSTANTS } from "../../../core/constants/app.constant";
import ApiService from "../../../core/services/api.service";
import { validateMinEarning } from "../../../core/utils/validation";
import ParcelTypeSelector from "../../../components/traveler/ParcelTypeSelector";
import RouteSummary from "../../../components/traveler/RouteSummary";
import StorageService from "../../../core/services/storage.service";

const DAY_MAP = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

const buildPayload = (step1, step2, formData) => {
  const payload = {
    origin: {
      address: step1.originAddress || "",
      city: step1.originCity || "",
      state: step1.originState || "",
      pincode: step1.originPincode || "",
      country: step1.originCountry || "India",
      place_id: step1.originPlaceId || null,
    },
    destination: {
      address: step1.destinationAddress || "",
      city: step1.destinationCity || "",
      state: step1.destinationState || "",
      pincode: step1.destinationPincode || "",
      country: step1.destinationCountry || "India",
      place_id: step1.destinationPlaceId || null,
    },
    departure_time: step1.departureTime || "",
    arrival_date: step1.arrivalDate || null,
    arrival_time: step1.arrivalTime || null,
    is_recurring: step1.isRecurring || false,
    vehicle_type: step2.transportMode === "private" ? (step2.vehicleType || "bike") : step2.transportMode,
    max_weight_kg: Number(step2.maxWeightKg) || 0,
    accepted_parcel_types: formData.acceptedParcelTypes,
    min_earning_per_delivery: formData.minEarningPerDelivery ? Number(formData.minEarningPerDelivery) : undefined,
  };

  if (payload.is_recurring) {
    payload.recurring_days = (step1.recurringDays || []).map((d) => DAY_MAP[d]);
    payload.recurring_start_date = step1.recurringStartDate || "";
    if (step1.recurringEndDate) payload.recurring_end_date = step1.recurringEndDate;
  } else {
    payload.departure_date = step1.departureDate || "";
  }

  if (step2.vehicleNumber) payload.vehicle_number = step2.vehicleNumber;

  if (step2.transportMode === "bus") {
    payload.transit_details = { type: "bus", service_name: step2.busServiceName, bus_number: step2.busNumber };
  }
  if (step2.transportMode === "train") {
    payload.transit_details = {
      type: "train",
      train_number: step2.trainNumber,
      train_name: step2.trainName,
      class_type: step2.classType,
      has_reservation: step2.hasReservation,
      pnr_number: step2.hasReservation ? step2.pnrNumber : null,
      seat_numbers: step2.hasReservation ? step2.seatNumbers : null,
    };
  }

  return payload;
};

export default function TravelRoute3() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [step1Data, setStep1Data] = useState({});
  const [step2Data, setStep2Data] = useState({});
  const [formData, setFormData] = useState({
    acceptedParcelTypes: ["documents", "electronics", "clothing"],
    minEarningPerDelivery: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const s1 = StorageService.getData(APPLICATION_CONSTANTS.STORAGE.ROUTE_STEP_1);
      const s2 = StorageService.getData(APPLICATION_CONSTANTS.STORAGE.ROUTE_STEP_2);
      setStep1Data(s1 || {});
      setStep2Data(s2 || {});
    } catch { /* ignore parse errors */ }
    finally { setPageLoading(false); }
  }, []);

  const toggleParcel = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      acceptedParcelTypes: prev.acceptedParcelTypes.includes(value)
        ? prev.acceptedParcelTypes.filter((i) => i !== value)
        : [...prev.acceptedParcelTypes, value],
    }));
    setErrors((prev) => ({ ...prev, acceptedParcelTypes: "" }));
  }, []);

  const handleSaveRoute = async () => {
    const e = {};
    if (formData.acceptedParcelTypes.length === 0) e.acceptedParcelTypes = "Please select at least one parcel type";
    if (formData.minEarningPerDelivery) {
      const err = validateMinEarning(formData.minEarningPerDelivery);
      if (err) e.minEarningPerDelivery = err;
    }
    if (Object.keys(e).length > 0) { setErrors(e); toast.error("Please complete all required fields"); return; }

    const payload = buildPayload(step1Data, step2Data, formData);

    if (!payload.origin.city || !payload.destination.city) {
      toast.error("Please complete all steps - origin and destination are required"); return;
    }
    if (!payload.origin.pincode || payload.origin.pincode.length !== 6) {
      toast.error("Origin pincode must be 6 digits."); return;
    }
    if (!payload.destination.pincode || payload.destination.pincode.length !== 6) {
      toast.error("Destination pincode must be 6 digits."); return;
    }
    if (!payload.is_recurring && payload.arrival_date && payload.arrival_time) {
      const dep = new Date(`${payload.departure_date}T${payload.departure_time}`);
      const arr = new Date(`${payload.arrival_date}T${payload.arrival_time}`);
      if (arr <= dep) { toast.error("Arrival time must be after departure time"); return; }
    }

    try {
      setLoading(true);
      const response = await ApiService.createRoute(payload);
      if (response.data.success) {
        toast.success("Route created successfully!");
        StorageService.removeData(APPLICATION_CONSTANTS.STORAGE.ROUTE_STEP_1);
        StorageService.removeData(APPLICATION_CONSTANTS.STORAGE.ROUTE_STEP_2);
        navigate(RoutePath.TRAVELER_DASHBOARD);
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const msg = Array.isArray(apiErrors)
          ? apiErrors.map((e) => (typeof e === "string" ? e : e.message || JSON.stringify(e))).join(", ")
          : String(apiErrors);
        toast.error(msg);
      } else {
        toast.error(err.response?.data?.message || "Failed to create route");
      }
    } finally {
      setLoading(false);
    }
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
                ${s === 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
              {i < 2 && <div className="w-16 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {pageLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg text-sm text-gray-500">
            Loading route details...
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 shadow-lg">
              <p className="font-bold mb-4"> Parcel Preferences</p>

              <ParcelTypeSelector
                selected={formData.acceptedParcelTypes}
                onToggle={toggleParcel}
                error={errors.acceptedParcelTypes}
              />

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs text-gray-500">Minimum Earning Per Delivery (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.minEarningPerDelivery}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, minEarningPerDelivery: e.target.value }));
                    setErrors((prev) => ({ ...prev, minEarningPerDelivery: "" }));
                  }}
                  onWheel={(e) => e.target.blur()}
                  className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white
                    ${errors.minEarningPerDelivery ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.minEarningPerDelivery && <p className="text-xs text-red-600">{errors.minEarningPerDelivery}</p>}
              </div>

              <RouteSummary
                step1Data={step1Data}
                step2Data={step2Data}
                parcelCount={formData.acceptedParcelTypes.length}
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate(RoutePath.TRAVELLER_ROUTE2)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={handleSaveRoute}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                {loading ? "Saving..." : "Save Route →"}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="h-20" />
    </div>
  );
}
