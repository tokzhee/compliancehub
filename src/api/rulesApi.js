import apiClient from './apiClient';

export const rulesApi = {
  /**
   * GET /api/rules
   * @param {object} params - { organizationId, regime, segmentId, year, status, searchTerm, showRetired, page, pageSize }
   */
  getRules: async (params = {}) => {
    const response = await apiClient?.get('/api/rules', { params });
    return response?.data;
  },

  /**
   * POST /api/rules
   * Body: { ruleSetId, organizationId, ruleName, regime, segment, reportingYear, description, createdBy, conditions }
   * @param {object} payload
   */
  createRule: async (payload) => {
    const response = await apiClient?.post('/api/rules', payload);
    return response?.data;
  },

  /**
   * PUT /api/rules/{ruleSetId}
   * Body: { ruleSetId, ruleName, description, updatedBy }
   * @param {string} ruleSetId
   * @param {object} payload
   */
  updateRule: async (ruleSetId, payload) => {
    const response = await apiClient?.put(`/api/rules/${ruleSetId}`, payload);
    return response?.data;
  },

  /**
   * DELETE /api/rules/{ruleSetId}
   * @param {string} ruleSetId
   */
  deleteRule: async (ruleSetId) => {
    const response = await apiClient?.delete(`/api/rules/${ruleSetId}`);
    return response?.data;
  },

  /**
   * PUT /api/rules/{ruleSetId}/submit
   * @param {string} ruleSetId
   */
  submitRule: async (ruleSetId) => {
    const response = await apiClient?.put(`/api/rules/${ruleSetId}/submit`);
    return response?.data;
  },

  /**
   * PUT /api/rules/{ruleSetId}/approve-workflow
   * Body: { ruleSetId, approvedBy }
   * @param {string} ruleSetId
   * @param {object} payload - { ruleSetId, approvedBy }
   */
  approveRule: async (ruleSetId, payload) => {
    const response = await apiClient?.put(`/api/rules/${ruleSetId}/approve-workflow`, payload);
    return response?.data;
  },

  /**
   * PUT /api/rules/{ruleSetId}/reject-workflow
   * Body: { ruleSetId, reason }
   * @param {string} ruleSetId
   * @param {object} payload - { ruleSetId, reason }
   */
  rejectRule: async (ruleSetId, payload) => {
    const response = await apiClient?.put(`/api/rules/${ruleSetId}/reject-workflow`, payload);
    return response?.data;
  },

  /**
   * PUT /api/rules/{ruleSetId}/retire
   * Body: { ruleSetId, retirementReason, retiredBy }
   * @param {string} ruleSetId
   * @param {object} payload - { ruleSetId, retirementReason, retiredBy }
   */
  retireRule: async (ruleSetId, payload) => {
    const response = await apiClient?.put(`/api/rules/${ruleSetId}/retire`, payload);
    return response?.data;
  },

  /**
   * GET /api/rules/{ruleSetId}/conditions
   * @param {string} ruleSetId
   */
  getRuleConditions: async (ruleSetId) => {
    const response = await apiClient?.get(`/api/rules/${ruleSetId}/conditions`);
    return response?.data;
  },

  /**
   * POST /api/rules/{ruleSetId}/conditions
   * Body: { conditionId, ruleSetId, fieldName, operator, value, sequence }
   * @param {string} ruleSetId
   * @param {object} payload
   */
  createRuleCondition: async (ruleSetId, payload) => {
    const response = await apiClient?.post(`/api/rules/${ruleSetId}/conditions`, payload);
    return response?.data;
  },

  /**
   * PUT /api/rules/conditions/{conditionId}
   * Body: { conditionId, fieldName, operator, value, sequence }
   * @param {string} conditionId
   * @param {object} payload
   */
  updateRuleCondition: async (conditionId, payload) => {
    const response = await apiClient?.put(`/api/rules/conditions/${conditionId}`, payload);
    return response?.data;
  },

  /**
   * DELETE /api/rules/conditions/{conditionId}
   * @param {string} conditionId
   */
  deleteRuleCondition: async (conditionId) => {
    const response = await apiClient?.delete(`/api/rules/conditions/${conditionId}`);
    return response?.data;
  },

  /**
   * GET /api/rules/{ruleSetId}/history
   * @param {string} ruleSetId
   * @param {object} params - { changeType, changedBy, startDate, endDate, page, pageSize }
   */
  getRuleHistory: async (ruleSetId, params = {}) => {
    const response = await apiClient?.get(`/api/rules/${ruleSetId}/history`, { params });
    return response?.data;
  },

  /**
   * GET /api/rules/{ruleSetId}/history/compare
   * @param {string} ruleSetId
   * @param {object} params - { version1, version2 }
   */
  compareVersions: async (ruleSetId, params = {}) => {
    const response = await apiClient?.get(`/api/rules/${ruleSetId}/history/compare`, { params });
    return response?.data;
  },

  /**
   * GET /api/rules/{ruleSetId}/history/modifiers
   * @param {string} ruleSetId
   * @param {object} params - { limit, offset }
   */
  getRuleModifiers: async (ruleSetId, params = {}) => {
    const response = await apiClient?.get(`/api/rules/${ruleSetId}/history/modifiers`, { params });
    return response?.data;
  },

  /**
   * POST /api/rules/simulate
   * Body: { organizationId, ruleSetId, reportingYear }
   * @param {object} payload - { organizationId, ruleSetId, reportingYear }
   */
  simulateRule: async (payload) => {
    const response = await apiClient?.post('/api/rules/simulate', payload);
    return response?.data;
  },
};

export default rulesApi;
