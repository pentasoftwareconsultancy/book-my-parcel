import express from "express";
import authRoutes         from "./modules/auth/auth.routes.js";
import feedbackRoutes     from "./modules/feedback/feedback.routes.js";
import disputeRoutes      from "./modules/dispute/disputes.routes.js";
import adminRoutes        from "./modules/admin/admin.routes.js";
import parcelRoutes       from "./modules/parcel/parcel.routes.js";
import userRoutes         from "./modules/user/user.routes.js";
import travellerRoutes    from "./modules/traveller/traveller.routes.js";
import travellerRouteRoutes from "./modules/traveller/travellerRoute.routes.js";
import placesRoutes       from "./modules/places/places.routes.js";
import matchingRoutes     from "./modules/matching/matching.routes.js";
import ParcelTracking     from "./modules/tracking/parcelTracking.routes.js";
import bookingRoutes      from "./modules/booking/booking.routes.js";
import paymentRoutes      from "./modules/payment/payment.routes.js";
import withdrawalRoutes   from "./modules/payment/withdrawal.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import kycRoutes          from "./modules/kyc/kyc.routes.js";
import queueMonitorRoutes from "./routes/queue-monitor.routes.js";
import contactRoutes      from "./modules/contact/contact.routes.js";

const router = express.Router();

// ── Version info ──────────────────────────────────────────────────────────────
router.get("/version", (req, res) => {
  res.json({
    success: true,
    data: {
      api_version: "v1",
      app_version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
  });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
router.use("/auth", authRoutes);

// ── User ──────────────────────────────────────────────────────────────────────
router.use("/user", userRoutes);

// ── Feedback & Disputes ───────────────────────────────────────────────────────
router.use("/feedback", feedbackRoutes);
router.use("/dispute",  disputeRoutes);

// ── Places / Maps ─────────────────────────────────────────────────────────────
router.use("/places", placesRoutes);

// ── Tracking ──────────────────────────────────────────────────────────────────
router.use("/tracking", ParcelTracking);

// ── Payment (Razorpay orders + wallet + withdrawals) ──────────────────────────
router.use("/payment", paymentRoutes);
router.use("/payment", withdrawalRoutes);

// ── Booking (OTP pickup/delivery flow) ───────────────────────────────────────
router.use("/booking", bookingRoutes);

// ── Parcel ────────────────────────────────────────────────────────────────────
// FIX: matchingRoutes was previously mounted at THREE paths (/parcel, /traveller,
// /matching) using the same router instance. Express shares router state across
// mounts which causes unpredictable behaviour. Each path now gets its own mount.
//
// Parcel-scoped matching endpoints:
//   POST /api/parcel/:id/find-travellers
//   GET  /api/parcel/:id/acceptances
//   GET  /api/parcel/:id/route-geometry
//   POST /api/parcel/:id/select-traveller
router.use("/parcel", parcelRoutes);
router.use("/parcel", matchingRoutes);

// ── Traveller ─────────────────────────────────────────────────────────────────
// Traveller-scoped matching endpoints:
//   GET  /api/traveller/requests
//   POST /api/traveller/requests/:id/accept
//   POST /api/traveller/requests/:id/express-interest
//   POST /api/traveller/requests/:id/reject
router.use("/traveller",        travellerRoutes);
router.use("/traveller/routes", travellerRouteRoutes);
router.use("/traveller",        matchingRoutes);

// ── Matching admin/test endpoints ─────────────────────────────────────────────
//   POST /api/matching/run-periodic          (admin only)
//   POST /api/matching/test-parcel/:id       (admin only)
//   GET  /api/matching/test-traveller-requests/:id (admin only)
router.use("/matching", matchingRoutes);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.use("/admin", adminRoutes);

// ── Notifications ─────────────────────────────────────────────────────────────
router.use("/notifications", notificationRoutes);

// ── KYC ───────────────────────────────────────────────────────────────────────
router.use("/kyc", kycRoutes);

// ── Queue monitor (BullMQ observability — auth-protected) ─────────────────────
router.use("/queues", queueMonitorRoutes);

// ── Contact form ──────────────────────────────────────────────────────────────
router.use("/contact", contactRoutes);

// ── Development-only routes — NEVER exposed in production ─────────────────────
if (process.env.NODE_ENV !== "production") {
  const { default: testRedisRoutes }         = await import("./routes/test-redis.js");
  const { default: testRedisFeaturesRoutes } = await import("./routes/test-redis-features.js");
  router.use("/test-redis",          testRedisRoutes);
  router.use("/test-redis-features", testRedisFeaturesRoutes);
}

export default router;
