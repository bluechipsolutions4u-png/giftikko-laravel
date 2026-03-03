   import axios from "axios";

// Determine base URL (support Create React App env var name)
// Note: avoid `import.meta` here for CRA (Babel will throw). If you migrate to Vite, set VITE_API_URL in your Vite env.
const baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper: set and clear token centrally
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

export function clearAuthToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  delete api.defaults.headers.common.Authorization;
}

// 🔐 Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response interceptor (handle responses & errors)
api.interceptors.response.use(
  (response) => {
    try {
      const url = response.config?.url || '';

      // On successful login, store token + role centrally
      if (url.endsWith('/login') && response.data) {
        const token = response.data.access_token || response.data.token;
        if (token) {
          setAuthToken(token);
        }
        if (response.data.role) {
          localStorage.setItem('role', response.data.role);
        }
      }

      // On logout, clear token
      if (url.endsWith('/logout')) {
        clearAuthToken();
      }
    } catch (e) {
      // ignore errors during response processing
      console.error('[apiMiddleware] response handler error', e);
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Token expired / unauthorized
    if (status === 401) {
      // For login/register requests, let the UI handle the 401 (don't redirect)
      if (url.endsWith('/login') || url.endsWith('/register')) {
        return Promise.reject(error);
      }

      // For other requests, clear auth and redirect to login
      clearAuthToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
