import { Star, Send, ArrowRight, Bike, Car, Truck, Bus, Train } from "lucide-react";

const vehicleIcon = (type) => {
  const cls = "text-primary";
  switch (type) {
    case "Bike":       return <Bike size={16} className={cls} />;
    case "Truck":
    case "Mini Truck": return <Truck size={16} className={cls} />;
    case "Bus":        return <Bus size={16} className={cls} />;
    case "Train":      return <Train size={16} className={cls} />;
    default:           return <Car size={16} className={cls} />;
  }
};

const TravellerCard = ({ t, active, isNewlyAccepted, onSelect }) => {
  const isPending = t.isPending;

  return (
    <button
      type="button"
      onClick={() => onSelect(t)}
      disabled={isPending}
      className={`w-full text-left rounded-3xl transition-all border px-4 sm:px-6 py-4 sm:py-5 relative ${
        isPending
          ? "bg-gray-50 border-gray-300 opacity-75 cursor-not-allowed"
          : active
          ? "border-primary shadow-[0_0_0_2px_rgba(31,42,255,0.3)] bg-white"
          : "border-gray-400 hover:border-primary/40 hover:shadow-md bg-white"
      }`}
      style={isNewlyAccepted ? { animation: "pulse-border 2s ease-in-out infinite, scale-in 0.5s ease-out", boxShadow: "0 0 20px rgba(34,197,94,0.4)" } : {}}
    >
      {/* NEW badge */}
      {isNewlyAccepted && (
        <div className="absolute -top-3 -right-3 z-10">
          <span className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-8 w-8 bg-green-500 items-center justify-center text-white text-xs font-bold">NEW</span>
          </span>
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-full ${isPending ? "bg-gray-400" : t.avatarBg} flex items-center justify-center text-white text-base sm:text-xl font-bold shadow-md`}>
            {t.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm sm:text-base font-semibold text-gray-900 truncate">{t.name}</span>
              {t.verified && <span className="text-[10px] px-2 py-[2px] rounded-full bg-primary/10 text-primary font-semibold">VERIFIED</span>}
              {isPending
                ? <span className="text-[10px] px-2 py-[2px] rounded-full bg-gray-200 text-gray-600 font-semibold">REQUEST SENT</span>
                : <span className="text-[10px] px-2 py-[2px] rounded-full bg-green-100 text-green-700 font-semibold">INTERESTED</span>
              }
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star size={12} className="text-amber-400" />
                <span className="font-semibold text-gray-900">{t.rating}</span>
                <span className="hidden sm:inline">({t.reviews} reviews)</span>
              </span>
              <span className="hidden sm:inline">{t.trips} trips</span>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 text-[10px] px-2 py-[3px] font-medium">
                {t.detourKm}km ({t.detourPercentage}%)
              </span>
              {t.driveTimeMinutes && (
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-600 text-[10px] px-2 py-[3px] font-medium">
                  {t.driveTimeMinutes}m
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-pink-50 text-purple-500 text-[10px] px-2 py-[3px] font-medium">
                {Math.round(t.matchScore)}%
              </span>
            </div>
          </div>
        </div>
        <div className={`flex-shrink-0 px-3 sm:px-5 py-2 text-right text-white shadow-sm rounded-2xl ${isPending ? "bg-gray-400" : "bg-primary"}`}>
          <p className="text-[10px] sm:text-xs">Price</p>
          <p className="text-base sm:text-lg font-bold">{isPending ? "Pending" : `₹${t.price}`}</p>
        </div>
      </div>

      {/* Middle row */}
      <div className="flex flex-col gap-2 pt-3 mt-3 text-sm border-t border-gray-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 text-emerald-600 min-w-0">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-green-200 border rounded-md border-emerald-500">
              <Send size={14} />
            </span>
            <span className="font-medium text-xs">From</span>
            <span className="font-semibold text-gray-900 text-xs truncate max-w-[100px] sm:max-w-none">{t.from}</span>
          </div>
          <ArrowRight size={14} className="text-gray-400 hidden sm:block" />
          <div className="flex items-center gap-1 text-rose-500 min-w-0">
            <span className="flex-shrink-0 flex items-center justify-center bg-red-200 border rounded-md w-8 h-8 border-rose-400">
              <Send size={14} />
            </span>
            <span className="font-medium text-xs">To</span>
            <span className="font-semibold text-gray-900 text-xs truncate max-w-[100px] sm:max-w-none">{t.to}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-50">
          <span className="flex items-center justify-center w-7 h-7 rounded-2xl bg-primary/10">
            {vehicleIcon(t.vehicleType)}
          </span>
          <div className="text-left">
            <p className="text-xs font-medium text-gray-700">{t.vehicleType}</p>
            <p className="text-[10px] text-gray-500">{t.duration}</p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      {active && !isPending && (
        <div className="flex items-center gap-2 pt-2 mt-3 text-xs border-t border-gray-100 text-primary">
          <span className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-[10px]">✓</span>
          <span className="font-medium">Selected as your Traveller</span>
        </div>
      )}
      {isPending && (
        <div className="flex items-center gap-2 pt-2 mt-3 text-xs border-t border-gray-100 text-gray-500">
          <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">⏳</span>
          <span className="font-medium">Waiting for traveller to accept...</span>
        </div>
      )}
    </button>
  );
};

export default TravellerCard;
