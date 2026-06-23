
import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generalLimiter } from "../../middlewares/rateLimit.middleware.js";
import * as ctrl from "./user.controller.js";
import { getUserRequests } from "../parcel/parcel.controller.js";
import { storeFCMTokenEndpoint, removeFCMTokenEndpoint } from "./fcmToken.controller.js";
import paymentRoutes from "../payment/payment.routes.js";
import feedback from "../feedback/feedback.routes.js";
import { getReferralStats } from "../../services/referral.service.js";

const router = express.Router();

// Apply rate limiting to all user routes
router.use(generalLimiter);

/**
 * @swagger
 * /api/user/userprofile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve user profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get("/userprofile", authMiddleware, ctrl.getProfileController);

/**
 * @swagger
 * /api/user/userprofile/update:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put("/userprofile/update", authMiddleware, ctrl.updateUserProfileController);

/**
 * @swagger
 * /api/user/orders/{bookingId}:
 *   get:
 *     summary: Get order details
 *     description: Retrieve specific order details by booking ID
 *     tags: [User]
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
 *         description: Order details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Order not found
 */
router.get("/orders/:bookingId", authMiddleware, ctrl.getOrderDetails);

/**
 * @swagger
 * /api/user/dashboard/orders:
 *   get:
 *     summary: Get user orders
 *     description: Retrieve all orders/parcels for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
     *           enum: [CREATED, MATCHING, PARTNER_SELECTED, CONFIRMED, PICKUP, IN_TRANSIT, DELIVERED, CANCELLED, AUTO_CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Parcel'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 */
router.get("/dashboard/orders", authMiddleware, getUserRequests);

/**
 * @swagger
 * /api/user/fcm-token:
 *   post:
 *     summary: Store FCM token
 *     description: Save device FCM token for push notifications
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - device_type
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM device token
 *               device_type:
 *                 type: string
 *                 enum: [android, ios, web]
 *     responses:
 *       200:
 *         description: Token stored successfully
 *   delete:
 *     summary: Remove FCM token
 *     description: Delete device FCM token
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token removed successfully
 */
router.post("/fcm-token", authMiddleware, storeFCMTokenEndpoint);
router.delete("/fcm-token", authMiddleware, removeFCMTokenEndpoint);

router.use("/payment", authMiddleware, paymentRoutes);

/**
 * @swagger
 * /api/user/referral/stats:
 *   get:
 *     summary: Get referral statistics
 *     description: Retrieve user's referral stats and earnings
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral stats retrieved
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
 *                     referralCode:
 *                       type: string
 *                     totalReferrals:
 *                       type: integer
 *                     totalEarnings:
 *                       type: number
 */
router.get("/referral/stats", authMiddleware, async (req, res) => {
  try {
    const stats = await getReferralStats(req.user.id);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.use("/feedback", feedback);


export default router;
