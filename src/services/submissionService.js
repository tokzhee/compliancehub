import apiClient from '../lib/apiClient';

export const submissionService = {
  async getSubmissionLogs(organizationId, filters = {}) {
    try {
      const params = { organizationId };
      if (filters?.status && filters?.status !== 'all') params.status = filters?.status;
      if (filters?.page) params.page = filters?.page;
      if (filters?.pageSize) params.pageSize = filters?.pageSize;
      if (filters?.dateFrom) params.dateFrom = filters?.dateFrom;
      if (filters?.dateTo) params.dateTo = filters?.dateTo;

      const response = await apiClient?.get('/api/submissions', { params });
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching submission logs:', error?.message);
      return [];
    }
  },

  async getSubmissionStatistics(organizationId, reportingYear) {
    try {
      const params = { organizationId };
      if (reportingYear) params.reportingYear = reportingYear;
      const response = await apiClient?.get('/api/submissions/stats', { params });
      return response?.data || { totalSubmissions: 0, successfulSubmissions: 0, pendingSubmissions: 0, errorSubmissions: 0 };
    } catch (error) {
      console.error('Error fetching submission statistics:', error?.message);
      return { totalSubmissions: 0, successfulSubmissions: 0, pendingSubmissions: 0, errorSubmissions: 0 };
    }
  },

  async createSubmission(submissionData) {
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
  },

  async submitSubmissionForApproval(submissionId) {
    try {
      const response = await apiClient?.put(`/api/submissions/${submissionId}/submit`);
      return { data: response?.data };
    } catch (error) {
      console.error('Error submitting for approval:', error?.message);
      return { error };
    }
  },

  async approveSubmission(submissionId, approvedByUserId) {
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
  },

  async rejectSubmission(submissionId) {
    try {
      const response = await apiClient?.put(`/api/submissions/${submissionId}/reject`);
      return { data: response?.data };
    } catch (error) {
      console.error('Error rejecting submission:', error?.message);
      return { error };
    }
  },

  async updateSubmissionStatus(submissionId, status, responseMessage) {
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
};

export default submissionService;