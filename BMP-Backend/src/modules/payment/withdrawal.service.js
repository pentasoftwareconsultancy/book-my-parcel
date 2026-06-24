import sequelize from "../../config/database.config.js";
import Withdrawal from "./withdrawal.model.js";
import TravellerKYC from "../kyc/travellerKyc.model.js";
import { debitWalletService, getWalletBalanceService } from "./wallet.service.js";
import { createBeneficiary } from "../../services/cashfreePayout.service.js";
import { transferToBank, getTransferStatus } from "../../services/cashfreePayout.service.js";

// Mirror the same ID format used in cashfreePayout.service.js
function sanitizeBeneficiaryId(userId) {
  return `BEN_${userId.replace(/-/g, "")}`.slice(0, 50);
}
import { getSetting } from "../../redis/cache/platformSettingsCache.service.js";

// Minimum withdrawal amount — loaded from platform_settings via cache service.
// Default: ₹100 (overridden by DB value at runtime).
// Update via admin panel → Platform Settings → minimum_withdrawal_amount.
let MINIMUM_WITHDRAWAL = 100;

// Load from platform_settings at startup (non-blocking — falls back to default)
async function loadWithdrawalSettings() {
  try {
    const value = await getSetting("minimum_withdrawal_amount", "100");
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      MINIMUM_WITHDRAWAL = parsed;
      console.log(`[Withdrawal] Minimum withdrawal loaded: ₹${MINIMUM_WITHDRAWAL}`);
    }
  } catch {
    // Redis/DB not ready yet — use default silently
  }
}
loadWithdrawalSettings();



// ─── Check if KYC is Complete and Bank Verified ────────────────────────────
export async function checkKYCCompleteService(userId) {
  try {
    const kyc = await TravellerKYC.findOne({
      where: { user_id: userId },
      attributes: ["id", "status", "bank_verified", "account_number", "bank_name", "ifsc"],
    });

    if (!kyc) {
      return {
        isComplete: false,
        status: "NOT_STARTED",
        bank_verified: false,
        message: "KYC not started. Complete KYC to enable withdrawals.",
      };
    }

    if (kyc.status !== "APPROVED") {
      return {
        isComplete: false,
        status: kyc.status,
        bank_verified: kyc.bank_verified,
        message: `KYC is ${kyc.status}. Wait for approval or update details.`,
      };
    }

    if (!kyc.bank_verified) {
      return {
        isComplete: false,
        status: kyc.status,
        bank_verified: false,
        message: "Bank details not verified. Update and verify bank account.",
      };
    }

    return {
      isComplete: true,
      status: kyc.status,
      bank_verified: true,
      kycId: kyc.id,
      bankData: {
        account_number: kyc.account_number,
        bank_name: kyc.bank_name,
        ifsc: kyc.ifsc,
      },
      message: "KYC complete. Ready to withdraw.",
    };
  } catch (error) {
    console.error("❌ [Withdrawal] Error in checkKYCCompleteService:", error.message);
    throw error;
  }
}

