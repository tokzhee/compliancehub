import apiClient from './apiClient';

export const casesApi = {
  /**
   * GET /api/cases
   * @param {object} params - { organizationId, status, reportability, assigneeId, searchTerm, page, pageSize }
   */
  getCases: async (params = {}) => {
    const response = await apiClient?.get('/api/cases', { params });
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
   * PUT /api/cases/{caseId}/assign
   * Body: { caseId, assignedTo }
   * @param {string} caseId
   * @param {object} payload - { caseId, assignedTo }
   */
  assignCase: async (caseId, payload) => {
    const response = await apiClient?.put(`/api/cases/${caseId}/assign`, payload);
    return response?.data;
  },

  /**
   * PUT /api/cases/{caseId}/status
   * Body: { caseId, status, reviewedBy }
   * @param {string} caseId
   * @param {object} payload - { caseId, status, reviewedBy }
   */
  updateCaseStatus: async (caseId, payload) => {
    const response = await apiClient?.put(`/api/cases/${caseId}/status`, payload);
    return response?.data;
  },

  /**
   * POST /api/cases/{caseId}/comments
   * Body: { caseId, comment, createdBy }
   * @param {string} caseId
   * @param {object} payload - { caseId, comment, createdBy }
   */
  addCaseComment: async (caseId, payload) => {
    const response = await apiClient?.post(`/api/cases/${caseId}/comments`, payload);
    return response?.data;
  },
};

export default casesApi;
