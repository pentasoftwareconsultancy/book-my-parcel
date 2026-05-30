
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, User, MapPin, Phone, Mail, Box, IndianRupee } from "lucide-react";
const RUN_DECORATOR_MARKER = true; // keeping imports aligned
import { DELIVERY_STATUS } from "../../../core/constants/app.constant";
import StepReview from "./StepReview";

const OrderSummary = ({ data: propData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const photoPreview = React.useMemo(() => {
    if (propData?.parcelPhoto1 instanceof File || propData?.parcelPhoto1 instanceof Blob) {
      const url = URL.createObjectURL(propData.parcelPhoto1);
      return url;
    }
    if (typeof propData?.parcelPhoto1 === "string" && propData.parcelPhoto1.trim() !== "") {
      if (propData.parcelPhoto1.startsWith("http://") || propData.parcelPhoto1.startsWith("https://")) {
        return propData.parcelPhoto1;
      }
      const backendUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";
      return `${backendUrl}${propData.parcelPhoto1.startsWith("/") ? "" : "/"}${propData.parcelPhoto1}`;
    }
    return null;
  }, [propData?.parcelPhoto1]);

  React.useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview); };
  }, [photoPreview]);

  // ✅ MODE 1 — Sidebar in RequestForm (propData passed as prop)
  if (propData) {
    return (
      <aside className="bg-white h-fit w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

        {/* Header image */}
        <div className="overflow-hidden rounded-xl mb-5 mt-2 ">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Parcel"
              className="w-full h-33 object-cover"
            />
          ) : (
            <img
              src="https://images.pexels.com/photos/6169663/pexels-photo-6169663.jpeg"
              alt="Delivery"
              className="w-full h-33 object-cover"
            />
          )}
        </div>

        {/* Pickup */}
        <Section title="Pickup Details">
          <InfoCard>
            <Info icon={<User size={14} />} label="Contact Name" value={propData?.senderName} />
            <Info icon={<MapPin size={14} />} label="Address" value={propData?.pickupAddress} />
            <Info icon={<MapPin size={14} />} label="City / State" value={propData?.pickupCity ? `${propData.pickupCity}, ${propData.pickupState}` : "—"} />
            <Info icon={<Phone size={14} />} label="Phone" value={propData?.pickupPhone} />
            <Info icon={<Mail size={14} />} label="Alternate Phone" value={propData?.pickupAltPhone} />
          </InfoCard>
        </Section>

        {/* Delivery */}
        <Section title="Delivery Details">
          <InfoCard>
            <Info icon={<User size={14} />} label="Contact Name" value={propData?.receiverName} />
            <Info icon={<MapPin size={14} />} label="Address" value={propData?.deliveryAddress} />
            <Info icon={<MapPin size={14} />} label="City / State" value={propData?.deliveryCity ? `${propData.deliveryCity}, ${propData.deliveryState}` : "—"} />
            <Info icon={<Phone size={14} />} label="Phone" value={propData?.deliveryPhNo} />
            <Info icon={<Mail size={14} />} label="Alternate Phone" value={propData?.deliveryAlternatePhNo} />
          </InfoCard>
        </Section>

        {/* Package */}
        <Section title="Package Details">
          <InfoCard>
            <Info icon={<Box size={14} />} label="Size" value={propData?.packageSize} />
            <Info icon={<Box size={14} />} label="Weight" value={propData?.parcelWeight ? `${propData.parcelWeight} kg` : "—"} />
            <Info icon={<IndianRupee size={14} />} label="Value" value={propData?.parcelValue ? `₹${propData.parcelValue}` : "—"} />
            <Info icon={<CheckCircle size={14} />} label="Description" value={propData?.parcelContents} />
          </InfoCard>
        </Section>

        {/* Price */}
        <div className="rounded-2xl bg-blue-600 px-4 py-4 text-white shadow-md">
          <p className="text-[11px] uppercase tracking-wide opacity-80">Estimated Price</p>
          <p className="text-2xl font-bold">₹{propData?.priceQuote || "—"}</p>
          <p className="text-[11px] opacity-80">Includes all taxes & fees</p>
        </div>
      </aside>
    );
  }

  // ✅ MODE 2 — Standalone details page (order from navigate state)
  const order = location.state?.order;

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <p className="text-gray-500 text-lg">No order data found.</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
        Go Back
      </button>
    </div>
  );

  // Map order → StepReview format
  const mappedData = {
    senderName: order.pickup?.name || "—",
    pickupAddress: order.pickup?.address || "—",
    pickupCity: order.pickup?.city || "—",
    pickupState: order.pickup?.state || "—",
    pickupPincode: order.pickup?.pincode || "—",
    pickupCountry: order.pickup?.country || "India",
    pickupPhone: order.pickup?.phone || "—",
    pickupAltPhone: order.pickup?.alt_phone || "—",

    receiverName: order.delivery?.name || "—",
    deliveryAddress: order.delivery?.address || "—",
    deliveryCity: order.delivery?.city || "—",
    deliveryState: order.delivery?.state || "—",
    deliveryPincode: order.delivery?.pincode || "—",
    deliveryCountry: order.delivery?.country || "India",
    deliveryPhNo: order.delivery?.phone || "—",
    deliveryAlternatePhNo: order.delivery?.alt_phone || "—",

    packageSize: order.package?.size || "—",
    parcelWeight: order.package?.weight || "—",
    parcelValue: order.package?.value || order.amount || "—",
    parcelContents: order.package?.description || "—",
    parcelType: order.package?.parcelType || "—",
    parcelNotes: order.package?.notes || "—",
    parcelLength: order.package?.length || "—",
    parcelWidth: order.package?.width || "—",
    parcelHeight: order.package?.height || "—",
    price_quote: order.amount || "—",
    status: order.status || DELIVERY_STATUS.CREATED,
    bookingId: order.bookingId || "—",
    trackingId: order.trackingId || "—",
    createdParcelId: order.parcelId || order.id,
    selectedPartnerId: order.traveler?.id || null,
    selectedPartnerName: order.traveler?.name || null,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        ← Back to Orders
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Order Details</h1>
        <p className="text-xs text-gray-400 mt-1">
          Booking Ref: <span className="font-medium text-gray-600">{order.bookingId}</span>
          &nbsp;·&nbsp;
          Status: <span className="font-medium text-blue-600">{order.status}</span>
        </p>
      </div>

      {/* StepReview in readOnly mode */}
      <StepReview
        data={mappedData}
        onBack={() => navigate(-1)}
        onSubmit={() => { }}
        readOnly={true}
      />
    </div>
  );
};

/* ── Sub-components ── */
const Section = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">{title}</p>
    {children}
  </div>
);

const InfoCard = ({ children }) => (
  <div className="rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-3 text-xs text-gray-700 space-y-3">
    {children}
  </div>
);

const Info = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-blue-600 mt-0.5">{icon}</span>
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-xs font-medium text-gray-800 break-words">{value || "—"}</p>
    </div>
  </div>
);

export default OrderSummary;
