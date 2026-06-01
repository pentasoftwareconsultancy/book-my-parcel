import ApiInterceptor from "./interceptor.service";
import ServerUrl from "../constants/serverUrl.constant";

class ApiService {
  // Axios instance
  static axiosInstance = ApiInterceptor.init();

  // ------------------ Auth APIs ---
  // ---------------
  // ------------------ Auth APIs ------------------

  static updateProfile(data) {
    return this.axiosInstance.put(
      ServerUrl.API_UPDATE_PROFILE,
      data
    );
  }

  // Auth APIs


  static getProfile() {
    return this.axiosInstance.get(ServerUrl.API_PROFILE);
  }

  static uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);
    return this.apipostForm(ServerUrl.API_PROFILE_PHOTO, formData);
  }

  static updateProfilePhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);
    return this.axiosInstance.put(ServerUrl.API_PROFILE_PHOTO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  static updatePassword(data) {
    return this.axiosInstance.put(ServerUrl.API_UPDATE_PASSWORD, data);
  }
  static requestOTP(phone) {
    return this.axiosInstance.post(ServerUrl.API_REQUEST_OTP, { phone });
  }

  static checkUserExists(data) {
    return this.axiosInstance.post(ServerUrl.API_CHECK_USER_EXISTS, data);
  }

  static verifyOTP(phone, otp, role) {
    return this.axiosInstance.post(ServerUrl.API_VERIFY_OTP, { phone, otp, role });
  }

  static loginWithEmailAndPassword(email, password, loginRole) {
    return this.axiosInstance.post(ServerUrl.API_LOGIN, { email, password, role: loginRole });
  }

  // Blacklists the current JWT on the backend so it cannot be reused after logout
  static logout() {
    return this.axiosInstance.post(ServerUrl.API_LOGOUT);
  }

  // ------------------ User APIs ------------------
  static createRequest(requestData) {
    return this.axiosInstance.post(ServerUrl.API_CREATE_REQUEST, requestData);
  }

  static getRequestById(id) {
    return this.axiosInstance.get(ServerUrl.API_GET_PARCEL_BY_ID(id));
  }

  static searchRequests(params) {
    return this.axiosInstance.get(ServerUrl.API_SEARCH_REQUESTS, { params });
  }

  static getActiveTravellers(params) {
    return this.axiosInstance.get(ServerUrl.API_USER_ACTIVE_TRAVELLEERS, { params });
  }

  // ------------------ Tracking APIs ----------------
  static getTracking(bookingId) {
    return this.axiosInstance.get(ServerUrl.API_TRACKING_GET(bookingId));
  }

  static getPublicTracking(bookingId) {
    // No auth header — uses public endpoint, safe for shared links.
    // Reads VITE_API_URL (single source of truth) with a dev-only localhost fallback.
    const baseURL =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://localhost:3000/api" : "");
    return fetch(`${baseURL}/${ServerUrl.API_TRACKING_PUBLIC(bookingId)}`).then(
      (r) => r.json().then((data) => ({ data }))
    );
  }

  static getUserInTransitParcels() {
    return this.axiosInstance.get(ServerUrl.API_USER_DASHBOARD_ORDERS, {
      params: { status: "IN_TRANSIT", page: 1, limit: 50 },
    });
  }


  // ------------------ Traveler APIs ------------------
  static getTravelerFeed(params) {
    return this.axiosInstance.get(ServerUrl.API_TRAVELER_FEED, { params });
  }

  static acceptMatch(matchId, data) {
    return this.axiosInstance.post(`${ServerUrl.API_TRAVELER_ACCEPT}/${matchId}`, data);
  }

  static verifyPickupOTP(data) {
    return this.axiosInstance.post(ServerUrl.API_BOOKING_VERIFY_PICKUP(data.bookingId), { otp: data.otp });
  }

  static verifyDropOTP(data) {
    return this.axiosInstance.post(ServerUrl.API_BOOKING_VERIFY_DELIVERY(data.bookingId), { otp: data.otp });
  }

  // ------------------ Booking OTP APIs ------------------
  static startPickup(bookingId) {
    return this.axiosInstance.post(ServerUrl.API_BOOKING_START_PICKUP(bookingId), {});
  }

  static verifyPickup(bookingId, otp) {
    return this.axiosInstance.post(ServerUrl.API_BOOKING_VERIFY_PICKUP(bookingId), { otp });
  }

  static startDelivery(bookingId) {
    return this.axiosInstance.post(ServerUrl.API_BOOKING_START_DELIVERY(bookingId), {});
  }

  static verifyDelivery(bookingId, otp) {
    return this.axiosInstance.post(ServerUrl.API_BOOKING_VERIFY_DELIVERY(bookingId), { otp });
  }

  // Get Parcel Details by ID
  static getParcelDetails(id) {
    return this.axiosInstance.get(ServerUrl.API_TRAVELER_PARCEL_DETAILS(id));
  }

  // Phase 3: Get all travellers who accepted a parcel
  static getParcelAcceptances(parcelId, sort, includePending = false) {
    let url = ServerUrl.API_PARCEL_ACCEPTANCES(parcelId);
    const params = [];

    if (sort) {
      params.push(`sort=${sort}`);
    }

    if (includePending) {
      params.push('include_pending=true');
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.apiget(url);
  }

  // Get route geometry for parcel acceptances (for map visualization)
  static getParcelRouteGeometry(parcelId) {
    return this.apiget(ServerUrl.API_PARCEL_ROUTE_GEOMETRY(parcelId));
  }

  // Phase 3: Sender selects a traveller for their parcel
  static selectTraveller(parcelId, travellerId, acceptancePrice) {
    const requestBody = {
      traveller_id: travellerId,
    };

    // Only include acceptance_price if it's a valid number
    if (acceptancePrice !== null && acceptancePrice !== undefined && typeof acceptancePrice === 'number') {
      requestBody.acceptance_price = acceptancePrice;
    }

    return this.apipost(ServerUrl.API_PARCEL_SELECT_TRAVELLER(parcelId), requestBody);
  }

  // Phase 3: Get all parcel requests for the logged-in traveller
  static getTravellerRequests(params = {}) {
    return this.apiget(ServerUrl.API_TRAVELER_REQUESTS, params);
  }

  // Get available requests for traveller (alias for getTravellerRequests)
  static getAvailableRequests(params = {}) {
    return this.getTravellerRequests(params);
  }

  // Phase 3: Traveller accepts a specific request
  static acceptParcelRequest(requestId) {
    return this.apipost(ServerUrl.API_TRAVELER_ACCEPT_REQUEST(requestId), {});
  }

  // ------------------ Traveler KYC ------------------
  static submitTravelerKYC(formData) {
    return this.apipostForm(ServerUrl.API_TRAVELER_KYC, formData);
  }

  // Get My KYC Details
  static getTravelerKYC() {
    return this.axiosInstance.get(ServerUrl.API_TRAVELER_KYC);
  }

  // Update KYC Status (PATCH)
  static updateTravelerKYCStatus(id, statusData) {
    return this.axiosInstance.patch(
      ServerUrl.API_TRAVELER_KYC_STATUS(id),
      statusData
    );
  }

  // Update KYC Details (PUT)
  static updateTravelerKYC(formData) {
    return this.axiosInstance.put(
      ServerUrl.API_TRAVELER_KYC_UPDATE,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  }

  // ------------------ KYC Verification APIs ------------------

// PAN Verification
static verifyPan(data) {
  return this.axiosInstance.post(ServerUrl.API_KYC_VERIFY_PAN, data);
}

// Bank Verification - Step 1: Verify bank account
static verifyBankAccount(data) {
  return this.axiosInstance.post(ServerUrl.API_KYC_VERIFY_BANK, data);
}

// Bank Verification - Step 2: Add recipient details
static addBankRecipient(data) {
  return this.axiosInstance.post(ServerUrl.API_KYC_ADD_BANK_RECIPIENT, data);
}

// Aadhaar Verification (future ready)
static verifyAadhaar(data) {
  return this.axiosInstance.post(ServerUrl.API_KYC_VERIFY_AADHAAR, data);
}

  // Get All KYC Submissions (Admin)
  static getAllTravelerKYC(params) {
    return this.axiosInstance.get(
      ServerUrl.API_TRAVELER_KYC_ALL,
      { params }
    );
  }

  // Traveler Route APIs
  static createRoute(routeData) {
    return this.axiosInstance.post(ServerUrl.API_TRAVELER_ROUTES, routeData);
  }

  static getMyRoutes(params) {
    return this.axiosInstance.get(ServerUrl.API_TRAVELER_ROUTES, {
      params: { ...params, _t: Date.now() }, // cache-bust
    });
  }

  static getRouteById(id) {
    return this.axiosInstance.get(ServerUrl.API_TRAVELER_ROUTE_BY_ID(id));
  }

  static updateRoute(id, routeData) {
    return this.axiosInstance.put(ServerUrl.API_TRAVELER_ROUTE_BY_ID(id), routeData);
  }

  static deleteRoute(id) {
    return this.axiosInstance.delete(ServerUrl.API_TRAVELER_ROUTE_BY_ID(id));
  }

  // ──────────────── Cancellation APIs ────────────────
  // Cancel parcel (User cancels their own parcel)
  static cancelParcel(parcelId, cancelData = {}) {
    return this.axiosInstance.post(ServerUrl.API_PARCEL_CANCEL(parcelId), cancelData);
  }

  // Cancel booking (Traveller cancels the booking)
  static cancelBooking(bookingId, cancelData = {}) {
    return this.axiosInstance.post(ServerUrl.API_BOOKING_CANCEL(bookingId), cancelData);
  }

  // ------------------ Admin APIs ------------------
  static getPendingKYCs(params) {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_TRAVELER_KYC, { params });
  }

  static getDashboardOverview() {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_DASHBOARD_OVERVIEW);
  }

  static getAdminSettings(category) {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_SETTINGS_GET(category));
  }

  static saveAdminSettings(category, settings) {
    return this.axiosInstance.post(ServerUrl.API_ADMIN_SETTINGS_SAVE, { category, settings });
  }

  static getEmailTemplates() {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_EMAIL_TEMPLATES);
  }

  static updateEmailTemplate(id, data) {
    return this.axiosInstance.put(ServerUrl.API_ADMIN_EMAIL_TEMPLATE_UPDATE(id), data);
  }

  static approveKYC(kycId) {
    return this.axiosInstance.patch(ServerUrl.API_ADMIN_TRAVELER_KYC_UPDATE(kycId), { status: "APPROVED" });
  }

  static getAllUsers(params) {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_USERS, { params });
  }

  static getAdminUserDetails(id) {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_USER_DETAILS(id));
  }

  static getAdminTravelerDetails(id) {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_TRAVELER_DETAILS(id));
  }

  static getAllTravelers(params) {
    return this.axiosInstance.get(ServerUrl.API_ADMIN_TRAVELER_KYC, { params });
  }

