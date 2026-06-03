import { useState, useEffect } from "react";
import ApiService from "../services/api.service";
import ServerUrl from "../constants/serverUrl.constant";
import { showToast } from "../utils/toast.util";
import { getSocket } from "../services/websocket.service";

/** Transforms a raw API acceptance/pending item into the UI shape */
function transformItem(item, index, acceptanceData) {
  const traveller = item.traveller;
  const tp = traveller.travellerProfile;
  const up = traveller.profile;
  const route = item.route;
  const isPending = item.type === "pending";
  const uniqueId = isPending
    ? `${traveller.id}-req-${item.request_id}`
    : `${traveller.id}-acc-${item.acceptance_id}`;

  const name = up?.name || traveller.email?.split("@")[0] || `Traveller ${index + 1}`;
  const vehicleType = route?.vehicle_type || tp?.vehicle_type || "N/A";
  const vehicleNumber = route?.vehicle_number || tp?.vehicle_number || "N/A";
  const durationMins = route?.total_duration_minutes;
  const etaText = durationMins
    ? durationMins < 60
      ? `${Math.round(durationMins)} min`
      : `${Math.floor(durationMins / 60)}h ${Math.round(durationMins % 60)}m`
    : "—";

  return {
    id: uniqueId,
    travellerId: traveller.id,
    acceptanceId: isPending ? item.request_id : item.acceptance_id,
    routeId: item.route_id,
    name,
    email: traveller.email,
    phone: traveller.phone,
    rating: tp?.rating || 4.8,
    reviews: tp?.total_deliveries || 0,
    trips: tp?.total_deliveries || 0,
    price: isPending ? "Pending" : item.acceptance_price || 0,
    vehicleType,
    vehicleNumber,
    capacity: tp?.capacity_kg || "N/A",
    verified: true,
    avgResponse: "5 mins",
    deliveryTag: isPending ? "Request Sent" : "Interested",
    from: route?.originAddress?.city || acceptanceData.pickup_location?.city || "Pickup",
    to: route?.destAddress?.city || acceptanceData.drop_location?.city || "Delivery",
    duration: etaText,
    fromAddress: route?.originAddress?.address,
    toAddress: route?.destAddress?.address,
    route,
    avatarBg: `bg-${isPending ? "gray" : "blue"}-${(index % 3 + 4) * 100}`,
    detourKm: item.detour_km,
    detourPercentage: item.detour_percentage,
    matchScore: item.match_score,
    acceptedAt: isPending ? item.sent_at : item.accepted_at,
    driveTimeMinutes: item.drive_time_minutes,
    driveDistanceKm: item.drive_distance_km,
    isPending,
    lat:
      tp?.last_known_location?.coordinates?.[1] ||
      (acceptanceData.pickup_location?.lat
        ? acceptanceData.pickup_location.lat + index * 0.001
        : 18.5204),
    lng:
      tp?.last_known_location?.coordinates?.[0] ||
      (acceptanceData.pickup_location?.lng
        ? acceptanceData.pickup_location.lng + index * 0.001
        : 73.8567),
  };
}

/** Restores a previously selected traveller from form data */
function restoreSelection(list, selectedAcceptanceId, selectedPartnerId, setSelectedId, setSelectedRouteId) {
  if (selectedAcceptanceId) {
    const t = list.find((x) => x.acceptanceId === selectedAcceptanceId);
    if (t) { setSelectedId(t.id); setSelectedRouteId(t.acceptanceId); }
  } else if (selectedPartnerId) {
    const t = list.find((x) => x.travellerId === selectedPartnerId);
    if (t) { setSelectedId(t.id); setSelectedRouteId(t.acceptanceId); }
  }
}

