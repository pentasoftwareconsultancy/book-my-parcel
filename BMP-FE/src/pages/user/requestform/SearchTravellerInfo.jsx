import React from "react";
import {
  FiStar,
  FiTruck,
  FiMapPin,
  FiPackage,
  FiUser,
} from "react-icons/fi";

const SearchTravellerInfo = ({
  travellerName,
  rating,
  completedTrips,
  transportMode,
  vehicleType,
  cardOrigin,
  cardDestination,
  weight,
  transitInfo,
}) => {
  const shortOrigin = cardOrigin?.split(",")[0] || cardOrigin;
  const shortDestination =
    cardDestination?.split(",")[0] || cardDestination;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        {/* Vehicle Icon */}
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <FiTruck className="text-blue-600 text-xl" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Route */}
          <h3 className="font-bold text-base sm:text-lg text-gray-900 break-words">
            {shortOrigin} → {shortDestination}
          </h3>

          {/* Traveller Info */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
  <FiUser className="text-white text-lg" />
</div>
              <h4 className="font-medium text-blue-500 text-sm sm:text-base break-words">
                {travellerName}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-500 fill-current" />
                <span className="font-medium">{rating}</span>
              </div>

              <span>•</span>

              <span>{completedTrips} trips completed</span>
            </div>
          </div>

          {/* Locations */}
          <div className="mt-3 space-y-1">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FiMapPin
                className="text-green-500 mt-0.5 flex-shrink-0"
                size={14}
              />
              <span className="break-words">{cardOrigin}</span>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FiMapPin
                className="text-red-500 mt-0.5 flex-shrink-0"
                size={14}
              />
              <span className="break-words">{cardDestination}</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
            <div>
              <span className="text-gray-500">Vehicle:</span>{" "}
              <span className="font-medium text-gray-800 capitalize">
                {vehicleType}
              </span>
            </div>

            <div>
              <span className="text-gray-500">Mode:</span>{" "}
              <span className="font-medium text-gray-800 capitalize">
                {transportMode}
              </span>
            </div>

            <div>
              <span className="text-gray-500">Weight:</span>{" "}
              <span className="font-medium text-gray-800">
                {weight}
              </span>
            </div>
          </div>

          {/* Transit Info */}
          {transitInfo && (
            <div className="mt-3">
              <span className="inline-flex bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                {transitInfo}
              </span>
            </div>
          )}

          {/* Button */}
          <div className="mt-4">
            <button className="w-full sm:w-32 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2">
              <FiPackage />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchTravellerInfo;