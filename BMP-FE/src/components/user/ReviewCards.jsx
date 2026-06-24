/* Shared display components for StepReview */
import { useState } from "react";

// Simple photo slider for parcel photos
function PhotoSlider({ photos }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative">
      <img
        src={photos[current]}
        alt={`parcel-photo-${current + 1}`}
        className="w-full max-h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
      />
      <div className="flex justify-between items-center mt-2">
        <button
          type="button"
          onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 disabled:opacity-40"
          disabled={photos.length <= 1}
        >
          ‹ Prev
        </button>
        <span className="text-xs text-gray-400">{current + 1} / {photos.length}</span>
        <button
          type="button"
          onClick={() => setCurrent((c) => (c + 1) % photos.length)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 disabled:opacity-40"
          disabled={photos.length <= 1}
        >
          Next ›
        </button>
      </div>
      {/* Dot indicators */}
      <div className="flex justify-center gap-1 mt-1">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-blue-500 scale-125" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}

const COLOR_MAP = {
  primary: { border: "border-blue-500" },
  success: { border: "border-emerald-500" },
  error:   { border: "border-red-400" },
  info:    { border: "border-sky-400" },
  gray:    { border: "border-gray-200" },
  emerald: { border: "border-emerald-200" },
};

export const Card = ({ title, color = "gray", children, greenBg = false }) => {
  const styles = COLOR_MAP[color] || COLOR_MAP.gray;
  return (
    <div className={`rounded-xl border ${styles.border} p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.10)] ${greenBg ? "bg-emerald-50" : "bg-white"}`}>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      {children}
    </div>
  );
};

export const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-gray-900">{value || "—"}</p>
  </div>
);

export const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm text-gray-700">
    <span>{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

export const AddressCard = ({ address, label }) => {
  const isPickup = label === "Pickup";
  const street   = address?.address || address?.street || "";
  const city     = address?.city || "";
  const state    = address?.state || "";
  const pincode  = address?.pincode || "";
  const phone    = address?.phone || "";
  const altPhone = address?.alt_phone || "-";
  const name     = address?.name || "";

  const parts = [street, city, state].filter(Boolean);
  const unique = parts.filter((p, i) => p !== parts[i - 1]);
  const fullAddress = unique.join(", ") + (pincode ? ` - ${pincode}` : "");

  return (
    <>
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isPickup ? "bg-emerald-500" : "bg-red-500"}`}>
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{fullAddress || "—"}</p>
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-3">Contact Summary</p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <Info label="Phone number" value={phone || "—"} />
          <Info label="Alternate Phone" value={altPhone} />
          <Info label="Contact name" value={name || "—"} />
        </div>
      </div>
    </>
  );
};

export const PackageInfo = ({ parcel }) => (
  <div className="space-y-4 text-sm">
    <div className="grid grid-cols-3 gap-4">
      <Info label="Package Size"  value={parcel.package_size} />
      <Info label="Weight"        value={parcel.weight ? `${parcel.weight} kg` : "—"} />
      <Info label="Package value" value={parcel.value ? `₹${parcel.value}` : "—"} />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <Info label="Est. Delivery" value={parcel.est_delivery || "3–5 Days"} />
      <Info label="Description"   value={parcel.description} />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-0.5">
        <p className="text-xs text-gray-400">Dimensions (in)</p>
        <p className="font-semibold text-gray-900 text-xs">L: {parcel.length || "—"} in</p>
        <p className="font-semibold text-gray-900 text-xs">W: {parcel.width  || "—"} in</p>
        <p className="font-semibold text-gray-900 text-xs">H: {parcel.height || "—"} in</p>
      </div>
      <Info label="Additional note" value={parcel.notes} />
      <Info label="Parcel type"     value={parcel.parcel_type} />
    </div>
    {parcel.photos?.length > 0 && (
      <div className="pt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium mb-2">Parcel Photos</p>
        {parcel.photos.length === 1 ? (
          <img src={parcel.photos[0]} alt="parcel-photo-1"
            className="w-full max-h-48 object-cover rounded-lg border border-gray-200 shadow-sm" />
        ) : (
          <PhotoSlider photos={parcel.photos} />
        )}
      </div>
    )}
  </div>
);

export const TravelerCard = ({ traveler }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        {traveler.photo ? (
          <img src={traveler.photo} alt={traveler.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
        ) : (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base ${traveler.avatarBg || "bg-gradient-to-br from-blue-400 to-blue-600"}`}>
            {traveler.name?.charAt(0)?.toUpperCase() || "T"}
          </div>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>
      <p className="text-sm font-bold text-gray-900">Traveler details</p>
    </div>
    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
      <Info label="Name"    value={traveler.name} />
      <Info label="Vehicle" value={traveler.vehicleType || traveler.vehicle_type} />
      <Info label="Time"    value={traveler.duration || traveler.time} />
    </div>
    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
      <Info label="Route"        value={traveler.from && traveler.to ? `${traveler.from} To ${traveler.to}` : traveler.route || "—"} />
      <Info label="Est. Delivery" value={traveler.estDelivery || traveler.est_delivery || traveler.duration || "3–5 Days"} />
      <Info label="Price"        value={traveler.price ? `₹${traveler.price}` : "—"} />
    </div>
  </div>
);
