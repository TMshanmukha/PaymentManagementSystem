import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || 'https://paymentmangement-backend-uwhd.onrender.com/api';

// Handle legacy or misconfigured URL in Vercel project environment variables
if (rawUrl.includes('paymentmangement-backend.onrender.com') && !rawUrl.includes('paymentmangement-backend-uwhd')) {
  rawUrl = rawUrl.replace('paymentmangement-backend.onrender.com', 'paymentmangement-backend-uwhd.onrender.com');
}

const API_URL = rawUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawUrl.replace(/\/+$/, '')
  : `${rawUrl.replace(/\/+$/, '')}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the HTTP-only refresh cookie
});

// In-memory access token (never localStorage — reduces XSS token-theft surface).
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  const yearId = localStorage.getItem('selected_academic_year_id');
  if (yearId) {
    config.headers['X-Academic-Year-Id'] = yearId;
  }
  return config;
});

// Queue concurrent requests while a token refresh is in-flight so we don't
// fire multiple parallel /refresh calls on a burst of 401s.
let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

let onAuthFailure = () => {};
export function registerAuthFailureHandler(fn) {
  onAuthFailure = fn;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        onAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403 && errorCode === 'ACCOUNT_INACTIVE') {
      setAccessToken(null);
      onAuthFailure();
    }

    return Promise.reject(error);
  }
);

/** Extracts a friendly error message from an Axios error, per the backend's error format. */
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || fallback;
}
