// Maximum route distance (km) allowed per vehicle type.
// null = no limit (long-haul or public-transport vehicles).
// Keep in sync with BMP-FE/src/core/hooks/useStepPickup.js VEHICLE_DISTANCE_LIMITS.

export const VEHICLE_DISTANCE_LIMITS = {
  bike:   150,   // intra-city / short inter-district
  car:    500,   // inter-city, state-to-state
  suv:    700,   // extended inter-city
  van:    600,   // mid-range cargo
  tempo:  1000,  // regional cargo
  truck:  null,  // unlimited — long-haul
  bus:    null,  // unlimited — public transport
  train:  null,  // unlimited — rail
  plane:  null,  // unlimited — air
};

/**
 * Returns an error message if the vehicle cannot cover the given distance,
 * or null if the combination is valid.
 * @param {string} vehicleType  e.g. "bike", "car"
 * @param {number} distanceKm   route distance in kilometres
 * @returns {string|null}
 */
export function validateVehicleDistance(vehicleType, distanceKm) {
  if (!vehicleType || distanceKm == null) return null;
  const maxKm = VEHICLE_DISTANCE_LIMITS[vehicleType.toLowerCase()];
  if (maxKm === undefined) return null; // unknown type — skip
  if (maxKm === null) return null;      // unlimited
  if (distanceKm > maxKm) {
    const name = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
    return (
      `${name} is only suitable for routes up to ${maxKm} km. ` +
      `Estimated distance is ${Math.round(distanceKm)} km. ` +
      `Please choose a larger vehicle (e.g. Tempo or Truck).`
    );
  }
  return null;
}
