import express from "express";
import {
  startPickup,
  verifyPickup,
  startDelivery,
  verifyDelivery,
  cancelBooking,
  receivePayment,
} from "./booking.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateRequest, otpSchema, bookingIdSchema } from "./booking.validation.js";
import { otpGenerationLimiter, otpVerificationLimiter, generalLimiter } from "../../middlewares/rateLimit.middleware.js";
import ChatMessage from "./chatMessage.model.js";
import DeliveryAttempt from "./deliveryAttempt.model.js";
import { upload } from "../../utils/fileUpload.util.js";
import twilioService from "../../services/twilio.service.js";
import { sendToUser } from "../../services/notification.service.js";
import User from "../user/user.model.js";
import Parcel from "../parcel/parcel.model.js";
import Booking from "./booking.model.js";
import Address from "../parcel/address.model.js";
import {
  BOOKING_TRANSITIONS,
  PARCEL_TRANSITIONS,
  assertValidTransition,
} from "../../utils/constants.js";

const router = express.Router();

/**
 * @swagger
 * /api/booking/{bookingId}/start-pickup:
 *   post:
 *     summary: Start pickup process
 *     description: Initiate the pickup process by generating and sending OTP to sender
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Pickup OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         otp_sent:
 *                           type: boolean
 *                         phone_number:
 *                           type: string
 *       400:
 *         description: Invalid booking status or booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/booking/{bookingId}/verify-pickup:
 *   post:
 *     summary: Verify pickup OTP
 *     description: Verify pickup OTP provided by sender to confirm parcel pickup
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{4}$'
 *                 example: '1234'
 *                 description: 4-digit OTP received by sender
 *     responses:
 *       200:
 *         description: Pickup verified successfully, parcel is now in transit
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: 'IN_TRANSIT'
 *                         pickup_verified_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid OTP or booking not in correct state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/booking/{bookingId}/start-delivery:
 *   post:
 *     summary: Start delivery process
 *     description: Initiate the delivery process by generating and sending OTP to recipient
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Delivery OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         otp_sent:
 *                           type: boolean
 *                         phone_number:
 *                           type: string
 *       400:
 *         description: Booking not in transit or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/booking/{bookingId}/verify-delivery:
 *   post:
 *     summary: Verify delivery OTP
 *     description: Verify delivery OTP provided by recipient to complete parcel delivery
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{4}$'
 *                 example: '5678'
 *                 description: 4-digit OTP received by recipient
 *     responses:
 *       200:
 *         description: Delivery verified successfully, parcel delivered
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: 'DELIVERED'
 *                         delivered_at:
 *                           type: string
 *                           format: date-time
 *                         payment_released:
 *                           type: boolean
 *       400:
 *         description: Invalid OTP or delivery cannot be completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/booking/{bookingId}/cancel:
 *   post:
 *     summary: Cancel booking
 *     description: Cancel a booking (traveller initiated cancellation)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: 'Unable to complete delivery due to vehicle breakdown'
 *                 description: Reason for cancellation
 *               cancel_reason:
 *                 type: string
 *                 enum: ['TRAVELLER_CANCELLED', 'VEHICLE_ISSUE', 'EMERGENCY', 'OTHER']
 *                 description: Category of cancellation reason
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: 'CANCELLED'
 *                         refund_initiated:
 *                           type: boolean
 *       400:
 *         description: Booking cannot be cancelled in current status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/booking/{bookingId}/receive-payment:
 *   post:
 *     summary: Receive payment (Pay After Delivery)
 *     description: Mark that payment has been received from recipient for PAD orders
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount_received:
 *                 type: number
 *                 description: Amount received from recipient
 *               notes:
 *                 type: string
 *                 description: Additional notes about payment reception
 *     responses:
 *       200:
 *         description: Payment reception confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * /api/booking/{bookingId}/chat:
 *   get:
 *     summary: Get chat history
 *     description: Retrieve chat messages for a booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 200
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Chat messages retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       booking_id:
 *                         type: string
 *                       sender_id:
 *                         type: string
 *                       sender_role:
 *                         type: string
 *                       message:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */

