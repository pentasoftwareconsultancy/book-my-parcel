import React from "react";
import { FiMail, FiPhone, FiCheckCircle, FiXCircle, FiUser, FiMapPin } from "react-icons/fi";

const VerifyRow = ({ icon, label, value, verified }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border ${verified ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${verified ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{value || "—"}</p>
      </div>
    </div>
    {verified
      ? <FiCheckCircle className="text-green-500" size={18} />
      : <FiXCircle className="text-gray-300" size={18} />}
  </div>
);

const DetailsDocuments = ({ user = {} }) => {
  const kycVerified = user.kyc_verified || user.kyc_status === "APPROVED";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Verification & Documents</h2>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${kycVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          KYC {kycVerified ? "Verified" : "Pending"}
        </span>
      </div>

      {/* Contact Verification */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Verification</h3>
        <div className="space-y-3">
          <VerifyRow
            icon={<FiMail size={16} />}
            label="Email Address"
            value={user.email}
            verified={!!user.email}
          />
          <VerifyRow
            icon={<FiPhone size={16} />}
            label="Phone Number"
            value={user.phone_number}
            verified={!!user.phone_number}
          />
        </div>
      </div>

      {/* Identity Verification */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Identity Verification</h3>
        <div className="space-y-3">
          <VerifyRow
            icon={<FiUser size={16} />}
            label="KYC Status"
            value={user.kyc_status || "NOT_STARTED"}
            verified={kycVerified}
          />
          <VerifyRow
            icon={<FiMapPin size={16} />}
            label="Location"
            value={[user.city, user.state].filter(Boolean).join(", ") || "Not provided"}
            verified={!!(user.city || user.state)}
          />
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Account Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">User ID</p>
            <p className="font-medium text-gray-800 truncate">{user.id || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Joined</p>
            <p className="font-medium text-gray-800">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Total Bookings</p>
            <p className="font-medium text-gray-800">{Number(user.total_bookings) || 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Total Spent</p>
            <p className="font-medium text-gray-800">₹{Number(user.total_spent || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsDocuments;
