import { useState, useEffect, useRef } from "react";
import { FiCheckCircle, FiHome } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../core/services/api.service";
import { showToast } from "../../core/utils/toast.util";
import RoutePath from "../../core/constants/routes.constant";
import ServerUrl from "../../core/constants/serverUrl.constant";

/**
 * DropOTP — Traveller enters the OTP from the recipient to confirm delivery.
 * Also allows uploading a proof-of-delivery photo.
 */
const TravelerDropOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const stateBooking = location.state?.booking;
  const queryBookingId = new URLSearchParams(location.search).get("bookingId");

  const [bookingId, setBookingId] = useState(
    stateBooking?.id || queryBookingId || ""
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [startingDelivery, setStartingDelivery] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [error, setError] = useState("");

  // Proof of delivery
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (stateBooking?.id && stateBooking.status === "IN_TRANSIT") {
      handleStartDelivery(stateBooking.id);
    }
  }, []);

  const handleStartDelivery = async (id = bookingId) => {
    if (!id) { setError("Please enter a booking ID"); return; }
    try {
      setStartingDelivery(true);
      setError("");
      await ApiService.startDelivery(id);
      setOtpSent(true);
      showToast("OTP sent to recipient's phone!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start delivery";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setStartingDelivery(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await ApiService.verifyDelivery(bookingId, otp);
      setDelivered(true);
      showToast("Delivery verified! Great job.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProofSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleUploadProof = async () => {
    if (!proofFile || !bookingId) return;
    try {
      setUploadingProof(true);
      await ApiService.uploadProof(bookingId, "DELIVERY", proofFile);
      setProofUploaded(true);
      showToast("Proof of delivery uploaded.", "success");
    } catch (err) {
      showToast("Failed to upload proof. You can try again.", "error");
    } finally {
      setUploadingProof(false);
    }
  };

  // ── Delivered success screen ──────────────────────────────────────────────
  if (delivered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Delivery Complete!</h1>
          <p className="text-gray-500 text-sm mb-6">
            The parcel has been successfully delivered. Your earnings have been credited to your wallet.
          </p>

          {/* Proof of delivery upload */}
          {!proofUploaded ? (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Upload Proof of Delivery (optional but recommended)
              </p>
              <p className="text-xs text-blue-600 mb-3">
                A photo helps resolve any disputes and builds trust with senders.
              </p>

              {proofPreview && (
                <img
                  src={proofPreview}
                  alt="Proof preview"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleProofSelect}
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border border-blue-400 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                >
                  {proofFile ? "Change Photo" : "Take / Choose Photo"}
                </button>
                {proofFile && (
                  <button
                    onClick={handleUploadProof}
                    disabled={uploadingProof}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {uploadingProof ? "Uploading..." : "Upload"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <FiCheckCircle size={16} /> Proof of delivery uploaded successfully
            </div>
          )}

          <button
            onClick={() => navigate(RoutePath.TRAVELER_COMPLETED)}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            View Completed Deliveries
          </button>
          <button
            onClick={() => navigate(RoutePath.TRAVELER_DELIVERIES)}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Active Deliveries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHome size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Verification</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter the OTP shared by the recipient to confirm delivery
          </p>
        </div>

        {/* Booking ID input */}
        {!stateBooking && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking ID
            </label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Start Delivery Button */}
        {!otpSent && (
          <button
            onClick={() => handleStartDelivery()}
            disabled={startingDelivery || !bookingId}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {startingDelivery ? "Sending OTP..." : "Send OTP to Recipient"}
          </button>
        )}

        {/* OTP Form */}
        {otpSent && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center flex items-center justify-center gap-2">
              <FiCheckCircle size={16} /> OTP sent to recipient's phone. Ask them to share it with you.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP from Recipient
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="• • • •"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Complete Delivery"}
            </button>

            <button
              type="button"
              onClick={() => handleStartDelivery()}
              disabled={startingDelivery}
              className="w-full text-sm text-green-600 hover:underline"
            >
              Resend OTP
            </button>
          </form>
        )}

        {error && !otpSent && (
          <p className="text-red-600 text-sm text-center mt-2">{error}</p>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default TravelerDropOTP;
