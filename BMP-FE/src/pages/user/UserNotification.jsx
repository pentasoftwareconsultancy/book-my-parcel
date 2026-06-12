
import { useState } from "react";
import {
  FiTruck, FiCheckCircle, FiPackage,
  FiDollarSign, FiClock,
} from "react-icons/fi";
import { IoGiftOutline } from "react-icons/io5";
import { CiUnread } from "react-icons/ci";
// import { RiDeleteBin6Line } from "react-icons/ri";
import { MdNotificationsNone } from "react-icons/md";

import { useNotifications } from "../../core/hooks/useNotification";
import { notificationConfig } from "../../core/constants/Notification.constants";

const iconMap = {
  truck:   <FiTruck />,
  check:   <FiCheckCircle />,
  package: <FiPackage />,
  rupee:   <FiDollarSign />,
  gift:    <IoGiftOutline />,
};

const colorMap = {
  blue:   "bg-blue-100 text-blue-600",
  green:  "bg-green-100 text-green-600",
  indigo: "bg-indigo-100 text-indigo-600",
  purple: "bg-purple-100 text-purple-600",
  gray:   "bg-gray-200 text-gray-500",
};

// ✅ IMPROVED TIME
const timeAgo = (dateStr) => {
  if (!dateStr) return "";

  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day ago`;

  return new Date(dateStr).toLocaleDateString();
};

// ✅ GROUPING FUNCTION
const groupNotificationsByDate = (notifications) => {
  const groups = {
    today: [],
    yesterday: [],
    older: [],
  };

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  notifications.forEach((n) => {
    const created = new Date(n.created_at || n.createdAt);

    if (created.toDateString() === today.toDateString()) {
      groups.today.push(n);
    } else if (created.toDateString() === yesterday.toDateString()) {
      groups.yesterday.push(n);
    } else {
      groups.older.push(n);
    }
  });

  return groups;
};

const UserNotifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const config = notificationConfig.user;

  const {
    notifications = [],
    loading,
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications("user");

  // ✅ FILTER
  const filtered = (notifications || []).filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    return config.types[n.type_code]?.tabType === activeTab;
  });
  // ✅ GROUPED DATA
  const grouped = groupNotificationsByDate(filtered);

  // ✅ SUMMARY
  const summaryCards = [
    {
      key: "all",
      label: "All Notifications",
      icon: <MdNotificationsNone size={18} />,
      count: notifications.length || 0,
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
      key: "bookings",
      label: "Bookings",
      icon: <FiTruck size={16} />,
      count: notifications.filter(
        (n) => config.types[n.type_code]?.tabType === "bookings"
      ).length,
      bg: "bg-indigo-500",
      text: "text-white",
    },
    {
      key: "offers",
      label: "Offers",
      icon: <IoGiftOutline size={16} />,
      count: notifications.filter(
        (n) => config.types[n.type_code]?.tabType === "offers"
      ).length,
      bg: "bg-indigo-500",
      text: "text-white",
    },
  ];

  if (loading && notifications.length === 0) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500">
              Stay updated on your delivery activities
            </p>
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

        {/* SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-5">
          {summaryCards.map((card) => (
            <div
              key={card.key}
              onClick={() => setActiveTab(card.key)}
              className={`flex flex-col gap-2 p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition ${card.bg}`}
            >
              <p className={`text-sm ${card.text}`}>{card.label}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xl ${card.text}`}>{card.icon}</span>
                <span className={`text-lg font-semibold ${card.text}`}>
                  {card.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2 flex-wrap mb-4">
          {config.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
              ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow divide-y">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              No notifications found
            </p>
          )}

          {["today", "yesterday", "older"].map((section) => {
            const sectionData = grouped[section];
            if (!sectionData.length) return null;

            const title =
              section === "today"
                ? "Today"
                : section === "yesterday"
                ? "Yesterday"
                : "Older";

            return (
              <div key={section}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  {title}
                </div>

                {sectionData.map((n) => {
                  const typeConfig = config.types[n.type_code] || {};
                  const icon = iconMap[typeConfig.icon] || <FiPackage />;
                  const colorClass = !n.is_read
                    ? colorMap[typeConfig.color] || colorMap.blue
                    : colorMap.gray;

                  return (
                    <div
                      key={n.id}
                      className={`flex flex-col sm:flex-row gap-4 p-4 ${
                        !n.is_read ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}
                      >
                        {icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-semibold">{n.title}</h3>
                          {!n.is_read && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                          )}
                        </div>

                        <p className="text-sm text-gray-500">{n.message}</p>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full"
                          >
                            View
                          </button>

                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="text-red-500"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <FiClock />
                        {timeAgo(n.created_at || n.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;

