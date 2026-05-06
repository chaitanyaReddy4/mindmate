import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaBars,
  FaBookOpen,
  FaBrain,
  FaChartColumn,
  FaComments,
  FaGear,
  FaHeartPulse,
  FaXmark
} from "react-icons/fa6";

const navItems = [
  { to: "/chat", label: "Chat", icon: FaComments },
  { to: "/dashboard", label: "Dashboard", icon: FaChartColumn },
  { to: "/wellness", label: "Wellness", icon: FaHeartPulse },
  { to: "/journal", label: "Journal", icon: FaBookOpen },
  { to: "/settings", label: "Settings", icon: FaGear }
];

function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onToggleMobile, onLogout }) {
  return (
    <>
      <button
        type="button"
        className="mobile-nav-trigger"
        onClick={onToggleMobile}
        aria-label="Open navigation"
      >
        <FaBars />
      </button>

      <aside
        className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <button
              type="button"
              className="sidebar-brand-toggle brand-link"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="brand-icon">
                <FaBrain />
              </div>
              <div className="brand-copy">
                <h1 className="brand-title">MindMate</h1>
              </div>
            </button>

            <button
              type="button"
              className="sidebar-icon-button sidebar-mobile-close"
              onClick={onToggleMobile}
              aria-label="Close navigation"
            >
              <FaXmark />
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  data-tooltip={collapsed ? item.label : ""}
                  className={({ isActive }) =>
                    `sidebar-tab ${isActive ? "active" : ""}`
                  }
                  onClick={mobileOpen ? onToggleMobile : undefined}
                >
                  <span className="sidebar-tab-icon">
                    <Icon />
                  </span>
                  <span className="sidebar-tab-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-actions">
          <button
            type="button"
            onClick={onLogout}
            className="sidebar-secondary-button logout-button"
          >
            <FaArrowRightFromBracket />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={onToggleMobile}
          aria-label="Close navigation overlay"
        />
      ) : null}
    </>
  );
}

export default memo(Sidebar);
