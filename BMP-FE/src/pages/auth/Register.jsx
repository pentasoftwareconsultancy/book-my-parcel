import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { signupFields } from "./auth.config";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import RoutePath from "../../core/constants/routes.constant";

const Register = () => {
  const navigate  = useNavigate();
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (data) => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        name:         data.name,
        email:        data.email,
        password:     data.password,
        phone_number: data.phone_number,
        city:         data.city,
        state:        data.state,
        ...(data.referral_code?.trim() && { referral_code: data.referral_code.trim().toUpperCase() }),
      };

      await ApiService.apipost(ServerUrl.API_SIGNUP, payload);
      navigate(RoutePath.KYC_PAN);

    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Social login creates accounts automatically on first use — redirect to login
  // page so users land on the flow that has the social button handlers wired up.
  const handleSocialRedirect = () => {
    navigate(RoutePath.AUTH_LOGIN, {
      state: { hint: "Use the social sign-in buttons below to continue with Google, Facebook, or Apple." },
    });
  };

  return (
    <AuthLayout
      title="Start Sending Parcels Smarter"
      subtitle="Join thousands of users sending parcels through travellers. Fast, secure and affordable."
    >
      <h2 className="text-2xl text-[#1F2AFF] font-bold mb-6">Sign Up</h2>

      <AuthForm
        fields={signupFields}
        submitText={loading ? "Creating Account..." : "Create Account"}
        onSubmit={handleSignup}
        disabled={loading}
        // No social handlers on register — AuthForm hides the buttons when
        // these props are undefined. Social sign-in auto-creates an account
        // on first login, so users should use the Login page for social auth.
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      <div className="text-center mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link to={RoutePath.AUTH_LOGIN} className="text-blue-600 font-semibold hover:underline">
          Login
        </Link>
      </div>

      {/* Inform users that social sign-in is available on the login page */}
      <div className="mt-3 text-center text-xs text-gray-400">
        Want to use Google, Facebook, or Apple?{" "}
        <button
          type="button"
          onClick={handleSocialRedirect}
          className="text-blue-500 hover:underline"
        >
          Sign in instead
        </button>
        {" "}— your account will be created automatically.
      </div>
    </AuthLayout>
  );
};

export default Register;