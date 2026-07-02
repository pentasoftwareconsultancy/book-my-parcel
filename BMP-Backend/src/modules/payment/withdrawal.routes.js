import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generalLimiter, sensitiveLimiter } from "../../middlewares/rateLimit.middleware.js";
import { withIdempotency } from "../../middlewares/idempotency.middleware.js";
import { requireAdmin } from "../../middlewares/role.middleware.js";
import {
  checkKYCCompleteService,
  requestWithdrawalService,
  processWithdrawalService,
  getWithdrawalHistoryService,
  getWithdrawalDetailsService,
} from "./withdrawal.service.js";
import {
  getWalletBalanceService,
  getWalletDetailsService,
  getWalletTransactionsService,
} from "./wallet.service.js";

const router = express.Router();

/**
 * @swagger
 * /api/payment/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     description: Get current wallet balance for authenticated user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 balance:
 *                   type: number
 *                 wallet_id:
 *                   type: string
 */

/**
 * @swagger
 * /api/payment/wallet/details:
 *   get:
 *     summary: Get wallet details
 *     description: Get detailed wallet information
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details retrieved
 */

/**
 * @swagger
 * /api/payment/wallet/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     description: Get transaction history for wallet
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Transactions retrieved
 */

/**
 * @swagger
 * /api/payment/kyc/bank-status:
 *   get:
 *     summary: Check KYC status
 *     description: Check KYC and bank verification status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status retrieved
 */

/**
 * @swagger
 * /api/payment/withdrawal/request:
 *   post:
 *     summary: Request withdrawal
 *     description: Create a withdrawal request from wallet
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Withdrawal requested
 */

/**
 * @swagger
 * /api/payment/withdrawal/history:
 *   get:
 *     summary: Get withdrawal history
 *     description: Get all withdrawal requests history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Withdrawal history retrieved
 */

/**
 * @swagger
 * /api/payment/withdrawal/{id}:
 *   get:
 *     summary: Get withdrawal details
 *     description: Get details of a specific withdrawal
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdrawal details retrieved
 */

/**
 * @swagger
 * /api/payment/withdrawal/{id}/process:
 *   post:
 *     summary: Process withdrawal (Admin)
 *     description: Process a pending withdrawal request (Admin only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdrawal processed
 */

function parsePagination(query) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
}

// ─── Get Wallet Balance ───────────────────────────────────────────────────
router.get("/wallet/balance", authMiddleware, generalLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await getWalletBalanceService(userId);

    res.status(200).json({
      success: true,
      balance: balance.balance,
      wallet_id: balance.wallet_id,
    });
  } catch (error) {
    console.error("❌ Error getting wallet balance:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance",
      error: error.message,
    });
  }
});

// ─── Get Wallet Details ──────────────────────────────────────────────────
router.get("/wallet/details", authMiddleware, generalLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const details = await getWalletDetailsService(userId);

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error("❌ Error getting wallet details:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet details",
      error: error.message,
    });
  }
});

// ─── Get Wallet Transactions ─────────────────────────────────────────────
router.get("/wallet/transactions", authMiddleware, generalLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = parsePagination(req.query);

    const result = await getWalletTransactionsService(userId, limit, offset);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error getting wallet transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet transactions",
      error: error.message,
    });
  }
});

// ─── Check KYC and Bank Verification Status ───────────────────────────────
router.get("/kyc/bank-status", authMiddleware, generalLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const kycStatus = await checkKYCCompleteService(userId);

    res.status(200).json({
      success: true,
      data: kycStatus,
    });
  } catch (error) {
    console.error("❌ Error checking KYC status:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to check KYC status",
      error: error.message,
    });
  }
});

// ─── TESTING ONLY: Bypass KYC for Development ────────────────────────────
// Requires ADMIN role on top of the NODE_ENV check below — a misconfigured/missing
// NODE_ENV must not be the only thing standing between this and self-approved payouts.
router.post("/kyc/bypass", authMiddleware, requireAdmin, sensitiveLimiter, async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "KYC bypass not available in production",
      });
    }

    const userId = req.user.id;
    const TravellerKYC = (await import("../kyc/travellerKyc.model.js")).default;

    // Find existing KYC or create new one
    let kyc = await TravellerKYC.findOne({
      where: { user_id: userId },
    });

    if (!kyc) {
      kyc = await TravellerKYC.create({
        user_id: userId,
        status: "APPROVED",
        bank_verified: true,
        account_number: "TEST-BYPASS-" + userId.slice(0, 8),
        bank_name: "Test Bank",
        ifsc: "TEST0001",
      });
    } else {
      // Update existing KYC
      await kyc.update({
        status: "APPROVED",
        bank_verified: true,
        account_number: kyc.account_number || "TEST-BYPASS-" + userId.slice(0, 8),
        bank_name: kyc.bank_name || "Test Bank",
        ifsc: kyc.ifsc || "TEST0001",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ KYC bypassed for testing. Status set to APPROVED.",
      data: {
        kycId: kyc.id,
        status: kyc.status,
        bank_verified: kyc.bank_verified,
      },
    });
  } catch (error) {
    console.error("❌ Error in KYC bypass:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to bypass KYC",
      error: error.message,
    });
  }
});

// ─── Request Withdrawal ───────────────────────────────────────────────────
router.post(
  "/withdrawal/request",
  authMiddleware,
  sensitiveLimiter,
  withIdempotency({
    keyPrefix: "idem:withdrawal:request",
    ttlMs: 10 * 60 * 1000,
    keyBuilder: (req) => req.headers["idempotency-key"] || `${req.user?.id}:${req.body?.amount}`,
  }),
  async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Please provide a positive number.",
      });
    }

    const withdrawalRequest = await requestWithdrawalService(userId, amount);
    console.log("✅ Step 1: Withdrawal request created:", withdrawalRequest.withdrawal_id);

    const processedResult = await processWithdrawalService(withdrawalRequest.withdrawal_id);
    console.log("✅ Step 2: Withdrawal processed:", processedResult.withdrawal_id);

    res.status(201).json({
      success: true,
      message: "Withdrawal processed successfully",
      data: {
        withdrawal_id: processedResult.withdrawal_id,
        amount: processedResult.amount,
        status: processedResult.status,
        transaction_id: processedResult.transaction_id,
        bank_details: withdrawalRequest.bank_details,
        processed_at: processedResult.processed_at,
      },
    });
  } catch (error) {
    console.error("❌ Error requesting withdrawal:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── Get Withdrawal History ──────────────────────────────────────────────
router.get("/withdrawal/history", authMiddleware, generalLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = parsePagination(req.query);

    const result = await getWithdrawalHistoryService(userId, limit, offset);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error getting withdrawal history:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal history",
      error: error.message,
    });
  }
});

// ─── Get Withdrawal Details ──────────────────────────────────────────────
router.get("/withdrawal/:id", authMiddleware, generalLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getWithdrawalDetailsService(id, req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error getting withdrawal details:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── Process Withdrawal (Admin/System) ────────────────────────────────────
// This should be an admin or system endpoint invoked by staff/jobs
router.post(
  "/withdrawal/:id/process",
  authMiddleware,
  requireAdmin,
  sensitiveLimiter,
  withIdempotency({
    keyPrefix: "idem:withdrawal:process",
    ttlMs: 10 * 60 * 1000,
    keyBuilder: (req) => req.headers["idempotency-key"] || `${req.user?.id}:${req.params?.id}`,
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await processWithdrawalService(id);

      res.status(200).json({
        success: true,
        message: "Withdrawal processed successfully",
        data: result,
      });
    } catch (error) {
      console.error("❌ Error processing withdrawal:", error.message);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
