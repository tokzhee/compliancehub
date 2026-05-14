import apiClient from '../lib/apiClient';

export const ruleService = {
  async getRules(organizationId, filters = {}) {
    try {
      const params = { organizationId };
      if (filters?.status && filters?.status !== 'all') params.status = filters?.status;
      if (filters?.ruleType && filters?.ruleType !== 'all') params.ruleType = filters?.ruleType;
      if (filters?.search) params.search = filters?.search;

      const response = await apiClient?.get('/api/rules', { params });
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching rules:', error?.message);
      return [];
    }
  },

  async createRule(ruleData) {
    try {
      const response = await apiClient?.post('/api/rules', {
        organizationId: ruleData?.organizationId,
        ruleName: ruleData?.ruleName,
        ruleType: ruleData?.ruleType,
        description: ruleData?.description,
        createdBy: ruleData?.createdBy,
        ruleLogic: ruleData?.ruleLogic || {}
      });
      return { data: response?.data };
    } catch (error) {
      console.error('Error creating rule:', error?.message);
      return { error };
    }
  },

  async updateRuleStatus(ruleId, status, userId) {
    try {
      const response = await apiClient?.put(`/api/rules/${ruleId}/status`, { status, userId });
      return { data: response?.data };
    } catch (error) {
      console.error('Error updating rule status:', error?.message);
      return { error };
    }
  },

  async deleteRule(ruleId) {
    try {
      await apiClient?.delete(`/api/rules/${ruleId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting rule:', error?.message);
      return { error };
    }
  }
};
