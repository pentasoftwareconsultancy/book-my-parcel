import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { loginFields } from "./auth.config";
import ApiService from "../../core/services/api.service";
import StorageService from "../../core/services/storage.service";
import { USER_ROLES } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { useDispatch } from "react-redux";
import { setAuth } from "../../store/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      setError(""); // ✅ clear previous error

      // ✅ payload — role comes from AuthForm role selection
      const payload = {
        email: data.email,
        password: data.password,
        role: data.role,  // ✅ selected role from login screen
      };

      const response = await ApiService.apipost(
        ServerUrl.API_LOGIN,
        payload
      );

      console.log("Full response:", response);
      console.log("response.data:", response.data);
      console.log("response.data.data:", response.data.data);

      // ✅ backend sends { success, message, data: { user, token, ... } }
      const { user, token, activeRole, roles, kycStatus } = response.data.data;

      const userToStore = {
        id: user.id,
        email: user.email,
        phone_number: user.phone_number,
        activeRole,
        roles,
      };

      // Persist token — use sessionStorage when rememberMe is off so the
      // token is cleared automatically when the browser tab closes.
      // StorageService.getData() checks both storages, so the interceptor
      // and WebSocket service will find the token either way.
      const useSession = !data.rememberMe;
      StorageService.setData("token", token, { session: useSession });
      StorageService.setData("user", userToStore);

      dispatch(setAuth({ user: userToStore, token }));

      console.log("Active Role:", activeRole);
      console.log("KYC Status:", kycStatus);

      // ✅ ADMIN redirect
      // ✅ ADMIN redirect
      if (activeRole === USER_ROLES.ADMIN) {
        navigate(RoutePath.ADMIN_BASE);
        return;
      }

      // // ✅ TRAVELLER redirect
      // if (activeRole === USER_ROLES.TRAVELLER) {
      //   if (kycStatus === "APPROVED") {
      //     navigate(RoutePath.TRAVELER_DASHBOARD);
      //   } 
      //   else {
      //     navigate(RoutePath.KYC_REGISTRATION);
      //   }
      //   return;
      // }

      // ✅ TRAVELLER redirect
      if (activeRole === USER_ROLES.TRAVELLER) {
        navigate(RoutePath.TRAVELER_DASHBOARD);
        return;
      }

      // ✅ INDIVIDUAL redirect — explicit
      if (activeRole === USER_ROLES.INDIVIDUAL) {
        navigate(RoutePath.PUBLIC_HOME); // ← make sure this route exists
        return;
      }
    } catch (err) {
      // ✅ backend sends "message" not "error"
      setError(err?.response?.data?.message || "Invalid email or password!");
    } finally {
      setLoading(false); // ✅ stop loading always
    }
  };

  return (
    <AuthLayout title="Welcome Back!">
      <h2 className=" text-2xl font-extrabold text-[#1F2AFF]">Log In</h2>
      <p className="mb-4 text-[#1A1A1A] text-sm">Choose your account type and login</p>

      <AuthForm
        fields={loginFields}
        submitText={loading ? "Logging in..." : "Login"} // ✅ loading text
        onSubmit={handleLogin}
        disabled={loading}                               // ✅ disable while loading
      />

      {/* ✅ error message */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-4 text-sm text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          to={RoutePath.AUTH_REGISTER}  // ✅ use RoutePath not hardcoded "/register"
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;