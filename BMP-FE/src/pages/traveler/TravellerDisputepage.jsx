import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMapPin, FiChevronDown, FiChevronUp, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { RiTruckLine } from "react-icons/ri";
import { LuMessageSquare, LuUser } from "react-icons/lu";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { showToast } from "../../core/utils/toast.util";

const DISPUTE_REASONS = [
  "User not available for pickup",
  "User asking to reduce price",
  "User not providing correct address",
  "User cancelled last minute",
  "User wants refund without reason",
  "Wrong delivery location provided",
];

const TravellerDisputepage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read the order passed from handleDispute
  const order = location.state?.order;
  const [fullBookingDetails, setFullBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedReason, setSelectedReason] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingDispute, setExistingDispute] = useState(null);
  const [checkingDispute, setCheckingDispute] = useState(false);

  // Fetch full booking details from traveller-specific endpoint
  useEffect(() => {
    const bookingId = order?.id || order?.booking_id || order?.deliveryId || order?.bookingId;
    
    if (bookingId) {
      setLoading(true);
      ApiService.apiget(`/traveller/dashboard/bookings/${bookingId}`)
        .then(res => {
          if (res?.data?.data) {
            setFullBookingDetails(res.data.data);
            console.log("✅ Full booking details fetched from traveller endpoint:", res.data.data);
          }
        })
        .catch(err => {
          console.log("⚠️ Could not fetch full booking details, using passed data:", err.message);
          // Continue with passed data
        })
        .finally(() => setLoading(false));
    }
  }, [order]);

  // Check if dispute already exists for this booking
  useEffect(() => {
    const bookingId = order?.id || order?.booking_id || order?.deliveryId || order?.bookingId;
    
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

  // Merge fetched details with passed order data
  const finalOrder = fullBookingDetails ? { ...order, ...fullBookingDetails } : order;
  
  // Get pickup city from various possible field names
  const pickupCity = finalOrder.pickup?.city || 
                     finalOrder.pickupAddress?.city || 
                     finalOrder.pickupLocation?.city || 
                     "—";
  
  // Get delivery city from various possible field names
  const deliveryCity = finalOrder.delivery?.city || 
                       finalOrder.deliveryAddress?.city || 
                       finalOrder.deliveryLocation?.city || 
                       "—";
  
  // Get user details from various possible field names
  const userName = finalOrder.user?.name || 
                   finalOrder.sender?.name || 
                   finalOrder.customerName || 
                   finalOrder.parcel?.user?.profile?.name ||
                   "User";
  
  const userPhone = finalOrder.user?.phone || 
                    finalOrder.sender?.phone || 
                    finalOrder.customerPhone || 
                    finalOrder.phone_number || 
                    finalOrder.parcel?.user?.phone_number ||
                    "—";
  
  // Get amount from various possible field names
  const amount = finalOrder.amount || finalOrder.price || finalOrder.earning || "0";
  
  // Get booking ID 
  const bookingId = finalOrder.id || finalOrder.booking_id || finalOrder.deliveryId || finalOrder.bookingId;
  
  // Get booking reference
  const bookingRef = finalOrder.booking_ref || finalOrder.bookingRef || finalOrder.id?.slice(0, 8) || bookingId?.slice(0, 8);
  
  // Get parcel reference
  const parcelRef = finalOrder.parcel_ref || finalOrder.parcel?.id || "—";
  
  // Get tracking reference
  const trackingRef = finalOrder.tracking_ref || "—";

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
        role: "TRAVELLER",  // ✅ Explicitly set role for traveller disputes
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
          <FiArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-6">
          Raise a Dispute
        </h1>

        {/* Order Summary Card */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-6 space-y-5 mb-6">

          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold">Booking #{bookingRef}</h2>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-50 text-blue-600 flex items-center gap-1">
                  <RiTruckLine size={11} />
                  {finalOrder.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-700">₹{amount}</p>
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
                <p className="font-semibold text-sm">{pickupCity}</p>
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
                <p className="font-semibold text-sm">{deliveryCity}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">
              User Details
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                <LuUser size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-gray-500">{userPhone}</p>
              </div>
            </div>
          </div>

          {/* Order Identifiers */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[10px] text-gray-400">Parcel ID</p>
              <p className="font-medium text-xs break-all">{finalOrder.parcel_ref || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Booking ID</p>
              <p className="font-medium text-xs break-all">{finalOrder.booking_ref || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Tracking ID</p>
              <p className="font-medium text-xs break-all">{finalOrder.tracking_ref || "—"}</p>
            </div>
          </div>
        </div>

        {/* Dispute Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Dispute
            </label>
            
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-3 border rounded-xl text-left flex items-center justify-between hover:bg-gray-50 transition bg-white"
              >
                <span className={selectedReason ? "text-gray-900" : "text-gray-400"}>
                  {selectedReason || "Select a reason"}
                </span>
                {dropdownOpen ? (
                  <FiChevronUp size={18} className="text-gray-500" />
                ) : (
                  <FiChevronDown size={18} className="text-gray-500" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-10">
                  {DISPUTE_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => {
                        setSelectedReason(reason);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 transition text-sm"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about this dispute..."
              className="w-full px-4 py-3 border rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows={5}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Note:</p>
            <p>Your dispute will be reviewed by our team within 24 hours. Please provide accurate information to help us resolve this faster.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <LuMessageSquare size={18} /> Submit Dispute
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Screen Component
const SuccessScreen = ({ onBack, isExisting }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-green-200 p-12 max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center border-4 border-green-500 animate-bounce">
            <FiCheckCircle size={36} className="text-green-600" />
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
              : "Thank you for providing details about your dispute."
            }
          </p>
          <p className="text-sm text-gray-600">
            Our team will review it within 24 hours and contact you with updates.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onBack}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105 text-base"
        >
          Back to Deliveries
        </button>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Status: {isExisting ? "Under Review" : "Open"}</span>
        </div>
      </div>
    </div>
  );
};

export default TravellerDisputepage;
