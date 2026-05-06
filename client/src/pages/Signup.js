/*
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa6";
import AuthShell from "../components/AuthShell";
import { oauthLoginUrl } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { signup, isAuthenticated, readErrorMessage } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || "/", { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  const validate = () => {
    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      nextErrors.password =
        "Use 8+ characters with uppercase, lowercase, and a number.";
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
      await signup(form);
      showToast({
        title: "Account created",
        message: "Welcome to your MindMate workspace.",
        variant: "success"
      });
      navigate("/", { replace: true });
    } catch (error) {
      showToast({
        title: "Sign up failed",
        message: readErrorMessage(error, "Please try again."),
        variant: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create a calm, private home for your daily check-ins"
      subtitle="Start tracking reflections, hydration, and emotional trends with protected, account-based history."
      sideLabel="Premium Setup"
      footer={
        <p className="auth-footer-copy">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <div className="auth-form-header">
        <h2>Create account</h2>
        <p>Set up secure access in less than a minute.</p>
      </div>

      <motion.a
        href={oauthLoginUrl}
        className="oauth-button"
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
      >
        <FaGoogle />
        <span>Sign up with Google</span>
      </motion.a>

      <div className="auth-divider">
        <span>or use email</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className={`floating-field ${form.name ? "has-value" : ""}`}>
          <span>Full name</span>
          <input
            type="text"
            autoComplete="name"
            autoFocus
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                emailRef.current?.focus();
              }
            }}
          />
          {errors.name ? <small>{errors.name}</small> : null}
        </label>

        <label className={`floating-field ${form.email ? "has-value" : ""}`}>
          <span>Email address</span>
          <input
            ref={emailRef}
            type="email"
            autoComplete="email"
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
              autoComplete="new-password"
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
          <span>{isSubmitting ? "Creating account..." : "Create account"}</span>
          <FaArrowRight />
        </motion.button>
      </form>
    </AuthShell>
  );
}

export default Signup;
*/

export { default } from "./SignupView";
