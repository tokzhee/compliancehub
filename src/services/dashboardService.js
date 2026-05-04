import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const dashboardService = {
  async getDashboardMetrics(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/dashboard/metrics', {
          params: { organizationId }
        });
        return response?.data || {};
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error?.message);
        return {
          totalDatasets: 0, totalCases: 0, totalRules: 0,
          totalReports: 0, totalSubmissions: 0, pendingApprovals: 0,
          complianceStatus: 'unknown', reportingYear: new Date()?.getFullYear(),
          lastUpdated: new Date()?.toISOString()
        };
      }
    }
    // Supabase fallback
    return {
      totalDatasets: 0, totalCases: 0, totalRules: 0,
      totalReports: 0, totalSubmissions: 0, pendingApprovals: 0,
      complianceStatus: 'unknown', reportingYear: new Date()?.getFullYear(),
      lastUpdated: new Date()?.toISOString()
    };
  },

  async getAdminMetrics(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/dashboard/admin-metrics', {
          params: { organizationId }
        });
        return response?.data || {};
      } catch (error) {
        console.error('Error fetching admin metrics:', error?.message);
        return {
          totalUsers: 0, activeUsers: 0, totalRoles: 0,
          activeSessions: 0, recentActivity: 0, ldapConfigs: 0, systemHealth: 'unknown'
        };
      }
    }
    return {
      totalUsers: 0, activeUsers: 0, totalRoles: 0,
      activeSessions: 0, recentActivity: 0, ldapConfigs: 0, systemHealth: 'unknown'
    };
  },

  async getRecentActivities(organizationId, limit = 10) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/dashboard/activities', {
          params: { organizationId, limit }
        });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching recent activities:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('user_activity_log')?.select(`
        id, activity_type, description, created_at,
        user_profiles!user_activity_log_user_id_fkey(full_name, email)
      `)?.eq('organization_id', organizationId)?.order('created_at', { ascending: false })?.limit(limit);
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }
};
