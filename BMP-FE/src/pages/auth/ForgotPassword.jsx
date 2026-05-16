import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import RoutePath from "../../core/constants/routes.constant";
import { FiCheckCircle } from "react-icons/fi";

const STEP = { EMAIL: "email", OTP: "otp", DONE: "done" };

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]           = useState(STEP.EMAIL);
  const [email, setEmail]         = useState("");
  const [phoneHint, setPhoneHint] = useState("");
  const [otp, setOtp]             = useState("");
  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ── Step 1: request OTP ── */
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email address");

    try {
      setLoading(true);
      const res = await ApiService.apipost(ServerUrl.API_FORGOT_PASSWORD, { email });
      setPhoneHint(res.data?.data?.phone_hint || "");
      setStep(STEP.OTP);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP + set new password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) return setError("Please enter the OTP");
    if (!newPassword) return setError("Please enter a new password");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    try {
      setLoading(true);
      await ApiService.apipost(ServerUrl.API_FORGOT_PASSWORD, { email, otp, newPassword });
      setStep(STEP.DONE);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 1 UI ── */
  const renderEmailStep = () => (
    <form onSubmit={handleRequestOtp} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          autoComplete="email"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>
    </form>
  );

  /* ── Step 2 UI ── */
  const renderOtpStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      {phoneHint && (
        <p className="text-sm text-gray-500">
          OTP sent to <span className="font-medium text-gray-700">{phoneHint}</span>
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter OTP"
          maxLength={6}
          autoComplete="one-time-code"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          autoComplete="new-password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <button
        type="button"
        onClick={() => { setStep(STEP.EMAIL); setError(""); setOtp(""); }}
        className="w-full text-sm text-gray-500 hover:text-blue-600 underline"
      >
        Use a different email
      </button>
    </form>
  );

  /* ── Step 3 UI ── */
  const renderDoneStep = () => (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <FiCheckCircle size={64} className="text-green-500" />
      </div>
      <p className="text-gray-700 font-medium">Password reset successfully!</p>
      <p className="text-sm text-gray-500">You can now log in with your new password.</p>
      <button
        onClick={() => navigate(RoutePath.AUTH_LOGIN)}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <AuthLayout title="Reset Your Password">
      <h2 className="text-2xl font-extrabold text-[#1F2AFF] mb-1">Forgot Password</h2>
      <p className="mb-6 text-[#1A1A1A] text-sm">
        {step === STEP.EMAIL && "Enter your email and we'll send an OTP to your phone."}
        {step === STEP.OTP   && "Enter the OTP and choose a new password."}
        {step === STEP.DONE  && ""}
      </p>

      {step === STEP.EMAIL && renderEmailStep()}
      {step === STEP.OTP   && renderOtpStep()}
      {step === STEP.DONE  && renderDoneStep()}

      {step !== STEP.DONE && (
        <div className="mt-4 text-sm text-center text-gray-600">
          Remember your password?{" "}
          <Link to={RoutePath.AUTH_LOGIN} className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
