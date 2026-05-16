import React, { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { MdLocationOn, MdFlag } from "react-icons/md";
import RoutePath from "../../../core/constants/routes.constant";
import { APPLICATION_CONSTANTS } from "../../../core/constants/app.constant";
import { travelRouteSchema } from "../../../core/utils/validation";
import AddressCard from "../../../components/traveler/AddressCard";
import ScheduleCard from "../../../components/traveler/ScheduleCard";
import StorageService from "../../../core/services/storage.service";

// FIX: getDefaultValues is now a function called at render time (inside the
// component), not at module evaluation time. This ensures the date/time
// defaults are always fresh when the form mounts, not stale from a cached
// module load.
function buildDefaultValues() {
  const now = new Date();
  return {
    origin:             {},
    destination:        {},
    isRecurring:        false,
    recurringDays:      [],
    departureDate:      now.toLocaleDateString("en-CA"),
    departureTime:      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    arrivalDate:        now.toLocaleDateString("en-CA"),
  };
}

export default function TravelRoute() {
  const navigate = useNavigate();

  // FIX: submittingRef prevents double-submit on rapid button clicks.
  // Using a ref (not state) avoids an extra re-render.
  const submittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver:      yupResolver(travelRouteSchema),
    defaultValues: buildDefaultValues(),
  });

  const onPlaceSelected = useCallback(
    (field, place) => {
      // Only set known, expected keys to avoid polluting the form with
      // unexpected properties from the place object
      const allowedKeys = [
        "address", "city", "state", "pincode", "country", "place_id",
        "latitude", "longitude", "locality",
      ];
      allowedKeys.forEach((key) => {
        if (place[key] !== undefined) {
          setValue(`${field}.${key}`, place[key]);
        }
      });
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (data) => {
      // Guard against double-submit
      if (submittingRef.current) return;
      submittingRef.current = true;

      if (!data.origin?.address || !data.destination?.address) {
        toast.error("Please select both origin and destination");
        submittingRef.current = false;
        return;
      }

      const step1Data = {
        originAddress:      data.origin.address,
        originCity:         data.origin.city,
        originState:        data.origin.state,
        originPincode:      data.origin.pincode,
        originCountry:      data.origin.country || "India",
        originPlaceId:      data.origin.place_id || null,
        destinationAddress: data.destination.address,
        destinationCity:    data.destination.city,
        destinationState:   data.destination.state,
        destinationPincode: data.destination.pincode,
        destinationCountry: data.destination.country || "India",
        destinationPlaceId: data.destination.place_id || null,
        departureDate:      data.departureDate || null,
        departureTime:      data.departureTime,
        arrivalDate:        data.arrivalDate,
        arrivalTime:        data.arrivalTime,
        isRecurring:        data.isRecurring || false,
        recurringDays:      data.recurringDays || [],
        recurringStartDate: data.recurringStartDate || null,
        recurringEndDate:   data.recurringEndDate || null,
        // FIX: Store a timestamp so stale wizard data can be detected and
        // cleared if the user returns after more than 24 hours.
        _savedAt:           Date.now(),
      };

      try {
        StorageService.setData(APPLICATION_CONSTANTS.STORAGE.ROUTE_STEP_1, step1Data);
        toast.success("Step 1 completed! Moving to vehicle details...");
        // FIX: Navigate immediately — no setTimeout needed. The toast renders
        // independently of navigation. The previous 300ms delay caused a
        // navigate() call on an unmounted component if the user clicked back.
        navigate(RoutePath.TRAVELLER_ROUTE2);
      } catch {
        toast.error("Failed to save route details. Please try again.");
        submittingRef.current = false;
      }
    },
    [navigate]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="h-18" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">Add Your Travel Route</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Set up your route and start earning by delivering parcels along the way
        </p>

        {/* Stepper — step 1 is active */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${s === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {s}
              </div>
              {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 max-w-16" />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AddressCard
            fieldName="origin"
            label="Origin (Start Location)"
            icon={<MdLocationOn className="text-green-600" size={20} />}
            control={control}
            errors={errors}
            onPlaceSelected={(place) => onPlaceSelected("origin", place)}
          />
          <AddressCard
            fieldName="destination"
            label="Destination (Final Location)"
            icon={<MdFlag className="text-red-600" size={20} />}
            control={control}
            errors={errors}
            onPlaceSelected={(place) => onPlaceSelected("destination", place)}
          />
          <ScheduleCard
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(RoutePath.TRAVELER_DASHBOARD)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Next →
            </button>
          </div>
        </form>
      </div>
      <div className="h-20" />
    </div>
  );
}
