import React from "react";
import { MapPin } from "lucide-react";

const RouteSection = ({ type = "pickup", address = {} }) => {
  const isPickup = type === "pickup";
  const pinColor = isPickup ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600";
  const label = isPickup ? "Pickup" : "Delivery";

  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
        Route Summary
      </p>
      <div className="flex gap-2 items-start">
        <div className={`p-2 rounded-full flex-shrink-0 ${pinColor}`}>
          <MapPin size={16} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-xs mb-1">{label}</p>
          <p className="text-xs text-gray-700 leading-snug">
            {address.address ? `${address.address}, ${address.city}, ${address.state}, ${address.pincode}` : "Address not provided"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteSection;
