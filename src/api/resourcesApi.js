import apiClient from './apiClient';

export const resourcesApi = {
  /**
   * GET /api/resources
   */
  getResources: async () => {
    const response = await apiClient?.get('/api/resources');
    return response?.data;
  },

  /**
   * POST /api/resources
   * Body: { resourceId, title, contentType, body, filePath, createdBy }
   * @param {object} payload
   */
  createResource: async (payload) => {
    const response = await apiClient?.post('/api/resources', payload);
    return response?.data;
  },

  /**
   * PUT /api/resources/{resourceId}
   * Body: { resourceId, title, body, isPublished, changedBy }
   * @param {string} resourceId
   * @param {object} payload
   */
  updateResource: async (resourceId, payload) => {
    const response = await apiClient?.put(`/api/resources/${resourceId}`, payload);
    return response?.data;
  },

  /**
   * DELETE /api/resources/{resourceId}
   * @param {string} resourceId
   * @param {string} deletedBy
   */
  deleteResource: async (resourceId, deletedBy) => {
    const response = await apiClient?.delete(`/api/resources/${resourceId}`, {
      params: { deletedBy },
    });
    return response?.data;
  },

  /**
   * GET /api/resources/{resourceId}/history
   * @param {string} resourceId
   */
  getResourceHistory: async (resourceId) => {
    const response = await apiClient?.get(`/api/resources/${resourceId}/history`);
    return response?.data;
  },

  /**
   * PUT /api/resources/{resourceId}/restore/{historyId}
   * Body: { resourceId, historyId, changedBy }
   * @param {string} resourceId
   * @param {string} historyId
   * @param {object} payload - { resourceId, historyId, changedBy }
   */
  restoreResourceVersion: async (resourceId, historyId, payload) => {
    const response = await apiClient?.put(`/api/resources/${resourceId}/restore/${historyId}`, payload);
    return response?.data;
  },
};

export default resourcesApi;
