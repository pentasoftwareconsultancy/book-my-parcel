import React, { useCallback, useRef, useState } from "react";
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
import RouteAlternativesMap from "../../../components/traveler/RouteAlternativesMap";
import StorageService from "../../../core/services/storage.service";
import ApiService from "../../../core/services/api.service";

function buildDefaultValues() {
  const now = new Date();
  const arrivalHour = (now.getHours() + 1) % 24;
  return {
    origin:             {},
    destination:        {},
    isRecurring:        false,
    recurringDays:      [],
    departureDate:      now.toLocaleDateString("en-CA"),
    departureTime:      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    arrivalDate:        now.toLocaleDateString("en-CA"),
    arrivalTime:        `${String(arrivalHour).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  };
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function TravelRoute() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);

  const [alternatives, setAlternatives]       = useState(null);   // null = not fetched yet
  const [loadingAlt, setLoadingAlt]           = useState(false);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [pendingStep1, setPendingStep1]        = useState(null);   // holds form data while user picks route

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
      const allowedKeys = [
        "address", "city", "state", "pincode", "country", "place_id",
        "latitude", "longitude", "locality",
      ];
      allowedKeys.forEach((key) => {
        if (place[key] !== undefined) setValue(`${field}.${key}`, place[key]);
      });
      // Reset route alternatives whenever the user changes an address
      setAlternatives(null);
      setPendingStep1(null);
    },
    [setValue]
  );

  // Step 1 form submit → fetch alternatives before moving to Step 2
  const onSubmit = useCallback(
    async (data) => {
      if (submittingRef.current) return;
      if (!data.origin?.address || !data.destination?.address) {
        toast.error("Please select both origin and destination");
        return;
      }

      const step1Data = {
        originAddress:      data.origin.address,
        originCity:         data.origin.city,
        originState:        data.origin.state,
        originPincode:      data.origin.pincode,
        originCountry:      data.origin.country || "India",
        originPlaceId:      data.origin.place_id || null,
        originLatitude:     data.origin.latitude  || null,
        originLongitude:    data.origin.longitude || null,
        destinationAddress: data.destination.address,
        destinationCity:    data.destination.city,
        destinationState:   data.destination.state,
        destinationPincode: data.destination.pincode,
        destinationCountry: data.destination.country || "India",
        destinationPlaceId: data.destination.place_id || null,
        destinationLatitude:  data.destination.latitude  || null,
        destinationLongitude: data.destination.longitude || null,
        departureDate:      data.departureDate || null,
        departureTime:      data.departureTime,
        arrivalDate:        data.arrivalDate,
        arrivalTime:        data.arrivalTime,
        isRecurring:        data.isRecurring || false,
        recurringDays:      data.recurringDays || [],
        recurringStartDate: data.recurringStartDate || null,
        recurringEndDate:   data.recurringEndDate || null,
        _savedAt:           Date.now(),
      };

      // If we already fetched alternatives and the user clicked Next again
      // (after selecting a route), proceed directly.
      if (alternatives !== null) {
        saveAndProceed(step1Data);
        return;
      }

      // Fetch alternatives only when both addresses have coordinates
      if (data.origin.latitude && data.destination.latitude) {
        submittingRef.current = true;
        setLoadingAlt(true);
        setPendingStep1(step1Data);
        try {
          const res = await ApiService.previewRouteAlternatives(
            { address: data.origin.address, city: data.origin.city, latitude: data.origin.latitude, longitude: data.origin.longitude },
            { address: data.destination.address, city: data.destination.city, latitude: data.destination.latitude, longitude: data.destination.longitude }
          );
          const alts = res?.data?.data;
          if (Array.isArray(alts) && alts.length > 0) {
            setAlternatives(alts);
            setSelectedRouteIdx(0);
          } else {
            // No alternatives returned — proceed without route selection
            saveAndProceed(step1Data);
          }
        } catch {
          // If preview fails, skip selection and continue
          toast.info("Could not load route alternatives — using default route");
          saveAndProceed(step1Data);
        } finally {
          setLoadingAlt(false);
          submittingRef.current = false;
        }
      } else {
        // No coordinates — skip alternatives
        saveAndProceed(step1Data);
      }
    },
    [alternatives, navigate]
  );

  const saveAndProceed = useCallback(
    (step1Data, selectedAlt = null) => {
      const dataToSave = {
        ...step1Data,
        selectedPolyline:    selectedAlt?.encodedPolyline || null,
        selectedDistanceKm:  selectedAlt?.distanceKm      || null,
        selectedDurationMin: selectedAlt?.durationMinutes || null,
        selectedRouteDesc:   selectedAlt?.description     || null,
      };
      try {
        StorageService.setData(APPLICATION_CONSTANTS.STORAGE.ROUTE_STEP_1, dataToSave);
        navigate(RoutePath.TRAVELLER_ROUTE2);
      } catch {
        toast.error("Failed to save route details. Please try again.");
      }
    },
    [navigate]
  );

  const handleConfirmRoute = useCallback(() => {
    const selected = alternatives?.[selectedRouteIdx] || null;
    saveAndProceed(pendingStep1, selected);
  }, [alternatives, selectedRouteIdx, pendingStep1, saveAndProceed]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="h-18" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">Add Your Travel Route</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Set up your route and start earning by delivering parcels along the way
        </p>

        {/* Stepper */}
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

          {/* ── Route alternatives panel (shown after fetch) ──────────────── */}
          {alternatives !== null && (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-4">
              <p className="font-semibold text-sm text-gray-700 mb-3">
                Choose your preferred route
              </p>

              {/* Map — click a coloured line to select that route */}
              <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
                <RouteAlternativesMap
                  alternatives={alternatives}
                  selectedIdx={selectedRouteIdx}
                  onSelect={setSelectedRouteIdx}
                  origin={pendingStep1}
                  destination={{
                    latitude:  pendingStep1?.destinationLatitude,
                    longitude: pendingStep1?.destinationLongitude,
                  }}
                />
              </div>

              {/* Route cards — click to select (mirrors clicking the map line) */}
              <div className="space-y-3">
                {alternatives.map((alt, idx) => {
                  const DOT_COLORS = ["bg-blue-500", "bg-amber-500", "bg-emerald-500"];
                  const BORDER_COLORS = ["border-blue-500 bg-blue-50", "border-amber-400 bg-amber-50", "border-emerald-500 bg-emerald-50"];
                  const isSelected = selectedRouteIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedRouteIdx(idx)}
                      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all
                        ${isSelected ? BORDER_COLORS[idx % BORDER_COLORS.length] : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Colour swatch matching the map line */}
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${DOT_COLORS[idx % DOT_COLORS.length]}`} />
                          <div>
                            <p className="font-medium text-sm text-gray-800">
                              {alt.description}
                              {idx === 0 && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {alt.distanceKm} km &nbsp;·&nbsp; {formatDuration(alt.durationMinutes)}
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                          ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(RoutePath.TRAVELER_DASHBOARD)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Dashboard
            </button>

            {alternatives !== null ? (
              <button
                type="button"
                onClick={handleConfirmRoute}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                Confirm Route →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || loadingAlt}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                {loadingAlt ? "Loading routes…" : "Next →"}
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="h-20" />
    </div>
  );
}
