import { io } from 'socket.io-client';
import StorageService from './storage.service';
import { APPLICATION_CONSTANTS } from '../constants/app.constant';

let socket = null;

/**
 * Get the authentication token from storage using the canonical constant key.
 */
const getToken = () => {
  return StorageService.getData(APPLICATION_CONSTANTS.STORAGE.TOKEN);
};

/**
 * Connect to the WebSocket server
 * @returns {socket|null} The socket instance or null if connection fails
 */
export const connectSocket = () => {

  // Already connected — reuse
  if (socket && socket.connected) {
    return socket;
  }

  // Socket exists but is disconnected — destroy it so we get a fresh
  // authenticated connection with the current token (e.g. after re-login).
  // Previously this reused a stale socket which skipped re-authentication.
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  try {

    const token = getToken();

    // VITE_WS_URL must point to the server root (no /api suffix).
    // VITE_API_URL is intentionally NOT used as a fallback here because it
    // includes the /api path suffix which breaks Socket.IO connections.
    const wsUrl = import.meta.env.VITE_WS_URL;

    if (!wsUrl) {
      const msg =
        "[WebSocket] VITE_WS_URL is not set. " +
        "Add it to your .env file. Example: VITE_WS_URL=https://your-backend.onrender.com";

      if (import.meta.env.PROD) {
        console.error(msg);
        return null; // Don't attempt connection — it will fail anyway
      }

      console.warn(msg + " — falling back to http://localhost:3000 for development.");
    }

    const resolvedUrl = wsUrl || "http://localhost:3000";

    console.log("🔄 Attempting WebSocket connection to:", resolvedUrl);

    socket = io(resolvedUrl, {

      auth: { token },

      transports: ["websocket", "polling"],

      // Cap reconnection attempts — Infinity causes runaway reconnect loops
      // and burns CPU/battery when the server is down for an extended period.
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000, // exponential back-off ceiling: 30s

      timeout: 10000,

      autoConnect: true,

    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
    });

    // Notify the user when all reconnection attempts are exhausted
    socket.on("reconnect_failed", () => {
      console.error("🔌 WebSocket: all reconnection attempts failed. Please refresh the page.");
    });

    return socket;

  } catch (error) {
    console.error("[WebSocket] Init failed:", error.message);
    return null;
  }

};

/**
 * Disconnect from the WebSocket server
 */
export const disconnectSocket = () => {
  // Disconnect whether connected or reconnecting — both cases need cleanup
  // so the next login gets a fresh authenticated socket with the new token.
  if (socket) {
    console.log("⚠️ Disconnect requested");
    socket.disconnect();
    socket = null;
    console.log("🔌 WebSocket disconnected manually");
  }
};

/**
 * Get the current socket instance.
 * Always delegates to connectSocket() so the same authenticated socket is
 * reused everywhere. The old implementation created a second, unauthenticated
 * socket when called before connectSocket() — that caused duplicate connections
 * and missing auth tokens on the server side.
 */
export const getSocket = () => {
  return connectSocket();
};

/**
 * Join a specific room (only if connected)
 * @param {string} room - The room name to join
 */
export const joinRoom = (booking_id) => {
  if (socket && socket.connected) {
    socket.emit('join-room', booking_id);
    console.log(`Joined room: ${booking_id}`);
  } else {
    console.log(`Cannot join room ${booking_id} - WebSocket not connected`);
  }
};

/**
 * Leave a specific room (only if connected)
 * @param {string} room - The room name to leave
 */
export const leaveRoom = (room) => {
  if (socket && socket.connected) {
    socket.emit('leave-room', room);
    console.log(`Left room: ${room}`);
  } else {
    console.log(`Cannot leave room ${room} - WebSocket not connected`);
  }
};

/**
 * Emit an event to the server (only if connected)
 * @param {string} event - The event name
 * @param {any} data - The data to send
 */
export const emitEvent = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
    console.log(`✅ Emitted event: ${event}`, data);
  } else {
    console.warn(`⚠️ Cannot emit event ${event} - WebSocket not connected (socket: ${!!socket}, connected: ${socket?.connected})`);
  }
};

/**
 * Listen to an event from the server (only if connected)
 * @param {string} event - The event name
 * @param {Function} callback - The callback function
 */
export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.log(`Cannot listen to event ${event} - WebSocket not available`);
  }
};

/**
 * Remove a listener for an event (only if connected)
 * @param {string} event - The event name
 * @param {Function} callback - The callback function (optional)
 */
export const offEvent = (event, callback) => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinRoom,
  leaveRoom,
  emitEvent,
  onEvent,
  offEvent,
};
