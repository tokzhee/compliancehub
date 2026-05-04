import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const submissionService = {
  async getSubmissionLogs(organizationId, filters = {}) {
    if (useRestApi) {
      try {
        const params = { organizationId };
        if (filters?.status && filters?.status !== 'all') params.status = filters?.status;
        if (filters?.page) params.page = filters?.page;
        if (filters?.pageSize) params.pageSize = filters?.pageSize;

        const response = await apiClient?.get('/api/submissions', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching submission logs:', error?.message);
        return [];
      }
    }
    try {
      let query = supabase?.from('fatca_crs_submission_log')?.select(`
        id, submission_channel, submission_method, response_status, response_message,
        acknowledgment_file, error_details, submitted_on, created_at, report_batch_id, file_id,
        submitted_by, approval_status, created_by_user_id, approved_by_user_id, approval_comments,
        submitted_at_approval, approved_at,
        user_profiles!fatca_crs_submission_log_submitted_by_fkey(full_name),
        created_by_user:created_by_user_id(id, full_name, email),
        approved_by_user:approved_by_user_id(id, full_name, email),
        fatca_crs_report_batch!fatca_crs_submission_log_report_batch_id_fkey(
          id, regime_type, report_name, dataset_batch_id,
          fatca_crs_dataset_batch!fatca_crs_report_batch_dataset_batch_id_fkey(reporting_year, organization_id)
        ),
        fatca_crs_generated_files!fatca_crs_submission_log_file_id_fkey(file_name, xml_schema_type, file_size_bytes)
      `);
      if (filters?.status && filters?.status !== 'all') query = query?.eq('response_status', filters?.status);
      if (filters?.dateFrom) query = query?.gte('submitted_on', filters?.dateFrom);
      if (filters?.dateTo) query = query?.lte('submitted_on', filters?.dateTo);
      const { data, error } = await query?.order('submitted_on', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async getSubmissionStatistics(organizationId) {
    if (useRestApi) {
      try {
        // Use the submissions list endpoint and compute stats client-side
        const response = await apiClient?.get('/api/submissions', { params: { organizationId } });
        const data = response?.data || [];
        const arr = Array.isArray(data) ? data : [];
        return {
          totalSubmissions: arr?.length,
          successfulSubmissions: arr?.filter(s => s?.response_status === 'Acknowledged' || s?.status === 'Acknowledged')?.length,
          pendingSubmissions: arr?.filter(s => s?.response_status === 'Pending' || s?.status === 'Pending')?.length,
          errorSubmissions: arr?.filter(s => ['Error', 'Rejected']?.includes(s?.response_status || s?.status))?.length
        };
      } catch (error) {
        console.error('Error fetching submission statistics:', error?.message);
        return { totalSubmissions: 0, successfulSubmissions: 0, pendingSubmissions: 0, errorSubmissions: 0 };
      }
    }
    return { totalSubmissions: 0, successfulSubmissions: 0, pendingSubmissions: 0, errorSubmissions: 0 };
  },

  async createSubmission(submissionData) {
    if (useRestApi) {
      try {
        const payload = {
          submissionId: submissionData?.submissionId || null,
          organizationId: submissionData?.organizationId,
          reportingYear: submissionData?.reportingYear,
          giinConfigId: submissionData?.giinConfigId || null
        };
        const response = await apiClient?.post('/api/submissions', payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error creating submission:', error?.message);
        return { error };
      }
    }
    return { error: { message: 'Supabase submission creation not supported in this context' } };
  },

  async submitSubmissionForApproval(submissionId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/submissions/${submissionId}/submit`);
        return { data: response?.data };
      } catch (error) {
        console.error('Error submitting for approval:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_submission_log')?.update({
        approval_status: 'pending_approval', submitted_at_approval: new Date()?.toISOString()
      })?.eq('id', submissionId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async approveSubmission(submissionId, approvedByUserId, comments) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/submissions/${submissionId}/approve`, {
          submissionId,
          approvedBy: approvedByUserId
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error approving submission:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_submission_log')?.update({
        approval_status: 'approved', approved_by_user_id: approvedByUserId,
        approval_comments: comments, approved_at: new Date()?.toISOString()
      })?.eq('id', submissionId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async rejectSubmission(submissionId, rejectedByUserId, comments) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/submissions/${submissionId}/reject`, {
          submissionId,
          approvedBy: rejectedByUserId
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error rejecting submission:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_submission_log')?.update({
        approval_status: 'rejected', approved_by_user_id: rejectedByUserId,
        approval_comments: comments, approved_at: new Date()?.toISOString()
      })?.eq('id', submissionId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async updateSubmissionStatus(submissionId, status, responseMessage) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/submissions/${submissionId}/status`, {
          submissionId,
          status,
          responseMessage: responseMessage || null
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating submission status:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_submission_log')?.update({
        response_status: status, response_message: responseMessage
      })?.eq('id', submissionId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }
};

export default submissionService;