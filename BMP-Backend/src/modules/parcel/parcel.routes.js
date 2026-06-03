import express from "express";
import { createParcel, getParcelById, getUserRequests, updateParcelStep, cancelParcel } from "./parcel.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generalLimiter, parcelCreationLimiter } from "../../middlewares/rateLimit.middleware.js";
import { upload } from "../../utils/fileUpload.util.js";
import {
  validateRequest,
  parseJsonFields,
  parcelRequestSchema,
} from "../../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/parcel/request:
 *   post:
 *     summary: Create parcel request
 *     description: Create a new parcel delivery request with pickup and delivery details
 *     tags: [Parcel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - pickup_address
 *               - delivery_address
 *               - weight_kg
 *             properties:
 *               pickup_address:
 *                 type: string
 *                 description: JSON string of pickup address
 *                 example: '{"street":"123 Main","city":"Mumbai","state":"Maharashtra","pincode":"400001","phone":"9876543210","latitude":19.0760,"longitude":72.8777}'
 *               delivery_address:
 *                 type: string
 *                 description: JSON string of delivery address
 *                 example: '{"street":"456 Park","city":"Delhi","state":"Delhi","pincode":"110001","phone":"9876543211","latitude":28.7041,"longitude":77.1025}'
 *               weight_kg:
 *                 type: number
 *                 example: 5
 *               length_in:
 *                 type: number
 *                 example: 12
 *               width_in:
 *                 type: number
 *                 example: 10
 *               height_in:
 *                 type: number
 *                 example: 8
 *               parcel_type:
 *                 type: string
 *                 enum: [DOCUMENTS, ELECTRONICS, CLOTHING, FOOD, FRAGILE, OTHER]
 *               vehicle_type:
 *                 type: string
 *                 enum: [CAR, BIKE, SCOOTER, PUBLIC_TRANSPORT]
 *               pickup_date:
 *                 type: string
 *                 format: date
 *               pickup_time:
 *                 type: string
 *                 format: time
 *               notes:
 *                 type: string
 *               estimated_price:
 *                 type: number
 *               parcel_photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 3
 *     responses:
 *       201:
 *         description: Parcel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Parcel'
 *       400:
 *         description: Validation error
 */
router.post(
  "/request",
  authMiddleware,
  parcelCreationLimiter,
  upload.array("parcel_photos", 3),
  parseJsonFields("pickup_address", "delivery_address"),
  validateRequest(parcelRequestSchema),
  createParcel
);

router.use(generalLimiter);

/**
 * @swagger
 * /api/parcel/{id}/step:
 *   patch:
 *     summary: Update parcel form step
 *     description: Update the current step of parcel creation form
 *     tags: [Parcel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - form_step
 *             properties:
 *               form_step:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 3
 *     responses:
 *       200:
 *         description: Step updated successfully
 */
router.patch("/:id/step", authMiddleware, updateParcelStep);

/**
 * @swagger
 * /api/parcel/{id}:
 *   get:
 *     summary: Get parcel by ID
 *     description: Retrieve detailed information about a specific parcel
 *     tags: [Parcel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Parcel ID
 *     responses:
 *       200:
 *         description: Parcel details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Parcel'
 *       404:
 *         description: Parcel not found
 */
router.get("/:id", authMiddleware, getParcelById);

/**
 * @swagger
 * /api/parcel/{id}/cancel:
 *   post:
 *     summary: Cancel parcel
 *     description: Cancel a parcel request (user initiated)
 *     tags: [Parcel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Changed my mind
 *               cancel_reason:
 *                 type: string
 *                 enum: [SENDER_CANCELLED, FOUND_ALTERNATIVE, OTHER]
 *     responses:
 *       200:
 *         description: Parcel cancelled successfully
 *       400:
 *         description: Cannot cancel parcel in current status
 */
router.post("/:id/cancel", authMiddleware, generalLimiter, cancelParcel);

export default router;
