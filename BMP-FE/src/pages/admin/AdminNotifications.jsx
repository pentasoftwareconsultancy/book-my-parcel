import { useState } from "react";
import {
  FiPackage, FiCheckCircle, FiAlertCircle,
  FiDollarSign, FiClock,
} from "react-icons/fi";
import { CiUnread } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdNotificationsNone } from "react-icons/md";
import { useNotifications } from "../../core/hooks/useNotification";
import { notificationConfig } from "../../core/constants/Notification.constants";

// ── Time formatter ───────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const iconMap = {
  package: <FiPackage />,
  check:   <FiCheckCircle />,
  alert:   <FiAlertCircle />,
  rupee:   <FiDollarSign />,
};

const colorMap = {
  blue:    "bg-blue-100 text-blue-600",
  green:   "bg-green-100 text-green-600",
  emerald: "bg-emerald-100 text-emerald-600",
  red:     "bg-red-100 text-red-600",
  gray:    "bg-gray-200 text-gray-500",
};

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const config = notificationConfig.admin;

  // ✅ Pass role here — swap to API inside hook later
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications("admin");

  const filtered = notifications.filter((n) => {
    if (activeTab === "all")    return true;
    if (activeTab === "unread") return !n.is_read;
    return config.types[n.type_code]?.tabType === activeTab;
  });

  const summaryCards = [
    { key: "all",     label: "All",      icon: <MdNotificationsNone size={18} />, count: notifications.length,                                                                          bg: "bg-white",       text: "text-gray-700" },
    { key: "unread",  label: "Unread",   icon: <CiUnread size={18} />,            count: unreadCount,                                                                                   bg: "bg-indigo-500",  text: "text-white"    },
    { key: "parcel",  label: "Parcels",  icon: <FiPackage size={16} />,           count: notifications.filter((n) => config.types[n.type_code]?.tabType === "parcel").length,          bg: "bg-indigo-500",  text: "text-white"    },
    { key: "payment", label: "Payments", icon: <FiDollarSign size={16} />,        count: notifications.filter((n) => config.types[n.type_code]?.tabType === "payment").length,         bg: "bg-indigo-500",  text: "text-white"    },
  ];

  if (loading && notifications.length === 0)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500">Manage all platform activity</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-sm text-indigo-600 hover:underline">
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-5">
          {summaryCards.map((card) => (
            <div key={card.key} onClick={() => setActiveTab(card.key)}
              className={`flex flex-col gap-2 p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition ${card.bg}`}>
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
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow divide-y">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">No notifications found</p>
          )}
          {filtered.map((n) => {
            const typeConfig = config.types[n.type_code];
            const icon       = iconMap[typeConfig?.icon] || <FiPackage />;
            const colorClass = !n.is_read ? colorMap[typeConfig?.color] || colorMap.gray : colorMap.gray;

            return (
              <div key={n.id} className={`flex flex-col sm:flex-row gap-4 p-4 sm:p-5 ${!n.is_read ? "bg-blue-50" : "bg-white"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>{icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-800">{n.title}</h3>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => markAsRead(n.id)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full">View Details</button>
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1">
                        <CiUnread size={14} /> Mark Read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)} className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-full">
                      <RiDeleteBin6Line size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 sm:self-start"><FiClock size={12} /> {timeAgo(n.created_at)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;