import React, { useState, useEffect } from "react";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError } from "../../core/utils/toast.util";

const Field = ({ label, hint, value, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-semibold text-gray-800 mb-1">{label}</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="w-full border-0 border-b-2 border-gray-200 bg-transparent py-1.5 text-gray-900 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
    />
    <p className="text-xs text-gray-400 mt-1">{hint}</p>
  </div>
);

const PAYMENT_METHODS = ["Credit/Debit Cards", "UPI Payments", "Net Banking", "Digital Wallets"];

const PaymentCommissionSettings = () => {
  const [form, setForm] = useState({
    platform_fee_percent: "10",
    partner_commission_percent: "90",
    min_withdrawal_amount: "1000",
    max_withdrawal_amount: "50000",
    payment_method: "Credit/Debit Cards",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getAdminSettings("payments")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setForm((p) => ({ ...p, ...data }));
      })
      .catch(() => showError("Failed to load payment settings"));
  }, []);

  const platformEarns = parseFloat(form.platform_fee_percent) || 0;
  const partnerEarns = 100 - platformEarns;

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "platform_fee_percent", value: String(form.platform_fee_percent), category: "PAYMENTS", data_type: "number" },
        { key: "partner_commission_percent", value: String(form.partner_commission_percent), category: "PAYMENTS", data_type: "number" },
        { key: "min_withdrawal_amount", value: String(form.min_withdrawal_amount), category: "PAYMENTS", data_type: "number" },
        { key: "max_withdrawal_amount", value: String(form.max_withdrawal_amount), category: "PAYMENTS", data_type: "number" },
        { key: "payment_method", value: form.payment_method, category: "PAYMENTS", data_type: "string" },
      ];
      await ApiService.saveAdminSettings("payments", settings);
      showSuccess("Payment settings saved");
    } catch {
      showError("Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment &amp; Commission Settings</h2>

      <h3 className="text-base font-bold text-gray-900 mb-4">Platform Commission</h3>

      <Field
        label="Platform Fee (%)"
        hint="Percentage of booking amount charged as platform fee."
        value={form.platform_fee_percent}
        onChange={(e) => setForm((p) => ({ ...p, platform_fee_percent: e.target.value }))}
      />

      <Field
        label="Partner Commission (%)"
        hint="Percentage of booking amount earned by partner."
        value={form.partner_commission_percent}
        onChange={(e) => setForm((p) => ({ ...p, partner_commission_percent: e.target.value }))}
      />

      <div className="bg-indigo-50 rounded-xl p-4 flex gap-4 mb-7">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 mb-2">Commission Breakdown</p>
          <div className="flex justify-between text-sm text-gray-500 py-0.5">
            <span>Platform earns</span>
            <span className="font-semibold text-indigo-500">{platformEarns}% of booking</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 py-0.5">
            <span>Partner earns</span>
            <span className="font-semibold text-indigo-500">{partnerEarns}% of booking</span>
          </div>
        </div>
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-4">Withdrawal Limits</h3>

      <Field
        label="Minimum Withdrawal Amount (₹)"
        hint="Minimum amount partners can withdraw."
        value={form.min_withdrawal_amount}
        onChange={(e) => setForm((p) => ({ ...p, min_withdrawal_amount: e.target.value }))}
      />

      <Field
        label="Maximum Withdrawal Amount (₹)"
        hint="Maximum amount per withdrawal request."
        value={form.max_withdrawal_amount}
        onChange={(e) => setForm((p) => ({ ...p, max_withdrawal_amount: e.target.value }))}
      />

      <h3 className="text-base font-bold text-gray-900 mb-4">Payment Methods</h3>

      <div className="space-y-2 mb-6">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = form.payment_method === method;
          return (
            <div
              key={method}
              onClick={() => setForm((p) => ({ ...p, payment_method: method }))}
              className={`flex justify-between items-center px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-300"
              }`}
            >
              <span className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>{method}</span>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-indigo-500" : "border-gray-300"}`}>
                {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2 rounded-md text-sm"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default PaymentCommissionSettings;
