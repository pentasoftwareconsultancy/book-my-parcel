import React, { useState, useRef, useEffect } from "react";
import {
  FiMail, FiPhone, FiMapPin, FiBriefcase, FiEdit2, FiCamera, FiEye,
  FiShield, FiActivity, FiSliders, FiTrash2, FiX
} from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import ApiService from "../../core/services/api.service";

import PersonalTab from "../../components/profile/PersonalTab.jsx";
import SecurityTab from "../../components/profile/SecurityTab";
import PreferencesTab from "../../components/profile/Preferencestab";
import ActivityLogTab from "../../components/profile/ActivitylogTab";

const TABS = [
  { label: "Personal Info", icon: <FiActivity size={13} /> },
  { label: "Security",      icon: <FiShield size={13} /> },
  { label: "Preferences",   icon: <FiSliders size={13} /> },
  { label: "Activity Log",  icon: <HiLightningBolt size={13} /> },
];

const AdminProfile = () => {
  const [activeTab, setActiveTab]   = useState(0);
  const [isEditing, setIsEditing]   = useState(false);
  const [adminData, setAdminData]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [avatar, setAvatar]         = useState(null);
  const fileInputRef                = useRef(null);

  // ── Fetch real profile ────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([ApiService.getProfile(), ApiService.getDashboardOverview()])
      .then(([profileRes, dashRes]) => {
        const u       = profileRes.data?.user || profileRes.data || {};
        const profile = u.profile || {};
        const dash    = dashRes.data?.data?.stats || {};
        const name    = profile.name || u.email || "Admin";
        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        setAdminData({
          name,
          initials,
          role:        (Array.isArray(u.roles) ? u.roles[0]?.name || u.roles[0] : u.roles) || "ADMIN",
          email:       u.email || "",
          phone:       u.phone_number || "",
          location:    [profile.city, profile.state].filter(Boolean).join(", ") || "—",
          department:  "Operations",
          memberSince: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—",
          lastLogin:   "Today",
          avatar:      profile.avatar_url || null,
          stats: [
            { label: "Total Users",      value: dash.individuals || 0,    icon: <HiLightningBolt size={18} />, color: "bg-blue-500" },
            { label: "Total Partners",   value: dash.travellers   || 0,    icon: <FiShield size={16} />,        color: "bg-green-500" },
            { label: "Active Bookings",  value: dash.activeBookings || 0,  icon: <FiActivity size={16} />,      color: "bg-orange-400" },
            { label: "Total Revenue",    value: `₹${Number(dash.totalRevenue||0).toLocaleString()}`, icon: <FiShield size={16} />, color: "bg-pink-500" },
          ],
          personalInfo: {
            fullName:   name,
            email:      u.email || "",
            phone:      u.phone_number || "",
            location:   [profile.city, profile.state].filter(Boolean).join(", ") || "",
            role:       (Array.isArray(u.roles) ? u.roles[0]?.name || u.roles[0] : u.roles) || "ADMIN",
            department: "Operations",
          },
          security: {
            twoFA: false,
            sessions: [
              { device: "Current Session", location: [profile.city, profile.state].filter(Boolean).join(", ") || "—", time: "Active now", current: true },
            ],
          },
          preferences: {
            emailNotif: true,
            smsNotif:   false,
            pushNotif:  true,
            language:   "English",
            timezone:   "Asia/Kolkata",
          },
        });
        if (profile.avatar_url) setAvatar(profile.avatar_url);
      })
      .catch(err => console.error("Failed to load admin profile:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Profile picture handlers ──────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const handleDeleteAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Personal info save ────────────────────────────────────────────────────
  const handleSavePersonalInfo = (updatedInfo) => {
    setAdminData((prev) => ({
      ...prev,
      name:       updatedInfo.fullName   || prev.name,
      email:      updatedInfo.email      || prev.email,
      phone:      updatedInfo.phone      || prev.phone,
      location:   updatedInfo.location   || prev.location,
      department: updatedInfo.department || prev.department,
      role:       updatedInfo.role       || prev.role,
      personalInfo: { 
        ...prev.personalInfo, 
        ...updatedInfo,
     },
    }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // ── Tab renderer ──────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 0:
        return (
          <PersonalTab
            personalInfo={adminData.personalInfo}
            isAdmin={true}
            isEditing={isEditing}
            onSave={handleSavePersonalInfo}
            onCancel={handleCancelEdit}
          />
        );
      case 1: return <SecurityTab security={adminData.security} />;
      case 2: return <PreferencesTab preferences={adminData.preferences} />;
      case 3: return <ActivityLogTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

      {loading || !adminData ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-b-2 border-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
        </div>

        {isEditing ? (
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-2 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <FiX size={13} /> Cancel Editing
          </button>
        ) : (
          <button
            onClick={() => { setIsEditing(true); setActiveTab(0); }}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <FiEdit2 size={13} /> Edit Profile
          </button>
        )}
      </div>

      {/* ── Banner ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)" }}
      >
        <div className="flex items-center gap-4 sm:gap-5">

          {/* ── Avatar ── */}
          <div className="relative flex-shrink-0">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* Avatar circle */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
              {avatar
                ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                : adminData.initials
              }
            </div>

            {/* Camera button — always visible in edit mode, hidden otherwise */}
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition"
                title="Upload photo"
              >
                <FiCamera size={12} className="text-gray-600" />
              </button>
            )}

            {/* Delete avatar button — only if avatar exists and editing */}
            {isEditing && avatar && (
              <button
                onClick={handleDeleteAvatar}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow hover:bg-red-600 transition"
                title="Remove photo"
              >
                <FiTrash2 size={9} className="text-white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{adminData.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {adminData.role}
              </span>
              <span className="bg-green-400/30 text-green-100 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block"></span>
                Active
              </span>
              {/* Editing badge */}
              {isEditing && (
                <span className="bg-yellow-400/30 text-yellow-100 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ✏️ Editing
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm">
              <span className="flex items-center gap-1"><FiMail size={12} /> {adminData.email}</span>
              <span className="flex items-center gap-1"><FiPhone size={12} /> {adminData.phone}</span>
              <span className="flex items-center gap-1"><FiMapPin size={12} /> {adminData.location}</span>
              <span className="flex items-center gap-1"><FiBriefcase size={12} /> {adminData.department}</span>
            </div>
          </div>
        </div>

        {/* Member Since / Last Login */}
        <div className="text-right text-white/80 text-xs sm:text-sm hidden sm:block flex-shrink-0">
          <p className="text-xs text-white/60 mb-0.5">Member Since</p>
          <p className="text-white font-semibold mb-3">{adminData.memberSince}</p>
          <p className="text-xs text-white/60 mb-0.5">Last Login</p>
          <p className="text-white font-semibold">{adminData.lastLogin}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {adminData.stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tab Bar + Content ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100 px-4 sm:px-6 pt-4 gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === i
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        {renderTab()}
      </div>

        </>
      )}
    </div>
  );
};

export default AdminProfile;