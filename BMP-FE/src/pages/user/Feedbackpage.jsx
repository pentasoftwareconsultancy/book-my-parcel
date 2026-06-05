// src/pages/user/FeedbackPage.jsx
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// useParams — reads URL params like :bookingId from the route path
// useLocation — reads the state passed via navigate(..., { state })
import { FaStar } from "react-icons/fa";
import { FiCheckCircle, FiPackage } from "react-icons/fi";
import { LuUser } from "react-icons/lu";
import { RiTruckLine } from "react-icons/ri";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import RoutePath from "../../core/constants/routes.constant";
import { showToast } from "../../core/utils/toast.util";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const QUICK_TAGS = [
  "On Time",
  "Handled with Care",
  "Professional",
  "Friendly",
  "Great Communication",
  "Fast Delivery",
  "Careful Packaging",
  "Would Recommend",
];

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  // bookingId comes from the URL: /user/feedback/:bookingId
  // order comes from navigate state: navigate(`/user/feedback/${id}`, { state: { order } })

  const { order } = location.state || {};

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        booking_id:   bookingId,   // from URL param — reliable source of truth
        parcel_id:    order?.parcelId,
        rating,
        tags: selectedTags,
        comment,
      };

      await ApiService.apipost(ServerUrl.API_FEEDBACK_SUBMIT, payload);
      setSubmitted(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit feedback";
      showToast(msg, "error");
      // Show success UI only on actual success now — removed the fallback setSubmitted(true)
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your feedback helps us improve and rewards great travellers.
          </p>

          {/* Stars display */}
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                className={`text-3xl ${s <= rating ? "text-yellow-400" : "text-gray-200"}`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(RoutePath.USER_ALL_ORDERS)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Back to My Orders
            </button>
            <button
              onClick={() => navigate(RoutePath.PUBLIC_HOME)}
              className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">
          Rate Your Experience
        </h1>

        {/* Delivery Summary Card */}
        {order && (
          <div className="bg-white rounded-2xl shadow p-5 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Delivery Summary</p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiPackage className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{order.parcel_ref || "—"}</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                ✓ Delivered
              </span>
            </div>

            {/* Route */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-400">From</p>
                <p className="font-semibold">{order.pickup?.city || "—"}</p>
              </div>
              <RiTruckLine className="text-blue-500 text-xl flex-shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-400">To</p>
                <p className="font-semibold">{order.delivery?.city || "—"}</p>
              </div>
            </div>

            {/* Traveller */}
            <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <LuUser />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {order.traveler?.name || "Your Traveller"}
                </p>
                <p className="text-xs text-gray-500">{order.traveler?.phone || ""}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rating Card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-5">
          <p className="text-base font-semibold text-gray-700 mb-1 text-center">
            How was your delivery experience? <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-gray-400 text-center mb-5">
            Tap a star to rate
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-3 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <FaStar
                  className={`text-4xl transition-colors ${
                    s <= (hovered || rating)
                      ? "text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating label */}
          <p className="text-center text-sm font-semibold text-blue-600 h-5">
            {RATING_LABELS[hovered || rating] || ""}
          </p>
        </div>

        {/* Quick Tags */}
        <div className="bg-white rounded-2xl shadow p-6 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            What went well? <span className="text-gray-400 font-normal">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
                  selectedTags.includes(tag)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Write a review <span className="text-gray-400 font-normal">(optional)</span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this traveller..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className={`w-full py-4 rounded-xl text-white font-semibold text-base transition shadow-md ${
            rating === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>

        <button
          onClick={() => navigate(RoutePath.USER_ALL_ORDERS)}
          className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Skip for now
        </button>

      </div>
    </div>
  );
};

export default FeedbackPage;