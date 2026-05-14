import apiClient from './apiClient';

export const enrichmentApi = {
  /**
   * GET /api/enrichment/cases
   * @param {object} params - { organizationId, userId, status, searchTerm, page, pageSize }
   */
  getCases: async (params = {}) => {
    const response = await apiClient?.get('/api/enrichment/cases', { params });
    return response?.data;
  },

  /**
   * GET /api/enrichment/cases/{caseId}/details
   * @param {string} caseId
   */
  getCaseDetails: async (caseId) => {
    const response = await apiClient?.get(`/api/enrichment/cases/${caseId}/details`);
    return response?.data;
  },

  /**
   * POST /api/enrichment/cases/{caseId}/fields
   * Body: { caseId, fieldName, fieldValue, updatedBy }
   * @param {string} caseId
   * @param {object} payload - { caseId, fieldName, fieldValue, updatedBy }
   */
  enrichCaseFields: async (caseId, payload) => {
    const response = await apiClient?.post(`/api/enrichment/cases/${caseId}/fields`, payload);
    return response?.data;
  },

  /**
   * GET /api/enrichment/cases/{caseId}/notes
   * @param {string} caseId
   */
  getCaseNotes: async (caseId) => {
    const response = await apiClient?.get(`/api/enrichment/cases/${caseId}/notes`);
    return response?.data;
  },

  /**
   * POST /api/enrichment/cases/{caseId}/notes
   * Body: { caseId, note, createdBy }
   * @param {string} caseId
   * @param {object} payload - { caseId, note, createdBy }
   */
  addCaseNote: async (caseId, payload) => {
    const response = await apiClient?.post(`/api/enrichment/cases/${caseId}/notes`, payload);
    return response?.data;
  },

  /**
   * PUT /api/enrichment/cases/{caseId}/ready
   * @param {string} caseId
   */
  markCaseReady: async (caseId) => {
    const response = await apiClient?.put(`/api/enrichment/cases/${caseId}/ready`);
    return response?.data;
  },
};

export default enrichmentApi;
