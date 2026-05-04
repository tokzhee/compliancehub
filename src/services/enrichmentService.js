import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const enrichmentService = {
  async getCasesForEnrichment(organizationId, userId, filters = {}) {
    if (useRestApi) {
      try {
        const params = { organizationId, userId };
        if (filters?.status && filters?.status !== 'all') params.status = filters?.status;
        if (filters?.search) params.searchTerm = filters?.search;
        if (filters?.page) params.page = filters?.page;
        if (filters?.pageSize) params.pageSize = filters?.pageSize;

        const response = await apiClient?.get('/api/enrichment/cases', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching enrichment cases:', error?.message);
        return [];
      }
    }
    // Supabase fallback
    try {
      const { data: userSegments } = await supabase?.from('user_segment_roles')?.select('segment_id, assignment_team')?.eq('user_id', userId)?.eq('can_enrich_data', true);
      if (!userSegments || userSegments?.length === 0) return [];
      const segmentIds = userSegments?.map(s => s?.segment_id);
      const { data, error } = await supabase?.from('fatca_crs_case_master')?.select(`
        id, customer_id, account_number, customer_name, account_balance, country_code,
        completeness_status, reportable_flag, case_status, assigned_team, assigned_user,
        priority, created_at, updated_at, dataset_batch_id,
        fatca_crs_dataset_batch!fatca_crs_case_master_dataset_batch_id_fkey(
          id, regime_type, reporting_year, segment_id, organization_id,
          segment_giin_configuration!fatca_crs_dataset_batch_segment_id_fkey(id, segment_name, giin, entity_name)
        )
      `)?.eq('fatca_crs_dataset_batch.organization_id', organizationId)?.in('fatca_crs_dataset_batch.segment_id', segmentIds)?.order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async getCaseDetails(caseId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get(`/api/enrichment/cases/${caseId}/details`, {
          params: { caseId }
        });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching case details:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_case_details')?.select('*')?.eq('case_id', caseId)?.order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async updateCaseField(caseId, updatedBy, fieldName, fieldValue) {
    if (useRestApi) {
      try {
        const response = await apiClient?.post(`/api/enrichment/cases/${caseId}/fields`, {
          caseId,
          fieldName,
          fieldValue,
          updatedBy
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating case field:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_case_details')?.insert({
        case_id: caseId, field_name: fieldName, updated_value: fieldValue,
        is_overridden: true, updated_by: updatedBy, updated_on: new Date()?.toISOString(), validation_status: 'Updated'
      })?.select()?.single();
      if (error) return { error };
      await supabase?.from('fatca_crs_case_master')?.update({ case_status: 'Under Enrichment', updated_at: new Date()?.toISOString() })?.eq('id', caseId);
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async markCaseReady(caseId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/enrichment/cases/${caseId}/ready`, null, {
          params: { caseId }
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error marking case ready:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_case_master')?.update({
        case_status: 'Ready for Review', completeness_status: 'Complete', updated_at: new Date()?.toISOString()
      })?.eq('id', caseId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async addCaseNote(caseId, createdBy, note, noteType = 'General') {
    if (useRestApi) {
      try {
        const response = await apiClient?.post(`/api/enrichment/cases/${caseId}/notes`, {
          caseId,
          note,
          createdBy
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error adding case note:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_case_notes')?.insert({
        case_id: caseId, user_id: createdBy, note_text: note, note_type: noteType
      })?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async getCaseNotes(caseId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get(`/api/enrichment/cases/${caseId}/notes`, {
          params: { caseId }
        });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching case notes:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('fatca_crs_case_notes')?.select(`
        *, user_profiles!fatca_crs_case_notes_user_id_fkey(full_name, email)
      `)?.eq('case_id', caseId)?.order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }
};

export default enrichmentService;