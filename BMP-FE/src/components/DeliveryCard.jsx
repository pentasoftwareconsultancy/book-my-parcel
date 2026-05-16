import { memo, useMemo } from "react";
import { CheckCircle, Eye, MessageSquare, Package, MapPin, Calendar, AlertCircle } from "lucide-react";
import { DELIVERY_STATUS } from "../core/constants/app.constant";

/* ── Status config ── */
const STATUS_CONFIG = {
  SENT:           { bg: "bg-blue-50",   text: "text-blue-700",   label: "REQUEST SENT" },
  AVAILABLE:      { bg: "bg-blue-50",   text: "text-blue-700",   label: "AVAILABLE" },
  INTERESTED:     { bg: "bg-amber-50",  text: "text-amber-700",  label: "INTEREST SENT" },
  ACCEPTED:       { bg: "bg-amber-50",  text: "text-amber-700",  label: "ACCEPTED" },
  REJECTED:       { bg: "bg-red-50",    text: "text-red-700",    label: "REJECTED" },
  EXPIRED:        { bg: "bg-gray-100",  text: "text-gray-500",   label: "EXPIRED" },
  SELECTED:       { bg: "bg-green-50",  text: "text-green-700",  label: "SELECTED" },
  NOT_SELECTED:   { bg: "bg-red-50",    text: "text-red-700",    label: "NOT SELECTED" },
  [DELIVERY_STATUS.CONFIRMED]:  { bg: "bg-green-50",  text: "text-green-700",  label: "CONFIRMED" },
  [DELIVERY_STATUS.PICKUP]:     { bg: "bg-amber-50",  text: "text-amber-700",  label: "PICKUP READY" },
  [DELIVERY_STATUS.IN_TRANSIT]: { bg: "bg-indigo-50", text: "text-indigo-600", label: "IN TRANSIT" },
  [DELIVERY_STATUS.DELIVERED]:  { bg: "bg-emerald-100", text: "text-emerald-700", label: "DELIVERED" },
  [DELIVERY_STATUS.CANCELLED]:  { bg: "bg-red-50",    text: "text-red-700",    label: "CANCELLED" },
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || { bg: "bg-blue-50", text: "text-blue-700", label: "UNKNOWN" };

/* ── Button config per booking status ── */
const BUTTON_CONFIG = {
  [DELIVERY_STATUS.CONFIRMED]:  { label: "Reached at Pickup",     action: "start_pickup",    cls: "bg-amber-500 hover:bg-amber-600 text-white" },
  [DELIVERY_STATUS.PICKUP]:     { label: "Enter Pickup OTP",      action: "verify_pickup",   cls: "bg-amber-500 hover:bg-amber-600 text-white" },
  [DELIVERY_STATUS.IN_TRANSIT]: { label: "Reached at Delivery",   action: "start_delivery",  cls: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  [DELIVERY_STATUS.DELIVERED]:  { label: "Completed",             action: null,              cls: "bg-blue-500 hover:bg-blue-600 text-white" },
};

/* ── Small reusable pieces ── */
const Btn = ({ onClick, className, disabled, children, size = "md" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-colors disabled:opacity-60
      ${size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"} ${className}`}
  >
    {children}
  </button>
);

const LocationBox = ({ title, address, date, accent }) => {
  const colors = accent === "blue"
    ? { bg: "bg-blue-50", icon: "bg-blue-700", title: "text-blue-700" }
    : { bg: "bg-green-50", icon: "bg-green-700", title: "text-green-700" };

  return (
    <div className={`${colors.bg} p-3 rounded-xl`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-6 h-6 ${colors.icon} rounded flex items-center justify-center shrink-0`}>
          <MapPin size={13} color="white" />
        </div>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className={`font-bold text-base ${colors.title} mb-0.5`}>{address.split(",")[0]}</p>
      <p className="text-xs text-gray-500 mb-1">{address}</p>
      <div className="flex items-center gap-1">
        <Calendar size={11} color="#6B7280" />
        <span className="text-xs text-gray-500">{date}</span>
      </div>
    </div>
  );
};

const OtpBox = ({ label, otp, note, accent }) => {
  const colors = accent === "amber"
    ? { bg: "bg-amber-50 border-amber-400", dot: "bg-amber-400", text: "text-amber-500", letter: "P" }
    : { bg: "bg-green-50 border-emerald-400", dot: "bg-emerald-500", text: "text-emerald-500", letter: "D" };

  return (
    <div className={`${colors.bg} border p-3 rounded-xl`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-5 h-5 ${colors.dot} rounded-full flex items-center justify-center`}>
          <span className="text-white text-[10px] font-bold">{colors.letter}</span>
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <p className={`font-bold text-2xl ${colors.text} mb-0.5`}>{otp || "****"}</p>
      <p className="text-xs text-gray-500 mt-1">{note}</p>
    </div>
  );
};

/* ── Action buttons — handles all statuses, responsive ── */
const ActionButtons = ({ delivery, buttonConfig, onAction, userType }) => {
  const isConfirmed = delivery.status === DELIVERY_STATUS.CONFIRMED || delivery.status === "CONFIRMED";
  const isTerminal = delivery.status === DELIVERY_STATUS.DELIVERED || delivery.status === DELIVERY_STATUS.CANCELLED;

  const secondaryBtns = (size) => (
    <>
      {isConfirmed && (
        <Btn size={size} onClick={() => onAction?.("cancel", delivery)} className="border border-red-500 text-red-600 hover:bg-red-50 flex-1">
          Cancel
        </Btn>
      )}
      {!buttonConfig?.disabled && (
        <>
          <Btn size={size} onClick={() => onAction?.("details", delivery)} className="border border-gray-300 text-gray-600 hover:bg-gray-50 flex-1">
            <Eye size={size === "sm" ? 13 : 15} /> Details
          </Btn>
          <Btn size={size} onClick={() => onAction?.("contact", delivery)} className="border border-gray-300 text-gray-600 hover:bg-gray-50 flex-1">
            <MessageSquare size={size === "sm" ? 13 : 15} /> Contact
          </Btn>
          {userType === "traveller" && isTerminal && (
            <Btn size={size} onClick={() => onAction?.("dispute", delivery)} className="border border-red-400 text-red-500 hover:bg-red-50 flex-1">
              <AlertCircle size={size === "sm" ? 13 : 15} /> Dispute
            </Btn>
          )}
        </>
      )}
    </>
  );

  /* Booking statuses */
  if (buttonConfig) {
    return (
      <>
        {/* Desktop */}
        <div className="hidden sm:flex gap-2">
          <Btn
            onClick={() => buttonConfig.action && onAction?.(buttonConfig.action, delivery)}
            disabled={buttonConfig.disabled || delivery.isReceivingPayment}
            className={`flex-1 ${buttonConfig.cls}`}
          >
            {delivery.isReceivingPayment ? "Processing..." : buttonConfig.label}
          </Btn>
          {secondaryBtns("md")}
        </div>
        {/* Mobile */}
        <div className="flex sm:hidden flex-col gap-2">
          <Btn
            onClick={() => buttonConfig.action && onAction?.(buttonConfig.action, delivery)}
            disabled={buttonConfig.disabled || delivery.isReceivingPayment}
            className={`w-full ${buttonConfig.cls}`}
          >
            {delivery.isReceivingPayment ? "Processing..." : buttonConfig.label}
          </Btn>
          <div className="flex gap-2">{secondaryBtns("sm")}</div>
        </div>
      </>
    );
  }

  /* SENT / AVAILABLE */
  if (delivery.status === "SENT" || delivery.status === "AVAILABLE") {
    return (
      <>
        <div className="hidden sm:flex gap-2">
          <Btn onClick={() => onAction?.("express_interest", delivery)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
            <CheckCircle size={16} /> I can deliver this parcel
          </Btn>
          <Btn onClick={() => onAction?.("details", delivery)} className="border border-gray-300 text-gray-600 hover:bg-gray-50"><Eye size={15} /> Details</Btn>
          <Btn onClick={() => onAction?.("decline", delivery)} className="border border-red-400 text-red-500 hover:bg-red-50">Decline</Btn>
        </div>
        <div className="flex sm:hidden flex-col gap-2">
          <Btn onClick={() => onAction?.("express_interest", delivery)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            <CheckCircle size={15} /> I can deliver this parcel
          </Btn>
          <div className="flex gap-2">
            <Btn size="sm" onClick={() => onAction?.("details", delivery)} className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50"><Eye size={13} /> Details</Btn>
            <Btn size="sm" onClick={() => onAction?.("decline", delivery)} className="flex-1 border border-red-400 text-red-500 hover:bg-red-50">Decline</Btn>
          </div>
        </div>
      </>
    );
  }

  /* INTERESTED */
  if (delivery.status === "INTERESTED") {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Btn disabled className="flex-1 bg-amber-50 text-amber-700 border border-amber-200">Interest Sent - Waiting for Selection</Btn>
        <Btn onClick={() => onAction?.("details", delivery)} className="border border-gray-300 text-gray-600 hover:bg-gray-50 sm:w-auto w-full"><Eye size={15} /> Details</Btn>
      </div>
    );
  }

  /* SELECTED */
  if (delivery.status === "SELECTED") {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Btn disabled className="flex-1 bg-green-50 text-green-700 border border-green-200">
          {delivery.message || "You've been selected! Waiting for payment confirmation..."}
        </Btn>
        <Btn onClick={() => onAction?.("details", delivery)} className="border border-gray-300 text-gray-600 hover:bg-gray-50 sm:w-auto w-full"><Eye size={15} /> Details</Btn>
      </div>
    );
  }

  return null;
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const DeliveryCard = ({ delivery, onAction, userType = "traveller" }) => {
  const statusConfig = getStatusConfig(delivery.status);
  const buttonConfig = useMemo(() => BUTTON_CONFIG[delivery.status] || null, [delivery.status]);

  const pickupText = typeof delivery.pickup === "string" ? delivery.pickup : delivery.pickup?.address || delivery.pickup?.name || "Mumbai";
  const dropText   = typeof delivery.drop   === "string" ? delivery.drop   : delivery.drop?.address   || delivery.drop?.name   || "Pune";

  const isBus   = delivery.transport_mode === "bus";
  const isTrain = delivery.transport_mode === "train";
  const isPublic = isBus || isTrain;

  const showPickupOtp  = [DELIVERY_STATUS.PICKUP, DELIVERY_STATUS.IN_TRANSIT, DELIVERY_STATUS.DELIVERED].includes(delivery.status);
  const showDeliveryOtp = [DELIVERY_STATUS.IN_TRANSIT, DELIVERY_STATUS.DELIVERED].includes(delivery.status);

  const BOOKING_STATUSES = ["PARTNER_SELECTED", "CONFIRMED", "PICKUP", "IN_TRANSIT", "DELIVERED"];

  return (
    <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border border-gray-100">
      <div className="p-4 sm:p-5">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shrink-0">
              <Package size={20} color="white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {delivery.parcel_ref && (
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-semibold text-blue-800">
                    {delivery.parcel_ref}
                  </span>
                )}
                {BOOKING_STATUSES.includes(delivery.status) && delivery.booking_ref && (
                  <span className="px-2 py-1 bg-green-50 border border-green-300 rounded-md text-xs font-semibold text-green-800">
                    {delivery.booking_ref}
                  </span>
                )}
                {["IN_TRANSIT", "DELIVERED"].includes(delivery.status) && delivery.tracking_ref && (
                  <span className="px-2 py-1 bg-purple-50 border border-purple-300 rounded-md text-xs font-semibold text-purple-800">
                    {delivery.tracking_ref}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
                {delivery.urgent && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-[10px] font-bold">URGENT</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Customer: {delivery.customer || "Unknown"}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="font-bold text-green-600 text-xl">₹{delivery.earnings || delivery.amount || 0}</p>
            <p className="text-[11px] text-gray-400">Your Earnings</p>
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <LocationBox title="Pickup Location" address={pickupText} date={delivery.pickupDate || "2024-12-25"} accent="blue" />
          <LocationBox title="Drop Location"   address={dropText}   date={delivery.dropDate   || "2024-12-26"} accent="green" />
        </div>

        {/* Parcel Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Parcel Type",  value: delivery.type || delivery.parcelType || "Documents" },
            { label: "Weight",       value: delivery.weight || "0.5 kg" },
            { label: isPublic ? "Walking Distance" : "Detour Distance",
              value: isPublic ? `${delivery.detour_km || 0} km` : `${delivery.detour_km || 0} km (${delivery.detour_percentage || 0}%)` },
            { label: "Total Amount", value: `₹${delivery.totalAmount || delivery.amount || "450"}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="font-semibold text-sm text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Transport mode badge */}
        {isPublic && (
          <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 border-l-4
            ${isBus ? "bg-amber-50 border-amber-400" : "bg-indigo-50 border-indigo-400"}`}>
            <span className="text-xl">{isBus ? "🚌" : "🚂"}</span>
            <div>
              <p className="font-semibold text-sm">{isBus ? "Bus Route" : "Train Route"}</p>
              <p className="text-xs text-gray-500">Carrying as luggage • Walking distance from stops</p>
            </div>
          </div>
        )}

        {/* OTP Section */}
        {(showPickupOtp || showDeliveryOtp) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {showPickupOtp && (
              <OtpBox label="Pickup OTP" otp={delivery.pickup_otp} note="Verified with sender" accent="amber" />
            )}
            {showDeliveryOtp && (
              <OtpBox
                label="Delivery OTP"
                otp={delivery.delivery_otp}
                note={delivery.status === DELIVERY_STATUS.DELIVERED ? "Verified with receiver" : "Share with receiver for delivery confirmation"}
                accent="green"
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <ActionButtons delivery={delivery} buttonConfig={buttonConfig} onAction={onAction} userType={userType} />
      </div>
    </div>
  );
};

export default memo(DeliveryCard);
