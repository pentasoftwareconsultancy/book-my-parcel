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
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Activity Logs</h2>
        <span className="text-[10px] sm:text-xs text-gray-400">{activities.length} events</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <FiActivity size={32} className="sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2 sm:mb-3" />
          <p className="text-gray-400 text-xs sm:text-sm">No activity found for this user.</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-2 sm:gap-4 bg-white border border-gray-100 p-3 sm:p-4 rounded-xl hover:shadow-sm transition">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg flex-shrink-0 ${a.color}`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-xs sm:text-sm">{a.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{a.sub}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                <FiClock size={10} className="sm:w-[11px] sm:h-[11px]" />
                <span className="hidden sm:inline">{a.time}</span>
                <span className="sm:hidden">{a.time.split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailsActivity;
