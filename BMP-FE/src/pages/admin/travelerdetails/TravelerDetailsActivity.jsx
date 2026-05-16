import React from "react";
import { FiTruck, FiMapPin, FiStar, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const TravelerDetailsActivity = ({ traveler = {} }) => {
  const total      = Number(traveler.total_deliveries) || 0;
  const completed  = Number(traveler.completed_deliveries) || 0;
  const cancelled  = total - completed;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const rating     = Number(traveler.average_rating || 0).toFixed(1);
  const reviews    = Number(traveler.total_reviews) || 0;
  const routes     = Number(traveler.active_routes) || 0;
  const earnings   = Number(traveler.total_earnings) || 0;
  const avgEarning = completed > 0 ? Math.round(earnings / completed) : 0;

  return (
    <div className="mt-6 space-y-6">

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Deliveries" value={total} />
        <StatCard label="Completed"        value={completed} />
        <StatCard label="Active Routes"    value={routes} />
        <StatCard label="Avg Rating"       value={`${rating}/5`} sub={`${reviews} reviews`} />
      </div>

      {/* Delivery Breakdown */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiTruck className="text-purple-500" size={18} />
          Delivery Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiXCircle className="text-red-500" size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{cancelled > 0 ? cancelled : 0}</p>
              <p className="text-sm text-gray-500">Cancelled / Other</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{successRate}%</p>
              <p className="text-sm text-gray-500">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Success Rate</span>
            <span>{successRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Earnings Performance */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiStar className="text-yellow-500" size={18} />
          Earnings Performance
        </h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{earnings.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Earnings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{avgEarning.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Avg per Delivery</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{routes}</p>
            <p className="text-sm text-gray-500">Active Routes</p>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiStar className="text-yellow-500" size={18} />
          Customer Rating
        </h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900">{rating}</p>
            <div className="flex justify-center gap-0.5 mt-1">
              {[1,2,3,4,5].map(i => (
                <FiStar
                  key={i}
                  size={16}
                  className={i <= Math.round(Number(rating)) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  fill={i <= Math.round(Number(rating)) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{reviews} reviews</p>
          </div>
          <div className="flex-1">
            {[5,4,3,2,1].map(star => {
              const pct = reviews > 0 ? Math.round((star === Math.round(Number(rating)) ? reviews * 0.6 : reviews * 0.1) / reviews * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 w-4">{star}</span>
                  <FiStar size={12} className="text-yellow-400" fill="currentColor" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TravelerDetailsActivity;
