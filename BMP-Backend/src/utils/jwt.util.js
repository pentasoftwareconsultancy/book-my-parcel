


import jwt from "jsonwebtoken";
import { getSessionTimeout } from "../redis/cache/platformSettingsCache.service.js";
import { getSessionVersion } from "../redis/services/sessionVersion.service.js";

// Read session_timeout_mins from platform_settings cache (fallback to defaults)
async function getSessionExpiry(isAdmin) {
  try {
    const mins = await getSessionTimeout();
    if (mins && mins > 0) return `${mins}m`;
  } catch {
    // Cache not ready yet — use defaults
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
