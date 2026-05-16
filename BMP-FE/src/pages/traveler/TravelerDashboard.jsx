import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import LocalShipping from "@mui/icons-material/LocalShipping";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Star from "@mui/icons-material/Star";

import RoutePath from "../../core/constants/routes.constant";
import StatsCard from "../../components/StatsCard";
import DeliveryCard from "../../components/DeliveryCard";
import NotificationCard from "../../components/NotificationCard";
import TravellerSelectionCelebrationModal from "../../components/modals/TravellerSelectionCelebrationModal";
import OTPVerificationModal from "../../components/modals/OTPVerificationModal";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import paymentService from "../../services/paymentService";
import { DELIVERY_STATUS, OTP_TYPE } from "../../core/constants/app.constant";
import { showError } from "../../core/utils/toast.util";

import { useTravelerDashboard } from "../../core/hooks/travellerhooks/useTravelerDashboard";
import { useSocketEvents } from "../../core/hooks/travellerhooks/useSocketEvent";
import { useLocationTracking } from "../../core/hooks/travellerhooks/useLocationTracking";
import ContactModal from "../../components/modals/ContactModal";

export default function TravelerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [celebrationModal, setCelebrationModal] = useState({ open: false, data: null });
  const [otpModal, setOtpModal] = useState({ open: false, booking: null, type: null });
  const [notification, setNotification] = useState(null);
  const [receivingPaymentId, setReceivingPaymentId] = useState(null);
  const [contactModal, setContactModal] = useState({ open: false, contact: null });

  // ✅ Use custom hooks for data, WebSocket, and location
  const {
    parcelRequests,
    setParcelRequests,
    deliveries,
    setDeliveries,
    activeDeliveries,
    completedDeliveries,
    cancelledDeliveries,
    allDeliveries,
    stats,
    loading,
    error,
  } = useTravelerDashboard();

  // Debug stats loading
  useEffect(() => {
    if (stats && Object.keys(stats).length > 0) {
      console.log('✅ [TravelerDashboard] Stats updated:', stats);
    }
  }, [stats]);

  // ✅ Determine view type from current route
  const getViewType = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('available')) return 'AVAILABLE';
    if (path.includes('active')) return 'ACTIVE';
    if (path.includes('completed')) return 'COMPLETED';
    if (path.includes('cancelled')) return 'CANCELLED';
    return 'ALL';
  };

  const viewType = getViewType();

  // ✅ Map view type to data and config
  const viewConfig = {
    AVAILABLE: {
      title: 'Available Requests',
      description: 'Parcel requests sent to you',
      data: parcelRequests,
      emptyMessage: 'No available requests',
      emptyDetails: 'New parcel requests will appear here',
    },
    ACTIVE: {
      title: 'Active Deliveries',
      description: 'Ongoing deliveries',
      data: activeDeliveries,
      emptyMessage: 'No active deliveries',
      emptyDetails: 'Confirmed bookings appear here',
    },
    COMPLETED: {
      title: 'Completed Deliveries',
      description: 'Successfully delivered parcels',
      data: completedDeliveries,
      emptyMessage: 'No completed deliveries',
      emptyDetails: 'Your completed deliveries will appear here',
    },
    CANCELLED: {
      title: 'Cancelled Deliveries',
      description: 'Cancelled or rejected deliveries',
      data: cancelledDeliveries,
      emptyMessage: 'No cancelled deliveries',
      emptyDetails: 'Cancelled deliveries appear here',
    },
    ALL: {
      title: 'All Deliveries',
      description: 'All your deliveries',
      // Deduplicate by parcel id — prevents same item appearing in both
      // parcelRequests (INTERESTED) and allDeliveries (CONFIRMED) simultaneously
      data: (() => {
        const seen = new Set();
        return [...parcelRequests, ...allDeliveries].filter(item => {
          const key = item.parcelId || item.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      })(),
      emptyDetails: 'Your deliveries will appear here',
    },
};

const currentView = viewConfig[viewType];

// Get active booking for location tracking - add safety check
const activeBookingId = (activeDeliveries || []).find(d =>
  ["PICKUP", "IN_TRANSIT"].includes(d.status)
)?.id;

// Setup WebSocket events and celebration modal
useSocketEvents({
  setParcelRequests,
  setDeliveries,
  setCelebrationModal,
});

// Setup location tracking for active deliveries
useLocationTracking(activeBookingId);

// Handle delivery actions (express interest, decline, pickup, delivery, etc.)
const handleDeliveryAction = useCallback(async (action, delivery) => {
  console.log(`📋 Action: ${action}`, delivery);

  try {
    switch (action) {
      case 'start_pickup':
        try {
          setDeliveries(prev => prev.map(del =>
            del.id === delivery.id ? { ...del, loading: true } : del
          ));
          await ApiService.startPickup(delivery.id);
          setOtpModal({
            open: true,
            booking: delivery,
            type: OTP_TYPE.PICKUP
          });
        } catch (error) {
          console.error('❌ Failed to start pickup:', error);
          showError(error.response?.data?.message || 'Failed to start pickup');
        } finally {
          setDeliveries(prev => prev.map(del =>
            del.id === delivery.id ? { ...del, loading: false } : del
          ));
        }
        break;

      case 'verify_pickup':
        setOtpModal({
          open: true,
          booking: delivery,
          type: OTP_TYPE.PICKUP
        });
        break;

      case 'start_delivery':
        try {
          setDeliveries(prev => prev.map(del =>
            del.id === delivery.id ? { ...del, loading: true } : del
          ));
          await ApiService.startDelivery(delivery.id);
          setOtpModal({
            open: true,
            booking: delivery,
            type: OTP_TYPE.DELIVERY
          });
        } catch (error) {
          console.error('❌ Failed to start delivery:', error);
          showError(error.response?.data?.message || 'Failed to start delivery');
        } finally {
          setDeliveries(prev => prev.map(del =>
            del.id === delivery.id ? { ...del, loading: false } : del
          ));
        }
        break;

      case 'verify_delivery':
        setOtpModal({
          open: true,
          booking: delivery,
          type: OTP_TYPE.DELIVERY
        });
        break;

      case 'express_interest':
        if (delivery.expiresAt && new Date(delivery.expiresAt) < new Date()) {
          toast.error('This request has expired');
          setParcelRequests(prev => prev.filter(req => req.id !== delivery.id));
          break;
        }

        setParcelRequests(prev => prev.map(req =>
          req.id === delivery.id ? { ...req, status: 'INTERESTED' } : req
        ));

        try {
          await ApiService.apipost(ServerUrl.API_TRAVELER_EXPRESS_INTEREST(delivery.id), {});
          toast.success('Interest expressed! We will notify you if selected.');
        } catch (error) {
          setParcelRequests(prev => prev.map(req =>
            req.id === delivery.id ? { ...req, status: 'SENT' } : req
          ));
          console.error('❌ Failed to express interest:', error);
          toast.error('Failed to express interest');
        }
        break;

      case 'decline':
        setParcelRequests(prev => prev.map(req =>
          req.id === delivery.id ? { ...req, status: 'REJECTED' } : req
        ));

        try {
          await ApiService.apipost(ServerUrl.API_TRAVELER_REJECT_REQUEST_BY_ID(delivery.id), {});
          toast.success('Request rejected');
          setTimeout(() => {
            setParcelRequests(prev => prev.filter(req => req.id !== delivery.id));
          }, 1500);
        } catch (error) {
          setParcelRequests(prev => prev.map(req =>
            req.id === delivery.id ? { ...req, status: 'SENT' } : req
          ));
          console.error('❌ Failed to reject:', error);
          toast.error('Failed to reject request');
        }
        break;

      case 'contact':
        setContactModal({
          open: true,
          contact: {
            name: delivery.customer,
            phone: delivery.customerPhone,
            role: "customer",
          },
        });
        break;

      case 'details':
        const detailsId = delivery.parcelId || delivery.id;
        navigate(`${RoutePath.TRAVELER_BASE}/parcel/${detailsId}`);
        break;

      case 'cancel':
        if (!window.confirm('Cancel this delivery?')) break;

        try {
          setDeliveries(prev => prev.map(del =>
            del.id === delivery.id ? { ...del, loading: true } : del
          ));

          await ApiService.cancelBooking(delivery.id, {
            reason: 'traveller_initiated',
            details: 'Cancelled by traveller'
          });

          toast.success('Delivery cancelled');
          setTimeout(() => {
            setDeliveries(prev => prev.filter(del => del.id !== delivery.id));
          }, 1500);
        } catch (error) {
          console.error('❌ Failed to cancel:', error);
          toast.error(error.response?.data?.message || 'Failed to cancel');
        } finally {
          setDeliveries(prev => prev.map(del =>
            del.id === delivery.id ? { ...del, loading: false } : del
          ));
        }
        break;

      case 'receive_payment':
        try {
          setReceivingPaymentId(delivery.id);
          console.log("💰 [Dashboard] Receiving payment for booking:", delivery.id);
          const response = await paymentService.receivePayment(delivery.id);
          console.log("💰 [Dashboard] Payment response:", response);
          
          const amount = response.data?.amount || response.amount;
          toast.success(`✅ ₹${amount} payment received. Amount will be transferred via cash/UPI.`);
          
          // ✅ Update delivery status to DELIVERED
          setDeliveries(prev => prev.map(del =>
            del.id === delivery.id 
              ? { ...del, status: DELIVERY_STATUS.DELIVERED }
              : del
          ));
          console.log("✅ [Dashboard] Delivery marked as DELIVERED");
        } catch (err) {
          console.error("❌ [Dashboard] Error receiving payment:", err);
          toast.error(err.response?.data?.message || err.message || 'Failed to receive payment');
        } finally {
          setReceivingPaymentId(null);
        }
        break;

      case 'view_details':
        navigate(RoutePath.TRAVELLER_DETAILS(delivery.id));
        break;

      case 'dispute':
        navigate(RoutePath.TRAVELLER_DISPUTE, { state: { order: delivery } });
        break;

      default:
        console.log('Unknown action:', action);
    }
  } catch (error) {
    console.error('Action error:', error);
    showError('An error occurred');
  }
}, [setDeliveries, setParcelRequests, navigate]);

// Handle OTP success callback
const handleOTPSuccess = useCallback((response) => {
  console.log('✅ OTP verified:', response);
  setOtpModal({ open: false, booking: null, type: null });

  const result = response?.data?.data || response?.data || response;
  if (result?.booking) {
    setDeliveries(prev => prev.map(del =>
      del.id === result.booking.id
        ? { ...del, status: result.booking.status }
        : del
    ));
  }
}, []);

// ✅ Stats cards configuration with proper structure
const statsCards = [
  {
    title: "Total Earnings",
    value: `₹${stats.totalEarnings || 0}`,
    icon: AccountBalanceWallet,
    gradient: "from-green-400 to-green-500",
    textColor: "text-white",
    onClick: () => navigate(RoutePath.TRAVELLER_EARNINGS),
  },
  {
    title: "Active Deliveries",
    value: stats.active || 0,
    icon: LocalShipping,
    gradient: "from-orange-400 to-orange-500",
    textColor: "text-white",
  },
  {
    title: "Completed Deliveries",
    value: stats.completed || 0,
    icon: CheckCircle,
    gradient: "from-blue-400 to-blue-500",
    textColor: "text-white"
  },
  {
    title: "Average Rating",
    value: stats.rating || "0.0",
    icon: Star,
    gradient: "from-purple-400 to-purple-500",
    textColor: "text-white"
  },
];

// Loading state
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 flex items-center justify-center">
      <p className="text-base sm:text-lg text-gray-500">Loading dashboard...</p>
    </div>
  );
}

