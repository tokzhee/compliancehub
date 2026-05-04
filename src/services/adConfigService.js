import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const adConfigService = {
  async getAdConfigurations(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/ad-config', { params: { organizationId } });
        const data = response?.data || [];
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching AD configurations:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('ad_configurations')?.select('*')?.eq('organization_id', organizationId)?.order('created_at', { ascending: false });
      if (error) return [];
      return data?.map(config => ({
        id: config?.id, configName: config?.config_name, ldapHost: config?.ldap_host,
        ldapPort: config?.ldap_port, useSsl: config?.use_ssl, useTls: config?.use_tls,
        ldapServerUrl: config?.ldap_server_url, baseDn: config?.base_dn, bindDn: config?.bind_dn,
        bindPassword: config?.bind_password, userSearchBase: config?.user_search_base,
        userSearchFilter: config?.user_search_filter, groupSearchBase: config?.group_search_base,
        attrEmail: config?.attr_email, attrUsername: config?.attr_username, attrFullName: config?.attr_full_name,
        syncEnabled: config?.sync_enabled, syncFrequency: config?.sync_frequency,
        syncIntervalHours: config?.sync_interval_hours, connectionTimeoutSeconds: config?.connection_timeout_seconds,
        lastSyncAt: config?.last_sync_at ? new Date(config?.last_sync_at) : null,
        status: config?.status, organizationId: config?.organization_id,
        createdAt: new Date(config?.created_at), updatedAt: new Date(config?.updated_at)
      })) || [];
    } catch {
      return [];
    }
  },

  async getActiveAdConfigurations(organizationId) {
    if (useRestApi) {
      try {
        const response = await apiClient?.get('/api/ad-config/active', { params: { organizationId } });
        const data = response?.data || [];
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching active AD configurations:', error?.message);
        return [];
      }
    }
    try {
      const { data, error } = await supabase?.from('ad_configurations')?.select('*')?.eq('organization_id', organizationId)?.eq('status', 'active')?.order('config_name', { ascending: true });
      if (error) return [];
      return data?.map(config => ({
        id: config?.id, configName: config?.config_name, ldapServerUrl: config?.ldap_server_url,
        baseDn: config?.base_dn, bindDn: config?.bind_dn, bindPassword: config?.bind_password,
        userSearchBase: config?.user_search_base, userSearchFilter: config?.user_search_filter,
        groupSearchBase: config?.group_search_base
      })) || [];
    } catch {
      return [];
    }
  },

  async createAdConfiguration(configData) {
    if (useRestApi) {
      try {
        const payload = {
          configId: configData?.configId || null,
          organizationId: configData?.organizationId,
          name: configData?.configName,
          domain: configData?.ldapServerUrl || configData?.domain,
          tenantId: configData?.tenantId || null,
          clientId: configData?.clientId || null
        };
        const response = await apiClient?.post('/api/ad-config', payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error creating AD configuration:', error?.message);
        return { error };
      }
    }
    try {
      const { data, error } = await supabase?.from('ad_configurations')?.insert({
        organization_id: configData?.organizationId, config_name: configData?.configName,
        ldap_host: configData?.ldapHost, ldap_port: configData?.ldapPort,
        use_ssl: configData?.useSsl || false, use_tls: configData?.useTls || false,
        ldap_server_url: configData?.ldapServerUrl, base_dn: configData?.baseDn,
        bind_dn: configData?.bindDn, bind_password: configData?.bindPassword,
        user_search_base: configData?.userSearchBase, user_search_filter: configData?.userSearchFilter || '(uid={{username}})',
        group_search_base: configData?.groupSearchBase || null, attr_email: configData?.attrEmail || 'mail',
        attr_username: configData?.attrUsername || 'uid', attr_full_name: configData?.attrFullName || 'cn',
        sync_enabled: configData?.syncEnabled || false, sync_frequency: configData?.syncFrequency || 'manual',
        sync_interval_hours: configData?.syncIntervalHours || 24,
        connection_timeout_seconds: configData?.connectionTimeoutSeconds || 30, status: configData?.status || 'active'
      })?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async updateAdConfiguration(configId, updates) {
    if (useRestApi) {
      try {
        const payload = {
          configId,
          name: updates?.configName,
          domain: updates?.ldapServerUrl || updates?.domain,
          tenantId: updates?.tenantId,
          clientId: updates?.clientId,
          isActive: updates?.status === 'active'
        };
        const response = await apiClient?.put(`/api/ad-config/${configId}`, payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error updating AD configuration:', error?.message);
        return { error };
      }
    }
    try {
      const updateData = {};
      if (updates?.configName !== undefined) updateData.config_name = updates?.configName;
      if (updates?.ldapHost !== undefined) updateData.ldap_host = updates?.ldapHost;
      if (updates?.ldapPort !== undefined) updateData.ldap_port = updates?.ldapPort;
      if (updates?.useSsl !== undefined) updateData.use_ssl = updates?.useSsl;
      if (updates?.useTls !== undefined) updateData.use_tls = updates?.useTls;
      if (updates?.ldapServerUrl !== undefined) updateData.ldap_server_url = updates?.ldapServerUrl;
      if (updates?.baseDn !== undefined) updateData.base_dn = updates?.baseDn;
      if (updates?.bindDn !== undefined) updateData.bind_dn = updates?.bindDn;
      if (updates?.bindPassword !== undefined) updateData.bind_password = updates?.bindPassword;
      if (updates?.userSearchBase !== undefined) updateData.user_search_base = updates?.userSearchBase;
      if (updates?.userSearchFilter !== undefined) updateData.user_search_filter = updates?.userSearchFilter;
      if (updates?.groupSearchBase !== undefined) updateData.group_search_base = updates?.groupSearchBase;
      if (updates?.attrEmail !== undefined) updateData.attr_email = updates?.attrEmail;
      if (updates?.attrUsername !== undefined) updateData.attr_username = updates?.attrUsername;
      if (updates?.attrFullName !== undefined) updateData.attr_full_name = updates?.attrFullName;
      if (updates?.syncEnabled !== undefined) updateData.sync_enabled = updates?.syncEnabled;
      if (updates?.syncFrequency !== undefined) updateData.sync_frequency = updates?.syncFrequency;
      if (updates?.syncIntervalHours !== undefined) updateData.sync_interval_hours = updates?.syncIntervalHours;
      if (updates?.connectionTimeoutSeconds !== undefined) updateData.connection_timeout_seconds = updates?.connectionTimeoutSeconds;
      if (updates?.status !== undefined) updateData.status = updates?.status;
      const { data, error } = await supabase?.from('ad_configurations')?.update(updateData)?.eq('id', configId)?.select()?.single();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async deleteAdConfiguration(configId) {
    if (useRestApi) {
      try {
        await apiClient?.delete(`/api/ad-config/${configId}`, { params: { configId } });
        return { error: null };
      } catch (error) {
        console.error('Error deleting AD configuration:', error?.message);
        return { error };
      }
    }
    try {
      const { error } = await supabase?.from('ad_configurations')?.delete()?.eq('id', configId);
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};