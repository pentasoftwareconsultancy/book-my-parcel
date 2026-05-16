// components/KycResultCard.jsx

import KycStatusBadge from "./kycStatusBadge";

const KycResultCard = ({ data, type }) => {
  if (!data) return null;

  // Handle BANK type differently
  if (type === 'BANK') {
    return (
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bank Verification Complete</h3>
              <p className="text-green-200 text-xs">Your bank account has been verified</p>
            </div>
          </div>
          <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            VERIFIED
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Bank Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-green-600 rounded"></div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Bank Account Details
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Info label="Bank Name" value={data.bank_name || data.bankName || "-"} />
              <Info label="Account Number" value={data.account_number ? `****${data.account_number.slice(-4)}` : "-"} />
              <Info label="IFSC Code" value={data.ifsc_code || data.ifsc || "-"} />
              <Info label="Recipient Name" value={data.recipient_name || data.recipientName || "-"} />
              <Info label="Mobile Number" value={data.mobile_number || data.mobileNumber || "-"} />
              <Info label="Verification Amount" value="₹1 Credited" />
            </div>
          </div>

          {/* Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">Bank Account Verified</p>
                <p className="text-xs text-green-600 mt-1">You can now receive withdrawal payments to this account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAN type (existing code)
  const { personal_info = {}, contact_info = {}, kyc_status = {} } = data;

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">

      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{type} Verification Result</h3>
            <p className="text-blue-200 text-xs">Identity verified successfully</p>
          </div>
        </div>
        <KycStatusBadge status={kyc_status.kyc_status} />
      </div>

      <div className="p-6 space-y-6">

        {/* Personal Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-600 rounded"></div>
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Personal Information
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Info label="PAN Number" value={personal_info.pan_number} />
            <Info label="Registered Name" value={personal_info.registered_name} />
            <Info label="First Name" value={personal_info.first_name} />
            <Info label="Last Name" value={personal_info.last_name || "-"} />
            <Info label="Gender" value={personal_info.gender} />
            <Info label="PAN Type" value={personal_info.pan_type} />
            <Info label="Date of Birth" value={personal_info.date_of_birth} />
            <Info label="Provided Name" value={personal_info.provided_name} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Contact Information */}
        {contact_info.full_address && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-purple-500 rounded"></div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Contact Information
              </h4>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Full Address</p>
              <p className="text-sm font-medium text-gray-800">{contact_info.full_address || "-"}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* KYC Status */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-green-500 rounded"></div>
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              KYC Status
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusInfo
              label="KYC Status"
              value={kyc_status.kyc_status}
              icon="🔐"
            />
            <StatusInfo
              label="Masked Aadhaar"
              value={kyc_status.masked_aadhaar}
              icon="🪪"
            />
            <StatusInfo
              label="Aadhaar Linked"
              value={kyc_status.aadhaar_linked ? "Yes" : "No"}
              icon={kyc_status.aadhaar_linked ? "✅" : "❌"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-800 break-words">{value || "-"}</p>
  </div>
);

const StatusInfo = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || "-"}</p>
    </div>
  </div>
);

export default KycResultCard;
