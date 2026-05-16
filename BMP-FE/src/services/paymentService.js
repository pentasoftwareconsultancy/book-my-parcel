import ApiInterceptor from "../core/services/interceptor.service";
import ServerUrl from "../core/constants/serverUrl.constant";

const API = ApiInterceptor.init();

// ─── Wallet Operations ─────────────────────────────────────────────────────
export const getWalletBalance = async () => {
  try {
    const response = await API.get(ServerUrl.API_WALLET_BALANCE);
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
};

export const getWalletDetails = async () => {
  try {
    const response = await API.get(ServerUrl.API_WALLET_DETAILS);
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    throw error;
  }
};

export const getWalletTransactions = async (limit = 50, offset = 0) => {
  try {
    const response = await API.get(ServerUrl.API_WALLET_TRANSACTIONS, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    throw error;
  }
};

// ─── KYC & Bank Status ─────────────────────────────────────────────────────
export const checkKYCBankStatus = async () => {
  try {
    const response = await API.get(ServerUrl.API_KYC_BANK_STATUS);
    return response.data;
  } catch (error) {
    console.error("Error checking KYC bank status:", error);
    throw error;
  }
};

// ─── Withdrawal Operations ────────────────────────────────────────────────
export const requestWithdrawal = async (amount) => {
  try {
    const response = await API.post(ServerUrl.API_WITHDRAWAL_REQUEST, {
      amount,
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    throw error.response?.data || error;
  }
};

export const getWithdrawalHistory = async (limit = 50, offset = 0) => {
  try {
    const response = await API.get(ServerUrl.API_WITHDRAWAL_HISTORY, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    throw error;
  }
};

export const getWithdrawalDetails = async (withdrawalId) => {
  try {
    const response = await API.get(ServerUrl.API_WITHDRAWAL_DETAILS(withdrawalId));
    return response.data;
  } catch (error) {
    console.error("Error fetching withdrawal details:", error);
    throw error;
  }
};

export const processWithdrawal = async (withdrawalId) => {
  try {
    const response = await API.post(ServerUrl.API_WITHDRAWAL_PROCESS(withdrawalId));
    return response.data;
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    throw error;
  }
};

// ─── TESTING ONLY: Bypass KYC ────────────────────────────────────────────
export const bypassKYCForTesting = async () => {
  try {
    const response = await API.post(ServerUrl.API_KYC_BYPASS);
    return response.data;
  } catch (error) {
    console.error("Error bypassing KYC:", error);
    throw error;
  }
};

// ─── Pay After Delivery - Pending Payments ─────────────────────────────────
export const getPendingPayments = async () => {
  try {
    const response = await API.get(ServerUrl.API_TRAVELER_DASHBOARD_PENDING_PAYMENTS);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    throw error;
  }
};

export const receivePayment = async (bookingId) => {
  try {
    const response = await API.post(ServerUrl.API_BOOKING_RECEIVE_PAYMENT(bookingId));
    return response.data;
  } catch (error) {
    console.error("Error receiving payment:", error);
    throw error.response?.data || error;
  }
};

// ─── Traveller Stats & Earnings ────────────────────────────────────────────
export const getTravellerStats = async () => {
  try {
    const response = await API.get(ServerUrl.API_TRAVELER_DASHBOARD_STATS);
    return response.data;
  } catch (error) {
    console.error("Error fetching traveller stats:", error);
    throw error;
  }
};

export default {
  getWalletBalance,
  getWalletDetails,
  getWalletTransactions,
  checkKYCBankStatus,
  requestWithdrawal,
  getWithdrawalHistory,
  getWithdrawalDetails,
  processWithdrawal,
  bypassKYCForTesting,
  getPendingPayments,
  receivePayment,
  getTravellerStats,
};
