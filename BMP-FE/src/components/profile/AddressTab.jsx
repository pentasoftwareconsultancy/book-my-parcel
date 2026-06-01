import React, { useState } from "react";
import { MapPin, Home, Briefcase, Plus, Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateProfile, fetchProfile } from "../../store/slices/profileSlice";

const typeIcon = { Home, Work: Briefcase, Other: MapPin };

const AddressCard = ({ address, onDelete }) => {
  const Icon = typeIcon[address.type] || MapPin;
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
          <Icon size={11} /> {address.type}
        </span>
        {address.isDefault && (
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold px-3 py-1 rounded-full">
            Default
          </span>
        )}
        {address.id !== "profile_address" && (
          <button onClick={() => onDelete(address.id)} className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <p className="text-sm font-semibold text-gray-900">{address.name}</p>
      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
        {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
        {address.city}, {address.state} - {address.pincode}
      </p>
      <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
    </div>
  );
};

const AddressModal = ({ onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    type: "Home", name: "", line1: "", line2: "",
    city: "", state: "", pincode: "", phone: "", isDefault: false,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Add New Address</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-4 sm:px-6 py-5 grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Address Type</label>
            <div className="flex gap-2 flex-wrap">
              {["Home", "Work", "Other"].map((t) => (
                <button key={t} onClick={() => set("type", t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t ? "bg-primary text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          {[
            { label: "Full Name", key: "name", col: 2 },
            { label: "Address Line 1", key: "line1", col: 2 },
            { label: "Address Line 2 (Optional)", key: "line2", col: 2 },
            { label: "City", key: "city", col: 1 },
            { label: "State", key: "state", col: 1 },
            { label: "Pincode", key: "pincode", col: 1 },
            { label: "Phone", key: "phone", col: 1 },
          ].map(({ label, key, col }) => (
            <div key={key} className={`flex flex-col gap-1.5 ${col === 2 ? "col-span-2" : ""}`}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={label}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500" />
            </div>
          ))}
          <label className="col-span-2 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)}
              className="w-4 h-4 min-w-[16px] min-h-[16px] accent-blue-600 border border-gray-300 rounded-sm" />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary rounded-lg transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddressTab = ({ addresses: initialAddresses = [] }) => {
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync when parent re-fetches profile
  React.useEffect(() => { setAddresses(initialAddresses); }, [initialAddresses]);

  const handleDelete = (id) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  const handleSave = async (form) => {
    setSaving(true);
    // Save the first address back to user_profiles (address, city, state, pincode)
    // If it's the first address or marked default, update the profile fields
    const isFirst = addresses.length === 0 || form.isDefault;
    if (isFirst) {
      await dispatch(updateProfile({
        address: form.line1 + (form.line2 ? `, ${form.line2}` : ""),
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      }));
      await dispatch(fetchProfile());
    }
    setAddresses((prev) => [...prev, { ...form, id: Date.now() }]);
    setSaving(false);
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[17px] font-bold text-gray-900">Saved Addresses</h2>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-primary text-white border border-dashed border-blue-400 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary transition-colors">
          <Plus size={15} /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <MapPin size={40} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium">No saved addresses yet</p>
          <p className="text-xs mt-1">Click "Add New Address" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && <AddressModal onClose={() => setShowModal(false)} onSave={handleSave} saving={saving} />}
    </div>
  );
};

export default AddressTab;