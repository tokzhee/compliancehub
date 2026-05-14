import apiClient from './apiClient';

export const dashboardApi = {
  /**
   * GET /api/dashboard/metrics
   * @param {object} params - { organizationId }
   */
  getMetrics: async (params = {}) => {
    const response = await apiClient?.get('/api/dashboard/metrics', { params });
    return response?.data;
  },

  /**
   * GET /api/dashboard/admin-metrics
   * @param {object} params - { organizationId }
   */
  getAdminMetrics: async (params = {}) => {
    const response = await apiClient?.get('/api/dashboard/admin-metrics', { params });
    return response?.data;
  },

  /**
   * GET /api/dashboard/activities
   * @param {object} params - { organizationId, limit }
   */
  getRecentActivity: async (params = {}) => {
    const response = await apiClient?.get('/api/dashboard/activities', { params });
    return response?.data;
  },
};

export default dashboardApi;
