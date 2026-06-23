import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { sensitiveLimiter, paymentLimiter } from "../../middlewares/rateLimit.middleware.js";
import { createOrder, verifyPayment } from "./payment.controller.js";
import { cashfreeWebhook } from "./webhook.controller.js";

const router = express.Router();

// ─── Cashfree Webhook ─────────────────────────────────────────────────────────
// MUST use express.raw() here so we have the raw body for HMAC signature verification.
// This route is intentionally unauthenticated — Cashfree calls it server-to-server.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Expose rawBody as a string for the signature check, then parse JSON normally
    if (Buffer.isBuffer(req.body)) {
      req.rawBody = req.body.toString("utf8");
      try {
        req.body = JSON.parse(req.rawBody);
      } catch {
        return res.status(400).json({ message: "Invalid JSON in webhook body" });
      }
    }
    next();
  },
  cashfreeWebhook
);

/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Create payment order
 *     description: Create a Razorpay payment order for parcel booking
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parcel_id
 *               - amount
 *             properties:
 *               parcel_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parcel to be paid for
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Payment amount in INR
 *                 example: 500
 *     responses:
 *       200:
 *         description: Payment order created successfully
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
 *                     order_id:
 *                       type: string
 *                       description: Razorpay order ID
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                       example: 'INR'
 *                     key_id:
 *                       type: string
 *                       description: Razorpay key for frontend
 *       400:
 *         description: Invalid parcel or amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payment/verify-payment:
 *   post:
 *     summary: Verify payment
 *     description: Verify Razorpay payment signature and complete booking
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - parcel_id
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 description: Razorpay order ID from create-order response
 *               razorpay_payment_id:
 *                 type: string
 *                 description: Razorpay payment ID from frontend
 *               razorpay_signature:
 *                 type: string
 *                 description: Razorpay signature from frontend
 *               parcel_id:
 *                 type: string
 *                 format: uuid
 *                 description: Parcel ID being paid for
 *     responses:
 *       200:
 *         description: Payment verified successfully
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
 *                         payment_id:
 *                           type: string
 *                         booking:
 *                           $ref: '#/components/schemas/Booking'
 *                         status:
 *                           type: string
 *                           example: 'PAID'
 *       400:
 *         description: Invalid signature or payment verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payment/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved
 */

/**
 * @swagger
 * /api/payment/wallet/details:
 *   get:
 *     summary: Get wallet details
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Details retrieved
 */

/**
 * @swagger
 * /api/payment/wallet/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transactions retrieved
 */

/**
 * @swagger
 * /api/payment/withdrawal/request:
 *   post:
 *     summary: Request withdrawal
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal requested
 */

/**
 * @swagger
 * /api/payment/withdrawal/history:
 *   get:
 *     summary: Get withdrawal history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History retrieved
 */



// Both payment endpoints require authentication and strict rate limiting
router.post("/create-order",   authMiddleware, paymentLimiter, createOrder);
router.post("/verify-payment", authMiddleware, paymentLimiter, verifyPayment);

export default router;
