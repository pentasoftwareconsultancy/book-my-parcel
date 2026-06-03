import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generalLimiter, sensitiveLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  submitFeedbackController,
  getBookingFeedbackController,
  getTravellerFeedbackController,
  updateFeedbackController,
} from "./feedback.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/feedback/submit:
 *   post:
 *     summary: Submit feedback
 *     description: Submit rating and review for a booking
 *     tags: [Feedback]
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
 *               - to_user_id
 *               - rating
 *             properties:
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               to_user_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Feedback submitted
 */

/**
 * @swagger
 * /api/feedback/booking/{bookingId}:
 *   get:
 *     summary: Get booking feedback
 *     description: Check if feedback exists for a booking
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback retrieved
 *   put:
 *     summary: Update feedback
 *     description: Update existing feedback for a booking
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated
 */

/**
 * @swagger
 * /api/feedback/traveller/{travellerId}:
 *   get:
 *     summary: Get traveller reviews
 *     description: Get all reviews for a specific traveller (public)
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: travellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews retrieved
 */

router.use(generalLimiter);

// Submit feedback — strict limit (once per booking, but prevent spam)
router.post("/submit", authMiddleware, sensitiveLimiter, submitFeedbackController);

// Check if feedback exists for a booking
router.get("/booking/:bookingId", authMiddleware, getBookingFeedbackController);

// Update existing feedback
router.put("/booking/:bookingId", authMiddleware, sensitiveLimiter, updateFeedbackController);

// Public — anyone can view a traveller's reviews
router.get("/traveller/:travellerId", getTravellerFeedbackController);

export default router;
