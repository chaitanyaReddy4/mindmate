/*
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa6";
import AuthShell from "../components/AuthShell";
import { oauthLoginUrl } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const passwordRef = useRef(null);
  const { login, isAuthenticated, readErrorMessage } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!validate()) return;

  setIsSubmitting(true);

  try {
    await login(form); // ✅ THIS IS IMPORTANT

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || "/", { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  useEffect(() => {
    if (location.search.includes("google_auth_failed")) {
      showToast({
        title: "Google sign-in failed",
        message: "Please try again or continue with email and password.",
        variant: "error"
      });
    }
  }, [location.search, showToast]);

  const validate = () => {
    const nextErrors = {};

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(form);
      showToast({
        title: "Welcome back",
        message: "Your workspace is ready.",
        variant: "success"
      });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      showToast({
        title: "Sign in failed",
        message: readErrorMessage(error, "Please check your credentials."),
        variant: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to your wellness workspace"
      subtitle="Securely access your conversations, daily habits, and private reflections from one place."
      sideLabel="Secure Access"
      footer={
        <p className="auth-footer-copy">
          New here? <Link to="/signup">Create your account</Link>
        </p>
      }
    >
      <div className="auth-form-header">
        <h2>Welcome back</h2>
        <p>Use your MindMate account to continue.</p>
      </div>

      <motion.a
        href={oauthLoginUrl}
        className="oauth-button"
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
      >
        <FaGoogle />
        <span>Continue with Google</span>
      </motion.a>

      <div className="auth-divider">
        <span>or use email</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className={`floating-field ${form.email ? "has-value" : ""}`}>
          <span>Email address</span>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                passwordRef.current?.focus();
              }
            }}
          />
          {errors.email ? <small>{errors.email}</small> : null}
        </label>

        <label className={`floating-field ${form.password ? "has-value" : ""}`}>
          <span>Password</span>
          <div className="password-field-shell">
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value
                }))
              }
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

        <motion.button
          type="submit"
          className="auth-submit-button"
          disabled={isSubmitting}
          whileHover={isSubmitting ? undefined : { y: -1, scale: 1.01 }}
          whileTap={isSubmitting ? undefined : { scale: 0.985 }}
        >
          <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
          <FaArrowRight />
        </motion.button>
      </form>
    </AuthShell>
  );
}

export default Login;
*/

export { default } from "./LoginView";
