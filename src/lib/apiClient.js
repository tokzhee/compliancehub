import axios from 'axios';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';

const apiClient = axios?.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
apiClient?.interceptors?.request?.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh on 401
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

apiClient?.interceptors?.response?.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })?.then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })?.catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios?.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const newToken = response?.data?.accessToken || response?.data?.token;
        if (newToken) {
          localStorage.setItem('access_token', newToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No token in refresh response');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
