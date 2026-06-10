import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../../firebase/firebase";

// ── Human-readable messages for common Firebase popup errors ─────────────────
const FIREBASE_ERROR_MESSAGES = {
  "auth/popup-closed-by-user":       "Sign-in cancelled. Please try again.",
  "auth/popup-blocked":              "Popup was blocked by your browser. Please allow popups for this site and try again.",
  "auth/cancelled-popup-request":    "Another sign-in is already in progress. Please wait.",
  "auth/account-exists-with-different-credential":
    "An account already exists with the same email but a different sign-in method. Please log in with your email and password.",
  "auth/network-request-failed":     "Network error. Please check your internet connection and try again.",
  "auth/too-many-requests":          "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled":              "This account has been disabled. Please contact support.",
  "auth/operation-not-allowed":      "Google sign-in is not enabled. Please contact support.",
  "auth/invalid-credential":         "Invalid credentials. Please try again.",
};

function getFriendlyError(err) {
  const code = err?.code || "";
  const friendly = FIREBASE_ERROR_MESSAGES[code];
  if (friendly) return friendly;

  return (err?.message || "Google sign-in failed. Please try again.")
    .replace(/^Firebase:\s*/i, "")
    .replace(/\s*\(auth\/[^)]+\)\s*$/, "");
}

// ── Google ────────────────────────────────────────────────────────────────────
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const result = await signInWithPopup(auth, provider);
    return await result.user.getIdToken();
  } catch (err) {
    throw new Error(getFriendlyError(err));
  }
};
