// src/pages/traveler/AvailableRequest.jsx
import { useEffect, useState, useCallback } from "react";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";

import {
  CircularProgress,
  Card,
  Button,
  Alert,
} from "@mui/material";
import StatsCard from "../../components/StatsCard";
import DeliveryCard from "../../components/DeliveryCard";
import NotificationCard from "../../components/NotificationCard";
import ParcelRequestDetailModal from "../../components/traveler/ParcelRequestDetailModal";
import ErrorBoundary from "../../components/ErrorBoundary";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import LocalShipping from "@mui/icons-material/LocalShipping";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Star from "@mui/icons-material/Star";
import { showSuccess, showError, showInfo } from "../../core/utils/toast.util";
import { getSocket } from "../../core/services/websocket.service";
import { safeToNumber } from "../../core/utils/number.util";

const AvailableRequest = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const [response, statsResponse] = await Promise.all([
        ApiService.getTravellerRequests({
          status: "SENT,INTERESTED",
          page,
          limit: 10,
        }),
        ApiService.apiget(ServerUrl.API_TRAVELER_DASHBOARD_STATS)
      ]);

      if (response?.data?.success) {
        // dashboard/requests returns { requests: [...], pagination: {} }
        const data = response.data.data?.requests || response.data.data || [];
        const transformed = data.map(request => ({
          id: request.id,
          bookingId: request.parcelId || request.parcelRef || request.id,
          parcelId: request.parcelId || request.parcelRef || request.id,
          status: request.status === "SENT" ? "AVAILABLE" : request.status,
          customer: request.customer || "Parcel Sender",
          customer_name: request.customer || "Parcel Sender",
          customer_phone: request.customerPhone || "",
          pickup: typeof request.pickup === 'object' 
            ? `${request.pickup.city}, ${request.pickup.state}` 
            : request.pickup || "N/A",
          drop: typeof request.drop === 'object'
            ? `${request.drop.city}, ${request.drop.state}`
            : request.drop || "N/A",
          pickup_address: {
            city: request.pickup?.city,
            locality: request.pickup?.locality,
            address: request.pickup?.address,
            state: request.pickup?.state,
            pincode: request.pickup?.pincode,
          },
          drop_address: {
            city: request.drop?.city,
            locality: request.drop?.locality,
            address: request.drop?.address,
            state: request.drop?.state,
            pincode: request.drop?.pincode,
          },
          earnings: request.amount || 0,
          amount: request.amount || 0,
          parcelType: request.package?.type || "Standard",
          parcel_type: request.package?.type || "Standard",
          weight: request.package?.weight
            ? `${request.package.weight} kg`
            : `${request.weight || 0} kg`,
          // Use actual route distance, fall back to detour distance
          distance: safeToNumber(request.route?.distance_km || request.routeDistanceKm)
            ? `${safeToNumber(request.route?.distance_km || request.routeDistanceKm)} km`
            : `${safeToNumber(request.detourKm || request.detour_km) || 0} km detour`,
          distance_km: safeToNumber(request.route?.distance_km || request.routeDistanceKm),
          // Pass raw number — DeliveryCard's formatRupee will add the ₹ prefix
          totalAmount: request.amount || 0,
          price_quote: request.amount,
          parcel_ref: request.parcelRef || request.parcel_ref,
          match_score: request.matchScore || request.match_score,
          detour_km: safeToNumber(request.detourKm || request.detour_km),
          detour_percentage: safeToNumber(request.detourPercentage || request.detour_percentage),
          expires_at: request.expiresAt || request.expires_at,
          // Route dates
          pickupDate: request.route?.departure_date || request.departureDate || "",
          dropDate:   request.route?.arrival_date   || request.arrivalDate   || "",
        }));

        setRequests(transformed);
        setPagination(response.data.data?.pagination || response.data.pagination || {});
      } else {
        console.error('API response not successful:', response.data);
      }

      // Fetch and set stats
      if (statsResponse?.data?.success) {
        const stats = statsResponse.data.data?.stats || 
                     statsResponse.data.message?.stats || 
                     statsResponse.data.data || {};
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage);

    // WebSocket: Listen for new requests
    const socket = getSocket();
    if (socket && socket.connected) {
      const handleNewRequest = (data) => {
        console.log('🔔 New request received via WebSocket:', data);
        
        // Automatically refetch data to get the latest requests
        fetchData(currentPage);
        
        // Show notification
        showInfo(`New parcel request from ${data.parcel?.pickup?.city} to ${data.parcel?.delivery?.city}`);
        setNotification({
          type: "accepted",
          message: `New request: ${data.parcel?.pickup?.city} → ${data.parcel?.delivery?.city}`,
        });
        setTimeout(() => setNotification(null), 3000);
      };

      const handleRequestAccepted = (data) => {
        console.log('Request accepted by another traveller:', data);
        // Refetch to update the list
        fetchData(currentPage);
      };

      socket.on('new_request', handleNewRequest);
      socket.on('request_accepted', handleRequestAccepted);

      // Cleanup
      return () => {
        socket.off('new_request', handleNewRequest);
        socket.off('request_accepted', handleRequestAccepted);
      };
    } else {
      console.log('WebSocket not available - real-time updates disabled');
    }
  }, [currentPage, fetchData]);

  const handleViewDetails = (req) => {
    setSelectedRequest(req);
    setDetailModalOpen(true);
  };

  const handleAcceptSuccess = (requestId) => {
    try {
      // Remove the accepted request from the list
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      // Show success notification
      setNotification({
        type: "accepted",
        message: "Request accepted successfully!",
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error in handleAcceptSuccess:', error);
    }
  };

  const resetData = () => {
    setCurrentPage(1);
    fetchData(1);
    setNotification({
      type: "accepted",
      message: "Data refreshed from server!"
    });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] p-3 sm:p-4 lg:p-6">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Available Requests
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your delivery requests and track earnings
          </p>
        </div>
        <Button 
          onClick={resetData}
          variant="outlined" 
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </div>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          {
            title: "Total Earnings",
            value: `₹${stats.totalEarnings || 0}`,
            icon: AccountBalanceWallet,
            gradient: "from-green-400 to-green-500",
          },
          {
            title: "Active Deliveries",
            value: stats.active || 0,
            icon: LocalShipping,
            gradient: "from-orange-400 to-orange-500",
          },
          {
            title: "Completed",
            value: stats.completed || 0,
            icon: CheckCircle,
            gradient: "from-blue-400 to-blue-500",
          },
          {
            title: "Avg Rating",
            value: stats.rating || "0.0",
            icon: Star,
            gradient: "from-purple-400 to-purple-500",
          },
        ].map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* ── NOTIFICATION ────────────────────────────────────────────────── */}
      {notification && (
        <NotificationCard type={notification.type} message={notification.message} />
      )}

      {/* ── NO REQUESTS ─────────────────────────────────────────────────── */}
      {requests.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-center mb-4 shadow-sm">
          <p className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
            No Available Requests
          </p>
          <p className="text-sm text-gray-500 mb-4">
            All deliveries have been processed. Click "Refresh" to get fresh requests.
          </p>
          <button
            onClick={resetData}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Get Fresh Requests
          </button>
        </div>
      )}

      {/* ── DELIVERY CARDS ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {requests.map((r) => (
          <DeliveryCard
            key={r.id}
            delivery={{ ...r, status: "AVAILABLE" }}
            showActions={true}
            onAction={(action, delivery) => {
              if (action === "accept" || action === "express_interest") {
                handleViewDetails(delivery);
              } else if (action === "details") {
                handleViewDetails(delivery);
              } else if (action === "decline") {
                // Optimistically remove from list
                setRequests((prev) => prev.filter((req) => req.id !== delivery.id));
              }
            }}
          />
        ))}
      </div>

      {/* ── DETAIL MODAL ───────────────────────────────────────────────── */}
      <ErrorBoundary>
        <ParcelRequestDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          request={selectedRequest}
          onAcceptSuccess={handleAcceptSuccess}
        />
      </ErrorBoundary>
    </div>
  );
};

export default AvailableRequest;