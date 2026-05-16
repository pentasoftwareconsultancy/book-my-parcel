import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchDashboardOrders } from "../../store/slices/userSlices";
import ApiService from "../services/api.service";
import ServerUrl from "../constants/serverUrl.constant";
import { connectSocket, onEvent, offEvent, emitEvent } from "../services/websocket.service";
import StorageService from "../services/storage.service";
import { APPLICATION_CONSTANTS, DELIVERY_STATUS } from "../constants/app.constant";
import RoutePath from "../constants/routes.constant";

export const PATH_STATUS_MAP = {
  [RoutePath.USER_ALL_ORDERS]: Object.values(DELIVERY_STATUS),
  [RoutePath.USER_ACTIVE]: [
    DELIVERY_STATUS.CREATED, DELIVERY_STATUS.MATCHING, DELIVERY_STATUS.PARTNER_SELECTED,
    DELIVERY_STATUS.CONFIRMED, DELIVERY_STATUS.IN_TRANSIT, DELIVERY_STATUS.ASSIGNED,
    DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.PENDING,
  ],
  [RoutePath.USER_COMPLETED]: [DELIVERY_STATUS.DELIVERED],
  [RoutePath.USER_CANCELLED]: [DELIVERY_STATUS.CANCELLED],
};

/** Maps a raw API order object to the shape used by the UI */
export function mapOrder(order) {
  const selectedAcceptance =
    order.selected_partner_id && order.acceptances?.length > 0
      ? order.acceptances.find((acc) => acc.traveller.id === order.selected_partner_id)
      : null;

  const traveler = selectedAcceptance
    ? {
        name: selectedAcceptance.traveller?.profile?.name || selectedAcceptance.traveller?.email || "Unknown",
        rating: selectedAcceptance.traveller?.travellerProfile?.rating || "N/A",
        phone: selectedAcceptance.traveller?.phone_number || "",
        vehicle: selectedAcceptance.traveller?.travellerProfile?.vehicle_type || "",
        vehicleNumber: selectedAcceptance.traveller?.travellerProfile?.vehicle_number || "",
        totalDeliveries: selectedAcceptance.traveller?.travellerProfile?.total_deliveries || 0,
      }
    : { name: "Not Assigned", rating: "N/A", phone: "" };

  return {
    id: order.id,
    parcel_ref: order.parcel_ref,
    booking_ref: order.booking?.booking_ref,
    tracking_ref: order.booking?.tracking_ref,
    parcelId: order.id,
    bookingId: order.booking?.booking_ref,
    trackingId: order.booking?.tracking_ref,
    deliveryId: order.booking?.id,
    status: order.booking?.status || order.status,
    amount: order.price_quote ?? order.value ?? "—",
    bookedDate: new Date(order.createdAt).toLocaleDateString("en-IN"),
    selected_partner_id: order.selected_partner_id,
    acceptances: order.acceptances,
    has_feedback: order.has_feedback || false,
    existing_feedback: order.existing_feedback || null,
    pickup_otp: order.booking?.pickup_otp,
    delivery_otp: order.booking?.delivery_otp,
    pickup: {
      name: order.pickupAddress?.name,
      address: order.pickupAddress?.address,
      city: order.pickupAddress?.city,
      state: order.pickupAddress?.state,
      pincode: order.pickupAddress?.pincode,
      country: order.pickupAddress?.country,
      phone: order.pickupAddress?.phone,
      alt_phone: order.pickupAddress?.alt_phone,
    },
    delivery: {
      name: order.deliveryAddress?.name,
      address: order.deliveryAddress?.address,
      city: order.deliveryAddress?.city,
      state: order.deliveryAddress?.state,
      pincode: order.deliveryAddress?.pincode,
      country: order.deliveryAddress?.country,
      phone: order.deliveryAddress?.phone,
      alt_phone: order.deliveryAddress?.alt_phone,
    },
    package: {
      size: order.package_size
        ? order.package_size.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "—",
      weight: order.weight ? `${order.weight} kg` : "—",
      eta: order.route_duration_minutes
        ? order.route_duration_minutes < 60
          ? `${Math.round(order.route_duration_minutes)} mins`
          : `${Math.round(order.route_duration_minutes / 60)} hrs`
        : "—",
      description: order.description,
      parcelType: order.parcel_type,
      value: order.value,
      length: order.length,
      width: order.width,
      height: order.height,
      notes: order.notes,
    },
    traveler,
  };
}

