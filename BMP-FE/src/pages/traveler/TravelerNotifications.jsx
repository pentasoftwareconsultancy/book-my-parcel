import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTruck, FiCheckCircle, FiAlertCircle,
  FiPackage,  FiClock,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { CiUnread } from "react-icons/ci";
// import { RiDeleteBin6Line } from "react-icons/ri";
import { MdNotificationsNone } from "react-icons/md";
import { useNotifications } from "../../core/hooks/useNotification";
import { notificationConfig } from "../../core/constants/Notification.constants";
import RoutePath from "../../core/constants/routes.constant";

// ── Time formatter ───────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  // Parse as UTC if no timezone info, then compare to local now
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Icon map ────────────────────────────────────────────────
const iconMap = {
  package: <FiPackage />,
  truck:   <FiTruck />,
  check:   <FiCheckCircle />,
  alert:   <FiAlertCircle />,
  clock:   <FiClock />,
  rupee:   <FaRupeeSign />,
};

// ── Color map ───────────────────────────────────────────────
const colorMap = {
  blue:    "bg-blue-100 text-blue-600",
  green:   "bg-green-100 text-green-600",
  emerald: "bg-emerald-100 text-emerald-600",
  red:     "bg-red-100 text-red-600",
  orange:  "bg-orange-100 text-orange-600",
  gray:    "bg-gray-200 text-gray-500",
};

// ── Summary card data ────────────────────────────────────────
const getSummaryCards = (notifications, unreadCount) => [
  {
    key: "all",
    label: "All Notifications",
    icon: <MdNotificationsNone size={18} />,
    count: notifications.length,
    bg: "bg-white",
    text: "text-gray-700",
  },
  {
    key: "unread",
    label: "Unread",
    icon: <CiUnread size={18} />,
    count: unreadCount,
    bg: "bg-indigo-500",
    text: "text-white",
  },
  {
    key: "deliveries",
    label: "Deliveries",
    icon: <FiTruck size={16} />,
    count: notifications.filter(
      (n) => notificationConfig.traveller.types[n.type_code]?.tabType === "deliveries"
    ).length,
    bg: "bg-indigo-500",
    text: "text-white",
  },
  {
    key: "earnings",
    label: "Earnings",
    icon: <FaRupeeSign size={16} />,
    count: notifications.filter(
      (n) => notificationConfig.traveller.types[n.type_code]?.tabType === "earnings"
    ).length,
    bg: "bg-indigo-500",
    text: "text-white",
  },
];

// ────────────────────────────────────────────────────────────
const TravellerNotifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const config = notificationConfig.traveller;
  const {
    notifications, loading, unreadCount,
    markAsRead, markAllAsRead, deleteNotification,
  } = useNotifications("traveller");

  // Navigate to the relevant page based on notification type and meta
  const handleViewDetails = (n) => {
    markAsRead(n.id);
    const meta = n.meta || {};
    if (meta.booking_id) {
      navigate(`${RoutePath.TRAVELER_BASE}/parcel/${meta.booking_id}`);
    } else if (meta.parcel_id) {
      navigate(`${RoutePath.TRAVELER_BASE}/parcel/${meta.parcel_id}`);
    } else {
      navigate(RoutePath.TRAVELER_DELIVERIES);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "all")    return true;
    if (activeTab === "unread") return !n.is_read;
    return config.types[n.type_code]?.tabType === activeTab;
  });

  const summaryCards = getSummaryCards(notifications, unreadCount);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500">Your delivery activities and earnings</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 hover:underline"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-5">
          {summaryCards.map((card) => (
            <div
              key={card.key}
              onClick={() => setActiveTab(card.key)}
              className={`flex flex-col gap-2 p-4 rounded-xl shadow cursor-pointer
                hover:shadow-md transition ${card.bg}`}
            >
              <p className={`text-sm ${card.text}`}>{card.label}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xl ${card.text}`}>{card.icon}</span>
                <span className={`text-lg font-semibold ${card.text}`}>{card.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {config.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                ${activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-xl shadow divide-y">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">No notifications found</p>
          )}
          {filtered.map((n) => {
            const typeConfig = config.types[n.type_code];
            const icon = iconMap[typeConfig?.icon] || <FiPackage />;
            const colorClass = !n.is_read
              ? colorMap[typeConfig?.color] || colorMap.gray
              : colorMap.gray;

            return (
              <div
                key={n.id}
                className={`flex flex-col sm:flex-row gap-4 p-4 sm:p-5
                  ${!n.is_read ? "bg-blue-50" : "bg-white"}`}
              >
                {/* Icon */}
                <div className={`h-10 w-10 rounded-full flex items-center
                  justify-center flex-shrink-0 ${colorClass}`}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-800">{n.title}</h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>

                  {/* Traveller-specific parcel tags (shown for new delivery requests) */}
                  {n.type_code === "parcel_created" && n.meta && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {n.meta.parcel_id}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {n.meta.route}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        ₹{n.meta.earnings}
                      </span>
                      {n.meta.distance && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {n.meta.distance}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pickup reminder tags */}
                  {n.type_code === "pickup_reminder" && n.meta && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {n.meta.parcel_id}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {n.meta.address}
                      </span>
                    </div>
                  )}

                  {/* Payment received tags */}
                  {n.type_code === "payment_received" && n.meta && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        ₹{n.meta.amount}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {n.meta.parcel_id}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* Accept button only for new delivery requests */}
                    {n.type_code === "parcel_created" && !n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded-full"
                      >
                        Accept
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(n)}
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full"
                    >
                      View Details
                    </button>
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1
                          rounded-full flex items-center gap-1"
                      >
                        <CiUnread size={14} /> Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-full"
                    >
                      <RiDeleteBin6Line size={14} />
                    </button>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-xs text-gray-400 sm:self-start">
                  <FiClock size={12} /> {timeAgo(n.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TravellerNotifications;