
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, User, MapPin, Phone, Mail, Box, IndianRupee, Ruler, Calendar, Clock, Truck, FileText, StickyNote } from "lucide-react";
import { DELIVERY_STATUS } from "../../../core/constants/app.constant";
import StepReview from "./StepReview";

// ── helper: resolve a photo field (File/Blob/string) to a preview URL ──────────
function resolvePhotoUrl(photo) {
  if (!photo) return null;
  if (photo instanceof File || photo instanceof Blob) return URL.createObjectURL(photo);
  if (typeof photo === "string" && photo.trim() !== "") {
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
    const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";
    return `${base}${photo.startsWith("/") ? "" : "/"}${photo}`;
  }
  return null;
}

const OrderSummary = ({ data: propData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve all three photo previews
  const photo1 = React.useMemo(() => resolvePhotoUrl(propData?.parcelPhoto1), [propData?.parcelPhoto1]);
  const photo2 = React.useMemo(() => resolvePhotoUrl(propData?.parcelPhoto2), [propData?.parcelPhoto2]);
  const photo3 = React.useMemo(() => resolvePhotoUrl(propData?.parcelPhoto3), [propData?.parcelPhoto3]);
  const photos  = [photo1, photo2, photo3].filter(Boolean);

  // Revoke object URLs on unmount to avoid memory leaks
  React.useEffect(() => {
    return () => {
      [photo1, photo2, photo3].forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [photo1, photo2, photo3]);

  // ── MODE 1 — Sidebar in RequestForm (propData passed as prop) ────────────────
  if (propData) {
    const pickupCityState = [propData?.pickupCity, propData?.pickupState].filter(Boolean).join(", ");
    const pickupPinCountry = [propData?.pickupPincode, propData?.pickupCountry].filter(Boolean).join(", ");
    const deliveryCityState = [propData?.deliveryCity, propData?.deliveryState].filter(Boolean).join(", ");
    const deliveryPinCountry = [propData?.deliveryPincode, propData?.deliveryCountry].filter(Boolean).join(", ");
    const dimensions = [propData?.parcelLength, propData?.parcelWidth, propData?.parcelHeight]
      .every(Boolean)
      ? `${propData.parcelLength} × ${propData.parcelWidth} × ${propData.parcelHeight} in`
      : null;

    return (
      <aside className="bg-white h-fit w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

        {/* Photos — show all uploaded photos or placeholder */}
        <div className="overflow-hidden rounded-xl mb-5 mt-2">
          {photos.length > 0 ? (
            <div className={`grid gap-1 ${photos.length === 1 ? "grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {photos.map((src, i) => (
                <img key={i} src={src} alt={`Parcel photo ${i + 1}`} className="w-full h-28 object-cover rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="w-full h-28 rounded-xl bg-gray-100 flex items-center justify-center">
              <Box size={32} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Pickup */}
        <Section title="Pickup Details">
          <InfoCard>
            <Info icon={<User size={14} />}        label="Contact Name"    value={propData?.senderName} />
            <Info icon={<MapPin size={14} />}       label="Address"         value={propData?.pickupAddress} />
            <Info icon={<MapPin size={14} />}       label="City / State"    value={pickupCityState || null} />
            <Info icon={<MapPin size={14} />}       label="Pincode / Country" value={pickupPinCountry || null} />
            <Info icon={<Phone size={14} />}        label="Phone"           value={propData?.pickupPhone} />
            <Info icon={<Mail size={14} />}         label="Alternate Phone" value={propData?.pickupAltPhone} />
            <Info icon={<CheckCircle size={14} />}  label="Aadhaar"         value={propData?.pickupAadhaar} />
         <Info
  icon={<Calendar size={14} />}
  label="Pickup Date"
  value={
    propData?.pickupDate
      ? new Date(propData.pickupDate).toLocaleDateString("en-GB")
      : "-"
  }
/>
            <Info icon={<Clock size={14} />}        label="Pickup Time"     value={propData?.pickupTime} />
          </InfoCard>
        </Section>

        {/* Delivery */}
        <Section title="Delivery Details">
          <InfoCard>
            <Info icon={<User size={14} />}   label="Contact Name"      value={propData?.receiverName} />
            <Info icon={<MapPin size={14} />}  label="Address"           value={propData?.deliveryAddress} />
            <Info icon={<MapPin size={14} />}  label="City / State"      value={deliveryCityState || null} />
            <Info icon={<MapPin size={14} />}  label="Pincode / Country" value={deliveryPinCountry || null} />
            <Info icon={<Phone size={14} />}   label="Phone"             value={propData?.deliveryPhNo} />
            <Info icon={<Mail size={14} />}    label="Alternate Phone"   value={propData?.deliveryAlternatePhNo} />
          </InfoCard>
        </Section>

        {/* Package */}
        <Section title="Package Details">
          <InfoCard>
            <Info icon={<Box size={14} />}          label="Size"          value={propData?.packageSize} />
            <Info icon={<Box size={14} />}          label="Weight"        value={propData?.parcelWeight ? `${propData.parcelWeight} kg` : null} />
            <Info icon={<Ruler size={14} />}        label="Dimensions"    value={dimensions} />
            <Info icon={<IndianRupee size={14} />}  label="Parcel Value" value={propData?.parcelValue ? `₹${propData.parcelValue}` : null} />
            <Info icon={<FileText size={14} />}     label="Type"          value={propData?.parcelType} />
            <Info icon={<CheckCircle size={14} />}  label="Description"   value={propData?.parcelContents} />
            <Info icon={<StickyNote size={14} />}   label="Notes"         value={propData?.parcelNotes} />
            <Info icon={<Truck size={14} />}        label="Vehicle Type"  value={propData?.vehicleType} />
          </InfoCard>
        </Section>

        {/* Price */}
        <div className="rounded-2xl bg-blue-600 px-4 py-4 text-white shadow-md">
          <p className="text-[11px] uppercase tracking-wide opacity-80">Estimated Price</p>
          <p className="text-2xl font-bold">{propData?.priceQuote ? `₹${propData.priceQuote}` : "—"}</p>
          {propData?.deliverySpeed && (
            <p className="text-[11px] opacity-80 mt-1">Speed: {propData.deliverySpeed}</p>
          )}
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
  <div className="rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-3 text-xs text-gray-700 space-y-3 overflow-hidden min-w-0">
    {children}
  </div>
);

const Info = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-2">
    <span className="text-blue-600 mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-xs font-medium text-gray-800 break-all whitespace-pre-wrap">{value || "—"}</p>
    </div>
  </div>
);

export default OrderSummary;
