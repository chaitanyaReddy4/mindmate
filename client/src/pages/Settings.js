import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowRightFromBracket,
  FaBell,
  FaBrain,
  FaBrush,
  FaClock,
  FaMoon,
  FaShieldHeart,
  FaSun,
  FaUserGear
} from "react-icons/fa6";
import { DEFAULT_SETTINGS, readStorage, STORAGE_KEYS, writeStorage } from "../dashboardUtils";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

function Toggle({ checked, onChange, label, hint, icon }) {
  const Icon = icon;

  return (
    <label className="settings-row">
      <div className="settings-row-copy">
        <strong>
          {Icon ? <Icon className="settings-inline-icon" /> : null}
          {label}
        </strong>
        <span>{hint}</span>
      </div>
      <button
        type="button"
        className={`toggle-switch ${checked ? "is-active" : ""}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span />
      </button>
    </label>
  );
}

function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme, accentMode, setAccentMode } = useTheme();
  const [settings, setSettings] = useState(() =>
    readStorage(STORAGE_KEYS.settings, {
      ...DEFAULT_SETTINGS,
      themeMode: theme,
      accentMode
    })
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    if (user?.name && !settings.fullName) {
      setSettings((current) => ({ ...current, fullName: user.name }));
    }
  }, [settings.fullName, user?.name]);

  useEffect(() => {
    setSettings((current) => ({
      ...current,
      themeMode: theme,
      accentMode
    }));
  }, [accentMode, theme]);

  const sessionStarted = useMemo(
    () => new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    []
  );

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleThemeToggle = (enabled) => {
    const nextTheme = enabled ? "dark" : "light";
    setTheme(nextTheme);
    updateSetting("themeMode", nextTheme);
  };

  const handleAccentChange = (value) => {
    setAccentMode(value);
    updateSetting("accentMode", value);
  };

  const handleLogout = async () => {
    await logout();
    showToast({
      title: "Signed out",
      message: "Your session has been cleared safely.",
      variant: "success"
    });
    navigate("/login", { replace: true });
  };

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">
            Adjust appearance, notifications, privacy, and the tone of your workspace.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <section className="surface-card">
          <div className="settings-section-header">
            <FaUserGear className="section-icon" />
            <div>
              <h2 className="section-title">Account</h2>
              <p className="muted-copy">Your core account details and session state.</p>
            </div>
          </div>

          <div className="settings-field-grid">
            <label className="settings-field">
              <span>Full name</span>
              <input
                value={settings.fullName}
                onChange={(event) => updateSetting("fullName", event.target.value)}
                placeholder={user?.name || "MindMate User"}
              />
            </label>
            <label className="settings-field">
              <span>Email</span>
              <input value={user?.email || ""} disabled />
            </label>
          </div>
        </section>

        <section className="surface-card">
          <div className="settings-section-header">
            <FaBrush className="section-icon" />
            <div>
              <h2 className="section-title">Appearance</h2>
              <p className="muted-copy">Theme and accent settings for a calmer workspace.</p>
            </div>
          </div>

          <Toggle
            checked={theme === "dark"}
            onChange={handleThemeToggle}
            label={theme === "dark" ? "Dark theme" : "Light theme"}
            hint="Switch between a deep night palette and a soft daylight palette."
            icon={theme === "dark" ? FaMoon : FaSun}
          />

          <label className="settings-field">
            <span>Accent palette</span>
            <select
              value={settings.accentMode}
              onChange={(event) => handleAccentChange(event.target.value)}
            >
              <option value="ocean">Ocean</option>
              <option value="sage">Sage</option>
              <option value="sunrise">Sunrise</option>
            </select>
          </label>
        </section>

        <section className="surface-card">
          <div className="settings-section-header">
            <FaBell className="section-icon" />
            <div>
              <h2 className="section-title">Notifications</h2>
              <p className="muted-copy">Choose how often MindMate gently checks in.</p>
            </div>
          </div>

          <Toggle
            checked={settings.dailyReminder}
            onChange={(value) => updateSetting("dailyReminder", value)}
            label="Daily reminder"
            hint="Prompt a daily journal or chat check-in."
          />
          <Toggle
            checked={settings.weeklyDigest}
            onChange={(value) => updateSetting("weeklyDigest", value)}
            label="Weekly digest"
            hint="Show a weekly summary of moods, habits, and insights."
          />
          <Toggle
            checked={settings.sessionAlerts}
            onChange={(value) => updateSetting("sessionAlerts", value)}
            label="Session alerts"
            hint="Warn you before your session expires."
          />
        </section>

        <section className="surface-card">
          <div className="settings-section-header">
            <FaShieldHeart className="section-icon" />
            <div>
              <h2 className="section-title">Security</h2>
              <p className="muted-copy">Privacy-focused controls for your personal space.</p>
            </div>
          </div>

          <Toggle
            checked={settings.biometricLock}
            onChange={(value) => updateSetting("biometricLock", value)}
            label="Biometric lock"
            hint="Require device confirmation when available."
          />

          <div className="settings-row settings-static-row">
            <div className="settings-row-copy">
              <strong>
                <FaClock className="settings-inline-icon" />
                Session info
              </strong>
              <span>Active session started on {sessionStarted}.</span>
            </div>
          </div>
        </section>

        <section className="surface-card">
          <div className="settings-section-header">
            <FaBrain className="section-icon" />
            <div>
              <h2 className="section-title">AI Preferences</h2>
              <p className="muted-copy">Tune how supportive and detailed responses feel.</p>
            </div>
          </div>

          <Toggle
            checked={settings.calmingTone}
            onChange={(value) => updateSetting("calmingTone", value)}
            label="Calming tone"
            hint="Prefer gentler, more grounding language."
          />
          <Toggle
            checked={settings.conciseReplies}
            onChange={(value) => updateSetting("conciseReplies", value)}
            label="Concise replies"
            hint="Keep AI responses shorter and easier to scan."
          />

          <label className="settings-field">
            <span>Insight depth</span>
            <select
              value={settings.insightDepth}
              onChange={(event) => updateSetting("insightDepth", event.target.value)}
            >
              <option value="light">Light</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </select>
          </label>
        </section>

        <section className="surface-card">
          <div className="settings-section-header">
            <FaArrowRightFromBracket className="section-icon" />
            <div>
              <h2 className="section-title">Logout</h2>
              <p className="muted-copy">End your current session on this device.</p>
            </div>
          </div>

          <button type="button" className="toolbar-button toolbar-button-danger" onClick={handleLogout}>
            <FaArrowRightFromBracket />
            <span>Log out</span>
          </button>
        </section>
      </div>
    </section>
  );
}

export default Settings;
