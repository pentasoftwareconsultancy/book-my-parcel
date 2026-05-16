import { useState } from "react";                          // ✅ added useState
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { signupFields } from "./auth.config";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import RoutePath from "../../core/constants/routes.constant";

const Register = () => {
  const navigate  = useNavigate();
  const [error,   setError]   = useState("");   // ✅ error state
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleSignup = async (data) => {
    try {
      setLoading(true);
      setError("");

      // ✅ Build payload manually — only what backend needs
      const payload = {
        name:             data.name,
        email:            data.email,
        password:         data.password,
        phone_number:     data.phone_number,
        city:             data.city,
        state:            data.state,
        ...(data.referral_code?.trim() && { referral_code: data.referral_code.trim().toUpperCase() }),
      };

      console.log("Payload:", payload); // verify clean payload

      await ApiService.apipost(ServerUrl.API_SIGNUP, payload);

      // ✅ navigate to PAN KYC after signup
      navigate(RoutePath.KYC_PAN);

    } catch (err) {
      // ✅ backend sends "message" not "error"
      setError(err?.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Start Sending Parcels Smarter" subtitle="Join thousands of users sending parcels through travellers.Fast, secure and affordable.">
      <h2 className="text-2xl text-[#1F2AFF] font-bold mb-6">Sign Up</h2>

      <AuthForm
        fields={signupFields}             
        submitText={loading ? "Creating Account..." : "Create Account"} 
        onSubmit={handleSignup}
        disabled={loading}
      />

      {/* ✅ Show error properly — no alert */}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      <div className="text-center mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to={RoutePath.AUTH_LOGIN}
          className="text-blue-600 font-semibold hover:underline"
        >
          Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;