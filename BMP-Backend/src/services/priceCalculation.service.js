/**
 * Price Calculation Service
 *
 * Formula: Price = (Base + Distance×Rate + BillableWeight×Rate) × SurgeMultiplier
 * BillableWeight = max(ActualWeight, VolumetricWeight)
 * VolumetricWeight = (L × W × H) / 366
 *
 * Surge multiplier applies during:
 *  - Peak hours (8–10 AM, 5–8 PM IST)
 *  - Weekends
 *  - Indian public holidays
 *  - High demand (many active parcels, few available travellers)
 */

import sequelize from "../config/database.config.js";
import { getPlatformFeePercent } from "../redis/cache/platformSettingsCache.service.js";

const PRICING_CONFIG = {
  BASE_PRICE:     50,    // ₹50 base for every delivery
  DISTANCE_RATE:  0.5,   // ₹0.5 per km
  WEIGHT_RATE:    10,    // ₹10 per kg
  VOLUME_DIVISOR: 366,   // Divisor for volumetric weight (in³ → kg)

  // Surge settings
  SURGE_PEAK_HOURS:    1.25,  // 25% extra during peak hours
  SURGE_WEEKEND:       1.15,  // 15% extra on weekends
  SURGE_HIGH_DEMAND:   1.20,  // 20% extra when demand > supply
  SURGE_MAX:           2.00,  // Never exceed 2× base price
  SURGE_MIN:           1.00,  // Never below 1×

  // High-demand thresholds
  DEMAND_PARCEL_THRESHOLD:    20,  // Active parcels in MATCHING state
  DEMAND_TRAVELLER_THRESHOLD: 5,   // Available travellers

    VEHICLE_MULTIPLIERS: {
    // Private Vehicles
    bike: 0.9,
    car: 1.0,
    suv: 1.15,
    van: 1.25,
    tempo: 1.4,
    truck: 1.8,
 
    // Public Transport
    bus: 0.85,
    train: 0.75,
    plane: 3.5,
  },
};

// Indian public holidays (MM-DD format, year-agnostic)
const INDIAN_HOLIDAYS = new Set([
  "01-26", // Republic Day
  "08-15", // Independence Day
  "10-02", // Gandhi Jayanti
  "11-01", // Diwali (approximate — varies by year)
  "12-25", // Christmas
]);

/**
 * Calculate volumetric weight from dimensions in inches
 */
function calculateVolumetricWeight(lengthIn, widthIn, heightIn) {
  if (!lengthIn || !widthIn || !heightIn) return 0;
  const l = Number(lengthIn) || 0;
  const w = Number(widthIn)  || 0;
  const h = Number(heightIn) || 0;
  if (l <= 0 || w <= 0 || h <= 0) return 0;
  return (l * w * h) / PRICING_CONFIG.VOLUME_DIVISOR;
}

/**
 * Calculate surge multiplier based on current time and demand.
 * @param {object} [options]
 * @param {Date}   [options.now]           - Override current time (for testing)
 * @param {number} [options.activeParcelCount] - Current MATCHING parcels count
 * @param {number} [options.availableTravellerCount] - Available travellers count
 * @returns {{ multiplier: number, reasons: string[] }}
 */
export async function calculateSurgeMultiplier(options = {}) {
  const now = options.now || new Date();
  const reasons = [];
  let multiplier = PRICING_CONFIG.SURGE_MIN;

  // ── 1. Time-based surge (IST = UTC+5:30) ──────────────────────────────────
  const istHour = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
  const isPeakHour = (istHour >= 8 && istHour < 10) || (istHour >= 17 && istHour < 20);
  if (isPeakHour) {
    multiplier = Math.max(multiplier, PRICING_CONFIG.SURGE_PEAK_HOURS);
    reasons.push("peak_hours");
  }

  // ── 2. Weekend surge ───────────────────────────────────────────────────────
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier = Math.max(multiplier, PRICING_CONFIG.SURGE_WEEKEND);
    reasons.push("weekend");
  }

  // ── 3. Public holiday surge ────────────────────────────────────────────────
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (INDIAN_HOLIDAYS.has(mmdd)) {
    multiplier = Math.max(multiplier, PRICING_CONFIG.SURGE_WEEKEND);
    reasons.push("public_holiday");
  }

  // ── 4. Demand-based surge (live DB check) ─────────────────────────────────
  try {
    let activeParcelCount    = options.activeParcelCount;
    let availableTravellerCount = options.availableTravellerCount;

    if (activeParcelCount === undefined || availableTravellerCount === undefined) {
      const [parcelResult, travellerResult] = await Promise.all([
        sequelize.query(
          `SELECT COUNT(*) AS cnt FROM parcel WHERE status = 'MATCHING'`,
          { type: sequelize.QueryTypes.SELECT }
        ),
        sequelize.query(
          `SELECT COUNT(*) AS cnt FROM traveller_profiles WHERE is_available = true AND status = 'ACTIVE'`,
          { type: sequelize.QueryTypes.SELECT }
        ),
      ]);
      activeParcelCount       = parseInt(parcelResult[0]?.cnt  || 0);
      availableTravellerCount = parseInt(travellerResult[0]?.cnt || 0);
    }

    const isHighDemand =
      activeParcelCount > PRICING_CONFIG.DEMAND_PARCEL_THRESHOLD &&
      availableTravellerCount < PRICING_CONFIG.DEMAND_TRAVELLER_THRESHOLD;

    if (isHighDemand) {
      multiplier = Math.max(multiplier, PRICING_CONFIG.SURGE_HIGH_DEMAND);
      reasons.push("high_demand");
    }
  } catch (err) {
    console.warn("[Pricing] Demand check failed (non-fatal):", err.message);
  }

  // ── Cap at max ─────────────────────────────────────────────────────────────
  multiplier = Math.min(multiplier, PRICING_CONFIG.SURGE_MAX);

  return { multiplier, reasons };
}

