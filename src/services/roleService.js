import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const roleService = {
  async getRoles(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/roles', { params: { organizationId } });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching roles:', error?.message);
        return [];
      }
    }
    try {
      const { data: roles, error: rolesError } = await supabase?.from('roles')?.select(`
        id, role_name, description, created_at, updated_at
      `)?.eq('organization_id', organizationId)?.order('created_at', { ascending: false });
      if (rolesError) return [];
      const rolesWithDetails = await Promise.all(
        (roles || [])?.map(async (role) => {
          const { count: permissionCount } = await supabase?.from('role_permissions')?.select('*', { count: 'exact', head: true })?.eq('role_id', role?.id);
          const { count: userCount } = await supabase?.from('user_profiles')?.select('*', { count: 'exact', head: true })?.eq('role_id', role?.id);
          const { data: permissions } = await supabase?.from('role_permissions')?.select('module, action')?.eq('role_id', role?.id);
          return {
            id: role?.id, name: role?.role_name, description: role?.description || '',
            status: 'Active', userCount: userCount || 0, permissionCount: permissionCount || 0,
            permissions: (permissions || [])?.map(p => `${p?.module}.${p?.action}`),
            createdAt: role?.created_at, updatedAt: role?.updated_at
          };
        })
      );
      return rolesWithDetails;
    } catch {
      return [];
    }
  },

  async createRole(roleData) {
    if (useRestApi) {
      try {
        const payload = {
          roleId: roleData?.roleId || null,
          roleName: roleData?.name,
          description: roleData?.description,
          permissions: typeof roleData?.permissions === 'string'
            ? roleData?.permissions
            : JSON.stringify(roleData?.permissions || [])
        };
        const response = await apiClient?.post('/api/roles', payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error creating role:', error?.message);
        return { error };
      }
    }
    try {
      const { data: role, error: roleError } = await supabase?.from('roles')?.insert({
        organization_id: roleData?.organizationId, role_name: roleData?.name, description: roleData?.description
      })?.select()?.single();
      if (roleError) return { error: roleError };
      if (roleData?.permissions && roleData?.permissions?.length > 0) {
        const permissionsToInsert = roleData?.permissions?.map(perm => {
          const [module, action] = perm?.split('.');
          return { role_id: role?.id, module, action };
        });
        await supabase?.from('role_permissions')?.insert(permissionsToInsert);
      }
      return { data: role };
    } catch (error) {
      return { error };
    }
  },

  async updateRole(roleId, updates) {
    if (useRestApi) {
      try {
        const payload = {
          roleId,
          roleName: updates?.name,
          description: updates?.description
        };
        const response = await apiClient?.put(`/api/roles/${roleId}`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating role:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('roles')?.update({
        role_name: updates?.name, description: updates?.description
      })?.eq('id', roleId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async deleteRole(roleId) {
    if (useRestApi) {
      try {
        await apiClient?.delete(`/api/roles/${roleId}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting role:', error?.message);
        return { error };
      }
    }
    try {
      await supabase?.from('role_permissions')?.delete()?.eq('role_id', roleId);
      const { error } = await supabase?.from('roles')?.delete()?.eq('id', roleId);
      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  async getRolePermissions(roleId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get(`/api/roles/${roleId}/permissions`);
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching role permissions:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('role_permissions')?.select('module, action')?.eq('role_id', roleId);
      if (error) return [];
      return (data || [])?.map(p => ({ module: p?.module, action: p?.action, permission: `${p?.module}.${p?.action}` }));
    } catch {
      return [];
    }
  },

  async updateRolePermissions(roleId, permissions) {
    if (useRestApi) {
      try {
        const payload = {
          roleId,
          permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions || [])
        };
        const response = await apiClient?.put(`/api/roles/${roleId}/permissions`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating role permissions:', error?.message);
        return { error };
      }
    }
    try {
      await supabase?.from('role_permissions')?.delete()?.eq('role_id', roleId);
      if (permissions && permissions?.length > 0) {
        const permissionsToInsert = permissions?.map(perm => {
          const [module, action] = typeof perm === 'string' ? perm?.split('.') : [perm?.module, perm?.action];
          return { role_id: roleId, module, action };
        });
        const { error } = await supabase?.from('role_permissions')?.insert(permissionsToInsert);
        if (error) return { error };
      }
      return { success: true };
    } catch (error) {
      return { error };
    }
  }
};
