import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';


import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import DatasetFilters from './components/DatasetFilters';
import DatasetSummary from './components/DatasetSummary';
import DatasetTable from './components/DatasetTable';
import UploadDatasetModal from './components/UploadDatasetModal';
import DatasetDetailsModal from './components/DatasetDetailsModal';
import CustomerPreviewModal from './components/CustomerPreviewModal';
import { datasetService } from '../../services/datasetService';
import { SkeletonTable } from '../../components/ui/SkeletonLoader';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { GridSkeleton } from '../../components/ui/SkeletonLoader';
import Icon from '../../components/AppIcon';
import { logActivity } from '../../services/activityService';





const DatasetManagement = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();

  const [viewMode, setViewMode] = useState('datasets'); // 'datasets' or 'customers'
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
    giinStatus: []
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reportingYears = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];

  useEffect(() => {
    if (!hasPermission('datasets.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (viewMode === 'datasets') {
          const fetchedDatasets = await datasetService?.getDatasets(user?.organizationId, filters);
          setDatasets(fetchedDatasets);
        } else {
          const fetchedCustomers = await datasetService?.getCustomerRecords(user?.organizationId, filters);
          setCustomers(fetchedCustomers);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.organizationId, filters?.reportingYear, filters?.searchTerm, filters?.customerType, filters?.regimeType, filters?.accountStatus, filters?.w9Status, filters?.w8FormType, filters?.recalcitrantStatus, filters?.usPersonIndicator, filters?.giinStatus, viewMode]);

  const getFilteredDatasets = () => {
    return datasets?.filter(dataset => {
      if (filters?.searchTerm && !dataset?.name?.toLowerCase()?.includes(filters?.searchTerm?.toLowerCase())) {
        return false;
      }
      if (filters?.status !== 'all' && dataset?.status !== filters?.status) {
        return false;
      }
      if (filters?.dateFrom) {
        const uploadDate = new Date(dataset.uploadDate);
        const fromDate = new Date(filters.dateFrom);
        fromDate?.setHours(0, 0, 0, 0);
        if (uploadDate < fromDate) return false;
      }
      if (filters?.dateTo) {
        const uploadDate = new Date(dataset.uploadDate);
        const toDate = new Date(filters.dateTo);
        toDate?.setHours(23, 59, 59, 999);
        if (uploadDate > toDate) return false;
      }
      return true;
    });
  };

  const filteredDatasets = getFilteredDatasets();

  const summary = viewMode === 'datasets' ? {
    totalDatasets: filteredDatasets?.length || 0,
    totalRecords: filteredDatasets?.reduce((sum, ds) => sum + (ds?.recordCount || 0), 0) || 0,
    validatedDatasets: filteredDatasets?.filter(ds => ds?.status === 'validated')?.length || 0,
    errorCount: filteredDatasets?.reduce((sum, ds) => sum + (ds?.errorRecords || 0), 0) || 0
  } : {
    totalCustomers: customers?.length || 0,
    individuals: customers?.filter(c => c?.customer_type === 'INDIVIDUAL')?.length || 0,
    entities: customers?.filter(c => c?.customer_type === 'ENTITY')?.length || 0,
    aboveThreshold: customers?.filter(c => c?.exceed_threshold === true)?.length || 0
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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
      giinStatus: []
    });
  };

  const handleUploadDataset = async (formData) => {
    try {
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log('Dataset uploaded:', formData);
          resolve();
        }, 2000);
      });
      await logActivity(
        user?.userId,
        user?.organizationId,
        'dataset_uploaded',
        'dataset_management',
        {
          datasetName: formData?.datasetName || null,
          reportingYear: formData?.reportingYear || filters?.reportingYear || null,
          regimeType: formData?.regimeType || null,
          fileName: formData?.file?.name || null,
          fileSize: formData?.file?.size || null,
          recordCount: formData?.recordCount || null
        }
      );
      toast?.success(`Dataset "${formData?.datasetName}" uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast?.error('Failed to upload dataset. Please try again.');
      throw error;
    }
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
    console.log('Downloading dataset:', dataset?.name);
  };

  const handleReprocess = (dataset) => {
    console.log('Reprocessing dataset:', dataset?.name);
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
                  <h1 className="typography-h2 mb-2">
                    Dataset Management
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {viewMode === 'datasets' ? 'Upload, validate, and manage FATCA compliance datasets' : 'View and manage customer records from unified regulatory view'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-xs font-medium text-blue-700">Organization:</span>
                      <span className="text-xs font-semibold text-blue-900">{user?.branding?.organizationName || 'ComplianceHub'}</span>
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

              <DatasetSummary summary={summary} viewMode={viewMode} />

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
                    <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                      <Icon name="alert-circle" className="w-12 h-12 text-error mx-auto mb-4" />
                      <p className="text-foreground font-medium">{error}</p>
                    </div>
                  ) : (
                    <div className="fade-in">
                      <DatasetTable
                        datasets={filteredDatasets}
                        onViewDetails={handleViewDetails}
                        onDownload={handleDownload}
                        onReprocess={handleReprocess}
                        loading={loading}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {viewMode === 'customers' && (
                    <>
                      {loading ? (
                        <GridSkeleton rows={8} columns={7} />
                      ) : (
                        <div className="bg-card rounded-lg border border-border overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Customer ID
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Type
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Account Balance
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Country
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Regime
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    W9 Status
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    W8 Form
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Recalcitrant
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    US Person
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    GIIN
                                  </th>
                                  <th className="px-4 py-3 text-left typography-caption text-muted-foreground uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-right typography-caption text-muted-foreground uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {customers?.map((customer) => (
                                  <tr key={customer?.customer_id} className="hover:bg-muted/30 transition-base">
                                    <td className="px-4 py-4 typography-label text-foreground">
                                      {customer?.customer_id}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-foreground">
                                      {customer?.customer_type === 'INDIVIDUAL'
                                        ? `${customer?.first_name || ''} ${customer?.last_name || ''}`?.trim()
                                        : customer?.entity_name}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                        customer?.customer_type === 'INDIVIDUAL' ?'bg-primary/10 text-primary' :'bg-accent/10 text-accent'
                                      }`}>
                                        {customer?.customer_type}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-foreground">
                                      ${customer?.net_account_balance?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-foreground">
                                      {customer?.country_of_residence}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                        customer?.regime_applicability === 'BOTH' ?'bg-warning/10 text-warning'
                                          : customer?.regime_applicability === 'FATCA' ?'bg-secondary/10 text-secondary' :'bg-success/10 text-success'
                                      }`}>
                                        {customer?.regime_applicability}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                        customer?.w9_form_status === 'Submitted' ?'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                                      }`}>
                                        {customer?.w9_form_status || 'Not Submitted'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-foreground">
                                      {customer?.w8_form_type || 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                      {customer?.recalcitrant_customer ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption bg-error/10 text-error">
                                          Yes
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption bg-success/10 text-success">
                                          No
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                      {customer?.us_person_indicator ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption bg-primary/10 text-primary">
                                          Yes
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption bg-muted text-muted-foreground">
                                          No
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-foreground">
                                      {customer?.giin || 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full typography-caption ${
                                        customer?.status === 'Active' ?'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                                      }`}>
                                        {customer?.status}
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
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
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