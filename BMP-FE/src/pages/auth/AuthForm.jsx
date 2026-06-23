import { useState } from "react";
import React from "react";
import TextInput from "../../core/common/CommonUi";
import Button from "../../core/common/Button";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash, FaRoute } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { USER_ROLES } from "../../core/constants/app.constant";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateRequired,
  validateOnlyCharacters,
} from "../../core/utils/validation";
import RoutePath from "../../core/constants/routes.constant";
import TermModel from "../../components/modals/TerrmModel";
import PrivacyModel from "../../components/modals/PolicyModel";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

const AuthForm = ({
  fields,
  submitText,
  onSubmit,
  initialRole,
  disabled,
  onGoogleLogin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSignupPage = location.pathname === RoutePath.AUTH_REGISTER; // ✅ used to hide role
  const isLoginPage = location.pathname === RoutePath.AUTH_LOGIN;    // ✅ show role only on login

  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => {
      acc[field.name] = field.value || "";
      return acc;
    }, {})
  );

  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(initialRole || USER_ROLES.INDIVIDUAL);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const lastAutofillRef = React.useRef(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const password = formData.password || "";

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: SPECIAL_CHAR_REGEX.test(password),
  };

  // ── VALIDATION ───────────────────────────────
  const validate = () => {
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      const value = formData[key]?.trim();
      const field = fields.find(f => f.name === key);

      if (key === "email") {
        const error = validateEmail(value);
        if (error) newErrors.email = error;
        return;
      }
      if (key === "password") {
        if (!value) {
          newErrors.password = "Password is required";
        }
        return;
      }
      if (key === "confirmPassword") {
        const error = validateConfirmPassword(formData.password, value);
        if (error) newErrors.confirmPassword = error;
        return;
      }
      if (key === "phone_number") {
        const error = validatePhone(value);
        if (error) newErrors.phone_number = error;
        return;
      }
      if (["name", "state", "city"].includes(key)) {
        const error = validateOnlyCharacters(value, key);
        if (error) newErrors[key] = error;
        return;
      }

      // ✅ Only validate as required if the field is marked as required
      if (field?.required) {
        const error = validateRequired(value, key);
        if (error) newErrors[key] = error;
      }
    });

    // ── Terms & Conditions must be accepted on signup ──
    if (isSignupPage && !agreed) {
      newErrors.agreed = "You must accept the Terms & Conditions to continue.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── ROLE CLICK (login only) ──────────────────
  const handleRoleClick = (selectedRole) => {
    setRole(selectedRole);
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  // ── INPUT CHANGE ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    if (["name", "state", "city"].includes(name)) {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    // Track when autofill fires so submit can ignore accidental triggers
    if (e.nativeEvent?.inputType === undefined) {
      lastAutofillRef.current = Date.now();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── SUBMIT ───────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    // Block submit if it fired within 500ms of an autofill event (browser auto-submit on credential select)
    if (Date.now() - lastAutofillRef.current < 500) return;
    if (!validate()) return;
    onSubmit({ ...formData, role, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">




      {/* ✅ Login — show role selection */}
      {isLoginPage && (
        <div className="flex gap-4 mb-6 justify-center md:justify-start rounded-md">
          <div
            onClick={() => handleRoleClick(USER_ROLES.INDIVIDUAL)}
            className={`flex-1 flex flex-col items-center p-4 border rounded-md cursor-pointer transition
        ${role === USER_ROLES.INDIVIDUAL
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 hover:bg-gray-50"
              }`}
          >
            <FiUser className={`text-2xl mb-2 p-1 rounded-[5px] h-10 w-10 text-white ${role === USER_ROLES.INDIVIDUAL ? "bg-blue-600" : "bg-gray-400"}`} />
            <span className="font-semibold text-[13px]">Individual</span>
          </div>

          <div
            onClick={() => handleRoleClick(USER_ROLES.TRAVELLER)}
            className={`flex-1 flex flex-col items-center p-4 border rounded-md cursor-pointer transition
        ${role === USER_ROLES.TRAVELLER
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 hover:bg-gray-50"
              }`}
          >
            <FaRoute className={`text-2xl mb-2 text-white bg-blue-600 p-1 rounded-[5px] h-10 w-10 ${role === USER_ROLES.TRAVELLER ? "bg-blue-600" : "bg-gray-400"} `} />
            <span className="font-semibold text-[13px]">Traveler</span>
          </div>
        </div>
      )}

      {/* Dynamic Fields */}
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.name}>
            {field.name === "phone_number" ? (
              <div>
                {field.label && (
                  <label className="text-[11px] text-gray-600 block mb-1">
                    Phone Number {field.required && <span className="text-red-500">*</span>}
                  </label>
                )}
                <div className="flex">
                  <span className="px-3 flex items-center bg-gray-100 border border-r-0 rounded-l-md text-gray-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder={field.placeholder || "Enter mobile number"}
                    className={`w-full border rounded-r-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${errors.phone_number ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                </div>
                
              </div>
            ) : field.name === "password" || field.name === "confirmPassword" ? (
              <div className="space-y-1">
                {field.label && (
                  <label className="text-[11px] text-gray-600 block">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                )}
                <div className="relative">
                  {field.icon && (
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  )}
                  <input
                    type={
                      field.name === "password"
                        ? (showPassword ? "text" : "password")
                        : (showConfirmPassword ? "text" : "password")
                    }
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => field.name === "password" && setShowPasswordHint(true)}
                    onBlur={() => field.name === "password" && setShowPasswordHint(false)}
                    placeholder={field.placeholder}
                    autoComplete={isLoginPage ? (field.name === "password" ? "current-password" : "off") : "new-password"}
                    className={`w-full border rounded-md py-2 pr-10 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${field.icon ? "pl-10" : "px-3"
                      } ${errors[field.name] ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  <div
                    onClick={() => {
                      if (field.name === "password") {
                        setShowPassword(!showPassword);
                      } else {
                        setShowConfirmPassword(!showConfirmPassword);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                  >
                    {field.name === "password"
                      ? (showPassword ? <FaEye /> : <FaEyeSlash />)
                      : (showConfirmPassword ? <FaEye /> : <FaEyeSlash />)
                    }
                  </div>
                </div>
              </div>
            ) : (
              <TextInput
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                className={errors[field.name] ? "border-red-500" : ""}
                autoComplete={isSignupPage ? "off" : field.name === "email" ? "email" : "off"}
              />
            )}

            {/* Password strength — signup only */}
            {field.name === "password" && isSignupPage && showPasswordHint && (
              <div className="text-xs mt-2 space-y-1">
                <p className={passwordChecks.length ? "text-green-600" : "text-gray-400"}>• At least 8 characters</p>
                <p className={passwordChecks.uppercase ? "text-green-600" : "text-gray-400"}>• One uppercase letter</p>
                <p className={passwordChecks.lowercase ? "text-green-600" : "text-gray-400"}>• One lowercase letter</p>
                <p className={passwordChecks.number ? "text-green-600" : "text-gray-400"}>• One number</p>
                <p className={passwordChecks.special ? "text-green-600" : "text-gray-400"}>• One special character</p>
              </div>
            )}

            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
      {isSignupPage && (
        <div className="mt-2">
          <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                // Clear the error as soon as they check the box
                if (e.target.checked && errors.agreed) {
                  setErrors((prev) => ({ ...prev, agreed: "" }));
                }
              }}
              className="mt-0.5 w-4 h-4 min-w-[16px] min-h-[16px] accent-blue-600 border border-gray-300 rounded-sm cursor-pointer"
            />
            <span>
              I agree to the{" "}
              <span
                onClick={() => setTermsOpen(true)}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Terms & Conditions
              </span>
              {" "}and{" "}
              <span
                onClick={() => setPolicyOpen(true)}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Privacy Policy
              </span>
            </span>
          </label>
          {/* Show validation error if user tries to submit without agreeing */}
          {errors.agreed && (
            <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>
          )}
        </div>
      )}

      {/* {isLoginPage && (
        <div className="flex justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-600 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 min-w-[16px] min-h-[16px] accent-blue-600 border border-gray-300 rounded-sm cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <Link to={RoutePath.AUTH_FORGOT_PASSWORD} className="text-blue-600 hover:underline text-xs items-center mt-2">
            Forgot Password?
          </Link>
        </div>

      )} */}

      {/* Submit */}
      <Button fullWidth disabled={disabled}>
        {submitText}
      </Button>

      {/* Social login — only shown when Google handler is provided (login page) */}
      {onGoogleLogin && (
        <>
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Continue with Google — full-width, matches Google brand guidelines */}
          <button

            type="button"
            onClick={() => onGoogleLogin(role)}
            disabled={disabled}
            aria-label="Continue with Google"
            className="
            w-full flex items-center justify-center gap-3
            px-4 py-2.5 rounded-lg border border-gray-300
            bg-white text-gray-700 text-sm font-medium
            hover:bg-gray-50 hover:border-gray-400
            transition-all duration-150
            disabled:opacity-60 disabled:cursor-not-allowed
            shadow-sm
            "
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>
        </>
      )}

      <TermModel
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setAgreed(true);
          if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: "" }));
          setTermsOpen(false);
        }}
      />
      <PrivacyModel
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
      />
    </form>
  );
};

export default AuthForm;


