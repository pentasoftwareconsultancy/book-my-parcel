import React from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const DetailsOverview = ({ user = {} }) => {
  const kycApproved = user.kyc_verified;

  const VerifyCard = ({ label, verified }) => (
    <div className={`border p-3 sm:p-4 rounded-lg flex items-center justify-between ${
      verified ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
    }`}>
      <div>
        <p className="font-medium text-sm sm:text-base">{label}</p>
        <p className="text-xs sm:text-sm text-gray-500">{verified ? "Verified" : "Not Verified"}</p>
      </div>
      {verified
        ? <FiCheckCircle className="text-green-500 text-lg sm:text-xl" />
        : <FiXCircle className="text-gray-400 text-lg sm:text-xl" />}
    </div>
  );

  return (
    <div>

      <div className="mt-6">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">Verification Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <VerifyCard label="Email" verified={!!user.email} />
          <VerifyCard label="Phone" verified={!!user.phone_number} />
          <VerifyCard label="KYC Status" verified={kycApproved} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg">
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Account Information</h3>
          <div className="space-y-3 sm:space-y-4 text-sm">
            <div><p className="text-gray-500">User ID</p><p className="font-medium">{user.id}</p></div>
            <div><p className="text-gray-500">KYC Status</p><p className="font-medium">{user.kyc_status || "NOT_STARTED"}</p></div>
            <div><p className="text-gray-500">Joined Date</p><p className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p></div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg">
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Contact Information</h3>
          <div className="space-y-3 sm:space-y-4 text-sm">
            <div><p className="text-gray-500">Email</p><p className="font-medium break-words">{user.email || "—"}</p></div>
            <div><p className="text-gray-500">Phone</p><p className="font-medium">{user.phone_number || "—"}</p></div>
            <div><p className="text-gray-500">Location</p><p className="font-medium">{[user.city, user.state].filter(Boolean).join(", ") || "—"}</p></div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-5">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">Activity Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div><p className="text-base sm:text-lg font-semibold">{Number(user.total_bookings) || 0}</p><p className="text-xs sm:text-sm text-gray-500">Total Bookings</p></div>
          <div><p className="text-base sm:text-lg font-semibold">₹{Number(user.total_spent || 0).toLocaleString()}</p><p className="text-xs sm:text-sm text-gray-500">Amount Spent</p></div>
          <div><p className="text-base sm:text-lg font-semibold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p><p className="text-xs sm:text-sm text-gray-500">Joined Date</p></div>
        </div>
      </div>

    </div>
  );
};

export default DetailsOverview;