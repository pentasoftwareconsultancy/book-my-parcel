/**
 * Environment variable validation.
 * Called once at server startup — crashes fast if required vars are missing or insecure.
 */

const REQUIRED = [
  "JWT_SECRET",
];

const REQUIRED_LOCAL_DB = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];

const RECOMMENDED = [
  // "RAZORPAY_KEY_ID",
  // "RAZORPAY_KEY_SECRET",
  "CASHFREE_APP_ID",
  "CASHFREE_SECRET_KEY",
  "CASHFREE_ENV",

  "CASHFREE_P_SECRET_ID",
  "CASHFREE_P_SECRET_KEY",

  "GOOGLE_API_KEY",
  "BASE_URL",
  "FRONTEND_URL",
  "ALLOWED_ORIGINS",
  "FIREBASE_SERVICE_ACCOUNT_KEY",
];

// Known insecure placeholder values that must never reach production
const INSECURE_JWT_VALUES = new Set([
  "mysecretkey",
  "secret",
  "your_jwt_secret_here",
  "changeme",
  "password",
  "jwt_secret",
]);

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (!process.env.DATABASE_URL) {
    missing.push(...REQUIRED_LOCAL_DB.filter((key) => !process.env[key]));
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nCopy .env.example to .env and fill in the values.");
    process.exit(1);
  }

  // ── JWT_SECRET strength enforcement ────────────────────────────────────────
  const jwtSecret = process.env.JWT_SECRET;

  if (INSECURE_JWT_VALUES.has(jwtSecret?.toLowerCase())) {
    console.error("❌ JWT_SECRET is set to a known insecure placeholder value.");
    console.error("   Generate a secure secret with:");
    console.error('   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.warn("⚠️  Continuing in development mode — this MUST be fixed before production.");
    }
  }

  if (jwtSecret && jwtSecret.length < 32) {
    const msg = "JWT_SECRET is too short (< 32 chars). Minimum 64 chars recommended.";
    if (process.env.NODE_ENV === "production") {
      console.error(`❌ ${msg}`);
      process.exit(1);
    } else {
      console.warn(`⚠️  ${msg}`);
    }
  }

  // ── CORS origin check in production ────────────────────────────────────────
  if (process.env.NODE_ENV === "production") {
    if (!process.env.ALLOWED_ORIGINS) {
      console.error("❌ ALLOWED_ORIGINS must be set in production.");
      console.error("   Example: ALLOWED_ORIGINS=https://yourdomain.com");
      process.exit(1);
    }

    // Warn if localhost origins are present in production CORS config
    const origins = process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    const hasLocalhost = origins.some(
      (o) => o.includes("localhost") || o.includes("127.0.0.1")
    );
    if (hasLocalhost) {
      console.warn("⚠️  ALLOWED_ORIGINS contains localhost entries in production. Remove them.");
    }
  }

  // ── Recommended vars ────────────────────────────────────────────────────────
  const missingRecommended = RECOMMENDED.filter((key) => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn("⚠️  Missing recommended environment variables (some features may not work):");
    missingRecommended.forEach((key) => console.warn(`   - ${key}`));
  }

  console.log("✅ Environment variables validated");
}
