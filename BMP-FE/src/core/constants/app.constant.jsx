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
  CREATED: "CREATED",
  MATCHING: "MATCHING",
  PARTNER_SELECTED: "PARTNER_SELECTED",
  CONFIRMED: "CONFIRMED",
  PICKUP: "PICKUP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  AUTO_CANCELLED: "AUTO_CANCELLED",
  FAILED: "FAILED",
  REJECTED: "REJECTED",

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
  PENDING: {
    label: "Pending",
    badge: "bg-yellow-100 text-yellow-700",
  },
  ASSIGNED: {
    label: "Assigned",
    badge: "bg-blue-100 text-blue-700",
  },
  PICKED_UP: {
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
  FAILED: {
    label: "Failed",
    badge: "bg-red-100 text-red-700",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-red-100 text-red-700",
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
// FIX: OTP_CONFIG values updated to match production backend .env settings.
// OTP_LENGTH must match OTP_LENGTH in backend .env (production: 6).
// These are used for UI only (input field length, countdown timers).
// The backend is the authoritative source — keep these in sync.
export const OTP_CONFIG = {
  LENGTH: 6,   // was 4 — updated to match backend OTP_LENGTH=6
  MAX_ATTEMPTS: 3,
  EXPIRY_MINUTES: 10,  // was 30 — updated to match backend OTP_EXPIRY_MINUTES=10
  LOCKOUT_MINUTES: 15,
};

export const OTP_TYPE = {
  PICKUP: "pickup",
  DELIVERY: "delivery",
};

