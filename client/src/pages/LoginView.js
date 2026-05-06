import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCircleNotch,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLock,
  FaRegEnvelope
} from "react-icons/fa6";
import AuthShell from "../components/AuthShell";
import { oauthLoginUrl } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const emptyErrors = { email: "", password: "" };

function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const passwordRef = useRef(null);
  const {
    login,
    rememberMe,
    requestPasswordReset,
    isAuthenticated,
    isBootstrapping,
    readErrorMessage
  } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: location.state?.signupEmail || "",
    password: "",
    rememberMe
  });
  const [errors, setErrors] = useState(emptyErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const redirectTarget = useMemo(
    () => location.state?.from?.pathname || "/dashboard",
    [location.state]
  );

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, navigate, redirectTarget]);

  useEffect(() => {
    const hasGoogleFailure = new URLSearchParams(location.search).get("error");

    if (hasGoogleFailure === "google_auth_failed") {
      showToast({
        title: "Google sign-in failed",
        message: "Please try again or continue with email and password.",
        variant: "error"
      });
    }
  }, [location.search, showToast]);

  const validate = () => {
    const nextErrors = { ...emptyErrors };

    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setStatusMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      setStatusMessage("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        rememberMe: form.rememberMe
      });

      showToast({
        title: "Welcome back",
        message: "Your workspace is ready.",
        variant: "success"
      });
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      const message = readErrorMessage(
        error,
        "Please check your credentials and try again."
      );

      setStatusMessage(message);
      showToast({
        title: "Sign in failed",
        message,
        variant: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      setErrors((current) => ({
        ...current,
        email: "Enter your email first to request a reset."
      }));
      return;
    }

    setIsResetting(true);

    try {
      const response = await requestPasswordReset(form.email.trim().toLowerCase());
      showToast({
        title: "Reset requested",
        message: response.message,
        variant: "success"
      });
    } catch (error) {
      showToast({
        title: "Reset unavailable",
        message: readErrorMessage(error, "Please try again later."),
        variant: "error"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your journal, habits, and AI check-ins."
      footer={
        <p className="auth-footer-copy">
          New here? <Link to="/signup">Create account</Link>
        </p>
      }
    >
      <motion.a
        href={oauthLoginUrl}
        className="oauth-button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
      >
        <FaGoogle />
        <span>Continue with Google</span>
      </motion.a>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className={`floating-field ${errors.email ? "has-error" : ""}`}>
          <span>Email</span>
          <div className="field-shell">
            <FaRegEnvelope className="field-icon" />
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder=" "
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
            />
          </div>
          {errors.email ? <small>{errors.email}</small> : null}
        </label>

        <label className={`floating-field ${errors.password ? "has-error" : ""}`}>
          <span>Password</span>
          <div className="field-shell password-field-shell">
            <FaLock className="field-icon" />
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder=" "
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password ? <small>{errors.password}</small> : null}
        </label>

        <div className="auth-meta-row">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(event) => updateField("rememberMe", event.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="text-button"
            onClick={handleForgotPassword}
            disabled={isResetting}
          >
            {isResetting ? "Sending..." : "Forgot password?"}
          </button>
        </div>

        <motion.button
          type="submit"
          className="auth-submit-button"
          disabled={isSubmitting}
          whileHover={isSubmitting ? undefined : { y: -1 }}
          whileTap={isSubmitting ? undefined : { scale: 0.99 }}
        >
          {isSubmitting ? (
            <>
              <FaCircleNotch className="auth-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </motion.button>

        <div
          className={`auth-status ${
            statusMessage ? "auth-status-visible auth-status-error" : ""
          }`}
          aria-live="polite"
        >
          {statusMessage || " "}
        </div>
      </form>
    </AuthShell>
  );
}

export default LoginView;
