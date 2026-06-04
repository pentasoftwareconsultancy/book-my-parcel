import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMapPin, FiChevronDown, FiChevronUp, FiArrowLeft } from "react-icons/fi";
import { RiTruckLine } from "react-icons/ri";
import { LuMessageSquare, LuUser } from "react-icons/lu";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { showToast } from "../../core/utils/toast.util";

const DISPUTE_REASONS = [
  "Traveler asking extra money",
  "Traveler unreachable",
  "Wrong pickup location",
  "Traveler not coming for pickup",
  "Traveler deviated route",
];

const DisputePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read the order passed from handleDispute
  const order = location.state?.order;

  const bookingId = order?.deliveryId || order?.id || order?.booking_id || order?.bookingId;

  const [selectedReason, setSelectedReason] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingDispute, setExistingDispute] = useState(null);
  const [checkingDispute, setCheckingDispute] = useState(false);

  // Check if dispute already exists for this booking
  useEffect(() => {
    if (bookingId && !submitted) {
      setCheckingDispute(true);
      ApiService.apiget(ServerUrl.API_DISPUTE_MY)
        .then(res => {
          if (res?.data?.data && Array.isArray(res.data.data)) {
            // Check if there's already a dispute for this booking
            const existing = res.data.data.find(d => d.booking_id === bookingId || d?.booking?.id === bookingId);
            if (existing) {
              setExistingDispute(existing);
              console.log("✅ Dispute already exists for this booking:", existing);
            }
          }
        })
        .catch(err => {
          console.log("⚠️ Could not fetch existing disputes:", err.message);
        })
        .finally(() => setCheckingDispute(false));
    }
  }, [order, submitted]);

  // If no order data, show error
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-sm w-full text-center space-y-4">
          <p className="text-red-500 font-medium">No order data found.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast("Please select a reason", "error");
      return;
    }
    setSubmitting(true);
    try {
      await ApiService.apipost(ServerUrl.API_DISPUTE_CREATE, {
        booking_id: bookingId,
        dispute_type: selectedReason,
        description,
        role: "USER",  // ✅ Explicitly set role for user disputes
      });
      showToast("Dispute submitted successfully!", "success");
      setSubmitted(true);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to submit dispute", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Show success screen if dispute already submitted or exists
  if (submitted || existingDispute) {
    const isExisting = !!existingDispute && !submitted;
    return <SuccessScreen onBack={() => navigate(-1)} isExisting={isExisting} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition text-sm"
        >
          <FiArrowLeft size={16} /> Back to Orders
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6">
          Dispute
        </h1>

        {/* Order Summary Card */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-6 space-y-5 mb-6">

          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold">#{order.parcel_ref}</h2>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-50 text-blue-600 flex items-center gap-1">
                  <RiTruckLine size={11} />
                  {order.status}
                </span>
              </div>
              {order.tracking_ref && (
                <p className="text-xs text-gray-400 mt-1">
                  Tracking: {order.tracking_ref}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-700">₹{order.amount}</p>
              <p className="text-xs text-gray-400">Booked on {order.bookedDate}</p>
            </div>
          </div>

          {/* Route */}
          <div className="grid grid-cols-3 items-center gap-3">
            <div className="flex items-start gap-2">
              <div className="bg-green-100 text-green-600 p-2 rounded-full shrink-0">
                <FiMapPin size={14} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pickup</p>
                <p className="font-semibold text-sm">{order.pickup?.city}</p>
                <p className="text-xs text-gray-400 leading-tight">{order.pickup?.address}</p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-1">
              <div className="h-px flex-1 bg-gray-200" />
              <RiTruckLine className="text-blue-600 text-xl shrink-0" />
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex items-start gap-2">
              <div className="bg-red-100 text-red-500 p-2 rounded-full shrink-0">
                <FiMapPin size={14} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Delivery</p>
                <p className="font-semibold text-sm">{order.delivery?.city}</p>
                <p className="text-xs text-gray-400 leading-tight">{order.delivery?.address}</p>
              </div>
            </div>
          </div>

          {/* Package + Traveler */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">
                Package Details
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400">Size</p>
                  <p className="font-medium">{order.package?.size || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Weight</p>
                  <p className="font-medium">{order.package?.weight || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">ETA</p>
                  <p className="font-medium">{order.package?.eta || "—"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">
                Traveler Details
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white w-9 h-9 flex items-center justify-center rounded-full shrink-0">
                  <LuUser size={16} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{order.traveler?.name || "Not Assigned"}</p>
                  <p className="text-xs text-gray-400">
                    ⭐ {order.traveler?.rating || "N/A"} &nbsp;•&nbsp; {order.traveler?.phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Identifiers */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[10px] text-gray-400">Parcel ID</p>
              <p className="font-medium text-xs break-all">{order.parcel_ref || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Booking ID</p>
              <p className="font-medium text-xs break-all">{order.booking_ref || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Tracking ID</p>
              <p className="font-medium text-xs break-all">{order.tracking_ref || "—"}</p>
            </div>
          </div>
        </div>

        {/* Dispute Form */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-6 space-y-5">

          {/* Reason Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select dispute reason <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition
                  ${selectedReason ? "border-blue-500 text-gray-800" : "border-gray-200 text-gray-400"}
                  bg-white hover:border-blue-400`}
              >
                <span>{selectedReason || "Select reason"}</span>
                {dropdownOpen
                  ? <FiChevronUp size={16} className="text-gray-500" />
                  : <FiChevronDown size={16} className="text-gray-500" />
                }
              </button>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {DISPUTE_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setSelectedReason(reason);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition
                        ${selectedReason === reason ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition
              ${selectedReason && !submitting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <LuMessageSquare size={16} /> Submit Dispute
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuccessScreen = ({ onBack, isExisting }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-3xl shadow-2xl border border-green-200 p-12 max-w-md w-full text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center border-4 border-green-500 animate-bounce text-5xl">
          ✓
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isExisting ? "Dispute Already Submitted" : "Dispute Submitted!"}
        </h2>
        <p className="text-lg text-green-600 font-medium">
          {isExisting ? "Your dispute is under review" : "Your dispute has been received"}
        </p>
      </div>

      {/* Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-gray-700">
          {isExisting 
            ? "You have already submitted a dispute for this booking." 
            : "Thank you for reporting this issue."
          }
        </p>
        <p className="text-sm text-gray-600">
          Our support team will review your dispute and get back to you within 24–48 hours.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onBack}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105 text-base"
      >
        Back to Orders
      </button>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Status: {isExisting ? "Under Review" : "Open"}</span>
      </div>
    </div>
  </div>
);

export default DisputePage;