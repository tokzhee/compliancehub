// src/api/apiClient.js (or src/lib/apiClient.js)
import axios from 'axios';

// ─── Token storage helpers ──────────────────────────────────────────────
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  getUserId: () => localStorage.getItem('user_id'),
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
  }
};

// ─── Axios instance ─────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor – attach token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 globally (just dispatch event, no redirect)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// ✅ Default export (this is what your imports expect)
export default apiClient;