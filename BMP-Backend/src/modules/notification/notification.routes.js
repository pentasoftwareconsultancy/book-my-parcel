import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generalLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
} from "./notification.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, traveller, admin]
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
 *         description: Notifications retrieved
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 */

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: All marked as read
 */



router.use(generalLimiter);
router.use(authMiddleware);

// GET    /api/notifications?role=user&page=1&limit=20
router.get("/", getNotifications);

// PATCH  /api/notifications/read-all   ← must be before /:id to avoid conflict
router.patch("/read-all", markAllRead);

// PATCH  /api/notifications/:id/read
router.patch("/:id/read", markOneRead);

// DELETE /api/notifications/:id
router.delete("/:id", deleteNotification);

export default router;
