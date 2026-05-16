import { useState } from "react";
import {
  FiSettings,
  FiDollarSign,
  FiBell,
  FiLock,
  FiMail,
  FiDatabase,
} from "react-icons/fi";

import SettingGeneral from "./SettingGeneral";
import SettingPayment from "./SettingPayment";
import SettingNotify from "./SettingNotify";
import SettingSecurity from "./SettingSecurity";
import SettingEmail from "./SettingEmail";
import SettingExport from "./SettingExport";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  const menuItems = [
    { id: "general", label: "General", icon: <FiSettings /> },
    { id: "payments", label: "Payments & Fees", icon: <FiDollarSign /> },
    { id: "notifications", label: "Notifications", icon: <FiBell /> },
    { id: "security", label: "Security", icon: <FiLock /> },
    { id: "email", label: "Email Templates", icon: <FiMail /> },
    { id: "backup", label: "Backup & Export", icon: <FiDatabase /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ===== Desktop Sidebar ===== */}
        <div className="hidden lg:flex lg:w-64 bg-white rounded-xl shadow p-4 flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* ===== Mobile Top Tabs ===== */}
        <div className="lg:hidden w-full bg-white rounded-xl shadow p-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap rounded-full transition
                  ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-600"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== Content Section ===== */}
        <div className="flex-1 w-full bg-white rounded-xl shadow p-4 sm:p-6 overflow-hidden">

          {activeTab === "general" && <SettingGeneral />}
          {activeTab === "payments" && <SettingPayment />}
          {activeTab === "notifications" && <SettingNotify />}
          {activeTab === "security" && <SettingSecurity />}
          {activeTab === "email" && <SettingEmail />}
          {activeTab === "backup" && <SettingExport />}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;