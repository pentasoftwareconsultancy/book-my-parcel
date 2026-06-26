import express from "express";
import { createRequire } from "module";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import sequelize from "./config/database.config.js";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { sanitizeBody } from "./middlewares/sanitize.middleware.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.config.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";

const require = createRequire(import.meta.url);

const app = express();

// ── Security headers (helmet) ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc: [
          "'self'",
          "blob:",
          "https://sdk.cashfree.com",
          "https://api.cashfree.com",
          "https://*.cashfree.com",
          "https://*.cashfree.net",
        ],
        connectSrc: [
          "'self'",
          "https://api.cashfree.com",
          "https://*.cashfree.com",
          "https://*.cashfree.net",
        ],
        imgSrc: ["'self'","data:","https:",],
        styleSrc: ["'self'","'unsafe-inline'",],
        frameSrc: [
          "'self'",
          "https://sdk.cashfree.com",
          "https://api.cashfree.com",
          "https://*.cashfree.com",
          "https://*.cashfree.net",
        ],
        workerSrc: [
          "'self'",
          "blob:",
          "https://api.cashfree.com",
          "https://*.cashfree.com",
          "https://*.cashfree.net",
        ],
        objectSrc:      ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    noSniff: true,
    frameguard: { action: "sameorigin" },
    hsts: process.env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    hidePoweredBy: true,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// Load allowed origins from env (comma-separated). Required in production.
// Example: ALLOWED_ORIGINS=https://myapp.com,https://staging.myapp.com
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

// In development only, allow localhost origins as a fallback
const devOrigins =
  process.env.NODE_ENV !== "production"
    ? [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
      ]
    : [];

const allowedOrigins = [...new Set([...devOrigins, ...envOrigins])];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server / curl requests (no Origin header)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // REMOVED: wildcard .vercel.app allowance — too broad, allows attacker-controlled origins.
      // Add your specific Vercel domain to ALLOWED_ORIGINS instead.

      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// ── Request logging ───────────────────────────────────────────────────────────
const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

// ── Response compression ──────────────────────────────────────────────────────
app.use(compression());

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Input sanitization ────────────────────────────────────────────────────────
app.use(sanitizeBody);

// ── Global rate limiting ──────────────────────────────────────────────────────
// Applied after body parsing so Content-Length is known for logging.
// Baseline: 300 req/15min per IP in production, 2000 in development.
// Specific routes (auth, OTP, payments) use tighter per-route limiters
// defined in rateLimit.middleware.js and applied directly in their route files.
app.use(generalLimiter);

// ── Static uploads ────────────────────────────────────────────────────────────
// KYC documents are intentionally NOT served here — they require authentication.
// See /api/kyc/document/:filename for the authenticated route.
// Only non-sensitive uploads (profile photos, parcel images) are served publicly.
// Cross-Origin-Resource-Policy is set to "cross-origin" so the React frontend
// (running on a different port in dev) can load these images without being
// blocked by the browser's CORP enforcement from helmet.
const staticOptions = {
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
};
app.use("/uploads/profiles", express.static("uploads/profiles", staticOptions));
app.use("/uploads/parcels",  express.static("uploads/parcels",  staticOptions));
app.use("/uploads/proofs",   express.static("uploads/proofs",   staticOptions));
// NOTE: /uploads/kyc is NOT exposed — served via authenticated API route only.

// ── Swagger API Documentation ─────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── API routes ────────────────────────────────────────────────────────────────
// Single versioned mount — /api/v1 is the canonical path.
// /api (legacy) is kept for backward compatibility during migration.
// app.use("/api/v1", routes);
app.use("/api",    routes);

// ── Health check ──────────────────────────────────────────────────────────────
// Returns basic server status. Safe to expose publicly — no sensitive data.
app.get("/api/health", (req, res) => {
  // Check Firebase admin using the module-level createRequire (ESM-safe)
  let firebaseInitialized = false;
  try {
    const admin = require("firebase-admin");
    firebaseInitialized = admin.apps.length > 0;
  } catch {
    firebaseInitialized = false;
  }

  res.json({
    success:              true,
    message:              "Backend is running",
    timestamp:            new Date().toISOString(),
    environment:          process.env.NODE_ENV || "development",
    port:                 process.env.PORT || 3000,
    api_version:          "v1",
    firebase_initialized: firebaseInitialized,
  });
});

// ── Database health check ─────────────────────────────────────────────────────
// Auth-protected in production — only accessible to authenticated admin users.
// In development it is open for convenience.
app.get("/api/db-health", async (req, res) => {
  // In production, require a valid internal secret header to prevent public access.
  if (process.env.NODE_ENV === "production") {
    const secret = req.headers["x-internal-secret"];
    if (!secret || secret !== process.env.INTERNAL_SECRET) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
  }

  try {
    await sequelize.authenticate();
    res.json({
      success:   true,
      message:   "Database connection successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Never expose raw error messages — they can contain connection strings
    res.status(500).json({
      success:   false,
      message:   "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Book My Parcel Backend is running!",
    version: "1.0.0",
    env:     process.env.NODE_ENV || "development",
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
