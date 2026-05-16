/**
 * TrackingService — thin wrapper around the shared websocket.service.js
 * for live location tracking in the traveller Live page.
 *
 * Previously this created its own socket.io connection using VITE_SOCKET_URL
 * (which was undefined), resulting in a second unauthenticated socket.
 * Now it delegates to the single shared socket so there is always exactly
 * one authenticated connection per session.
 */
import {
  connectSocket,
  disconnectSocket,
  emitEvent,
  onEvent,
  offEvent,
} from "../core/services/websocket.service";

class TrackingService {
  connect() {
    connectSocket();
  }

  disconnect() {
    // Don't call disconnectSocket() here — the shared socket is used by the
    // whole app. The Live page unmounting should not kill everyone's socket.
    // App.jsx manages the socket lifecycle based on auth state.
  }

  joinDeliveryRoom(deliveryId) {
    emitEvent("join-booking", deliveryId);
  }

  leaveDeliveryRoom(deliveryId) {
    emitEvent("leave-booking", deliveryId);
  }

  onLocationUpdate(callback) {
    onEvent("location-update", callback);
  }

  offLocationUpdate(callback) {
    offEvent("location-update", callback);
  }

  sendLocationUpdate(data) {
    emitEvent("traveller-location", {
      bookingId: data.deliveryId,
      lat: data.location.lat,
      lng: data.location.lng,
    });
  }
}

export default new TrackingService();
