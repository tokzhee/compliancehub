import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const segmentGiinService = {
  async getSegmentGiinConfigurations(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/segments', { params: { organizationId } });
        const data = response?.data || [];
        return Array.isArray(data) ? data?.map(config => ({
          id: config?.id,
          organizationId: config?.organizationId || config?.organization_id,
          segmentName: config?.segmentName || config?.segment_name,
          giin: config?.giin,
          entityName: config?.entityName || config?.entity_name,
          addressLine1: config?.addressLine1 || config?.address_line1,
          addressLine2: config?.addressLine2 || config?.address_line2,
          city: config?.city,
          state: config?.state,
          postalCode: config?.postalCode || config?.postal_code,
          country: config?.country,
          contactPerson: config?.contactPerson || config?.contact_person,
          contactEmail: config?.contactEmail || config?.contact_email,
          contactPhone: config?.contactPhone || config?.contact_phone,
          isActive: config?.isActive !== undefined ? config?.isActive : config?.is_active,
          approvalStatus: config?.approvalStatus || config?.approval_status,
          createdByUserId: config?.createdByUserId || config?.created_by_user_id,
          approvedByUserId: config?.approvedByUserId || config?.approved_by_user_id,
          approvalComments: config?.approvalComments || config?.approval_comments,
          submittedAt: config?.submittedAt || config?.submitted_at ? new Date(config?.submittedAt || config?.submitted_at) : null,
          approvedAt: config?.approvedAt || config?.approved_at ? new Date(config?.approvedAt || config?.approved_at) : null,
          createdAt: config?.createdAt || config?.created_at ? new Date(config?.createdAt || config?.created_at) : null,
          updatedAt: config?.updatedAt || config?.updated_at ? new Date(config?.updatedAt || config?.updated_at) : null
        })) : [];
      } catch (error) {
        console.error('Error fetching segment GIIN configurations:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('segment_giin_configuration')?.select(`
        id, organization_id, segment_name, giin, entity_name, address_line1, address_line2, city, state,
        postal_code, country, contact_person, contact_email, contact_phone, is_active, approval_status,
        created_by_user_id, approved_by_user_id, approval_comments, submitted_at, approved_at, created_at, updated_at,
        created_by:created_by_user_id(id, full_name, email),
        approved_by:approved_by_user_id(id, full_name, email)
      `)?.eq('organization_id', organizationId)?.order('segment_name', { ascending: true });
      if (error) return [];
      return data?.map(config => ({
        id: config?.id, organizationId: config?.organization_id, segmentName: config?.segment_name,
        giin: config?.giin, entityName: config?.entity_name, addressLine1: config?.address_line1,
        addressLine2: config?.address_line2, city: config?.city, state: config?.state,
        postalCode: config?.postal_code, country: config?.country, contactPerson: config?.contact_person,
        contactEmail: config?.contact_email, contactPhone: config?.contact_phone,
        isActive: config?.is_active, approvalStatus: config?.approval_status,
        createdByUserId: config?.created_by_user_id, approvedByUserId: config?.approved_by_user_id,
        approvalComments: config?.approval_comments,
        submittedAt: config?.submitted_at ? new Date(config?.submitted_at) : null,
        approvedAt: config?.approved_at ? new Date(config?.approved_at) : null,
        createdBy: config?.created_by, approvedBy: config?.approved_by,
        createdAt: new Date(config?.created_at), updatedAt: new Date(config?.updated_at)
      })) || [];
    } catch {
      return [];
    }
  },

  async createSegmentGiinConfiguration(configData) {
    if (useRestApi) {
      try {
        const payload = {
          segmentId: configData?.segmentId || null,
          organizationId: configData?.organizationId,
          segment: configData?.segmentName,
          entityName: configData?.entityName,
          giin: configData?.giin,
          sponsorGIIN: configData?.sponsorGiin || null,
          countryCode: configData?.country,
          reportingType: configData?.reportingType || null,
          contactPerson: configData?.contactPerson
        };
        const response = await apiClient?.post('/api/segments', payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error creating segment GIIN configuration:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('segment_giin_configuration')?.insert({
        organization_id: configData?.organizationId, segment_name: configData?.segmentName,
        giin: configData?.giin, entity_name: configData?.entityName,
        address_line1: configData?.addressLine1, address_line2: configData?.addressLine2 || null,
        city: configData?.city, state: configData?.state || null, postal_code: configData?.postalCode,
        country: configData?.country, contact_person: configData?.contactPerson,
        contact_email: configData?.contactEmail, contact_phone: configData?.contactPhone || null,
        is_active: configData?.isActive !== undefined ? configData?.isActive : true,
        approval_status: 'draft', created_by_user_id: configData?.createdByUserId
      })?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async updateSegmentGiinConfiguration(configId, updates) {
    if (useRestApi) {
      try {
        const payload = {
          segmentId: configId,
          segment: updates?.segmentName,
          entityName: updates?.entityName,
          giin: updates?.giin,
          sponsorGIIN: updates?.sponsorGiin || null,
          countryCode: updates?.country,
          reportingType: updates?.reportingType || null,
          contactPerson: updates?.contactPerson
        };
        const response = await apiClient?.put(`/api/segments/${configId}`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating segment GIIN configuration:', error?.message);
        return { error };
      }
    }
    try {
      const updateData = {};
      if (updates?.segmentName !== undefined) updateData.segment_name = updates?.segmentName;
      if (updates?.giin !== undefined) updateData.giin = updates?.giin;
      if (updates?.entityName !== undefined) updateData.entity_name = updates?.entityName;
      if (updates?.addressLine1 !== undefined) updateData.address_line1 = updates?.addressLine1;
      if (updates?.addressLine2 !== undefined) updateData.address_line2 = updates?.addressLine2;
      if (updates?.city !== undefined) updateData.city = updates?.city;
      if (updates?.state !== undefined) updateData.state = updates?.state;
      if (updates?.postalCode !== undefined) updateData.postal_code = updates?.postalCode;
      if (updates?.country !== undefined) updateData.country = updates?.country;
      if (updates?.contactPerson !== undefined) updateData.contact_person = updates?.contactPerson;
      if (updates?.contactEmail !== undefined) updateData.contact_email = updates?.contactEmail;
      if (updates?.contactPhone !== undefined) updateData.contact_phone = updates?.contactPhone;
      if (updates?.isActive !== undefined) updateData.is_active = updates?.isActive;
      updateData.updated_at = new Date()?.toISOString();
      const { data, error } = await supabase?.from('segment_giin_configuration')?.update(updateData)?.eq('id', configId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async deleteSegmentGiinConfiguration(configId) {
    if (useRestApi) {
      try {
        await apiClient?.delete(`/api/segments/${configId}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting segment GIIN configuration:', error?.message);
        return { error };
      }
    }
    try {
      const { error } = await supabase?.from('segment_giin_configuration')?.delete()?.eq('id', configId);
      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  async submitForApproval(configId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/segments/${configId}/submit`);
        return { data: response?.data };
      } catch (error) {
        console.error('Error submitting for approval:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('segment_giin_configuration')?.update({
        approval_status: 'pending_approval', submitted_at: new Date()?.toISOString()
      })?.eq('id', configId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async approveConfiguration(configId, approvedByUserId, comments) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/segments/${configId}/approve`, {
          segmentId: configId,
          approvedBy: approvedByUserId
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error approving configuration:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('segment_giin_configuration')?.update({
        approval_status: 'approved', approved_by_user_id: approvedByUserId,
        approval_comments: comments, approved_at: new Date()?.toISOString()
      })?.eq('id', configId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async rejectConfiguration(configId, rejectedByUserId, comments) {
    if (useRestApi) {
      try {
        const response = await apiClient?.put(`/api/segments/${configId}/reject`);
        return { data: response?.data };
      } catch (error) {
        console.error('Error rejecting configuration:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('segment_giin_configuration')?.update({
        approval_status: 'rejected', approved_by_user_id: rejectedByUserId, approval_comments: comments
      })?.eq('id', configId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }
};