export function useOrdersData() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpData, setOtpData] = useState({});

  const currentPath = location.pathname;

  const fetchOrders = useCallback(
    async (path = currentPath) => {
      try {
        setLoading(true);
        setError(null);
        const params = { page: 1, limit: 20 };
        const statuses = PATH_STATUS_MAP[path] || [];
        if (path !== RoutePath.USER_ALL_ORDERS && statuses.length > 0) {
          params.status = statuses.join(",");
        }
        dispatch(fetchDashboardOrders());
        const response = await ApiService.apiget(ServerUrl.API_USER_DASHBOARD_ORDERS, params);
        if (response?.data?.success) {
          const raw = response.data.data?.data || response.data.data || [];
          setOrders(raw.map(mapOrder));
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [currentPath, dispatch]
  );

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Stable WebSocket handlers ──────────────────────────────────────────────
  const handleParcelMatching = useCallback((data) => {
    setOrders((prev) =>
      prev.map((o) => o.parcelId === data.parcel_id ? { ...o, status: DELIVERY_STATUS.PARTNER_SELECTED } : o)
    );
  }, []);

  const handleNewInterest    = useCallback(() => fetchOrders(), [fetchOrders]);
  const handleNewAcceptance  = useCallback(() => fetchOrders(), [fetchOrders]);

  const handleTravellerSelected = useCallback((data) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.parcelId === data.parcel_id
          ? { ...o, status: DELIVERY_STATUS.CONFIRMED, selected_partner_id: data.traveller_id,
              traveler: { name: data.traveller_name || "Assigned", rating: "N/A", phone: "" } }
          : o
      )
    );
  }, []);

  const handlePickupOTPGenerated = useCallback((data) => {
    setOtpData((prev) => ({ ...prev, [data.booking_id]: { ...prev[data.booking_id], pickup_otp: data.pickup_otp, traveller_name: data.traveller_name } }));
    setOrders((prev) =>
      prev.map((o) => o.deliveryId === data.booking_id ? { ...o, status: DELIVERY_STATUS.PICKUP, pickup_otp: data.pickup_otp } : o)
    );
  }, []);

  const handleDeliveryOTPGenerated = useCallback((data) => {
    setOtpData((prev) => ({ ...prev, [data.booking_id]: { ...prev[data.booking_id], delivery_otp: data.delivery_otp, traveller_name: data.traveller_name } }));
    setOrders((prev) =>
      prev.map((o) => o.deliveryId === data.booking_id ? { ...o, delivery_otp: data.delivery_otp } : o)
    );
  }, []);

  const handlePickupVerified = useCallback((data) => {
    setOtpData((prev) => ({ ...prev, [data.booking_id]: { ...prev[data.booking_id], pickup_otp: null } }));
    setOrders((prev) =>
      prev.map((o) => o.deliveryId === data.booking_id ? { ...o, status: data.status || DELIVERY_STATUS.IN_TRANSIT } : o)
    );
  }, []);

  const handleDeliveryVerified = useCallback((data) => {
    setOtpData((prev) => ({ ...prev, [data.booking_id]: { ...prev[data.booking_id], delivery_otp: null } }));
    setOrders((prev) =>
      prev.map((o) => o.deliveryId === data.booking_id ? { ...o, status: data.status || DELIVERY_STATUS.DELIVERED, has_feedback: false } : o)
    );
    setTimeout(() => fetchOrders(), 800);
  }, [fetchOrders]);

  const handleParcelCancelled = useCallback((data) => {
    setOrders((prev) => prev.filter((o) => o.parcelId !== data.parcel_id));
  }, []);

  const handleBookingConfirmed = useCallback(() => fetchOrders(), [fetchOrders]);

  useEffect(() => {
    connectSocket();
    const userId = user?.id || StorageService.getData(APPLICATION_CONSTANTS.STORAGE.USER_DETAILS)?.id;
    if (userId) emitEvent("join_user", userId);

    onEvent("parcel_matching",          handleParcelMatching);
    onEvent("new_interest",             handleNewInterest);
    onEvent("new_acceptance",           handleNewAcceptance);
    onEvent("traveller_selected",       handleTravellerSelected);
    onEvent("pickup_otp_generated",     handlePickupOTPGenerated);
    onEvent("delivery_otp_generated",   handleDeliveryOTPGenerated);
    onEvent("pickup_verified",          handlePickupVerified);
    onEvent("delivery_verified",        handleDeliveryVerified);
    onEvent("parcel_cancelled",         handleParcelCancelled);
    onEvent("booking_confirmed",        handleBookingConfirmed);
    onEvent("parcel_booking_confirmed", handleBookingConfirmed);

    return () => {
      offEvent("parcel_matching",          handleParcelMatching);
      offEvent("new_interest",             handleNewInterest);
      offEvent("new_acceptance",           handleNewAcceptance);
      offEvent("traveller_selected",       handleTravellerSelected);
      offEvent("pickup_otp_generated",     handlePickupOTPGenerated);
      offEvent("delivery_otp_generated",   handleDeliveryOTPGenerated);
      offEvent("pickup_verified",          handlePickupVerified);
      offEvent("delivery_verified",        handleDeliveryVerified);
      offEvent("parcel_cancelled",         handleParcelCancelled);
      offEvent("booking_confirmed",        handleBookingConfirmed);
      offEvent("parcel_booking_confirmed", handleBookingConfirmed);
    };
  }, [
    user?.id,
    handleParcelMatching, handleNewInterest, handleNewAcceptance,
    handleTravellerSelected, handlePickupOTPGenerated, handleDeliveryOTPGenerated,
    handlePickupVerified, handleDeliveryVerified, handleParcelCancelled, handleBookingConfirmed,
  ]);

  return { orders, loading, error, otpData, fetchOrders, currentPath };
}
