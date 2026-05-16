import React from "react";
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiClock } from "react-icons/fi";

const TravelerDetailsPayments = ({ payments = [], totalEarnings = 0 }) => {
  const total = Number(totalEarnings) || 0;

  // Compute this-month earnings
  const now = new Date();
  const thisMonthEarnings = payments
    .filter(p => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const avgPerDelivery = payments.length > 0
    ? Math.round(total / payments.length)
    : 0;

  const pendingWithdrawal = payments
    .filter(p => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const statusColor = (status) => {
    if (status === "SUCCESS") return "text-green-600 bg-green-100";
    if (status === "PENDING") return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">

      {/* Total Earnings Header */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-gray-600">Total Earnings</h3>
            <p className="text-3xl font-bold text-green-600">₹{total.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <FiDollarSign className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Earnings History ({payments.length})
        </h3>

        {payments.length === 0 ? (
          <p className="text-gray-400 text-sm">No earnings found.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiDollarSign className="text-green-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivery earning</p>
                      {(p.booking_ref || p.parcel_ref) && (
                        <p className="text-sm text-gray-500">{p.booking_ref || p.parcel_ref}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      +₹{Number(p.amount || 0).toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
                      {p.status === "SUCCESS" ? "Completed" : p.status || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiTrendingUp className="text-blue-600" size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{thisMonthEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-500">This Month</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiDollarSign className="text-green-600" size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{avgPerDelivery.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Avg per Delivery</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiClock className="text-orange-600" size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{pendingWithdrawal.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Pending Withdrawal</p>
        </div>
      </div>

    </div>
  );
};

export default TravelerDetailsPayments;
