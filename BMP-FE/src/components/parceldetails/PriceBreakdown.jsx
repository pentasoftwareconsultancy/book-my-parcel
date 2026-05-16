import React from "react";

const PriceBreakdown = ({
  basePrice = "—",
  deliverySpeedCharge = 0,
  total = "—",
  paymentMethod = null,
}) => {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
        Price Breakdown
      </p>

      <div className="bg-green-50 rounded-lg p-3 space-y-2">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">Base Price</p>
          <p className="font-semibold text-gray-900">₹{basePrice}</p>
        </div>

        {/* Delivery Speed Charge */}
        {deliverySpeedCharge > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">Delivery Speed</p>
            <p className="font-semibold text-gray-900">₹{deliverySpeedCharge}</p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-green-200 pt-4"></div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-900">Total</p>
          <p className="text-2xl font-bold text-blue-600">₹{total}</p>
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
