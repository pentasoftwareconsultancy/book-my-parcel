import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import StatsCard from "../../components/StatsCard";
import DeliveryCard from "../../components/DeliveryCard";
import NotificationCard from "../../components/NotificationCard";
import OTPVerificationModal from "../../components/modals/OTPVerificationModal";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import LocalShipping from "@mui/icons-material/LocalShipping";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Star from "@mui/icons-material/Star";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { DELIVERY_STATUS, OTP_TYPE } from "../../core/constants/app.constant";
import { showToast } from "../../core/utils/toast.util";
import { onEvent, offEvent, getSocket } from "../../core/services/websocket.service";


export default function ActiveDeliveries() {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [stats, setStats] = useState({});
  const [notification, setNotification] = useState(null);
  const [otpModal, setOtpModal] = useState({ isOpen: false, booking: null, type: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastSentRef = useRef(0);
  const socket = getSocket();

  // Derive active booking id (IN_TRANSIT = traveller has picked up, now delivering)
  const activeBookingId = activeDeliveries.find(d =>
    [DELIVERY_STATUS.IN_TRANSIT, DELIVERY_STATUS.PICKUP].includes(d.status)
  )?.id ?? null;

  // Join booking socket room + send live location whenever activeBookingId changes
  useEffect(() => {
    if (!activeBookingId) return;
    if (!navigator.geolocation) {
      console.warn("⛔ [Deliveries Location] Geolocation not supported");
      return;
    }

    // Join the booking room so the traveller's own socket is in the room
    const joinRoom = () => {
      socket.emit("join-booking", activeBookingId);
      console.log("🏠 [Socket] Joined booking room:", activeBookingId);
    };
    if (socket.connected) joinRoom();
    else socket.once("connect", joinRoom);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const now = Date.now();
        // Throttle: REST every 5s (DB write), socket every update (~1s)
        socket.emit("traveller-location", { bookingId: activeBookingId, lat, lng });

        if (now - lastSentRef.current > 5000) {
          lastSentRef.current = now;
          try {
            await ApiService.updateLocation({ booking_id: activeBookingId, lat, lng });
            console.log("📤 [Location Sent - API]", { lat, lng, booking: activeBookingId });
          } catch (err) {
            console.error("❌ [Location Send Failed]", err?.response?.data?.message || err.message);
          }
        }
      },
      (err) => console.error("❌ [Geolocation Error]", err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off("connect", joinRoom);
    };
  }, [activeBookingId]);

  useEffect(() => {
    loadData();

    // WebSocket listeners for real-time updates
    const handlePickupVerified = (data) => {
      console.log('Pickup verified:', data);
      loadData(); // Reload to get updated status
      showToast.success('Pickup verified successfully!');
    };

    const handleDeliveryVerified = (data) => {
      console.log('Delivery verified:', data);
      loadData(); // Reload to get updated status
      showToast.success('Delivery completed successfully!');
    };

    onEvent('pickup_verified', handlePickupVerified);
    onEvent('delivery_verified', handleDeliveryVerified);

    return () => {
      offEvent('pickup_verified', handlePickupVerified);
      offEvent('delivery_verified', handleDeliveryVerified);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch confirmed and pickup deliveries (bookings) from API
      const [deliveriesResponse, statsResponse] = await Promise.all([
        ApiService.apiget(
          ServerUrl.API_TRAVELER_DASHBOARD_DELIVERIES,
          { status: `${DELIVERY_STATUS.CONFIRMED},${DELIVERY_STATUS.PICKUP},${DELIVERY_STATUS.IN_TRANSIT}` }
        ),
        ApiService.apiget(
          ServerUrl.API_TRAVELER_DASHBOARD_STATS
        )
      ]);

      if (deliveriesResponse?.data?.success) {
        const resData = deliveriesResponse.data.data;
        const rawDeliveries = resData?.deliveries
          || resData?.data
          || (Array.isArray(resData) ? resData : [])
          || deliveriesResponse.data.message?.deliveries
          || [];

        // Transform the data to match DeliveryCard expectations
        const deliveries = rawDeliveries.map(d => ({
          ...d,
          pickup: typeof d.pickup === 'object' && d.pickup?.city
            ? `${d.pickup.city}, ${d.pickup.state}`
            : d.pickup,
          drop: typeof d.drop === 'object' && d.drop?.city
            ? `${d.drop.city}, ${d.drop.state}`
            : d.drop,
          earnings: d.amount || d.earnings,
          weight: d.package?.weight || d.weight,
          type: d.package?.size || d.type,
          parcel: d.package?.size || d.parcel,
        }));

        console.log('✅ Deliveries loaded:', deliveries.length);
        setActiveDeliveries(deliveries);
      } else {
        console.log('⚠️ No active deliveries found');
        setActiveDeliveries([]);
      }

      if (statsResponse?.data?.success) {
        const stats = statsResponse.data.data?.stats ||
          statsResponse.data.message?.stats ||
          statsResponse.data.data || {};
        setStats(stats);
      } else {
        setStats({});
      }
    } catch (err) {
      console.error("Error loading deliveries data:", err);
      setError("Failed to load deliveries data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartPickup = async (booking) => {
    try {
      await ApiService.startPickup(booking.id);
      showToast.success('Pickup OTP sent to sender!');
      setOtpModal({ isOpen: true, booking, type: OTP_TYPE.PICKUP });
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to start pickup');
    }
  };

  const handleStartDelivery = async (booking) => {
    try {
      await ApiService.startDelivery(booking.id);
      showToast.success('Delivery OTP sent to recipient!');
      setOtpModal({ isOpen: true, booking, type: OTP_TYPE.DELIVERY });
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to start delivery');
    }
  };

  const handleOTPSuccess = (data) => {
    loadData(); // Reload deliveries to get updated status
    setOtpModal({ isOpen: false, booking: null, type: null });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: "#F4F6FB", minHeight: "100vh" }}>
        <div className="flex items-center justify-center h-64">
          <Typography fontSize={18} color="text.secondary">Loading deliveries...</Typography>
        </div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: "#F4F6FB", minHeight: "100vh" }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Typography fontSize={18} color="error" mb={2}>{error}</Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 2 }, bgcolor: "#F4F6FB", minHeight: "100vh" }}>

      {/* ================= HEADER ================= */}
      <Typography fontSize={22} fontWeight={700} mb={0.5}>
        Active Deliveries
      </Typography>
      <Typography fontSize={13} color="text.secondary" mb={3}>
        Track and complete your ongoing deliveries
      </Typography>

      {/* STATS CARDS */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Earnings", value: `₹${stats.totalEarnings || 0}`, icon: AccountBalanceWallet, gradient: "from-green-400 to-green-500" },
          { title: "Active Deliveries", value: stats.active || 0, icon: LocalShipping, gradient: "from-orange-400 to-orange-500" },
          { title: "Completed Deliveries", value: stats.completed || 0, icon: CheckCircle, gradient: "from-blue-400 to-blue-500" },
          { title: "Average Rating", value: stats.rating || "0.0", icon: Star, gradient: "from-purple-400 to-purple-500" },
        ].map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div> */}

      {/* NOTIFICATION */}
      {notification && (
        <NotificationCard type={notification.type} message={notification.message} />
      )}

      {/* ACTIVE DELIVERY LIST */}
      {activeDeliveries.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center">
          <Typography fontWeight={700}>No Active Deliveries </Typography>
          <Typography fontSize={13} color="text.secondary">
            Confirmed bookings will appear here
          </Typography>
        </div>
      ) : (
        <div>
          {activeDeliveries.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
              <DeliveryCard
                delivery={{
                  ...d,
                  status: d.status,
                  pickup: d.pickup?.city || d.pickup,
                  drop: d.drop?.city || d.drop,
                  earnings: d.amount,
                  weight: d.package?.weight || `${d.weight || 0} kg`
                }}
                showActions={false}
                userType="traveller"
              />

              {/* ACTION BUTTONS BASED ON STATUS */}
              <div className="mt-4">
                {d.status === DELIVERY_STATUS.CONFIRMED && (
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <Typography fontWeight={600} fontSize={14} className="text-blue-900">
                          Ready for Pickup
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          Start pickup to generate OTP for sender
                        </Typography>
                      </div>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStartPickup(d)}
                        sx={{ borderRadius: 2 }}
                      >
                        Start Pickup
                      </Button>
                    </div>
                  </div>
                )}

                {d.status === DELIVERY_STATUS.PICKUP && (
                  <div className="p-4 bg-yellow-50 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <Typography fontWeight={600} fontSize={14} className="text-yellow-900">
                          Awaiting Pickup Verification
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          Ask sender to provide the pickup OTP to proceed
                        </Typography>
                      </div>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => setOtpModal({ isOpen: true, booking: d, type: OTP_TYPE.PICKUP })}
                        sx={{ borderRadius: 2 }}
                      >
                        Enter OTP
                      </Button>
                    </div>
                  </div>
                )}

                {d.status === DELIVERY_STATUS.IN_TRANSIT && (
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <Typography fontWeight={600} fontSize={14} className="text-green-900">
                          Ready for Delivery
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          Start delivery to generate OTP for recipient
                        </Typography>
                      </div>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleStartDelivery(d)}
                        sx={{ borderRadius: 2 }}
                      >
                        Start Delivery
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      <OTPVerificationModal
        isOpen={otpModal.isOpen}
        onClose={() => setOtpModal({ isOpen: false, booking: null, type: null })}
        booking={otpModal.booking}
        otpType={otpModal.type}
        onSuccess={handleOTPSuccess}
      />
    </Box>
  );
}
