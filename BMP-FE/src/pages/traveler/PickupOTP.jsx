import { useState, useEffect } from "react";
import { FiPackage, FiCheckCircle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ApiService from "../../core/services/api.service";
import { showToast } from "../../core/utils/toast.util";
import RoutePath from "../../core/constants/routes.constant";

/**
 * PickupOTP — Traveller enters the OTP received from the sender to confirm pickup.
 * Can be reached from:
 *   - TravelerDashboard → "Start Pickup" button (passes booking via location.state)
 *   - Direct navigation to /traveler/pickup-otp?bookingId=xxx
 */
const TravelerPickupOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Accept booking from navigation state OR query param
  const stateBooking = location.state?.booking;
  const queryBookingId = new URLSearchParams(location.search).get("bookingId");

  const [booking, setBooking] = useState(stateBooking || null);
  const [bookingId, setBookingId] = useState(
    stateBooking?.id || queryBookingId || ""
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [startingPickup, setStartingPickup] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  // Auto-start pickup if we have a booking passed in
  useEffect(() => {
    if (stateBooking?.id && stateBooking.status === "CONFIRMED") {
      handleStartPickup(stateBooking.id);
    }
  }, []);

  const handleStartPickup = async (id = bookingId) => {
    if (!id) {
      setError("Please enter a booking ID");
      return;
    }
    try {
      setStartingPickup(true);
      setError("");
      await ApiService.startPickup(id);
      setOtpSent(true);
      showToast("OTP sent to sender's phone!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start pickup";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setStartingPickup(false);
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
      await ApiService.verifyPickup(bookingId, otp);
      showToast("Pickup verified! Parcel collected.", "success");
      navigate(RoutePath.TRAVELER_DELIVERIES);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pickup Verification</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter the OTP shared by the sender to confirm parcel pickup
          </p>
        </div>

        {/* Booking ID input (if not passed via state) */}
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

        {/* Start Pickup Button */}
        {!otpSent && (
          <button
            onClick={() => handleStartPickup()}
            disabled={startingPickup || !bookingId}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {startingPickup ? "Sending OTP..." : "Send OTP to Sender"}
          </button>
        )}

        {/* OTP Form */}
        {otpSent && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center flex items-center justify-center gap-2">
              <FiCheckCircle size={16} /> OTP sent to sender's phone. Ask them to share it with you.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP from Sender
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              {loading ? "Verifying..." : "Verify & Confirm Pickup"}
            </button>

            <button
              type="button"
              onClick={() => handleStartPickup()}
              disabled={startingPickup}
              className="w-full text-sm text-blue-600 hover:underline"
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

export default TravelerPickupOTP;
