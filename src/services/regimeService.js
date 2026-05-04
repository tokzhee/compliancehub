import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const regimeService = {
  async getRegimes() {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/regimes');
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching regimes:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('reporting_regimes')?.select('*')?.eq('is_active', true)?.order('regime_type');
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async getBusinessSegments(regimeCode) {
    if (useRestApi) {
      try {
        const params = {};
        if (regimeCode) params.regimeCode = regimeCode;
        const response = await apiClient?.get('/api/regimes/segments', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching segments:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('business_segments')?.select('*')?.eq('is_active', true)?.order('segment_name');
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async getUserSegmentRoles(userId) {
    try {
      const { data, error } = await supabase?.from('user_segment_roles')?.select(`
        *, business_segments(id, segment_name, segment_code)
      `)?.eq('user_id', userId);
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async createBusinessSegment(organizationId, segmentData) {
    try {
      const { data, error } = await supabase?.from('business_segments')?.insert({
        organization_id: organizationId, segment_name: segmentData?.segmentName,
        segment_code: segmentData?.segmentCode, description: segmentData?.description, is_active: true
      })?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }
};

export default regimeService;