import axios from "axios";

const getCashfreeBaseUrl = () =>
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/payout"
    : "https://sandbox.cashfree.com/payout";

const getCashfreeHeaders = () => {
  const clientId = process.env.CASHFREE_P_SECRET_ID?.trim();
  const clientSecret = process.env.CASHFREE_P_SECRET_KEY?.trim();
  const missingKeys = [];

  if (!clientId) missingKeys.push("CASHFREE_P_SECRET_ID");
  if (!clientSecret) missingKeys.push("CASHFREE_P_SECRET_KEY");

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Cashfree payout environment variable(s): ${missingKeys.join(", ")}. ` +
        "Add them to .env or set them in the runtime environment."
    );
  }

  return {
    "X-Client-Id": clientId,
    "X-Client-Secret": clientSecret,
    "X-Api-Version": "2024-01-01",
    "Content-Type": "application/json",
  };
};

const logCashfreeConfig = () => {
  console.log("Cashfree Env:", process.env.CASHFREE_ENV || "PRODUCTION");
  console.log("Client ID:", `[SET]`);
  console.log("Client Secret:", `[SET]`);
};

logCashfreeConfig();

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
      `${getCashfreeBaseUrl()}/beneficiary`,
      payload,
      { headers: getCashfreeHeaders() }
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
      `${getCashfreeBaseUrl()}/transfers`,
      payload,
      { headers: getCashfreeHeaders() }
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