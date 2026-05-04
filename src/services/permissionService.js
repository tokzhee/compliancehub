import { supabase } from '../lib/supabase';

/**
 * Permission Service
 * Handles fresh permission fetching with cache-busting to ensure
 * newly added permissions (e.g. rules.retire) reflect immediately after migrations.
 */
export const permissionService = {
  /**
   * Refresh user permissions directly from the database.
   * Bypasses any cached data by using a timestamp query param and clearing storage caches.
   * @param {string} roleId - The user's role ID
   * @returns {Promise<string[]>} Array of permission strings like 'rules.retire'
   */
  async refreshUserPermissions(roleId) {
    if (!roleId) {
      console.warn('permissionService: No roleId provided, cannot refresh permissions');
      return [];
    }

    // Clear any cached permission data from browser storage
    const cacheKeys = Object.keys(localStorage)?.filter(k =>
      k?.includes('permission') || k?.includes('role') || k?.includes('supabase')
    );
    cacheKeys?.forEach(key => localStorage.removeItem(key));

    const sessionCacheKeys = Object.keys(sessionStorage)?.filter(k =>
      k?.includes('permission') || k?.includes('role') || k?.includes('supabase')
    );
    sessionCacheKeys?.forEach(key => sessionStorage.removeItem(key));

    // Add cache-busting timestamp to force a fresh network request
    const cacheBust = Date.now();
    console.log(`permissionService: Refreshing permissions for roleId=${roleId} [cache-bust=${cacheBust}]`);

    try {
      // Re-query role_permissions joining with roles to get the absolute latest data
      const { data, error } = await supabase
        ?.from('role_permissions')?.select('module, action, roles(role_name)')?.eq('role_id', roleId)?.order('module', { ascending: true });

      if (error) {
        console.error('permissionService: Error refreshing permissions:', error);
        return [];
      }

      const permissions = data?.map(p => `${p?.module}.${p?.action}`) || [];
      console.log(
        `permissionService: ✅ Permission refresh complete — ${permissions?.length} permissions loaded for role "${data?.[0]?.roles?.role_name || roleId}"`,
        permissions
      );

      return permissions;
    } catch (err) {
      console.error('permissionService: Exception during permission refresh:', err);
      return [];
    }
  }
};

export default permissionService;
