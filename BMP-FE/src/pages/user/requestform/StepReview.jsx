import Confetti from "../../../components/common/Confetti";
import UserBookingConfirmationModal from "../UserBookingConfirmation";
import BookingConfirmedBanner from "../../../components/user/BookingConfirmedBanner";
import { Card, AddressCard, PackageInfo, TravelerCard, Row } from "../../../components/user/ReviewCards";
import { useStepReview } from "../../../core/hooks/useStepReview";
import { DELIVERY_STATUS } from "../../../core/constants/app.constant";

const STATUS_STYLES = {
  [DELIVERY_STATUS.DELIVERED]: "bg-green-50 border-green-200 text-green-800",
  [DELIVERY_STATUS.CANCELLED]: "bg-red-50 border-red-200 text-red-800",
  [DELIVERY_STATUS.AUTO_CANCELLED]: "bg-orange-50 border-orange-200 text-orange-800",
  [DELIVERY_STATUS.IN_TRANSIT]: "bg-blue-50 border-blue-200 text-blue-800",
  [DELIVERY_STATUS.CONFIRMED]: "bg-green-50 border-green-200 text-green-800",
};

const StepReview = ({ data, onBack, readOnly = false }) => {
  const {
    parcelData, selectedTraveler, loading, showPopup, setShowPopup,
    processingPayment, showConfetti, setShowConfetti, trackingId,
    getOrderStatus, shouldShowPaymentOptions, shouldShowConfirmButton,
    getStatusMessage, createOrderFromForm, handlePayment,
  } = useStepReview({ data, readOnly });

  if (!parcelData) return <p className="text-center p-10">No parcel found.</p>;
  if (loading) return <p className="text-center p-10">Loading parcel details...</p>;

  const pickupAddress = parcelData.addresses?.find((a) => a.type === "pickup");
  const deliveryAddress = parcelData.addresses?.find((a) => a.type === "delivery");
  const orderStatus = getOrderStatus();
  const statusMsg = getStatusMessage();

  return (
    <>
      {showConfetti && <Confetti duration={4000} onComplete={() => setShowConfetti(false)} />}

      <form onSubmit={(e) => e.preventDefault()}
        className="bg-[#FBFBFF] p-6 md:p-8 rounded-3xl border-2 border-blue-500 shadow-[0_0_40px_rgba(15,23,42,0.15)] space-y-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-primary">Review &amp; Confirm</h2>

        {/* Status banner */}
        {statusMsg && (
          <div className={`p-4 rounded-xl border flex items-center gap-2 ${STATUS_STYLES[orderStatus] || "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{statusMsg}</span>
          </div>
        )}

        {/* Booking confirmed banner */}
        {(data.bookingId || data.bookingRef || parcelData?.booking?.booking_ref) && orderStatus === DELIVERY_STATUS.CONFIRMED && (
          <BookingConfirmedBanner parcelData={parcelData} data={data} />
        )}

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card title="Pickup Details" color="gray"><AddressCard address={pickupAddress} label="Pickup" /></Card>
            <Card title="Package Information" color="gray"><PackageInfo parcel={parcelData} /></Card>
          </div>
          <div className="space-y-4">
            <Card title="Delivery Details" color="gray"><AddressCard address={deliveryAddress} label="Delivery" /></Card>
            <Card title="Traveler details" color="gray">
              {selectedTraveler
                ? <TravelerCard traveler={selectedTraveler} />
                : parcelData.selected_partner_id
                  ? <p className="text-gray-500">Loading traveler details...</p>
                  : <p className="text-gray-500">No traveler selected</p>
              }
            </Card>
            {/* <Card title="Price Breakdown" color="emerald" greenBg>
              {(() => {
                const base = Number(parcelData.price_quote) || 0;
                return (
                  <>
                    <Row label="Base Price" value={`₹${base}`} />
                    <div className="border-t border-emerald-200 mt-4 pt-3 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-bold text-primary">₹{base}</span>
                    </div>
                  </>
                );
              })()}
            </Card> */}
            <Card title="Price Breakdown" color="emerald" greenBg>
              {(() => {
                const breakdown = parcelData?.pricing_breakdown || {};

                return (
                  <>
                    <Row
                      label="Base Price"
                      value={`₹${breakdown.basePrice || 0}`}
                    />

                   <Row
  label={`Platform Fee (${breakdown.platformFeePercent || 12}%)`}
  value={`₹${breakdown.platformFee || 0}`}
/>

<Row
  label={`GST (${breakdown.gstPercent || 18}%)`}
  value={`₹${breakdown.gstAmount || 0}`}
/>

                    <div className="border-t border-emerald-200 mt-4 pt-3 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-bold text-primary">
                        ₹{breakdown.finalPrice || parcelData.price_quote || 0}
                      </span>
                    </div>
                  </>
                );
              })()}
            </Card>
          </div>
        </div>

        {/* Payment info */}
        {shouldShowPaymentOptions() && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-blue-900">Secure Online Payment</h5>
              <p className="text-sm text-blue-700 mt-1">Your payment will be processed securely via Cashfree. You&apos;ll receive instant booking confirmation.</p>
            </div>
          </div>
        )}

        {/* Payment summary (read-only) */}
        {readOnly && (orderStatus === DELIVERY_STATUS.DELIVERED || orderStatus === DELIVERY_STATUS.IN_TRANSIT) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Payment Summary</h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">{parcelData?.payment_method || "Cash on Delivery"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${parcelData?.payment_status === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {parcelData?.payment_status || "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-primary">₹{parcelData.price_quote || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t flex flex-col sm:flex-row gap-4 justify-between">
          {!readOnly && (
            <button type="button" onClick={onBack}
              className="px-6 py-3 border-2 border-primary text-primary rounded-2xl font-semibold"
            >
              ← Back
            </button>
          )}
          {shouldShowConfirmButton() && (
            <button onClick={() => handlePayment(pickupAddress)} disabled={processingPayment}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all ${processingPayment ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {processingPayment ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Payment...
                </span>
              ) : "Pay Now & Confirm Booking"}
            </button>
          )}
        </div>

        {/* Confirmation popup */}
        {showPopup && (
          <UserBookingConfirmationModal
            trackingId={parcelData?.parcel_ref || data.createdParcelId}
            bookingId={parcelData?.booking?.booking_ref || data.bookingRef || data.bookingId}
            parcelId={parcelData?.parcel_ref || data.createdParcelId}
            travellerName={selectedTraveler?.name}
            order={createOrderFromForm(pickupAddress, deliveryAddress)}
            isParcelOnly={false}
            onClose={() => setShowPopup(false)}
          />
        )}
      </form>
    </>
  );
};

export default StepReview;
