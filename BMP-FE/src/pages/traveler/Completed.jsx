import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import StatsCard from "../../components/StatsCard";
import DeliveryCard from "../../components/DeliveryCard";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import LocalShipping from "@mui/icons-material/LocalShipping";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Star from "@mui/icons-material/Star";
import { DELIVERY_STATUS } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import paymentService from "../../services/paymentService";


export default function Completed() {
  const navigate = useNavigate();
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receivingPaymentId, setReceivingPaymentId] = useState(null);

  // Handle delivery card actions
  const handleDeliveryAction = async (action, delivery) => {
    if (action === "view_details") {
      // Navigate to parcel details page
      navigate(RoutePath.TRAVELLER_DETAILS(delivery.id));
      return;
    }
    
    if (action === "receive_payment") {
      try {
        setReceivingPaymentId(delivery.id);
        console.log("💰 Receiving payment for booking:", delivery.id);
        
        const result = await paymentService.receivePayment(delivery.id);
        
        if (result.success) {
          alert(`✅ ₹${result.data.amount} payment received. Amount will be transferred via cash/UPI.`);
          // Reload data to update UI
          const updatedDeliveries = await ApiService.apiget(
            ServerUrl.API_TRAVELER_DASHBOARD_DELIVERIES,
            { status: DELIVERY_STATUS.DELIVERED }
          );
          
          if (updatedDeliveries?.data?.success) {
            const responseData = updatedDeliveries.data.data;
            let rawDeliveries = [];
            if (Array.isArray(responseData)) {
              rawDeliveries = responseData;
            } else if (responseData && typeof responseData === 'object') {
              rawDeliveries = responseData.deliveries || responseData.data || [];
            }
            
            const mappedDeliveries = rawDeliveries.map(d => ({
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
              status: d.status || DELIVERY_STATUS.DELIVERED,
              payment_mode: "PAY_NOW", // All payments are PAY_NOW
            }));
            
            setCompletedDeliveries(mappedDeliveries);
          }
        }
      } catch (err) {
        console.error("Error receiving payment:", err);
        const message = err.message || "Failed to receive payment";
        alert(`❌ ${message}`);
      } finally {
        setReceivingPaymentId(null);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch delivered bookings and stats (✅ Only DELIVERED status now)
        const [deliveriesResponse, statsResponse] = await Promise.allSettled([
          ApiService.apiget(
            ServerUrl.API_TRAVELER_DASHBOARD_DELIVERIES,
            { status: DELIVERY_STATUS.DELIVERED }
          ),
          ApiService.apiget(
            ServerUrl.API_TRAVELER_DASHBOARD_STATS
          )
        ]);

        // Handle deliveries
        if (deliveriesResponse.status === 'fulfilled' && deliveriesResponse.value?.data?.success) {
          const responseData = deliveriesResponse.value.data.data;
          
          // Extract deliveries array from response
          let rawDeliveries = [];
          if (Array.isArray(responseData)) {
            rawDeliveries = responseData;
          } else if (responseData && typeof responseData === 'object') {
            rawDeliveries = responseData.deliveries || responseData.data || [];
          }
          
          // Map deliveries to the format expected by DeliveryCard
          const deliveries = rawDeliveries.map(d => ({
            ...d,
            // Convert pickup object to string format
            pickup: typeof d.pickup === 'object' && d.pickup?.city 
              ? `${d.pickup.city}, ${d.pickup.state}` 
              : d.pickup,
            // Convert drop object to string format  
            drop: typeof d.drop === 'object' && d.drop?.city
              ? `${d.drop.city}, ${d.drop.state}`
              : d.drop,
            // Map other fields for DeliveryCard compatibility
            earnings: d.amount || d.earnings,
            weight: d.package?.weight || d.weight,
            type: d.package?.size || d.type,
            parcel: d.package?.size || d.parcel,
            status: d.status || DELIVERY_STATUS.DELIVERED,
            payment_mode: "PAY_NOW", // All payments are PAY_NOW
          }));
          
          console.log('✅ Completed deliveries loaded:', deliveries.length);
          setCompletedDeliveries(deliveries);
        } else {
          console.log('⚠️ No completed deliveries found');
          setCompletedDeliveries([]);
        }

        // Handle stats
        if (statsResponse.status === 'fulfilled' && statsResponse.value?.data?.success) {
          const statsData = statsResponse.value.data.data?.stats || 
                           statsResponse.value.data.message?.stats || 
                           statsResponse.value.data.data || {};
          setStats(statsData);
        } else {
          console.log('Failed to fetch stats, using defaults');
          setStats({});
        }
      } catch (err) {
        console.error("Error loading completed deliveries:", err);
        setError("Failed to load completed deliveries. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================== CALCULATIONS ================== */
  const totalEarnings = completedDeliveries.reduce(
    (sum, d) => sum + Number(d.earnings || 0),
    0
  );

  const averageRating =
    completedDeliveries.length > 0
      ? (completedDeliveries.reduce((s, d) => s + (d.rating || 0), 0) / completedDeliveries.length).toFixed(1)
      : "0.0";

  /* ================== UI ================== */
  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: "#F4F6FB", minHeight: "100vh" }}>
        <Typography textAlign="center" color="text.secondary" mt={8}>
          Loading completed deliveries...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: "#F4F6FB", minHeight: "100vh" }}>
        <Typography textAlign="center" color="error" mt={8}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: "#F4F6FB", minHeight: "100vh" }}>
      {/* ================= HEADER ================= */}
      <Typography fontSize={22} fontWeight={700} mb={0.5}>
        Completed Deliveries
      </Typography>
      <Typography fontSize={13} color="text.secondary" mb={3}>
        View your completed deliveries and total earnings
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

      {/* COMPLETED DELIVERY CARDS */}
      {completedDeliveries.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, bgcolor: "white", borderRadius: 3, boxShadow: 1 }}>
          <CheckCircle sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography fontSize={18} fontWeight={600} color="text.secondary" mb={1}>
            No completed deliveries yet
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Your completed deliveries will appear here
          </Typography>
        </Box>
      ) : (
        <div>
          {completedDeliveries.map((d) => (
            <DeliveryCard 
              key={d.id} 
              delivery={{...d, isReceivingPayment: receivingPaymentId === d.id}}
              onAction={handleDeliveryAction}
              showActions={true}
              userType="traveller"
            />
          ))}
        </div>
      )}
    </Box>
  );
}