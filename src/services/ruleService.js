import { supabase } from '../lib/supabase';

function isSchemaError(error) {
  if (!error) return false;
  
  if (error?.code && typeof error?.code === 'string') {
    const errorClass = error?.code?.substring(0, 2);
    if (errorClass === '42' || errorClass === '08') {
      return true;
    }
    if (errorClass === '23') {
      return false;
    }
  }
  
  if (error?.message) {
    const schemaErrorPatterns = [
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i,
      /invalid.*syntax/i,
      /type.*does not exist/i,
      /undefined.*column/i,
      /undefined.*table/i,
      /undefined.*function/i,
    ];
    
    return schemaErrorPatterns?.some(pattern => pattern?.test(error?.message));
  }
  
  return false;
}

export const ruleService = {
  async getRules(organizationId, filters = {}) {
    try {
      let query = supabase?.from('rule_master')?.select(`
          id,
          rule_name,
          rule_type,
          description,
          status,
          created_at,
          updated_at,
          created_by,
          approved_by,
          user_profiles!rule_master_created_by_fkey(
            full_name
          )
        `)?.eq('organization_id', organizationId);

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.ruleType && filters?.ruleType !== 'all') {
        query = query?.eq('rule_type', filters?.ruleType);
      }

      if (filters?.search) {
        query = query?.ilike('rule_name', `%${filters?.search}%`);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error fetching rules:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return [];
        }
        console.log('Error fetching rules:', error?.message);
        return [];
      }

      // Get version info for each rule
      const rulesWithVersions = await Promise.all(
        (data || [])?.map(async (rule) => {
          const { data: versions, error: versionError } = await supabase?.from('rule_version')?.select('version_number')?.eq('rule_id', rule?.id)?.order('version_number', { ascending: false })?.limit(1);

          if (versionError && !isSchemaError(versionError)) {
            console.log('Error fetching rule version:', versionError?.message);
          }

          const latestVersion = versions?.[0]?.version_number || 1;

          return {
            id: rule?.id,
            ruleName: rule?.rule_name,
            ruleType: rule?.rule_type === 'classification' ? 'Classification Rules' :
                     rule?.rule_type === 'validation' ? 'Validation Rules' :
                     rule?.rule_type === 'reporting'? 'Reporting Rules' : 'Custom Rules',
            version: `${latestVersion}.0`,
            status: rule?.status,
            effectiveDate: new Date(rule.created_at)?.toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            }),
            createdBy: rule?.user_profiles?.full_name || 'Unknown',
            createdDate: new Date(rule.created_at)?.toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            }),
            isActive: rule?.status === 'active'
          };
        })
      );

      return rulesWithVersions;
    } catch (error) {
      if (isSchemaError(error)) {
        throw error;
      }
      console.log('Error fetching rules:', error?.message);
      return [];
    }
  },

  async createRule(ruleData) {
    try {
      const { data: rule, error: ruleError } = await supabase?.from('rule_master')?.insert({
          organization_id: ruleData?.organizationId,
          rule_name: ruleData?.ruleName,
          rule_type: ruleData?.ruleType,
          description: ruleData?.description,
          status: 'draft',
          created_by: ruleData?.createdBy
        })?.select()?.single();

      if (ruleError) {
        if (isSchemaError(ruleError)) {
          console.error('Schema error creating rule:', ruleError?.message);
          throw ruleError;
        }
        console.log('Error creating rule:', ruleError?.message);
        return { error: ruleError };
      }

      // Create initial version
      const { error: versionError } = await supabase?.from('rule_version')?.insert({
          rule_id: rule?.id,
          version_number: 1,
          rule_logic: ruleData?.ruleLogic || {},
          created_by: ruleData?.createdBy
        });

      if (versionError) {
        if (isSchemaError(versionError)) {
          console.error('Schema error creating rule version:', versionError?.message);
          throw versionError;
        }
        console.log('Error creating rule version:', versionError?.message);
      }

      return { data: rule };
    } catch (error) {
      if (isSchemaError(error)) {
        throw error;
      }
      console.log('Error creating rule:', error?.message);
      return { error };
    }
  },

  async updateRuleStatus(ruleId, status, userId) {
    try {
      const updates = {
        status
      };

      if (status === 'active') {
        updates.approved_by = userId;
      }

      const { data, error } = await supabase?.from('rule_master')?.update(updates)?.eq('id', ruleId)?.select()?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error updating rule status:', error?.message);
          throw error;
        }
        console.log('Error updating rule status:', error?.message);
        return { error };
      }

      return { data };
    } catch (error) {
      if (isSchemaError(error)) {
        throw error;
      }
      console.log('Error updating rule status:', error?.message);
      return { error };
    }
  },

  async deleteRule(ruleId) {
    try {
      // Delete versions first
      const { error: versionError } = await supabase?.from('rule_version')?.delete()?.eq('rule_id', ruleId);

      if (versionError) {
        if (isSchemaError(versionError)) {
          console.error('Schema error deleting rule versions:', versionError?.message);
          throw versionError;
        }
        console.log('Error deleting rule versions:', versionError?.message);
      }

      // Delete rule
      const { error } = await supabase?.from('rule_master')?.delete()?.eq('id', ruleId);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error deleting rule:', error?.message);
          throw error;
        }
        console.log('Error deleting rule:', error?.message);
        return { error };
      }

      return { success: true };
    } catch (error) {
      if (isSchemaError(error)) {
        throw error;
      }
      console.log('Error deleting rule:', error?.message);
      return { error };
    }
  }
};
