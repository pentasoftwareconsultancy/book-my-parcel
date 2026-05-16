import { useEffect, useRef } from "react";
import ApiService from "../../services/api.service";

export const useLocationTracking = (activeBookingId) => {
  const lastSentRef = useRef(0);

  useEffect(() => {

    console.log("🚀 LocationTracking Hook Started");
    console.log("📦 Active Booking ID:", activeBookingId);

    if (!activeBookingId) {
      console.log("❌ No active booking — tracking stopped");
      return;
    }

    let watchId;

    if (navigator.geolocation) {

      console.log("📡 Starting geolocation watch...");

      watchId = navigator.geolocation.watchPosition(

        async (pos) => {

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          console.log("📍 Traveller Position:", {
            lat,
            lng
          });

          const now = Date.now();

          if (now - lastSentRef.current > 800) {

            try {

              console.log("📤 Sending location to API:", {
                booking_id: activeBookingId,
                lat,
                lng
              });

              const res = await ApiService.updateLocation({
                booking_id: activeBookingId,
                lat,
                lng,
              });

              console.log("✅ Location API Response:", res);

              lastSentRef.current = now;

            } catch (err) {

              console.error("❌ Location send failed:", err);

            }

          }

        },

        (err) => {
          console.error("❌ Geolocation error:", err);
        },

        {
          enableHighAccuracy: true
        }
      );
    }

    return () => {

      console.log("🛑 Clearing location watch");

      if (watchId)
        navigator.geolocation.clearWatch(watchId);

    };

  }, [activeBookingId]);

};