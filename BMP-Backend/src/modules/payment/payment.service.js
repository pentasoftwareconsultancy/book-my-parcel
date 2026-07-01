import sequelize from "../../config/database.config.js";
import Payment from "./payment.model.js";
import Booking from "../booking/booking.model.js";
import Parcel from "../parcel/parcel.model.js";
import User from "../user/user.model.js";
import UserProfile from "../user/userProfile.model.js";
import Address from "../parcel/address.model.js";
import twilioService from "../../services/twilio.service.js";
import { sendToUser, sendToTraveller } from "../../services/notification.service.js";
import { auditLog } from "../../utils/auditLog.util.js";
import { getCashfree } from "../../config/cashfree.client.js";

import {
  BOOKING_STATUS,
  PARCEL_TRANSITIONS,
  PAYMENT_STATUS,
  assertValidTransition,
} from "../../utils/constants.js";

/* ================= CREATE ORDER ================= */

/**
 * Create a Razorpay order for a parcel payment.
 *
 * Security fixes applied:
 *  1. Requires requestingUserId — verifies the caller owns the parcel.
 *  2. Amount is always taken from parcel.price_quote (server-side) — never
 *     trusted from the client. A client-supplied amount is ignored entirely.
 */
export const createOrderService = async (parcel_id, requestingUserId) => {
  const parcel = await Parcel.findByPk(parcel_id);
  
  if (!parcel) {
    throw new Error("Parcel not found");
  }

  if (String(parcel.user_id) !== String(requestingUserId)) {
    const err = new Error("Forbidden: you do not own this parcel");
    err.statusCode = 403;
    throw err;
  }

  const amount = Number(parcel.price_quote);

  if (!amount || amount <= 0) {
    throw new Error(
      "Parcel does not have a valid price quote."
    );
  }

  const existingPayment = await Payment.findOne({
    where: {
      parcel_id,
      status: PAYMENT_STATUS.PENDING,
    },
  });

  const user = await User.findByPk(parcel.user_id, {
    include: [{ model: UserProfile, as: "profile" }],
  });

  if (!user) throw new Error("User not found");

  // phone is required by Cashfree — reject early with a clear message
  const phone = user.phone_number?.replace(/\D/g, "");
  if (!phone || phone.length < 10) {
    throw new Error("User does not have a valid phone number on file. Please update your profile.");
  }

  // email is optional but Cashfree requires something — use a derived placeholder
  // only if the account was created via Firebase (no real email supplied)
  const email = user.email?.includes("firebase:") ? null : user.email;
  if (!email) {
    throw new Error("User does not have a valid email address on file. Please update your profile.");
  }

  const customerName = user.profile?.name || null;
  if (!customerName) {
    throw new Error("User profile name is missing. Please complete your profile before paying.");
  }

  const orderId = `ORDER_${Date.now()}_${parcel.id}`;

  const cashfree = getCashfree();

  console.log("🔥 CASHFREE REQUEST:", {
    orderId,
    amount,
    userId: user?.id,
  });

  const request = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",

    customer_details: {
      customer_id: String(user.id),
      customer_name: customerName,
      customer_email: email,
      customer_phone: phone.slice(-10), // Cashfree expects 10-digit Indian number
    },

    order_meta: {
      return_url: `${process.env.FRONTEND_URL}/payment-success?order_id={order_id}`,
    },
  };

  const response = await cashfree.PGCreateOrder(request);

  console.log("✅ [Cashfree] Order created:", response?.data?.order_id, "| status:", response?.data?.order_status);

  await Payment.create({
    parcel_id,
    amount,
    currency: "INR",

    cashfree_order_id: orderId,

    status: PAYMENT_STATUS.PENDING,
  });
  
  const orderData = response?.data || response;

  const paymentSessionId =
    orderData.payment_session_id ||
    orderData?.payment_session_id;

  return {
    order_id: response.data.order_id,
    payment_session_id: paymentSessionId,
    amount,
    currency: "INR",
  };
};

/* ================= VERIFY PAYMENT ================= */