static getAdminDisputes(params) {
  return this.axiosInstance.get(ServerUrl.API_ADMIN_DISPUTES,{ params });
}

static getAdminPayments() {
  return this.axiosInstance.get(ServerUrl.API_ADMIN_PAYMENTS);
}

// (Optional) Update dispute status
static updateDisputeStatus(disputeId, data) {
  return this.axiosInstance.patch(
    `${ServerUrl.API_ADMIN_DISPUTES}/${disputeId}`,
    data
  );
}

  // ------------------ Tracking APIs ------------------
  static updateLocation(data) {
    return this.axiosInstance.patch(ServerUrl.API_TRACKING_UPDATE, data);
  }

  // ------------------ External APIs ------------------
  // ------------------ External APIs ------------------
  static async geocodeAddress(address, placeId = "") {
    try {
      const url = placeId
        ? `${ServerUrl.API_PLACES_GEOCODE}?address=${encodeURIComponent(address)}&placeId=${placeId}`
        : `${ServerUrl.API_PLACES_GEOCODE}?address=${encodeURIComponent(address)}`;
      const response = await this.axiosInstance.get(url);
      return { data: response.data };
    } catch (error) {
      console.error('Geocoding API error:', error);
      throw error;
    }
  }

  static async getPlacesAutocomplete(input) {
    return this.axiosInstance.get(
      `${ServerUrl.API_PLACES_AUTOCOMPLETE}?input=${encodeURIComponent(input)}`
    );
  }

  // Fetches the Google Maps JS API key from the backend (never stored in frontend .env)
  static async getMapsKey() {
    const res = await this.axiosInstance.get(ServerUrl.API_PLACES_MAPS_KEY);
    return res.data?.key || null;
  }

  // Proxies a directions request through the backend (avoids exposing Directions API key on client)
  // travelMode: "DRIVE" | "TWO_WHEELER" | "WALK"
  static async getDirections(origin, destination, travelMode = "DRIVE") {
    const res = await this.axiosInstance.post(ServerUrl.API_PLACES_DIRECTIONS, {
      origin,
      destination,
      travelMode,
    });
    return res.data;
  }

  // ------------------ Chat APIs ------------------
  static getChatHistory(bookingId, limit = 100, offset = 0) {
    return this.axiosInstance.get(ServerUrl.API_BOOKING_CHAT(bookingId), {
      params: { limit, offset },
    });
  }

  // ------------------ Delivery Attempt APIs ------------------
  static logDeliveryAttempt(bookingId, data, photoFile = null) {
    const formData = new FormData();
    formData.append("booking_id", bookingId);
    formData.append("reason", data.reason || "recipient_unavailable");
    if (data.notes) formData.append("notes", data.notes);
    if (data.rescheduled_at) formData.append("rescheduled_at", data.rescheduled_at);
    if (photoFile) formData.append("attempt_photo", photoFile);
    return this.apipostForm(ServerUrl.API_BOOKING_DELIVERY_ATTEMPT(bookingId), formData);
  }

  static getDeliveryAttempts(bookingId) {
    return this.axiosInstance.get(ServerUrl.API_BOOKING_DELIVERY_ATTEMPTS(bookingId));
  }

  // ------------------ Referral APIs ------------------
  static getReferralStats() {
    return this.axiosInstance.get(ServerUrl.API_USER_REFERRAL_STATS);
  }

  // ------------------ Proof of Delivery APIs ------------------
  static uploadProof(bookingId, type, photoFile) {
    const formData = new FormData();
    formData.append("booking_id", bookingId);
    formData.append("type", type); // "PICKUP" | "DELIVERY"
    formData.append("proof_photo", photoFile);
    return this.apipostForm(ServerUrl.API_TRACKING_PROOF, formData);
  }

  // ------------------ Notification APIs ------------------
  static getNotifications(role, page = 1, limit = 20) {
    return this.axiosInstance.get(ServerUrl.API_NOTIFICATIONS_GET, {
      params: { role, page, limit },
    });
  }

  static markNotificationRead(id) {
    return this.axiosInstance.patch(ServerUrl.API_NOTIFICATIONS_MARK_ONE_READ(id));
  }

  static markAllNotificationsRead(role) {
    return this.axiosInstance.patch(ServerUrl.API_NOTIFICATIONS_MARK_ALL_READ, { role });
  }

  static deleteNotification(id) {
    return this.axiosInstance.delete(ServerUrl.API_NOTIFICATIONS_DELETE(id));
  }

  // ------------------ Generic Methods ------------------
  static apiget(url, params = {}) {
    return this.axiosInstance.get(url, { params });
  }

  static apipost(url, body) {
    return this.axiosInstance.post(url, body);
  }

  static apiput(url, body) {
    return this.axiosInstance.put(url, body);
  }

  static apipatch(url, body) {
    return this.axiosInstance.patch(url, body);
  }

  static apidelete(url) {
    return this.axiosInstance.delete(url);
  }

  // ------------------ File / Image Upload ------------------
  static apipostForm(url, formData, config = {}) {
    return this.axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
  }

  // ------------------ Fetch Image as Base64 ------------------
  static async fetchImageAsBase64(url) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to convert image to Base64:", err);
      return null;
    }
  }
}

export default ApiService;
