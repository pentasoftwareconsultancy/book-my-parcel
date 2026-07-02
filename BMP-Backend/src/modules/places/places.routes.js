import express from "express";
import { geocodeAddress } from "../../services/googleMaps.service.js";
import { generalLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/places/autocomplete:
 *   get:
 *     summary: Place autocomplete suggestions
 *     description: Get autocomplete suggestions for addresses using Google Places API
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: input
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search text for place suggestions
 *         example: 'mumbai central'
 *     responses:
 *       200:
 *         description: Place suggestions returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 predictions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       place_id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       structured_formatting:
 *                         type: object
 *                         properties:
 *                           main_text:
 *                             type: string
 *                           secondary_text:
 *                             type: string
 *                 status:
 *                   type: string
 *                   example: 'OK'
 *       400:
 *         description: Invalid input (too short)
 */

/**
 * @swagger
 * /api/places/geocode:
 *   get:
 *     summary: Geocode address to coordinates
 *     description: Convert address string or place ID to latitude/longitude coordinates
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Address to geocode
 *         example: 'Gateway of India, Mumbai'
 *       - in: query
 *         name: placeId
 *         schema:
 *           type: string
 *         description: Google Place ID (alternative to address)
 *     responses:
 *       200:
 *         description: Coordinates and address details returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'OK'
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       formatted_address:
 *                         type: string
 *                       geometry:
 *                         type: object
 *                         properties:
 *                           location:
 *                             type: object
 *                             properties:
 *                               lat:
 *                                 type: number
 *                               lng:
 *                                 type: number
 *                       address_components:
 *                         type: array
 *                         items:
 *                           type: object
 *       400:
 *         description: Address or placeId required
 */

/**
 * @swagger
 * /api/places/maps-key:
 *   get:
 *     summary: Get Google Maps API key
 *     description: Get the Google Maps JavaScript API key for frontend map rendering
 *     tags: [Places]
 *     responses:
 *       200:
 *         description: API key returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 key:
 *                   type: string
 *                   description: Google Maps JavaScript API key
 *       503:
 *         description: Maps API key not configured
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/places/directions:
 *   post:
 *     summary: Get route directions
 *     description: Calculate route between two points using Google Routes API
 *     tags: [Places]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *             properties:
 *               origin:
 *                 type: object
 *                 required:
 *                   - lat
 *                   - lng
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 19.0760
 *                   lng:
 *                     type: number
 *                     example: 72.8777
 *               destination:
 *                 type: object
 *                 required:
 *                   - lat
 *                   - lng
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 18.5204
 *                   lng:
 *                     type: number
 *                     example: 73.8567
 *               travelMode:
 *                 type: string
 *                 enum: ['DRIVE', 'TWO_WHEELER', 'WALK']
 *                 default: 'DRIVE'
 *                 description: Mode of transportation
 *     responses:
 *       200:
 *         description: Route calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 encodedPolyline:
 *                   type: string
 *                   description: Encoded polyline for route visualization
 *                 distanceMeters:
 *                   type: integer
 *                   description: Total distance in meters
 *                 durationSeconds:
 *                   type: integer
 *                   description: Estimated duration in seconds
 *       400:
 *         description: Invalid coordinates
 *       404:
 *         description: No route found
 */



// Apply rate limiting to all places routes (public endpoints)
router.use(generalLimiter);

// GET /api/places/autocomplete?input=<text>
// Proxies to Google Places Autocomplete (server-side, no CORS issues)
router.get("/autocomplete", async (req, res) => {
  const { input } = req.query;

  if (!input || input.trim().length < 2) {
    return res.json({ predictions: [] });
  }

  const key = process.env.GOOGLE_API_KEY;
  if (!key || key === "your_google_api_key_here") {
    return res.json({
      predictions: [],
      status: "REQUEST_DENIED",
      error_message: "GOOGLE_API_KEY is missing or placeholder.",
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${key}&components=country:in&types=geocode&language=en`;
    const response = await fetch(url);
    const data = await response.json();

    return res.json({
      predictions: data.predictions || [],
      status: data.status || "UNKNOWN_ERROR",
      error_message: data.error_message || undefined,
    });
  } catch (err) {
    console.error("[Places proxy] Error:", err.message);
    return res.json({
      predictions: [],
      status: "UNKNOWN_ERROR",
      error_message: err.message,
    });
  }
});

// GET /api/places/geocode?address=<address>
// Proxies to Google Geocoding API (server-side, no CORS issues)
router.get("/geocode", async (req, res) => {
  const { address, placeId } = req.query;

  if ((!address || address.trim().length < 3) && !placeId) {
    return res.status(400).json({ error: "Address or placeId is required" });
  }

  const key = process.env.GOOGLE_API_KEY;
  if (!key || key === "your_google_api_key_here") {
    return res.json({
      status: "REQUEST_DENIED",
      results: [],
      error_message: "GOOGLE_API_KEY is missing or placeholder.",
    });
  }

  try {
    const result = await geocodeAddress(address, placeId);
    return res.json(result);
  } catch (err) {
    console.error("[Geocoding proxy] Error:", err.message);
    return res.json({
      status: "UNKNOWN_ERROR",
      results: [],
      error_message: err.message,
    });
  }
});

// GET /api/places/reverse-geocode?lat=<lat>&lng=<lng>
// Converts lat/lng to city + state using Google Geocoding API (server-side, no key exposure)
router.get("/reverse-geocode", generalLimiter, async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
    return res.status(400).json({ success: false, error: "lat and lng are required" });
  }

  const key = process.env.GOOGLE_API_KEY;
  if (!key || key === "your_google_api_key_here") {
    return res.status(503).json({ success: false, error: "Maps API key not configured" });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality|administrative_area_level_1&key=${key}&language=en`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return res.json({ success: false, error: data.error_message || data.status });
    }

    // Extract city and state from address_components
    const components = data.results[0]?.address_components || [];
    let city  = "";
    let state = "";

    for (const comp of components) {
      if (comp.types.includes("locality"))                    city  = comp.long_name;
      if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
    }

    return res.json({ success: true, city, state });
  } catch (err) {
    console.error("[Reverse geocode] Error:", err.message);
    return res.status(500).json({ success: false, error: "Reverse geocoding failed" });
  }
});

// GET /api/places/maps-key
// Returns the Maps JS API key for frontend map rendering (server-controlled)
router.get("/maps-key", (req, res) => {
  const key = process.env.GOOGLE_API_KEY;
  if (!key || key === "your_google_api_key_here") {
    return res.status(503).json({ success: false, error: "Maps API key not configured" });
  }
  return res.json({ success: true, key });
});

// POST /api/places/directions
// Proxies a directions request to Google Routes API (server-side, keeps API key off client)
// Body: { origin: { lat, lng }, destination: { lat, lng }, travelMode?: "DRIVE"|"TWO_WHEELER"|"WALK" }
router.post("/directions", async (req, res) => {
  const { origin, destination, travelMode = "DRIVE" } = req.body;

  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return res.status(400).json({ success: false, error: "origin and destination {lat, lng} are required" });
  }

  try {
    const { computeRoute } = await import("../../services/googleMaps.service.js");
    const data = await computeRoute(
      { lat: Number(origin.lat), lng: Number(origin.lng) },
      { lat: Number(destination.lat), lng: Number(destination.lng) },
      travelMode
    );

    const route = data.routes?.[0];
    if (!route) {
      return res.status(404).json({ success: false, error: "No route found" });
    }

    return res.json({
      success: true,
      encodedPolyline: route.polyline?.encodedPolyline || null,
      distanceMeters: route.distanceMeters || null,
      durationSeconds: route.duration ? parseInt(route.duration) : null,
    });
  } catch (err) {
    console.error("[Directions proxy] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
