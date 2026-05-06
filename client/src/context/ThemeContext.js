import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_SETTINGS, readStorage, STORAGE_KEYS } from "../dashboardUtils";

const THEME_STORAGE_KEY = "mindmate_theme_mode";

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [accentMode, setAccentMode] = useState(() => {
    const storedSettings = readStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    return storedSettings.accentMode || DEFAULT_SETTINGS.accentMode;
  });

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = accentMode;
    document.documentElement.style.colorScheme = theme;
  }, [accentMode, theme]);

  const value = useMemo(
    () => ({
      theme,
      accentMode,
      isDark: theme === "dark",
      setTheme,
      setAccentMode,
      toggleTheme() {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
      }
    }),
    [accentMode, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
