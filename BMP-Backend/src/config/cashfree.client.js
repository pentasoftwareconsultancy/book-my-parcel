import axios from "axios";

const CASHFREE_API_VERSION = "2023-08-01";

function getCashfreeBaseUrl() {
  return process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "";
}

function getCashfreeHeaders() {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();

  if (!appId || !secretKey) {
    throw new Error("Missing Cashfree PG credentials (CASHFREE_APP_ID / CASHFREE_SECRET_KEY)");
  }

  return {
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": CASHFREE_API_VERSION,
    "Content-Type": "application/json",
  };
}

// Direct Cashfree PG API client — bypasses the cashfree-pg SDK entirely
// to avoid the SDK's environment-detection bugs in PM2 cluster mode.
export const cashfreeClient = {
  async createOrder(orderData) {
    const url = `${getCashfreeBaseUrl()}/orders`;
    console.log(`[Cashfree] Creating order → ${url} (ENV: ${process.env.CASHFREE_ENV})`);
    const response = await axios.post(url, orderData, { headers: getCashfreeHeaders() });
    return response.data;
  },

  async fetchOrder(orderId) {
    const url = `${getCashfreeBaseUrl()}/orders/${orderId}`;
    const response = await axios.get(url, { headers: getCashfreeHeaders() });
    return response.data;
  },

  async createRefund(orderId, refundData) {
    const url = `${getCashfreeBaseUrl()}/orders/${orderId}/refunds`;
    const response = await axios.post(url, refundData, { headers: getCashfreeHeaders() });
    return response.data;
  },
};

// Legacy compatibility shim — keeps existing getCashfree() call sites working
// but now returns the direct axios client instead of the SDK instance
export function getCashfree() {
  return {
    PGCreateOrder: (request) => cashfreeClient.createOrder(request).then(data => ({ data })),
    PGFetchOrder: (orderId) => cashfreeClient.fetchOrder(orderId).then(data => ({ data })),
    PGOrderCreateRefund: (orderId, refundData) => cashfreeClient.createRefund(orderId, refundData).then(data => ({ data })),
  };
}

export function resetCashfreeClient() {
  // no-op — no singleton to reset with direct client
}