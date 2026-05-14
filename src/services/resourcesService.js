import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

/**
 * Fetch all active resources content for the current organization
 * @returns {Promise<Array>} Array of resource sections
 */
export const getResourcesContent = async () => {
  if (useRestApi) {
    try {
      const response = await apiClient?.get('/api/resources');
      const data = response?.data || [];
      return Array.isArray(data) ? data?.map(item => ({
        id: item?.id,
        organizationId: item?.organizationId || item?.organization_id,
        sectionId: item?.sectionId || item?.section_id,
        title: item?.title,
        category: item?.category,
        tags: item?.tags || [],
        icon: item?.icon,
        contentType: item?.contentType || item?.content_type,
        content: item?.content,
        displayOrder: item?.displayOrder || item?.display_order,
        isActive: item?.isActive !== undefined ? item?.isActive : item?.is_active,
        createdAt: item?.createdAt || item?.created_at,
        updatedAt: item?.updatedAt || item?.updated_at
      })) : [];
    } catch (error) {
      console.error('Error fetching resources content:', error);
      throw error;
    }
  }
  // Supabase fallback
  try {
    const { data: { user }, error: userError } = await supabase?.auth?.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase?.from('resources_content')?.select('*')?.eq('is_active', true)?.eq('status', 'published')?.order('display_order', { ascending: true });
    if (error) throw error;
    return data?.map(item => ({
      id: item?.id, organizationId: item?.organization_id, sectionId: item?.section_id,
      title: item?.title, category: item?.category, tags: item?.tags || [], icon: item?.icon,
      contentType: item?.content_type, content: item?.content, displayOrder: item?.display_order,
      isActive: item?.is_active, createdAt: item?.created_at, updatedAt: item?.updated_at
    })) || [];
  } catch (error) {
    console.error('Error fetching resources content:', error);
    throw error;
  }
};

/**
 * Parse markdown content to HTML (basic implementation)
 * For production, consider using a library like marked or react-markdown
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export const parseMarkdown = (markdown) => {
  if (!markdown) return '';
  let html = markdown;
  html = html?.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-foreground mt-4 mb-2">$1</h3>');
  html = html?.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-foreground mt-6 mb-3">$1</h2>');
  html = html?.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-foreground mt-8 mb-4">$1</h1>');
  html = html?.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>');
  html = html?.replace(/^\- (.*$)/gim, '<li class="ml-4 text-muted-foreground">$1</li>');
  html = html?.replace(/(<li.*<\/li>)/s, '<ul class="list-disc space-y-1 my-2">$1</ul>');
  html = html?.replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed my-2">');
  html = '<p class="text-muted-foreground leading-relaxed my-2">' + html + '</p>';
  html = html?.replace(/\n/g, '<br />');
  return html;
};

/**
 * Create new resource content
 */
