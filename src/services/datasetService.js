import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

export const datasetService = {
  async getDatasets(organizationId, filters = {}) {
    if (useRestApi) {
      try {
        const params = { organizationId };
        if (filters?.reportingYear && filters?.reportingYear !== 'all') params.reportingYear = filters?.reportingYear;
        if (filters?.searchTerm) params.searchTerm = filters?.searchTerm;

        const response = await apiClient?.get('/api/datasets', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching datasets:', error?.message);
        return [];
      }
    }
    // Supabase fallback
    try {
      let query = supabase?.from('fatca_dataset')?.select(`
        id, reporting_year, account_number, account_holder_name, account_balance,
        country_code, tax_id, account_data, created_at, updated_at, uploaded_by,
        user_profiles!fatca_dataset_uploaded_by_fkey(full_name)
      `)?.eq('organization_id', organizationId);
      if (filters?.reportingYear && filters?.reportingYear !== 'all') {
        query = query?.eq('reporting_year', parseInt(filters?.reportingYear));
      }
      if (filters?.searchTerm) {
        query = query?.or(`account_number.ilike.%${filters?.searchTerm}%,account_holder_name.ilike.%${filters?.searchTerm}%`);
      }
      const { data, error } = await query?.order('created_at', { ascending: false });
      if (error) return [];
      const groupedData = {};
      (data || [])?.forEach(record => {
        const uploadDate = new Date(record.created_at)?.toISOString()?.split('T')?.[0];
        const key = `${record?.reporting_year}-${uploadDate}`;
        if (!groupedData?.[key]) {
          groupedData[key] = {
            id: `ds_${key}`, name: `FATCA Dataset ${record?.reporting_year} - ${uploadDate}`,
            reportingYear: record?.reporting_year?.toString(), uploadDate: record?.created_at,
            recordCount: 0, validRecords: 0, errorRecords: 0, status: 'validated',
            fileSize: 'N/A', fileFormat: 'CSV', uploadedBy: record?.user_profiles?.full_name || 'Unknown'
          };
        }
        groupedData[key].recordCount++;
        groupedData[key].validRecords++;
      });
      return Object.values(groupedData);
    } catch {
      return [];
    }
  },

  async getCustomerRecords(organizationId, filters = {}) {
    if (useRestApi) {
      try {
        const params = { organizationId };
        if (filters?.reportingYear && filters?.reportingYear !== 'all') params.reportingYear = filters?.reportingYear;
        if (filters?.customerType && filters?.customerType !== 'all') params.customerType = filters?.customerType;
        if (filters?.regimeType && filters?.regimeType !== 'all') params.regimeType = filters?.regimeType;
        if (filters?.searchTerm) params.searchTerm = filters?.searchTerm;
        if (filters?.page) params.page = filters?.page;
        if (filters?.pageSize) params.pageSize = filters?.pageSize;

        const response = await apiClient?.get('/api/datasets/customers', { params });
        return response?.data || [];
      } catch (error) {
        console.error('Error fetching customer records:', error?.message);
        return [];
      }
    }
    return [];
  },

  async uploadDataset(organizationId, uploadedBy, datasetData) {
    if (useRestApi) {
      try {
        const payload = {
          batchId: datasetData?.batchId || null,
          organizationId,
          giinConfigId: datasetData?.giinConfigId || null,
          reportingYear: datasetData?.reportingYear,
          batchName: datasetData?.batchName || `Upload ${new Date()?.toISOString()}`,
          uploadedBy,
          records: typeof datasetData?.records === 'string'
            ? datasetData?.records
            : JSON.stringify(datasetData?.records || [])
        };
        const response = await apiClient?.post('/api/datasets/upload', payload);
        return { data: response?.data };
      } catch (error) {
        console.error('Error uploading dataset:', error?.message);
        return { error };
      }
    }
    try {
      const records = datasetData?.records?.map(record => ({
        organization_id: organizationId,
        reporting_year: datasetData?.reportingYear,
        account_number: record?.accountNumber,
        account_holder_name: record?.accountHolderName,
        account_balance: record?.accountBalance,
        country_code: record?.countryCode,
        tax_id: record?.taxId,
        account_data: record?.additionalData || {},
        uploaded_by: uploadedBy
      }));
      const { data, error } = await supabase?.from('fatca_dataset')?.insert(records)?.select();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async deleteDataset(batchId, organizationId, deletedBy) {
    if (useRestApi) {
      try {
        const response = await apiClient?.delete(`/api/datasets/${batchId}`, {
          params: { batchId, organizationId, deletedBy }
        });
        return { data: response?.data };
      } catch (error) {
        console.error('Error deleting dataset:', error?.message);
        return { error };
      }
    }
    try {
      const { error } = await supabase?.from('fatca_dataset')?.delete()?.eq('id', batchId);
      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  }
};
