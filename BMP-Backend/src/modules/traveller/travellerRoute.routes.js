import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generalLimiter } from "../../middlewares/rateLimit.middleware.js";
import { validateRequest } from "../../middlewares/validation.middleware.js";
import { createRouteSchema } from "./travellerRoute.validation.js";
import {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
  searchRoutes,
  previewRouteAlternatives,
} from "./travellerRoute.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/traveller/routes:
 *   post:
 *     summary: Create new route
 *     tags: [Traveller Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TravellerRoute'
 *     responses:
 *       201:
 *         description: Route created
 *   get:
 *     summary: Get my routes
 *     tags: [Traveller Routes]
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
 *         description: Routes retrieved
 */

/**
 * @swagger
 * /api/traveller/routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     tags: [Traveller Routes]
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
 *         description: Route details
 *   put:
 *     summary: Update route
 *     tags: [Traveller Routes]
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
 *             $ref: '#/components/schemas/TravellerRoute'
 *     responses:
 *       200:
 *         description: Route updated
 *   delete:
 *     summary: Delete route
 *     tags: [Traveller Routes]
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
 *         description: Route deleted
 */



// Apply rate limiting and authentication to all routes
router.use(generalLimiter);
router.use(authMiddleware);

router.get("/search", searchRoutes);

// POST /api/traveller/routes/preview-alternatives - Get alternative route options
// (called from Step 1 of the route-creation wizard before the route is saved)
router.post("/preview-alternatives", authMiddleware, previewRouteAlternatives);

// POST /api/traveller/routes - Create a new route
router.post("/", validateRequest(createRouteSchema), createRoute);

// GET /api/traveller/routes - Get all routes for authenticated traveller
router.get("/", getRoutes);

// GET /api/traveller/routes/:id - Get specific route by ID
router.get("/:id", getRoute);

// PUT /api/traveller/routes/:id - Update a route
router.put("/:id", updateRoute);

// DELETE /api/traveller/routes/:id - Delete a route
router.delete("/:id", deleteRoute);


export default router;