// ─── Request Withdrawal ──────────────────────────────────────────────────────
export async function requestWithdrawalService(userId, amount) {
  const t = await sequelize.transaction();

  try {
    const withdrawAmount = Number(amount);
    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      throw new Error("Withdrawal amount must be a positive number.");
    }

    // Check KYC status
    const kycCheck = await checkKYCCompleteService(userId);
    if (!kycCheck.isComplete) {
      throw new Error(kycCheck.message);
    }

    // Validate amount
    if (withdrawAmount < MINIMUM_WITHDRAWAL) {
      throw new Error(
        `Minimum withdrawal amount is ₹${MINIMUM_WITHDRAWAL}. You requested ₹${withdrawAmount}`
      );
    }

    // Check wallet balance — use SELECT FOR UPDATE to prevent double-withdrawal race
    const Wallet = (await import("./wallet.model.js")).default;
    const wallet = await Wallet.findOne({
      where: { user_id: userId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    const currentBalance = wallet ? Number(wallet.balance) : 0;
    if (currentBalance < withdrawAmount) {
      throw new Error(
        `Insufficient balance. Available: ₹${currentBalance}, Requested: ₹${withdrawAmount}`
      );
    }

    // Get bank details
    const kyc = await TravellerKYC.findOne({
      where: { user_id: userId },
      attributes: ["account_number", "bank_name", "ifsc", "account_holder"],
    });

    // Create withdrawal request
    const withdrawal = await Withdrawal.create(
      {
        user_id: userId,
        amount: withdrawAmount,
        status: "PENDING",
        bank_account_id: kyc.account_number,
        bank_name: kyc.bank_name,
        ifsc_code: kyc.ifsc,
        account_holder: kyc.account_holder,
      },
      { transaction: t }
    );

    await t.commit();

    console.log(
      `✅ [Withdrawal] Request created: ₹${withdrawAmount} from user ${userId}`
    );
    console.log(
      `   Bank: ${kyc.bank_name} | Account: ***${kyc.account_number.slice(-4)}`
    );

    return {
      withdrawal_id: withdrawal.id,
      amount: withdrawAmount,
      status: withdrawal.status,
      requested_at: withdrawal.requested_at,
      bank_details: {
        bank_name: kyc.bank_name,
        account_ending: `***${kyc.account_number.slice(-4)}`,
      },
    };
  } catch (error) {
    await t.rollback();
    console.error("❌ [Withdrawal] Error in requestWithdrawalService:", error.message);
    throw error;
  }
}

// ─── Process Withdrawal (Transfer to Bank) ──────────────────────────────────
export async function processWithdrawalService(withdrawalId) {
  const t = await sequelize.transaction();

  try {
    const withdrawal = await Withdrawal.findByPk(withdrawalId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!withdrawal) {
      throw new Error(`Withdrawal request not found: ${withdrawalId}`);
    }

    if (withdrawal.status !== "PENDING") {
      throw new Error(
        `Cannot process withdrawal with status: ${withdrawal.status}`
      );
    }

    // Update status to PROCESSING
    await withdrawal.update(
      { status: "PROCESSING" },
      { transaction: t }
    );

    // Debit from wallet with same transaction
    try {
      await debitWalletService(
        withdrawal.user_id,
        withdrawal.amount,
        `Withdrawal to ${withdrawal.bank_name}`,
        t  // Pass the transaction
      );
    } catch (walletError) {
      // Wallet debit failed, revert status
      await withdrawal.update(
        {
          status: "FAILED",
          failure_reason: walletError.message
        },
        { transaction: t }
      );
      throw walletError;
    }

    // Get KYC + user contact details for beneficiary creation
    const kyc = await TravellerKYC.findOne({
      where: { user_id: withdrawal.user_id },
      include: [{
        model: (await import("../user/user.model.js")).default,
        as: "User",
        attributes: ["email", "phone_number"],
      }],
    });

    // Enrich KYC with user contact so beneficiary has real email/phone
    if (kyc && kyc.User) {
      kyc.email = kyc.User.email;
      kyc.phone = kyc.User.phone_number;
    }

    let beneficiaryId = sanitizeBeneficiaryId(kyc.user_id);

    try {
      beneficiaryId = await createBeneficiary(kyc);
    } catch (error) {
      if (
        error.message.includes("beneficiary_id already exists")
      ) {
        console.log(
          `Beneficiary already exists: ${beneficiaryId}`
        );
      } else {
        throw error;
      }
    }

    const payout = await transferToBank(
      beneficiaryId,
      Number(withdrawal.amount),
      withdrawal.id
    );

    const transactionId =
      payout?.cf_transfer_id ||
      payout?.data?.cf_transfer_id ||
      payout?.transfer_id ||
      payout?.data?.transfer_id;

    const payoutStatus = payout?.transfer_status || payout?.data?.transfer_status || "ACCEPTED";

    // Map Cashfree async status to our internal status
    // ACCEPTED / RECEIVED = transfer is queued, will settle within minutes
    // SUCCESS = already settled (rare for async)
    // FAILED = transfer failed
    const withdrawalStatus = ["SUCCESS", "SETTLED"].includes(payoutStatus)
      ? "SUCCESS"
      : payoutStatus === "FAILED"
        ? "FAILED"
        : "PROCESSING"; // ACCEPTED/RECEIVED = still in flight

    // Update withdrawal status
    await withdrawal.update(
      {
        status: withdrawalStatus,
        beneficiary_id: beneficiaryId,
        cashfree_transfer_id: transactionId,
        transaction_id: transactionId,
        processed_at: new Date(),
        ...(payoutStatus === "FAILED" && { failure_reason: payout?.transfer_message || "Transfer failed at Cashfree" }),
      },
      { transaction: t }
    );

    await t.commit();

    console.log(`✅ [Withdrawal] Processed: ₹${withdrawal.amount} | status: ${withdrawalStatus} | cf_id: ${transactionId}`);

    return {
      withdrawal_id: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawalStatus,
      transaction_id: transactionId,
      processed_at: withdrawal.processed_at,
      message: withdrawalStatus === "SUCCESS"
        ? "Withdrawal processed. Money will reach your account shortly."
        : "Withdrawal accepted. Money will reach your account in 1-2 business days.",
    };
  } catch (error) {
    await t.rollback();
    console.error("❌ [Withdrawal] Error in processWithdrawalService:", error.message);
    throw error;
  }
}

// ─── Get Withdrawal History ──────────────────────────────────────────────────
export async function getWithdrawalHistoryService(userId, limit = 50, offset = 0) {
  try {
    const withdrawals = await Withdrawal.findAndCountAll({
      where: { user_id: userId },
      attributes: [
        "id",
        "amount",
        "status",
        "bank_name",
        "requested_at",
        "processed_at",
        "transaction_id",
      ],
      order: [["requested_at", "DESC"]],
      limit,
      offset,
    });

    return {
      withdrawals: withdrawals.rows,
      total: withdrawals.count,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(withdrawals.count / limit),
      },
    };
  } catch (error) {
    console.error(
      "❌ [Withdrawal] Error in getWithdrawalHistoryService:",
      error.message
    );
    throw error;
  }
}

// ─── Get a Single Withdrawal ─────────────────────────────────────────────────
export async function getWithdrawalDetailsService(withdrawalId, userId = null) {
  try {
    const withdrawal = await Withdrawal.findOne({
      where: userId ? { id: withdrawalId, user_id: userId } : { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new Error(`Withdrawal not found: ${withdrawalId}`);
    }

    return {
      withdrawal_id: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
      bank_details: {
        bank_name: withdrawal.bank_name,
        ifsc: withdrawal.ifsc_code,
        account_holder: withdrawal.account_holder,
        account_ending: `***${withdrawal.bank_account_id.slice(-4)}`,
      },
      dates: {
        requested_at: withdrawal.requested_at,
        processed_at: withdrawal.processed_at,
      },
      transaction_id: withdrawal.transaction_id,
      failure_reason: withdrawal.failure_reason,
    };
  } catch (error) {
    console.error(
      "❌ [Withdrawal] Error in getWithdrawalDetailsService:",
      error.message
    );
    throw error;
  }
}

export default {
  checkKYCCompleteService,
  requestWithdrawalService,
  processWithdrawalService,
  getWithdrawalHistoryService,
  getWithdrawalDetailsService,
};
