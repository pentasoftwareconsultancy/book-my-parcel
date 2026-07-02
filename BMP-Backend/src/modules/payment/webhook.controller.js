/**
 * Cashfree Webhook Handler
 *
 * Cashfree calls this endpoint when a payment completes, fails, or is refunded.
 * This is the RELIABLE confirmation path — the manual verify-payment endpoint
 * is a fallback for same-session confirmations only.
 *
 * Security: Cashfree signs every webhook with HMAC-SHA256.
 * We MUST verify the signature before processing anything.
 *
 * Cashfree docs: https://docs.cashfree.com/docs/webhook-verification
 */

import crypto from "crypto";
import { verifyPaymentService } from "./payment.service.js";
import { auditLog } from "../../utils/auditLog.util.js";

/**
 * Verify the Cashfree webhook signature.
 *
 * Cashfree sends these headers:
 *   x-webhook-timestamp  — Unix timestamp (seconds)
 *   x-webhook-signature  — base64-encoded HMAC-SHA256
 *
 * The message to sign is:  timestamp + rawBody
 * The key is:              CASHFREE_SECRET_KEY
 */
function verifySignature(rawBody, timestamp, receivedSignature) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) {
    throw new Error("CASHFREE_SECRET_KEY is not set");
  }

  const message = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64");

  // Use timingSafeEqual to prevent timing attacks
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);

  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

/**
 * POST /api/payment/webhook
 *
 * IMPORTANT: This route needs raw body access for signature verification.
 * In your router, register it BEFORE express.json() middleware, or use
 * express.raw({ type: "application/json" }) on this route specifically.
 */
export async function cashfreeWebhook(req, res) {
  // ── 1. Extract signature headers ─────────────────────────────────────────
  const timestamp = req.headers["x-webhook-timestamp"];
  const receivedSignature = req.headers["x-webhook-signature"];

  if (!timestamp || !receivedSignature) {
    console.warn("[Webhook] Missing signature headers — rejecting");
    return res.status(400).json({ message: "Missing webhook signature headers" });
  }

  // ── 2. Verify timestamp freshness (reject replays older than 5 minutes) ──
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) {
    console.warn("[Webhook] Stale webhook timestamp — possible replay attack");
    return res.status(400).json({ message: "Webhook timestamp too old" });
  }

  // ── 3. Verify HMAC signature ──────────────────────────────────────────────
  // rawBody is the unparsed request body string (see route registration note above)
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const isValid = verifySignature(rawBody, timestamp, receivedSignature);
  if (!isValid) {
    console.warn("[Webhook] Invalid signature — rejecting");
    return res.status(401).json({ message: "Invalid webhook signature" });
  }

  // ── 4. Parse event ────────────────────────────────────────────────────────
  const event = req.body;
  const eventType = event?.type;
  const orderData = event?.data?.order;
  const paymentData = event?.data?.payment;

  console.log(`[Webhook] Received event: ${eventType}`);

  // ── 5. Respond immediately — Cashfree expects 200 within 5 seconds ────────
  // All processing happens asynchronously after the response is sent.
  res.status(200).json({ received: true });

  // ── 6. Process event asynchronously ──────────────────────────────────────
  try {
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = orderData?.order_id;

      if (!orderId) {
        console.error("[Webhook] PAYMENT_SUCCESS: missing order_id");
        return;
      }

      console.log(`[Webhook] PAYMENT_SUCCESS — order: ${orderId}`);

      // Do NOT pass parcel_id here — the order ID only contains an 8-char prefix of
      // the parcel UUID. verifyPaymentService recovers the full parcel_id from the
      // Payment row via cashfree_order_id, which is the reliable path.
      const result = await verifyPaymentService({ order_id: orderId });

      auditLog({
        action: "PAYMENT_WEBHOOK_SUCCESS",
        actorId: null,
        actorRole: "system",
        resourceType: "payment",
        resourceId: orderId,
        meta: {
          parcel_id: result?.parcel_id,
          cf_payment_id: paymentData?.cf_payment_id,
          amount: paymentData?.payment_amount,
        },
      });

    } else if (eventType === "PAYMENT_FAILED_WEBHOOK") {
      const orderId = orderData?.order_id;
      console.warn(`[Webhook] PAYMENT_FAILED — order: ${orderId}`);

      // Update payment status to FAILED
      const { default: Payment } = await import("./payment.model.js");
      const { PAYMENT_STATUS } = await import("../../utils/constants.js");

      await Payment.update(
        { status: PAYMENT_STATUS.FAILED },
        { where: { cashfree_order_id: orderId } }
      );

      auditLog({
        action: "PAYMENT_WEBHOOK_FAILED",
        actorId: null,
        actorRole: "system",
        resourceType: "payment",
        resourceId: orderId,
        meta: {
          failure_reason: paymentData?.payment_message,
          error_code: paymentData?.error_details?.error_code,
        },
      });

    } else if (eventType === "REFUND_STATUS_WEBHOOK") {
      const orderId = orderData?.order_id;
      const refundStatus = event?.data?.refund?.refund_status;
      console.log(`[Webhook] REFUND_STATUS — order: ${orderId}, status: ${refundStatus}`);
      // Refund status updates handled here if needed

    } else {
      console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }
  } catch (err) {
    // Never re-throw after res.send() — just log so we can investigate
    console.error(`[Webhook] Error processing ${eventType}:`, err.message);
  }
}

/**
 * Extract the parcel ID prefix from the order_id we created.
 * Real format: ORD_{timestamp}_{first8charsOfParcelId}
 * Note: only 8 chars of the parcel UUID are stored here, so this returns
 * a partial match prefix only. The webhook handler uses this as a hint but
 * always falls back to recovering parcel_id from the Payment row.
 */
function extractParcelIdFromOrderId(orderId) {
  if (!orderId) return null;
  // ORD_1234567890_<8-char-parcel-prefix>
  const match = orderId.match(/^ORD_\d+_(.+)$/);
  return match ? match[1] : null;
}
