import apiClient from '../lib/apiClient';

export const dashboardService = {
  async getDashboardMetrics(organizationId) {
    const response = await apiClient?.get('/api/dashboard/metrics', {
      params: { organizationId }
    });
    return response?.data || {};
  },

  async getAdminMetrics(organizationId) {
    const response = await apiClient?.get('/api/dashboard/admin-metrics', {
      params: { organizationId }
    });
    const data = Array.isArray(response?.data) ? response?.data?.[0] : response?.data;
    if (data) {
      return {
        ...data,
        activeSessions: data?.activeUsers ?? 0,
        recentActivity: data?.activitiesLast7Days ?? data?.totalActivities ?? 0,
        ldapConfigs: data?.activeADConfigs ?? 0
      };
    }
    return {};
  },

  async getRecentActivities(organizationId, limit = 10) {
    const response = await apiClient?.get('/api/dashboard/activities', {
      params: { organizationId, limit }
    });
    return response?.data || [];
  }
};
