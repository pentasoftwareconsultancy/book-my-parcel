
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/role.middleware.js";
import { generalLimiter } from "../../middlewares/rateLimit.middleware.js";
import * as ctrl from "./traveller.controller.js";
import { validateKYC, validateStatus, validateRoute } from "../../utils/validation.util.js";

const router = express.Router();

router.use(generalLimiter);

const uploadDir = "uploads/kyc";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      return cb(null, true);
    }
    cb(new Error("Only image or PDF files are allowed for KYC."));
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

const kycUpload = upload.fields([
  { name: "aadharFront",  maxCount: 1 },
  { name: "aadharBack",   maxCount: 1 },
  { name: "panFront",     maxCount: 1 },
  { name: "panBack",      maxCount: 1 },
  { name: "drivingPhoto", maxCount: 1 },
  { name: "selfie",       maxCount: 1 },
]);

/**
 * @swagger
 * /api/traveller/kyc:
 *   post:
 *     summary: Submit KYC documents
 *     description: Submit KYC verification documents
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - dob
 *               - gender
 *               - aadhar_number
 *               - pan_number
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               aadhar_number:
 *                 type: string
 *               pan_number:
 *                 type: string
 *               aadharFront:
 *                 type: string
 *                 format: binary
 *               aadharBack:
 *                 type: string
 *                 format: binary
 *               panFront:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: KYC submitted
 *   get:
 *     summary: Get my KYC details
 *     description: Retrieve KYC status
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC details
 */
router.post("/kyc", authMiddleware, kycUpload, validateKYC, ctrl.submitKYC);
router.get("/kyc", authMiddleware, ctrl.getMyKYC);
router.get("/kyc/all", authMiddleware, requireAdmin, ctrl.getAllKYCs);
router.patch("/kyc/status/:id", authMiddleware, requireAdmin, validateStatus, ctrl.updateKYCStatus);

/**
 * @swagger
 * /api/traveller/dashboard/stats:
 *   get:
 *     summary: Get traveller stats
 *     description: Retrieve dashboard statistics
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 */
router.get("/dashboard/stats", authMiddleware, ctrl.getTravelerStats);

/**
 * @swagger
 * /api/traveller/dashboard/deliveries:
 *   get:
 *     summary: Get traveller deliveries
 *     description: Retrieve all assigned deliveries
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
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
 *         description: Deliveries retrieved
 */
router.get("/dashboard/deliveries", authMiddleware, ctrl.getTravelerDeliveries);

/**
 * @swagger
 * /api/traveller/dashboard/requests:
 *   get:
 *     summary: Get available requests
 *     description: Get parcel requests matching routes
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests retrieved
 */
router.get("/dashboard/requests", authMiddleware, ctrl.getTravelerParcelRequests);
router.get("/dashboard/pending-payments", authMiddleware, ctrl.getPendingPayments);
router.get("/dashboard/bookings/:bookingId", authMiddleware, ctrl.getTravelerBookingDetails);

router.patch("/booking/:bookingId/status", authMiddleware, ctrl.updateBookingStatus);
router.post("/booking/:bookingId/otp/generate", authMiddleware, ctrl.generateOTP);
router.post("/booking/:bookingId/otp/verify", authMiddleware, ctrl.verifyOTP);

export default router;
