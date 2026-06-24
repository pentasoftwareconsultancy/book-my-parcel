import { Op } from "sequelize";
import sequelize from "../config/database.config.js";
import Payment from "../modules/payment/payment.model.js";
import Booking from "../modules/booking/booking.model.js";
import Parcel from "../modules/parcel/parcel.model.js";
import { creditWalletService } from "../modules/payment/wallet.service.js";
import { PAYMENT_STATUS } from "../utils/constants.js";
import { getOrCache } from "../utils/cache.util.js";

/**
 * Release pending payments for delivered bookings.
 * Fully idempotent and safe for cron / multiple workers.
 */
export async function releaseDeliveredPayments() {
  const unreleased = await Payment.findAll({
    where: {
      status: PAYMENT_STATUS.SUCCESS,
      wallet_credit_released: false,   // 👈 IMPORTANT
      released_at: null,
    },
    include: [
      {
        model: Booking,
        required: true,
        where: { status: "DELIVERED" },
        include: [
          {
            model: Parcel,
            as: "parcel",
            attributes: ["id", "price_quote"],
          },
        ],
      },
    ],
  });

  if (!unreleased.length) return 0;

  console.log(
    `[PaymentRelease] Found ${unreleased.length} unreleased payment(s)`
  );

  let releasedCount = 0;

  for (const payment of unreleased) {
    const booking = payment.booking ?? payment.Booking;

    if (!booking) {
      console.warn(`[PaymentRelease] Missing booking for payment ${payment.id}`);
      continue;
    }

    const travellerId = booking.traveller_id;
    const fullAmount = Number(
      booking?.parcel?.price_quote || payment.amount || 0
    );

    if (!travellerId || !fullAmount) {
      console.warn(
        `[PaymentRelease] Skipping payment ${payment.id} (invalid data)`
      );
      continue;
    }

    // ── PLATFORM FEE ───────────────────────────────
    const platformFeePercent = await getOrCache(
      "platform_settings:platform_fee_percent",
      async () => {
        const feeResult = await sequelize.query(
          `SELECT value FROM platform_settings WHERE key = 'platform_fee_percent'`,
          { type: sequelize.QueryTypes.SELECT }
        );
        return parseFloat(feeResult[0]?.value || 10);
      },
      300
    );

    const platformFee = Math.round(
      fullAmount * (platformFeePercent / 100)
    );
    const partnerAmount = fullAmount - platformFee;

    const t = await sequelize.transaction();

    try {
      // ─────────────────────────────────────────────
      // 1. IDEMPOTENCY LOCK (ONLY ONCE)
      // ─────────────────────────────────────────────
      const [updated] = await Payment.update(
        {
          released_at: new Date(),
          wallet_credit_released: true,
          wallet_txn_id: payment.id, // optional but recommended
        },
        {
          where: {
            id: payment.id,
            released_at: null,
            wallet_credit_released: false,
            status: PAYMENT_STATUS.SUCCESS,
          },
          transaction: t,
        }
      );

      if (updated === 0) {
        await t.rollback();
        console.log(`[PaymentRelease] Already processed ${payment.id}`);
        continue;
      }

      // ─────────────────────────────────────────────
      // 2. CREDIT WALLET
      // ─────────────────────────────────────────────
      await creditWalletService(
        travellerId,
        partnerAmount,
        `Delivery payment for booking ${booking.booking_ref || booking.id} (Platform fee: ₹${platformFee})`,
        t,
        payment.id // idempotency key
      );

      await t.commit();

      console.log(
        `[PaymentRelease] ✅ Paid ₹${partnerAmount} to ${travellerId}`
      );

      releasedCount++;
    } catch (err) {
      await t.rollback();
      console.error(`[PaymentRelease] ❌ Failed ${payment.id}:`, err.message);
    }
  }

  return releasedCount;
}

/**
 * Run job (cron / interval)
 */
export async function runPaymentReleaseJob() {
  try {
    console.log("[PaymentRelease] Running job...");
    const released = await releaseDeliveredPayments();
    console.log(
      `[PaymentRelease] Done — released: ${released} payment(s)`
    );
  } catch (err) {
    console.error("[PaymentRelease] Job failed:", err.message);
  }
}

export default runPaymentReleaseJob;