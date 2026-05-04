import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

/**
 * Fetch version history for a specific rule
 */
export const getRuleVersionHistory = async (ruleId, filters = {}) => {
  if (useRestApi) {
    try {
      const params = { ruleSetId: ruleId };
      if (filters?.changeType) params.changeType = filters?.changeType;
      if (filters?.changedBy) params.changedBy = filters?.changedBy;
      if (filters?.startDate) params.startDate = filters?.startDate;
      if (filters?.endDate) params.endDate = filters?.endDate;
      if (filters?.page) params.page = filters?.page;
      if (filters?.pageSize) params.pageSize = filters?.pageSize;

      const response = await apiClient?.get(`/api/rules/${ruleId}/history`, { params });
      const data = response?.data || [];
      return {
        success: true,
        data: Array.isArray(data) ? data?.map(version => ({
          id: version?.id,
          ruleId: version?.ruleId || version?.rule_id,
          versionNumber: version?.versionNumber || version?.version_number,
          modifiedDate: version?.modifiedDate || version?.modified_date,
          changedBy: version?.changedBy || {
            id: version?.changed_by_user_id,
            fullName: version?.changed_by?.full_name,
            email: version?.changed_by?.email
          },
          changes: version?.changes,
          changeType: version?.changeType || version?.change_type,
          organizationId: version?.organizationId || version?.organization_id,
          createdAt: version?.createdAt || version?.created_at
        })) : []
      };
    } catch (error) {
      console.error('Error fetching rule version history:', error);
      return { success: false, error: error?.message };
    }
  }
  try {
    let query = supabase?.from('fatca_crs_rule_version_history')?.select(`
      *, changed_by:user_profiles!changed_by_user_id(id, full_name, email)
    `)?.eq('rule_id', ruleId)?.order('version_number', { ascending: false });
    if (filters?.changeType) query = query?.eq('change_type', filters?.changeType);
    if (filters?.changedBy) query = query?.eq('changed_by_user_id', filters?.changedBy);
    if (filters?.startDate) query = query?.gte('modified_date', filters?.startDate);
    if (filters?.endDate) query = query?.lte('modified_date', filters?.endDate);
    const { data, error } = await query;
    if (error) throw error;
    return {
      success: true,
      data: data?.map(version => ({
        id: version?.id, ruleId: version?.rule_id, versionNumber: version?.version_number,
        modifiedDate: version?.modified_date,
        changedBy: { id: version?.changed_by?.id, fullName: version?.changed_by?.full_name, email: version?.changed_by?.email },
        changes: version?.changes, changeType: version?.change_type,
        organizationId: version?.organization_id, createdAt: version?.created_at
      })) || []
    };
  } catch (error) {
    console.error('Error fetching rule version history:', error);
    return { success: false, error: error?.message };
  }
};

/**
 * Get specific version details
 */
export const getVersionDetails = async (versionId) => {
  try {
    const { data, error } = await supabase?.from('fatca_crs_rule_version_history')?.select(`
      *, changed_by:user_profiles!changed_by_user_id(id, full_name, email),
      rule:fatca_crs_rule_sets(id, rule_name, regime_type, approval_status)
    `)?.eq('id', versionId)?.single();
    if (error) throw error;
    return {
      success: true,
      data: {
        id: data?.id, ruleId: data?.rule_id, versionNumber: data?.version_number,
        modifiedDate: data?.modified_date,
        changedBy: { id: data?.changed_by?.id, fullName: data?.changed_by?.full_name, email: data?.changed_by?.email },
        changes: data?.changes, changeType: data?.change_type,
        rule: { id: data?.rule?.id, ruleName: data?.rule?.rule_name, regimeType: data?.rule?.regime_type, approvalStatus: data?.rule?.approval_status }
      }
    };
  } catch (error) {
    console.error('Error fetching version details:', error);
    return { success: false, error: error?.message };
  }
};

/**
 * Compare two versions of a rule
 */
