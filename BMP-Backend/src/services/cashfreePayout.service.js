import axios from "axios";

const BASE_URL =
  process.env.CASHFREE_ENV === "sandbox"
    ? "https://sandbox.cashfree.com/payout"
    : "https://api.cashfree.com/payout"; // ✅ FIX: production fallback

const headers = {
  "X-Client-Id": process.env.CASHFREE_P_SECRET_ID.trim(),
  "X-Client-Secret": process.env.CASHFREE_P_SECRET_KEY.trim(),
  "X-Api-Version": "2022-09-01",
  "Content-Type": "application/json",
};

console.log("Cashfree Env:", process.env.CASHFREE_ENV);
console.log("Client ID:", process.env.CASHFREE_P_SECRET_ID);
console.log("Secret Loaded:", !!process.env.CASHFREE_P_SECRET_KEY);



// ─────────────────────────────────────────────
// CREATE BENEFICIARY
// ─────────────────────────────────────────────
export async function createBeneficiary(kyc) {
  const beneficiaryId = `BEN_${kyc.user_id}`;

  try {
    const response = await axios.post(
      `${BASE_URL}/beneficiaries`, // ✅ FIXED (singular endpoint)
      {
        beneId: beneficiaryId,
        name: kyc.account_holder,
        email: "support@bookmyparcel.com",
        phone: "9999999999",
        bankAccount: kyc.account_number,
        ifsc: kyc.ifsc,
      },
      { headers }
    );

    const data = response.data;

    console.log("🟢 Cashfree Beneficiary Response:", data);

    // 🔥 IMPORTANT: validate response
    if (data?.status === "ERROR") {
      throw new Error(data?.message || "Beneficiary creation failed");
    }

    // ✅ RETURN ONLY STRING (VERY IMPORTANT FIX)
    return beneficiaryId;

  } catch (error) {
    console.error(
      "❌ Beneficiary Error:",
      error.response?.data || error.message
    );

    if (
      error.response?.data?.message?.toLowerCase()?.includes("already")
    ) {
      return beneficiaryId;
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Beneficiary creation failed"
    );
  }
}



// ─────────────────────────────────────────────
// TRANSFER MONEY
// ─────────────────────────────────────────────
export async function transferToBank(beneficiaryId, amount, transferId) {
  try {
    console.log("DEBUG withdrawal.amount:", withdrawal.amount);
console.log("TYPE:", typeof withdrawal.amount);
    const transferAmount = Number(amount);

    console.log("💰 Cashfree Transfer Debug:", {
      beneficiaryId,
      transferAmount,
      transferId,
    });

    if (!Number.isFinite(transferAmount) || transferAmount < 1) {
      throw new Error(`Invalid transfer amount: ${transferAmount}`);
    }

    const response = await axios.post(
      `${BASE_URL}/transfers`,
      {
        beneId: String(beneficiaryId),
        transferId: String(transferId),

        // 🔥 CASHFREE EXPECTS THIS KEY
        transferAmount: transferAmount,

        // optional but recommended
        transferMode: "IMPS",
      },
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