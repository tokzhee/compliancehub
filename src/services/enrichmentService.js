import apiClient from '../lib/apiClient';

export const enrichmentService = {
  async getCasesForEnrichment(organizationId, userId, filters = {}) {
    try {
      const params = { organizationId, userId };
      if (filters?.status && filters?.status !== 'all') params.status = filters?.status;
      if (filters?.search) params.searchTerm = filters?.search;
      if (filters?.page) params.page = filters?.page;
      if (filters?.pageSize) params.pageSize = filters?.pageSize;

      const response = await apiClient?.get('/api/enrichment/cases', { params });
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching enrichment cases:', error?.message);
      return [];
    }
  },

  async getCaseDetails(caseId) {
    try {
      const response = await apiClient?.get(`/api/enrichment/cases/${caseId}/details`);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching case details:', error?.message);
      return [];
    }
  },

  async updateCaseField(caseId, updatedBy, fieldName, fieldValue) {
    try {
      const response = await apiClient?.post(`/api/enrichment/cases/${caseId}/fields`, {
        caseId,
        fieldName,
        fieldValue,
        updatedBy
      });
      return { data: response?.data };
    } catch (error) {
      console.error('Error updating case field:', error?.message);
      return { error };
    }
  },

  async markCaseReady(caseId) {
    try {
      const response = await apiClient?.put(`/api/enrichment/cases/${caseId}/ready`);
      return { data: response?.data };
    } catch (error) {
      console.error('Error marking case ready:', error?.message);
      return { error };
    }
  },

  async addCaseNote(caseId, createdBy, note) {
    try {
      const response = await apiClient?.post(`/api/enrichment/cases/${caseId}/notes`, {
        caseId,
        note,
        createdBy
      });
      return { data: response?.data };
    } catch (error) {
      console.error('Error adding case note:', error?.message);
      return { error };
    }
  },

  async getCaseNotes(caseId) {
    try {
      const response = await apiClient?.get(`/api/enrichment/cases/${caseId}/notes`);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching case notes:', error?.message);
      return [];
    }
  }
};

export default enrichmentService;