class ServerUrl {

  // Base URL — used to construct asset/upload URLs from relative paths.
  // Derives from VITE_BASE_URL, or strips /api from VITE_API_URL as fallback.
  // e.g. VITE_API_URL=https://api.bookmyparcel.co.in/api → BASE_URL=https://api.bookmyparcel.co.in
  static BASE_URL = import.meta.env.VITE_BASE_URL ||
    (import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "");


  static API_MODULE_AUTH = "auth";

  // Auth Module Endpoints
  static API_REQUEST_OTP = ServerUrl.API_MODULE_AUTH + "/request-otp";
  static API_CHECK_USER_EXISTS = ServerUrl.API_MODULE_AUTH + "/check-user-exists";
  static API_VERIFY_OTP = ServerUrl.API_MODULE_AUTH + "/verify-otp";
  static API_LOGIN = ServerUrl.API_MODULE_AUTH + "/login";
  static API_FIREBASE_LOGIN = ServerUrl.API_MODULE_AUTH + "/firebase-login";
  static API_SIGNUP = ServerUrl.API_MODULE_AUTH + "/signup";
  static API_LOGOUT = ServerUrl.API_MODULE_AUTH + "/logout";
  static API_FORGOT_PASSWORD = ServerUrl.API_MODULE_AUTH + "/forgot-password";

  //profile endpoints
  static API_PROFILE = ServerUrl.API_MODULE_AUTH + "/profile";
  static API_UPDATE_PROFILE = ServerUrl.API_MODULE_AUTH + "/update-profile";
  static API_PROFILE_PHOTO = ServerUrl.API_MODULE_AUTH + "/profile/photo";
  static API_UPDATE_PASSWORD = ServerUrl.API_MODULE_AUTH + "/update-password";
  // Role / KYC endpoints (JWT protected)
  static API_BECOME_TRAVELLER = ServerUrl.API_MODULE_AUTH + "/become-traveller"; // POST


  // User endpoints
  static API_MODULE_USER = "user";
  static API_SEARCH_REQUESTS = ServerUrl.API_MODULE_USER + "/requests/search";
  static API_USER_DASHBOARD_ORDERS = ServerUrl.API_MODULE_USER + "/dashboard/orders";
  static API_USER_DASHBOARD_STATS = ServerUrl.API_MODULE_USER + "/dashboard/stats";
  static API_USER_ACTIVE_TRAVELLEERS = ServerUrl.API_MODULE_USER + "/active-travellers";
  static API_USER_GET_PROFILE = ServerUrl.API_MODULE_USER + "/userprofile";
  static API_USER_UPDATE_PROFILE = ServerUrl.API_MODULE_USER + "/userprofile/update";
  static API_FEEDBACK_SUBMIT = ServerUrl.API_MODULE_USER + "/feedback/submit";
  static API_USER_REFERRAL_STATS = ServerUrl.API_MODULE_USER + "/referral/stats";
  static API_FEEDBACK_BASE = "feedback";  // For GET /api/feedback/traveller/:id and /api/feedback/booking/:id
  static API_FEEDBACK_UPDATE = (bookingId) => `/feedback/booking/${bookingId}`;
  // Payment endpoints — routes to /api/payment/...
  static API_MODULE_PAYMENT = "payment";
  static API_PAYMENT_CREATE_ORDER = ServerUrl.API_MODULE_PAYMENT + "/create-order";
  static API_PAYMENT_VERIFY = ServerUrl.API_MODULE_PAYMENT + "/verify-payment";
  
  // Wallet endpoints
  static API_WALLET_BALANCE = ServerUrl.API_MODULE_PAYMENT + "/wallet/balance";
  static API_WALLET_DETAILS = ServerUrl.API_MODULE_PAYMENT + "/wallet/details";
  static API_WALLET_TRANSACTIONS = ServerUrl.API_MODULE_PAYMENT + "/wallet/transactions";
  
  // KYC & Bank Status
  static API_KYC_BANK_STATUS = ServerUrl.API_MODULE_PAYMENT + "/kyc/bank-status";
  static API_KYC_BYPASS = ServerUrl.API_MODULE_PAYMENT + "/kyc/bypass";
  
  // Withdrawal endpoints
  static API_WITHDRAWAL_REQUEST = ServerUrl.API_MODULE_PAYMENT + "/withdrawal/request";
  static API_WITHDRAWAL_HISTORY = ServerUrl.API_MODULE_PAYMENT + "/withdrawal/history";
  static API_WITHDRAWAL_DETAILS = (id) => `${ServerUrl.API_MODULE_PAYMENT}/withdrawal/${id}`;
  static API_WITHDRAWAL_PROCESS = (id) => `${ServerUrl.API_MODULE_PAYMENT}/withdrawal/${id}/process`;

