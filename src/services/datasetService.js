
import datasetApi from '../api/datasetApi';

export const datasetService = {
  /**
   * Fetch datasets list — fully server-side filtered
   * GET /api/datasets
   */
  async getDatasets(organizationId, filters = {}) {
    try {
      return await datasetApi?.getDatasets(organizationId, filters);
    } catch (error) {
      console.error('datasetService.getDatasets error:', error?.message);
      return [];
    }
  },

  /**
   * Fetch customer records — fully server-side filtered + paged
   * GET /api/datasets/customers
   */
  async getCustomerRecords(organizationId, filters = {}) {
    try {
      return await datasetApi?.getCustomers(organizationId, filters);
    } catch (error) {
      console.error('datasetService.getCustomerRecords error:', error?.message);
      return [];
    }
  },

  /**
   * Fetch dataset details by batchId
   * GET /api/datasets/{batchId}/details
   */
  async getDatasetDetails(batchId) {
    try {
      return await datasetApi?.getDatasetDetails(batchId);
    } catch (error) {
      console.error('datasetService.getDatasetDetails error:', error?.message);
      return null;
    }
  },

  /**
   * Upload a dataset — real API call, no simulation
   * POST /api/datasets/upload
   */
  async uploadDataset(organizationId, uploadedBy, datasetData) {
    try {
      const payload = {
        organizationId,
        giinConfigId: datasetData?.giinConfigId || null,
        reportingYear: parseInt(datasetData?.reportingYear),
        batchName: datasetData?.batchName || datasetData?.datasetName || `Upload ${new Date()?.toISOString()}`,
        uploadedBy,
        records: typeof datasetData?.records === 'string'
          ? datasetData?.records
          : JSON.stringify(datasetData?.records || []),
      };
      const data = await datasetApi?.uploadDataset(payload);
      return { data };
    } catch (error) {
      console.error('datasetService.uploadDataset error:', error?.message);
      return { error };
    }
  },

  /**
   * Delete a dataset by batchId
   * DELETE /api/datasets/{batchId}
   */
  async deleteDataset(batchId, organizationId, deletedBy) {
    try {
      const data = await datasetApi?.deleteDataset(batchId, organizationId, deletedBy);
      return { data };
    } catch (error) {
      console.error('datasetService.deleteDataset error:', error?.message);
      return { error };
    }
  },

  /**
   * Fetch summary metrics from backend
   * GET /api/datasets/summary
   */
  async getSummary(organizationId, reportingYear) {
    try {
      return await datasetApi?.getSummary(organizationId, reportingYear);
    } catch (error) {
      console.error('datasetService.getSummary error:', error?.message);
      return null;
    }
  },
};
