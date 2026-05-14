import apiClient from './apiClient';

export const submissionsApi = {
  /**
   * GET /api/submissions
   * @param {object} params - { organizationId, status, dateFrom, dateTo, page, pageSize }
   */
  getSubmissions: async (params = {}) => {
    const response = await apiClient?.get('/api/submissions', { params });
    return response?.data;
  },

  /**
   * POST /api/submissions
   * Body: { submissionId, organizationId, reportingYear, giinConfigId }
   * @param {object} payload
   */
  createSubmission: async (payload) => {
    const response = await apiClient?.post('/api/submissions', payload);
    return response?.data;
  },

  /**
   * PUT /api/submissions/{submissionId}/approve
   * Body: { submissionId, approvedBy }
   * @param {string} submissionId
   * @param {object} payload - { submissionId, approvedBy }
   */
  approveSubmission: async (submissionId, payload) => {
    const response = await apiClient?.put(`/api/submissions/${submissionId}/approve`, payload);
    return response?.data;
  },

  /**
   * PUT /api/submissions/{submissionId}/reject
   * @param {string} submissionId
   */
  rejectSubmission: async (submissionId) => {
    const response = await apiClient?.put(`/api/submissions/${submissionId}/reject`);
    return response?.data;
  },

  /**
   * PUT /api/submissions/{submissionId}/status
   * Body: { submissionId, status, responseMessage }
   * @param {string} submissionId
   * @param {object} payload - { submissionId, status, responseMessage }
   */
  updateSubmissionStatus: async (submissionId, payload) => {
    const response = await apiClient?.put(`/api/submissions/${submissionId}/status`, payload);
    return response?.data;
  },

  /**
   * PUT /api/submissions/{submissionId}/submit
   * @param {string} submissionId
   */
  submitSubmission: async (submissionId) => {
    const response = await apiClient?.put(`/api/submissions/${submissionId}/submit`);
    return response?.data;
  },

  /**
   * GET /api/submissions/stats
   * @param {object} params - { organizationId, reportingYear }
   */
  getSubmissionStats: async (params = {}) => {
    const response = await apiClient?.get('/api/submissions/stats', { params });
    return response?.data;
  },
};

export default submissionsApi;
