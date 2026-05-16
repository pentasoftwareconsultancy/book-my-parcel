// ─────────────────────────────────────────────────────────────
//  notificationConfig.js
//  Single source of truth for tabs and notification types per role.
//  To add a new role or type — edit ONLY this file.
// ─────────────────────────────────────────────────────────────

export const notificationConfig = {

  // ── ADMIN ──────────────────────────────────────────────────
  admin: {
    tabs: ["all", "unread", "parcel", "payment"],
    types: {
      new_parcel_request: {
        label: "New Parcel Request",
        tabType: "parcel",
        icon: "package",
        color: "blue",
      },
      parcel_delivered: {
        label: "Parcel Delivered",
        tabType: "parcel",
        icon: "check",
        color: "green",
      },
      payment_received: {
        label: "Payment Received",
        tabType: "payment",
        icon: "rupee",
        color: "emerald",
      },
      kyc_alert: {
        label: "KYC Alert",
        tabType: "parcel",
        icon: "alert",
        color: "red",
      },
    },
  },

  // ── USER ───────────────────────────────────────────────────
  user: {
    tabs: ["all", "unread", "bookings", "offers"],
    types: {
      traveller_interested: {
        label: "Traveller Interested",
        tabType: "bookings",
        icon: "truck",
        color: "blue",
      },
      traveller_selected: {
        label: "Traveller Selected",
        tabType: "bookings",
        icon: "truck",
        color: "blue",
      },
      parcel_picked_up: {
        label: "Parcel Picked Up",
        tabType: "bookings",
        icon: "package",
        color: "indigo",
      },
      parcel_delivered: {
        label: "Parcel Delivered",
        tabType: "bookings",
        icon: "check",
        color: "green",
      },
      offer: {
        label: "Special Offer",
        tabType: "offers",
        icon: "gift",
        color: "purple",
      },
    },
  },

  // ── TRAVELLER ──────────────────────────────────────────────
  traveller: {
    tabs: ["all", "unread", "deliveries", "earnings"],
    types: {
      parcel_created: {
        label: "New Delivery Request",
        tabType: "deliveries",
        icon: "package",
        color: "blue",
      },
      traveller_selected: {
        label: "You Were Selected",
        tabType: "deliveries",
        icon: "truck",
        color: "green",
      },
      interest_rejected: {
        label: "Interest Rejected",
        tabType: "deliveries",
        icon: "alert",
        color: "red",
      },
      pickup_reminder: {
        label: "Pickup Reminder",
        tabType: "deliveries",
        icon: "clock",
        color: "orange",
      },
      payment_received: {
        label: "Payment Received",
        tabType: "earnings",
        icon: "rupee",
        color: "emerald",
      },
      delivery_completed: {
        label: "Delivery Completed",
        tabType: "deliveries",
        icon: "check",
        color: "green",
      },
    },
  },
};