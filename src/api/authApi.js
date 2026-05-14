import apiClient from './apiClient';


export const authApi = {
  /**
   * POST /api/auth/login
   * @param {string} username
   * @param {string} password
   */
  login: async (username, password) => {
    const response = await apiClient?.post('/api/auth/login', { username, password });
    return response?.data;
  },

  /**
   * POST /api/auth/refresh
   * @param {string} refreshToken
   */
  refresh: async (refreshToken) => {
    const response = await apiClient?.post('/api/auth/refresh', { refreshToken });
    return response?.data;
  },

  /**
   * POST /api/auth/logout
   */
  logout: async () => {
    try {
      const response = await apiClient?.post('/api/auth/logout');
      return response?.data;
    } catch {
      // Ignore logout API errors — always clear local state
      return null;
    }
  },

  /**
   * GET /api/auth/profile?userId=
   * @param {string} userId
   */
  getProfile: async (userId) => {
    const response = await apiClient?.get('/api/auth/profile', { params: { userId } });
    return response?.data;
  },

  /**
   * GET /api/auth/session?userId=&refreshToken=
   * @param {string} userId
   * @param {string} refreshToken
   */
  getSession: async (userId, refreshToken) => {
    const response = await apiClient?.get('/api/auth/session', {
      params: { userId, refreshToken },
    });
    return response?.data;
  },
};

export default authApi;
