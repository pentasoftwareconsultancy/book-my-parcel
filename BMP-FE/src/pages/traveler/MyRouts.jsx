// src/pages/user/MyRoutes.jsx
import { useState, useEffect } from "react";
import {
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiPlus,
  FiTruck,
  FiEye,
  FiMapPin,
} from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";
import { Button } from "@mui/material";
import RoutePath from "../../core/constants/routes.constant";
import { useNavigate } from "react-router-dom";
import { statusColor } from "../../core/constants/app.constant";
import ApiService from "../../core/services/api.service";
import { showToast } from "../../core/utils/toast.util";

// Transform raw API route object into the shape the UI expects
const STATUS_MAP = {
  ACTIVE: "Active",
  INACTIVE: "Paused",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// ✅ FULL ADDRESS FORMATTER (Google-like)
const formatAddress = (addr) => {
  if (!addr) return "—";

  // ✅ Priority: backend formatted_address
  if (addr.formatted_address) return addr.formatted_address;

  return [
    addr.house_no,
    addr.building_name,
    addr.street,
    addr.area,
    addr.landmark,
    addr.city,
    addr.taluka,
    addr.district,
    addr.state,
    addr.country || "India",
    addr.pincode,
  ]
    .filter((v) => v && v !== "null")
    .join(", ");
};

// ✅ TRANSFORM ROUTE (UPDATED)
const transformRoute = (r) => {
  const originFull = formatAddress(r.originAddress);
  const destFull = formatAddress(r.destAddress);

  return {
    id: r.id,

    origin: originFull,
    destination: destFull,

    // ✅ IMPORTANT (store raw status for toggle)
    statusRaw: r.status,

    status:
      r.status === "ACTIVE"
        ? "Active"
        : r.status === "INACTIVE"
          ? "Paused"
          : r.status === "COMPLETED"
            ? "Completed"
            : "Cancelled",

    price: Number(r.total_earnings || 0),

    transportMode: r.transport_mode || r.vehicle_type || "—",

    // For public transport modes, show the transit type from transit_details
    vehicle: r.transport_mode === "public" && r.transitDetails?.type
      ? r.transitDetails.type
      : r.vehicle_type || "—",

    weight: r.max_weight_kg
      ? `${r.max_weight_kg} kg`
      : "—",

    count: r.accepted_count ?? 0,

    createdOn: (r.created_at || r.createdAt)
      ? new Date(r.created_at || r.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null,

    totalEarnings: `₹${(r.total_earnings ?? 0).toLocaleString("en-IN")}`,

    totalDistance: r.total_distance_km
      ? `${r.total_distance_km} km`
      : "—",

    departureDate: r.departure_date || null,
    departureTime: r.departure_time || null,
    arrivalDate: r.arrival_date || null,
    arrivalTime: r.arrival_time || null,

    // Pass raw address objects so RouteDetails can display full detail
    originAddress: r.originAddress || null,
    destAddress: r.destAddress || null,

    recurringDays: r.recurring_days || [],

    // ✅ FULL ADDRESS STOPS
    stops: [
      { type: "origin", location: originFull },
      { type: "destination", location: destFull },
    ],

    vehicleDetails: {
      vehicleType: r.vehicle_type,
      vehicleNumber: r.vehicle_number,
      maxWeightCapacity: r.max_weight_kg
        ? `${r.max_weight_kg} kg`
        : "—",
    },

    parcelPreferences: {
      acceptedTypes: r.accepted_parcel_types || [],
      minimumEarning: r.min_earning_per_delivery
        ? `₹${r.min_earning_per_delivery}`
        : "—",
    },

    transitDetails: r.transit_details || null,
    transport_mode: r.transport_mode || null,

    performanceStats: {
      acceptedCount: r.accepted_count ?? 0,
      totalBids: `₹${(r.total_earnings ?? 0).toLocaleString("en-IN")}`,
      // Calculate avg bid: total earnings / accepted count (avoid division by zero)
      avgBidAmount: r.accepted_count > 0
        ? `₹${Math.round((r.total_earnings ?? 0) / r.accepted_count).toLocaleString("en-IN")}`
        : "—",
    },

    acceptedDeliveries: r.accepted_deliveries || [],
    photos: [],
  };
};

const MyRoutes = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getMyRoutes();
      if (res?.data?.success) {
        const raw = res.data.data?.routes || res.data.data || [];
        setRoutes(Array.isArray(raw) ? raw.map(transformRoute) : []);
      } else {
        showToast("Failed to load routes", "error");
      }
    } catch {
      showToast("Failed to load routes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const activeRoutes = routes.filter((r) => r.status === "Active");
  const pausedRoutes = routes.filter((r) => r.status === "Paused");
  const completedRoutes = routes.filter((r) => r.status === "Completed");

  const totalEarnings = routes.reduce((sum, r) => sum + (r.price || 0), 0);

  const toggleRouteStatus = async (id, currentStatusRaw) => {
    const newStatus =
      currentStatusRaw === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await ApiService.updateRoute(id, { status: newStatus });

      setRoutes((prev) =>
        prev.map((route) => {
          if (route.id !== id) return route;

          return {
            ...route,
            statusRaw: newStatus,
            status: STATUS_MAP[newStatus],
          };
        })
      );
    } catch {
      showToast("Failed to update route status", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Routes</h1>
          <p className="text-gray-500 text-sm">Manage all your saved travel routes</p>
        </div>
        <Button
          variant="contained"
          sx={{ borderRadius: 2 }}
          onClick={() => navigate(RoutePath.TRAVELLER_ROUTE)}
          startIcon={<FiPlus />}
        >
          Add Route
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<FiPlay />} title="Active Routes" value={activeRoutes.length} bg="bg-green-50" text="text-green-600" />
        <StatCard icon={<FiPause />} title="Paused Routes" value={pausedRoutes.length} bg="bg-orange-50" text="text-orange-500" />
        <StatCard icon={<FiCheckCircle />} title="Completed Routes" value={completedRoutes.length} bg="bg-blue-50" text="text-blue-600" />
        <StatCard
          icon={<MdCurrencyRupee />}
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString("en-IN")}`}
          bg="bg-purple-50"
          text="text-purple-600"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-gray-400">
          <FiTruck className="mx-auto text-4xl mb-3 animate-pulse" />
          <p className="text-sm">Loading routes...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && routes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <FiTruck className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No routes yet</p>
          <p className="text-sm">Click "Add Route" to create your first route.</p>
        </div>
      )}

      {/* Active */}
      {activeRoutes.length > 0 && (
        <Section title={`Active Routes (${activeRoutes.length})`}>
          {activeRoutes.map((route) => (
            <RouteCard key={route.id} route={route} navigate={navigate} toggleRouteStatus={toggleRouteStatus} />
          ))}
        </Section>
      )}

      {/* Paused */}
      {pausedRoutes.length > 0 && (
        <Section title={`Paused Routes (${pausedRoutes.length})`}>
          {pausedRoutes.map((route) => (
            <RouteCard key={route.id} route={route} navigate={navigate} toggleRouteStatus={toggleRouteStatus} />
          ))}
        </Section>
      )}

      {/* Completed */}
      {completedRoutes.length > 0 && (
        <Section title={`Completed Routes (${completedRoutes.length})`}>
          {completedRoutes.map((route) => (
            <RouteCard key={route.id} route={route} navigate={navigate} />
          ))}
        </Section>
      )}
    </div>
  );
};

export default MyRoutes;

/* ─── Sub-components ─────────────────────────────────────────── */

const StatCard = ({ icon, title, value, bg, text }) => (
  <div className={`p-4 rounded-xl border ${bg}`}>
    <div className="flex justify-between">
      <div className={`text-xl ${text}`}>{icon}</div>
      <div className={`font-semibold ${text}`}>{value}</div>
    </div>
    <p className="text-sm text-gray-600 mt-2">{title}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const RouteCard = ({ route, navigate, toggleRouteStatus }) => {
  const { id, origin, destination, price, status, vehicle, transportMode, weight, count, transitDetails } = route;

  const handleDetails = () => {
    navigate(RoutePath.TRAVELLER_ROUTE_DETAILS, { state: { route } });
  };

  // Format transit details for display
  const getTransitInfo = () => {
    if (!transitDetails) return null;
    
    if (transitDetails.type === 'bus') {
      return `🚌 ${transitDetails.service_name}${transitDetails.bus_number ? ` - ${transitDetails.bus_number}` : ''}`;
    } else if (transitDetails.type === 'train') {
      return `🚂 Train ${transitDetails.train_number} (${transitDetails.class_type})`;
    } else if (transitDetails.type === 'plane') {
      const baggage = transitDetails.baggage_type ? ` (${transitDetails.baggage_type})` : '';
      return `✈️ ${transitDetails.airline_name}${transitDetails.flight_number ? ` - ${transitDetails.flight_number}` : ''}${baggage}`;
    }
    return null;
  };

  const transitInfo = getTransitInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="flex gap-3">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600 self-start">
            <FiTruck />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{origin} → {destination}</h3>
            <div className="flex gap-1 flex-col mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <FiMapPin size={10} className="text-green-500" /> {origin}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <FiMapPin size={10} className="text-red-500" /> {destination}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-400 mt-2 flex-wrap">
              <span>Vehicle: <span className="text-gray-700 font-medium">{vehicle}</span></span>
              <span>Mode: <span className="text-gray-700 font-medium">{transportMode}</span></span>
              <span>Weight: <span className="text-gray-700 font-medium">{weight}</span></span>
            </div>
            {transitInfo && (
              <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                {transitInfo}
              </div>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-semibold text-green-600">₹{price.toLocaleString("en-IN")}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        {route.statusRaw !== "COMPLETED" && (
          <button
            onClick={() => toggleRouteStatus(id, route.statusRaw)}
            aria-label={status === "Active" ? "Pause route" : "Start route"}
            className="w-[50%] sm:w-auto min-w-[80px] bg-blue-600 text-white py-1.5 px-4 rounded-md text-xs hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            {status === "Active" ? (
              <><FiPause size={14} /> Pause</>
            ) : (
              <><FiPlay size={14} /> Start</>
            )}
          </button>
        )}
        <button
          onClick={handleDetails}
          className="w-full sm:w-auto flex items-center justify-center gap-1 border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <FiEye size={14} /> Details
        </button>
      </div>
    </div>
  );
};