import React, { useState, useEffect } from "react";
import { FiShield } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError } from "../../core/utils/toast.util";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-200"></div>
    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></span>
  </label>
);

const SettingSecurity = () => {
  const [form, setForm] = useState({
    two_factor_auth: false,
    session_timeout_mins: "30",
    password_expiry_days: "90",
    max_login_attempts: "5",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getAdminSettings("security")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setForm((p) => ({ ...p, ...data }));
      })
      .catch(() => showError("Failed to load security settings"));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "two_factor_auth", value: String(form.two_factor_auth), category: "SECURITY", data_type: "boolean" },
        { key: "session_timeout_mins", value: String(form.session_timeout_mins), category: "SECURITY", data_type: "number" },
        { key: "password_expiry_days", value: String(form.password_expiry_days), category: "SECURITY", data_type: "number" },
        { key: "max_login_attempts", value: String(form.max_login_attempts), category: "SECURITY", data_type: "number" },
      ];
      await ApiService.saveAdminSettings("security", settings);
      showSuccess("Security settings saved");
    } catch {
      showError("Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 space-y-8">
      <h2 className="text-lg font-semibold">Security Settings</h2>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Authentication</h3>

        <div className="flex justify-between items-center bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex gap-3 items-start">
            <FiShield className="text-green-600 mt-1" />
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Add an extra layer of security to admin accounts</p>
            </div>
          </div>
          <Toggle checked={!!form.two_factor_auth} onChange={() => setForm((p) => ({ ...p, two_factor_auth: !p.two_factor_auth }))} />
        </div>

        <div>
          <label className="text-sm font-medium">Session Timeout (minutes)</label>
          <input
            type="number"
            value={form.session_timeout_mins}
            onChange={(e) => setForm((p) => ({ ...p, session_timeout_mins: e.target.value }))}
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Auto-logout after inactivity</p>
        </div>

        <div>
          <label className="text-sm font-medium">Password Expiry (days)</label>
          <input
            type="number"
            value={form.password_expiry_days}
            onChange={(e) => setForm((p) => ({ ...p, password_expiry_days: e.target.value }))}
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Force password change after this period</p>
        </div>

        <div>
          <label className="text-sm font-medium">Max Login Attempts</label>
          <input
            type="number"
            value={form.max_login_attempts}
            onChange={(e) => setForm((p) => ({ ...p, max_login_attempts: e.target.value }))}
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Lock account after failed attempts</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-md text-sm"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default SettingSecurity;
