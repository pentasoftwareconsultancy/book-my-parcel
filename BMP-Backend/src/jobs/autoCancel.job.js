/**
 * Auto-Cancel Job
 *
 * Runs on a schedule to:
 * 1. Expire ParcelRequest records whose expires_at has passed (status: SENT → EXPIRED)
 * 2. Cancel MATCHING parcels that have no remaining active requests
 *    (all requests expired/rejected — no traveller responded in time)
 */

import { Op } from "sequelize";
import sequelize from "../config/database.config.js";
import ParcelRequest from "../modules/matching/parcelRequest.model.js";
import Parcel from "../modules/parcel/parcel.model.js";
import TravellerRoute from "../modules/traveller/travellerRoute.model.js";
import { invalidateActiveRoutesCache } from "../redis/cache/activeRoutesCache.service.js";
import { parseArrivalDateTime } from "../utils/routeExpiry.util.js";

export async function expireRequestsWithExpiredRoutes() {
  const now = new Date();

  // Mark active routes as completed once their arrival datetime has passed.
  const expiredRouteIds = [];
  const activeRoutes = await TravellerRoute.findAll({
    where: { status: "ACTIVE" },
    attributes: ["id", "arrival_date", "arrival_time"],
  });

  for (const route of activeRoutes) {
    const arrivalDateTime = parseArrivalDateTime(route);
    if (arrivalDateTime && arrivalDateTime.getTime() < now.getTime()) {
      expiredRouteIds.push(route.id);
    }
  }

  let updatedRoutesCount = 0;
  if (expiredRouteIds.length > 0) {
    const [count] = await TravellerRoute.update(
      { status: "COMPLETED" },
      { where: { id: { [Op.in]: expiredRouteIds }, status: "ACTIVE" } }
    );

    updatedRoutesCount = count;
    await invalidateActiveRoutesCache();
    console.log(`[AutoCancel] Marked ${updatedRoutesCount} active route(s) as COMPLETED due to expired arrival datetime`);
  }

  // Expire parcel requests attached to routes that are now expired.
  const [expiredRequestsCount] = await ParcelRequest.update(
    { status: "EXPIRED" },
    {
      where: {
        route_id: { [Op.in]: expiredRouteIds },
        status: { [Op.in]: ["SENT", "INTERESTED"] },
      },
    }
  );

  if (expiredRequestsCount > 0) {
    console.log(`[AutoCancel] Expired ${expiredRequestsCount} parcel request(s) attached to expired routes`);
  }

  return updatedRoutesCount;
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
 * Cancel MATCHING parcels that have no remaining active requests.
 * A parcel is considered abandoned when every request sent to travellers
 * has been EXPIRED, REJECTED, or NOT_SELECTED — meaning no one accepted.
 * @returns {number} count of cancelled parcels
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
    { status: "CANCELLED" },
    {
      where: {
        id: { [Op.in]: toCancel },
        status: "MATCHING", // double-check — avoid overwriting a concurrent update
      },
    }
  );

  if (cancelledCount > 0) {
    console.log(
      `[AutoCancel] Cancelled ${cancelledCount} abandoned parcel(s) with no traveller responses: [${toCancel.join(", ")}]`
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
