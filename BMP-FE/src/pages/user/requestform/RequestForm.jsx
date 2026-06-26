// src/pages/user/requestform/RequestForm.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Package } from "lucide-react";
import StepPickup from "./StepPickup";
import StepPartner from "./StepPartner";
import StepReview from "./StepReview";
import OrderSummary from "./OrderSummary";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import { showToast } from "../../../core/utils/toast.util";
import UserBookingConfirmationModal from "../UserBookingConfirmation";

const steps = [
  "Pickup & Package Details",
  "Select Traveler",
  "Review & Confirm",
];

const RequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setPopupParcelId(location.state.parcelId);
      setShowConfirmation(true);
    }
  }, [location.state]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Check URL params first, then location state
  const urlParcelId = searchParams.get('parcelId');
  const urlStep = searchParams.get('step');

  // Check if we're continuing from dashboard with existing parcel
  const { parcelId: existingParcelId, step: initialStep } = location.state || {};

  const [createdParcelId, setCreatedParcelId] = useState(urlParcelId || existingParcelId || null);
  const [bookingId, setBookingId] = useState(null);
  const [step, setStep] = useState(parseInt(urlStep) || initialStep || 1);
  const [existingParcelData, setExistingParcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [popupParcelId, setPopupParcelId] = useState(null);

  const [formData, setFormData] = useState({
    /* ================= PICKUP / SENDER ================= */
    senderName: "",
    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    pickupPincode: "",
    pickupCountry: "",
    pickupPhone: "",
    pickupAltPhone: "",
    pickupAadhaar: "",
    pickupDate: "",
    pickupTime: "",
    pickupLat: null,
    pickupLng: null,
    pickupPlaceId: "",     // Google Place ID captured from geocode response

    /* ================= PACKAGE ================= */
    packageSize: "",
    deliverySpeed: "standard",
    parcelWeight: "",
    parcelLength: "",
    parcelWidth: "",
    parcelHeight: "",
    parcelContents: "",
    parcelValue: "",
    vehicleType: null,
    parcelType: "",
    parcelNotes: "",
    parcelPhoto1: null,
    parcelPhoto2: null,
    parcelPhoto3: null,

    /* ================= DELIVERY / RECEIVER ================= */
    receiverName: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",
    deliveryCountry: "",
    deliveryAlternatePhNo: "",
    deliveryPhNo: "",
    deliveryLat: null,
    deliveryLng: null,
    deliveryPlaceId: "",   // Google Place ID captured from geocode response

    /* ================= PARTNER / PRICE ================= */
    selectedPartnerId: null,
    selectedPartnerName: "",
    selectedAcceptanceId: null,
    selectedRouteId: null,
    priceQuote: "",
    bookingId: null,
    bookingRef: null,
  });

  const updateFields = (fields) =>
    setFormData((prev) => ({ ...prev, ...fields }));

  // Update URL when parcel ID or step changes
  useEffect(() => {
    if (createdParcelId) {
      setSearchParams({ parcelId: createdParcelId, step: step.toString() });
    }
  }, [createdParcelId, step, setSearchParams]);

  const next = async () => {
    const newStep = Math.min(step + 1, steps.length);

    // Always update local step first for immediate UI feedback
    setStep(newStep);

    // ✅ FIX: Don't automatically update to Step 3 in database
    // Step 3 should only be updated when payment is actually completed
    if (createdParcelId && newStep !== 3) {
      try {
        await ApiService.apipatch(
          ServerUrl.API_UPDATE_PARCEL_STEP(createdParcelId),
          { form_step: newStep }
        );
      } catch (error) {
      }
    } else if (newStep === 3) {
    }
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  // Fetch parcel data from database on mount if parcelId exists
  useEffect(() => {
    const fetchParcelFromDatabase = async () => {
      if (!createdParcelId) return;

      try {
        setLoading(true);
        const response = await ApiService.apiget(
          ServerUrl.API_GET_PARCEL_BY_ID(createdParcelId)
        );

        if (response?.data?.success) {
          const parcel = response.data.data;
          // Set step from database if not explicitly provided AND we're not already ahead
          // This prevents the database fetch from resetting the step after user has progressed
          if (!initialStep && parcel.form_step && parcel.form_step > step) {
            setStep(parcel.form_step);
          }

          setExistingParcelData(parcel);

          // Transform parcel data to form data format
          const transformedData = {
            // Pickup/Sender data
            senderName: parcel.pickupAddress?.name || "",
            pickupAddress: parcel.pickupAddress?.address || "",
            pickupCity: parcel.pickupAddress?.city || "",
            pickupState: parcel.pickupAddress?.state || "",
            pickupPincode: parcel.pickupAddress?.pincode || "",
            pickupCountry: parcel.pickupAddress?.country || "",
            pickupPhone: parcel.pickupAddress?.phone || "",
            pickupAltPhone: parcel.pickupAddress?.alt_phone || "",
            pickupAadhaar: parcel.pickupAddress?.aadhar_no || "",
            pickupDate: parcel.pickup_date || "",
            pickupTime: parcel.pickup_time || "",
            pickupLat: parcel.pickupAddress?.latitude || null,
            pickupLng: parcel.pickupAddress?.longitude || null,
            pickupPlaceId: parcel.pickupAddress?.place_id || "",

            // Package data
            packageSize: parcel.package_size || "",
            parcelWeight: parcel.weight || "",
            parcelLength: parcel.length || "",
            parcelWidth: parcel.width || "",
            parcelHeight: parcel.height || "",
            parcelContents: parcel.description || "",
            parcelValue: parcel.value || "",
            vehicleType: parcel.vehicle_type || "",
            parcelType: parcel.parcel_type || "",
            parcelNotes: parcel.notes || "",
            parcelPhoto1: parcel.photos?.[0] || null,
            parcelPhoto2: parcel.photos?.[1] || null,
            parcelPhoto3: parcel.photos?.[2] || null,

            // Delivery/Receiver data
            receiverName: parcel.deliveryAddress?.name || "",
            deliveryAddress: parcel.deliveryAddress?.address || "",
            deliveryCity: parcel.deliveryAddress?.city || "",
            deliveryState: parcel.deliveryAddress?.state || "",
            deliveryPincode: parcel.deliveryAddress?.pincode || "",
            deliveryCountry: parcel.deliveryAddress?.country || "",
            deliveryPhNo: parcel.deliveryAddress?.phone || "",
            deliveryAlternatePhNo: parcel.deliveryAddress?.alt_phone || "",
            deliveryLat: parcel.deliveryAddress?.latitude || null,
            deliveryLng: parcel.deliveryAddress?.longitude || null,
            deliveryPlaceId: parcel.deliveryAddress?.place_id || "",

            // Partner/Price data - restored from database
            selectedPartnerId: parcel.selected_partner_id || parcel.booking?.traveller_id || null,
            selectedPartnerName: parcel.booking?.traveller?.profile?.name ||
              parcel.booking?.traveller?.email?.split('@')[0] || "",
            selectedAcceptanceId: parcel.selected_acceptance_id || null,
            priceQuote: parcel.price_quote || "",
            bookingId: parcel.booking?.id || null,
            bookingRef: parcel.booking?.booking_ref || null,
          };

          setFormData(transformedData);

          if (parcel.booking?.id) {
            setBookingId(parcel.booking.id);
          }
        } else {
          showToast('Failed to load parcel data', 'error');
        }
      } catch (error) {
        showToast('Failed to load parcel data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchParcelFromDatabase();
  }, [createdParcelId, initialStep]);

  // Fetch existing parcel data if parcel ID is provided (legacy support - can be removed)
  useEffect(() => {
    const fetchExistingParcelData = async () => {
      if (!existingParcelId || createdParcelId) return; // Skip if already handled above

      try {
        setLoading(true);
        const response = await ApiService.apiget(
          ServerUrl.API_GET_PARCEL_BY_ID(existingParcelId)
        );

        if (response?.data?.success) {
          const parcelData = response.data.data;
          setExistingParcelData(parcelData);

          // Transform parcel data to form data format
          const transformedData = {
            // Pickup/Sender data
            senderName: parcelData.pickupAddress?.name || "",
            pickupAddress: parcelData.pickupAddress?.address || "",
            pickupCity: parcelData.pickupAddress?.city || "",
            pickupState: parcelData.pickupAddress?.state || "",
            pickupPincode: parcelData.pickupAddress?.pincode || "",
            pickupCountry: parcelData.pickupAddress?.country || "",
            pickupPhone: parcelData.pickupAddress?.phone || "",
            pickupAltPhone: parcelData.pickupAddress?.alt_phone || "",
            pickupAadhaar: parcelData.pickupAddress?.aadhar_no || "",
            pickupDate: parcelData.pickup_date || "",
            pickupTime: parcelData.pickup_time || "",
            pickupLat: parcelData.pickupAddress?.latitude || null,
            pickupLng: parcelData.pickupAddress?.longitude || null,
            pickupPlaceId: parcelData.pickupAddress?.place_id || "",

            // Package data
            packageSize: parcelData.package_size || "",
            parcelWeight: parcelData.weight || "",
            parcelLength: parcelData.length || "",
            parcelWidth: parcelData.width || "",
            parcelHeight: parcelData.height || "",
            parcelContents: parcelData.description || "",
            parcelValue: parcelData.value || "",
            vehicleType: parcelData.vehicle_type || "",
            parcelType: parcelData.parcel_type || "",
            parcelNotes: parcelData.notes || "",

            // Delivery/Receiver data
            receiverName: parcelData.deliveryAddress?.name || "",
            deliveryAddress: parcelData.deliveryAddress?.address || "",
            deliveryCity: parcelData.deliveryAddress?.city || "",
            deliveryState: parcelData.deliveryAddress?.state || "",
            deliveryPincode: parcelData.deliveryAddress?.pincode || "",
            deliveryCountry: parcelData.deliveryAddress?.country || "",
            deliveryPhNo: parcelData.deliveryAddress?.phone || "",
            deliveryAlternatePhNo: parcelData.deliveryAddress?.alt_phone || "",
            deliveryLat: parcelData.deliveryAddress?.latitude || null,
            deliveryLng: parcelData.deliveryAddress?.longitude || null,
            deliveryPlaceId: parcelData.deliveryAddress?.place_id || "",

            // Partner/Price data - check if there's a booking with selected traveller
            selectedPartnerId: parcelData.booking?.traveller_id || null,
            selectedPartnerName: parcelData.booking?.traveller?.profile?.name ||
              parcelData.booking?.traveller?.email?.split('@')[0] || "",
            priceQuote: parcelData.price_quote || "",
            bookingId: parcelData.booking?.id || null,
            bookingRef: parcelData.booking?.booking_ref || null,
          };

          setFormData(transformedData);
        } else {
          showToast('Failed to load parcel data', 'error');
        }
      } catch (error) {
        showToast('Failed to load parcel data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchExistingParcelData();
  }, [existingParcelId]);



  const stepLabels = [
    "Pickup Package & Delivery Details",
    "Select Traveler",
    "Review",
  ];

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-5">
        {/* PAGE TITLE */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#294CFF] mb-1 sm:mb-2">
          Send Parcel
        </h1>

        {/* MOBILE STEP INDICATOR — shown only on mobile instead of label-less circles */}
        <p className="text-xs text-gray-500 mb-3 sm:hidden">
          Step {step} of {steps.length} — {stepLabels[step - 1]}
        </p>

        {/* STEPPER */}
        <div className="flex items-center overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {[1, 2, 3].map((num) => {
            const isActive = step === num;
            const isDone = step > num;
            const isClickable = existingParcelData
              ? true
              : createdParcelId
                ? num >= 2
                : num === 1;

            return (
              <div
                key={num}
                className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onClick={() => isClickable && setStep(num)}
              >
                {/* Circle */}
                <div
                  className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border text-[11px] font-semibold
                    ${isActive
                      ? "bg-[#294CFF] text-white border-[#294CFF]"
                      : isDone
                        ? "bg-white text-[#294CFF] border-[#294CFF]"
                        : isClickable
                          ? "bg-white text-gray-400 border-gray-300"
                          : "bg-gray-100 text-gray-300 border-gray-200"
                    }`}
                >
                  {num}
                </div>

                {/* Label — desktop only */}
                <span
                  className={`hidden md:inline-block text-sm whitespace-nowrap ${isActive ? "text-[#294CFF] font-semibold" :
                      isClickable ? "text-gray-500" : "text-gray-300"
                    }`}
                >
                  {stepLabels[num - 1]}
                </span>

                {/* Connector line */}
                {num !== 3 && (
                  <div className="w-8 sm:w-12 h-[2px] bg-gray-200 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>



        {/* STEPS 1 & 2: WITH OrderSummary | STEP 3: WITHOUT */}
        {step === 3 ? (
          // STEP 3: FULL WIDTH - NO SUMMARY
          <div className="space-y-5">
            <div className="px-4 sm:px-6 py-5 bg-white rounded-2xl">
              <StepReview
                data={{ ...formData, createdParcelId }}
                onBack={back}
                createdParcelId={createdParcelId}
                bookingId={bookingId}
                setBookingId={setBookingId}
              />

            </div>
          </div>
        ) : (
          // STEPS 1 & 2: WITH SUMMARY SIDEBAR
          <div className="grid lg:grid-cols-[2fr,1fr] gap-6 min-w-0">
            {/* LEFT: FORM */}
            <div className="space-y-5 min-w-0">
              {step === 1 && (
                <div className="px-4 sm:px-6 py-5 bg-white rounded-2xl">
                  {loading ? (
                    // Show loading state
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="text-blue-600 text-2xl animate-pulse" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Parcel Data...</h3>
                      <p className="text-gray-600">Please wait while we fetch your parcel details.</p>
                    </div>
                  ) : (
                    // Show normal Step 1 form for new parcel or editing
                    <>
                      <h2 className="text-xl sm:text-2xl md:text-[30px] font-semibold text-primary mb-4">
                        Pickup Details
                      </h2>
                      <StepPickup
                        data={formData}
                        updateFields={updateFields}
                        onNext={next}
                        createdParcelId={createdParcelId}
                        setCreatedParcelId={setCreatedParcelId}
                        setShowConfirmation={setShowConfirmation}   // ✅ ADD
                        setParcelId={setPopupParcelId}              // ✅ ADD
                      />
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="px-4 sm:px-6 py-5 bg-white rounded-2xl">
                  <h2 className="text-xl sm:text-2xl md:text-[30px] font-semibold text-primary mb-4">
                    Select Traveler
                  </h2>
                  <StepPartner
                    data={formData}
                    updateFields={updateFields}
                    onNext={next}
                    onBack={back}
                    parcelId={createdParcelId}
                  />
                </div>
              )}
            </div>

            {/* RIGHT: OrderSummary (ONLY steps 1 & 2) */}
            <aside className="px-5 py-5 bg-white shadow-sm rounded-2xl h-fit lg:sticky lg:top-6 overflow-hidden min-w-0">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <OrderSummary data={formData} />
              )}
            </aside>
          </div>
        )}
      </div>
      {showConfirmation && (
        <UserBookingConfirmationModal
          parcelId={popupParcelId}
          isParcelOnly={true}
          onClose={() => {
            setShowConfirmation(false);
            next(); // 👉 move to Step 2 AFTER popup
          }}
        />
      )}
    </div>
  );
};

export default RequestForm;

