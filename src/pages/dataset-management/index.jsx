import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import DatasetFilters from './components/DatasetFilters';
import DatasetSummary from './components/DatasetSummary';
import DatasetTable from './components/DatasetTable';
import UploadDatasetModal from './components/UploadDatasetModal';
import DatasetDetailsModal from './components/DatasetDetailsModal';
import CustomerPreviewModal from './components/CustomerPreviewModal';
import { datasetService } from '../../services/datasetService';
import { SkeletonTable, GridSkeleton } from '../../components/ui/SkeletonLoader';
import AccessRestricted from '../../components/ui/AccessRestricted';
import Icon from '../../components/AppIcon';
import { logActivity } from '../../services/activityService';

const DatasetManagement = () => {
  const navigate = useNavigate();
  const { isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();
  const toast = useToast();

  const [viewMode, setViewMode] = useState('datasets');
  const [filters, setFilters] = useState({
    reportingYear: '2026',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
    customerType: 'all',
    regimeType: 'all',
    accountStatus: 'all',
    w9Status: [],
    w8FormType: [],
    recalcitrantStatus: [],
    usPersonIndicator: [],
    giinStatus: [],
    page: 1,
    pageSize: 20,
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const reportingYears = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
  ];

  useEffect(() => {
    if (!hasPermission('datasets.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  // Fetch summary metrics from backend
  const fetchSummary = useCallback(async () => {
    if (!user?.organizationId) return;
    setSummaryLoading(true);
    try {
      const data = await datasetService?.getSummary(
        user?.organizationId,
        filters?.reportingYear
      );
      if (data) {
        setSummary(data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [user?.organizationId, filters?.reportingYear]);

  // Fetch datasets or customers — all filtering is server-side
  const fetchData = useCallback(async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      if (viewMode === 'datasets') {
        const result = await datasetService?.getDatasets(user?.organizationId, filters);
        const items = Array.isArray(result) ? result : result?.items || result?.data || [];
        setDatasets(items);
        setTotalCount(result?.totalCount || items?.length);
      } else {
        const result = await datasetService?.getCustomerRecords(user?.organizationId, filters);
        const items = Array.isArray(result) ? result : result?.items || result?.data || [];
        setCustomers(items);
        setTotalCount(result?.totalCount || items?.length);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId, filters, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      reportingYear: '2026',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
      customerType: 'all',
      regimeType: 'all',
      accountStatus: 'all',
      w9Status: [],
      w8FormType: [],
      recalcitrantStatus: [],
      usPersonIndicator: [],
      giinStatus: [],
      page: 1,
      pageSize: 20,
    });
  };

  const handleUploadDataset = async (formData) => {
    const { data, error: uploadError } = await datasetService?.uploadDataset(
      user?.organizationId,
      user?.userId,
      {
        batchName: formData?.datasetName,
        reportingYear: formData?.reportingYear,
        records: formData?.records || [],
        giinConfigId: formData?.giinConfigId || null,
      }
    );

    if (uploadError) {
      const message =
        uploadError?.response?.data?.message ||
        uploadError?.message ||
        'Failed to upload dataset. Please try again.';
      throw new Error(message);
    }

    await logActivity(
      user?.userId,
      user?.organizationId,
      'dataset_uploaded',
      'dataset_management',
      {
        datasetName: formData?.datasetName || null,
        reportingYear: formData?.reportingYear || filters?.reportingYear || null,
        fileName: formData?.file?.name || null,
        fileSize: formData?.file?.size || null,
      }
    );

    // Refresh data after upload
    await fetchData();
    await fetchSummary();
  };

  const handleDeleteDataset = async (dataset) => {
    const { error: deleteError } = await datasetService?.deleteDataset(
      dataset?.batchId || dataset?.id,
      user?.organizationId,
      user?.userId
    );
    if (deleteError) {
      toast?.error?.('Failed to delete dataset. Please try again.');
      return;
    }
    toast?.success?.('Dataset deleted successfully');
    await fetchData();
    await fetchSummary();
  };

  const handleViewDetails = (dataset) => {
    setSelectedDataset(dataset);
    setIsDetailsModalOpen(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerPreviewOpen(true);
  };

  const handleDownload = (dataset) => {
    console.log('Downloading dataset:', dataset?.batchName || dataset?.name);
  };

  const handleReprocess = (dataset) => {
    console.log('Reprocessing dataset:', dataset?.batchName || dataset?.name);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Derive summary values from API response or fallback to computed
  const summaryData = summary
    ? {
        // Datasets view
        totalDatasets: summary?.totalDatasets ?? datasets?.length ?? 0,
        totalRecords: summary?.totalRecords ?? 0,
        validatedDatasets: summary?.validatedDatasets ?? summary?.validRecords ?? 0,
        errorCount: summary?.errorCount ?? summary?.errorRecords ?? 0,
        // Customers view
        totalCustomers: summary?.totalCustomers ?? customers?.length ?? 0,
        individuals: summary?.individuals ?? 0,
        entities: summary?.entities ?? 0,
        aboveThreshold: summary?.aboveThreshold ?? 0,
      }
    : {
        totalDatasets: datasets?.length ?? 0,
        totalRecords: datasets?.reduce((s, d) => s + (d?.recordCount || 0), 0),
        validatedDatasets: datasets?.filter(d => d?.status === 'validated')?.length ?? 0,
        errorCount: datasets?.reduce((s, d) => s + (d?.errorRecords || 0), 0),
        totalCustomers: customers?.length ?? 0,
        individuals: customers?.filter(c => c?.customerType === 'INDIVIDUAL' || c?.customer_type === 'INDIVIDUAL')?.length ?? 0,
        entities: customers?.filter(c => c?.customerType === 'ENTITY' || c?.customer_type === 'ENTITY')?.length ?? 0,
        aboveThreshold: customers?.filter(c => c?.exceedThreshold || c?.exceed_threshold)?.length ?? 0,
      };

  return (
    <>
      <Helmet>
        <title>Dataset Management - {user?.branding?.organizationName || 'ComplianceHub'}</title>
        <meta name="description" content="Manage FATCA datasets with comprehensive filtering and validation capabilities" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <SidebarNavigation />

        <main
          className={`transition-all duration-250 ease-out ${
            isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          <div className="p-4 md:p-6 lg:p-8">
            <Breadcrumb />
            <div className="max-w-[1600px] mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h1 className="typography-h2 mb-2">Dataset Management</h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {viewMode === 'datasets' ?'Upload, validate, and manage FATCA compliance datasets' :'View and manage customer records from unified regulatory view'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-xs font-medium text-blue-700">Organization:</span>
                      <span className="text-xs font-semibold text-blue-900">
                        {user?.branding?.organizationName || 'ComplianceHub'}
                      </span>
                    </div>
                    {user?.roleName && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                        <span className="text-xs font-medium text-purple-700">Role:</span>
                        <span className="text-xs font-semibold text-purple-900">{user?.roleName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('customers')}
                      className={`px-4 py-2 rounded-md typography-label transition-base ${
                        viewMode === 'customers' ?'bg-primary text-primary-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Customers
                    </button>
                    <button
                      onClick={() => setViewMode('datasets')}
                      className={`px-4 py-2 rounded-md typography-label transition-base ${
                        viewMode === 'datasets' ?'bg-primary text-primary-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Datasets
                    </button>
                  </div>
                  {viewMode === 'datasets' && (
                    <Button
                      variant="default"
                      onClick={() => setIsUploadModalOpen(true)}
                      iconName="Upload"
                      iconPosition="left"
                      className="sm:w-auto"
                      disabled={!hasPermission('datasets.create')}
                    >
                      Upload Dataset
                    </Button>
                  )}
                </div>
              </div>

              <DatasetSummary summary={summaryData} viewMode={viewMode} loading={summaryLoading} />

              <DatasetFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                reportingYears={reportingYears}
                viewMode={viewMode}
              />

              {viewMode === 'datasets' ? (
                <>
                  {!hasPermission('datasets.view') ? (
                    <AccessRestricted message="You don't have permission to view datasets" />
                  ) : loading ? (
                    <SkeletonTable rows={8} columns={6} />
                  ) : error ? (
                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                      <Icon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-4">{error}</p>
                      <Button variant="outline" onClick={fetchData} iconName="RefreshCw" iconPosition="left">
                        Retry
                      </Button>
                    </div>
                  ) : datasets?.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <Icon name="Database" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">No datasets found</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Upload a dataset to get started or adjust your filters.
                      </p>
                      {hasPermission('datasets.create') && (
                        <Button
                          variant="default"
                          onClick={() => setIsUploadModalOpen(true)}
                          iconName="Upload"
                          iconPosition="left"
                        >
                          Upload Dataset
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="fade-in">
                      <DatasetTable
                        datasets={datasets}
                        onViewDetails={handleViewDetails}
                        onDownload={handleDownload}
                        onReprocess={handleReprocess}
                        onDelete={handleDeleteDataset}
                        loading={loading}
                        canDelete={hasPermission('datasets.delete')}
                      />
                      {/* Server-side pagination */}
                      {totalCount > filters?.pageSize && (
                        <div className="flex items-center justify-between mt-4 px-2">
                          <p className="text-sm text-muted-foreground">
                            Showing {((filters?.page - 1) * filters?.pageSize) + 1}–
                            {Math.min(filters?.page * filters?.pageSize, totalCount)} of {totalCount}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={filters?.page <= 1}
                              onClick={() => handlePageChange(filters?.page - 1)}
                              iconName="ChevronLeft"
                              iconPosition="left"
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={filters?.page * filters?.pageSize >= totalCount}
                              onClick={() => handlePageChange(filters?.page + 1)}
                              iconName="ChevronRight"
                              iconPosition="right"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {loading ? (
                    <GridSkeleton rows={8} columns={7} />
                  ) : error ? (
                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                      <Icon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-4">{error}</p>
                      <Button variant="outline" onClick={fetchData} iconName="RefreshCw" iconPosition="left">
                        Retry
                      </Button>
                    </div>
                  ) : customers?.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">No customers found</p>
                      <p className="text-sm text-muted-foreground">
                        Adjust your filters or upload a dataset to populate customer records.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50 border-b border-border">
                            <tr>
                              {['Customer ID', 'Name', 'Type', 'Account Balance', 'Country', 'Regime',
                                'W9 Status', 'W8 Form', 'Recalcitrant', 'US Person', 'GIIN', 'Status', 'Actions'
                              ]?.map((h) => (
                                <th key={h} className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {customers?.map((customer, idx) => {
                              // Support both nested DTO and flat column shapes
                              const customerId = customer?.customerId || customer?.customer_id;
                              const customerType = customer?.customerType || customer?.customer_type;
                              const accountBalance = customer?.accountBalance ?? customer?.net_account_balance ?? 0;
                              const currencyCode = customer?.currencyCode || customer?.currency_code || 'USD';
                              const status = customer?.status;
                              const regimeApplicability = customer?.regimeApplicability || customer?.regime_applicability;
                              const accountNumber = customer?.accountNumber || customer?.account_number;

                              // Name resolution: nested DTO or flat columns
                              const personal = customer?.personalDetails;
                              const entity = customer?.entityDetails;
                              const contact = customer?.contactDetails;
                              const regulatory = customer?.regulatoryDetails;

                              const displayName = customerType === 'INDIVIDUAL'
                                ? (personal
                                    ? `${personal?.firstName || ''} ${personal?.lastName || ''}`?.trim()
                                    : `${customer?.first_name || ''} ${customer?.last_name || ''}`?.trim())
                                : (entity?.entityName || customer?.entity_name || 'N/A');

                              const country = contact?.countryOfResidence || customer?.country_of_residence;
                              const w9Status = regulatory?.w9FormStatus || customer?.w9_form_status;
                              const w8FormType = regulatory?.w8FormType || customer?.w8_form_type;
                              const recalcitrant = regulatory?.recalcitrantCustomer ?? customer?.recalcitrant_customer;
                              const usPerson = regulatory?.usPersonIndicator ?? customer?.us_person_indicator;
                              const giin = entity?.giin || customer?.giin;

                              return (
                                <tr key={customerId || idx} className="hover:bg-muted/30 transition-base">
                                  <td className="px-4 py-4 typography-label text-foreground">{customerId}</td>
                                  <td className="px-4 py-4 text-sm text-foreground">{displayName || 'N/A'}</td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                      customerType === 'INDIVIDUAL' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                                    }`}>
                                      {customerType || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-foreground">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })?.format(accountBalance)}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-foreground">{country || 'N/A'}</td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                      regimeApplicability === 'BOTH' ? 'bg-warning/10 text-warning'
                                        : regimeApplicability === 'FATCA'? 'bg-secondary/10 text-secondary' :'bg-success/10 text-success'
                                    }`}>
                                      {regimeApplicability || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                      w9Status === 'Submitted' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                    }`}>
                                      {w9Status || 'Not Submitted'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-foreground">{w8FormType || 'N/A'}</td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                      recalcitrant ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                                    }`}>
                                      {recalcitrant ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                      usPerson ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                      {usPerson ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-foreground">{giin || 'N/A'}</td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                      status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                    }`}>
                                      {status || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewCustomer(customer)}
                                      iconName="Eye"
                                      iconPosition="left"
                                    >
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {/* Server-side pagination for customers */}
                      {totalCount > filters?.pageSize && (
                        <div className="flex items-center justify-between p-4 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            Showing {((filters?.page - 1) * filters?.pageSize) + 1}–
                            {Math.min(filters?.page * filters?.pageSize, totalCount)} of {totalCount}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={filters?.page <= 1}
                              onClick={() => handlePageChange(filters?.page - 1)}
                              iconName="ChevronLeft"
                              iconPosition="left"
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={filters?.page * filters?.pageSize >= totalCount}
                              onClick={() => handlePageChange(filters?.page + 1)}
                              iconName="ChevronRight"
                              iconPosition="right"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        <UploadDatasetModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadDataset}
          reportingYears={reportingYears}
          organizationId={user?.organizationId}
          uploadedBy={user?.userId}
        />

        <DatasetDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          dataset={selectedDataset}
        />

        <CustomerPreviewModal
          isOpen={isCustomerPreviewOpen}
          onClose={() => setIsCustomerPreviewOpen(false)}
          customer={selectedCustomer}
        />
      </div>
    </>
  );
};

export default DatasetManagement;