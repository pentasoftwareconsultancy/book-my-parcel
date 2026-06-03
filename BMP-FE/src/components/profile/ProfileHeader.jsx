import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, CheckCircle, Calendar, X } from "lucide-react";
import ApiService from "../../core/services/api.service";
import { KYC_STATUS } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";

const ProfileHeader = ({
  user = {},
  isEditing,
  onEditProfile,
  onCancel,
  onAddRoute,
  onPhotoUpdate,
  role,
}) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handlePhotoClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = user.avatar 
        ? await ApiService.updateProfilePhoto(file)
        : await ApiService.uploadProfilePhoto(file);
      
      const photoUrl = response.data?.avatar_url 
        || response.data?.photoUrl 
        || response.data?.avatar 
        || response.data?.data?.avatar_url
        || response.data?.data?.photoUrl;
      
      if (photoUrl && onPhotoUpdate) {
        await onPhotoUpdate(photoUrl);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo');
    }
  };
  return (
    <div className="bg-white rounded-xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm border border-gray-100">
      
      {/* LEFT */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div 
            className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full bg-primary flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handlePhotoClick}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="8" r="4" fill="white" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="white" />
              </svg>
            )}
          </div>

          {isEditing && (
            <>
              <button 
                onClick={handlePhotoClick}
                type="button"
                className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-primary border-2 border-blue rounded-full flex items-center justify-center hover:bg-primary transition-colors"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-gray-900 leading-tight">
            {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {user.email}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
            {/* <span className="flex items-center gap-1 border border-green-400 text-green-600 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
              <CheckCircle size={11} /> KYC Verified
            </span> */}
            {user.kycStatus && (
             <span className={`flex items-center gap-1 border text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${
              user.kycStatus === KYC_STATUS.APPROVED 
                ? 'border-green-400 text-green-600' 
                : user.kycStatus === KYC_STATUS.PENDING
                ? 'border-yellow-400 text-yellow-600'
                : user.kycStatus === KYC_STATUS.REJECTED
                ? 'border-red-400 text-red-600'
                : 'border-gray-400 text-gray-600'
            }`}>
              <CheckCircle size={11} /> 
              {user.kycStatus === KYC_STATUS.APPROVED ? 'KYC Verified' 
                : user.kycStatus === KYC_STATUS.PENDING ? 'KYC Pending'
                : user.kycStatus === KYC_STATUS.REJECTED ? 'KYC Rejected'
                : 'KYC Not Started'}
            </span>
          )}


            <span className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs">
              <Calendar size={12} /> Member since {user.memberSince}
            </span>

            {/* <span className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="7" y1="9" x2="17" y2="9" />
                <line x1="7" y1="13" x2="13" y2="13" />
              </svg>
              User ID- {user.userId}
            </span> */}
          </div>
        </div>
      </div>

      {/* RIGHT BUTTONS */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Complete KYC button — shown to USER when KYC is not approved */}
        {role === "USER" && user.kycStatus !== KYC_STATUS.APPROVED && (
          <button
            onClick={() => navigate(RoutePath.KYC_PAN)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors ${
              user.kycStatus === KYC_STATUS.PENDING
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : user.kycStatus === KYC_STATUS.REJECTED
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            <CheckCircle size={14} />
            {user.kycStatus === KYC_STATUS.PENDING ? "KYC Pending — Check Status"
              : user.kycStatus === KYC_STATUS.REJECTED ? "KYC Rejected — Resubmit"
              : "Complete KYC"}
          </button>
        )}

        {role === "TRAVELLER" && (
          <button
            onClick={onAddRoute}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors"
          >
            <span className="text-base font-bold">+</span>
            Add Route
          </button>
        )}

        {isEditing ? (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:border-red-400 hover:text-red-500 text-gray-600 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors"
          >
            <X size={14} /> Cancel
          </button>
        ) : (
          <button
            onClick={onEditProfile}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;