import axios from 'axios';

const BASE_URL = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL || '';

const apiClient = axios?.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Token Storage Helpers ────────────────────────────────────────────────────
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  getUserId: () => localStorage.getItem('user_id'),
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
  },
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient?.interceptors?.request?.use(
  (config) => {
    const token = tokenStorage?.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor with Token Refresh ─────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue?.forEach((prom) => {
    if (error) {
      prom?.reject(error);
    } else {
      prom?.resolve(token);
    }
  });
  failedQueue = [];
};

const forceLogout = () => {
  tokenStorage?.clearTokens();
  window.dispatchEvent(new CustomEvent('auth:logout'));
  window.location.href = '/login';
};

apiClient?.interceptors?.response?.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // Network failure
    if (!error?.response) {
      console.error('API: Network error or request timeout');
      return Promise.reject({
        ...error,
        userMessage: 'Network error. Please check your connection and try again.',
      });
    }

    // 401 Unauthorized — attempt token refresh
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          ?.then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          ?.catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage?.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        forceLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios?.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken =
          response?.data?.accessToken ||
          response?.data?.access_token ||
          response?.data?.token;

        const newRefreshToken =
          response?.data?.refreshToken ||
          response?.data?.refresh_token;

        if (newAccessToken) {
          tokenStorage?.setTokens(newAccessToken, newRefreshToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 Forbidden
    if (error?.response?.status === 403) {
      console.warn('API: Access forbidden (403)');
    }

    // 500+ Server errors
    if (error?.response?.status >= 500) {
      console.error('API: Server error', error?.response?.status);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
