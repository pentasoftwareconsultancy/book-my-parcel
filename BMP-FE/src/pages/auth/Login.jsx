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

import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
} from "../../core/services/firebaseAuth.service";

const Login = () => {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // Common Login Success
  // =========================
  const handleLoginSuccess = (
    response
  ) => {

    const {
      user,
      token,
      activeRole,
      roles,
    } = response.data.data;

    const userToStore = {
      id: user.id,
      email: user.email,
      phone_number:
        user.phone_number,
      activeRole,
      roles,
    };

    StorageService.setData(
      "token",
      token
    );

    StorageService.setData(
      "user",
      userToStore
    );

    dispatch(
      setAuth({
        user: userToStore,
        token,
      })
    );

    // Redirect
    if (
      activeRole ===
      USER_ROLES.ADMIN
    ) {

      navigate(
        RoutePath.ADMIN_BASE
      );

      return;
    }

    if (
      activeRole ===
      USER_ROLES.TRAVELLER
    ) {

      navigate(
        RoutePath.TRAVELER_DASHBOARD
      );

      return;
    }

    navigate(
      RoutePath.PUBLIC_HOME
    );
  };

  // =========================
  // Normal Login
  // =========================
  const handleLogin = async (
    data
  ) => {

    try {

      setLoading(true);

      setError("");

      const payload = {
        email: data.email,
        password: data.password,
        role: data.role,
      };

      const response =
        await ApiService.apipost(
          ServerUrl.API_LOGIN,
          payload
        );

      handleLoginSuccess(
        response
      );

    } catch (err) {

      console.log(err);

      setError(
        err?.response?.data
          ?.message ||
          "Invalid email or password!"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // Google Login
  // =========================
  const handleGoogleLogin =
    async () => {

      try {

        setLoading(true);

        setError("");

        const firebaseToken =
          await signInWithGoogle();

        const response =
          await ApiService.apipost(
            ServerUrl.API_FIREBASE_LOGIN,
            {
              token:
                firebaseToken,
              provider:
                "google",
            }
          );

        handleLoginSuccess(
          response
        );

      } catch (err) {

        console.log(err);

        setError(
          err?.response?.data
            ?.message ||
            "Google login failed"
        );

      } finally {

        setLoading(false);
      }
    };

  // =========================
  // Facebook Login
  // =========================
  const handleFacebookLogin =
    async () => {

      try {

        setLoading(true);

        setError("");

        const firebaseToken =
          await signInWithFacebook();

        const response =
          await ApiService.apipost(
            ServerUrl.API_FIREBASE_LOGIN,
            {
              token:
                firebaseToken,
              provider:
                "facebook",
            }
          );

        handleLoginSuccess(
          response
        );

      } catch (err) {

        console.log(err);

        setError(
          err?.response?.data
            ?.message ||
            "Facebook login failed"
        );

      } finally {

        setLoading(false);
      }
    };

  // =========================
  // Apple Login
  // =========================
  const handleAppleLogin =
    async () => {

      try {

        setLoading(true);

        setError("");

        const firebaseToken =
          await signInWithApple();

        const response =
          await ApiService.apipost(
            ServerUrl.API_FIREBASE_LOGIN,
            {
              token:
                firebaseToken,
              provider:
                "apple",
            }
          );

        handleLoginSuccess(
          response
        );

      } catch (err) {

        console.log(err);

        setError(
          err?.response?.data
            ?.message ||
            "Apple login failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <AuthLayout title="Welcome Back!">

      <h2 className="text-2xl font-extrabold text-[#1F2AFF]">
        Log In
      </h2>

      <p className="mb-4 text-[#1A1A1A] text-sm">
        Choose your account type and login
      </p>

      {/* Auth Form */}
      <AuthForm
        fields={loginFields}
        submitText={
          loading
            ? "Logging in..."
            : "Login"
        }
        onSubmit={handleLogin}
        disabled={loading}
        onGoogleLogin={
          handleGoogleLogin
        }
        onFacebookLogin={
          handleFacebookLogin
        }
        onAppleLogin={
          handleAppleLogin
        }
      />

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      {/* Signup */}
      <div className="mt-4 text-sm text-center text-gray-600">

        Don't have an account?{" "}

        <Link
          to={
            RoutePath.AUTH_REGISTER
          }
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign up
        </Link>

      </div>

    </AuthLayout>
  );
};

export default Login;