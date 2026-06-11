import React, { useEffect, useRef } from "react";
import { CheckCircle, XCircle, X, Gift, Star, MapPin, Weight, DollarSign } from "lucide-react";

const NotificationCard = ({ type, title, message, details, actions, onClose }) => {
  const isSuccess = type === "success";
  const isAccepted = type === "accepted";

  // Auto-dismiss the full-screen overlay after 4s if no onClose is provided
  const timerRef = useRef(null);
  useEffect(() => {
    if (type === "success" && title?.includes("Congratulations") && !onClose) {
      // Nothing to call — just silently swallow (caller should handle setNotification(null))
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [type, title, onClose]);

  // Enhanced celebration notification for traveller selection
  if (type === "success" && title?.includes("Congratulations")) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full mx-4 overflow-hidden animate-bounce">
          {/* Header with close button — always shown */}
          <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white">
            <button
              onClick={onClose ?? (() => {})}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              aria-label="Close notification"
            >
              <X size={24} />
            </button>
            
            {/* Celebration icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Gift className="text-white w-8 h-8" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center">{title}</h2>
            <p className="text-center text-green-100 mt-2">{message}</p>
          </div>

          {/* Details section */}
          {details && (
            <div className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">Delivery Details</h3>
              <div className="space-y-3">
                {details.route && (
                  <div className="flex items-center gap-3">
                    <MapPin className="text-blue-500 w-5 h-5" />
                    <span className="text-gray-700">{details.route}</span>
                  </div>
                )}
                {details.weight && (
                  <div className="flex items-center gap-3">
                    <Weight className="text-purple-500 w-5 h-5" />
                    <span className="text-gray-700">{details.weight}</span>
                  </div>
                )}
                {details.earnings && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-green-500 w-5 h-5" />
                    <span className="text-gray-700 font-semibold">{details.earnings}</span>
                  </div>
                )}
                {details.bookingId && (
                  <div className="flex items-center gap-3">
                    <Star className="text-yellow-500 w-5 h-5" />
                    <span className="text-gray-700">Booking: {details.bookingId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="p-6 bg-white">
              <div className="flex gap-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                      index === 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original simple notification
  return (
    <div className="flex justify-center items-center w-full my-6">
      <div className="bg-[#fffaf0] shadow-lg rounded-xl px-10 py-8 w-[80%] flex flex-col items-center border border-gray-200">
        
        {/* ICON */}
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-full ${
            isAccepted || isSuccess ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isAccepted || isSuccess ? (
            <CheckCircle className="text-white w-8 h-8" />
          ) : (
            <XCircle className="text-white w-8 h-8" />
          )}
        </div>

        {/* TEXT */}
        <p className="mt-4 text-lg font-semibold text-gray-800 text-center">
          {message}
        </p>
      </div>
    </div>
  );
};

export default NotificationCard;