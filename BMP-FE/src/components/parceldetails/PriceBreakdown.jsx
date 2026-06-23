import React from "react";

const PriceBreakdown = ({
  distanceCharge = "—",
  weightCharge = "—",
  vehicleMultiplier = 1,
  basePrice = "—",
  platformFee = "—",
  gstAmount = "—",
  subtotal = "—",
  finalPrice = "—",
  paymentMethod = null,
}) => {
  // Format values for display
  const formatPrice = (value) => {
    if (value === "—" || !value) return "—";
    return typeof value === "number" ? value.toLocaleString("en-IN") : value;
  };

  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
        Price Breakdown
      </p>

      <div className="bg-green-50 rounded-lg p-3 space-y-2">
        {/* Distance Charge */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">Distance Charge</p>
          <p className="font-semibold text-gray-900">₹{formatPrice(distanceCharge)}</p>
        </div>

        {/* Weight Charge */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">Weight Charge</p>
          <p className="font-semibold text-gray-900">₹{formatPrice(weightCharge)}</p>
        </div>

        {/* Vehicle Multiplier (if applicable) */}
        {vehicleMultiplier && vehicleMultiplier !== 1 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">Vehicle Multiplier</p>
            <p className="font-semibold text-gray-900">{vehicleMultiplier}x</p>
          </div>
        )}

        {/* Base Price */}
        <div className="flex justify-between items-center border-t border-green-200 pt-2">
          <p className="text-sm font-semibold text-gray-700">Base Price</p>
          <p className="font-semibold text-gray-900">₹{formatPrice(basePrice)}</p>
        </div>

        {/* Platform Fee */}
        {platformFee && platformFee !== 0 && platformFee !== "—" && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">Platform Fee (15%)</p>
            <p className="font-semibold text-gray-900">₹{formatPrice(platformFee)}</p>
          </div>
        )}

        {/* Subtotal */}
        {subtotal && subtotal !== "—" && (
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-gray-700">Subtotal</p>
            <p className="font-semibold text-gray-900">₹{formatPrice(subtotal)}</p>
          </div>
        )}

        {/* GST */}
        {gstAmount && gstAmount !== 0 && gstAmount !== "—" && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">GST (18%)</p>
            <p className="font-semibold text-gray-900">₹{formatPrice(gstAmount)}</p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-green-200 pt-4"></div>

        {/* Total / Final Price */}
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-900">Total</p>
          <p className="text-2xl font-bold text-blue-600">₹{formatPrice(finalPrice)}</p>
        </div>
      </div>

      {/* Payment Method (if applicable) */}
      {paymentMethod && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mt-3">
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Payment Method</p>
          <p className="text-sm font-semibold text-gray-900">{paymentMethod}</p>
        </div>
      )}
    </div>
  );
};

export default PriceBreakdown;
