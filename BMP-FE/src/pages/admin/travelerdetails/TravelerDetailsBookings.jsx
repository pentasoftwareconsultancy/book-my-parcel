import { useState } from "react";
import { FiX, FiMapPin, FiUser } from "react-icons/fi";
import { LuPackage, LuTruck } from "react-icons/lu";
import { MdOutlineTimeline, MdSupportAgent } from "react-icons/md";
import { TbNavigation } from "react-icons/tb";
import { BsCurrencyRupee } from "react-icons/bs";
import BookingStatusBadge from "../../../core/common/BookingStatusBadge";

const TABS = ["Overview", "Tracking", "Timeline", "Support"];

/* ── Modal ─────────────────────────────────────────────────────────────── */
export const DeliveryModal = ({ booking, onClose }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-2.5">
              <LuTruck size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white text-xl font-bold">{booking.id}</h2>
                <BookingStatusBadge status={booking.rawStatus} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-white/80 text-sm">
                <span>₹{booking.amount}</span>
                <span>{booking.createdAt}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition">
            <FiX size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-white">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition -mb-px ${
                activeTab === tab ? "border-purple-500 text-purple-500" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-gray-50">

          {activeTab === "Overview" && (
            <>
              {/* Route Details */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                  <TbNavigation className="text-blue-500" size={18} /> Route Details
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-green-500 rounded-xl p-2 mt-0.5"><FiMapPin className="text-white" size={16} /></div>
                    <div>
                      <p className="text-xs text-gray-400">Pickup Location</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.pickup.label}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-red-500 rounded-xl p-2 mt-0.5"><FiMapPin className="text-white" size={16} /></div>
                    <div>
                      <p className="text-xs text-gray-400">Drop Location</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.drop.label}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sender + Earnings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                    <FiUser className="text-blue-500" size={16} /> Sender Details
                  </h3>
                  <Field label="Name"  value={booking.sender.name} />
                  <Field label="Email" value={booking.sender.email} />
                  <Field label="Phone" value={booking.sender.phone} />
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                    <BsCurrencyRupee className="text-green-500" size={16} /> Earnings Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    <PayRow label="Total Amount"     value={`₹${booking.payment.total}`} />
                    <PayRow label="Platform Fee"     value={`₹${booking.payment.platformFee}`} />
                    <PayRow label="Traveler Earning" value={`₹${booking.payment.partnerEarning}`} />
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                      <span className="font-semibold text-gray-700">Payment Status</span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-600">Paid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parcel Details */}
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                  <LuPackage className="text-orange-500" size={16} /> Parcel Details
                </h3>
                <div className="grid grid-cols-2 gap-y-3">
                  <Field label="Type"   value={booking.parcel.type} />
                  <Field label="Weight" value={booking.parcel.weight} />
                </div>
              </div>
            </>
          )}

          {activeTab !== "Overview" && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              {activeTab === "Tracking"  && <FiMapPin size={36} className="mb-3 text-gray-300" />}
              {activeTab === "Timeline"  && <MdOutlineTimeline size={36} className="mb-3 text-gray-300" />}
              {activeTab === "Support"   && <MdSupportAgent size={36} className="mb-3 text-gray-300" />}
              <p className="text-sm">{activeTab} coming soon</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────────────────────────── */
const Field = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
  </div>
);

const PayRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-gray-600">
    <span>{label}</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

/* ── Delivery list card ──────────────────────────────────────────────── */
const DeliveryCard = ({ booking, onOpen }) => (
  <div onClick={() => onOpen(booking)}
    className="flex items-center justify-between bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm transition cursor-pointer px-4 py-3 rounded-xl">
    <div className="flex items-center gap-3">
      <div className="bg-purple-500 text-white w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
        <LuTruck size={18} />
      </div>
      <div>
        <p className="font-bold text-sm text-gray-900">{booking.id}</p>
        <p className="text-xs text-gray-400 mb-1">{booking.createdAt}</p>
        <div className="text-xs text-gray-500 space-y-0.5">
          <p className="flex items-center gap-1.5"><FiMapPin className="text-green-500 shrink-0" size={12} />{booking.pickup.label}</p>
          <p className="flex items-center gap-1.5"><FiMapPin className="text-red-400 shrink-0" size={12} />{booking.drop.label}</p>
          {booking.sender?.name && booking.sender.name !== "Not Assigned" && (
            <p className="flex items-center gap-1.5"><FiUser className="text-blue-400 shrink-0" size={12} />Sender: {booking.sender.name}</p>
          )}
        </div>
      </div>
    </div>
    <div className="text-right flex flex-col items-end gap-1.5 shrink-0 ml-4">
      <p className="font-bold text-sm text-gray-900">₹{booking.amount || "—"}</p>
      <BookingStatusBadge status={booking.rawStatus} />
    </div>
  </div>
);

/* ── Main page ───────────────────────────────────────────────────────── */
const TravelerDetailsBookings = ({ bookings = [] }) => {
  const [selected, setSelected] = useState(null);

  const mapped = bookings.map(b => ({
    id:        b.booking_ref || b.parcel_ref || b.booking_id || "—",
    rawStatus: b.booking_status,
    amount:    b.amount || 0,
    createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—",
    pickup:    { label: [b.pickup_city, b.pickup_state].filter(Boolean).join(", ") || b.pickup_address || "—" },
    drop:      { label: [b.delivery_city, b.delivery_state].filter(Boolean).join(", ") || b.delivery_address || "—" },
    sender:    { name: b.sender_name || "—", email: b.sender_email || "—", phone: b.sender_phone || "—" },
    parcel:    { type: b.parcel_type || "—", weight: b.weight ? `${b.weight} kg` : "—" },
    payment:   { total: b.amount || 0, platformFee: Math.round((b.amount || 0) * 0.1), partnerEarning: Math.round((b.amount || 0) * 0.9) },
  }));

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-800 mb-4">Delivery History ({mapped.length})</h3>
      {mapped.length === 0 && <p className="text-gray-400 text-sm">No deliveries found.</p>}
      <div className="space-y-3">
        {mapped.map((b, i) => <DeliveryCard key={i} booking={b} onOpen={setSelected} />)}
      </div>
      {selected && <DeliveryModal booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default TravelerDetailsBookings;
