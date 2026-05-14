import apiClient from '../lib/apiClient';

/**
 * Records a compliance action to the activity log via POST /api/activities.
 *
 * @param {string} userId
 * @param {string} organizationId
 * @param {string} activityType  - e.g. 'login', 'rule_created', 'case_reviewed', 'submission_approved'
 * @param {string} module        - Module/area of the app where the action occurred
 * @param {object} [details]     - Optional JSON metadata about the action
 * @param {string} [ipAddress]   - Optional IP address of the client
 * @param {string} [userAgent]   - Optional browser user-agent string
 */
export const logActivity = async (userId, organizationId, activityType, module, details = null, ipAddress = null, userAgent = null) => {
  if (!userId) return;

  const resolvedUserAgent = userAgent || navigator?.userAgent || null;

  await apiClient?.post('/api/activities', {
    userId,
    organizationId,
    activityType,
    description: module,
    details: details ? JSON.stringify(details) : null,
    ipAddress: ipAddress || null,
    userAgent: resolvedUserAgent,
  });
};

export default { logActivity };
