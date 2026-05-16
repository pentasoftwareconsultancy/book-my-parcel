// src/constants/RoutePath.js

class RoutePath {

  // ==================== BASE ROUTES ====================
  static USER_BASE = "/user";
  static TRAVELER_BASE = "/traveler";
  static ADMIN_BASE = "/admin";

  // ==================== PUBLIC ROUTES ====================
  static PUBLIC_HOME = "/";
  static PUBLIC_ABOUT = "/about";
  static PUBLIC_SERVICES = "/services";
  static PUBLIC_TRAVELER_HOME = "/travelerhome";
  static PUBLIC_TERMSANDCONDITION = "/termsandcondition";
  static PUBLIC_TRACK = "/track/:id";         // public tracking page (no login needed)
  static PUBLIC_TRACK_BASE = "/track";        // used for navigation without a known ID

  //  ================= static pages ============
  static PUBLIC_CONTACT = "/contact";
  static PUBLIC_TRAVELERBENEFITS = "/traveler-benefits";
  static TravelerGuidelinese = "/traveler-guidelines"
  static PUBLIC_POLICY = "/policy"
  // static ADMIN_USERDETAILS ="/userdetails";

  // ==================== AUTH ROUTES ====================
  static AUTH_LOGIN = "/login";
  static AUTH_REGISTER = "/register";
  static AUTH_FORGOT_PASSWORD = "/forgot-password";
  static AUTH_TRAVELER_REGISTER = `${this.TRAVELER_BASE}/register`;
  static KYC_REGISTRATION = `${this.TRAVELER_BASE}/kyc/kycregistration`;

  // ==================== USER ROUTES ====================
  static USER_ALL_ORDERS = `${this.USER_BASE}/all-order`;
  static USER_ACTIVE = `${this.USER_BASE}/active`;
  static USER_COMPLETED = `${this.USER_BASE}/completed`;
  static USER_CANCELLED = `${this.USER_BASE}/cancelled`;
  static USER_REQUEST_FORM = `${this.USER_BASE}/request`;
  static USER_BOOKING_CONFIRMATION = `${this.USER_BASE}/booking-confirmation`;
  static USER_BOOKING_CANCLE = `${this.USER_BASE}/booking-cancel`;
  static USER_PROFILE = `${this.USER_BASE}/profile`;
  static USER_NOTIFICATIONS = `${this.USER_BASE}/notifications`;
  static USER_TRACK_PARCEL = `${this.USER_BASE}/track/:id`;
  static USER_TRACK_BASE = `${this.USER_BASE}/track`;
  static USER_PARCEL_DETAILS = `${this.USER_BASE}/parcel_details`;
  static USER_DISPUTE = `${this.USER_BASE}/dispute`;
  static USER_FEEDBACK = `${this.USER_BASE}/feedback/:bookingId`;
  static USER_FEEDBACK_BASE = `${this.USER_BASE}/feedback`;


