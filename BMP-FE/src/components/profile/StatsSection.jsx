import React from "react";
import { Package, CheckCircle, DollarSign, Star, Award } from "lucide-react";

// Keys that come from the live API — others stay from DUMMY_DATA
const LIVE_KEYS = new Set(["completed", "totalSpent"]);

const CARDS = [
  { icon: Package,     key: "totalBookings", label: "Total Bookings", prefix: "",  bg: "bg-white border border-gray-100", iconCls: "text-blue-500",   valCls: "text-gray-900", lblCls: "text-gray-500"  },
  { icon: CheckCircle, key: "completed",     label: "Completed",      prefix: "",  bg: "", style: "linear-gradient(135deg,#22c55e,#16a34a)",           iconCls: "text-green-100", valCls: "text-white",    lblCls: "text-green-100" },
  { icon: DollarSign,  key: "totalSpent",    label: "Total Spent",    prefix: "₹", bg: "", style: "linear-gradient(135deg,#a855f7,#ec4899)",           iconCls: "text-pink-100",  valCls: "text-white",    lblCls: "text-pink-100"  },
  { icon: Star,        key: "avgRating",     label: "Avg Rating",     prefix: "",  bg: "", style: "linear-gradient(135deg,#f59e0b,#f97316)",           iconCls: "text-orange-100",valCls: "text-white",    lblCls: "text-orange-100"},
  { icon: Award,       key: "totalSaved",    label: "Total Saved",    prefix: "₹", bg: "", style: "linear-gradient(135deg,#06b6d4,#3b82f6)",           iconCls: "text-blue-200",  valCls: "text-white",    lblCls: "text-blue-100"  },
];

const StatsSection = ({ stats, liveStats, loadingStats }) => {
  const s = stats || {};
  // Merge: live API values override dummy for completed + totalSpent
  const merged = {
    ...s,
    completed:  liveStats?.completed  ?? s.completed,
    totalSpent: liveStats?.totalSpent ?? s.totalSpent,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {CARDS.map(({ icon: Icon, key, label, prefix, bg, style, iconCls, valCls, lblCls }) => {
        const isLive    = LIVE_KEYS.has(key);
        const isLoading = isLive && loadingStats;
        return (
          <div key={key}
            className={`rounded-xl p-5 shadow-sm flex flex-col gap-1 ${bg}`}
            style={style ? { background: style } : {}}
          >
            <div className={`mb-1 ${iconCls}`}><Icon size={22} /></div>
            {isLoading ? (
              <>
                <div className="w-16 h-7 rounded animate-pulse bg-white/30" />
                <div className="w-20 h-3 rounded animate-pulse bg-white/20 mt-1" />
              </>
            ) : (
              <>
                <div className={`text-2xl font-bold ${valCls}`}>
                  {prefix}{typeof merged[key] === "number" ? merged[key].toLocaleString() : (merged[key] ?? 0)}
                </div>
                <div className={`text-xs ${lblCls}`}>{label}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsSection;