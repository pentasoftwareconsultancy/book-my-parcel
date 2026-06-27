import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import { showToast } from "../../../core/utils/toast.util";
import RoutePath from "../../../core/constants/routes.constant";

export default function PaymentSuccessPage() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    useEffect(() => {

        verify();

    }, []);

    const verify = async () => {

        try {

            const orderId = searchParams.get("order_id");

            if (!orderId) {

                showToast("Invalid payment.", "error");

                navigate("/");

                return;

            }

            // verify payment
            const verifyRes = await ApiService.apipost(
                ServerUrl.API_PAYMENT_VERIFY_RETURN,
                {
                    order_id: orderId,
                }
            );

            if (!verifyRes.data.success) {

                showToast("Payment verification failed", "error");

                navigate(RoutePath.USER_ALL_ORDERS);

                return;

            }

            const parcelId = verifyRes.data.data.parcel_id;

            const bookingRef = verifyRes.data.data.booking_ref;

            showToast("Payment Successful", "success");

            navigate(
                `/user/request?parcelId=${result.parcel_id}&step=3`,
                {
                    state: {
                        paymentSuccess: true,
                        bookingRef,
                    },
                    replace: true,
                }
            );

        }

        catch (err) {

            console.log(err);

            showToast("Payment verification failed", "error");

            navigate(RoutePath.USER_ALL_ORDERS);

        }

    };

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: 22,
            }}
        >
            Verifying Payment...
        </div>

    );

}