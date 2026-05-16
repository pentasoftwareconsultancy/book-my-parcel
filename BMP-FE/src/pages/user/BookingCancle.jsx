import React, { useState, useEffect } from "react";
import {
  XCircle,
  AlertTriangle,
  MapPin,
  RefreshCcw,
  IndianRupee,
  Clock,
  User,
  Copy,
  Package,
  MoreHorizontal,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError } from "../../core/utils/toast.util";

// Cancel Reasons
const reasons = [
  { id: "address", title: "Wrong pickup/delivery address", desc: "I entered incorrect address details", icon: <MapPin className="w-5 h-5 text-red-500" /> },
  { id: "plans", title: "Change of plans", desc: "I no longer need to send this parcel", icon: <RefreshCcw className="w-5 h-5 text-blue-500" /> },
  { id: "price", title: "Price too high", desc: "Found a better delivery option", icon: <IndianRupee className="w-5 h-5 text-yellow-500" /> },
  { id: "timing", title: "Delivery timing issue", desc: "Estimated delivery time doesn't work", icon: <Clock className="w-5 h-5 text-pink-500" /> },
  { id: "traveler", title: "Traveler concerns", desc: "Not comfortable with assigned traveler", icon: <User className="w-5 h-5 text-purple-500" /> },
  { id: "duplicate", title: "Duplicate booking", desc: "I accidentally booked this twice", icon: <Copy className="w-5 h-5 text-indigo-500" /> },
  { id: "package", title: "Package preparation issue", desc: "Unable to prepare package in time", icon: <Package className="w-5 h-5 text-orange-500" /> },
  { id: "other", title: "Other reason", desc: "Please specify in additional details", icon: <MoreHorizontal className="w-5 h-5 text-gray-500" /> },
];

const BookingCancel = ({ parcelId, onClose }) => {
  const [selected, setSelected] = useState("address");
  const [text, setText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProceedCancel = async () => {
    try {
      setLoading(true);
      
      const response = await ApiService.cancelParcel(parcelId, {
        reason: selected,
        details: text
      });

      if (response?.data?.success) {
        showSuccess("Parcel cancelled successfully");
        setShowModal(true);
      } else {
        showError("Failed to cancel parcel. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling parcel:", error);
      showError(error.response?.data?.message || "Failed to cancel parcel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-close after success
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showModal, onClose]);

  return (
    <>
      {/* MAIN CANCEL FORM */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
  <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[100vh] overflow-y-auto p-8 text-center">

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-red-600 p-2 rounded-lg">
              <XCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Cancel Booking</h1>
              <p className="text-gray-500 text-sm">
                We're sorry to see you cancel. Help us understand why.
              </p>
            </div>
          </div>

          {/* Notice */}
          <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
            <AlertTriangle className="text-orange-500 w-5 h-5 mt-1" />
            <div>
              <p className="font-semibold text-orange-700 text-sm">Important Notice</p>
              <p className="text-sm text-orange-600">
                Cancelling this booking may result in cancellation charges.
                Refunds will be processed within 5–7 business days if applicable.
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <h2 className="font-semibold mb-4">Please select a reason for cancellation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {reasons.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`text-left border rounded-xl p-4 transition
                  ${selected === item.id ? "border-red-400 ring-1 ring-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-start gap-3">
                  {item.icon}
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <label className="text-sm font-medium">
              Additional details <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Please provide any additional information..."
              className="w-full mt-2 border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">{text.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="border border-gray-900 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition"
              onClick={onClose}
              disabled={loading}
            >
              Keep Booking
            </button>

            <button
              onClick={handleProceedCancel}
              disabled={loading}
              className={`${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"} text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 justify-center transition`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Proceed to Cancel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================== CANCELLED CONFIRMATION MODAL ================== */}
      {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative">

            {/* Close */}
            <button
              onClick={() => {
                setShowModal(false);
                onClose();
              }}
              className="absolute top-8 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-red-500 mb-2">Booking Cancelled</h2>

            <p className="text-gray-500 text-sm mb-6">
              Your parcel has been cancelled successfully.
            </p>

            {/* Parcel ID */}
            <div className="bg-blue-50 rounded-xl py-4 px-6 mb-6 w-60 mx-auto">
              <p className="text-xs text-gray-400 mb-1">Parcel ID</p>
              <p className="text-red-500 font-semibold tracking-wide text-lg">{parcelId}</p>
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 mb-6">
              You will be redirected to dashboard in a moment...
            </p>

            {/* Dashboard Button */}
            <button
              onClick={() => {
                setShowModal(false);
                onClose();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCancel;
