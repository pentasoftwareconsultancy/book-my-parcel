import jwt from "jsonwebtoken";
import { expireOldRequests } from "../services/matchingEngine.service.js";
import ChatMessage from "../modules/booking/chatMessage.model.js";
import Booking from "../modules/booking/booking.model.js";
import redis from "../redis/redis.config.js";
import { acquireRedisLock, releaseRedisLock } from "../redis/utils/redisLock.util.js";

// ─── Socket.IO Authentication Middleware ──────────────────────────────────────
// Verifies the JWT token sent in socket.handshake.auth.token on every connection.
// Unauthenticated connections are rejected before any event handlers run.
function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required: no token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return next(new Error("Authentication required: invalid token payload"));
    }

    // Attach verified userId to the socket — used for room authorization below
    socket.userId = decoded.id;
    next();
  } catch (err) {
    // jwt.verify throws for expired/invalid tokens
    next(new Error("Authentication required: " + err.message));
  }
}

export function setupSocketHandlers(io) {
  // ── Apply auth middleware to ALL socket connections ───────────────────────
  io.use(socketAuthMiddleware);

  console.log("✅ Socket.IO server initialized with authentication");

  io.on("connection", (socket) => {
    const userId = socket.userId; // set by socketAuthMiddleware — always present here
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Socket] Client connected: ${socket.id} (user: ${userId})`);
    }

    // ── Debug logging — development only ─────────────────────────────────
    // REMOVED from production: socket.onAny logs every event including OTP payloads
    if (process.env.NODE_ENV !== "production") {
      socket.onAny((eventName, ...args) => {
        // Redact sensitive fields before logging
        const safeArgs = args.map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            const { otp, pickup_otp, delivery_otp, ...rest } = arg;
            return otp || pickup_otp || delivery_otp
              ? { ...rest, _redacted: "sensitive fields omitted" }
              : rest;
          }
          return arg;
        });
        console.log(`[Socket] Event: ${eventName}`, safeArgs);
      });
    }

    // ─── Heartbeat/Keepalive ──────────────────────────────────────────────
    socket.on("ping", () => {
      socket.emit("pong");
    });

    // ─── Join user room ───────────────────────────────────────────────────
    // SECURITY: Only allow joining your own user room.
    // The userId is taken from the verified JWT, not from the client payload.
    const joinUserRoom = () => {
      const room = `user_${userId}`;
      socket.join(room);
      if (process.env.NODE_ENV !== "production") {
        const clients = io.sockets.adapter.rooms.get(room);
        console.log(`[Socket] User ${userId} joined room ${room} (${clients?.size || 0} members)`);
      }
    };

    // Accept both event names for backward compatibility
    socket.on("join_user",      joinUserRoom);
    socket.on("join_user_room", joinUserRoom);

    // ─── Leave user room ──────────────────────────────────────────────────
    socket.on("leave_user", () => {
      socket.leave(`user_${userId}`);
    });

    // ─── Join parcel room ─────────────────────────────────────────────────
    // SECURITY: Verify the requesting user owns or is assigned to this parcel.
    socket.on("join_parcel", async (parcelId) => {
      if (!parcelId) return;
      try {
        // Import lazily to avoid circular deps
        const { default: Parcel } = await import("../modules/parcel/parcel.model.js");
        const parcel = await Parcel.findByPk(parcelId, {
          attributes: ["id", "user_id", "selected_partner_id"],
        });

        if (!parcel) return;

        const isOwner    = parcel.user_id === userId;
        const isPartner  = parcel.selected_partner_id === userId;

        if (!isOwner && !isPartner) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[Socket] Unauthorized join_parcel attempt by user ${userId} for parcel ${parcelId}`);
          }
          return;
        }

        socket.join(`parcel_${parcelId}`);
      } catch (err) {
        console.error("[Socket] join_parcel error:", err.message);
      }
    });

    // ─── Leave parcel room ────────────────────────────────────────────────
    socket.on("leave_parcel", (parcelId) => {
      if (parcelId) socket.leave(`parcel_${parcelId}`);
    });

    // ─── Join traveller requests room ─────────────────────────────────────
    // SECURITY: Only allow joining your own traveller room.
    socket.on("join_traveller_requests", (travellerId) => {
      if (!travellerId) return;

      if (travellerId !== userId) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[Socket] Unauthorized join_traveller_requests: user ${userId} tried to join traveller ${travellerId}`);
        }
        return;
      }

      socket.join(`traveller_requests_${userId}`);
    });

    // ─── Leave traveller requests room ────────────────────────────────────
    socket.on("leave_traveller_requests", () => {
      socket.leave(`traveller_requests_${userId}`);
    });

    // ─── Join live tracking / booking room ───────────────────────────────
    // SECURITY: Verify the user is a participant in this booking.
    socket.on("join-booking", async (bookingId) => {
      if (!bookingId) return;
      try {
        const booking = await Booking.findByPk(bookingId, {
          attributes: ["id", "traveller_id"],
          include: [{
            association: "parcel",
            attributes:  ["user_id"],
          }],
        });

        if (!booking) return;

        const isTraveller = booking.traveller_id === userId;
        const isSender    = booking.parcel?.user_id === userId;

        if (!isTraveller && !isSender) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[Socket] Unauthorized join-booking: user ${userId} for booking ${bookingId}`);
          }
          return;
        }

        socket.join(`booking_${bookingId}`);
      } catch (err) {
        console.error("[Socket] join-booking error:", err.message);
      }
    });

    // ─── Traveller sends live location → forwarded to booking room ────────
    socket.on("traveller-location", ({ bookingId, lat, lng }) => {
      // Validate payload
      if (!bookingId || lat == null || lng == null) return;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

      socket.to(`booking_${bookingId}`).emit("location-update", {
        lat,
        lng,
        timestamp: Date.now(),
      });
    });

    // ─── In-app chat ──────────────────────────────────────────────────────
    socket.on("chat_message", async ({ bookingId, senderRole, message }) => {
      // Validate payload — senderId is taken from the verified JWT, not the client
      if (!bookingId || !senderRole || !message?.trim()) {
        socket.emit("chat_error", { message: "Invalid message payload." });
        return;
      }

      // Validate senderRole is a known value
      if (!["user", "traveller", "admin"].includes(senderRole)) {
        socket.emit("chat_error", { message: "Invalid sender role." });
        return;
      }

      // Sanitize message length
      const sanitizedMessage = message.trim().slice(0, 2000);

      try {
        // Verify the sender is a participant in this booking
        const booking = await Booking.findByPk(bookingId, {
          attributes: ["id", "traveller_id"],
          include: [{ association: "parcel", attributes: ["user_id"] }],
        });

        if (!booking) {
          socket.emit("chat_error", { message: "Booking not found." });
          return;
        }

        const isTraveller = booking.traveller_id === userId;
        const isSender    = booking.parcel?.user_id === userId;

        if (!isTraveller && !isSender) {
          socket.emit("chat_error", { message: "Not authorized to send messages in this booking." });
          return;
        }

        // Persist to DB — use verified userId, not client-supplied senderId
        const saved = await ChatMessage.create({
          booking_id:  bookingId,
          sender_id:   userId,
          sender_role: senderRole,
          message:     sanitizedMessage,
        });

        const payload = {
          id:          saved.id,
          booking_id:  bookingId,
          sender_id:   userId,
          sender_role: senderRole,
          message:     saved.message,
          is_read:     false,
          createdAt:   saved.createdAt,
        };

        io.to(`booking_${bookingId}`).emit("chat_message", payload);
      } catch (err) {
        console.error("[Socket] Failed to save chat message:", err.message);
        socket.emit("chat_error", { message: "Failed to send message. Please try again." });
      }
    });

    // ─── Mark chat messages as read ───────────────────────────────────────
    socket.on("chat_read", async ({ bookingId }) => {
      if (!bookingId) return;

      try {
        // Verify the reader is a participant in this booking
        const booking = await Booking.findByPk(bookingId, {
          attributes: ["id", "traveller_id"],
          include: [{ association: "parcel", attributes: ["user_id"] }],
        });

        if (!booking) return;

        const isTraveller = booking.traveller_id === userId;
        const isSender    = booking.parcel?.user_id === userId;

        if (!isTraveller && !isSender) return;

        // Only mark messages NOT sent by this user as read
        await ChatMessage.update(
          { is_read: true },
          {
            where: {
              booking_id: bookingId,
              is_read:    false,
              // Don't mark your own messages as "read by you"
              sender_id: { [Symbol.for("ne")]: userId },
            },
          }
        );

        socket.to(`booking_${bookingId}`).emit("chat_read_ack", {
          bookingId,
          readerId: userId,
        });
      } catch (err) {
        console.error("[Socket] Failed to mark messages read:", err.message);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Socket] Client disconnected: ${socket.id} (user: ${userId})`);
      }
    });
  });

  // ─── Periodic task: Expire old requests every 5 minutes ──────────────────
  setInterval(async () => {
    const lockKey = "lock:jobs:expire-old-requests";
    let lockToken = null;

    if (redis) {
      try {
        lockToken = await acquireRedisLock(lockKey, 4 * 60 * 1000);
        if (!lockToken) return;
      } catch (lockErr) {
        console.warn("[Socket] Redis lock acquire failed:", lockErr.message);
        return;
      }
    }

    try {
      const expiredCount = await expireOldRequests();
      if (expiredCount > 0) {
        console.log(`[Socket] Expired ${expiredCount} old requests`);
      }
    } catch (error) {
      console.error("[Socket] Error expiring requests:", error.message);
    } finally {
      if (lockToken) {
        try {
          await releaseRedisLock(lockKey, lockToken);
        } catch (unlockErr) {
          console.warn("[Socket] Redis lock release failed:", unlockErr.message);
        }
      }
    }
  }, 5 * 60 * 1000);
}

// ─── Helpers — call these from controllers via req.app.get("io") ──────────────

export function emitNewAcceptance(io, parcelId, data) {
  io.to(`parcel_${parcelId}`).emit("new_acceptance", data);
}

export function emitParcelSelected(io, parcelId, data) {
  io.to(`parcel_${parcelId}`).emit("parcel_selected", data);
}

export function emitTravellerSelected(io, travellerId, data) {
  io.to(`traveller_requests_${travellerId}`).emit("traveller_selected", data);
}

export function emitNewRequest(io, travellerId, data) {
  io.to(`traveller_requests_${travellerId}`).emit("new_request", data);
}

export function emitRequestExpired(io, travellerId, requestId) {
  io.to(`traveller_requests_${travellerId}`).emit("request_expired", { request_id: requestId });
}

export function emitOtpEvent(io, userId, event, data) {
  io.to(`user_${userId}`).emit(event, data);
}

export function emitBookingEvent(io, bookingId, event, data) {
  io.to(`booking_${bookingId}`).emit(event, data);
}

export function emitNotification(io, userId, notification) {
  io.to(`user_${userId}`).emit("new_notification", notification);
}
