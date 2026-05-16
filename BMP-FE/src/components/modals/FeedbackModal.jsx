import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiCheckCircle, FiX } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { showToast } from "../../core/utils/toast.util";

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

// ─── Props ────────────────────────────────────────────────────────────────────
// order           — the order object (needs deliveryId, parcelId)
// onClose         — close the modal
// onSubmitted     — optional callback after successful submit/update
// existingFeedback — { rating, comment, tags } if editing, null if new
const FeedbackModal = ({ order, onClose, onSubmitted, existingFeedback = null }) => {
  const isEditMode = !!existingFeedback;

  // Pre-fill state from existing feedback when editing
  const [rating, setRating]   = useState(existingFeedback?.rating  || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // PUT /api/feedback/booking/:bookingId
        await ApiService.apiput(
          ServerUrl.API_FEEDBACK_UPDATE(order.deliveryId),
          { rating, comment }
        );
      } else {
        // POST /api/user/feedback/submit
        await ApiService.apipost(ServerUrl.API_FEEDBACK_SUBMIT, {
          booking_id: order.deliveryId,
          parcel_id:  order.parcelId,
          rating,
          comment,
        });
      }

      setSubmitted(true);
      showToast(isEditMode ? "Feedback updated! 🌟" : "Thanks for your feedback! 🌟", "success");
      onSubmitted?.();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to submit feedback", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {submitted ? (
          // ── Success state ──────────────────────────────────────────────────
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiCheckCircle className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-lg font-bold mb-2">
              {isEditMode ? "Feedback Updated!" : "Thank You!"}
            </h2>
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map((s) => (
                <FaStar key={s} className={`text-xl ${s <= rating ? "text-yellow-400" : "text-gray-200"}`} />
              ))}
            </div>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded-lg">
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3 border-b">
              <h2 className="text-sm font-semibold">
                {isEditMode ? "Edit Your Feedback" : "Rate your experience"}
              </h2>
              <button onClick={onClose}><FiX /></button>
            </div>

            <div className="p-5">
              {/* Stars */}
              <div className="text-center mb-4">
                <div className="flex justify-center gap-2 mb-1">
                  {[1,2,3,4,5].map((s) => (
                    <FaStar
                      key={s}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      className={`text-3xl cursor-pointer transition-colors ${
                        s <= (hovered || rating) ? "text-yellow-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-blue-600 h-4">
                  {RATING_LABELS[hovered || rating] || ""}
                </p>
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write feedback (optional)"
                rows={3}
                className="w-full border rounded-lg p-3 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  {isEditMode ? "Cancel" : "Skip"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || rating === 0}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm disabled:opacity-50"
                >
                  {loading ? "Saving..." : isEditMode ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