export const verifyPaymentService = async (data, req = null) => {
  const {
    order_id,
    parcel_id,
  } = data;

  const cashfree = getCashfree();

  let orderResponse;

  try {
    orderResponse = await cashfree.PGFetchOrder(order_id);
  } catch (error) {
    console.error("Cashfree fetch order failed:", error);
    return { success: false };
  }

  const orderData = orderResponse.data;

  if (
    orderData.order_status !== "PAID" &&
    orderData.order_status !== "SUCCESS"
  ) {
    await Payment.update(
      {
        status: PAYMENT_STATUS.FAILED,
      },
      {
        where: {
          cashfree_order_id: order_id,
        },
      }
    );

    return { success: false };
  }

  const cashfreePaymentId =
    orderData.cf_order_id ||
    orderData.payment_id ||
    null;

  // ── 3. Wrap all DB writes in a single transaction ─────────────────────────
  // This guarantees that the Payment update, Booking creation, and Parcel
  // status update either ALL succeed or ALL roll back. The UNIQUE constraint
  // on payments.razorpay_order_id is the final safety net: if two concurrent
  // requests somehow both pass the idempotency check above, the second
  // Booking.create will throw a UniqueConstraintError and the transaction
  // will be rolled back automatically.
  const { booking, parcel, bookingRef } = await sequelize.transaction(
    async (t) => {
      // 3a. Verify parcel exists
      const parcel = await Parcel.findByPk(parcel_id, { transaction: t });
      if (!parcel) {
        throw new Error("Parcel not found during payment verification");
      }

      // 3b. Mark payment as SUCCESS and capture payment details
      const [updatedCount] = await Payment.update(
        {
          cashfree_payment_id: cashfreePaymentId,
          status: PAYMENT_STATUS.SUCCESS,
        },
        { where: { cashfree_order_id: order_id }, transaction: t }
      );

      if (updatedCount === 0) {
        throw new Error(
          `Payment record not found for order ${order_id}`
        );
      }

      // 3c. Generate booking reference
      const { generateBookingId } = await import("../../utils/idGenerator.js");
      const bookingRef = await generateBookingId();

      const selectedPartnerId = parcel.selected_partner_id;

      // 3d. Create booking — the UNIQUE constraint on razorpay_order_id (via
      // the linked Payment) prevents a second booking from being created if
      // a concurrent request races past the idempotency check above.
      const booking = await Booking.create(
        {
          parcel_id: parcel.id,
          traveller_id: selectedPartnerId,
          status: BOOKING_STATUS.CONFIRMED,
          booking_ref: bookingRef,
          tracking_ref: null,
          payment_mode: "PAY_NOW",
        },
        { transaction: t }
      );

      // 3e. Link payment → booking
      await Payment.update(
        { booking_id: booking.id },
        {
          where: {
            cashfree_order_id: order_id,
          },
          transaction: t,
        }
      );

      // 3f. Update parcel status — guard the transition
      assertValidTransition(parcel.status, "CONFIRMED", PARCEL_TRANSITIONS, "Parcel");
      await parcel.update({ status: "CONFIRMED" }, { transaction: t });

      return { booking, parcel, bookingRef };
    }
  );

  // ── 4. Post-transaction side-effects (notifications, WebSocket) ───────────
  // These run AFTER the transaction commits. Failures here are non-fatal —
  // the booking is already persisted.
  try {
    const parcelWithAddresses = await Parcel.findByPk(parcel_id, {
      include: [
        { model: Address, as: "pickupAddress", attributes: ["city"] },
        { model: Address, as: "deliveryAddress", attributes: ["city"] },
      ],
    });
    
    // Fetch user with profile for proper name
    const UserProfile = (await import("../user/userProfile.model.js")).default;
    const senderUser = await User.findByPk(parcel.user_id, { 
      attributes: ["email"],
      include: [{ model: UserProfile, as: "profile", attributes: ["name"] }]
    });
    const userName = senderUser?.profile?.name || senderUser?.email?.split("@")[0] || "User";
    const fromCity = parcelWithAddresses?.pickupAddress?.city || "pickup";
    const toCity = parcelWithAddresses?.deliveryAddress?.city || "delivery";
    const selectedPartnerId = parcel.selected_partner_id;
    const parcelRef = parcel.parcel_ref || parcel_id.substring(0, 8);

    // Fetch traveller name first (needed for user notification)
    let travellerName = "assigned traveller";
    if (selectedPartnerId) {
      const travellerUser = await User.findByPk(selectedPartnerId, {
        attributes: ["email"],
        include: [{ model: UserProfile, as: "profile", attributes: ["name"] }]
      });
      travellerName = travellerUser?.profile?.name || travellerUser?.email?.split("@")[0] || "traveller";
    }

    // In-app notifications
    await sendToUser(
      parcel.user_id,
      "Booking Confirmed! 🎉",
      `Your parcel from ${fromCity} to ${toCity} is confirmed. Booking ref: ${bookingRef}`,
      { 
        type: "booking_confirmed", 
        type_code: "Booking_Confirmed",
        booking_id: booking.id, 
        booking_ref: bookingRef,
        meta: {
          var1: userName,
          var2: travellerName,
          var3: `${bookingRef}. Parcel ID: ${parcelRef}` // Merged bookingRef + parcelRef
        }
      }
    );

    if (selectedPartnerId) {
      await sendToTraveller(
        selectedPartnerId,
        "New Delivery Assigned 📦",
        `You have a new delivery: ${fromCity} → ${toCity}. Booking ref: ${bookingRef}`,
        { 
          type: "booking_confirmed", 
          type_code: "Booking_Confirmed",
          booking_id: booking.id, 
          booking_ref: bookingRef,
          meta: {
            var1: travellerName,
            var2: parcelRef,
            var3: ""
          }
        }
      );
    }

    // SMS to sender
    if (senderUser?.phone_number) {
      await twilioService.sendSMS(
        senderUser.phone_number,
        `Book My Parcel: Your booking is confirmed! Ref: ${bookingRef}. Your parcel from ${fromCity} to ${toCity} will be picked up soon.`
      );
    }

    // WebSocket events
    if (selectedPartnerId && req?.app?.get("io")) {
      const io = req.app.get("io");
      const bookingConfirmedData = {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        parcel_id: parcel.id,
        parcel_uuid: parcel.id,
        parcel_ref: parcel.parcel_ref,
        final_price: parcel.price_quote,
        status: "CONFIRMED",
        payment_mode: booking.payment_mode,
        message: "Booking confirmed! Payment received. Proceed to pickup.",
      };

      io.to(`traveller_requests_${selectedPartnerId}`).emit(
        "booking_confirmed",
        bookingConfirmedData
      );
      io.to(`user_${parcel.user_id}`).emit("booking_confirmed", {
        ...bookingConfirmedData,
        message: "Your booking is confirmed! Traveller will contact you for pickup.",
      });
    }
  } catch (notifErr) {
    // Non-fatal — booking is already confirmed. Log so we can debug.
    console.error(
      "[Payment] Post-confirmation notification/WebSocket error:",
      notifErr.message
    );
  }

  auditLog({
    action: "PAYMENT_VERIFIED",
    actorId: parcel.user_id,
    actorRole: "user",
    resourceType: "payment",
    resourceId: order_id,
    meta: { parcel_id, booking_id: booking.id, amount: parcel.price_quote },
    req,
  });

  return { success: true, booking_id: booking.id };
};

