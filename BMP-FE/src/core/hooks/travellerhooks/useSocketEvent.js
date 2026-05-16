import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  connectSocket,
  onEvent,
  offEvent,
} from "../../../core/services/websocket.service";
import { DELIVERY_STATUS } from "../../constants/app.constant";

export const useSocketEvents = ({
  setParcelRequests,
  setDeliveries,
  setCelebrationModal,
}) => {
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    // Handle new parcel request
    const handleNewRequest = (data) => {
      console.log('🔔 New request:', data);
      setParcelRequests((prev) => {
        const exists = prev.some((r) => r.id === data.id);
        if (exists) return prev;
        return [data, ...prev];
      });
      toast.info('New parcel request received!');
    };

    // Handle parcel selected by another traveller
    const handleParcelSelected = (data) => {
      console.log('🔔 Parcel selected:', data);
      setParcelRequests(prev => prev.filter(req => req.id !== data.request_id));
      toast.info('This parcel has been assigned to another traveller.');
    };

    // Handle traveller selected (Phase 1)
    const handleTravellerSelected = (data) => {
      console.log('🎯 Traveller selected:', data);
      // Remove the request from available requests since it's now SELECTED
      // It will appear in deliveries once booking is confirmed
      setParcelRequests(prev => prev.filter(req => req.id !== data.request_id));
      toast.success('🎉 You have been selected! Waiting for payment confirmation...');
    };

    // Handle booking confirmed (Phase 2) - Show celebration modal
    const handleBookingConfirmed = (data) => {
      console.log('🎉 Booking confirmed:', data);
      
      // Show celebration modal
      if (setCelebrationModal) {
        setCelebrationModal({
          open: true,
          data: {
            booking_id: data.booking_id,
            booking_ref: data.booking_ref,
            parcel_id: data.parcel_id,
            parcel_ref: data.parcel_ref,
            final_price: data.final_price,
            pickup_address: data.parcel_details?.pickup_address,
            drop_address: data.parcel_details?.delivery_address,
            pickup_date: data.parcel_details?.pickup_date,
            traveller: data.traveller || null,
            parcel: {
              weight: data.parcel_details?.weight,
              size: data.parcel_details?.size,
            },
            isSelection: false,
            message: 'Booking confirmed! Payment received successfully.',
          },
        });
      }

      // Remove from parcel requests
      setParcelRequests(prev => prev.filter(req => req.id !== data.request_id));

      // Note: Don't add to deliveries here - useTravelerDashboard will handle the refresh
      // This prevents conflicts between local state updates and server data refresh
      
      toast.success('🎉 Booking confirmed! Payment received successfully.');
    };

    // Handle parcel not selected (handles both event names BE may emit)
    const handleParcelNotSelected = (data) => {
      console.log('🔔 Parcel not selected:', data);
      // Remove the request from available requests since it's NOT_SELECTED
      setParcelRequests(prev => prev.filter(req => req.id !== data.request_id));
      toast.info('The parcel has been assigned to another traveller.');
    };

    // Handle proof uploaded (sender sees traveller's proof photo in real-time)
    const handleProofUploaded = (data) => {
      console.log('📸 Proof uploaded:', data);
      const label = data.type === 'PICKUP' ? 'pickup' : 'delivery';
      toast.info(`📸 Traveller uploaded ${label} proof photo.`);
    };

    // Handle delivery attempt failed (traveller couldn't deliver)
    const handleDeliveryAttemptFailed = (data) => {
      console.log('⚠️ Delivery attempt failed:', data);
      toast.warning(`Delivery attempt ${data.attempt_number} failed. ${data.rescheduled_at ? 'Rescheduled.' : 'Please ensure someone is available.'}`);
    };

    // Handle pickup verified
    const handlePickupVerified = (data) => {
      console.log('🔔 Pickup verified:', data);
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === data.booking_id ? { ...d, status: DELIVERY_STATUS.IN_TRANSIT } : d
        )
      );
    };

    // Handle delivery verified
    const handleDeliveryVerified = (data) => {
      console.log('🔔 Delivery verified:', data);
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === data.booking_id ? { ...d, status: DELIVERY_STATUS.DELIVERED } : d
        )
      );
      setTimeout(() => {
        setDeliveries(prev => prev.filter(d => d.id !== data.booking_id));
      }, 3000);
    };

    // Handle booking cancelled
    const handleBookingCancelled = (data) => {
      console.log('🚫 Booking cancelled:', data);
      setDeliveries(prev => prev.filter(d => d.id !== data.booking_id));
      toast.info('A booking has been cancelled by the customer');
    };

    onEvent('new_request', handleNewRequest);
    onEvent('parcel_selected', handleParcelSelected);
    onEvent('traveller_selected', handleTravellerSelected);
    onEvent('booking_confirmed', handleBookingConfirmed);
    onEvent('parcel_not_selected', handleParcelNotSelected);
    onEvent('request_not_selected', handleParcelNotSelected); // BE emits this name
    onEvent('pickup_verified', handlePickupVerified);
    onEvent('delivery_verified', handleDeliveryVerified);
    onEvent('booking_cancelled', handleBookingCancelled);
    onEvent('proof_uploaded', handleProofUploaded);
    onEvent('delivery_attempt_failed', handleDeliveryAttemptFailed);

    return () => {
      offEvent('new_request', handleNewRequest);
      offEvent('parcel_selected', handleParcelSelected);
      offEvent('traveller_selected', handleTravellerSelected);
      offEvent('booking_confirmed', handleBookingConfirmed);
      offEvent('parcel_not_selected', handleParcelNotSelected);
      offEvent('request_not_selected', handleParcelNotSelected);
      offEvent('pickup_verified', handlePickupVerified);
      offEvent('delivery_verified', handleDeliveryVerified);
      offEvent('booking_cancelled', handleBookingCancelled);
      offEvent('proof_uploaded', handleProofUploaded);
      offEvent('delivery_attempt_failed', handleDeliveryAttemptFailed);
    };
  }, [setParcelRequests, setDeliveries, setCelebrationModal]);
};