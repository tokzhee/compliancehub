import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const caseService = {
  async getCases(organizationId, filters = {}) {
    if (useRestApi) {
      try {
        const params = { organizationId };
        if (filters?.status) params.status = filters?.status;
        if (filters?.reportability) params.reportability = filters?.reportability;
        if (filters?.assignee) params.assigneeId = filters?.assignee;
        if (filters?.search) params.searchTerm = filters?.search;
        if (filters?.page) params.page = filters?.page;
        if (filters?.pageSize) params.pageSize = filters?.pageSize;

        const response = await apiClient?.get('/api/cases', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching cases:', error?.message);
        return [];
      }
    }
    // Supabase fallback
    try {
      const { data, error } = await supabase?.from('fatca_results')?.select(`
        id, is_reportable, classification_reason, review_status, reporting_year,
        created_at, updated_at, assigned_to, reviewed_by, reviewed_at, dataset_id,
        fatca_dataset!fatca_results_dataset_id_fkey(account_number, account_holder_name, account_balance, country_code, tax_id),
        assigned_user:user_profiles!fatca_results_assigned_to_fkey(full_name)
      `)?.eq('organization_id', organizationId)?.order('created_at', { ascending: false });
      if (error) return [];
      return (data || [])?.map(result => ({
        id: result?.id,
        accountNumber: result?.fatca_dataset?.account_number || 'N/A',
        accountHolder: result?.fatca_dataset?.account_holder_name || 'Unknown',
        accountBalance: result?.fatca_dataset?.account_balance || 0,
        country: result?.fatca_dataset?.country_code || 'N/A',
        taxId: result?.fatca_dataset?.tax_id || 'N/A',
        isReportable: result?.is_reportable,
        reviewStatus: result?.review_status,
        assignedTo: result?.assigned_user?.full_name || 'Unassigned',
        ruleResults: [{ ruleName: 'Classification Rule', description: result?.classification_reason || 'N/A', passed: !result?.is_reportable }],
        reviewHistory: []
      }));
    } catch {
      return [];
    }
  },

  async getCaseDetails(caseId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get(`/api/enrichment/cases/${caseId}/details`);
        return response?.data || null;
      } catch (error) {
        console.error('Error fetching case details:', error?.message);
        return null;
      }
    }
    return null;
  },

  async updateCaseStatus(caseId, status, reviewedBy) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/cases/${caseId}/status`, {
          caseId,
          status,
          reviewedBy
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating case status:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_results')?.update({
        review_status: status, reviewed_by: reviewedBy, reviewed_at: new Date()?.toISOString()
      })?.eq('id', caseId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async assignCase(caseId, assignedTo) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/cases/${caseId}/assign`, {
          caseId,
          assignedTo
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error assigning case:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_results')?.update({ assigned_to: assignedTo })?.eq('id', caseId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async addCaseComment(caseId, organizationId, createdBy, comment) {
    if (useRestApi) {
      try {
        const response = await apiClient?.post(`/api/cases/${caseId}/comments`, {
          caseId,
          comment,
          createdBy
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error adding case comment:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('case_comments')?.insert({
        case_id: caseId, organization_id: organizationId, user_id: createdBy, comment_text: comment
      })?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }
};
