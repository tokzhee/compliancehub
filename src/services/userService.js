import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const userService = {
  async getUsers(organizationId, page, pageSize) {
    if (useRestApi) {
      try {
        const params = { organizationId };
        if (page) params.page = page;
        if (pageSize) params.pageSize = pageSize;
        const response = await apiClient?.get('/api/users', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching users:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
        id, email, full_name, status, last_login, created_at, updated_at, organization_id, role_id, authentication_source,
        roles!fk_user_profiles_role_id(id, role_name)
      `)?.eq('organization_id', organizationId)?.order('created_at', { ascending: false });
      if (error) return [];
      return data?.map(user => ({
        userId: user?.id, username: user?.email?.split('@')?.[0] || 'unknown',
        email: user?.email, fullName: user?.full_name,
        role: user?.roles?.role_name || 'No Role', roleId: user?.role_id,
        status: user?.status === 'active' ? 'Active' : user?.status === 'inactive' ? 'Inactive' : 'Suspended',
        lastLogin: user?.last_login ? new Date(user.last_login) : null,
        createdAt: new Date(user.created_at), modifiedAt: new Date(user.updated_at),
        loginCount: 0, organizationId: user?.organization_id,
        authenticationSource: user?.authentication_source, legalEntityAccess: [], reportingYearAccess: []
      })) || [];
    } catch {
      return [];
    }
  },

  async createUser(userData) {
    if (useRestApi) {
      try {
        const payload = {
          userId: userData?.userId || null,
          organizationId: userData?.organizationId,
          username: userData?.username || userData?.email?.split('@')?.[0],
          fullName: userData?.fullName,
          email: userData?.email,
          passwordHash: userData?.password || null,
          roleId: userData?.roleId,
          isActive: userData?.isActive !== undefined ? userData?.isActive : true
        };
        const response = await apiClient?.post('/api/users', payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error creating user:', error?.message);
        return { error };
      }
    }
    try {
      if (userData?.authenticationSource === 'local_db' && userData?.password) {
        const { data: authData, error: authError } = await supabase?.auth?.signUp({
          email: userData?.email, password: userData?.password,
          options: { data: { full_name: userData?.fullName, organization_id: userData?.organizationId } }
        });
        if (authError) return { error: authError };
        if (authData?.user?.id) {
          const { data: profileData, error: profileError } = await supabase?.from('user_profiles')?.update({
            role_id: userData?.roleId, full_name: userData?.fullName, authentication_source: 'local_db'
          })?.eq('id', authData?.user?.id)?.select()?.single();
          if (profileError) return { error: profileError };
          return { data: profileData };
        }
      }
      const insertData = {
        email: userData?.email, full_name: userData?.fullName,
        organization_id: userData?.organizationId, role_id: userData?.roleId,
        status: 'active', authentication_source: userData?.authenticationSource || 'local_db'
      };
      const { data, error } = await supabase?.from('user_profiles')?.insert(insertData)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async updateUser(userId, updates) {
    if (useRestApi) {
      try {
        const payload = {
          userId,
          username: updates?.username,
          fullName: updates?.fullName || updates?.full_name,
          email: updates?.email,
          roleId: updates?.roleId || updates?.role_id,
          isActive: updates?.isActive !== undefined ? updates?.isActive : (updates?.status === 'active' || updates?.status === 'Active')
        };
        const response = await apiClient?.put(`/api/users/${userId}`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating user:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', userId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async deleteUser(userId) {
    if (useRestApi) {
      try {
        await apiClient?.delete(`/api/users/${userId}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting user:', error?.message);
        return { error };
      }
    }
    try {
      const { error } = await supabase?.from('user_profiles')?.delete()?.eq('id', userId);
      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  async logActivity(userId, organizationId, activityType, description, ipAddress) {
    if (useRestApi) {
      try {
        await apiClient?.post('/api/activities', {
          userId, organizationId, activityType, description, ipAddress: ipAddress || null
        });
      } catch (error) {
        console.error('Error logging activity:', error?.message);
      }
      return;
    }
    try {
      await supabase?.from('user_activity_log')?.insert({
        user_id: userId, organization_id: organizationId,
        activity_type: activityType, description, ip_address: ipAddress
      });
    } catch {
      // Silently fail activity logging
    }
  }
};
