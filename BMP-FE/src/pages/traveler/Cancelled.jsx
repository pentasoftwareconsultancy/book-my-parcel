import React, { useState, useEffect } from "react";
import { Box, Typography, Card } from "@mui/material";
import { useNavigate } from "react-router-dom";
import StatsCard from "../../components/StatsCard";
import DeliveryCard from "../../components/DeliveryCard";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import LocalShipping from "@mui/icons-material/LocalShipping";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Star from "@mui/icons-material/Star";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { DELIVERY_STATUS } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";


export default function Cancelled() {
  const navigate = useNavigate();
  const [cancelledDeliveries, setCancelledDeliveries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch cancelled bookings and stats from API
        const [deliveriesResponse, statsResponse] = await Promise.all([
          ApiService.apiget(
            ServerUrl.API_TRAVELER_DASHBOARD_DELIVERIES,
            { status: DELIVERY_STATUS.CANCELLED }
          ),
          ApiService.apiget(
            ServerUrl.API_TRAVELER_DASHBOARD_STATS
          )
        ]);

        // Handle deliveries
        if (deliveriesResponse?.data?.success) {
          const responseData = deliveriesResponse.data.data;
          let rawDeliveries = [];
          if (Array.isArray(responseData)) {
            rawDeliveries = responseData;
          } else if (responseData && typeof responseData === 'object') {
            rawDeliveries = responseData.deliveries || responseData.data || [];
          }
          setCancelledDeliveries(rawDeliveries);
        }

        // Handle stats
        if (statsResponse?.data?.success) {
          const stats = statsResponse.data.data?.stats || 
                       statsResponse.data.message?.stats || 
                       statsResponse.data.data || {};
          setStats(stats);
        }
      } catch (error) {
        console.error('Error loading cancelled deliveries:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAction = (action, delivery) => {
    if (action === "details") {
      const detailsId = delivery.parcelId || delivery.id;
      navigate(`${RoutePath.TRAVELER_BASE}/parcel/${detailsId}`);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: "#F4F6FB", minHeight: "100vh" }}>
      {/* ================= HEADER ================= */}
      <Typography fontSize={22} fontWeight={700} mb={0.5}>
        Cancelled Deliveries
      </Typography>
      <Typography fontSize={13} color="text.secondary" mb={3}>
        Manage your delivery requests and track your earnings
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

      {/* CANCELLED DELIVERY CARDS */}
      <div>
        {cancelledDeliveries.map((d) => (
          <DeliveryCard 
            key={d.id} 
            delivery={{...d, status: DELIVERY_STATUS.CANCELLED}} 
            onAction={handleAction}
          />
        ))}
      </div>
    </Box>
  );
}

