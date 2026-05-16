/**
 * useSessionTimeout — proactive session expiry management.
 *
 * On mount (and whenever the token changes):
 *   - Calculates time until token expiry
 *   - Sets a warning timer 2 minutes before expiry (shows a toast)
 *   - Sets an auto-logout timer at expiry — calls logoutThunk which
 *     blacklists the token on the backend before clearing local state
 *
 * Clears all timers on unmount or when the user logs out.
 */
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice";
import { showError } from "../utils/toast.util";

const WARNING_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // warn 2 min before expiry

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function useSessionTimeout() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const warningTimerRef = useRef(null);
  const logoutTimerRef  = useRef(null);

  useEffect(() => {
    // Clear any existing timers whenever token or auth state changes
    clearTimeout(warningTimerRef.current);
    clearTimeout(logoutTimerRef.current);

    if (!isAuthenticated || !token) return;

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return;

    const expiresInMs = payload.exp * 1000 - Date.now();

    // Token already expired — log out immediately
    if (expiresInMs <= 0) {
      dispatch(logoutThunk());
      return;
    }

    // Set warning timer (2 min before expiry)
    const warningInMs = expiresInMs - WARNING_BEFORE_EXPIRY_MS;
    if (warningInMs > 0) {
      warningTimerRef.current = setTimeout(() => {
        showError("Your session will expire in 2 minutes. Please save your work.");
      }, warningInMs);
    }

    // Set auto-logout timer — logoutThunk calls the backend to blacklist the
    // token before clearing local state (fixed in authSlice.js)
    logoutTimerRef.current = setTimeout(() => {
      showError("Your session has expired. Please log in again.");
      dispatch(logoutThunk());
    }, expiresInMs);

    return () => {
      clearTimeout(warningTimerRef.current);
      clearTimeout(logoutTimerRef.current);
    };
  }, [token, isAuthenticated, dispatch]);
}
