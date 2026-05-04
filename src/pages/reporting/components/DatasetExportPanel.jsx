import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { reportingService } from '../../../services/reportingService';

const DatasetExportPanel = ({ organizationId }) => {
  const [filters, setFilters] = useState({
    reportingYear: '',
    dateFrom: '',
    dateTo: ''
  });
  const [reportingYears, setReportingYears] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReportingYears = async () => {
      if (!organizationId) return;

      try {
        const years = await reportingService?.getReportingYears(organizationId);
        setReportingYears(years);
      } catch (err) {
        console.error('Error fetching reporting years:', err);
      }
    };

    fetchReportingYears();
  }, [organizationId]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLoadDatasets = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const data = await reportingService?.getExportableDatasets(organizationId, filters);
      setDatasets(data);
    } catch (err) {
      console.error('Error loading datasets:', err);
      alert('Failed to load datasets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (datasets?.length === 0) {
      alert('No datasets to export. Please load datasets first.');
      return;
    }

    try {
      setExporting(true);

      if (format === 'csv') {
        exportToCSV();
      } else if (format === 'excel') {
        alert('Excel export functionality would be implemented here using a library like xlsx');
      } else if (format === 'pdf') {
        alert('PDF export functionality would be implemented here using a library like jsPDF');
      }
    } catch (err) {
      console.error('Error exporting datasets:', err);
      alert('Failed to export datasets. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Account Number', 'Account Holder', 'Balance', 'Country', 'Tax ID', 'Reporting Year', 'Created At'];
    const rows = datasets?.map(d => [
      d?.account_number,
      d?.account_holder_name,
      d?.account_balance,
      d?.country_code,
      d?.tax_id,
      d?.reporting_year,
      new Date(d?.created_at)?.toLocaleDateString()
    ]);

    const csvContent = [
      headers?.join(','),
      ...rows?.map(row => row?.join(','))
    ]?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document?.createElement('a');
    const url = URL?.createObjectURL(blob);
    link?.setAttribute('href', url);
    link?.setAttribute('download', `fatca_datasets_${new Date()?.toISOString()?.split('T')?.[0]}.csv`);
    link.style.visibility = 'hidden';
    document?.body?.appendChild(link);
    link?.click();
    document?.body?.removeChild(link);
  };

  const yearOptions = reportingYears?.map(year => ({
    value: year?.year?.toString(),
    label: year?.year?.toString()
  }));

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="Download" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Export Datasets</h3>
          <p className="text-sm text-muted-foreground">Filter and export FATCA datasets in multiple formats</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          label="Reporting Year"
          placeholder="Select year"
          options={yearOptions}
          value={filters?.reportingYear}
          onChange={(value) => handleFilterChange('reportingYear', value)}
        />
        <Input
          label="Date From"
          type="date"
          value={filters?.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
        />
        <Input
          label="Date To"
          type="date"
          value={filters?.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
        />
      </div>

      {/* Load Button */}
      <div className="mb-6">
        <Button
          iconName="Search"
          onClick={handleLoadDatasets}
          loading={loading}
          fullWidth
        >
          Load Datasets
        </Button>
      </div>

      {/* Dataset Count */}
      {datasets?.length > 0 && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{datasets?.length}</span> datasets loaded and ready for export
          </p>
        </div>
      )}

      {/* Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          iconName="FileText"
          onClick={() => handleExport('csv')}
          disabled={datasets?.length === 0 || exporting}
          fullWidth
        >
          Export CSV
        </Button>
        <Button
          variant="outline"
          iconName="FileSpreadsheet"
          onClick={() => handleExport('excel')}
          disabled={datasets?.length === 0 || exporting}
          fullWidth
        >
          Export Excel
        </Button>
        <Button
          variant="outline"
          iconName="FileText"
          onClick={() => handleExport('pdf')}
          disabled={datasets?.length === 0 || exporting}
          fullWidth
        >
          Export PDF
        </Button>
      </div>
    </div>
  );
};

export default DatasetExportPanel;