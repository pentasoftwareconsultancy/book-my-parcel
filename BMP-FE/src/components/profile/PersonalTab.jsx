import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, CheckCircle, User, Mail, Phone,
  MapPin, Shield, Building2, Eye
} from "lucide-react";
import TextInput from "../../core/common/CommonUi";
import {
  validateEmail,
  validatePhone,
  validateOnlyCharacters,
  validateRequired,
  nameTypingPattern,
  numberTypingPattern
} from "../../core/utils/validation";
import { KYC_STATUS } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";


// ─── Admin read-only view ────────────────────────────────────────────────────
const AdminPersonalView = ({ personalInfo = {} }) => {
  const fields = [
    { label: "Full Name", value: personalInfo.fullName, icon: <User size={14} /> },
    { label: "Email Address", value: personalInfo.email, icon: <Mail size={14} /> },
    { label: "Phone Number", value: personalInfo.phone, icon: <Phone size={14} /> },
    { label: "Location", value: personalInfo.location, icon: <MapPin size={14} /> },
    { label: "Role", value: personalInfo.role, icon: <Shield size={14} /> },
    { label: "Department", value: personalInfo.department, icon: <Building2 size={14} /> },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
        {fields.map(({ label, value, icon }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="text-gray-400">{icon}</span>
              {label}
            </div>
            <div className="text-sm text-gray-500 px-3 py-2 rounded-md border border-gray-200 bg-white min-h-[38px]">
              {value || <span className="text-gray-400">—</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Visibility Banner */}
      <div className="flex items-start gap-4 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
        <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
          <Eye size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Profile Visibility</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Your profile information is only visible to other admin users. Platform users and delivery partners cannot see admin profiles.
          </p>
        </div>
      </div>
    </>
  );
};


// ─── Admin edit view ─────────────────────────────────────────────────────────
const AdminPersonalEdit = ({ personalInfo = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({
    fullName: personalInfo.fullName || "",
    email: personalInfo.email || "",
    phone: personalInfo.phone || "",
    location: personalInfo.location || "",
    role: personalInfo.role || "",
    department: personalInfo.department || "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      fullName: personalInfo.fullName || "",
      email: personalInfo.email || "",
      phone: personalInfo.phone || "",
      location: personalInfo.location || "",
      role: personalInfo.role || "",
      department: personalInfo.department || "",
    });
  }, [personalInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // No pattern restrictions for admin fields — allow +, spaces, commas etc.
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.department.trim()) newErrors.department = "Department is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSave(form);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-8">
        <TextInput
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
          error={errors.fullName}
          required
        />
        <TextInput
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email"
          error={errors.email}
          required
        />
        <TextInput
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          error={errors.phone}
          required
        />
        <TextInput
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="City, State"
          error={errors.location}
          required
        />
        <TextInput
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Enter role"
          error={errors.role}
          required
        />
        <TextInput
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Enter department"
          error={errors.department}
          required
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={15} /> Saved successfully!
          </span>
        )}
        <button
          onClick={onCancel}
          className="border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </div>
    </>
  );
};


// ─── Admin wrapper — owns no hooks, just routes to view or edit ──────────────
const AdminPersonalTab = ({ personalInfo, isEditing, onSave, onCancel }) => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-7">
      <h2 className="text-[17px] font-bold text-gray-900">Personal Information</h2>
      {isEditing && (
        <span className="text-xs text-white bg-primary border border-blue-200 px-3 py-1 rounded-full font-medium">
          ✏️ Editing mode
        </span>
      )}
    </div>

    {isEditing
      ? <AdminPersonalEdit personalInfo={personalInfo} onSave={onSave} onCancel={onCancel} />
      : <AdminPersonalView personalInfo={personalInfo} />
    }
  </div>
);


