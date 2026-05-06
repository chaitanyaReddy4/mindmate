import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCircleNotch,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLock,
  FaRegEnvelope,
  FaUser
} from "react-icons/fa6";
import AuthShell from "../components/AuthShell";
import { oauthLoginUrl } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const emptyErrors = { name: "", email: "", password: "" };

function SignupView() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { signup, isAuthenticated, isBootstrapping, readErrorMessage } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState(emptyErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, navigate]);

  const validate = () => {
    const nextErrors = { ...emptyErrors };

    if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      nextErrors.password =
        "Use 8+ characters with uppercase, lowercase, and a number.";
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setStatusMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      setStatusMessage("Please review the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      showToast({
        title: "Account created",
        message: "Sign in with your new account.",
        variant: "success"
      });

      navigate("/login", {
        replace: true,
        state: {
          from: location.state?.from,
          signupEmail: form.email.trim().toLowerCase()
        }
      });
    } catch (error) {
      const message = readErrorMessage(error, "Please try again.");
      setStatusMessage(message);
      showToast({
        title: "Sign up failed",
        message,
        variant: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up a calmer, private workspace for reflection and daily habits."
      footer={
        <p className="auth-footer-copy">
          Already have an account? <Link to="/login">Sign in</Link>
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
        <label className={`floating-field ${errors.name ? "has-error" : ""}`}>
          <span>Name</span>
          <div className="field-shell">
            <FaUser className="field-icon" />
            <input
              type="text"
              autoComplete="name"
              autoFocus
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder=" "
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  emailRef.current?.focus();
                }
              }}
            />
          </div>
          {errors.name ? <small>{errors.name}</small> : null}
        </label>

        <label className={`floating-field ${errors.email ? "has-error" : ""}`}>
          <span>Email</span>
          <div className="field-shell">
            <FaRegEnvelope className="field-icon" />
            <input
              ref={emailRef}
              type="email"
              autoComplete="email"
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
              autoComplete="new-password"
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
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

export default SignupView;
