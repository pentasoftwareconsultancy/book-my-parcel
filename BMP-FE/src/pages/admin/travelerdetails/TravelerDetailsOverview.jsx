import React from "react";
import { FiCheckCircle, FiUser, FiTruck, FiActivity, FiAlertCircle } from "react-icons/fi";

const VerificationCard = ({ label, verified }) => (
  <div className={`border rounded-lg p-4 ${verified ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {verified
        ? <FiCheckCircle className="text-green-600" size={16} />
        : <FiAlertCircle className="text-yellow-500" size={16} />}
    </div>
    <p className={`text-xs font-medium ${verified ? "text-green-700" : "text-yellow-700"}`}>
      {verified ? "Verified" : "Pending"}
    </p>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-500">{label}</label>
    <p className="font-medium text-gray-900">{value || "—"}</p>
  </div>
);

const TravelerDetailsOverview = ({ traveler = {} }) => {
  const isKycApproved = traveler.kyc_status === "APPROVED";
  const totalDeliveries = Number(traveler.total_deliveries) || 0;
  const completedDeliveries = Number(traveler.completed_deliveries) || 0;
  const avgEarning = completedDeliveries > 0
    ? Math.round(Number(traveler.total_earnings) / completedDeliveries)
    : 0;

  return (
    <div className="space-y-6">

      {/* Verification Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <VerificationCard label="Partner Status"   verified={isKycApproved} />
        <VerificationCard label="License Verified" verified={!!traveler.driving_number} />
        <VerificationCard label="Aadhar Verified"  verified={!!traveler.aadhar_number} />
        <VerificationCard label="KYC Status"       verified={isKycApproved} />
      </div>

      <div className="grid grid-cols-2 gap-8">

        {/* Partner Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiUser className="text-purple-600" />
            Partner Information
          </h3>
          <div className="space-y-4">
            <Field label="Partner ID"  value={`#${String(traveler.id || "").slice(0, 8).toUpperCase()}`} />
            <Field label="Status"      value={isKycApproved ? "Verified" : traveler.kyc_status || "Pending"} />
            <Field label="Joined Date" value={traveler.createdAt ? new Date(traveler.createdAt).toLocaleDateString() : "—"} />
            <Field label="Location"    value={[traveler.city, traveler.state].filter(Boolean).join(", ") || "—"} />
            <Field label="Gender"      value={traveler.gender} />
            <Field label="Date of Birth" value={traveler.dob ? new Date(traveler.dob).toLocaleDateString() : "—"} />
          </div>
        </div>

        {/* Vehicle Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiTruck className="text-purple-600" />
            Vehicle Details
          </h3>
          <div className="space-y-4">
            <Field label="Vehicle Type"    value={traveler.vehicle_type} />
            <Field label="Vehicle Number"  value={traveler.license_number} />
            <Field label="Driving License" value={traveler.driving_number} />
            <Field label="License Verified" value={traveler.driving_number ? "Yes ✓" : "No"} />
            <Field label="Active Routes"   value={Number(traveler.active_routes) || 0} />
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiActivity className="text-green-600" />
          Performance Summary
        </h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalDeliveries}</div>
            <div className="text-sm text-gray-600">Total Deliveries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ₹{avgEarning.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Avg Earnings/Delivery</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Number(traveler.average_rating || 0).toFixed(1)}/5.0
            </div>
            <div className="text-sm text-gray-600">Customer Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Number(traveler.total_reviews) || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <Field label="Email"  value={traveler.email} />
            <Field label="Aadhar" value={traveler.aadhar_number} />
            <Field label="PAN"    value={traveler.pan_number} />
          </div>
          <div className="space-y-4">
            <Field label="Phone"          value={traveler.phone_number} />
            <Field label="Bank Account"   value={traveler.account_number ? `****${traveler.account_number.slice(-4)}` : "—"} />
            <Field label="Bank Name"      value={traveler.bank_name} />
            <Field label="IFSC"           value={traveler.ifsc} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default TravelerDetailsOverview;
