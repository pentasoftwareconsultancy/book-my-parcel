export const APPLICATION_CONSTANTS = {
  STORAGE: {
    TOKEN: "token",
    USER_DETAILS: "user",
    LANGUAGE: "lang",
    ROUTE_STEP_1: "routeStep1",
    ROUTE_STEP_2: "routeStep2",
  },
  // FIX: Only image types are accepted by the backend (JPEG, PNG, WebP, HEIC).
  // PDF and XLS were listed here but the backend rejects them — removed to
  // prevent confusing UX where users select a file that then gets rejected.
  ALLOW_FILES_EXTENSION: "image/jpeg,image/png,image/webp,image/heic",
  CONTENT_TYPES: "application/json",
};


export const DELIVERY_STATUS = {
  CREATED:          "CREATED",
  MATCHING:         "MATCHING",
  PARTNER_SELECTED: "PARTNER_SELECTED",
  CONFIRMED:        "CONFIRMED",
  PICKUP:           "PICKUP",
  IN_TRANSIT:       "IN_TRANSIT",
  DELIVERED:        "DELIVERED",
  CANCELLED:        "CANCELLED",
  AUTO_CANCELLED:   "AUTO_CANCELLED",
};

export const PARCEL_REQUEST_STATUS = {
  SENT: "SENT",
  INTERESTED: "INTERESTED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  SELECTED: "SELECTED",
  NOT_SELECTED: "NOT_SELECTED"
};

export const KYC_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};

export const USER_ROLES = {
  INDIVIDUAL: "INDIVIDUAL",
  TRAVELLER: "TRAVELLER",
  ADMIN: "ADMIN"
};

export const DELIVERY_STATUS_UI = {
  CREATED: {
    label: "Created",
    badge: "bg-red-200 text-gray-700",
  },
  MATCHING: {
    label: "Finding Travellers",
    badge: "bg-yellow-100 text-yellow-700",
  },
  PARTNER_SELECTED: {
    label: "Partner Selected",
    badge: "bg-blue-100 text-blue-700",
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-green-100 text-green-700",
  },
  PICKUP: {
    label: "Picked Up",
    badge: "bg-indigo-100 text-indigo-700",
  },
  IN_TRANSIT: {
    label: "In Transit",
    badge: "bg-purple-100 text-purple-700",
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-600",
  },
  AUTO_CANCELLED: {
    label: "Expired",
    badge: "bg-orange-100 text-orange-700",
  },
};


/**
 * Returns Tailwind classes for a route status badge.
 * @param {"Active" | "Paused" | "Completed" | string} status
 */
export const statusColor = (status) =>
({
  Active: "bg-green-100 text-green-600",
  Paused: "bg-orange-100 text-orange-500",
  Completed: "bg-blue-100 text-blue-600",
}[status] ?? "bg-gray-100 text-gray-500");
// OTP_LENGTH must match backend's src/config/otp.config.js, which hard-caps the
// value at 4 (the booking table's OTP columns are VARCHAR(4)) regardless of env —
// it can never actually be 6. MAX_ATTEMPTS/EXPIRY_MINUTES mirror the backend's
// fallback defaults (OTP_MAX_ATTEMPTS=5, OTP_EXPIRY_MINUTES=5); re-verify against
// the real deployed OTP_* env vars if those are ever overridden in production.
// These are used for UI only (input field length, countdown timers).
export const OTP_CONFIG = {
  LENGTH: 4,
  MAX_ATTEMPTS: 5,
  EXPIRY_MINUTES: 5,
  LOCKOUT_MINUTES: 15,
};

export const OTP_TYPE = {
  PICKUP: "pickup",
  DELIVERY: "delivery",
};

