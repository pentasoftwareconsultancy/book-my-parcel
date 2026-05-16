import React, { useState } from "react";
import { CheckCircle } from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-block w-11 h-6 cursor-pointer flex-shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors duration-200" />
    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
  </label>
);

const NotifRow = ({ icon, label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3.5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const PreferencesTab = ({ preferences: initial = {} }) => {
  const [prefs, setPrefs] = useState({
    emailNotif: initial.emailNotif ?? true,
    smsNotif:   initial.smsNotif   ?? false,
    pushNotif:  initial.pushNotif  ?? true,
    language:   initial.language   || "",
    timezone:   initial.timezone   || "",
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-7">

      {/* Notification Preferences */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <NotifRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/>
              </svg>
            }
            label="Email Notifications"
            desc="Receive notifications via email"
            checked={prefs.emailNotif}
            onChange={() => toggle("emailNotif")}
          />
          <NotifRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/>
              </svg>
            }
            label="SMS Notifications"
            desc="Receive notifications via SMS"
            checked={prefs.smsNotif}
            onChange={() => toggle("smsNotif")}
          />
          <NotifRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            }
            label="Push Notifications"
            desc="Receive push notifications in browser"
            checked={prefs.pushNotif}
            onChange={() => toggle("pushNotif")}
          />
        </div>
      </div>

      {/* Regional Settings */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Regional Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Language
            </label>
            <input
              type="text"
              value={prefs.language}
              onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
              placeholder="e.g. English"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 transition-colors bg-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Timezone
            </label>
            <input
              type="text"
              value={prefs.timezone}
              onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}
              placeholder="e.g. Asia/Kolkata"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 transition-colors bg-white"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Preferences
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={15} /> Saved!
          </span>
        )}
      </div>
    </div>
  );
};

export default PreferencesTab;