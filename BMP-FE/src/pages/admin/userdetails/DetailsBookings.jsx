import { useState } from "react";
import { FiX, FiMapPin, FiUser, FiCheckCircle, FiClock, FiPhone } from "react-icons/fi";
import { LuPackage, LuTruck } from "react-icons/lu";
import { MdOutlineTimeline, MdSupportAgent } from "react-icons/md";
import { TbNavigation } from "react-icons/tb";
import { BsCurrencyRupee } from "react-icons/bs";
import BookingStatusBadge from "../../../core/common/BookingStatusBadge";

const formatStatus = (s) => s?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Unknown";

const paymentStatusStyle = {
  Paid:     "bg-green-100 text-green-600",
  Refunded: "bg-yellow-100 text-yellow-600",
  Pending:  "bg-orange-100 text-orange-600",
};

const TABS = ["Overview", "Tracking", "Timeline", "Support"];

/* ── Timeline steps derived from booking status ─────────────────────── */
const getTimelineSteps = (rawStatus) => {
  const all = [
    { key: "CREATED",    label: "Booking Created",      icon: <LuPackage size={14} /> },
    { key: "MATCHING",   label: "Finding Partner",       icon: <FiUser size={14} /> },
    { key: "CONFIRMED",  label: "Partner Confirmed",     icon: <FiCheckCircle size={14} /> },
    { key: "PICKUP",     label: "Parcel Picked Up",      icon: <FiMapPin size={14} /> },
    { key: "IN_TRANSIT", label: "In Transit",            icon: <LuTruck size={14} /> },
    { key: "DELIVERED",  label: "Delivered",             icon: <FiCheckCircle size={14} /> },
  ];
  const order = all.map(s => s.key);
  const currentIdx = order.indexOf(rawStatus);
  return all.map((step, i) => ({
    ...step,
    done:    rawStatus === "CANCELLED" ? false : i <= currentIdx,
    active:  i === currentIdx && rawStatus !== "CANCELLED",
    cancelled: rawStatus === "CANCELLED",
  }));
};

