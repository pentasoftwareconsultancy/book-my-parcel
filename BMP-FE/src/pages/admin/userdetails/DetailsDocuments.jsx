import React from "react";
import { FiMail, FiPhone, FiCheckCircle, FiXCircle, FiUser, FiMapPin } from "react-icons/fi";

const VerifyRow = ({ icon, label, value, verified }) => (
  <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${verified ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
      <div className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${verified ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-800">{label}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{value || "—"}</p>
      </div>
    </div>
    {verified
      ? <FiCheckCircle className="text-green-500 flex-shrink-0" size={16} />
      : <FiXCircle className="text-gray-300 flex-shrink-0" size={16} />}
  </div>
);

const DetailsDocuments = ({ user = {} }) => {
  const kycVerified = user.kyc_verified || user.kyc_status === "APPROVED";

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Verification & Documents</h2>
        <span className={`text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${kycVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          KYC {kycVerified ? "Verified" : "Pending"}
        </span>
      </div>

      {/* Contact Verification */}
      <div className="mb-5 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Verification</h3>
        <div className="space-y-2 sm:space-y-3">
          <VerifyRow
            icon={<FiMail size={14} className="sm:w-4 sm:h-4" />}
            label="Email Address"
            value={user.email}
            verified={!!user.email}
          />
          <VerifyRow
            icon={<FiPhone size={14} className="sm:w-4 sm:h-4" />}
            label="Phone Number"
            value={user.phone_number}
            verified={!!user.phone_number}
          />
        </div>
      </div>

      {/* Identity Verification */}
      <div className="mb-5 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Identity Verification</h3>
        <div className="space-y-2 sm:space-y-3">
          <VerifyRow
            icon={<FiUser size={14} className="sm:w-4 sm:h-4" />}
            label="KYC Status"
            value={user.kyc_status || "NOT_STARTED"}
            verified={kycVerified}
          />
          <VerifyRow
            icon={<FiMapPin size={14} className="sm:w-4 sm:h-4" />}
            label="Location"
            value={[user.city, user.state].filter(Boolean).join(", ") || "Not provided"}
            verified={!!(user.city || user.state)}
          />
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 sm:mb-4">Account Details</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-[10px] sm:text-xs mb-1">User ID</p>
            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">{user.id || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] sm:text-xs mb-1">Joined</p>
            <p className="font-medium text-gray-800 text-xs sm:text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] sm:text-xs mb-1">Total Bookings</p>
            <p className="font-medium text-gray-800 text-xs sm:text-sm">{Number(user.total_bookings) || 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] sm:text-xs mb-1">Total Spent</p>
            <p className="font-medium text-gray-800 text-xs sm:text-sm">₹{Number(user.total_spent || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsDocuments;
