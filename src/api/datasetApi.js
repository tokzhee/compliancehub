import apiClient from './apiClient';

export const datasetApi = {
  /**
   * GET /api/datasets
   * @param {string} organizationId
   * @param {object} filters - { reportingYear, searchTerm }
   */
  getDatasets: async (organizationId, filters = {}) => {
    const params = { organizationId };
    if (filters?.reportingYear && filters?.reportingYear !== 'all') {
      params.reportingYear = parseInt(filters?.reportingYear);
    }
    if (filters?.searchTerm) params.searchTerm = filters?.searchTerm;

    const response = await apiClient?.get('/api/datasets', { params });
    return response?.data;
  },

  /**
   * GET /api/datasets/customers
   * @param {string} organizationId
   * @param {object} filters - { reportingYear, customerType, regimeType, searchTerm, page, pageSize }
   */
  getCustomers: async (organizationId, filters = {}) => {
    const params = { organizationId };
    if (filters?.reportingYear && filters?.reportingYear !== 'all') {
      params.reportingYear = parseInt(filters?.reportingYear);
    }
    if (filters?.customerType && filters?.customerType !== 'all') params.customerType = filters?.customerType;
    if (filters?.regimeType && filters?.regimeType !== 'all') params.regimeType = filters?.regimeType;
    if (filters?.searchTerm) params.searchTerm = filters?.searchTerm;
    if (filters?.page) params.page = filters?.page;
    if (filters?.pageSize) params.pageSize = filters?.pageSize;

    const response = await apiClient?.get('/api/datasets/customers', { params });
    return response?.data;
  },

  /**
   * POST /api/datasets/upload
   * Body: { batchId, organizationId, giinConfigId, reportingYear, batchName, uploadedBy, records }
   * @param {object} payload
   */
  uploadDataset: async (payload) => {
    const response = await apiClient?.post('/api/datasets/upload', payload);
    return response?.data;
  },

  /**
   * DELETE /api/datasets/{batchId}
   * @param {string} batchId
   * @param {string} organizationId
   * @param {string} deletedBy
   */
  deleteDataset: async (batchId, organizationId, deletedBy) => {
    const response = await apiClient?.delete(`/api/datasets/${batchId}`, {
      params: { organizationId, deletedBy },
    });
    return response?.data;
  },
};

export default datasetApi;
