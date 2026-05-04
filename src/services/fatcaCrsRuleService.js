import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const fatcaCrsRuleService = {
  async getRuleSets(organizationId, filters = {}) {
    if (useRestApi) {
      try {
        const params = { organizationId };
        if (filters?.regimeType && filters?.regimeType !== 'all') params.regime = filters?.regimeType;
        if (filters?.segmentId && filters?.segmentId !== 'all') params.segmentId = filters?.segmentId;
        if (filters?.reportingYear && filters?.reportingYear !== 'all') params.year = filters?.reportingYear;
        if (filters?.status && filters?.status !== 'all') params.status = filters?.status;
        if (filters?.search) params.searchTerm = filters?.search;
        if (filters?.showRetired !== undefined) params.showRetired = filters?.showRetired;
        if (filters?.page) params.page = filters?.page;
        if (filters?.pageSize) params.pageSize = filters?.pageSize;

        const response = await apiClient?.get('/api/rules', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching rule sets:', error?.message);
        return [];
      }
    }
    // Supabase fallback
    try {
      let query = supabase?.from('fatca_crs_rule_sets')?.select(`
        id, rule_name, description, segment_id, regime_type, reporting_year, version_number, status,
        created_by, approved_by, created_on, approved_on, updated_at, approval_status,
        created_by_user_id, approved_by_user_id, approval_comments, submitted_at, approved_at,
        is_active, retirement_date, retirement_reason, retired_by_user_id,
        segment_giin:segment_giin_configuration!fatca_crs_rule_sets_segment_id_fkey(segment_name, giin, entity_name),
        creator:user_profiles!fatca_crs_rule_sets_created_by_fkey(full_name),
        approver:user_profiles!fatca_crs_rule_sets_approved_by_fkey(full_name),
        created_by_user:created_by_user_id(id, full_name, email),
        approved_by_user:approved_by_user_id(id, full_name, email)
      `)?.eq('organization_id', organizationId);
      if (!filters?.showRetired) query = query?.eq('is_active', true);
      if (filters?.regimeType && filters?.regimeType !== 'all') query = query?.eq('regime_type', filters?.regimeType);
      if (filters?.segmentId && filters?.segmentId !== 'all') query = query?.eq('segment_id', filters?.segmentId);
      if (filters?.reportingYear && filters?.reportingYear !== 'all') query = query?.eq('reporting_year', parseInt(filters?.reportingYear));
      if (filters?.status && filters?.status !== 'all') query = query?.eq('status', filters?.status);
      if (filters?.search) query = query?.ilike('rule_name', `%${filters?.search}%`);
      const { data, error } = await query?.order('created_on', { ascending: false });
      if (error) return [];
      return data?.map(rule => ({
        id: rule?.id, organizationId, ruleName: rule?.rule_name, description: rule?.description,
        segmentId: rule?.segment_id, segmentName: rule?.segment_giin?.segment_name || 'Unknown',
        segmentGiin: rule?.segment_giin?.giin || '', segmentEntityName: rule?.segment_giin?.entity_name || '',
        regimeType: rule?.regime_type, reportingYear: rule?.reporting_year, versionNumber: rule?.version_number,
        status: rule?.status, createdBy: rule?.creator?.full_name || 'Unknown', createdById: rule?.created_by,
        approvedBy: rule?.approver?.full_name || null, approvedById: rule?.approved_by,
        createdOn: rule?.created_on, approvedOn: rule?.approved_on, updatedAt: rule?.updated_at,
        approvalStatus: rule?.approval_status, createdByUserId: rule?.created_by_user_id,
        approvedByUserId: rule?.approved_by_user_id, approvalComments: rule?.approval_comments,
        submittedAt: rule?.submitted_at ? new Date(rule?.submitted_at) : null,
        approvedAtTimestamp: rule?.approved_at ? new Date(rule?.approved_at) : null,
        createdByUser: rule?.created_by_user, approvedByUser: rule?.approved_by_user,
        isActive: rule?.is_active, retirementDate: rule?.retirement_date ? new Date(rule?.retirement_date) : null,
        retirementReason: rule?.retirement_reason, retiredByUserId: rule?.retired_by_user_id
      })) || [];
    } catch {
      return [];
    }
  },

  async getSegments(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/segments', { params: { organizationId, activeOnly: true } });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching segments:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('segment_giin_configuration')?.select(
        'id, segment_name, giin, entity_name, address_line1, city, country, is_active, approval_status, organization_id' )?.eq('organization_id', organizationId)?.eq('is_active', true)?.eq('approval_status', 'approved')?.order('segment_name');
      if (error) return [];
      return data?.map(segment => ({
        id: segment?.id, segment_name: segment?.segment_name || '', giin: segment?.giin || '',
        entity_name: segment?.entity_name || '', address_line1: segment?.address_line1 || '',
        city: segment?.city || '', country: segment?.country || '',
        is_active: segment?.is_active, approval_status: segment?.approval_status, organization_id: segment?.organization_id
      })) || [];
    } catch {
      return [];
    }
  },

  async createRuleSet(ruleData) {
    if (useRestApi) {
      try {
        const payload = {
          ruleSetId: ruleData?.ruleSetId || null,
          organizationId: ruleData?.organizationId,
          ruleName: ruleData?.ruleName,
          regime: ruleData?.regimeType,
          segment: ruleData?.segmentId,
          reportingYear: ruleData?.reportingYear,
          description: ruleData?.description,
          createdBy: ruleData?.createdByUserId,
          conditions: typeof ruleData?.conditions === 'string'
            ? ruleData?.conditions
            : JSON.stringify(ruleData?.conditions || [])
        };
        const response = await apiClient?.post('/api/rules', payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error creating rule set:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_sets')?.insert({
        organization_id: ruleData?.organizationId, segment_id: ruleData?.segmentId,
        regime_type: ruleData?.regimeType, reporting_year: ruleData?.reportingYear,
        rule_name: ruleData?.ruleName, description: ruleData?.description,
        status: 'draft', version_number: 1, created_by: ruleData?.createdBy,
        approval_status: 'draft', created_by_user_id: ruleData?.createdByUserId
      })?.select()?.single();
      if (error) return { error };
      if (data && ruleData?.conditions && ruleData?.conditions?.length > 0) {
        const conditionsToInsert = ruleData?.conditions?.map((cond, idx) => ({
          rule_set_id: data?.id, field_name: cond?.field, operator: cond?.operator,
          value: cond?.value, sequence: idx + 1
        }));
        await supabase?.from('fatca_crs_rule_conditions')?.insert(conditionsToInsert);
      }
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async updateRuleSet(ruleSetId, updates) {
    if (useRestApi) {
      try {
        const payload = {
          ruleSetId,
          ruleName: updates?.ruleName,
          description: updates?.description,
          updatedBy: updates?.updatedBy
        };
        const response = await apiClient?.put(`/api/rules/${ruleSetId}`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating rule set:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_sets')?.update({
        rule_name: updates?.ruleName, description: updates?.description, updated_at: new Date()?.toISOString()
      })?.eq('id', ruleSetId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async deleteRuleSet(ruleSetId) {
    if (useRestApi) {
      try {
        await apiClient?.delete(`/api/rules/${ruleSetId}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting rule set:', error?.message);
        return { error };
      }
    }
    try {
      await supabase?.from('fatca_crs_rule_conditions')?.delete()?.eq('rule_set_id', ruleSetId);
      const { error } = await supabase?.from('fatca_crs_rule_sets')?.delete()?.eq('id', ruleSetId);
      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  async submitRuleForApproval(ruleSetId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/rules/${ruleSetId}/submit`);
        return { data: response?.data };
      } catch (error) {
        console.error('Error submitting rule for approval:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_sets')?.update({
        approval_status: 'pending_approval', submitted_at: new Date()?.toISOString()
      })?.eq('id', ruleSetId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async approveRuleWorkflow(ruleSetId, approvedBy, comments) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/rules/${ruleSetId}/approve-workflow`, {
          ruleSetId,
          approvedBy
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error approving rule workflow:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_sets')?.update({
        approval_status: 'approved', approved_by_user_id: approvedBy,
        approval_comments: comments, approved_at: new Date()?.toISOString(), status: 'active'
      })?.eq('id', ruleSetId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async rejectRuleWorkflow(ruleSetId, reason) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/rules/${ruleSetId}/reject-workflow`, {
          ruleSetId,
          reason
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error rejecting rule workflow:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_sets')?.update({
        approval_status: 'rejected', approval_comments: reason
      })?.eq('id', ruleSetId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async retireRuleSet(ruleSetId, retirementReason, retiredBy) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/rules/${ruleSetId}/retire`, {
          ruleSetId,
          retirementReason,
          retiredBy
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error retiring rule set:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_sets')?.update({
        is_active: false, retirement_date: new Date()?.toISOString(),
        retirement_reason: retirementReason, retired_by_user_id: retiredBy
      })?.eq('id', ruleSetId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async getRuleConditions(ruleSetId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get(`/api/rules/${ruleSetId}/conditions`, {
          params: { ruleSetId }
        });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching rule conditions:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_conditions')?.select('*')?.eq('rule_set_id', ruleSetId)?.order('sequence');
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async createRuleCondition(ruleSetId, conditionData) {
    if (useRestApi) {
      try {
        const payload = {
          conditionId: conditionData?.conditionId || null,
          ruleSetId,
          fieldName: conditionData?.field || conditionData?.fieldName,
          operator: conditionData?.operator,
          value: conditionData?.value,
          sequence: conditionData?.sequence
        };
        const response = await apiClient?.post(`/api/rules/${ruleSetId}/conditions`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error creating rule condition:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_conditions')?.insert({
        rule_set_id: ruleSetId, field_name: conditionData?.field || conditionData?.fieldName,
        operator: conditionData?.operator, value: conditionData?.value, sequence: conditionData?.sequence
      })?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async updateRuleCondition(conditionId, updates) {
    if (useRestApi) {
      try {
        const payload = {
          conditionId,
          fieldName: updates?.field || updates?.fieldName,
          operator: updates?.operator,
          value: updates?.value,
          sequence: updates?.sequence
        };
        const response = await apiClient?.put(`/api/rules/conditions/${conditionId}`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating rule condition:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_conditions')?.update({
        field_name: updates?.field || updates?.fieldName, operator: updates?.operator,
        value: updates?.value, sequence: updates?.sequence
      })?.eq('id', conditionId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async deleteRuleCondition(conditionId) {
    if (useRestApi) {
      try {
        await apiClient?.delete(`/api/rules/conditions/${conditionId}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting rule condition:', error?.message);
        return { error };
      }
    }
    try {
      const { error } = await supabase?.from('fatca_crs_rule_conditions')?.delete()?.eq('id', conditionId);
      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  async getRuleHistory(ruleSetId, filters = {}) {
    if (useRestApi) {
      try {
        const params = { ruleSetId };
        if (filters?.changeType) params.changeType = filters?.changeType;
        if (filters?.changedBy) params.changedBy = filters?.changedBy;
        if (filters?.startDate) params.startDate = filters?.startDate;
        if (filters?.endDate) params.endDate = filters?.endDate;
        if (filters?.page) params.page = filters?.page;
        if (filters?.pageSize) params.pageSize = filters?.pageSize;
        const response = await apiClient?.get(`/api/rules/${ruleSetId}/history`, { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching rule history:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_rule_version_history')?.select(`
        *, changed_by:user_profiles!changed_by_user_id(id, full_name, email)
      `)?.eq('rule_id', ruleSetId)?.order('version_number', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }
};
