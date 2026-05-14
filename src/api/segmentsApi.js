import apiClient from './apiClient';

export const segmentsApi = {
  /**
   * GET /api/segments
   * @param {object} params - { organizationId, activeOnly }
   */
  getSegments: async (params = {}) => {
    const response = await apiClient?.get('/api/segments', { params });
    return response?.data;
  },

  /**
   * POST /api/segments
   * Body: { segmentId, organizationId, segment, entityName, giin, sponsorGIIN, countryCode, reportingType, contactPerson }
   * @param {object} payload
   */
  createSegment: async (payload) => {
    const response = await apiClient?.post('/api/segments', payload);
    return response?.data;
  },

  /**
   * PUT /api/segments/{segmentId}
   * Body: { segmentId, segment, entityName, giin, sponsorGIIN, countryCode, reportingType, contactPerson }
   * @param {string} segmentId
   * @param {object} payload
   */
  updateSegment: async (segmentId, payload) => {
    const response = await apiClient?.put(`/api/segments/${segmentId}`, payload);
    return response?.data;
  },

  /**
   * DELETE /api/segments/{segmentId}
   * @param {string} segmentId
   */
  deleteSegment: async (segmentId) => {
    const response = await apiClient?.delete(`/api/segments/${segmentId}`);
    return response?.data;
  },

  /**
   * PUT /api/segments/{segmentId}/submit
   * @param {string} segmentId
   */
  submitSegment: async (segmentId) => {
    const response = await apiClient?.put(`/api/segments/${segmentId}/submit`);
    return response?.data;
  },

  /**
   * PUT /api/segments/{segmentId}/approve
   * Body: { segmentId, approvedBy }
   * @param {string} segmentId
   * @param {object} payload - { segmentId, approvedBy }
   */
  approveSegment: async (segmentId, payload) => {
    const response = await apiClient?.put(`/api/segments/${segmentId}/approve`, payload);
    return response?.data;
  },

  /**
   * PUT /api/segments/{segmentId}/reject
   * @param {string} segmentId
   */
  rejectSegment: async (segmentId) => {
    const response = await apiClient?.put(`/api/segments/${segmentId}/reject`);
    return response?.data;
  },
};

export default segmentsApi;