// ─── User / Traveller tab — owns its own hooks safely ───────────────────────
const UserPersonalTab = ({ personalInfo = {}, isEditing, onSave }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: personalInfo.fullName || "",
    email: personalInfo.email || "",
    phone: personalInfo.phone || "",
    city: personalInfo.city || "",
    state: personalInfo.state || "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      fullName: personalInfo.fullName || "",
      email: personalInfo.email || "",
      phone: personalInfo.phone || "",
      city: personalInfo.city || "",
      state: personalInfo.state || "",
    });
  }, [personalInfo]);

  useEffect(() => {
    if (!isEditing) {
      setForm({
        fullName: personalInfo.fullName || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        city: personalInfo.city || "",
        state: personalInfo.state || "",
      });
    }
  }, [isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && !numberTypingPattern.test(value)) return;
    if ((name === "fullName" || name === "city" || name === "state") && !nameTypingPattern.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: validateOnlyCharacters(form.fullName, "full_name"),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      city: validateRequired(form.city, "city"),
      state: validateRequired(form.state, "state"),
    };
    Object.keys(newErrors).forEach((key) => { if (!newErrors[key]) delete newErrors[key]; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ViewRow = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 px-3 py-2 rounded-md bg-gray-50 border border-gray-100 min-h-[38px]">
        {value || <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-[17px] font-bold text-gray-900">Personal Information</h2>
        {isEditing && (
          <span className="text-xs text-white bg-primary border border-blue-200 px-3 py-1 rounded-full font-medium">
            ✏️ Editing mode
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {isEditing ? (
          <>
            <TextInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" error={errors.fullName} required />
            <TextInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" error={errors.email} required />
            <TextInput label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" error={errors.phone} required />
            <TextInput label="City" name="city" value={form.city} onChange={handleChange} placeholder="Enter your city" error={errors.city} required />
            <TextInput label="State" name="state" value={form.state} onChange={handleChange} placeholder="Enter your state" error={errors.state} required />
          </>
        ) : (
          <>
            <ViewRow label="Full Name" value={form.fullName} />
            <ViewRow label="Email Address" value={form.email} />
            <ViewRow label="Phone Number" value={form.phone} />
            <ViewRow label="City" value={form.city} />
            <ViewRow label="State" value={form.state} />
          </>
        )}

        {/* KYC Status — always read-only */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-gray-500">KYC Status</p>
          {personalInfo.kycStatus === KYC_STATUS.APPROVED ? (
            <div className="flex items-center gap-2 border border-green-300 rounded-md px-3 py-2 bg-green-50 min-h-[38px]">
              <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">KYC Verified</span>
            </div>
          ) : (
            <div className={`flex items-center justify-between gap-2 border rounded-md px-3 py-2 min-h-[38px] ${
              personalInfo.kycStatus === KYC_STATUS.PENDING
                ? "border-yellow-300 bg-yellow-50"
                : personalInfo.kycStatus === KYC_STATUS.REJECTED
                ? "border-red-300 bg-red-50"
                : "border-orange-300 bg-orange-50"
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className={`flex-shrink-0 ${
                  personalInfo.kycStatus === KYC_STATUS.PENDING ? "text-yellow-500"
                  : personalInfo.kycStatus === KYC_STATUS.REJECTED ? "text-red-500"
                  : "text-orange-500"
                }`} />
                <span className={`text-sm font-medium ${
                  personalInfo.kycStatus === KYC_STATUS.PENDING ? "text-yellow-700"
                  : personalInfo.kycStatus === KYC_STATUS.REJECTED ? "text-red-700"
                  : "text-orange-700"
                }`}>
                  {personalInfo.kycStatus === KYC_STATUS.PENDING ? "Pending Review"
                    : personalInfo.kycStatus === KYC_STATUS.REJECTED ? "Rejected"
                    : "Not Started"}
                </span>
              </div>
              <button
                onClick={() => navigate(RoutePath.KYC_PAN)}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
                  personalInfo.kycStatus === KYC_STATUS.PENDING
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : personalInfo.kycStatus === KYC_STATUS.REJECTED
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {personalInfo.kycStatus === KYC_STATUS.PENDING ? "Check Status"
                  : personalInfo.kycStatus === KYC_STATUS.REJECTED ? "Resubmit"
                  : "Complete KYC"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-3 mt-8">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle size={15} /> Saved successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};


// ─── Main PersonalTab — NO hooks here, just routes to the right component ───
const PersonalTab = ({ personalInfo = {}, isEditing, onSave, onCancel, isAdmin = false }) => {
  if (isAdmin) {
    return (
      <AdminPersonalTab
        personalInfo={personalInfo}
        isEditing={isEditing}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <UserPersonalTab
      personalInfo={personalInfo}
      isEditing={isEditing}
      onSave={onSave}
    />
  );
};

export default PersonalTab;