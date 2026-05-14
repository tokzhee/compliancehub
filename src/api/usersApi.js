import apiClient from './apiClient';

export const usersApi = {
  /**
   * GET /api/users
   * @param {object} params - { organizationId, page, pageSize }
   */
  getUsers: async (params = {}) => {
    const response = await apiClient?.get('/api/users', { params });
    return response?.data;
  },

  /**
   * POST /api/users
   * Body: { userId, organizationId, username, fullName, email, passwordHash, roleId, isActive }
   * @param {object} payload
   */
  createUser: async (payload) => {
    const response = await apiClient?.post('/api/users', payload);
    return response?.data;
  },

  /**
   * PUT /api/users/{userId}
   * Body: { userId, username, fullName, email, roleId, isActive }
   * @param {string} userId
   * @param {object} payload
   */
  updateUser: async (userId, payload) => {
    const response = await apiClient?.put(`/api/users/${userId}`, payload);
    return response?.data;
  },

  /**
   * DELETE /api/users/{userId}
   * @param {string} userId
   */
  deleteUser: async (userId) => {
    const response = await apiClient?.delete(`/api/users/${userId}`);
    return response?.data;
  },

  /**
   * GET /api/roles
   * @param {object} params - { organizationId }
   */
  getRoles: async (params = {}) => {
    const response = await apiClient?.get('/api/roles', { params });
    return response?.data;
  },

  /**
   * POST /api/roles
   * Body: { roleId, roleName, description, permissions }
   * @param {object} payload
   */
  createRole: async (payload) => {
    const response = await apiClient?.post('/api/roles', payload);
    return response?.data;
  },

  /**
   * PUT /api/roles/{roleId}
   * Body: { roleId, roleName, description }
   * @param {string} roleId
   * @param {object} payload
   */
  updateRole: async (roleId, payload) => {
    const response = await apiClient?.put(`/api/roles/${roleId}`, payload);
    return response?.data;
  },

  /**
   * DELETE /api/roles/{roleId}
   * @param {string} roleId
   */
  deleteRole: async (roleId) => {
    const response = await apiClient?.delete(`/api/roles/${roleId}`);
    return response?.data;
  },

  /**
   * GET /api/roles/{roleId}/permissions
   * @param {string} roleId
   */
  getRolePermissions: async (roleId) => {
    const response = await apiClient?.get(`/api/roles/${roleId}/permissions`);
    return response?.data;
  },

  /**
   * PUT /api/roles/{roleId}/permissions
   * Body: { roleId, permissions }
   * @param {string} roleId
   * @param {object} payload - { roleId, permissions }
   */
  updateRolePermissions: async (roleId, payload) => {
    const response = await apiClient?.put(`/api/roles/${roleId}/permissions`, payload);
    return response?.data;
  },

  /**
   * POST /api/activities
   * Body: { userId, organizationId, activityType, description, ipAddress, userAgent, details }
   * @param {object} payload
   */
  logActivity: async (payload) => {
    const response = await apiClient?.post('/api/activities', payload);
    return response?.data;
  },
};

export default usersApi;
