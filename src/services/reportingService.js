import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const reportingService = {
  async getReportingJobs(organizationId, page, pageSize) {
    if (useRestApi) {
      try {
        const params = { organizationId };
        if (page) params.page = page;
        if (pageSize) params.pageSize = pageSize;
        const response = await apiClient?.get('/api/reporting/jobs', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching reporting jobs:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('reporting_jobs')?.select(`
        id, job_name, status, generated_at, approved_at, report_data, generated_by, approved_by, reporting_year_id,
        generator:user_profiles!reporting_jobs_generated_by_fkey(full_name, email),
        approver:user_profiles!reporting_jobs_approved_by_fkey(full_name, email),
        reporting_years(year)
      `)?.eq('organization_id', organizationId)?.order('generated_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async createReportingJob(organizationId, createdBy, reportData) {
    if (useRestApi) {
      try {
        const payload = {
          jobId: reportData?.jobId || null,
          organizationId,
          reportingYear: reportData?.reportingYear,
          createdBy
        };
        const response = await apiClient?.post('/api/reporting/jobs', payload);
        return response?.data;
      } catch (error) {
        console.error('Error creating reporting job:', error?.message);
        throw error;
      }
    }
    try {
      const { data, error } = await supabase?.from('reporting_jobs')?.insert({
        organization_id: organizationId, reporting_year_id: reportData?.reportingYearId,
        job_name: reportData?.jobName, status: 'pending', generated_by: createdBy,
        generated_at: new Date()?.toISOString()
      })?.select()?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  async approveReport(jobId, approvedBy) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/reporting/jobs/${jobId}/approve`, {
          jobId,
          approvedBy
        });
        return response?.data;
      } catch (error) {
        console.error('Error approving report:', error?.message);
        throw error;
      }
    }
    try {
      const { data, error } = await supabase?.from('reporting_jobs')?.update({
        approved_by: approvedBy, approved_at: new Date()?.toISOString(), status: 'completed'
      })?.eq('id', jobId)?.select()?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getAuditSummary(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/reporting/audit-summary', {
          params: { organizationId }
        });
        return response?.data || {};
      } catch (error) {
        console.error('Error fetching audit summary:', error?.message);
        return { totalReports: 0, completedReports: 0, pendingApprovals: 0, reportableAccounts: 0 };
      }
    }
    return { totalReports: 0, completedReports: 0, pendingApprovals: 0, reportableAccounts: 0 };
  },

  async getReportingYears(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/reporting/years', {
          params: { organizationId }
        });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching reporting years:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('reporting_years')?.select('*')?.eq('organization_id', organizationId)?.order('year', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async exportDataset(batchId, organizationId, exportFormat, requestedBy) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/reporting/export', {
          params: { batchId, organizationId, exportFormat, requestedBy }
        });
        return response?.data || [];
      } catch (error) {
        console.error('Error exporting dataset:', error?.message);
        return [];
      }
    }
    return [];
  },

  async getExportableDatasets(organizationId, filters = {}) {
    if (useRestApi) {
      return this.exportDataset(null, organizationId, null, null);
    }
    try {
      let query = supabase?.from('fatca_dataset')?.select(`
        id, account_number, account_holder_name, account_balance, country_code, tax_id, reporting_year, created_at, updated_at
      `)?.eq('organization_id', organizationId);
      if (filters?.reportingYear) query = query?.eq('reporting_year', filters?.reportingYear);
      const { data, error } = await query?.order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }
};