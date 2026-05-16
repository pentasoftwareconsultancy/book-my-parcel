import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProfile, updateProfile } from "../../store/slices/profileSlice.js";
import ProfileHeader from "./ProfileHeader";
import StatsSection from "./StatsSection";
import PersonalTab from "./PersonalTab.jsx";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";
import SettingsTab from "./SettingTab.jsx";
import { KYC_STATUS } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";
// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
// Kept here so it's easy to remove and replace with API/Redux later.
// When API is ready:
//   1. Remove DUMMY_DATA
//   2. Replace `const profileData = ...` with:
//        const dispatch = useDispatch();
//        const profileData = useSelector(state => state.profile);
//        useEffect(() => { dispatch(fetchProfile()) }, []);


const DUMMY_DATA = {
  USER: {
    user: {
      name: "Amit Sharma",
      email: "amit.sharma@email.com",
      avatar: "",
      memberSince: "January 2024",
      userId: "0001BMPU",
    },
    stats: {
      totalBookings: 12,
      completed: 8,
      totalSpent: 4200,
      avgRating: 4.8,
      totalSaved: 2500,
    },
    personalInfo: {
      fullName: "Amit Sharma",
      email: "amit.sharma@email.com",
      phone: "+91 98765 43210",
      dob: "",
      gender: "",
      kycStatus: "Verified",
    },
    addresses: [
      {
        id: 1,
        type: "Home",
        name: "Amit Sharma",
        line1: "B-204, Lotus Apartments",
        line2: "Near City Mall, Baner",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411045",
        phone: "+91 98765 43210",
        isDefault: true,
      },
      {
        id: 2,
        type: "Work",
        name: "Amit Sharma",
        line1: "4th Floor, Tech Park",
        line2: "Hinjewadi Phase 1",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411057",
        phone: "+91 98765 43210",
        isDefault: false,
      },
    ],
    security: {
      twoFA: true,
      sessions: [
        { device: "Chrome on Windows",   location: "Pune, Maharashtra",   time: "Active now",       current: true  },
        { device: "Safari on iPhone 14", location: "Mumbai, Maharashtra", time: "2 hours ago",      current: false },
        { device: "Firefox on MacBook",  location: "Pune, Maharashtra",   time: "Yesterday 9:00 PM",current: false },
      ],
    },
    settings: {
      emailNotif: true,
      smsNotif: true,
      promoOffers: false,
      language: "English",
      currency: "INR (₹)",
      darkMode: false,
    },
  },

  TRAVELLER: {
    user: {
      name: "Priya Mehta",
      email: "priya.mehta@email.com",
      avatar: "",
      memberSince: "March 2023",
      userId: "0042TMPU",
    },
    stats: {
      totalBookings: 28,
      completed: 24,
      totalSpent: 18500,
      avgRating: 4.9,
      totalSaved: 6200,
    },
    personalInfo: {
      fullName: "Priya Mehta",
      email: "priya.mehta@email.com",
      phone: "+91 91234 56789",
      dob: "",
      gender: "Female",
      kycStatus: "Verified",
    },
    addresses: [
      {
        id: 1,
        type: "Home",
        name: "Priya Mehta",
        line1: "A-501, Sunshine Heights",
        line2: "Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400058",
        phone: "+91 91234 56789",
        isDefault: true,
      },
    ],
    security: {
      twoFA: true,
      sessions: [
        { device: "Chrome on Android", location: "Mumbai, Maharashtra", time: "Active now", current: true  },
        { device: "Chrome on MacBook", location: "Goa",                 time: "3 days ago", current: false },
      ],
    },
    settings: {
      emailNotif: true,
      smsNotif: false,
      promoOffers: true,
      language: "English",
      currency: "INR (₹)",
      darkMode: false,
    },
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const TABS = ["Personal Info", "Saved Addresses", "Security", "Settings"];

const ProfileLayout = ({ role = "USER" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile, loadingFetch: loading, error } = useSelector((state) => state.profile);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(DUMMY_DATA[role] ?? DUMMY_DATA.USER);

  // Fetch profile on mount and whenever navigating back to this page
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch, role, location.key]);

  // Update local state when profile is fetched
  useEffect(() => {
    if (profile) {
      // Auth endpoint returns { user, roles, kycStatus }
      // User endpoint returns a flat object directly
      const userData = profile.user || profile;
      const userProfile = userData.profile || {};

      // Build full avatar URL
      const avatarPath = userProfile.avatar_url || userData.avatar_url || userData.avatar || "";
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      const fullAvatarUrl = avatarPath && avatarPath.startsWith('/')
        ? `${baseUrl}${avatarPath}`
        : avatarPath;

      setProfileData((prev) => ({
        ...prev,
        user: {
          name: userProfile.name || userData.name || userData.fullName || "",
          email: userData.email || "",
          avatar: fullAvatarUrl,
          memberSince: userData.createdAt
            ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : "",
          userId: userData.userId || userData.id || userData._id || "",
        },
        personalInfo: {
          fullName: userProfile.name || userData.name || userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone_number || userData.phoneNumber || userData.mobile || "",
          city: userProfile.city || userData.city || "",
          state: userProfile.state || userData.state || "",
          kycStatus: profile.kycStatus || userData.kycStatus || "NOT_STARTED",
        },
      }));
    }
  }, [profile]);

  const handleSavePersonalInfo = async (updatedInfo) => {
    const backendData = {
      name: updatedInfo.fullName,
      email: updatedInfo.email,
      phone_number: updatedInfo.phone,
      city: updatedInfo.city,
      state: updatedInfo.state,
    };

    const result = await dispatch(updateProfile(backendData));
    if (result.type === 'profile/updateProfile/fulfilled') {
      await dispatch(fetchProfile());
    }

    setProfileData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updatedInfo },
      user: {
        ...prev.user,
        name: updatedInfo.fullName || prev.user.name,
        email: updatedInfo.email || prev.user.email,
      },
    }));
    setIsEditing(false);
  };

  const handlePhotoUpdate = async (photoUrl) => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const fullPhotoUrl = photoUrl && photoUrl.startsWith('/')
      ? `${baseUrl}${photoUrl}`
      : photoUrl;

    setProfileData((prev) => ({
      ...prev,
      user: { ...prev.user, avatar: fullPhotoUrl },
    }));

    await dispatch(fetchProfile());
  };



  const renderTab = () => {
    switch (activeTab) {
      case 0: return <PersonalTab personalInfo={profileData.personalInfo} isEditing={isEditing} onSave={handleSavePersonalInfo} />;
      case 1: return <AddressTab addresses={profileData.addresses} />;
      case 2: return <SecurityTab security={profileData.security} />;
      case 3: return <SettingsTab settings={profileData.settings} />;
      default: return null;
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #a855f7, #6366f1)" }} />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <ProfileHeader 
          user={{
            ...profileData.user,
            kycStatus: profileData.personalInfo.kycStatus
          }}
          isEditing={isEditing} 
          onEditProfile={() => setIsEditing(true)} 
          onCancel={() => setIsEditing(false)}
          onPhotoUpdate={handlePhotoUpdate}
          role={role}
        />

        <StatsSection stats={profileData.stats} />

        {/* KYC banner — only for USER role when not approved */}
        {role === "USER" && profileData.personalInfo.kycStatus !== KYC_STATUS.APPROVED && (
          <div className={`flex items-center justify-between gap-4 rounded-xl px-5 py-4 border ${
            profileData.personalInfo.kycStatus === KYC_STATUS.PENDING
              ? "bg-yellow-50 border-yellow-200"
              : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED
              ? "bg-red-50 border-red-200"
              : "bg-orange-50 border-orange-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                profileData.personalInfo.kycStatus === KYC_STATUS.PENDING ? "bg-yellow-400"
                : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED ? "bg-red-500"
                : "bg-orange-500"
              }`}>
                <span className="text-white text-base">
                  {profileData.personalInfo.kycStatus === KYC_STATUS.PENDING ? "⏳"
                    : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED ? "⚠️"
                    : "📋"}
                </span>
              </div>
              <div>
                <p className={`text-sm font-semibold ${
                  profileData.personalInfo.kycStatus === KYC_STATUS.PENDING ? "text-yellow-800"
                  : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED ? "text-red-800"
                  : "text-orange-800"
                }`}>
                  {profileData.personalInfo.kycStatus === KYC_STATUS.PENDING
                    ? "KYC verification is under review"
                    : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED
                    ? "Your KYC was rejected"
                    : "Complete your KYC verification"}
                </p>
                <p className={`text-xs mt-0.5 ${
                  profileData.personalInfo.kycStatus === KYC_STATUS.PENDING ? "text-yellow-700"
                  : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED ? "text-red-700"
                  : "text-orange-700"
                }`}>
                  {profileData.personalInfo.kycStatus === KYC_STATUS.PENDING
                    ? "We'll notify you once it's approved. Usually takes a few hours."
                    : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED
                    ? "Please resubmit your documents to continue using all features."
                    : "Verify your identity to unlock all platform features."}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(RoutePath.KYC_PAN)}
              className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-white ${
                profileData.personalInfo.kycStatus === KYC_STATUS.PENDING
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {profileData.personalInfo.kycStatus === KYC_STATUS.PENDING ? "View Status"
                : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED ? "Resubmit KYC"
                : "Start KYC"}
            </button>
          </div>
        )}

        <div className="flex gap-2 w-full overflow-x-auto no-scrollbar">          
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`min-w-[140px] text-sm px-5 py-2.5 rounded-lg whitespace-nowrap transition-all duration-150 ${
                activeTab === i
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 font-medium hover:border-blue-300 hover:text-blue-600 shadow-sm"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-64">
          {renderTab()}
        </div>
      </div>
    </div>
  );
};


export default ProfileLayout;