  // Parcel endpoints (for single parcel operations)
  static API_MODULE_PARCEL = "parcel";
  static API_CREATE_REQUEST = ServerUrl.API_MODULE_PARCEL + "/request";
  static API_GET_PARCEL_BY_ID = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}`;
  static API_TRAVELER_PARCEL_DETAILS = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}`;
  static API_PARCEL_ACCEPTANCES = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}/acceptances`;
  static API_PARCEL_ROUTE_GEOMETRY = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}/route-geometry`;
  static API_PARCEL_FIND_TRAVELLERS = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}/find-travellers`;
  static API_PARCEL_SELECT_TRAVELLER = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}/select-traveller`;
  static API_UPDATE_PARCEL_STEP = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}/step`;
  static API_PARCEL_CANCEL = (id) => `${ServerUrl.API_MODULE_PARCEL}/${id}/cancel`;

  // Booking endpoints
  static API_MODULE_BOOKING = "booking";
  static API_BOOKING_START_PICKUP = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/start-pickup`;
  static API_BOOKING_VERIFY_PICKUP = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/verify-pickup`;
  static API_BOOKING_START_DELIVERY = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/start-delivery`;
  static API_BOOKING_VERIFY_DELIVERY = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/verify-delivery`;
  static API_BOOKING_CANCEL = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/cancel`;
  static API_BOOKING_CHAT = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/chat`;
  static API_BOOKING_DELIVERY_ATTEMPT = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/delivery-attempt`;
  static API_BOOKING_DELIVERY_ATTEMPTS = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/delivery-attempts`;
  static API_BOOKING_RECEIVE_PAYMENT = (id) => `${ServerUrl.API_MODULE_BOOKING}/${id}/receive-payment`;
  static API_MODULE_MATCHING = "matching";

  // Traveler endpoints
  static API_MODULE_TRAVELER = "traveller";
  
  static API_TRAVELER_FEED = ServerUrl.API_MODULE_TRAVELER + "/feed";
  static API_TRAVELER_ACCEPT = ServerUrl.API_MODULE_TRAVELER + "/accept";
  static API_TRAVELER_NEARBY = ServerUrl.API_MODULE_TRAVELER + "/nearby";
  static API_TRAVELER_DASHBOARD_DELIVERIES = ServerUrl.API_MODULE_TRAVELER + "/dashboard/deliveries";
  static API_TRAVELER_DASHBOARD_STATS = ServerUrl.API_MODULE_TRAVELER + "/dashboard/stats";
  static API_TRAVELER_DASHBOARD_REQUESTS = ServerUrl.API_MODULE_TRAVELER + "/dashboard/requests";
  static API_TRAVELER_DASHBOARD_PENDING_PAYMENTS = ServerUrl.API_MODULE_TRAVELER + "/dashboard/pending-payments";
  static API_TRAVELER_ROUTES = ServerUrl.API_MODULE_TRAVELER + "/routes";
  static API_TRAVELER_ROUTE_SEARCH = ServerUrl.API_MODULE_TRAVELER + "/routes/search";
  static API_TRAVELER_ROUTE_PREVIEW_ALTERNATIVES = ServerUrl.API_MODULE_TRAVELER + "/routes/preview-alternatives";
  static API_TRAVELER_ROUTE_BY_ID = (id) => `${ServerUrl.API_MODULE_TRAVELER}/routes/${id}`;

  static API_TRAVELER_KYC = ServerUrl.API_MODULE_TRAVELER + "/kyc";
  static API_TRAVELER_KYC_STATUS = (id) => `${ServerUrl.API_MODULE_TRAVELER}/kyc/status/${id}`;
  static API_TRAVELER_KYC_UPDATE = ServerUrl.API_MODULE_TRAVELER + "/kyc/update";
  static API_TRAVELER_KYC_ALL = ServerUrl.API_MODULE_TRAVELER + "/kyc/all";

  // Unified requests endpoint — always use dashboard/requests (has pagination + proper shape)
  static API_TRAVELER_REQUESTS = ServerUrl.API_MODULE_TRAVELER + "/dashboard/requests";
  static API_TRAVELER_ACCEPT_REQUEST = (id) => `${ServerUrl.API_MODULE_TRAVELER}/requests/${id}/accept`;

  // ------------------ KYC Verification APIs ------------------
  static API_MODULE_KYC = "kyc";

  // PAN Verification
  static API_KYC_VERIFY_PAN = ServerUrl.API_MODULE_KYC + "/pan";

  // Bank Verification - Step 1: Verify account
  static API_KYC_VERIFY_BANK = ServerUrl.API_MODULE_KYC + "/bank/verify";
  
  // Bank Verification - Step 2: Add recipient
  static API_KYC_ADD_BANK_RECIPIENT = ServerUrl.API_MODULE_KYC + "/bank/recipient";

  // Aadhaar Verification (future)
  static API_KYC_VERIFY_AADHAAR = ServerUrl.API_MODULE_KYC + "/aadhaar";

  // Traveler Action endpoints
  static API_TRAVELER_ACCEPT_REQUEST_BY_ID = (id) => `${ServerUrl.API_MODULE_TRAVELER}/requests/${id}/accept`;
  static API_TRAVELER_EXPRESS_INTEREST = (id) => `${ServerUrl.API_MODULE_TRAVELER}/requests/${id}/express-interest`;
  static API_TRAVELER_REJECT_REQUEST_BY_ID = (id) => `${ServerUrl.API_MODULE_TRAVELER}/requests/${id}/reject`;
  static API_TRAVELER_BOOKING_STATUS = (id) => `${ServerUrl.API_MODULE_TRAVELER}/booking/${id}/status`;
  static API_TRAVELER_BOOKING_OTP_VERIFY = (id) => `${ServerUrl.API_MODULE_TRAVELER}/booking/${id}/otp/verify`;

  // Admin endpoints
  static API_MODULE_ADMIN = "admin";
  static API_ADMIN_KYC_PENDING = ServerUrl.API_MODULE_ADMIN + "/kyc/pending";
  static API_ADMIN_KYC_APPROVE = ServerUrl.API_MODULE_ADMIN + "/kyc/approve";
  static API_ADMIN_USERS = ServerUrl.API_MODULE_ADMIN + "/users";
  static API_ADMIN_USER_DETAILS = (id) => `${ServerUrl.API_MODULE_ADMIN}/users/${id}`;
  static API_ADMIN_TRAVELER_DETAILS = (id) => `${ServerUrl.API_MODULE_ADMIN}/travelers/${id}`;
  static API_ADMIN_TRAVELERS = ServerUrl.API_MODULE_ADMIN + "/travelers";
  static API_ADMIN_BOOKINGS = ServerUrl.API_MODULE_ADMIN + "/bookings";
  static API_ADMIN_DISPUTES = ServerUrl.API_MODULE_ADMIN + "/disputes";
  static API_ADMIN_PAYMENTS = ServerUrl.API_MODULE_ADMIN + "/payments";
  static API_ADMIN_TRAVELER_KYC = ServerUrl.API_MODULE_ADMIN + "/travellers/kyc";
  static API_ADMIN_TRAVELER_KYC_UPDATE = (id) => `${ServerUrl.API_MODULE_ADMIN}/travellers/kyc/${id}`;
  // admin overview dashboard
  static API_ADMIN_DASHBOARD_OVERVIEW = ServerUrl.API_MODULE_ADMIN + "/dashboardoverview"; // for admin dashboard overview data

  // Admin Settings endpoints
  static API_ADMIN_SETTINGS_GET = (category) => `${ServerUrl.API_MODULE_ADMIN}/settings/${category}`;
  static API_ADMIN_SETTINGS_SAVE = ServerUrl.API_MODULE_ADMIN + "/settings/bulk-update";
  static API_ADMIN_EMAIL_TEMPLATES = ServerUrl.API_MODULE_ADMIN + "/settings/email-templates";
  static API_ADMIN_EMAIL_TEMPLATE_UPDATE = (id) => `${ServerUrl.API_MODULE_ADMIN}/settings/email-templates/${id}`;

  // Tracking endpoints
  static API_MODULE_TRACKING = "tracking";
  static API_TRACKING_UPDATE = ServerUrl.API_MODULE_TRACKING + "/location";
  static API_TRACKING_GET = (bookingId) => `${ServerUrl.API_MODULE_TRACKING}/${bookingId}`;
  static API_TRACKING_PUBLIC = (bookingId) => `${ServerUrl.API_MODULE_TRACKING}/public/${bookingId}`;
  static API_TRACKING_HISTORY_GET = (trackingId) => `${ServerUrl.API_MODULE_TRACKING}/history/${trackingId}`;
  static API_TRACKING_PROOF = ServerUrl.API_MODULE_TRACKING + "/proof";

  // places endpoints
  static API_MODULE_PLACES = "places";
  static API_PLACES_AUTOCOMPLETE    = ServerUrl.API_MODULE_PLACES + "/autocomplete";
  static API_PLACES_GEOCODE         = ServerUrl.API_MODULE_PLACES + "/geocode";
  static API_PLACES_REVERSE_GEOCODE = ServerUrl.API_MODULE_PLACES + "/reverse-geocode";
  static API_PLACES_MAPS_KEY        = ServerUrl.API_MODULE_PLACES + "/maps-key";
  static API_PLACES_DIRECTIONS      = ServerUrl.API_MODULE_PLACES + "/directions";

  // Dispute endpoints
  static API_MODULE_DISPUTE = "dispute";
  static API_DISPUTE_CREATE = ServerUrl.API_MODULE_DISPUTE;
  static API_DISPUTE_MY = ServerUrl.API_MODULE_DISPUTE + "/my";
  static API_DISPUTE_AGAINST_ME = ServerUrl.API_MODULE_DISPUTE + "/against-me";

  // Notification endpoints
  static API_MODULE_NOTIFICATIONS = "notifications";
  static API_NOTIFICATIONS_GET = ServerUrl.API_MODULE_NOTIFICATIONS;
  static API_NOTIFICATIONS_MARK_ONE_READ = (id) => `${ServerUrl.API_MODULE_NOTIFICATIONS}/${id}/read`;
  static API_NOTIFICATIONS_MARK_ALL_READ = ServerUrl.API_MODULE_NOTIFICATIONS + "/read-all";
  static API_NOTIFICATIONS_DELETE = (id) => `${ServerUrl.API_MODULE_NOTIFICATIONS}/${id}`;
}
export default ServerUrl;