/**
 * @swagger
 * /api/booking/{bookingId}/delivery-attempt:
 *   post:
 *     summary: Log delivery attempt
 *     description: Log a failed delivery attempt when recipient is unavailable
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: ['recipient_unavailable', 'address_incorrect', 'recipient_refused']
 *                 default: 'recipient_unavailable'
 *               notes:
 *                 type: string
 *                 description: Additional details about the failed attempt
 *               rescheduled_at:
 *                 type: string
 *                 format: date-time
 *                 description: When the next delivery attempt is scheduled
 *               attempt_photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo evidence of delivery attempt
 *     responses:
 *       201:
 *         description: Delivery attempt logged
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 attempt:
 *                   type: object
 *                 attempts_remaining:
 *                   type: integer
 *                 auto_cancelled:
 *                   type: boolean
 */

/**
 * @swagger
 * /api/booking/{bookingId}/delivery-attempts:
 *   get:
 *     summary: Get delivery attempts
 *     description: Get all delivery attempts for a booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Delivery attempts retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       attempt_number:
 *                         type: integer
 *                       reason:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       photo_url:
 *                         type: string
 *                       attempted_at:
 *                         type: string
 *                         format: date-time
 *                       rescheduled_at:
 *                         type: string
 *                         format: date-time
 */



// All routes require authentication
router.use(authMiddleware);

// Pickup flow
router.post(
  "/:bookingId/start-pickup",
  otpGenerationLimiter,
  validateRequest(bookingIdSchema, "params"),
  startPickup
);

router.post(
  "/:bookingId/verify-pickup",
  otpVerificationLimiter,
  validateRequest(bookingIdSchema, "params"),
  validateRequest(otpSchema, "body"),
  verifyPickup
);

// Delivery flow
router.post(
  "/:bookingId/start-delivery",
  otpGenerationLimiter,
  validateRequest(bookingIdSchema, "params"),
  startDelivery
);

router.post(
  "/:bookingId/verify-delivery",
  otpVerificationLimiter,
  validateRequest(bookingIdSchema, "params"),
  validateRequest(otpSchema, "body"),
  verifyDelivery
);

// Cancellation - Traveller cancels booking
router.post(
  "/:bookingId/cancel",
  generalLimiter,
  validateRequest(bookingIdSchema, "params"),
  cancelBooking
);

// Payment reception - Pay After Delivery payment reception
router.post(
  "/:bookingId/receive-payment",
  generalLimiter,
  validateRequest(bookingIdSchema, "params"),
  receivePayment
);

// ── Chat history ──────────────────────────────────────────────────────────────
// GET /api/booking/:bookingId/chat — load last 100 messages for a booking
// Ownership check: only the sender (user) or the assigned traveller may read chat
router.get("/:bookingId/chat", generalLimiter, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Verify the booking exists and the caller is a participant
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Parcel, as: "parcel", attributes: ["user_id"] }],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const callerId = req.user.id;
    const isSender    = booking.parcel?.user_id === callerId;
    const isTraveller = booking.traveller_id    === callerId;

    if (!isSender && !isTraveller) {
      return res.status(403).json({ success: false, message: "Forbidden: you are not a participant in this booking" });
    }

    const limit  = Math.min(parseInt(req.query.limit)  || 100, 200);
    const offset = parseInt(req.query.offset) || 0;

    const messages = await ChatMessage.findAll({
      where: { booking_id: bookingId },
      order: [["createdAt", "ASC"]],
      limit,
      offset,
      attributes: ["id", "booking_id", "sender_id", "sender_role", "message", "is_read", "createdAt"],
    });

    return res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error("GET chat history:", err.message);
    return res.status(500).json({ success: false, message: "Failed to load chat history" });
  }
});

