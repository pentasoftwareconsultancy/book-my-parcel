import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generalLimiter, sensitiveLimiter } from "../../middlewares/rateLimit.middleware.js";
import { createDispute, getMyDisputes, getDisputesAgainstMe, getUserDisputesAgainstMe } from "./disputes.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/dispute:
 *   post:
 *     summary: Create dispute
 *     description: Raise a dispute against another user
 *     tags: [Dispute]
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
 *               - against_user
 *               - reason
 *               - description
 *             properties:
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *               against_user:
 *                 type: string
 *                 format: uuid
 *               reason:
 *                 $ref: '#/components/schemas/DisputeReason'
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispute created
 */

/**
 * @swagger
 * /api/dispute/my:
 *   get:
 *     summary: Get my disputes
 *     description: Get all disputes raised by me
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputes retrieved
 */

/**
 * @swagger
 * /api/dispute/against-me:
 *   get:
 *     summary: Get disputes against me
 *     description: Get all disputes raised against me
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputes retrieved
 */

/**
 * @swagger
 * /api/dispute/user-against-me:
 *   get:
 *     summary: Get user disputes against me
 *     description: Get disputes raised by users against me
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputes retrieved
 */

router.use(generalLimiter);

// POST /api/dispute — raise a dispute (strict limit — prevent spam)
router.post("/", authMiddleware, sensitiveLimiter, createDispute);

// GET  /api/dispute/my
router.get("/my", authMiddleware, getMyDisputes);

// GET  /api/dispute/against-me
router.get("/against-me", authMiddleware, getDisputesAgainstMe);

// GET  /api/dispute/user-against-me
router.get("/user-against-me", authMiddleware, getUserDisputesAgainstMe);

export default router;