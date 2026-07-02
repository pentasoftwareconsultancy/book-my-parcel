import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

import RoutePath from "../../core/constants/routes.constant";
import { showSuccess } from "../../core/utils/toast.util";
import BookingCancel from "./BookingCancle";
import useModalDismiss from "../../core/hooks/useModalDismiss";

/**
 * UserBookingConfirmationModal Component
 * Props:
 * - trackingId  : string
 * - bookingId   : string
 * - parcelId    : string  (from backend)
 * - order       : object
 * - onClose     : function
 * - isParcelOnly: boolean — true = parcel created popup, false = booking confirmed popup
 * - travellerName: string — name of selected traveller (Phase 3)
 */
const UserBookingConfirmationModal = ({
  trackingId,
  bookingId,
  parcelId,
  order,
  onClose,
  isParcelOnly,
  travellerName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toastShown = useRef(false);

  const [showCancelForm, setShowCancelForm] = useState(false);

  // Get data from location state if passed via navigation
  const stateData = location.state || {};
  const finalBookingId = bookingId || order?.bookingId || stateData.bookingId;
  const finalParcelId = parcelId || order?.parcelId || stateData.parcelId;
  const finalTravellerName = travellerName || stateData.travellerName;

  // Show success toast only once
  useEffect(() => {
    if (!toastShown.current) {
      showSuccess(
        isParcelOnly
          ? `Parcel created successfully! Your Parcel ID is ${finalParcelId}`
          : `Booking confirmed successfully! Your Tracking ID is ${trackingId || finalBookingId}`
      );
      toastShown.current = true;
    }
  }, []);

  const goToDashboard = () => {
    if (onClose) onClose();
    navigate(RoutePath.USER_ALL_ORDERS, { state: { newOrder: order } });
  };

  const { handleBackdropClick } = useModalDismiss(onClose || goToDashboard);

  const goToTracking = () => {
    if (onClose) onClose();
    navigate(RoutePath.USER_TRACK_PARCEL, { state: { parcelId: finalParcelId } });
  };

  return (
    <>
      {/* ================== CONFIRMATION MODAL ================== */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg px-8 py-10 text-center relative">

          {/* Close Button */}
          <button
            onClick={onClose || goToDashboard}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-2">
            {isParcelOnly ? "Parcel Created!" : "Booking Confirmed!"}
          </h1>

          {/* Message */}
          <p className="text-gray-600 text-sm md:text-base mb-6">
            {isParcelOnly
              ? "Your parcel has been created successfully."
              : finalTravellerName
              ? `Your booking has been confirmed with ${finalTravellerName}. You can track your parcel now.`
              : "Your booking has been confirmed successfully. You can track your parcel now."}
          </p>

          {/* ID Display Section */}
          <div className="mb-6">
            {/* Show both IDs side by side when booking is confirmed */}
            {!isParcelOnly && (finalBookingId || finalParcelId) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {finalBookingId && (
                  <div className="bg-green-50 rounded-xl px-4 py-3 text-center border border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                    <p className="text-green-600 font-semibold tracking-wide text-sm">{finalBookingId}</p>
                  </div>
                )}
                {finalParcelId && (
                  <div className="bg-blue-50 rounded-xl px-4 py-3 text-center border border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">Parcel ID</p>
                    <p className="text-blue-600 font-semibold tracking-wide text-sm">{finalParcelId}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Show single ID for parcel creation or when only one ID is available */
              <div className="flex flex-col gap-3">
                {finalParcelId && (
                  <div className="mx-auto w-fit bg-blue-50 rounded-xl px-6 py-3 border border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">Parcel ID</p>
                    <p className="text-blue-600 font-semibold tracking-wide">{finalParcelId}</p>
                  </div>
                )}
                {!isParcelOnly && finalBookingId && !finalParcelId && (
                  <div className="mx-auto w-fit bg-green-50 rounded-xl px-6 py-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                    <p className="text-green-600 font-semibold tracking-wide">{finalBookingId}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Traveller Name */}
          {!isParcelOnly && finalTravellerName && (
            <div className="mx-auto w-fit bg-green-50 rounded-xl px-6 py-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">Assigned Traveller</p>
              <p className="text-green-600 font-semibold tracking-wide">{finalTravellerName}</p>
            </div>
          )}

          {/* ================== ACTION BUTTONS ================== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            {isParcelOnly ? (
              // ✅ Parcel created — Next button only
              <button
                onClick={onClose || goToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition w-full"
              >
                Next: Select Partner →
              </button>
            ) : (
              // ✅ Booking confirmed — Dashboard only
              <>
                <button
                  onClick={goToDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition w-full sm:w-auto"
                >
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================== CANCEL BOOKING POPUP ================== */}
      {showCancelForm && (
        <BookingCancel
          parcelId={trackingId}
          onClose={() => setShowCancelForm(false)}
        />
      )}
    </>
  );
};

export default UserBookingConfirmationModal;
