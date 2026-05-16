/**
 * useSessionTimeout — proactive session expiry management.
 *
 * - Warns the user 5 minutes before their JWT expires
 * - Auto-logs out when the JWT expires
 * - For long-lived tokens (7d), uses a periodic check every minute
 *   instead of a single giant setTimeout (which is unreliable > 24h)
 */
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice";
import { showError } from "../utils/toast.util";

const WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // warn 5 min before expiry
const CHECK_INTERVAL_MS        = 60 * 1000;      // check every 1 minute

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function useSessionTimeout() {
  const dispatch        = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const intervalRef     = useRef(null);
  const warnedRef       = useRef(false);

  useEffect(() => {
    clearInterval(intervalRef.current);
    warnedRef.current = false;

    if (!isAuthenticated || !token) return;

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return;

    // Token already expired on mount — log out immediately
    if (payload.exp * 1000 <= Date.now()) {
      dispatch(logoutThunk());
      return;
    }

    // Periodic check — reliable for both short and long-lived tokens
    intervalRef.current = setInterval(() => {
      const now          = Date.now();
      const expiresAtMs  = payload.exp * 1000;
      const remainingMs  = expiresAtMs - now;

      if (remainingMs <= 0) {
        clearInterval(intervalRef.current);
        showError("Your session has expired. Please log in again.");
        dispatch(logoutThunk());
        return;
      }

      if (remainingMs <= WARNING_BEFORE_EXPIRY_MS && !warnedRef.current) {
        warnedRef.current = true;
        showError("Your session will expire in 5 minutes. Please save your work.");
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [token, isAuthenticated, dispatch]);
}