// Error state
if (error) {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-base sm:text-lg text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-2 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold truncate">{currentView.title}</h1>
          <p className="text-xs sm:text-sm text-gray-500">{currentView.description}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={() => navigate(RoutePath.TRAVELER_MYROUTES)}
            variant="contained"
            sx={{
              borderRadius: 2,
              fontSize: { xs: "11px", sm: "14px" },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.8, sm: 1 },
              whiteSpace: "nowrap",
            }}
          >
            + View Routes
          </Button>
        </div>
      </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      {statsCards.map((stat, index) => (
        <div key={index} onClick={stat.onClick} className="cursor-pointer">
          <StatsCard {...stat} />
        </div>
      ))}
    </div>

    {/* NOTIFICATION */}
    {notification && (
      <NotificationCard
        type={notification.type}
        title={notification.title}
        message={notification.message}
        details={notification.details}
        actions={notification.actions}
        onClose={() => setNotification(null)}
      />
    )}

    {/* ✅ DYNAMIC CONTENT BASED ON VIEW TYPE */}
    {currentView.data.length === 0 ? (
      <div className="text-center py-10 sm:py-16 bg-white rounded-xl shadow">
        <p className="text-base sm:text-lg text-gray-500">{currentView.emptyMessage}</p>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">{currentView.emptyDetails}</p>
      </div>
    ) : (
      <div className="space-y-3 sm:space-y-4">
        {currentView.data.map((item) => (
          <DeliveryCard
            key={item.id}
            delivery={{
              ...item,
              payment_mode: item.paymentMode || item.payment_mode, // ✅ Ensure payment_mode is passed
              isReceivingPayment: receivingPaymentId === item.id
            }}
            showActions={true}
            onAction={handleDeliveryAction}
            userType="traveller"
          />
        ))}
      </div>
    )}

    {/* CONTACT MODAL */}
    <ContactModal
      open={contactModal.open}
      onClose={() => setContactModal({ open: false, contact: null })}
      contact={contactModal.contact}
    />

    {/* CELEBRATION MODAL */}
    <TravellerSelectionCelebrationModal
      open={celebrationModal.open}
      onClose={() => setCelebrationModal({ open: false, data: null })}
      bookingData={celebrationModal.data}
    />

    {/* OTP VERIFICATION MODAL */}
    <OTPVerificationModal
      isOpen={otpModal.open}
      onClose={() => setOtpModal({ open: false, booking: null, type: null })}
      booking={otpModal.booking}
      otpType={otpModal.type}
      onSuccess={handleOTPSuccess}
    />
  </div>
);
}