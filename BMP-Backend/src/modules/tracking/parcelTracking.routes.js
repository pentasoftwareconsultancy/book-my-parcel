// modules/tracking/parcelTracking.routes.js
import express from "express";
import {
  handleInitiateTracking,
  handleUpdateLocation,
  handleGetTracking,
  handleCompleteDelivery,
  handleUploadProof,
} from "./parcelTracking.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/tracking.middleware.js";
import { upload } from "../../utils/fileUpload.util.js";
import { generalLimiter, sensitiveLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/tracking/{bookingId}:
 *   get:
 *     summary: Get real-time tracking info
 *     description: Get current location and tracking status of a parcel
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID to track
 *     responses:
 *       200:
 *         description: Tracking information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: ['CONFIRMED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED']
 *                     current_location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                     traveller_info:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         vehicle_type:
 *                           type: string
 *       404:
 *         description: Booking not found or not accessible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tracking/public/{booking_id}:
 *   get:
 *     summary: Public tracking (no auth required)
 *     description: Get tracking info via public shareable link
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Public tracking info (limited data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     estimated_delivery:
 *                       type: string
 *                       format: date-time
 *                     current_city:
 *                       type: string
 */

/**
 * @swagger
 * /api/tracking/initiate:
 *   post:
 *     summary: Initiate tracking (Traveller)
 *     description: Start tracking for a booking (traveller only)
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *             properties:
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               initial_location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Tracking initiated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * /api/tracking/location:
 *   patch:
 *     summary: Update current location (Traveller)
 *     description: Update traveller's current location during delivery
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *               - latitude
 *               - longitude
 *             properties:
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 19.0760
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 72.8777
 *               accuracy:
 *                 type: number
 *                 description: GPS accuracy in meters
 *               speed:
 *                 type: number
 *                 description: Current speed in km/h
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * /api/tracking/complete:
 *   patch:
 *     summary: Complete delivery tracking
 *     description: Mark tracking as complete when delivery is finished
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *             properties:
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               final_location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Tracking completed
 */

/**
 * @swagger
 * /api/tracking/proof:
 *   post:
 *     summary: Upload delivery proof
 *     description: Upload photo proof of pickup or delivery
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *               - proof_type
 *               - proof_photo
 *             properties:
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               proof_type:
 *                 type: string
 *                 enum: ['pickup', 'delivery']
 *               proof_photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo evidence (max 5MB)
 *               notes:
 *                 type: string
 *                 description: Additional notes about the proof
 *     responses:
 *       200:
 *         description: Proof uploaded successfully
 */



// ── Public route — no auth needed (shareable tracking link) ──────────────────
// Anyone with the booking_id can view live location (no sensitive data exposed)
router.get("/public/:booking_id", generalLimiter, handleGetTracking);

// ── Authenticated routes ──────────────────────────────────────────────────────
router.use(authMiddleware, generalLimiter);

router.post  ("/initiate",    sensitiveLimiter, authorizeRoles("TRAVELLER"),           handleInitiateTracking);
router.patch ("/location",    sensitiveLimiter, authorizeRoles("TRAVELLER"),           handleUpdateLocation);
router.get   ("/:booking_id", authorizeRoles("INDIVIDUAL", "ADMIN"), handleGetTracking);
router.patch ("/complete",    sensitiveLimiter, authorizeRoles("TRAVELLER"),           handleCompleteDelivery);

// ── Proof of delivery / pickup photo upload ───────────────────────────────────
router.post(
  "/proof",
  sensitiveLimiter,
  authorizeRoles("TRAVELLER"),
  upload.single("proof_photo"),
  handleUploadProof
);

export default router;
