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
        console.warn('REST API unavailable for dashboard metrics, falling back to Supabase:', error?.message);
      }
    }

    // Supabase fallback
    try {
      const [datasetsRes, casesRes, rulesRes, reportsRes, submissionsRes] = await Promise.all([
        supabase?.from('fatca_crs_dataset_batch')?.select('id', { count: 'exact', head: true })?.eq('organization_id', organizationId),
        supabase?.from('fatca_crs_case_master')?.select('id', { count: 'exact', head: true }),
        supabase?.from('fatca_crs_rule_sets')?.select('id', { count: 'exact', head: true })?.eq('organization_id', organizationId),
        supabase?.from('fatca_crs_report_batch')?.select('id', { count: 'exact', head: true }),
        supabase?.from('fatca_crs_submission_log')?.select('id', { count: 'exact', head: true })
      ]);

      const pendingRes = await supabase?.from('fatca_crs_rule_sets')
        ?.select('id', { count: 'exact', head: true })
        ?.eq('organization_id', organizationId)
        ?.eq('status', 'pending_approval');

      return {
        totalDatasets: datasetsRes?.count || 0,
        totalCases: casesRes?.count || 0,
        totalRules: rulesRes?.count || 0,
        totalReports: reportsRes?.count || 0,
        totalSubmissions: submissionsRes?.count || 0,
        pendingApprovals: pendingRes?.count || 0,
        complianceStatus: 'compliant',
        reportingYear: new Date()?.getFullYear(),
        lastUpdated: new Date()?.toISOString()
      };
    } catch (err) {
      console.error('Supabase fallback failed for dashboard metrics:', err?.message);
      return {
        totalDatasets: 0, totalCases: 0, totalRules: 0,
        totalReports: 0, totalSubmissions: 0, pendingApprovals: 0,
        complianceStatus: 'unknown', reportingYear: new Date()?.getFullYear(),
        lastUpdated: new Date()?.toISOString()
      };
    }
  },

  async getAdminMetrics(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/dashboard/admin-metrics', {
          params: { organizationId }
        });
        const data = Array.isArray(response?.data) ? response?.data?.[0] : response?.data;
        if (data) {
          return {
            ...data,
            activeSessions: data?.activeUsers ?? 0,
            recentActivity: data?.activitiesLast7Days ?? data?.totalActivities ?? 0,
            ldapConfigs: data?.activeADConfigs ?? 0
          };
        }
        return {};
      } catch (error) {
        console.warn('REST API unavailable for admin metrics, falling back to Supabase:', error?.message);
      }
    }

    // Supabase fallback — query real data directly
    try {
      const [usersRes, activeUsersRes, rolesRes, ldapRes] = await Promise.all([
        supabase?.from('user_profiles')?.select('id', { count: 'exact', head: true })?.eq('organization_id', organizationId),
        supabase?.from('user_profiles')?.select('id', { count: 'exact', head: true })?.eq('organization_id', organizationId)?.eq('is_active', true),
        supabase?.from('roles')?.select('id', { count: 'exact', head: true })?.eq('organization_id', organizationId),
        supabase?.from('ad_configurations')?.select('id', { count: 'exact', head: true })?.eq('organization_id', organizationId)
      ]);

      const totalUsers = usersRes?.count || 0;
      const activeUsers = activeUsersRes?.count || 0;
      const totalRoles = rolesRes?.count || 0;
      const ldapConfigs = ldapRes?.count || 0;

      // Determine system health based on data availability
      const systemHealth = (usersRes?.error || rolesRes?.error) ? 'degraded' : 'healthy';

      return {
        totalUsers,
        activeUsers,
        totalRoles,
        activeSessions: activeUsers, // approximate with active users
        recentActivity: 0,
        ldapConfigs,
        systemHealth
      };
    } catch (err) {
      console.error('Supabase fallback failed for admin metrics:', err?.message);
      return {
        totalUsers: 0, activeUsers: 0, totalRoles: 0,
        activeSessions: 0, recentActivity: 0, ldapConfigs: 0, systemHealth: 'unknown'
      };
    }
  },

  async getRecentActivities(organizationId, limit = 10) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/dashboard/activities', {
          params: { organizationId, limit }
        });
        return response?.data || [];
      } catch (error) {
        console.warn('REST API unavailable for activities, falling back to Supabase:', error?.message);
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
