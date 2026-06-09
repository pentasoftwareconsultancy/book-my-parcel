import axios from "axios";

const BASE_URL =
  process.env.CASHFREE_ENV === "sandbox"
    ? "https://sandbox.cashfree.com/payout"
    : "https://api.cashfree.com/payout"; // ✅ FIX: production fallback

const headers = {
  "X-Client-Id": process.env.CASHFREE_P_SECRET_ID.trim(),
  "X-Client-Secret": process.env.CASHFREE_P_SECRET_KEY.trim(),
  "X-Api-Version": "2024-01-01",
  "Content-Type": "application/json",
};

console.log("Cashfree Env:", process.env.CASHFREE_ENV);
console.log(
  "Client ID:",
  `[${process.env.CASHFREE_P_SECRET_ID}]`
);

console.log(
  "Client Secret:",
  `[${process.env.CASHFREE_P_SECRET_KEY}]`
);

// ─────────────────────────────────────────────
// CREATE BENEFICIARY
// ─────────────────────────────────────────────
export async function createBeneficiary(kyc) {
  const beneficiaryId = `BEN_${kyc.user_id.replace(/-/g, "_")}`;

  try {
    const payload = {
      beneficiary_id: beneficiaryId,
      beneficiary_name: kyc.account_holder,

      beneficiary_instrument_details: {
        bank_account_number: kyc.account_number,
        bank_ifsc: kyc.ifsc,
      },

      beneficiary_contact_details: {
        beneficiary_email: kyc.email || "support@bookmyparcel.com",
        beneficiary_phone: kyc.phone || "9999999999",
      },
    };

    const response = await axios.post(
      `${BASE_URL}/beneficiary`,
      payload,
      { headers }
    );

    const data = response.data;

    console.log("🟢 Cashfree Beneficiary Response:", data);

    if (data?.status === "ERROR") {
      throw new Error(data?.message || "Beneficiary creation failed");
    }

    return beneficiaryId;
  } catch (error) {
    console.error("❌ Beneficiary Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
}

// ─────────────────────────────────────────────
// TRANSFER MONEY
// ─────────────────────────────────────────────
export async function transferToBank(beneficiaryId, amount, transferId) {
  try {
    const transferAmount = Number(amount);

    const payload = {
      transfer_id: String(transferId),
      transfer_amount: transferAmount,

      beneficiary_details: {
        beneficiary_id: String(beneficiaryId),
      },
    };

    console.log("💰 Transfer Payload:", payload);

    const response = await axios.post(
      `${BASE_URL}/transfers`,
      payload,
      { headers }
    );

    console.log("🟢 Cashfree Transfer Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "❌ Cashfree Transfer Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Transfer failed"
    );
  }
}