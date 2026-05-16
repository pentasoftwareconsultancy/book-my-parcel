import React, { useState, useEffect } from "react";
import { FiMail, FiMessageSquare, FiBell, FiAlertCircle } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError } from "../../core/utils/toast.util";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-200"></div>
    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></span>
  </label>
);

const SettingNotify = () => {
  const [settings, setSettings] = useState({
    email_notifications_enabled: true,
    sms_notifications_enabled: true,
    push_notifications_enabled: true,
    admin_alerts_enabled: true,
  });

  useEffect(() => {
    ApiService.getAdminSettings("notifications")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setSettings((p) => ({ ...p, ...data }));
      })
      .catch(() => showError("Failed to load notification settings"));
  }, []);

  const handleToggle = async (key) => {
    const newValue = !settings[key];
    const updated = { ...settings, [key]: newValue };
    setSettings(updated);
    try {
      await ApiService.saveAdminSettings("notifications", [
        { key, value: String(newValue), category: "NOTIFICATIONS", data_type: "boolean" },
      ]);
      showSuccess("Notification setting updated");
    } catch {
      setSettings(settings);
      showError("Failed to update notification setting");
    }
  };

  const channels = [
    { key: "email_notifications_enabled", icon: <FiMail className="text-blue-600 mt-1" />, label: "Email Notifications", desc: "Send notifications via email" },
    { key: "sms_notifications_enabled", icon: <FiMessageSquare className="text-blue-600 mt-1" />, label: "SMS Notifications", desc: "Send notifications via SMS" },
    { key: "push_notifications_enabled", icon: <FiBell className="text-blue-600 mt-1" />, label: "Push Notifications", desc: "Send in-app push notifications" },
    { key: "admin_alerts_enabled", icon: <FiAlertCircle className="text-blue-600 mt-1" />, label: "Admin Alerts", desc: "Receive critical admin alerts" },
  ];

  return (
    <div className="bg-white rounded-lg p-6 space-y-8">
      <h2 className="text-lg font-semibold">Notification Preferences</h2>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Notification Channels</h3>
        <div className="space-y-3">
          {channels.map(({ key, icon, label, desc }) => (
            <div key={key} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-3 items-start">
                {icon}
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
              <Toggle checked={!!settings[key]} onChange={() => handleToggle(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Alert Triggers</h3>
        <div className="space-y-3">
          {[
            { label: "New User Registration", desc: "Get notified when a new user registers" },
            { label: "New Booking Created", desc: "Get notified when a booking is placed" },
            { label: "Dispute Raised", desc: "Get notified when a dispute is created" },
            { label: "Withdrawal Request", desc: "Get notified when partner requests withdrawal" },
          ].map(({ label, desc }) => (
            <div key={label} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingNotify;
