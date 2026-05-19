import { useEffect, useRef } from "react";
import ApiService from "../../services/api.service";
import { getSocket } from "../../services/websocket.service";

export const useLocationTracking = (activeBookingId) => {
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!activeBookingId) return;
    if (!navigator.geolocation) return;

    const socket = getSocket();

    // Join the booking room so socket broadcasts reach the sender
    const joinRoom = () => socket.emit("join-booking", activeBookingId);
    if (socket.connected) joinRoom();
    else socket.once("connect", joinRoom);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Always emit via socket for real-time (fast path)
        socket.emit("traveller-location", { bookingId: activeBookingId, lat, lng });

        // Persist to DB every 5s (slow path)
        const now = Date.now();
        if (now - lastSentRef.current > 5000) {
          lastSentRef.current = now;
          try {
            await ApiService.updateLocation({ booking_id: activeBookingId, lat, lng });
          } catch (err) {
            console.error("❌ Location send failed:", err);
          }
        }
      },
      (err) => console.error("❌ Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off("connect", joinRoom);
    };
  }, [activeBookingId]);
};
