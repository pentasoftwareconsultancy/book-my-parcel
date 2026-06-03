import React from "react";
import { Package, CheckCircle, Star, Award, IndianRupee, Truck } from "lucide-react";

const USER_CARDS = [
  { icon: Package,     key: "totalBookings", label: "Total Bookings",    prefix: "",  bg: "bg-white border border-gray-100", iconCls: "text-blue-500",    valCls: "text-gray-900", lblCls: "text-gray-500"  },
  { icon: CheckCircle, key: "completed",     label: "Active Deliveries", prefix: "",  style: "linear-gradient(135deg,#22c55e,#16a34a)",                   iconCls: "text-green-100", valCls: "text-white",    lblCls: "text-green-100" },
  { icon: IndianRupee, key: "totalSpent",    label: "Total Spent",       prefix: "₹", style: "linear-gradient(135deg,#a855f7,#ec4899)",                   iconCls: "text-pink-100",  valCls: "text-white",    lblCls: "text-pink-100"  },
];

const TRAVELLER_CARDS = [
  { icon: Truck,        key: "totalDeliveries", label: "Total Completed Deliveries", prefix: "",  bg: "bg-white border border-gray-100", iconCls: "text-blue-500",    valCls: "text-gray-900", lblCls: "text-gray-500"  },
  { icon: IndianRupee,  key: "totalEarnings",   label: "Total Earnings",   prefix: "₹", style: "linear-gradient(135deg,#22c55e,#16a34a)",                   iconCls: "text-green-100", valCls: "text-white",    lblCls: "text-green-100" },
  { icon: Star,         key: "avgRating",       label: "Rating",           prefix: "",  style: "linear-gradient(135deg,#f59e0b,#f97316)",                   iconCls: "text-orange-100", valCls: "text-white", lblCls: "text-orange-100" },
];

const StatsSection = ({ liveStats, loadingStats, role }) => {
  const cards = role === "USER" ? USER_CARDS : TRAVELLER_CARDS;

  // Debug: Log the API response
  React.useEffect(() => {
    if (liveStats) {
      console.log('📊 Profile Stats API Response:', liveStats);
    }
  }, [liveStats]);

  // Map API keys to card keys
  const getValue = (key) => {
    if (!liveStats) return 0;
    // USER stats
    if (key === "totalBookings") return liveStats.totalOrders ?? liveStats.totalBookings ?? 0;
    if (key === "completed")     return liveStats.completedBookings ?? liveStats.completed ?? 0;
    if (key === "totalSpent") {
      const amount = liveStats.totalAmount ?? liveStats.totalSpent ?? 0;
      return Math.round(Number(amount));
    }
    // TRAVELLER stats
    if (key === "totalDeliveries") return liveStats.totalDeliveries ?? liveStats.totalBookings ?? 0;
    if (key === "totalEarnings") {
      const earnings = liveStats.totalEarnings ?? liveStats.totalAmount ?? 0;
      return Math.round(Number(earnings));
    }
    if (key === "avgRating") {
      const rating = liveStats.avgRating ?? liveStats.rating ?? 0;
      return Number(rating).toFixed(1);
    }
    return 0;
  };

  const cols = cards.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";

  return (
    <div className={`grid ${cols} gap-4`}>
      {cards.map(({ icon: Icon, key, label, prefix, bg = "", style, iconCls, valCls, lblCls }) => (
        <div key={key}
          className={`rounded-xl p-5 shadow-sm flex flex-col gap-1 ${bg}`}
          style={style ? { background: style } : {}}
        >
          <div className={`mb-1 ${iconCls}`}><Icon size={22} /></div>
          {loadingStats ? (
            <>
              <div className="w-16 h-7 rounded animate-pulse bg-white/30" />
              <div className="w-20 h-3 rounded animate-pulse bg-white/20 mt-1" />
            </>
          ) : (
            <>
              <div className={`text-2xl font-bold ${valCls}`}>
                {prefix}{typeof getValue(key) === "number" ? getValue(key).toLocaleString() : 0}
              </div>
              <div className={`text-xs ${lblCls}`}>{label}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsSection;