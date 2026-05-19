import apiClient from './apiClient';

export const datasetApi = {
  getDatasets: async (organizationId, filters = {}) => {
    const params = { organizationId };
    if (filters?.reportingYear && filters?.reportingYear !== 'all')
      params.reportingYear = parseInt(filters.reportingYear);
    if (filters?.searchTerm) params.searchTerm = filters.searchTerm;
    const response = await apiClient.get('/api/datasets', { params });
    return response?.data;
  },

  getCustomers: async (organizationId, filters = {}) => {
    const params = { organizationId };
    if (filters?.reportingYear && filters?.reportingYear !== 'all')
      params.reportingYear = parseInt(filters.reportingYear);
    if (filters?.customerType && filters?.customerType !== 'all')
      params.customerType = filters.customerType;
    if (filters?.regimeType && filters?.regimeType !== 'all')
      params.regimeType = filters.regimeType;
    if (filters?.searchTerm) params.searchTerm = filters.searchTerm;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.pageSize = filters.pageSize;
    const response = await apiClient.get('/api/datasets/customers', { params });
    return response?.data;
  },

  uploadDataset: async (payload) => {
    const response = await apiClient.post('/api/datasets/upload', payload);
    return response?.data;
  },

  deleteDataset: async (batchId, organizationId, deletedBy) => {
    const response = await apiClient.delete(`/api/datasets/${batchId}`, {
      params: { organizationId, deletedBy },
    });
    return response?.data;
  },

  // ✅ New method: get summary statistics for datasets
  getSummary: async (organizationId, reportingYear) => {
    const params = { organizationId };
    if (reportingYear && reportingYear !== 'all') {
      params.reportingYear = parseInt(reportingYear);
    }
    const response = await apiClient.get('/api/datasets/summary', { params });
    return response?.data;
  },
};

export default datasetApi;