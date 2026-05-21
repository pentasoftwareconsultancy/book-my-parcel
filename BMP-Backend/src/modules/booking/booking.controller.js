import bookingService from "./booking.service.js";
import { responseSuccess, responseError } from "../../utils/response.util.js";

// POST /api/booking/:bookingId/start-pickup
export const startPickup = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const travellerId = req.user.id;

    console.log(`[startPickup] bookingId=${bookingId} travellerId=${travellerId}`);
    const result = await bookingService.startPickup(bookingId, travellerId);

    return responseSuccess(res, result, "OTP sent to sender successfully");
  } catch (error) {
    console.error("Error in startPickup:", error);
    return responseError(res, error.message, 400);
  }
};

// POST /api/booking/:bookingId/verify-pickup
export const verifyPickup = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const travellerId = req.user.id;

    const result = await bookingService.verifyPickup(bookingId, travellerId, otp);

    return responseSuccess(res, result, "Pickup verified successfully");
  } catch (error) {
    console.error("Error in verifyPickup:", error);

    if (error.attemptsRemaining !== undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OTP",
          message: error.message,
          attempts_remaining: error.attemptsRemaining,
        },
      });
    }

    return responseError(res, error.message, 400);
  }
};

// POST /api/booking/:bookingId/start-delivery
export const startDelivery = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const travellerId = req.user.id;

    const result = await bookingService.startDelivery(bookingId, travellerId);

    return responseSuccess(res, result, "OTP sent to recipient successfully");
  } catch (error) {
    console.error("Error in startDelivery:", error);
    return responseError(res, error.message, 400);
  }
};

// POST /api/booking/:bookingId/verify-delivery
export const verifyDelivery = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const travellerId = req.user.id;

    const result = await bookingService.verifyDelivery(bookingId, travellerId, otp);

    return responseSuccess(res, result, "Delivery completed successfully");
  } catch (error) {
    console.error("Error in verifyDelivery:", error);

    if (error.attemptsRemaining !== undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OTP",
          message: error.message,
          attempts_remaining: error.attemptsRemaining,
        },
      });
    }

    return responseError(res, error.message, 400);
  }
};

// POST /api/booking/:bookingId/cancel (Traveller cancels)
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason = "other", details = "" } = req.body;
    const travellerId = req.user.id;

    const result = await bookingService.cancelBooking(bookingId, travellerId, {
      reason,
      details,
    });

    return responseSuccess(res, result, "Booking cancelled successfully");
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return responseError(res, error.message, 400);
  }
};

// POST /api/booking/:bookingId/receive-payment
// Pay After Delivery has been removed — all bookings use PAY_NOW.
// Return 410 Gone so clients know this endpoint is permanently retired.
export const receivePayment = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: "Pay After Delivery is no longer supported. All bookings use PAY_NOW via Razorpay.",
  });
};
