import React, { useState } from "react";
import { Bell, Globe, Moon, Trash2, Download, CheckCircle } from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-block w-11 h-6 cursor-pointer flex-shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors duration-200" />
    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
  </label>
);

const SettingRow = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const SettingsTab = ({ settings: initial = {} }) => {
  const [s, setS] = useState({
    emailNotif:  initial.emailNotif  ?? true,
    smsNotif:    initial.smsNotif    ?? true,
    promoOffers: initial.promoOffers ?? false,
    darkMode:    initial.darkMode    ?? false,
    language:    initial.language    || "English",
    currency:    initial.currency    || "INR (₹)",
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setS(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
<div className="p-8 space-y-7">
      {/* ── Notifications ── */}
      <div className="pb-6 border-b border-gray-100">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-2">
          <Bell size={15} className="text-blue-600" /> Notifications
        </h3>
        <SettingRow label="Email Notifications" desc="Receive booking updates via email"  checked={s.emailNotif}  onChange={() => toggle("emailNotif")} />
        <SettingRow label="SMS Notifications"   desc="Receive booking updates via SMS"    checked={s.smsNotif}    onChange={() => toggle("smsNotif")} />
        <SettingRow label="Promotional Offers"  desc="Get exclusive deals and discounts"  checked={s.promoOffers} onChange={() => toggle("promoOffers")} />
      </div>

      {/* ── Preferences ── */}
      <div className="pb-6 border-b border-gray-100">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
          <Globe size={15} className="text-blue-600" /> Preferences
        </h3>
        {/* <div className="grid grid-cols-2 gap-5"> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Language</label>
            <select
              value={s.language}
              onChange={e => setS(p => ({...p, language: e.target.value}))}
              className="border border-gray-200 rounded-lg px-3.5 py-3 bg-white text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
              <option>Tamil</option>
              <option>Telugu</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Currency</label>
            <select
              value={s.currency}
              onChange={e => setS(p => ({...p, currency: e.target.value}))}
              className="border border-gray-200 rounded-lg px-3.5 py-3 bg-white text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option>INR (₹)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="pb-6 border-b border-gray-100">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-2">
          <Moon size={15} className="text-blue-600" /> Appearance
        </h3>
        <SettingRow label="Dark Mode" desc="Switch to dark theme" checked={s.darkMode} onChange={() => toggle("darkMode")} />
      </div>

      {/* ── Save Button ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Save Settings
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={15} /> Settings saved!
          </span>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;