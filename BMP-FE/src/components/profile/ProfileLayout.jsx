import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProfile, updateProfile } from "../../store/slices/profileSlice.js";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import ProfileHeader from "./ProfileHeader";
import StatsSection from "./StatsSection";
import PersonalTab from "./PersonalTab.jsx";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";
// import SettingsTab from "./SettingTab.jsx";
import { KYC_STATUS, DELIVERY_STATUS } from "../../core/constants/app.constant";
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

const TABS = ["Personal Info", " Address", "Settings"];

const ProfileLayout = ({ role = "USER" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile, liveStats, loadingStats, loadingFetch: loading, error } = useSelector((state) => state.profile);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(DUMMY_DATA[role] ?? DUMMY_DATA.USER);

  // Fetch profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch, location.key]);

  // Calculate stats from orders/deliveries based on role
  useEffect(() => {
    if (role === "USER") {
      const calculateStats = async () => {
        try {
          const response = await ApiService.apiget(ServerUrl.API_USER_DASHBOARD_ORDERS);
          if (response?.data?.success) {
            const orders = response.data.data?.data || response.data.data || [];
            
            // Active deliveries = orders that are not delivered/cancelled/failed
            const activeStatuses = [
              DELIVERY_STATUS.CREATED,
              DELIVERY_STATUS.MATCHING,
              DELIVERY_STATUS.PARTNER_SELECTED,
              DELIVERY_STATUS.CONFIRMED,
              DELIVERY_STATUS.PICKUP,
              DELIVERY_STATUS.IN_TRANSIT
            ];
            
            const stats = {
              totalOrders: orders.length,
              completedBookings: orders.filter(o => 
                activeStatuses.includes(o.booking?.status)
              ).length,
              totalAmount: orders.reduce((sum, o) => {
                const amount = parseFloat(o.price_quote || o.value || 0);
                return sum + amount;
              }, 0),
            };
            
            console.log('📊 USER Calculated Stats:', stats);
            dispatch({ type: 'profile/setLiveStats', payload: stats });
          }
        } catch (err) {
          console.error('Failed to fetch user orders for stats:', err);
        }
      };
      
      calculateStats();
    } else if (role === "TRAVELLER") {
      const fetchTravellerStats = async () => {
        try {
          const response = await ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_STATS);
          if (response?.data?.success || response?.data) {
            const responseData = response.data?.data || response.data || {};
            const statsData = responseData?.stats || responseData || {};
            
            const stats = {
              totalDeliveries: statsData.completed || statsData.completedDeliveries || 0,
              totalEarnings: statsData.totalEarnings || statsData.total_earnings || 0,
              avgRating: statsData.rating || statsData.averageRating || 0,
            };
            
            console.log('📊 TRAVELLER Stats:', stats);
            dispatch({ type: 'profile/setLiveStats', payload: stats });
          }
        } catch (err) {
          console.error('Failed to fetch traveller stats:', err);
        }
      };
      
      fetchTravellerStats();
    }
  }, [dispatch, role, location.key, profile]);

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

      // Build addresses array from profile data
      const savedAddresses = [];
      if (userProfile.address || userProfile.city) {
        savedAddresses.push({
          id: "profile_address",
          type: "Home",
          name: userProfile.name || userData.name || "",
          line1: userProfile.address || "",
          line2: "",
          city: userProfile.city || "",
          state: userProfile.state || "",
          pincode: userProfile.pincode || "",
          phone: userData.phone_number || "",
          isDefault: true,
        });
      }

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
        addresses: savedAddresses,
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
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

        <StatsSection
          liveStats={liveStats}
          loadingStats={loadingStats}
          role={role}
        />

        {/* KYC banner — only for USER role when not approved */}
        {role === "USER" && profileData.personalInfo.kycStatus !== KYC_STATUS.APPROVED && (
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl px-4 sm:px-5 py-4 border ${
            profileData.personalInfo.kycStatus === KYC_STATUS.PENDING
              ? "bg-yellow-50 border-yellow-200"
              : profileData.personalInfo.kycStatus === KYC_STATUS.REJECTED
              ? "bg-red-50 border-red-200"
              : "bg-orange-50 border-orange-200"
          }`}>
            <div className="flex items-start sm:items-center gap-3">
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
              className={`self-start sm:self-auto flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-white ${
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
              className={`flex-1 sm:flex-none sm:min-w-[140px] text-sm px-3 sm:px-5 py-2.5 rounded-lg whitespace-nowrap transition-all duration-150 ${
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