import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://mindmate-0ee2.onrender.com";
const ACCESS_TOKEN_KEY = "mindmate_access_token";
const AUTH_MODE_KEY = "mindmate_auth_mode";

let onUnauthorized = null;
let refreshPromise = null;

const readTokenFromStorage = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ||
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
    ""
  );
};

let accessToken = readTokenFromStorage();

const writeTokenToStorage = (token, rememberMe = true) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);

  if (!token) {
    window.localStorage.removeItem(AUTH_MODE_KEY);
    return;
  }

  if (rememberMe) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    window.localStorage.setItem(AUTH_MODE_KEY, "persistent");
    return;
  }

  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_MODE_KEY, "session");
};

export const getRememberedAuthMode = () => {
  if (typeof window === "undefined") {
    return "persistent";
  }

  return window.localStorage.getItem(AUTH_MODE_KEY) || "persistent";
};

export const setAccessToken = (token, rememberMe = true) => {
  accessToken = token || "";
  writeTokenToStorage(accessToken, rememberMe);
};

export const clearStoredAuth = () => {
  setAccessToken("");
};

export const getAccessToken = () => accessToken;

export const registerUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config };

  if (accessToken) {
    nextConfig.headers = {
      ...(nextConfig.headers || {}),
      Authorization: `Bearer ${accessToken}`
    };
  }

  return nextConfig;
});

const requestTokenRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/auth/refresh-token")
      .then((response) => {
        const nextToken = response.data?.accessToken || "";
        const rememberMode = getRememberedAuthMode();
        setAccessToken(nextToken, rememberMode !== "session");
        return nextToken;
      })
      .catch((error) => {
        clearStoredAuth();

        if (onUnauthorized) {
          onUnauthorized();
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/signup") &&
      !originalRequest.url?.includes("/auth/forgot-password") &&
      !originalRequest.url?.includes("/auth/refresh-token") &&
      !originalRequest.url?.includes("/auth/logout")
    ) {
      originalRequest._retry = true;

      try {
        const nextToken = await requestTokenRefresh();
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${nextToken}`
        };

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const oauthLoginUrl = `${API_BASE_URL}/api/auth/google`;