export const compareVersions = async (ruleId, version1Number, version2Number) => {
  try {
    const { data, error } = await supabase?.from('fatca_crs_rule_version_history')?.select('*')?.eq('rule_id', ruleId)?.in('version_number', [version1Number, version2Number])?.order('version_number', { ascending: true });
    if (error) throw error;
    if (!data || data?.length !== 2) throw new Error('Could not find both versions for comparison');
    const [olderVersion, newerVersion] = data;
    const allFields = new Set();
    if (olderVersion?.changes?.old_values) Object.keys(olderVersion?.changes?.old_values)?.forEach(key => allFields?.add(key));
    if (olderVersion?.changes?.new_values) Object.keys(olderVersion?.changes?.new_values)?.forEach(key => allFields?.add(key));
    if (newerVersion?.changes?.old_values) Object.keys(newerVersion?.changes?.old_values)?.forEach(key => allFields?.add(key));
    if (newerVersion?.changes?.new_values) Object.keys(newerVersion?.changes?.new_values)?.forEach(key => allFields?.add(key));
    const comparison = {
      olderVersion: { versionNumber: olderVersion?.version_number, modifiedDate: olderVersion?.modified_date, changeType: olderVersion?.change_type },
      newerVersion: { versionNumber: newerVersion?.version_number, modifiedDate: newerVersion?.modified_date, changeType: newerVersion?.change_type },
      fieldChanges: []
    };
    allFields?.forEach(fieldName => {
      const oldValue = olderVersion?.changes?.new_values?.[fieldName] || olderVersion?.changes?.old_values?.[fieldName];
      const newValue = newerVersion?.changes?.new_values?.[fieldName] || newerVersion?.changes?.old_values?.[fieldName];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        comparison?.fieldChanges?.push({ fieldName, oldValue, newValue, changed: true });
      }
    });
    return { success: true, data: comparison };
  } catch (error) {
    console.error('Error comparing versions:', error);
    return { success: false, error: error?.message };
  }
};

/**
 * Get all users who have modified a rule (for filter dropdown)
 */
export const getRuleModifiers = async (ruleId) => {
  try {
    const { data, error } = await supabase?.from('fatca_crs_rule_version_history')?.select(`
      changed_by_user_id, changed_by:user_profiles!changed_by_user_id(id, full_name, email)
    `)?.eq('rule_id', ruleId);
    if (error) throw error;
    const uniqueUsers = [];
    const seenIds = new Set();
    data?.forEach(item => {
      if (item?.changed_by && !seenIds?.has(item?.changed_by?.id)) {
        seenIds?.add(item?.changed_by?.id);
        uniqueUsers?.push({ id: item?.changed_by?.id, fullName: item?.changed_by?.full_name, email: item?.changed_by?.email });
      }
    });
    return { success: true, data: uniqueUsers };
  } catch (error) {
    console.error('Error fetching rule modifiers:', error);
    return { success: false, error: error?.message };
  }
};

/**
 * Get statistics for rule version history
 */
export const getRuleVersionStats = async (ruleId) => {
  try {
    const { data, error } = await supabase?.from('fatca_crs_rule_version_history')?.select('change_type')?.eq('rule_id', ruleId);
    if (error) throw error;
    const stats = { totalVersions: data?.length || 0, created: 0, updated: 0, approved: 0, rejected: 0, retired: 0 };
    data?.forEach(item => {
      const type = item?.change_type?.toLowerCase();
      if (stats?.[type] !== undefined) stats[type]++;
    });
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching rule version stats:', error);
    return { success: false, error: error?.message };
  }
};

/**
 * Get condition changes for a specific version
 */
export const getConditionChanges = async (ruleId, versionNumber) => {
  try {
    const { data, error } = await supabase?.from('fatca_crs_rule_version_history')?.select('changes')?.eq('rule_id', ruleId)?.eq('version_number', versionNumber)?.single();

    if (error) throw error;

    const oldConditions = data?.changes?.old_values?.conditions || [];
    const newConditions = data?.changes?.new_values?.conditions || [];

    // Categorize condition changes
    const added = [];
    const removed = [];
    const modified = [];

    // Find added conditions
    newConditions?.forEach(newCond => {
      const matchingOld = oldConditions?.find(oldCond => 
        oldCond?.field_name === newCond?.field_name && 
        oldCond?.sequence_order === newCond?.sequence_order
      );

      if (!matchingOld) {
        added?.push(newCond);
      } else if (JSON.stringify(oldCond) !== JSON.stringify(newCond)) {
        modified?.push({ old: matchingOld, new: newCond });
      }
    });

    // Find removed conditions
    oldConditions?.forEach(oldCond => {
      const matchingNew = newConditions?.find(newCond => 
        newCond?.field_name === oldCond?.field_name && 
        newCond?.sequence_order === oldCond?.sequence_order
      );

      if (!matchingNew) {
        removed?.push(oldCond);
      }
    });

    return {
      success: true,
      data: {
        added,
        removed,
        modified
      }
    };
  } catch (error) {
    console.error('Error fetching condition changes:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};