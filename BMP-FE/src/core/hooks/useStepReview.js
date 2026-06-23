import { useState, useEffect, useRef } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import ApiService from "../services/api.service";
import ServerUrl from "../constants/serverUrl.constant";
import { showToast } from "../utils/toast.util";
import { DELIVERY_STATUS } from "../constants/app.constant";

function normalizePrice(raw) {
  return typeof raw === "string" ? raw.replace(/[^\d.]/g, "") : raw;
}

export function useStepReview({ data, readOnly }) {
  const [parcelData, setParcelData] = useState(null);
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const blobUrlsRef = useRef([]);

  const trackingId = data.createdParcelId || null;

  // Build parcelData from form fields (sync, no API needed)
  useEffect(() => {
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    const photos = [data.parcelPhoto1, data.parcelPhoto2, data.parcelPhoto3]
      .filter((f) => f instanceof File)
      .map((f) => { const url = URL.createObjectURL(f); blobUrlsRef.current.push(url); return url; });

    setParcelData((prev) => ({
      ...(prev || {}),
      photos: photos.length > 0 ? photos : prev?.photos || [],
      addresses: [
        { type: "pickup", name: data.senderName || "", address: data.pickupAddress || "", city: data.pickupCity || "", state: data.pickupState || "", pincode: data.pickupPincode || "", country: data.pickupCountry || "India", phone: data.pickupPhone || "", alt_phone: data.pickupAltPhone || "" },
        { type: "delivery", name: data.receiverName || "", address: data.deliveryAddress || "", city: data.deliveryCity || "", state: data.deliveryState || "", pincode: data.deliveryPincode || "", country: data.deliveryCountry || "India", phone: data.deliveryPhNo || "", alt_phone: data.deliveryAlternatePhNo || "" },
      ],
      package_size: data.packageSize || "",
      weight: data.parcelWeight || "",
      length: data.parcelLength || "",
      width: data.parcelWidth || "",
      height: data.parcelHeight || "",
      vehicle_type: data.vehicleType || "",
      description: data.parcelContents || "",
      parcel_type: data.parcelType || "",
      value: data.parcelValue || "",
      notes: data.parcelNotes || "",
    }));
    setLoading(false);

    return () => { blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)); };
  }, [
    data.senderName, data.receiverName,
    data.pickupAddress, data.pickupCity, data.pickupState, data.pickupPincode, data.pickupPhone, data.pickupAltPhone,
    data.deliveryAddress, data.deliveryCity, data.deliveryState, data.deliveryPincode, data.deliveryPhNo, data.deliveryAlternatePhNo,
    data.packageSize, data.parcelWeight, data.parcelLength, data.parcelWidth, data.parcelHeight,
    data.parcelContents, data.parcelType, data.parcelValue, data.parcelNotes,
    data.parcelPhoto1, data.parcelPhoto2, data.parcelPhoto3,
  ]);

  // Fetch API data (booking info, status, parcel_ref, photo URLs)
  useEffect(() => {
    if (!data.createdParcelId) return;
    ApiService.apiget(ServerUrl.API_GET_PARCEL_BY_ID(data.createdParcelId))
      .then((res) => {
        if (res?.data?.success) {
          const d = res.data.data;
          const apiPhotos = (d.photos || []).map((p) => p?.startsWith("http") ? p : `${ServerUrl.BASE_URL}${p}`);
          setParcelData((prev) => ({
            ...prev,
            parcel_ref: d.parcel_ref || prev?.parcel_ref,
            price_quote: d.price_quote || prev?.price_quote,
            status: d.status || prev?.status,
            booking: d.booking || prev?.booking,
            booking_id: d.booking?.id,
            photos: apiPhotos.length > 0 ? apiPhotos : prev?.photos || [],
          }));
        }
      })
      .catch(() => { });
  }, [data.createdParcelId, data.selectedPartnerId]);

  // Fetch selected traveller
  useEffect(() => {
    if (!data.selectedPartnerId) return;

    const fetch = async () => {
      if (data.createdParcelId) {
        try {
          const res = await ApiService.apiget(ServerUrl.API_GET_PARCEL_BY_ID(data.createdParcelId));
          if (res?.data?.success) {
            const parcel = res.data.data;
            const traveller = parcel.booking?.traveller;
            if (traveller) {
              const tp = traveller.travellerProfile;
              setSelectedTraveler({
                id: traveller.id,
                name: traveller.profile?.name || traveller.email?.split("@")[0] || "Selected Traveler",
                email: traveller.email,
                phone: traveller.phone_number,
                rating: tp?.rating || 4.5,
                vehicleType: tp?.vehicle_type || "Car",
                vehicleNumber: tp?.vehicle_number || "N/A",
                totalDeliveries: tp?.total_deliveries || 0,
                price: normalizePrice(parcel.booking?.final_price || parcel.price_quote || data.priceQuote),
                from: parcel.pickupAddress?.city || data.pickupCity || "Pickup",
                to: parcel.deliveryAddress?.city || data.deliveryCity || "Delivery",
                duration: "2-3 hours",
                avatarBg: "bg-gradient-to-br from-[#FFB347] to-[#FF6B6B]",
              });
              return;
            }
          }
        } catch { /* silent */ }
      }
      // Fallback to form data
      setSelectedTraveler({
        id: data.selectedPartnerId,
        name: data.selectedPartnerName || "Selected Traveler",
        rating: 4.5, vehicleType: "Car",
        from: data.pickupCity || "Pickup Location",
        to: data.deliveryCity || "Delivery Location",
        duration: "3-4 hours",
        price: normalizePrice(data.priceQuote) || 0,
        avatarBg: "bg-gradient-to-br from-[#FFB347] to-[#FF6B6B]",
      });
    };
    fetch();
  }, [data.selectedPartnerId, data.createdParcelId]);

  // Status helpers
  const getOrderStatus = () =>
    parcelData?.status || parcelData?.booking?.status || data?.status || DELIVERY_STATUS.CREATED;

  const shouldShowPaymentOptions = () => {
    if (readOnly) return false;
    const hasTraveller = !!(selectedTraveler || data.selectedPartnerId);
    if (!hasTraveller) return false;
    const status = getOrderStatus();
    // Show payment for any pre-payment status when a traveller is selected
    const allowed = [
      DELIVERY_STATUS.CREATED,
      DELIVERY_STATUS.MATCHING,
      DELIVERY_STATUS.PARTNER_SELECTED,
      DELIVERY_STATUS.CONFIRMED,
    ];
    return allowed.includes(status);
  };

  const shouldShowConfirmButton = () => !readOnly && shouldShowPaymentOptions() && !!(selectedTraveler || data.selectedPartnerId);

  const getStatusMessage = () => {
    const hasTraveller = selectedTraveler || data.selectedPartnerId;
    switch (getOrderStatus()) {
      case DELIVERY_STATUS.CREATED: return "Order created. Waiting for traveller selection.";
      case DELIVERY_STATUS.MATCHING: return "Finding suitable travellers for your parcel.";
      case DELIVERY_STATUS.PARTNER_SELECTED: return "Traveller selected! Click Pay Now to confirm your booking.";
      case DELIVERY_STATUS.CONFIRMED: return hasTraveller ? "Booking confirmed! Your parcel is ready for pickup." : "Traveller selection pending.";
      case DELIVERY_STATUS.IN_TRANSIT: return "Your parcel is in transit with the traveller.";
      case DELIVERY_STATUS.DELIVERED: return "Your parcel has been successfully delivered.";
      case DELIVERY_STATUS.CANCELLED: return "This order has been cancelled.";
      case DELIVERY_STATUS.AUTO_CANCELLED: return "This parcel request expired because no traveller accepted within the allowed time.";
      default: return "";
    }
  };

  const createOrderFromForm = (pickupAddress, deliveryAddress) => ({
    id: Date.now(),
    bookingId: parcelData?.booking?.booking_ref || data.bookingRef || data.bookingId || trackingId,
    trackingId,
    parcelId: parcelData?.parcel_ref || data.createdParcelId || `P-${trackingId}`,
    deliveryId: `D-${trackingId}`,
    status: DELIVERY_STATUS.CONFIRMED,
    amount: selectedTraveler?.price || normalizePrice(data.priceQuote) || parcelData?.price_quote || 0,
    paymentMethod: "Paid Online", paymentStatus: "Paid",
    bookedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    pickup: pickupAddress, delivery: deliveryAddress,
    package: { size: parcelData?.package_size, weight: `${parcelData?.weight} kg` },
    traveler: selectedTraveler
      ? { name: selectedTraveler.name, rating: selectedTraveler.rating, phone: selectedTraveler.phone || "-" }
      : { name: "Not Assigned", rating: 0, phone: "-" },
  });

  const handlePayment = async (pickupAddress) => {
    try {
      const parcelId = data.createdParcelId || parcelData?.id;

      if (!parcelId) {
        showToast("Parcel ID not available.", "error");
        return;
      }

      const orderRes = await ApiService.apipost(
        ServerUrl.API_PAYMENT_CREATE_ORDER,
        {
          parcel_id: parcelId,
        }
      );

      if (!orderRes?.data?.success) {
        showToast(
          orderRes?.data?.message || "Order creation failed.",
          "error"
        );
        return;
      }

      const order = orderRes.data.data.order;

      const payment_session_id = order.payment_session_id;
      const order_id = order.id;

      const cashfree = await load({
        mode: "sandbox", // production later
      });

      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal",
      };

      const result = await cashfree.checkout(
        checkoutOptions
      );

      if (result?.error) {
        showToast(
          result.error.message || "Payment failed",
          "error"
        );
        return;
      }

      const verifyRes = await ApiService.apipost(
        ServerUrl.API_PAYMENT_VERIFY,
        {
          order_id,
          parcel_id: parcelId,
        }
      );

      if (verifyRes?.data?.success) {
        await ApiService.apipatch(
          ServerUrl.API_UPDATE_PARCEL_STEP(parcelId),
          {
            form_step: 3,
            payment_mode: "PAY_NOW",
            selected_partner_id: data.selectedPartnerId,
          }
        );

        setShowConfetti(true);

        showToast(
          "Payment successful! Booking confirmed.",
          "success"
        );

        await new Promise((r) =>
          setTimeout(r, 1000)
        );

        const updated = await ApiService.apiget(
          ServerUrl.API_GET_PARCEL_BY_ID(parcelId)
        );

        if (updated?.data?.success) {
          const u = updated.data.data;

          setParcelData((prev) => ({
            ...prev,
            ...u,
            booking: u.booking,
            photos: (u.photos || []).map((p) =>
              p?.startsWith("http")
                ? p
                : `${ServerUrl.BASE_URL}${p}`
            ),
          }));

          data.bookingRef =
            u.booking?.booking_ref;

          data.bookingId =
            u.booking?.id;
        }

        setShowPopup(true);
      } else {
        showToast(
          "Payment verification failed.",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        "Payment failed. Please try again.",
        "error"
      );
    }
  };

  return {
    parcelData, selectedTraveler, loading, showPopup, setShowPopup,
    processingPayment, showConfetti, setShowConfetti, trackingId,
    getOrderStatus, shouldShowPaymentOptions, shouldShowConfirmButton,
    getStatusMessage, createOrderFromForm, handlePayment,
  };
}
