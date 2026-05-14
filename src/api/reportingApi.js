import apiClient from './apiClient';

export const reportingApi = {
  /**
   * GET /api/reporting/jobs
   * @param {object} params - { organizationId, page, pageSize }
   */
  getReportJobs: async (params = {}) => {
    const response = await apiClient?.get('/api/reporting/jobs', { params });
    return response?.data;
  },

  /**
   * POST /api/reporting/jobs
   * Body: { jobId, organizationId, reportingYear, createdBy }
   * @param {object} payload - { jobId, organizationId, reportingYear, createdBy }
   */
  createReportJob: async (payload) => {
    const response = await apiClient?.post('/api/reporting/jobs', payload);
    return response?.data;
  },

  /**
   * PUT /api/reporting/jobs/{jobId}/approve
   * Body: { jobId, approvedBy }
   * @param {string} jobId
   * @param {object} payload - { jobId, approvedBy }
   */
  approveReportJob: async (jobId, payload) => {
    const response = await apiClient?.put(`/api/reporting/jobs/${jobId}/approve`, payload);
    return response?.data;
  },

  /**
   * GET /api/reporting/audit-summary
   * @param {object} params - { organizationId }
   */
  getAuditSummary: async (params = {}) => {
    const response = await apiClient?.get('/api/reporting/audit-summary', { params });
    return response?.data;
  },

  /**
   * GET /api/reporting/export
   * @param {object} params - { batchId, organizationId, exportFormat, requestedBy }
   */
  exportDataset: async (params = {}) => {
    const response = await apiClient?.get('/api/reporting/export', {
      params,
      responseType: 'blob',
    });
    return response?.data;
  },

  /**
   * GET /api/reporting/years
   * @param {object} params - { organizationId }
   */
  getReportingYears: async (params = {}) => {
    const response = await apiClient?.get('/api/reporting/years', { params });
    return response?.data;
  },
};

export default reportingApi;
