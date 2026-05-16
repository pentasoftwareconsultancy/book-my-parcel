import { Suspense, lazy } from "react";
import {
  Package, MapPin, CheckCircle, Truck,
  Send, Star, MessageCircle, User, MessageSquare, XCircle
} from "lucide-react";
import { DELIVERY_STATUS, DELIVERY_STATUS_UI } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";

const ParcelAcceptanceList = lazy(() => import("../parcel/ParcelAcceptanceList"));

/* ── tiny shared components ─────────────────────────────── */
const InfoBox = ({ title, children }) => (
  <div className="bg-blue-50 rounded-lg p-4 mb-4">
    <p className="text-xs font-semibold text-blue-700 mb-3 uppercase">{title}</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">{children}</div>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium">{value || "—"}</p>
  </div>
);

const Location = ({ title, city, address, variant }) => {
  const styles = variant === "pickup" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600";
  return (
    <div className="flex items-start gap-3">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles}`}>
        <MapPin />
      </span>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="font-semibold">{city}</p>
        <p className="text-xs text-gray-400">{address}</p>
      </div>
    </div>
  );
};

/* ── TravelerInfo sub-component ─────────────────────────── */
const TravelerInfo = ({ order }) => {
  if (!order.traveler || order.traveler.name === "Not Assigned") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Not Assigned</p>
        {order.status === DELIVERY_STATUS.MATCHING && (
          <div className="space-y-1">
            {order.acceptances?.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span>{order.acceptances.length} traveller(s) available</span>
                </div>
                {order.selected_partner_id ? (
                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Traveller selected - Ready to confirm payment
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">
                    Click &quot;Select Traveller&quot; button below to choose
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span>Finding nearby travellers...</span>
                </div>
                <div className="text-xs text-gray-500">Estimated time: 5-10 minutes</div>
              </>
            )}
          </div>
        )}
        {order.status === DELIVERY_STATUS.CREATED && (
          <div className="text-xs text-gray-500">Complete your parcel request to find travellers</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center">
        <User />
      </div>
      <div>
        <p className="font-semibold">{order.traveler.name}</p>
        <p className="text-sm flex items-center gap-1">
          <Star className="text-yellow-500" />
          {order.traveler.rating} · {order.traveler.phone}
        </p>
        {order.traveler.vehicle && (
          <p className="text-xs text-gray-600">
            {order.traveler.vehicle}{order.traveler.vehicleNumber && ` (${order.traveler.vehicleNumber})`}
          </p>
        )}
        {order.traveler.totalDeliveries > 0 && (
          <p className="text-xs text-gray-600">{order.traveler.totalDeliveries} deliveries completed</p>
        )}
      </div>
    </div>
  );
};

/* ── StatusMessage sub-component ────────────────────────── */
const StatusMessage = ({ order, otpData }) => {
  const show = [
    DELIVERY_STATUS.PARTNER_SELECTED, DELIVERY_STATUS.CONFIRMED,
    DELIVERY_STATUS.PICKUP, DELIVERY_STATUS.IN_TRANSIT,
  ].includes(order.status);
  if (!show) return null;

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Delivery Status</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        {order.status === DELIVERY_STATUS.PARTNER_SELECTED && (
          <p className="text-sm text-blue-700 flex items-center gap-1">
            <CheckCircle size={14} /> Traveller selected! Please complete payment to confirm the booking.
          </p>
        )}
        {order.status === DELIVERY_STATUS.CONFIRMED && (
          <p className="text-sm text-blue-700 flex items-center gap-1">
            <CheckCircle size={14} /> Traveller assigned and ready for pickup. Waiting for traveller to reach pickup location.
          </p>
        )}
        {order.status === DELIVERY_STATUS.PICKUP && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-blue-700 flex-1 flex items-center gap-1">
              <CheckCircle size={14} /> Pickup OTP has been sent to your phone. Share it with the traveller to confirm pickup.
            </p>
            {(otpData?.pickup_otp || order.pickup_otp) ? (
              <div className="bg-white border-2 border-blue-300 rounded-lg px-4 py-2 shrink-0 text-center">
                <p className="text-sm font-bold text-blue-900">OTP: {otpData?.pickup_otp || order.pickup_otp}</p>
                <p className="text-xs text-gray-600 mt-1">Share with: {otpData?.traveller_name || order.traveler?.name || "Traveller"}</p>
                <p className="text-xs text-gray-500">Valid 30 mins</p>
              </div>
            ) : (
              <p className="text-xs text-yellow-700 shrink-0">Waiting for OTP...</p>
            )}
          </div>
        )}
        {order.status === DELIVERY_STATUS.IN_TRANSIT && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-blue-700 flex-1 flex items-center gap-1">
              <CheckCircle size={14} /> Parcel is in transit. Delivery OTP has been sent to the recipient&apos;s phone.
            </p>
            {(otpData?.delivery_otp || order.delivery_otp) ? (
              <div className="bg-white border-2 border-green-400 rounded-lg px-4 py-2 shrink-0 text-center">
                <p className="text-sm font-bold text-green-700">OTP: {otpData?.delivery_otp || order.delivery_otp}</p>
                <p className="text-xs text-gray-600 mt-1">Share with: {order.delivery?.name || "Recipient"}</p>
                <p className="text-xs text-gray-500">Valid 30 mins</p>
              </div>
            ) : (
              <p className="text-xs text-yellow-700 shrink-0">Waiting for OTP...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── getPrimaryAction helper ─────────────────────────────── */
function getPrimaryAction({ order, handlers }) {
  const { handleCompleteParcel, handleSelectTraveller, handleDetails, handleTrack, onFeedback } = handlers;
  switch (order.status) {
    case DELIVERY_STATUS.CREATED:
      return { label: "Complete Parcel Request", icon: <Package />, onClick: handleCompleteParcel, className: "bg-blue-700 text-white hover:bg-blue-800" };
    case DELIVERY_STATUS.MATCHING:
      if (order.selected_partner_id)
        return { label: "Confirm & Pay", icon: <Send />, onClick: handleCompleteParcel, className: "bg-green-600 text-white hover:bg-green-700" };
      if (order.acceptances?.length > 0)
        return { label: "Select Traveller", icon: <User />, onClick: handleSelectTraveller, className: "bg-green-600 text-white hover:bg-green-700" };
      return { label: "View Traveller Selection", icon: <Truck />, onClick: handleCompleteParcel, className: "bg-yellow-600 text-white hover:bg-yellow-700" };
    case DELIVERY_STATUS.PARTNER_SELECTED:
      return { label: "Confirm & Pay", icon: <Send />, onClick: handleCompleteParcel, className: "bg-green-600 text-white hover:bg-green-700" };
    case DELIVERY_STATUS.CONFIRMED:
      return { label: "View Booking Details", icon: <Package />, onClick: handleDetails, className: "bg-indigo-600 text-white hover:bg-indigo-700" };
    case DELIVERY_STATUS.IN_TRANSIT:
      return { label: "Track Delivery", icon: <Send />, onClick: handleTrack, className: "bg-blue-700 text-white hover:bg-blue-800" };
    case DELIVERY_STATUS.DELIVERED:
      return { label: order.has_feedback ? "Edit Feedback" : "Give Feedback", icon: <MessageSquare />, onClick: () => onFeedback(order), className: "bg-green-600 text-white hover:bg-green-700" };
    default:
      return { label: "Track Delivery", icon: <Send />, onClick: handleTrack, className: "bg-blue-700 text-white hover:bg-blue-800" };
  }
}

/* ── ActionButtons sub-component ────────────────────────── */
const ActionButtons = ({ primaryAction, onContact, onDetails, onDispute, onCancel, order, canDispute, canCancel }) => {
  const sharedBtn = "flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition";
  return (
    <div className="border-t pt-3">
      {/* Mobile */}
      <div className="flex flex-col gap-2 md:hidden">
        <button onClick={primaryAction.onClick} disabled={primaryAction.disabled}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium shadow-md transition ${primaryAction.className}`}>
          {primaryAction.icon} {primaryAction.label}
        </button>
        <div className="flex gap-2 w-full">
          <button onClick={onContact} className={`flex-1 px-3 py-2.5 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 ${sharedBtn}`}><MessageCircle /> Contact</button>
          {order.status !== DELIVERY_STATUS.CONFIRMED && (
            <button onClick={onDetails} className={`flex-1 px-3 py-2.5 bg-white border border-gray-600 text-gray-700 hover:bg-blue-50 ${sharedBtn}`}><Package /> Details</button>
          )}
          {canDispute && <button onClick={onDispute} className={`flex-1 px-3 py-2.5 bg-orange-50 border border-orange-500 text-orange-600 hover:bg-orange-100 ${sharedBtn}`}><MessageSquare /> Dispute</button>}
          {canCancel && <button onClick={onCancel} className={`flex-1 px-3 py-2.5 bg-red-50 border border-red-600 text-red-700 hover:bg-red-100 ${sharedBtn}`}><XCircle /> Cancel</button>}
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden md:flex gap-3 items-center">
        <div className="flex-1">
          <button onClick={primaryAction.onClick} disabled={primaryAction.disabled}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium shadow-md transition ${primaryAction.className}`}>
            {primaryAction.icon} {primaryAction.label}
          </button>
        </div>
        <button onClick={onContact} className={`px-5 py-3 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 whitespace-nowrap ${sharedBtn}`}><MessageCircle /> Contact</button>
        {order.status !== DELIVERY_STATUS.CONFIRMED && (
          <button onClick={onDetails} className={`px-5 py-3 bg-white border border-gray-600 text-gray-700 hover:bg-blue-50 whitespace-nowrap ${sharedBtn}`}><Package /> Details</button>
        )}
        {canDispute && <button onClick={onDispute} className={`px-5 py-3 bg-orange-50 border border-orange-500 text-orange-600 hover:bg-orange-100 whitespace-nowrap ${sharedBtn}`}><MessageSquare /> Dispute</button>}
        {canCancel && <button onClick={onCancel} className={`px-5 py-3 bg-red-50 border border-red-600 text-red-700 hover:bg-red-100 whitespace-nowrap ${sharedBtn}`}><XCircle /> Cancel</button>}
      </div>
    </div>
  );
};

/* ── Main OrderCard export ───────────────────────────────── */
const OrderCard = ({ order, navigate, onCancel, onSelectTraveller, onFeedback, onContact, otpData }) => {
  const handleDetails = () => navigate(RoutePath.USER_PARCEL_DETAILS, { state: { parcelId: order.parcelId } });
  const handleTrack   = () => navigate(RoutePath.USER_TRACK_PARCEL.replace(":id", order.deliveryId));
  const handleDispute = () => navigate(RoutePath.USER_DISPUTE, { state: { order } });

  const handleContact = () => {
    const t = order.traveler;
    if (!t || t.name === "Not Assigned") { onContact({ name: null, phone: null, role: "traveller" }); return; }
    onContact({ name: t.name, phone: t.phone, rating: t.rating, vehicle: t.vehicle, vehicleNumber: t.vehicleNumber, totalDeliveries: t.totalDeliveries, role: "traveller" });
  };

  const handleCompleteParcel = () => {
    if (order.selected_partner_id) { navigate(RoutePath.USER_REQUEST_FORM, { state: { parcelId: order.id, step: 3 } }); return; }
    navigate(RoutePath.USER_REQUEST_FORM, { state: { parcelId: order.id, step: 2 } });
  };

  const handleSelectTraveller = () => onSelectTraveller(order.id);

  const canDispute = [DELIVERY_STATUS.CONFIRMED, DELIVERY_STATUS.PICKUP, DELIVERY_STATUS.IN_TRANSIT, DELIVERY_STATUS.DELIVERED].includes(order.status);
  const canCancel  = [DELIVERY_STATUS.CREATED, DELIVERY_STATUS.MATCHING, DELIVERY_STATUS.PARTNER_SELECTED, DELIVERY_STATUS.CONFIRMED].includes(order.status);

  const primaryAction = getPrimaryAction({ order, handlers: { handleCompleteParcel, handleSelectTraveller, handleDetails, handleTrack, onFeedback } });
  if (!primaryAction?.onClick) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{order.parcel_ref}</p>
            <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${DELIVERY_STATUS_UI[order.status]?.badge || "bg-gray-100 text-gray-600"}`}>
              <Truck size={12} />
              {DELIVERY_STATUS_UI[order.status]?.label || order.status}
            </span>
          </div>
          {order.booking_ref && !["INTERESTED", "AVAILABLE"].includes(order.status) && (
            <div className="mt-2 inline-block bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-yellow-800">
                Tracking: <span className="font-bold text-yellow-900">
                  {order.tracking_ref && ["IN_TRANSIT", "DELIVERED"].includes(order.status) ? order.tracking_ref : order.booking_ref}
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-blue-700">₹{order.amount}</p>
          <p className="text-xs text-gray-400">Booked on {order.bookedDate}</p>
        </div>
      </div>

      {/* ORDER IDENTIFIERS */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
        <p className="text-blue-600 text-xs font-bold mb-3">ORDER IDENTIFIERS</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-400 text-xs">Parcel ID</p><p className="font-medium text-gray-900">{order.parcel_ref || "—"}</p></div>
          <div><p className="text-gray-400 text-xs">Booking ID</p><p className="font-medium text-gray-900">{order.booking_ref || "—"}</p></div>
          <div>
            <p className="text-gray-400 text-xs">Tracking ID</p>
            <p className="font-medium text-gray-900">
              {order.tracking_ref && ["IN_TRANSIT", "DELIVERED"].includes(order.status) ? order.tracking_ref : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ROUTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-4 relative">
        <Location title="Pickup" city={order.pickup?.city} address={order.pickup?.address} variant="pickup" />
        <div className="relative flex items-center justify-center">
          <div className="absolute left-0 right-0 top-1/2 h-[3px] rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-red-400 -translate-y-1/2" />
          <div className="relative z-10 bg-white px-3"><Truck className="text-blue-600 text-4xl" /></div>
        </div>
        <Location title="Delivery" city={order.delivery?.city} address={order.delivery?.address} variant="delivery" />
      </div>

      {/* PACKAGE + TRAVELER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <InfoBox title="Package Details">
          <Info label="Size" value={order.package?.size} />
          <Info label="Weight" value={order.package?.weight} />
          <Info label="ETA" value={order.package?.eta} />
        </InfoBox>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Traveler Details</p>
          <TravelerInfo order={order} />
        </div>
      </div>

      <StatusMessage order={order} otpData={otpData} />

      {/* ACCEPTANCE LIST */}
      {order.status === DELIVERY_STATUS.MATCHING && !order.selected_partner_id && (
        <div className="mb-4">
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
            <ParcelAcceptanceList parcelId={order.id} />
          </Suspense>
        </div>
      )}

      <ActionButtons
        primaryAction={primaryAction}
        onContact={handleContact}
        onDetails={handleDetails}
        onDispute={handleDispute}
        onCancel={() => onCancel(order.id)}
        order={order}
        canDispute={canDispute}
        canCancel={canCancel}
      />
    </div>
  );
};

export default OrderCard;
