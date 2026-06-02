import { useState, useEffect, useCallback, useRef } from "react";
import ApiService from "../../services/api.service";
import ServerUrl from "../../constants/serverUrl.constant";
import { onEvent, offEvent } from "../../services/websocket.service";

// Auto-refresh interval — 30 seconds (catches any missed socket events)
const POLL_INTERVAL_MS = 30_000;

export const useTravelerDashboard = () => {
  const [parcelRequests, setParcelRequests] = useState([]);
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [cancelledDeliveries, setCancelledDeliveries] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    active: 0,
    completed: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track whether a silent background refresh is running
  const refreshingRef = useRef(false);

  const filterDeliveries = useCallback((deliveries) => {
    setActiveDeliveries(
      deliveries.filter((d) =>
        ["CONFIRMED", "PICKUP", "IN_TRANSIT"].includes(d.status)
      )
    );
    setCompletedDeliveries(
      deliveries.filter((d) => d.status === "DELIVERED")
    );
    setCancelledDeliveries(
      deliveries.filter((d) => ["CANCELLED", "REJECTED"].includes(d.status))
    );
  }, []);

  /**
   * Full dashboard load.
   * @param {boolean} silent - if true, don't show loading spinner (background refresh)
   */
  const loadDashboard = useCallback(
    async (silent = false) => {
      // Prevent concurrent refreshes
      if (refreshingRef.current) return;
      refreshingRef.current = true;

      try {
        if (!silent) setLoading(true);
        setError(null);

        const [reqRes, delRes, statsRes] = await Promise.allSettled([
          ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_REQUESTS, {
            status: "SENT,INTERESTED",
            _t: Date.now(),
          }),
          ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_DELIVERIES, {
            status: "CONFIRMED,PICKUP,IN_TRANSIT,DELIVERED,CANCELLED",
            _t: Date.now(),
          }),
          ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_STATS, {
            _t: Date.now(),
          }),
        ]);

        if (reqRes.status === "fulfilled") {
          const resData = reqRes.value?.data?.data;
          const data = resData?.requests || resData?.data || [];
          setParcelRequests(data);
        }

        if (delRes.status === "fulfilled") {
          const resData = delRes.value?.data?.data;
          const data =
            resData?.deliveries ||
            resData?.data ||
            (Array.isArray(resData) ? resData : []);
          setAllDeliveries(data);
          filterDeliveries(data);
        }

        if (statsRes.status === "fulfilled") {
          const responseData = statsRes.value?.data?.data || {};
          const statsData = responseData?.stats || responseData || {};
          setStats({
            totalEarnings: statsData.totalEarnings || statsData.total_earnings || 0,
            active: statsData.active || statsData.activeDeliveries || 0,
            completed: statsData.completed || statsData.completedDeliveries || 0,
            rating: statsData.rating || statsData.averageRating || 0,
          });
        }
      } catch (err) {
        console.error("❌ Dashboard Load Error:", err);
        if (!silent) setError("Failed to load dashboard");
      } finally {
        if (!silent) setLoading(false);
        refreshingRef.current = false;
      }
    },
    [filterDeliveries]
  );

  // Initial load
  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);

  // ── Polling — silent background refresh every 30s ─────────────────────────
  useEffect(() => {
    const interval = setInterval(() => loadDashboard(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  // ── Socket events — trigger immediate silent refresh on key status changes ─
  useEffect(() => {
    // Stable reference via useCallback (loadDashboard is already memoised).
    // Using a ref here ensures offEvent removes the EXACT same function that
    // onEvent registered — without this, each render creates a new `refresh`
    // closure and the old listeners accumulate (memory leak).
    const refresh = () => loadDashboard(true);

    // These events mean something changed that affects the dashboard
    onEvent("booking_confirmed",    refresh);
    onEvent("pickup_verified",      refresh);
    onEvent("delivery_verified",    refresh);
    onEvent("booking_cancelled",    refresh);
    onEvent("new_request",          refresh);
    onEvent("request_not_selected", refresh);
    onEvent("parcel_not_selected",  refresh);

    return () => {
      offEvent("booking_confirmed",    refresh);
      offEvent("pickup_verified",      refresh);
      offEvent("delivery_verified",    refresh);
      offEvent("booking_cancelled",    refresh);
      offEvent("new_request",          refresh);
      offEvent("request_not_selected", refresh);
      offEvent("parcel_not_selected",  refresh);
    };
    // loadDashboard is stable (useCallback with no changing deps) so this
    // effect runs exactly once on mount and cleans up on unmount.
  }, [loadDashboard]);

  return {
    parcelRequests,
    setParcelRequests,
    allDeliveries,
    setAllDeliveries,
    deliveries: allDeliveries,
    setDeliveries: setAllDeliveries,
    activeDeliveries,
    setActiveDeliveries,
    completedDeliveries,
    setCompletedDeliveries,
    cancelledDeliveries,
    setCancelledDeliveries,
    stats,
    loading,
    error,
    reload: loadDashboard,
  };
};
