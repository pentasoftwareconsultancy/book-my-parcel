import React from "react";
import { FiPackage, FiCheckCircle, FiXCircle, FiClock, FiActivity } from "react-icons/fi";

const statusIcon = {
  DELIVERED:  { icon: <FiCheckCircle size={16} />, color: "bg-green-100 text-green-600" },
  CANCELLED:  { icon: <FiXCircle size={16} />,     color: "bg-red-100 text-red-500" },
  IN_TRANSIT: { icon: <FiPackage size={16} />,     color: "bg-blue-100 text-blue-600" },
  CONFIRMED:  { icon: <FiPackage size={16} />,     color: "bg-purple-100 text-purple-600" },
  CREATED:    { icon: <FiPackage size={16} />,     color: "bg-gray-100 text-gray-500" },
  MATCHING:   { icon: <FiActivity size={16} />,    color: "bg-orange-100 text-orange-500" },
};

const DetailsActivity = ({ bookings = [], user = {} }) => {
  // Derive activity entries from real bookings
  const activities = bookings.map(b => {
    const status = b.booking_status?.toUpperCase() || "CREATED";
    const ref    = b.booking_ref || b.parcel_ref || (b.booking_id ? b.booking_id.slice(0, 8) : "—");
    const route  = [b.pickup_city, b.delivery_city].filter(Boolean).join(" → ") || "—";
    const cfg    = statusIcon[status] || statusIcon.CREATED;

    let title = `Booking ${ref}`;
    if (status === "DELIVERED")  title = `Delivery completed — ${ref}`;
    if (status === "CANCELLED")  title = `Booking cancelled — ${ref}`;
    if (status === "IN_TRANSIT") title = `Parcel in transit — ${ref}`;
    if (status === "CONFIRMED")  title = `Booking confirmed — ${ref}`;
    if (status === "CREATED")    title = `Booking created — ${ref}`;

    return {
      title,
      sub: route,
      time: b.createdAt ? new Date(b.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—",
      icon: cfg.icon,
      color: cfg.color,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Activity Logs</h2>
        <span className="text-xs text-gray-400">{activities.length} events</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <FiActivity size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No activity found for this user.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-4 bg-white border border-gray-100 p-4 rounded-xl hover:shadow-sm transition">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 ${a.color}`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.sub}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <FiClock size={11} />
                {a.time}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailsActivity;
