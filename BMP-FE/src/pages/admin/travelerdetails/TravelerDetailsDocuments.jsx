import React, { useState } from "react";
import { FiFileText, FiEye, FiCheckCircle, FiXCircle } from "react-icons/fi";

// Derive the server root from VITE_API_URL (strip the /api suffix).
// Falls back to empty string so relative URLs still work in dev.
const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

const DocumentCard = ({ label, docNumber, fileUrl, verified }) => {
  const [preview, setPreview] = useState(false);
  const fullUrl = fileUrl ? `${BASE_URL}/${fileUrl}` : null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 w-12 h-12 flex items-center justify-center rounded-lg">
            <FiFileText size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{label}</h4>
            {docNumber && <p className="text-sm text-gray-500">{docNumber}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {verified
            ? <FiCheckCircle className="text-green-500" size={20} />
            : <FiXCircle className="text-gray-400" size={20} />}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {verified ? "Verified" : "Pending"}
          </span>
        </div>
      </div>

      {fullUrl && (
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
          >
            <FiEye size={14} />
            View
          </button>
        </div>
      )}

      {preview && fullUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreview(false)}
        >
          <img
            src={fullUrl}
            alt={label}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const TravelerDetailsDocuments = ({ traveler = {} }) => {
  const isApproved = traveler.kyc_status === "APPROVED";

  const docs = [
    { label: "Aadhar Card (Front)", docNumber: traveler.aadhar_number, fileUrl: traveler.aadhar_front, verified: isApproved && !!traveler.aadhar_front },
    { label: "Aadhar Card (Back)",  docNumber: traveler.aadhar_number, fileUrl: traveler.aadhar_back,  verified: isApproved && !!traveler.aadhar_back },
    { label: "PAN Card",            docNumber: traveler.pan_number,    fileUrl: traveler.pan_front,    verified: isApproved && !!traveler.pan_front },
    { label: "Driving License",     docNumber: traveler.driving_number, fileUrl: traveler.driving_photo, verified: isApproved && !!traveler.driving_photo },
    { label: "Selfie",              docNumber: null,                   fileUrl: traveler.selfie,       verified: isApproved && !!traveler.selfie },
  ].filter(d => d.fileUrl || d.docNumber);

  const verifiedCount = docs.filter(d => d.verified).length;
  const pct = docs.length > 0 ? Math.round((verifiedCount / docs.length) * 100) : 0;

  return (
    <div className="mt-6">

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Document Verification</h3>
            <p className="text-sm opacity-90">{verifiedCount} of {docs.length} documents verified</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{pct}%</div>
            <p className="text-sm opacity-90">Complete</p>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div className="bg-white rounded-full h-2 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-4">
        Uploaded Documents ({docs.length})
      </h3>

      {docs.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc, i) => (
            <DocumentCard key={i} {...doc} />
          ))}
        </div>
      )}

      {/* Bank Details */}
      {(traveler.account_number || traveler.bank_name) && (
        <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiFileText className="text-green-500" size={18} />
            Bank Details
            {traveler.bank_verified && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Account Holder</p>
              <p className="font-medium text-gray-900">{traveler.account_holder || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Account Number</p>
              <p className="font-medium text-gray-900">
                {traveler.account_number ? `****${traveler.account_number.slice(-4)}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Bank Name</p>
              <p className="font-medium text-gray-900">{traveler.bank_name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">IFSC Code</p>
              <p className="font-medium text-gray-900">{traveler.ifsc || "—"}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TravelerDetailsDocuments;
