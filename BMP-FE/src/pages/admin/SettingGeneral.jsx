import React, { useState, useEffect } from "react";
import { FiUsers, FiBox } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError } from "../../core/utils/toast.util";

const SettingGeneral = () => {
  const [form, setForm] = useState({
    platform_name: "",
    support_email: "",
    support_phone: "",
    max_booking_distance: "",
    min_booking_amount: "",
    auto_approve_users: false,
    auto_assign_partners: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getAdminSettings("general")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setForm((p) => ({ ...p, ...data }));
      })
      .catch(() => showError("Failed to load general settings"));
  }, []);

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "platform_name", value: form.platform_name, category: "GENERAL", data_type: "string" },
        { key: "support_email", value: form.support_email, category: "GENERAL", data_type: "string" },
        { key: "support_phone", value: form.support_phone, category: "GENERAL", data_type: "string" },
        { key: "max_booking_distance", value: String(form.max_booking_distance), category: "GENERAL", data_type: "number" },
        { key: "min_booking_amount", value: String(form.min_booking_amount), category: "GENERAL", data_type: "number" },
        { key: "auto_approve_users", value: String(form.auto_approve_users), category: "GENERAL", data_type: "boolean" },
        { key: "auto_assign_partners", value: String(form.auto_assign_partners), category: "GENERAL", data_type: "boolean" },
      ];
      await ApiService.saveAdminSettings("general", settings);
      showSuccess("General settings saved");
    } catch {
      showError("Failed to save general settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">General Settings</h2>

      <h3 className="text-sm font-medium mb-4">Platform Information</h3>

      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs text-gray-500">Platform Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.platform_name}
            onChange={(e) => handleChange("platform_name", e.target.value)}
            placeholder="Book My Parcel"
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Support Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={form.support_email}
            onChange={(e) => handleChange("support_email", e.target.value)}
            placeholder="support@bookmyparcel.com"
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Support Phone <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.support_phone}
            onChange={(e) => handleChange("support_phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
        </div>
      </div>

      <h3 className="text-sm font-medium mb-4">Booking Limits</h3>

      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs text-gray-500">Maximum Booking Distance (km) <span className="text-red-500">*</span></label>
          <input
            type="number"
            value={form.max_booking_distance}
            onChange={(e) => handleChange("max_booking_distance", e.target.value)}
            placeholder="2000"
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Maximum distance allowed for a single booking</p>
        </div>

        <div>
          <label className="text-xs text-gray-500">Minimum Booking Amount (₹) <span className="text-red-500">*</span></label>
          <input
            type="number"
            value={form.min_booking_amount}
            onChange={(e) => handleChange("min_booking_amount", e.target.value)}
            placeholder="100"
            className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Minimum amount to place a booking</p>
        </div>
      </div>

      <h3 className="text-sm font-medium mb-4">Operations</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          onClick={() => handleChange("auto_approve_users", !form.auto_approve_users)}
          className={`border rounded-lg p-4 flex gap-3 cursor-pointer ${form.auto_approve_users ? "bg-blue-50 border-blue-300" : "bg-gray-50"}`}
        >
          <FiUsers className="text-blue-600 mt-1" />
          <div>
            <p className="text-sm font-medium">Auto-Approve Users</p>
            <p className="text-xs text-gray-500">Enable automatic user approval</p>
            <p className="text-xs font-semibold mt-1 text-blue-600">{form.auto_approve_users ? "Enabled" : "Disabled"}</p>
          </div>
        </div>

        <div
          onClick={() => handleChange("auto_assign_partners", !form.auto_assign_partners)}
          className={`border rounded-lg p-4 flex gap-3 cursor-pointer ${form.auto_assign_partners ? "bg-purple-50 border-purple-300" : "bg-gray-50"}`}
        >
          <FiBox className="text-purple-600 mt-1" />
          <div>
            <p className="text-sm font-medium">Auto-Assign Partners</p>
            <p className="text-xs text-gray-500">Auto-assign bookings to partners</p>
            <p className="text-xs font-semibold mt-1 text-purple-600">{form.auto_assign_partners ? "Enabled" : "Disabled"}</p>
          </div>
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

export default SettingGeneral;
