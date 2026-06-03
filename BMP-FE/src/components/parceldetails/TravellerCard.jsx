import React from "react";
import { Star, MapPin, IndianRupee } from "lucide-react";

const TravellerCard = ({
  name = "—",
  vehicle = "—",
  vehicleNumber = "—",
  rating = "N/A",
  totalDeliveries = 0,
  estimatedDelivery = "—",
  route = "—",
  price = "—",
  avatar = null,
}) => {
  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2 mt-8">
        Traveler Details
      </p>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        {/* Traveller Header with Avatar */}
        <div className="flex gap-3 mb-3 pb-3 border-b border-gray-200">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg mb-2">{name}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-semibold text-gray-900">{rating}</span>
              </div>
              <span className="text-xs text-gray-500">
                {totalDeliveries} {totalDeliveries === 1 ? "delivery" : "deliveries"}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Vehicle</p>
            <p className="text-xs font-semibold text-gray-900">{vehicle}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Number</p>
            <p className="text-xs font-semibold text-gray-900">{vehicleNumber}</p>
          </div>
        </div>

        {/* Route and Delivery Details */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Route</p>
            <p className="text-sm font-semibold text-gray-900">{route}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Est. Delivery</p>
            <p className="text-sm font-semibold text-gray-900">{estimatedDelivery}</p>
          </div>
        </div>

        {/* Price/Earnings */}
        {price !== "—" && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Price</p>
              <p className="text-xl font-bold text-blue-600">₹{price}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravellerCard;
