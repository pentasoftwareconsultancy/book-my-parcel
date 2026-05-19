


import jwt from "jsonwebtoken";
import { getSessionTimeout } from "../redis/cache/platformSettingsCache.service.js";
import { getSessionVersion } from "../redis/services/sessionVersion.service.js";

// Read session_timeout_mins — priority: ENV > platform_settings DB > hardcoded default
async function getSessionExpiry(isAdmin) {
  // ENV override — set SESSION_TIMEOUT_MINS in .env to control without DB queries
  const envMins = isAdmin
    ? parseInt(process.env.ADMIN_SESSION_TIMEOUT_MINS)
    : parseInt(process.env.SESSION_TIMEOUT_MINS);

  if (envMins && envMins > 0) return `${envMins}m`;

  // Fall back to DB/cache value
  try {
    const mins = await getSessionTimeout();
    if (mins && mins > 0) return `${mins}m`;
  } catch {
    // Cache not ready yet — use hardcoded defaults
  }
  return isAdmin ? "1d" : "7d";
}

export const generateToken = async (user) => {
  const secret = process.env.JWT_SECRET;

  const id = user?.id || user?._id || user?.userId;
  if (!id) throw new Error("User/Admin ID is required");

  const isAdmin = user.role === "ADMIN" || user.roles?.includes("ADMIN");
  const expiresIn = await getSessionExpiry(isAdmin);
  const sessionVersion = await getSessionVersion(id);

  return jwt.sign({ id, sv: sessionVersion }, secret, { expiresIn });
};