/* ── Modal ──────────────────────────────────────────────────────────── */
export const BookingModal = ({ booking, onClose }) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const steps = getTimelineSteps(booking.rawStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-2.5">
              <LuPackage size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white text-xl font-bold">{booking.id}</h2>
                <BookingStatusBadge status={booking.rawStatus} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  ₹{booking.amount}
                </span>
                <span>Created: {booking.createdAt}</span>
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
                activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-gray-50">

          {/* ── OVERVIEW ── */}
          {activeTab === "Overview" && (
            <>
              {/* Route */}
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

              {/* Sender + Partner */}
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
                    <LuTruck className="text-purple-500" size={16} /> Delivery Partner
                  </h3>
                  <Field label="Name"  value={booking.partner.name} />
                  <Field label="Phone" value={booking.partner.phone} />
                </div>
              </div>

              {/* Parcel + Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                    <LuPackage className="text-orange-500" size={16} /> Parcel Details
                  </h3>
                  <Field label="Type"   value={booking.parcel.type} />
                  <Field label="Weight" value={booking.parcel.weight} />
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                    <BsCurrencyRupee className="text-green-500" size={16} /> Payment Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    <PayRow label="Total Amount"    value={`₹${booking.payment.total}`} />
                    <PayRow label="Platform Fee"    value={`₹${booking.payment.platformFee}`} />
                    <PayRow label="Partner Earning" value={`₹${booking.payment.partnerEarning}`} />
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                      <span className="font-semibold text-gray-700">Payment Status</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${paymentStatusStyle[booking.payment.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                        {booking.payment.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TRACKING ── */}
          {activeTab === "Tracking" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiMapPin className="text-blue-500" size={18} /> Live Tracking
              </h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <span className="text-sm text-blue-700">Current Status: </span>
                <BookingStatusBadge status={booking.rawStatus} />
              </div>
              <div className="space-y-3">
                <TrackRow icon={<FiMapPin size={14} />} color="bg-green-500" label="Pickup" value={booking.pickup.label} />
                <div className="ml-5 border-l-2 border-dashed border-gray-200 h-6" />
                <TrackRow icon={<LuTruck size={14} />} color="bg-blue-500" label="In Transit" value={booking.rawStatus === "IN_TRANSIT" || booking.rawStatus === "DELIVERED" ? "En route to destination" : "Pending"} />
                <div className="ml-5 border-l-2 border-dashed border-gray-200 h-6" />
                <TrackRow icon={<FiCheckCircle size={14} />} color={booking.rawStatus === "DELIVERED" ? "bg-green-500" : "bg-gray-300"} label="Delivered" value={booking.drop.label} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Booking ID</p>
                  <p className="font-semibold text-gray-800">{booking.id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Partner</p>
                  <p className="font-semibold text-gray-800">{booking.partner.name || "Not Assigned"}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── TIMELINE ── */}
          {activeTab === "Timeline" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <MdOutlineTimeline className="text-purple-500" size={18} /> Booking Timeline
              </h3>
              <div className="relative">
                {steps.map((step, i) => (
                  <div key={step.key} className="flex gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                        step.cancelled ? "bg-red-400" : step.done ? "bg-green-500" : "bg-gray-200"
                      }`}>
                        {step.icon}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${step.done && !step.cancelled ? "bg-green-300" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-semibold ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {step.done ? (step.active ? "Current status" : "Completed") : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
                {booking.rawStatus === "CANCELLED" && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0">
                      <FiX size={14} />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-red-600">Booking Cancelled</p>
                      <p className="text-xs text-gray-400 mt-0.5">{booking.createdAt}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SUPPORT ── */}
          {activeTab === "Support" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MdSupportAgent className="text-indigo-500" size={18} /> Support Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Booking Reference</p>
                    <p className="font-bold text-gray-800">{booking.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Current Status</p>
                    <BookingStatusBadge status={booking.rawStatus} />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Sender</p>
                    <p className="font-semibold text-gray-800">{booking.sender.name || "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><FiPhone size={10} /> {booking.sender.phone || "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Delivery Partner</p>
                    <p className="font-semibold text-gray-800">{booking.partner.name || "Not Assigned"}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><FiPhone size={10} /> {booking.partner.phone || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-sm text-indigo-700">
                <p className="font-semibold mb-1">Need Help?</p>
                <p className="text-xs">For escalations contact: <span className="font-bold">support@bookmyparcel.com</span></p>
              </div>
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

const TrackRow = ({ icon, color, label, value }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

/* ── Booking list card ───────────────────────────────────────────────── */
const BookingCard = ({ booking, onOpen }) => (
  <div onClick={() => onOpen(booking)}
    className="flex items-center justify-between bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm transition cursor-pointer px-4 py-3 rounded-xl">
    <div className="flex items-center gap-3">
      <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
        <LuPackage size={18} />
      </div>
      <div>
        <p className="font-bold text-sm text-gray-900">{booking.id}</p>
        <p className="text-xs text-gray-400 mb-1">{booking.createdAt}</p>
        <div className="text-xs text-gray-500 space-y-0.5">
          <p className="flex items-center gap-1.5"><FiMapPin className="text-green-500 shrink-0" size={12} />{booking.pickup.label}</p>
          <p className="flex items-center gap-1.5"><FiMapPin className="text-red-400 shrink-0" size={12} />{booking.drop.label}</p>
          {booking.partner?.name && booking.partner.name !== "Not Assigned" && (
            <p className="flex items-center gap-1.5"><LuTruck className="text-purple-400 shrink-0" size={12} />Partner: {booking.partner.name}</p>
          )}
        </div>
      </div>
    </div>
    <div className="text-right flex flex-col items-end gap-1.5 shrink-0 ml-4">
      <span className="font-bold text-sm text-gray-900">₹{booking.amount || "—"}</span>
      <BookingStatusBadge status={booking.rawStatus} />
    </div>
  </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
const DetailsBookings = ({ bookings = [] }) => {
  const [selected, setSelected] = useState(null);

  const mapped = bookings.map(b => ({
    id:        b.booking_ref || b.parcel_ref || b.booking_id || "—",
    rawStatus: b.booking_status,
    amount:    b.amount || 0,
    createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—",
    pickup:    { label: [b.pickup_city, b.pickup_state].filter(Boolean).join(", ") || b.pickup_address || "—" },
    drop:      { label: [b.delivery_city, b.delivery_state].filter(Boolean).join(", ") || b.delivery_address || "—" },
    sender:    { name: b.sender_name || "—", email: b.sender_email || "—", phone: b.sender_phone || "—" },
    partner:   { name: b.partner_name || "Not Assigned", phone: b.partner_phone || "—" },
    parcel:    { type: b.parcel_type || "—", weight: b.weight ? `${b.weight} kg` : "—" },
    payment:   {
      total:          b.amount || 0,
      platformFee:    Math.round((b.amount || 0) * 0.1),
      partnerEarning: Math.round((b.amount || 0) * 0.9),
      paymentStatus:  "Paid",
    },
  }));

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-800 mb-4">Booking History ({mapped.length})</h3>
      {mapped.length === 0 && <p className="text-gray-400 text-sm">No bookings found.</p>}
      <div className="space-y-3">
        {mapped.map((b, i) => <BookingCard key={i} booking={b} onOpen={setSelected} />)}
      </div>
      {selected && <BookingModal booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default DetailsBookings;