export function useStepPartner({ data, updateFields, onNext, parcelId }) {
  const [selectedId, setSelectedId]               = useState(null);
  const [travellers, setTravellers]               = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [parcelData, setParcelData]               = useState(null);
  const [sortBy, setSortBy]                       = useState("detour");
  const [selectedRouteId, setSelectedRouteId]     = useState(null);
  const [highlightedRouteId, setHighlightedRouteId] = useState(null);
  const [newlyAcceptedIds, setNewlyAcceptedIds]   = useState(new Set());

  const fetchTravellers = async (triggerMatching = false) => {
    if (!parcelId) { showToast("Please complete step 1 first", "error"); return; }
    try {
      setLoading(true);

      // Trigger matching engine before fetching acceptances
      if (triggerMatching) {
        try {
          await ApiService.apipost(ServerUrl.API_PARCEL_FIND_TRAVELLERS(parcelId), {});
        } catch {
          // non-fatal — proceed to fetch whatever acceptances exist
        }
      }

      // If booking already exists (navigating back from step 3)
      if (data.bookingId) {
        const res = await ApiService.apiget(ServerUrl.API_GET_PARCEL_BY_ID(parcelId));
        if (res?.data?.success && res.data.data.booking) {
          const parcel = res.data.data;
          const { booking } = parcel;
          const traveller = booking.traveller;
          const profile = traveller.travellerProfile;

          setParcelData({
            pickupLocation: { lat: parcel.pickupAddress.latitude, lng: parcel.pickupAddress.longitude, city: parcel.pickupAddress.city },
            dropLocation:   { lat: parcel.deliveryAddress.latitude, lng: parcel.deliveryAddress.longitude, city: parcel.deliveryAddress.city },
            parcelDistanceKm: parcel.route_distance_km,
          });

          const booked = {
            id: `${traveller.id}-booking-${booking.id}`,
            travellerId: traveller.id,
            acceptanceId: parcel.selected_acceptance_id || booking.id,
            routeId: booking.route_id,
            name: traveller.profile?.name || traveller.email.split("@")[0],
            email: traveller.email,
            phone: traveller.phone_number,
            rating: profile?.rating || 4.8,
            reviews: profile?.total_deliveries || 0,
            trips: profile?.total_deliveries || 0,
            price: booking.final_price || parcel.price_quote || 0,
            vehicleType: profile?.vehicle_type || "N/A",
            vehicleNumber: profile?.vehicle_number || "N/A",
            capacity: profile?.capacity_kg || "N/A",
            verified: true, avgResponse: "5 mins", deliveryTag: "Booked",
            from: parcel.pickupAddress.city, to: parcel.deliveryAddress.city,
            duration: "2-3 hours", avatarBg: "bg-green-500",
            detourKm: 0, detourPercentage: 0, matchScore: 100,
            acceptedAt: booking.createdAt,
            driveTimeMinutes: parcel.route_duration_minutes,
            driveDistanceKm: parcel.route_distance_km,
            isPending: false, isBooked: true,
            lat: profile?.last_known_location?.coordinates?.[1] || parcel.pickupAddress.latitude,
            lng: profile?.last_known_location?.coordinates?.[0] || parcel.pickupAddress.longitude,
          };
          setTravellers([booked]);
          setSelectedId(booked.id);
          setSelectedRouteId(booked.acceptanceId);
          return;
        }
      }

      // Normal flow
      const response = await ApiService.getParcelAcceptances(parcelId, sortBy, true);
      if (response?.data?.success) {
        const ad = response.data.data;
        setParcelData({ pickupLocation: ad.pickup_location, dropLocation: ad.drop_location, parcelDistanceKm: ad.parcel_distance_km });

        const acceptances = ad.acceptances || [];
        const pendingRequests = ad.pending_requests || [];
        const uniquePending = pendingRequests.filter(
          (req) => !acceptances.some((acc) => acc.traveller.id === req.traveller.id && acc.parcel_request_id === req.request_id)
        );
        const all = [
          ...acceptances.map((a) => ({ ...a, type: "accepted" })),
          ...uniquePending.map((r) => ({ ...r, type: "pending" })),
        ];

        if (all.length === 0) { setTravellers([]); return; }

        const transformed = all.map((item, i) => transformItem(item, i, ad));
        setTravellers(transformed);
        restoreSelection(transformed, data.selectedAcceptanceId, data.selectedPartnerId, setSelectedId, setSelectedRouteId);
      } else {
        showToast("Failed to load travellers", "error");
        setTravellers([]);
      }
    } catch {
      showToast("Failed to load travellers", "error");
      setTravellers([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger matching on first mount, then just re-fetch on sort change
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  useEffect(() => {
    if (!hasFetchedOnce) {
      setHasFetchedOnce(true);
      fetchTravellers(true); // trigger matching engine on first load
    } else {
      fetchTravellers(false);
    }
  }, [parcelId, sortBy]);

  // Restore selection when navigating back
  useEffect(() => {
    if (travellers.length > 0 && !selectedId) {
      restoreSelection(travellers, data.selectedAcceptanceId, data.selectedPartnerId, setSelectedId, setSelectedRouteId);
    }
  }, [travellers, data.selectedAcceptanceId, data.selectedPartnerId, selectedId]);

  // WebSocket: new acceptances
  useEffect(() => {
    if (!parcelId) return;
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit("join-parcel", parcelId);

    const handleNewAcceptance = (evt) => {
      if (evt.acceptance_id) {
        setHighlightedRouteId(evt.acceptance_id);
        setNewlyAcceptedIds((prev) => new Set([...prev, evt.acceptance_id]));
        setTimeout(() => setHighlightedRouteId(null), 5000);
        setTimeout(() => setNewlyAcceptedIds((prev) => { const s = new Set(prev); s.delete(evt.acceptance_id); return s; }), 10000);
      }
      const name = evt.traveller?.email?.split("@")[0] || "A traveller";
      showToast(`🎉 ${name} accepted your request!`, "success");
      fetchTravellers();
    };

    socket.on("new_acceptance", handleNewAcceptance);
    return () => { socket.off("new_acceptance", handleNewAcceptance); socket.emit("leave-parcel", parcelId); };
  }, [parcelId]);

  const handleSelect = (t) => {
    if (t.isPending) { showToast("Please wait for this traveller to accept your request first", "info"); return; }
    setSelectedId(t.id);
    setSelectedRouteId(t.acceptanceId);
    updateFields({ selectedPartnerId: t.travellerId, selectedPartnerName: t.name, selectedAcceptanceId: t.acceptanceId, selectedRouteId: t.routeId, priceQuote: `₹${t.price}` });
  };

  const handleRouteClick = (acceptance) => {
    const t = travellers.find((x) => x.acceptanceId === acceptance.acceptance_id);
    if (t) handleSelect(t);
  };

  const handleNext = async () => {
    if (!selectedId) { showToast("Please select a traveller first", "error"); return; }
    try {
      setLoading(true);
      const t = travellers.find((x) => x.id === selectedId);
      if (!t) { showToast("Selected traveller not found", "error"); return; }

      const res = await ApiService.apipost(ServerUrl.API_PARCEL_SELECT_TRAVELLER(parcelId), {
        traveller_id: t.travellerId,
        acceptance_price: t.price,
      });

      if (res?.data?.success) {
        updateFields({ selectedPartnerId: t.travellerId, selectedPartnerName: t.name || "", selectedAcceptanceId: t.acceptanceId, selectedRouteId: t.routeId, priceQuote: t.price });
        showToast("Traveller selected! 🎉", "success");
        onNext();
      } else {
        showToast(res?.data?.message || "Failed to save selection", "error");
      }
    } catch {
      showToast("Failed to save selection", "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedId, travellers, loading, parcelData,
    sortBy, setSortBy,
    selectedRouteId, highlightedRouteId, newlyAcceptedIds,
    fetchTravellers, handleSelect, handleRouteClick, handleNext,
  };
}
