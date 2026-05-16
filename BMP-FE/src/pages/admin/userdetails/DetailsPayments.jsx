import React from "react";
import { BsCurrencyRupee } from "react-icons/bs";

const DetailsPayment = ({ payments = [], totalSpent = 0 }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          Payment History <span className="text-gray-500">({payments.length})</span>
        </h2>
        <div className="border border-green-300 bg-green-50 rounded-lg px-4 py-3 text-right">
          <p className="text-xs text-gray-500">Total Spent</p>
          <p className="text-green-600 font-bold text-lg">₹{Number(totalSpent || 0).toLocaleString()}</p>
        </div>
      </div>

      {payments.length === 0 && (
        <p className="text-gray-400 text-sm">No payments found.</p>
      )}

      <div className="space-y-4">
        {payments.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                item.payment_status === "SUCCESS" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"
              }`}>
                <BsCurrencyRupee size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.payment_id}</p>
                <p className="text-xs text-gray-500">Booking: {item.booking_id}</p>
                <p className="text-xs text-gray-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-700">₹{item.amount}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.payment_status === "SUCCESS" ? "bg-green-100 text-green-600" :
                item.payment_status === "FAILED"  ? "bg-red-100 text-red-600" :
                "bg-yellow-100 text-yellow-600"
              }`}>
                {item.payment_status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DetailsPayment;
