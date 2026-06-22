import { getPlatformFeePercent } from "../redis/cache/platformSettingsCache.service.js";

const PRICING_CONFIG = {
  VEHICLE_MULTIPLIERS: {
    // Private Vehicles
    bike: 0.9,
    car: 1.0,
    suv: 1.1,
    van: 1.15,
    tempo: 1.2,
    truck: 1.3,

    // Public Transport
    bus: 0.85,
    train: 0.75,
    plane: 3.5,
  },
};

/**
 * Weight Slabs
 */
function getWeightCharge(weight) {
  if (weight <= 1) return 20;
  if (weight <= 5) return 50;
  if (weight <= 10) return 80;
  if (weight <= 20) return 120;
  return 180;
}

/**
 * Distance Slabs
 */
function getDistanceCharge(distance) {
  if (distance <= 50) return 30;
  if (distance <= 200) return 80;
  if (distance <= 500) return 150;
  if (distance <= 1000) return 250;
  return 400;
}

/**
 * Main Price Calculation (NO SURGE PRICING)
 * Formula: Final Price = Distance Charge + Weight Charge + Vehicle Charge + Platform Fee + GST
 */
export async function calculatePriceWithSurge(
  distanceKm,
  weightKg,
  vehicleType = "car"
) {
  if (typeof distanceKm !== "number" || distanceKm < 0) {
    throw new Error("Invalid distance: must be a non-negative number");
  }

  if (typeof weightKg !== "number" || weightKg < 0) {
    throw new Error("Invalid weight: must be a non-negative number");
  }

  // Calculate base charges using slabs
  const weightCharge = getWeightCharge(weightKg);
  const distanceCharge = getDistanceCharge(distanceKm);

  // Apply vehicle multiplier
  const vehicleMultiplier = PRICING_CONFIG.VEHICLE_MULTIPLIERS[vehicleType?.toLowerCase()] || 1;

  // Base Price = (Distance + Weight) × Vehicle Multiplier
  const basePrice = Math.round((distanceCharge + weightCharge) * vehicleMultiplier);

  // Calculate Platform Fee
  const platformFeePercent = await getPlatformFeePercent();
  const platformFee = Math.round(basePrice * (platformFeePercent / 100));

  // Subtotal = Base Price + Platform Fee
  const subtotal = basePrice + platformFee;

  // Calculate GST on Subtotal
  const gstAmount = Math.round(subtotal * 0.18); // 18% GST

  // Final Price = Subtotal + GST
  const finalPrice = subtotal + gstAmount;

  // Partner Amount (base price without platform fee and GST)
  const partnerAmount = basePrice;

  return {
    distanceCharge,
    weightCharge,
    vehicleMultiplier,
    basePrice,
    platformFee,
    gstAmount,
    subtotal,
    finalPrice,
    partnerAmount,
    // Remove all surge-related fields
  };
}

/**
 * Sync Price Calculation (NO SURGE PRICING)
 */
export function calculatePrice(distanceKm, weightKg, vehicleType = "car") {
  if (typeof distanceKm !== "number" || distanceKm < 0) {
    throw new Error("Invalid distance: must be a non-negative number");
  }

  if (typeof weightKg !== "number" || weightKg < 0) {
    throw new Error("Invalid weight: must be a non-negative number");
  }

  const weightCharge = getWeightCharge(weightKg);
  const distanceCharge = getDistanceCharge(distanceKm);
  const vehicleMultiplier = PRICING_CONFIG.VEHICLE_MULTIPLIERS[vehicleType?.toLowerCase()] || 1;

  // Return base price only for sync calculation
  return Math.round((distanceCharge + weightCharge) * vehicleMultiplier);
}

export function getPricingConfig() {
  return PRICING_CONFIG;
}

export default {
  calculatePrice,
  calculatePriceWithSurge,
  getPricingConfig,
};