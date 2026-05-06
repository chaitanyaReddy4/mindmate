import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  apiClient,
  clearStoredAuth,
  getAccessToken,
  getRememberedAuthMode,
  registerUnauthorizedHandler,
  setAccessToken
} from "../api/apiClient";

const AuthContext = createContext(null);

const readErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getAccessToken());
  const [rememberMe, setRememberMe] = useState(
    () => getRememberedAuthMode() !== "session"
  );
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setToken("");
    });
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        if (!getAccessToken()) {
          const refreshResponse = await apiClient.post("/auth/refresh-token");
          const refreshedToken = refreshResponse.data?.accessToken || "";

          if (refreshedToken) {
            setAccessToken(refreshedToken, getRememberedAuthMode() !== "session");
            setToken(refreshedToken);
          }
        }

        if (getAccessToken()) {
          const meResponse = await apiClient.get("/auth/me");
          setUser(meResponse.data.user);
          setToken(getAccessToken());
        } else {
          setUser(null);
        }
      } catch (_error) {
        clearStoredAuth();
        setUser(null);
        setToken("");
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, []);

  const authValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      async login(credentials) {
        const response = await apiClient.post("/auth/login", credentials);
        const nextToken = response.data.accessToken;
        const shouldRemember = credentials.rememberMe !== false;

        setAccessToken(nextToken, shouldRemember);
        setToken(nextToken);
        setUser(response.data.user);
        setRememberMe(shouldRemember);

        return response.data;
      },
      async signup(payload) {
        const response = await apiClient.post("/auth/signup", payload);

        try {
          await apiClient.post("/auth/logout");
        } catch (_error) {
          // Keep signup UX smooth even if logout cleanup is already complete.
        } finally {
          clearStoredAuth();
          setUser(null);
          setToken("");
          setRememberMe(true);
        }

        return response.data;
      },
      async logout() {
        try {
          await apiClient.post("/auth/logout");
        } finally {
          clearStoredAuth();
          setUser(null);
          setToken("");
          setRememberMe(true);
        }
      },
      async requestPasswordReset(email) {
        const response = await apiClient.post("/auth/forgot-password", { email });
        return response.data;
      },
      async syncCurrentUser() {
        const response = await apiClient.get("/auth/me");
        setUser(response.data.user);
        setToken(getAccessToken());
        return response.data.user;
      },
      acceptToken(nextToken, shouldRemember = true) {
        setAccessToken(nextToken, shouldRemember);
        setToken(nextToken || "");
        setRememberMe(shouldRemember);
      },
      rememberMe,
      readErrorMessage
    }),
    [isBootstrapping, rememberMe, token, user]
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
