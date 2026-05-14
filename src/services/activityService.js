import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

/**
 * Records a compliance action to the activity log.
 * Tries POST /api/activities via REST API first (if VITE_API_BASE_URL is set),
 * then falls back to writing directly to Supabase user_activity_log table.
 *
 * @param {string} userId
 * @param {string} organizationId
 * @param {string} activityType  - e.g. 'login', 'rule_created', 'case_reviewed', 'submission_approved'
 * @param {string} module        - Module/area of the app where the action occurred
 * @param {object} [details]     - Optional JSON metadata about the action (e.g. entity id, name, changes)
 * @param {string} [ipAddress]   - Optional IP address of the client
 * @param {string} [userAgent]   - Optional browser user-agent string
 */
export const logActivity = async (userId, organizationId, activityType, module, details = null, ipAddress = null, userAgent = null) => {
  if (!userId) return;

  // Capture user-agent from browser if not explicitly provided
  const resolvedUserAgent = userAgent || navigator?.userAgent || null;

  if (useRestApi) {
    try {
      await apiClient?.post('/api/activities', {
        userId,
        organizationId,
        activityType,
        module,
        details: details || null,
        ipAddress: ipAddress || null,
        userAgent: resolvedUserAgent,
      });
      return;
    } catch (error) {
      // REST API failed — fall through to Supabase fallback
      console.warn('activityService: REST API unavailable, falling back to Supabase:', error?.message);
    }
  }

  // Supabase fallback
  try {
    await supabase?.from('user_activity_log')?.insert({
      user_id: userId,
      organization_id: organizationId || null,
      action: activityType,
      module: module || null,
      details: details || null,
      ip_address: ipAddress || null,
      user_agent: resolvedUserAgent,
      created_at: new Date()?.toISOString(),
    });
  } catch (error) {
    // Silently fail — activity logging must never break the main flow
    console.error('activityService: Failed to log activity:', error?.message);
  }
};

export default { logActivity };
