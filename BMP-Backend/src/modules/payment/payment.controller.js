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

    const order = await createOrderService(parcel_id, req.user.id);

    return responseSuccess(res, {
      order: {
        id: order.order_id,
        payment_session_id: order.payment_session_id, // ✅ THIS is now correct
        amount: order.amount,
        currency: order.currency,
      }
    }, "Order created successfully");

  } catch (error) {
    console.error(error);
    return responseError(res, error.message || "Order creation failed", 500);
  }
};

/* VERIFY PAYMENT */
export const verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return responseError(res, "order_id is required", 400);
    }

    const result = await verifyPaymentService(req.body, req);

    if (!result.success) {
      return responseError(
        res,
        "Payment verification failed",
        400
      );
    }

    return responseSuccess(
      res,
      {
        booking_id: result.booking_id,
        parcel_id: result.parcel_id,
        booking_ref: result.booking_ref,
      },
      "Payment verified successfully"
    );
  } catch (error) {
    return responseError(
      res,
      error.message || "Verification failed",
      500
    );
  }
};
