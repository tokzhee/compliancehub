import apiClient from '../lib/apiClient';

export const ruleService = {
  async getRules(organizationId, filters = {}) {
    try {
      const params = { organizationId };
      if (filters?.status && filters?.status !== 'all') params.status = filters?.status;
      if (filters?.regime && filters?.regime !== 'all') params.regime = filters?.regime;
      if (filters?.segmentId && filters?.segmentId !== 'all') params.segmentId = filters?.segmentId;
      if (filters?.year && filters?.year !== 'all') params.year = filters?.year;
      if (filters?.search) params.searchTerm = filters?.search;
      if (filters?.showRetired !== undefined) params.showRetired = filters?.showRetired;
      if (filters?.page) params.page = filters?.page;
      if (filters?.pageSize) params.pageSize = filters?.pageSize;

      const response = await apiClient?.get('/api/rules', { params });
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching rules:', error?.message);
      return [];
    }
  },

  async createRule(ruleData) {
    try {
      const payload = {
        ruleSetId: ruleData?.ruleSetId || null,
        organizationId: ruleData?.organizationId,
        ruleName: ruleData?.ruleName,
        regime: ruleData?.regime || ruleData?.regimeType,
        segment: ruleData?.segment || ruleData?.segmentId,
        reportingYear: ruleData?.reportingYear,
        description: ruleData?.description,
        createdBy: ruleData?.createdBy,
        conditions: typeof ruleData?.conditions === 'string'
          ? ruleData?.conditions
          : JSON.stringify(ruleData?.conditions || [])
      };
      const response = await apiClient?.post('/api/rules', payload);
      return { data: response?.data };
    } catch (error) {
      console.error('Error creating rule:', error?.message);
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