  // ==================== TRAVELER ROUTES ====================
  static TRAVELER_DASHBOARD = `${this.TRAVELER_BASE}/dashboard`;
  static TRAVELER_AVAILABLE_REQUEST = `${this.TRAVELER_BASE}/available-request`;
  static TRAVELER_LIVE = `${this.TRAVELER_BASE}/live`;
  static TRAVELER_PICKUP_OTP = `${this.TRAVELER_BASE}/pickup-otp`;
  static TRAVELER_DROP_OTP = `${this.TRAVELER_BASE}/drop-otp`;
  static TRAVELER_DELIVERIES = `${this.TRAVELER_BASE}/deliveries`;
  static TRAVELER_COMPLETED = `${this.TRAVELER_BASE}/completed`;
  static TRAVELER_TRACK = `${this.TRAVELER_BASE}/track/:id`;
  static TRAVELER_PARCEL_DETAILS = `${this.TRAVELER_BASE}/parcel/:id`;
  static TRAVELER_PROFILE = `${this.TRAVELER_BASE}/profile`;
  static TRAVELER_KYC_PENDING = `${this.TRAVELER_BASE}/kyc-pending`;
  static TRAVELER_CANCELLED = `${this.TRAVELER_BASE}/cancelled`;
  static TRAVELLER_ROUTE = `${this.TRAVELER_BASE}/traveler-route`;
  static TRAVELLER_ROUTE2 = `${this.TRAVELER_BASE}/route2`;
  static TRAVELLER_ROUTE3 = `${this.TRAVELER_BASE}/route3`;
  static TRAVELER_MYROUTES = `${this.TRAVELER_BASE}/my-routes`;
  static TRAVELLER_EARNINGS = `${this.TRAVELER_BASE}/earnings`;
  static TRAVELLER_ROUTE_DETAILS = `${this.TRAVELER_BASE}/route-details`;
  static TRAVELLER_NOTIFICATIONS = `${this.TRAVELER_BASE}/notifications`;
  static TRAVELLER_REVIEWS = `${this.TRAVELER_BASE}/reviews`;
  static TRAVELLER_DISPUTE = `${this.TRAVELER_BASE}/dispute`;
  static TRAVELLER_DISPUTES_AGAINST_ME = `${this.TRAVELER_BASE}/disputes-against-me`;


  // ==================== ADMIN ROUTES ====================
  static ADMIN_OVERVIEW = `${this.ADMIN_BASE}/overview`;
  static ADMIN_USERMANAGEMENT = `${this.ADMIN_BASE}/user-management`;
  static ADMIN_TRAVELER = `${this.ADMIN_BASE}/traveler`;
  static ADMIN_BOOKINGS = `${this.ADMIN_BASE}/bookings`;
  static ADMIN_PAYMENTS = `${this.ADMIN_BASE}/payments`;
  static ADMIN_DASHBOARD_FULL = `${this.ADMIN_BASE}/dashboard`;
  static ADMIN_KYC = `${this.ADMIN_BASE}/kyc`;
  static ADMIN_DISPUTES = `${this.ADMIN_BASE}/disputes`;
  static ADMIN_SETTINGS = `${this.ADMIN_BASE}/settings`;

  static ADMIN_PROFILE = `${this.ADMIN_BASE}/profile`;
  static ADMIN_ANALYTICS = `${this.ADMIN_BASE}/analytics`;
  // static ADMIN_USERDETAILS = `${this.ADMIN_BASE }/userdetails`;
  // static ADMIN_USERDETAILS = `${this.ADMIN_BASE}/userdetails/:id`;
  static ADMIN_USERDETAILS = `${this.ADMIN_BASE}/userdetails/:id`;
  static ADMIN_TRAVELERDETAILS = `${this.ADMIN_BASE}/travelerdetails/:id`;
  static ADMIN_BOOKING_DETAILS = `${this.ADMIN_BASE}/bookingdetails/:id`;
  static ADMIN_USERDETAILS_OVERVIEW = `${this.ADMIN_BASE}/orderdetails/:id`;
  static ADMIN_USERDETAILS_BOOKINGS = `${this.ADMIN_BASE}/userdetails/:id/bookings`;
  static ADMIN_USERDETAILS_PAYMENTS = `${this.ADMIN_BASE}/userdetails/:id/payments`;
  static ADMIN_USERDETAILS_ACTIVITY = `${this.ADMIN_BASE}/userdetails/:id/activity`;
  static ADMIN_USERDETAILS_DOCUMENTS = `${this.ADMIN_BASE}/userdetails/:id/documents`;
  static ADMIN_NOTIFICATIONS = `${this.ADMIN_BASE}/adminnotifications`;



  // ==================== KYC ROUTES ====================

  static KYC_PAN = "/kyc/pan";
  static KYC_AADHAAR = "/kyc/aadhaar";
  static KYC_BANK = "/kyc/bank";  


  static UNAUTHORIZED = "/unauthorized";

}

export default RoutePath;
