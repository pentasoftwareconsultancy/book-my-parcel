import Booking from "../booking/booking.model.js";
import {
  initiateTracking,
  updateTravellerLocation,
  getTrackingByBookingId,
  completeDelivery,
  calculateETA,
  saveProofPhoto,
} from "./parcelTracking.service.js";

// Tracking writes are gated by role ("TRAVELLER") only at the route level —
// this verifies the requester is actually the traveller assigned to this
// specific booking, so one traveller can't overwrite another's GPS, mark
// someone else's delivery complete, or upload proof for a booking they
// don't own.
async function verifyTravellerOwnsBooking(bookingId, userId) {
  const booking = await Booking.findByPk(bookingId, {
    attributes: ["id", "traveller_id"],
  });
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  if (booking.traveller_id !== userId) {
    const err = new Error("Forbidden: you are not the traveller for this booking");
    err.statusCode = 403;
    throw err;
  }
  return booking;
}

export async function handleInitiateTracking(req, res) {
  try {
    const { booking_id, vehicle_type } = req.body;
    if (!booking_id)
      return res.status(400).json({ message: "booking_id is required" });

    await verifyTravellerOwnsBooking(booking_id, req.user.id);

    const tracking = await initiateTracking(booking_id, vehicle_type);

    const io = req.app.get("io");
    if (io) {
      io.to(`booking_${booking_id}`).emit("tracking_initiated", {
        booking_id,
        status:           tracking.status,
        encoded_polyline: tracking.encoded_polyline,
        distance_meters:  tracking.distance_meters,
        duration_seconds: tracking.duration_seconds,
        pickup_lat:       tracking.pickup_lat,
        pickup_lng:       tracking.pickup_lng,
        delivery_lat:     tracking.delivery_lat,
        delivery_lng:     tracking.delivery_lng,
      });
    }

    return res.status(201).json({ message: "Tracking initiated", tracking });
  } catch (err) {
    console.error("handleInitiateTracking:", err.message);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
}

export async function handleUpdateLocation(req, res) {
  try {
    const { booking_id, lat, lng, speed, heading } = req.body;
    if (!booking_id || lat === undefined || lng === undefined)
      return res.status(400).json({ message: "booking_id, lat, lng are required" });

    await verifyTravellerOwnsBooking(booking_id, req.user.id);

    const tracking = await updateTravellerLocation(booking_id, { lat, lng, speed, heading });
    const eta = calculateETA(tracking);

    const io = req.app.get("io");
    if (io) {
      io.to(`booking_${booking_id}`).emit("location-update", {
        booking_id,
        lat:     tracking.traveller_lat,
        lng:     tracking.traveller_lng,
        speed:   tracking.speed,
        heading: tracking.heading,
        status:  tracking.status,
        eta,
      });
    }

    return res.status(200).json({ message: "Location updated", tracking, eta });
  } catch (err) {
    console.error("handleUpdateLocation:", err.message);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
}

export async function handleGetTracking(req, res) {
  try {
    const { booking_id } = req.params;
    const tracking = await getTrackingByBookingId(booking_id);
    const eta = calculateETA(tracking);
    return res.status(200).json({ tracking, eta });
  } catch (err) {
    console.error("handleGetTracking:", err.message);
    return res.status(404).json({ message: err.message });
  }
}

export async function handleCompleteDelivery(req, res) {
  try {
    const { booking_id } = req.body;
    if (!booking_id)
      return res.status(400).json({ message: "booking_id is required" });

    await verifyTravellerOwnsBooking(booking_id, req.user.id);

    const tracking = await completeDelivery(booking_id);

    const io = req.app.get("io");
    if (io) {
      io.to(`booking_${booking_id}`).emit("delivery_completed", {
        booking_id,
        status: tracking.status,
      });
    }

    return res.status(200).json({ message: "Delivery completed", tracking });
  } catch (err) {
    console.error("handleCompleteDelivery:", err.message);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
}

// ── POST /api/tracking/proof ──────────────────────────────────────────────────
// Traveller uploads a photo as proof of pickup or delivery
export async function handleUploadProof(req, res) {
  try {
    const { booking_id, type } = req.body;

    if (!booking_id || !type) {
      return res.status(400).json({ message: "booking_id and type (PICKUP|DELIVERY) are required" });
    }

    if (!["PICKUP", "DELIVERY"].includes(type.toUpperCase())) {
      return res.status(400).json({ message: "type must be PICKUP or DELIVERY" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "proof_photo file is required" });
    }

    await verifyTravellerOwnsBooking(booking_id, req.user.id);

    // Build relative path — frontend prepends BASE_URL when displaying.
    // The "/proof" route's multer instance (fileUpload.util.js's `upload`)
    // physically writes to uploads/parcels/, not uploads/proofs/ — this URL
    // must match that actual write location or the image 404s when fetched.
    const imageUrl = `/uploads/parcels/${req.file.filename}`;

    const proof = await saveProofPhoto(booking_id, type.toUpperCase(), imageUrl);

    // Emit to booking room so sender sees proof in real-time
    const io = req.app.get("io");
    if (io) {
      io.to(`booking_${booking_id}`).emit("proof_uploaded", {
        booking_id,
        type: type.toUpperCase(),
        image_url: imageUrl,
        uploaded_at: proof.createdAt,
      });
    }

    return res.status(201).json({
      message: "Proof uploaded successfully",
      proof: {
        id: proof.id,
        booking_id: proof.booking_id,
        type: proof.type,
        image_url: proof.image_url,
      },
    });
  } catch (err) {
    console.error("handleUploadProof:", err.message);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
}
