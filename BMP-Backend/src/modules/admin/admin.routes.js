import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  fetchAllUsers,
  fetchAllBookings,
  fetchTravelersForKYC,
  updateKYCStatus,
  getAdminDashboard,
  getAllDisputesController,
  getAllPaymentsAdminController,
  getUserDetailsController,
  getTravelerDetailsController,
  getTabSettings,
  saveTabSettings,
  listEmailTemplates,
  updateEmailTemplateController,
} from "./admin.controller.js";
import { resolveDispute, updateDisputeStatus } from "../dispute/disputes.controller.js";
import { requireAdmin } from "../../middlewares/role.middleware.js";
import { sensitiveLimiter, generalLimiter } from "../../middlewares/rateLimit.middleware.js";
import { validateStatus } from "../../utils/validation.util.js";
import paginationMiddleware from "../../middlewares/pagination.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Fetch all users with pagination (Admin only)
 *     tags: [Admin]
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
 *         description: Users retrieved
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     description: Get detailed information about a specific user
 *     tags: [Admin]
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
 *         description: User details retrieved
 */

/**
 * @swagger
 * /api/admin/travelers/{id}:
 *   get:
 *     summary: Get traveler details
 *     description: Get detailed information about a specific traveler
 *     tags: [Admin]
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
 *         description: Traveler details retrieved
 */

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     description: Fetch all bookings with pagination
 *     tags: [Admin]
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
 *         description: Bookings retrieved
 */

/**
 * @swagger
 * /api/admin/travellers/kyc:
 *   get:
 *     summary: Get KYC submissions
 *     description: Fetch all KYC submissions for approval
 *     tags: [Admin]
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
 *         description: KYC submissions retrieved
 */

/**
 * @swagger
 * /api/admin/travellers/kyc/{id}:
 *   patch:
 *     summary: Update KYC status
 *     description: Approve or reject KYC submission
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: KYC status updated
 */

/**
 * @swagger
 * /api/admin/dashboardoverview:
 *   get:
 *     summary: Get dashboard overview
 *     description: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 */

/**
 * @swagger
 * /api/admin/disputes:
 *   get:
 *     summary: Get all disputes
 *     description: Fetch all disputes for admin review
 *     tags: [Admin]
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
 *         description: Disputes retrieved
 */

/**
 * @swagger
 * /api/admin/disputes/{id}/resolve:
 *   patch:
 *     summary: Resolve dispute
 *     description: Resolve a dispute with resolution details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispute resolved
 */

/**
 * @swagger
 * /api/admin/disputes/{id}/status:
 *   patch:
 *     summary: Update dispute status
 *     description: Update the status of a dispute
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all payments
 *     description: Fetch all payment transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments retrieved
 */

router.use(generalLimiter);

// ── Shared middleware stack for all admin routes ──────────────────────────────
const adminAuth = [authMiddleware, requireAdmin];

// ── General admin routes ──────────────────────────────────────────────────────
router.get("/users",                ...adminAuth, sensitiveLimiter, paginationMiddleware, fetchAllUsers);
router.get("/users/:id",            ...adminAuth, getUserDetailsController);
router.get("/travelers/:id",        ...adminAuth, getTravelerDetailsController);
router.get("/bookings",             ...adminAuth, sensitiveLimiter, paginationMiddleware, fetchAllBookings);
router.get("/travellers/kyc",       ...adminAuth, sensitiveLimiter, paginationMiddleware, fetchTravelersForKYC);
router.patch("/travellers/kyc/:id", ...adminAuth, sensitiveLimiter, validateStatus, updateKYCStatus);
router.get("/dashboardoverview",    ...adminAuth, paginationMiddleware, getAdminDashboard);
router.get("/disputes",             ...adminAuth, paginationMiddleware, getAllDisputesController);
router.patch("/disputes/:id/resolve", ...adminAuth, sensitiveLimiter, resolveDispute);
router.patch("/disputes/:id/status",  ...adminAuth, sensitiveLimiter, updateDisputeStatus);
router.get("/payments",             ...adminAuth, getAllPaymentsAdminController);

// ── Settings routes — specific routes BEFORE parameterised /:category ─────────
router.get("/settings/email-templates",     ...adminAuth, listEmailTemplates);
router.put("/settings/email-templates/:id", ...adminAuth, updateEmailTemplateController);
router.post("/settings/bulk-update",        ...adminAuth, saveTabSettings);
router.get("/settings/:category",           ...adminAuth, getTabSettings);

export default router;
