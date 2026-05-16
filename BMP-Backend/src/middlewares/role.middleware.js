import { responseError } from "../utils/response.util.js";
import { ROLES } from "../utils/constants.js";
import User from "../modules/user/user.model.js";
import Role from "../modules/user/role.model.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/cache.util.js";

// Cache TTL for user roles — 5 minutes.
// Matches the auth middleware user cache TTL so both expire together.
const ROLES_CACHE_TTL = 300;

/**
 * Build the Redis key for a cached user roles record.
 */
function rolesCacheKey(userId) {
  return `auth:roles:${userId}`;
}

/**
 * Invalidate the cached roles for a user.
 * Call this whenever a user's roles change (role assignment, ban, etc.)
 */
export async function invalidateRolesCache(userId) {
  await cacheDel(rolesCacheKey(userId));
}

/**
 * Fetch user roles — checks Redis cache first, falls back to DB on miss.
 * Returns an array of role name strings, e.g. ["INDIVIDUAL", "TRAVELLER"].
 */
async function getUserRoles(userId) {
  const cacheKey = rolesCacheKey(userId);

  // Cache hit
  const cached = await cacheGet(cacheKey);
  if (cached !== null) return cached;

  // Cache miss — query DB
  const user = await User.findByPk(userId, {
    include: [{
      model: Role,
      as:    "roles",
      through: { attributes: [] },
      attributes: ["name"],
    }],
  });

  if (!user) return null;

  const roleNames = user.roles.map((r) => r.name);
  await cacheSet(cacheKey, roleNames, ROLES_CACHE_TTL);
  return roleNames;
}

/**
 * Middleware to check if the authenticated user has the required role(s).
 * Uses Redis cache to avoid a DB query on every request.
 *
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return responseError(res, "Authentication required", 401);
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      const userRoles = await getUserRoles(req.user.id);

      if (!userRoles) {
        return responseError(res, "User not found", 404);
      }

      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        return responseError(
          res,
          `Access denied. Required role: ${roles.join(" or ")}`,
          403
        );
      }

      // Attach roles to request for downstream use
      req.userRoles = userRoles;
      next();
    } catch (error) {
      console.error("[Role Middleware] Error:", error.message);
      return responseError(res, "Authorization check failed", 500);
    }
  };
};

/**
 * Shorthand middleware for admin-only routes
 */
export const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Shorthand middleware for traveller-only routes
 */
export const requireTraveller = requireRole(ROLES.TRAVELLER);

/**
 * Shorthand middleware for individual user routes
 */
export const requireIndividual = requireRole(ROLES.INDIVIDUAL);

/**
 * Middleware for routes accessible by multiple roles
 */
export const requireAnyRole = (...roles) => requireRole(roles);
