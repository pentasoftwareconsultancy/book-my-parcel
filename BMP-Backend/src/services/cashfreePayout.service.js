/**
 * Cashfree Payout Service — v2 API
 *
 * Endpoints used:
 *   POST   /payout/beneficiary          — create/register a bank recipient
 *   GET    /payout/beneficiary/:id      — check if beneficiary already exists
 *   POST   /payout/transfers            — initiate bank transfer (async)
 *   GET    /payout/transfers/:id        — poll transfer status
 *
 * Auth: x-client-id + x-client-secret headers (Payout API keys, NOT PG keys)
 * Env:  CASHFREE_ENV=PRODUCTION → api.cashfree.com
 *       CASHFREE_ENV=SANDBOX    → sandbox.cashfree.com
 */

import axios from "axios";
import crypto from "crypto";

// ─── Config ───────────────────────────────────────────────────────────────────

const getBaseUrl = () =>
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/payout"
    : "https://sandbox.cashfree.com/payout";

const API_VERSION = "2024-01-01";

function getHeaders(body = null) {
  const clientId = process.env.CASHFREE_P_SECRET_ID?.trim();
  const clientSecret = process.env.CASHFREE_P_SECRET_KEY?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Cashfree payout credentials. Set CASHFREE_P_SECRET_ID and CASHFREE_P_SECRET_KEY in .env"
    );
  }

  const headers = {
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };

  // If IP is not whitelisted in Cashfree dashboard, sign the request body.
  // Set CASHFREE_PAYOUT_SIGN=true in .env to enable this.
  if (process.env.CASHFREE_PAYOUT_SIGN === "true" && body) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = timestamp + JSON.stringify(body);
    const signature = crypto
      .createHmac("sha256", clientSecret)
      .update(payload)
      .digest("base64");
    headers["x-cf-signature"] = signature;
    headers["x-cf-timestamp"] = timestamp;
  }

  return headers;
}

// ─── Sanitize beneficiary_id ──────────────────────────────────────────────────
// Cashfree allows only alphanumeric, underscore, pipe, dot — max 50 chars
function sanitizeBeneficiaryId(userId) {
  return `BEN_${userId.replace(/-/g, "")}`.slice(0, 50);
}

// ─── Sanitize beneficiary_name ────────────────────────────────────────────────
// Cashfree allows only alphabets and whitespaces — max 100 chars
function sanitizeName(name) {
  if (!name) return "Account Holder";
  return name.replace(/[^a-zA-Z\s]/g, "").trim().slice(0, 100) || "Account Holder";
}

// ─── CREATE BENEFICIARY ───────────────────────────────────────────────────────

export async function createBeneficiary(kyc) {
  const beneficiaryId = sanitizeBeneficiaryId(kyc.user_id);

  // Check if beneficiary already exists — avoid duplicate 422 errors
  try {
    const existing = await axios.get(
      `${getBaseUrl()}/beneficiary/${beneficiaryId}`,
      { headers: getHeaders() }
    );
    if (existing.data?.beneficiary_id) {
      console.log(`[Payout] Beneficiary already exists: ${beneficiaryId}`);
      return beneficiaryId;
    }
  } catch (err) {
    // 404 means not found — proceed to create
    if (err.response?.status !== 404) {
      console.warn("[Payout] Beneficiary check error (non-fatal):", err.response?.data || err.message);
    }
  }

  const name = sanitizeName(kyc.account_holder);

  if (!kyc.account_number || !kyc.ifsc) {
    throw new Error("Cannot create beneficiary: bank account number and IFSC are required");
  }

  const body = {
    beneficiary_id: beneficiaryId,
    beneficiary_name: name,
    beneficiary_instrument_details: {
      bank_account_number: kyc.account_number,
      bank_ifsc: kyc.ifsc.toUpperCase(),
    },
    beneficiary_contact_details: {
      // Use real user email/phone if available, fall back to support contact
      beneficiary_email: kyc.email || "support@bookmyparcel.com",
      beneficiary_phone: kyc.phone?.replace(/\D/g, "").slice(-10) || "9999999999",
      beneficiary_country_code: "+91",
    },
  };

  try {
    const response = await axios.post(
      `${getBaseUrl()}/beneficiary`,
      body,
      { headers: getHeaders(body) }
    );

    const data = response.data;
    console.log(`✅ [Payout] Beneficiary created: ${beneficiaryId} | status: ${data.beneficiary_status}`);

    if (data.beneficiary_status === "INVALID" || data.beneficiary_status === "FAILED") {
      throw new Error(`Beneficiary validation failed with status: ${data.beneficiary_status}`);
    }

    return beneficiaryId;
  } catch (error) {
    const errData = error.response?.data;

    // 422 = already exists — treat as success
    if (error.response?.status === 422 && errData?.code?.includes("already_exists")) {
      console.log(`[Payout] Beneficiary already exists (422): ${beneficiaryId}`);
      return beneficiaryId;
    }

    console.error("❌ [Payout] Beneficiary creation failed:", errData || error.message);
    throw new Error(errData?.message || error.message || "Beneficiary creation failed");
  }
}

// ─── TRANSFER TO BANK ─────────────────────────────────────────────────────────

export async function transferToBank(beneficiaryId, amount, transferId) {
  const transferAmount = Number(amount);

  if (!transferAmount || transferAmount <= 0) {
    throw new Error("Transfer amount must be a positive number");
  }

  // Cashfree transfer_id: alphanumeric + underscore, max 40 chars
  const safeTransferId = String(transferId).replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40);

  const body = {
    transfer_id: safeTransferId,
    transfer_amount: transferAmount,
    transfer_mode: "banktransfer", // IMPS/NEFT/RTGS — Cashfree auto-selects based on amount
    beneficiary_details: {
      beneficiary_id: String(beneficiaryId),
    },
  };

  console.log(`💰 [Payout] Initiating transfer: ₹${transferAmount} → ${beneficiaryId} | id: ${safeTransferId}`);

  try {
    const response = await axios.post(
      `${getBaseUrl()}/transfers`,
      body,
      { headers: getHeaders(body) }
    );

    const data = response.data;
    console.log(`✅ [Payout] Transfer initiated: status=${data.transfer_status} | cf_id=${data.cf_transfer_id || "—"}`);

    return data;
  } catch (error) {
    const errData = error.response?.data;
    console.error("❌ [Payout] Transfer failed:", errData || error.message);
    throw new Error(errData?.message || error.message || "Transfer failed");
  }
}

// ─── GET TRANSFER STATUS ──────────────────────────────────────────────────────

export async function getTransferStatus(transferId) {
  const safeTransferId = String(transferId).replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40);

  try {
    const response = await axios.get(
      `${getBaseUrl()}/transfers/${safeTransferId}`,
      { headers: getHeaders() }
    );

    return response.data;
  } catch (error) {
    const errData = error.response?.data;
    console.error("❌ [Payout] Transfer status check failed:", errData || error.message);
    throw new Error(errData?.message || error.message || "Transfer status check failed");
  }
}