/**
 * Calculate estimated delivery price with optional surge.
 * @param {number} distanceKm
 * @param {number} weightKg
 * @param {number} [lengthCm]
 * @param {number} [widthCm]
 * @param {number} [heightCm]
 * @param {object} [surgeOptions] - Passed to calculateSurgeMultiplier
 * @returns {Promise<{ price: number, basePrice: number, surgeMultiplier: number, surgeReasons: string[] }>}
 */
export async function calculatePriceWithSurge(distanceKm, weightKg, lengthIn, widthIn, heightIn, vehicleType = "car", surgeOptions = {}) {
  if (typeof distanceKm !== "number" || distanceKm < 0)
    throw new Error("Invalid distance: must be a non-negative number");
  if (typeof weightKg !== "number" || weightKg < 0)
    throw new Error("Invalid weight: must be a non-negative number");

  const volumetricWeight = calculateVolumetricWeight(lengthIn, widthIn, heightIn);
  const billableWeight   = Math.max(weightKg, volumetricWeight);
  const basePrice        = Math.round(
    PRICING_CONFIG.BASE_PRICE +
    distanceKm * PRICING_CONFIG.DISTANCE_RATE +
    billableWeight * PRICING_CONFIG.WEIGHT_RATE
  );

  const { multiplier, reasons } = await calculateSurgeMultiplier(surgeOptions);
  const vehicleMultiplier = PRICING_CONFIG.VEHICLE_MULTIPLIERS[vehicleType?.toLowerCase()] || 1;
  const vehicleAdjustedPrice = basePrice * vehicleMultiplier;
  const finalPrice = Math.round(vehicleAdjustedPrice * multiplier);

  const platformFeePercent = await getPlatformFeePercent();
  const platformFee   = Math.round(finalPrice * (platformFeePercent / 100));
  const partnerAmount = finalPrice - platformFee;

  return {
    price:           finalPrice,
    basePrice,
    vehicleMultiplier,
    vehicleType,
    platformFee,
    partnerAmount,
    surgeMultiplier: multiplier,
    surgeReasons:    reasons,
  };
}

/**
 * Synchronous price calculation (no surge, no DB calls).
 * Used in contexts where async is not available.
 */
export function calculatePrice(distanceKm, weightKg, lengthIn, widthIn, heightIn) {
  if (typeof distanceKm !== "number" || distanceKm < 0)
    throw new Error("Invalid distance: must be a non-negative number");
  if (typeof weightKg !== "number" || weightKg < 0)
    throw new Error("Invalid weight: must be a non-negative number");

  const volumetricWeight = calculateVolumetricWeight(lengthIn, widthIn, heightIn);
  const billableWeight   = Math.max(weightKg, volumetricWeight);
  const totalPrice =
    PRICING_CONFIG.BASE_PRICE +
    distanceKm * PRICING_CONFIG.DISTANCE_RATE +
    billableWeight * PRICING_CONFIG.WEIGHT_RATE;

  return Math.round(totalPrice);
}

export function getPricingConfig() {
  return PRICING_CONFIG;
}

export default {
  calculatePrice,
  calculatePriceWithSurge,
  calculateSurgeMultiplier,
  calculateVolumetricWeight,
  getPricingConfig,
};