// ── Delivery attempt (recipient unavailable) ──────────────────────────────────
// POST /api/booking/:bookingId/delivery-attempt
// Traveller logs a failed delivery attempt and optionally reschedules
router.post(
  "/:bookingId/delivery-attempt",
  authMiddleware,
  generalLimiter,
  upload.single("attempt_photo"),
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const travellerId = req.user.id;
      const { reason = "recipient_unavailable", notes, rescheduled_at } = req.body;
      const MAX_ATTEMPTS = 3;

      // Verify booking belongs to this traveller and is IN_TRANSIT
      const booking = await Booking.findOne({
        where: { id: bookingId, traveller_id: travellerId },
        include: [
          {
            model: Parcel,
            as: "parcel",
            include: [{ model: Address, as: "deliveryAddress", attributes: ["city", "phone"] }],
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      if (booking.status !== "IN_TRANSIT") {
        return res.status(400).json({ success: false, message: `Cannot log attempt for booking in status: ${booking.status}` });
      }

      // Count existing attempts
      const existingAttempts = await DeliveryAttempt.count({ where: { booking_id: bookingId } });
      const attemptNumber = existingAttempts + 1;

      // Build photo URL if uploaded — store relative path only
      const photoUrl = req.file ? `/uploads/parcels/${req.file.filename}` : null;

      // Create attempt record
      const attempt = await DeliveryAttempt.create({
        booking_id:     bookingId,
        traveller_id:   travellerId,
        attempt_number: attemptNumber,
        reason,
        notes:          notes || null,
        photo_url:      photoUrl,
        rescheduled_at: rescheduled_at ? new Date(rescheduled_at) : null,
      });

      // Notify sender
      const senderUser = await User.findByPk(booking.parcel.user_id);
      const city = booking.parcel.deliveryAddress?.city || "delivery location";

      await sendToUser(
        booking.parcel.user_id,
        `Delivery Attempt ${attemptNumber} Failed`,
        `Your traveller attempted delivery at ${city} but the recipient was unavailable. ${rescheduled_at ? `Rescheduled for ${new Date(rescheduled_at).toLocaleString("en-IN")}` : "Please ensure someone is available."}`,
        { type: "delivery_attempt_failed", booking_id: bookingId, attempt_number: attemptNumber }
      );

      if (senderUser?.phone_number) {
        await twilioService.sendSMS(
          senderUser.phone_number,
          `Book My Parcel: Delivery attempt ${attemptNumber} failed at ${city}. Reason: ${reason.replace(/_/g, " ")}. ${rescheduled_at ? `Next attempt: ${new Date(rescheduled_at).toLocaleString("en-IN")}` : "Please contact your traveller."}`
        );
      }

      // Auto-cancel after MAX_ATTEMPTS
      if (attemptNumber >= MAX_ATTEMPTS) {
        assertValidTransition(booking.status, "CANCELLED", BOOKING_TRANSITIONS, "Booking");
        assertValidTransition(booking.parcel.status, "CANCELLED", PARCEL_TRANSITIONS, "Parcel");
        await booking.update({ status: "CANCELLED" });
        await booking.parcel.update({ status: "CANCELLED" });

        await sendToUser(
          booking.parcel.user_id,
          "Booking Auto-Cancelled",
          `After ${MAX_ATTEMPTS} failed delivery attempts, your booking has been cancelled. A refund will be processed.`,
          { type: "booking_auto_cancelled", booking_id: bookingId }
        );

        // Trigger refund
        const { refundPaymentForParcel } = await import("../payment/payment.service.js");
        setImmediate(() => refundPaymentForParcel(booking.parcel_id, `Auto-cancelled after ${MAX_ATTEMPTS} failed delivery attempts`));

        return res.status(200).json({
          success: true,
          message: `Attempt ${attemptNumber} logged. Booking auto-cancelled after ${MAX_ATTEMPTS} failed attempts.`,
          attempt,
          auto_cancelled: true,
        });
      }

      return res.status(201).json({
        success: true,
        message: `Delivery attempt ${attemptNumber} logged. Sender has been notified.`,
        attempt,
        attempts_remaining: MAX_ATTEMPTS - attemptNumber,
      });
    } catch (err) {
      console.error("POST delivery-attempt:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/booking/:bookingId/delivery-attempts — view all attempts for a booking
router.get("/:bookingId/delivery-attempts", authMiddleware, generalLimiter, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const attempts = await DeliveryAttempt.findAll({
      where: { booking_id: bookingId },
      order: [["attempted_at", "ASC"]],
    });
    return res.status(200).json({ success: true, data: attempts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
