import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { loginFields } from "./auth.config";

import { USER_ROLES } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";
import ServerUrl from "../../core/constants/serverUrl.constant";

import { useDispatch } from "react-redux";
import { loginWithEmailAndPassword, setAuth } from "../../store/slices/authSlice";
import ApiService from "../../core/services/api.service";
import StorageService from "../../core/services/storage.service";

import { signInWithGoogle } from "../../core/services/firebaseAuth.service";

// ── Redirect helper ───────────────────────────────────────────────────────────
function getRedirectPath(activeRole) {
  if (activeRole === USER_ROLES.ADMIN)      return RoutePath.ADMIN_BASE;
  if (activeRole === USER_ROLES.TRAVELLER)  return RoutePath.TRAVELER_DASHBOARD;
  return RoutePath.PUBLIC_HOME;
}

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Hint injected by Register.jsx when user clicks "Sign in instead"
  const redirectHint = location.state?.hint || "";

  // ── Common post-login handler (used by ALL auth methods) ─────────────────
  const handleLoginSuccess = (response) => {
    const { user, token, activeRole, roles } = response.data.data;

    const userToStore = {
      id:           user.id,
      email:        user.email,
      name:         user.name,
      phone_number: user.phone_number,
      activeRole,
      roles,
    };

    // Persist to storage + Redux — same keys the interceptor looks for
    StorageService.setData("token", token);
    StorageService.setData("user",  userToStore);
    dispatch(setAuth({ user: userToStore, token }));

    navigate(getRedirectPath(activeRole));
  };

  // ── Email / Password login — uses Redux thunk (single code path) ──────────
  const handleLogin = async (data) => {
    try {
      setLoading(true);
      setError("");

      // loginWithEmailAndPassword thunk persists token + user and returns them
      const result = await dispatch(
        loginWithEmailAndPassword({
          email:     data.email,
          password:  data.password,
          loginRole: data.role || USER_ROLES.INDIVIDUAL,
        })
      );

      if (loginWithEmailAndPassword.rejected.match(result)) {
        // Thunk already called showError(); surface the message locally too
        setError(result.payload || "Invalid email or password.");
        return;
      }

      // Thunk stored token/user — just redirect
      navigate(getRedirectPath(result.payload.user.activeRole));

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Firebase social handlers — shared POST to /api/auth/firebase-login ────
  const handleFirebaseLogin = async (getToken, provider) => {
    try {
      setLoading(true);
      setError("");
      const firebaseToken = await getToken();
      const response = await ApiService.apipost(ServerUrl.API_FIREBASE_LOGIN, {
        token: firebaseToken,
        provider,
      });
      handleLoginSuccess(response);
    } catch (err) {
      // firebaseAuth.service.js already translates raw Firebase error codes
      setError(err?.response?.data?.message || err.message || `${provider} sign-in failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => handleFirebaseLogin(signInWithGoogle, "google");

  return (
    <AuthLayout title="Welcome Back!">
      <h2 className="text-2xl font-extrabold text-[#1F2AFF]">Log In</h2>
      <p className="mb-4 text-[#1A1A1A] text-sm">Choose your account type and login</p>

      {/* Hint from Register page — shown when user was redirected for social login */}
      {redirectHint && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-2 rounded-lg">
          {redirectHint}
        </div>
      )}

      <AuthForm
        fields={loginFields}
        submitText={loading ? "Logging in..." : "Login"}
        onSubmit={handleLogin}
        disabled={loading}
        onGoogleLogin={handleGoogleLogin}
      />

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="mt-4 text-sm text-center text-gray-600">
        Don't have an account?{" "}
        <Link to={RoutePath.AUTH_REGISTER} className="font-semibold text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