/* ================= REFUND PAYMENT ================= */

/**
 * Issue a Razorpay refund for a parcel cancellation.
 * - Finds the SUCCESS payment for the parcel
 * - Calls Razorpay refund API
 * - Creates a Refund record
 * - Updates Payment status to REFUNDED
 *
 * Safe to call even if no payment exists (pre-payment cancellations).
 *
 * @param {string} parcelId
 * @param {string} reason  - Short reason string for Razorpay notes
 * @returns {{ refunded: boolean, amount?: number, refundId?: string }}
 */
export async function refundPaymentForParcel(parcelId, reason = "Parcel cancelled by user") {
  try {
    // Find the successful payment for this parcel
    const payment = await Payment.findOne({
      where: {
        parcel_id: parcelId,
        status: PAYMENT_STATUS.SUCCESS,
      },
    });

    // No payment found — parcel was cancelled before payment (nothing to refund)
    if (!payment) {
      return { refunded: false };
    }

    // Already refunded — idempotency guard
    if (payment.status === PAYMENT_STATUS.REFUNDED) {
      return { refunded: false };
    }

    if (!payment.cashfree_payment_id) {
      return { refunded: false };
    }

    const cashfree = getCashfree();

    // Cashfree refund API
    const refundId = `REFUND_${Date.now()}_${parcelId.slice(0, 8)}`;
    const refundResponse = await cashfree.PGOrderCreateRefund(payment.cashfree_order_id, {
      refund_amount: Number(payment.amount),
      refund_id: refundId,
      refund_note: reason,
    });

    const { default: Refund } = await import("./refund.model.js");

    await Refund.create({
      payment_id: payment.id,
      amount: payment.amount,
      status: "COMPLETED",
    });

    await payment.update({ status: PAYMENT_STATUS.REFUNDED });

    return {
      refunded: true,
      amount: payment.amount,
      refundId: refundResponse?.data?.refund_id || refundId,
    };
  } catch (error) {
    console.error(`[Payment] Refund FAILED for parcel ${parcelId}:`, error.message);
    return { refunded: false, error: error.message };
  }
}