export const createResourceContent = async (resourceData) => {
  if (useRestApi) {
    try {
      const userId = localStorage.getItem('user_id');
      const payload = {
        resourceId: resourceData?.resourceId || null,
        title: resourceData?.title,
        contentType: resourceData?.contentType || 'markdown',
        body: resourceData?.content,
        filePath: resourceData?.filePath || null,
        createdBy: userId
      };
      const response = await apiClient?.post('/api/resources', payload);
      return response?.data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }
  try {
    const { data: { user } } = await supabase?.auth?.getUser();
    const { data: profile } = await supabase?.from('user_profiles')?.select('organization_id')?.eq('id', user?.id)?.single();
    const { data, error } = await supabase?.from('resources_content')?.insert({
      organization_id: profile?.organization_id, section_id: resourceData?.sectionId,
      title: resourceData?.title, category: resourceData?.category, tags: resourceData?.tags || [],
      icon: resourceData?.icon || 'FileText', content_type: resourceData?.contentType || 'markdown',
      content: resourceData?.content, status: resourceData?.status || 'draft',
      display_order: resourceData?.displayOrder || 0, is_active: true,
      created_by: user?.id, updated_by: user?.id
    })?.select()?.single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

/**
 * Update existing resource content
 */
export const updateResourceContent = async (resourceId, resourceData) => {
  if (useRestApi) {
    try {
      const userId = localStorage.getItem('user_id');
      const payload = {
        resourceId,
        title: resourceData?.title,
        body: resourceData?.content,
        isPublished: resourceData?.status === 'published',
        changedBy: userId
      };
      const response = await apiClient?.put(`/api/resources/${resourceId}`, payload);
      return response?.data;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  }
  try {
    const { data: { user } } = await supabase?.auth?.getUser();
    const { data, error } = await supabase?.from('resources_content')?.update({
      title: resourceData?.title, category: resourceData?.category, tags: resourceData?.tags || [],
      icon: resourceData?.icon, content_type: resourceData?.contentType, content: resourceData?.content,
      status: resourceData?.status, display_order: resourceData?.displayOrder,
      updated_by: user?.id, updated_at: new Date()?.toISOString()
    })?.eq('id', resourceId)?.select()?.single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

/**
 * Get resource content by ID (including drafts for admins)
 */
export const getResourceById = async (resourceId) => {
  if (useRestApi) {
    try {
      const response = await apiClient?.get('/api/resources');
      const resources = response?.data || [];
      return resources?.find(r => r?.id === resourceId) || null;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  }
  try {
    const { data, error } = await supabase?.from('resources_content')?.select('*')?.eq('id', resourceId)?.single();
    if (error) throw error;
    return {
      id: data?.id, organizationId: data?.organization_id, sectionId: data?.section_id,
      title: data?.title, category: data?.category, tags: data?.tags || [], icon: data?.icon,
      contentType: data?.content_type, content: data?.content, status: data?.status,
      displayOrder: data?.display_order, isActive: data?.is_active, createdBy: data?.created_by,
      updatedBy: data?.updated_by, createdAt: data?.created_at, updatedAt: data?.updated_at
    };
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw error;
  }
};

/**
 * Get revision history for a resource
 */
export const getResourceHistory = async (resourceId) => {
  if (useRestApi) {
    try {
      const response = await apiClient?.get(`/api/resources/${resourceId}/history`);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching resource history:', error);
      throw error;
    }
  }
  try {
    const { data, error } = await supabase?.from('resources_content_history')?.select(`
      *, changed_by_profile:user_profiles!resources_content_history_changed_by_fkey(full_name, email)
    `)?.eq('resource_id', resourceId)?.order('changed_at', { ascending: false });
    if (error) throw error;
    return data?.map(item => ({
      id: item?.id, resourceId: item?.resource_id, title: item?.title,
      contentType: item?.content_type, content: item?.content, status: item?.status,
      displayOrder: item?.display_order, changedBy: item?.changed_by,
      changedByName: item?.changed_by_profile?.full_name, changedByEmail: item?.changed_by_profile?.email,
      changedAt: item?.changed_at, changeType: item?.change_type
    })) || [];
  } catch (error) {
    console.error('Error fetching resource history:', error);
    throw error;
  }
};

/**
 * Restore a previous version of resource content
 */
export const restoreResourceVersion = async (resourceId, historyId) => {
  if (useRestApi) {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await apiClient?.put(`/api/resources/${resourceId}/restore/${historyId}`, {
        resourceId,
        historyId,
        changedBy: userId
      });
      return response?.data;
    } catch (error) {
      console.error('Error restoring resource version:', error);
      throw error;
    }
  }
  try {
    const { data: { user } } = await supabase?.auth?.getUser();
    const { data: historyData } = await supabase?.from('resources_content_history')?.select('*')?.eq('id', historyId)?.single();
    const { data, error } = await supabase?.from('resources_content')?.update({
      title: historyData?.title, content: historyData?.content, content_type: historyData?.content_type,
      status: historyData?.status, display_order: historyData?.display_order,
      updated_by: user?.id, updated_at: new Date()?.toISOString()
    })?.eq('id', resourceId)?.select()?.single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error restoring resource version:', error);
    throw error;
  }
};

/**
 * Delete resource content
 */
export const deleteResourceContent = async (resourceId) => {
  if (useRestApi) {
    try {
      const userId = localStorage.getItem('user_id');
      await apiClient?.delete(`/api/resources/${resourceId}`, {
        params: { deletedBy: userId }
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
    return;
  }
  try {
    const { error } = await supabase?.from('resources_content')?.delete()?.eq('id', resourceId);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};