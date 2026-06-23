/**
 * Auto-Cancel Job
 *
 * Runs on a schedule to:
 * 1. Expire ParcelRequest records whose expires_at has passed (status: SENT → EXPIRED)
 * 2. Auto-cancel MATCHING parcels that have no remaining active requests
 *    (all requests expired/rejected — no traveller responded in time)
 */

import { Op } from "sequelize";
import sequelize from "../config/database.config.js";
import ParcelRequest from "../modules/matching/parcelRequest.model.js";
import Parcel from "../modules/parcel/parcel.model.js";
import TravellerRoute from "../modules/traveller/travellerRoute.model.js";
import { invalidateRouteCache } from "../redis/cache/travellerRouteCache.service.js";

function buildIsoDateTime(date, time) {
  if (!date || !time) return null;
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalizedTime}`);
}

function isRouteExpired(route) {
  if (!route || route.status !== "ACTIVE" || route.is_recurring) return false;

  const arrivalDateTime = buildIsoDateTime(route.arrival_date, route.arrival_time);
  if (arrivalDateTime) {
    return new Date() > arrivalDateTime;
  }

  const departureDateTime = buildIsoDateTime(route.departure_date, route.departure_time);
  return departureDateTime ? new Date() > departureDateTime : false;
}

export async function expireRequestsWithExpiredRoutes() {
  const routes = await TravellerRoute.findAll({
    where: {
      status: "ACTIVE",
      is_recurring: false,
    },
    attributes: [
      "id",
      "traveller_profile_id",
      "departure_date",
      "departure_time",
      "arrival_date",
      "arrival_time",
      "status",
      "is_recurring",
    ],
  });

  const expiredRoutes = routes.filter(isRouteExpired);

  if (expiredRoutes.length === 0) {
    console.log("[AutoCancel] No expired routes found");
    return 0;
  }

  const updatePromises = expiredRoutes.map(async (route) => {
    try {
      await route.update({ status: "COMPLETED" });
      await invalidateRouteCache(route.id, route.traveller_profile_id);
      return route.id;
    } catch (error) {
      console.warn(`[AutoCancel] Failed to expire route ${route.id}:`, error.message);
      return null;
    }
  });

  const updated = await Promise.all(updatePromises);
  const successful = updated.filter(Boolean);

  if (successful.length > 0) {
    console.log(`[AutoCancel] Marked ${successful.length} expired route(s) as COMPLETED: ${successful.join(", ")}`);
  }

  return successful.length;
}

/**
 * Expire stale ParcelRequest records.
 * Marks SENT/INTERESTED requests as EXPIRED when expires_at < now.
 * @returns {number} count of expired requests
 */
export async function expireStaleRequests() {
  const now = new Date();

  const [updatedCount] = await ParcelRequest.update(
    { status: "EXPIRED" },
    {
      where: {
        status: { [Op.in]: ["SENT", "INTERESTED"] },
        expires_at: { [Op.lt]: now },
      },
    }
  );

  if (updatedCount > 0) {
    console.log(`[AutoCancel] Expired ${updatedCount} stale parcel request(s)`);
  }

  return updatedCount;
}

/**
 * Auto-cancel MATCHING parcels that have no remaining active requests.
 * A parcel is considered abandoned when every request sent to travellers
 * has been EXPIRED, REJECTED, or NOT_SELECTED — meaning no one accepted.
 * @returns {number} count of auto-cancelled parcels
 */
export async function cancelAbandonedParcels() {
  // Find MATCHING parcels whose last request expired more than 5 minutes ago
  // (small buffer to avoid race conditions with the matching engine)
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);

  const matchingParcels = await Parcel.findAll({
    where: { status: "MATCHING" },
    attributes: ["id"],
  });

  if (matchingParcels.length === 0) return 0;

  const parcelIds = matchingParcels.map((p) => p.id);

  // For each parcel, check if any request is still active (SENT or INTERESTED)
  const activeRequests = await ParcelRequest.findAll({
    where: {
      parcel_id: { [Op.in]: parcelIds },
      status: { [Op.in]: ["SENT", "INTERESTED"] },
    },
    attributes: ["parcel_id"],
  });

  const parcelsWithActiveRequests = new Set(
    activeRequests.map((r) => r.parcel_id)
  );

  // Parcels with no active requests and at least one expired request
  const expiredRequests = await ParcelRequest.findAll({
    where: {
      parcel_id: { [Op.in]: parcelIds },
      status: { [Op.in]: ["EXPIRED", "REJECTED"] },
      expires_at: { [Op.lt]: cutoff },
    },
    attributes: ["parcel_id"],
  });

  const parcelsWithExpiredRequests = new Set(
    expiredRequests.map((r) => r.parcel_id)
  );

  // Candidates: MATCHING parcels with expired requests but no active ones
  const toCancel = [...parcelsWithExpiredRequests].filter(
    (id) => !parcelsWithActiveRequests.has(id)
  );

  if (toCancel.length === 0) return 0;

  const [cancelledCount] = await Parcel.update(
    { status: "AUTO_CANCELLED" },
    {
      where: {
        id: { [Op.in]: toCancel },
        status: "MATCHING", // double-check — avoid overwriting a concurrent update
      },
    }
  );

  if (cancelledCount > 0) {
    console.log(
      `[AutoCancel] Auto-cancelled ${cancelledCount} abandoned parcel(s) with no traveller responses: [${toCancel.join(", ")}]`
    );
  }

  return cancelledCount;
}

/**
 * Run the full auto-cancel cycle.
 * Call this from server.js on a setInterval or cron.
 */
export async function runAutoCancelJob() {
  try {
    console.log("[AutoCancel] Running auto-cancel job...");
    const routeExpired = await expireRequestsWithExpiredRoutes();
    const expired = await expireStaleRequests();
    const cancelled = await cancelAbandonedParcels();
    console.log(
      `[AutoCancel] Done — route-expired: ${routeExpired}, time-expired: ${expired} requests, cancelled: ${cancelled} parcels`
    );
  } catch (err) {
    console.error("[AutoCancel] Job failed:", err.message);
  }
}

export default runAutoCancelJob;
