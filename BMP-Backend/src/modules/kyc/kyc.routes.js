import express from "express";
import path from "path";
import fs from "fs";
import { verifyPan } from "./pan.controller.js";
import { verifyBankAccount, addBankRecipient } from "./bank.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireAdmin, isUserAdmin } from "../../middlewares/role.middleware.js";
import { sensitiveLimiter } from "../../middlewares/rateLimit.middleware.js";
import TravellerKYC from "./travellerKyc.model.js";

const router = express.Router();

/**
 * @swagger
 * /api/kyc/pan:
 *   post:
 *     summary: Verify PAN
 *     description: Verify PAN card details
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pan_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: PAN verified
 */

/**
 * @swagger
 * /api/kyc/bank/verify:
 *   post:
 *     summary: Verify bank account
 *     description: Verify bank account details
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_number:
 *                 type: string
 *               ifsc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bank account verified
 */

/**
 * @swagger
 * /api/kyc/bank/recipient:
 *   post:
 *     summary: Add bank recipient
 *     description: Add bank recipient for payouts
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_number:
 *                 type: string
 *               ifsc:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recipient added
 */

/**
 * @swagger
 * /api/kyc/document/{filename}:
 *   get:
 *     summary: Get KYC document
 *     description: Retrieve KYC document (authenticated access only)
 *     tags: [Traveller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document retrieved
 */

// ── KYC Verification endpoints ────────────────────────────────────────────────
router.post("/pan",            authMiddleware, sensitiveLimiter, verifyPan);
router.post("/bank/verify",    authMiddleware, sensitiveLimiter, verifyBankAccount);
router.post("/bank/recipient", authMiddleware, sensitiveLimiter, addBankRecipient);

// ── Authenticated KYC document serving ───────────────────────────────────────
// SECURITY: KYC documents (Aadhaar, PAN, bank docs) are sensitive identity
// documents. They are NOT served via static middleware — only via this
// authenticated route which verifies the requester owns the document or is admin.
//
// The Nginx config blocks /uploads/kyc/ entirely — all access goes through here.
router.get("/document/:filename", authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize filename — prevent path traversal attacks
    const sanitized = path.basename(filename);
    if (sanitized !== filename || filename.includes("..")) {
      return res.status(400).json({ success: false, message: "Invalid filename" });
    }

    const filePath = path.join(process.cwd(), "uploads", "kyc", sanitized);

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Authorization: admin can access any document.
    // Regular users can only access their own KYC documents.
    const isAdmin = await isUserAdmin(req.user.id);

    if (!isAdmin) {
      // Verify the requesting user owns a KYC record that references this file
      const kyc = await TravellerKYC.findOne({ where: { user_id: req.user.id } });
      if (!kyc) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // Check if any KYC field references this filename
      const kycJson = JSON.stringify(kyc.toJSON());
      if (!kycJson.includes(sanitized)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    // Serve the file with appropriate headers
    res.setHeader("Content-Disposition", `inline; filename="${sanitized}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(filePath);
  } catch (err) {
    console.error("[KYC] Document serve error:", err.message);
    res.status(500).json({ success: false, message: "Failed to serve document" });
  }
});

// Admin: list all KYC documents for a user
router.get("/admin/document/:filename", authMiddleware, requireAdmin, (req, res) => {
  const { filename } = req.params;
  const sanitized = path.basename(filename);
  if (sanitized !== filename) {
    return res.status(400).json({ success: false, message: "Invalid filename" });
  }
  const filePath = path.join(process.cwd(), "uploads", "kyc", sanitized);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  res.sendFile(filePath);
});

export default router;
