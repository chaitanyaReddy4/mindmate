import React from "react";
import { motion } from "framer-motion";
import { FaBrain } from "react-icons/fa6";
import { Link } from "react-router-dom";

const shellMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: "easeOut" }
};

function AuthShell({ title, subtitle, footer, children }) {
  return (
    <div className="auth-page-shell">
      <Link className="auth-corner-brand" to="/">
        <span className="auth-brand-icon">
          <FaBrain />
        </span>
        <span className="auth-brand-name">MindMate</span>
      </Link>

      <motion.section className="auth-card-shell" {...shellMotion}>
        {title ? <h1 className="auth-shell-title">{title}</h1> : null}
        {subtitle ? <p className="auth-shell-subtitle">{subtitle}</p> : null}

        <div className="auth-form-card">
          {children}
          {footer}
        </div>
      </motion.section>
    </div>
  );
}

export default AuthShell;
