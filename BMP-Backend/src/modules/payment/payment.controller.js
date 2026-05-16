import {
  createOrderService,
  verifyPaymentService,
} from "./payment.service.js";
import { responseSuccess, responseError } from "../../utils/response.util.js";

/* CREATE ORDER */
export const createOrder = async (req, res) => {
  try {
    const { parcel_id } = req.body;

    if (!parcel_id) {
      return responseError(res, "parcel_id is required", 400);
    }

    // SECURITY: amount is no longer accepted from the client.
    // It is always read from parcel.price_quote on the server side.
    // requestingUserId is taken from the verified JWT via authMiddleware.
    const order = await createOrderService(parcel_id, req.user.id);

    return responseSuccess(res, {
      order: {
        id:         order.id,
        amount:     order.amount,
        currency:   order.currency,
        receipt:    order.receipt,
        created_at: order.created_at,
      },
      key: process.env.RAZORPAY_KEY_ID,
    }, "Order created successfully");

  } catch (error) {
    const status = error.statusCode || 500;
    return responseError(res, error.message || "Order creation failed", status);
  }
};

/* VERIFY PAYMENT */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      parcel_id,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !parcel_id) {
      return responseError(res, "Missing required payment verification fields", 400);
    }

    const result = await verifyPaymentService(req.body, req);

    if (result.success) {
      return responseSuccess(res, { booking_id: result.booking_id }, "Payment verified successfully");
    } else {
      return responseError(res, "Payment verification failed", 400);
    }

  } catch (error) {
    return responseError(res, error.message || "Verification failed", 500);
  }
};
