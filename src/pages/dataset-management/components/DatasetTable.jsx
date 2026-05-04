import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { GridSkeleton } from '../../../components/ui/SkeletonLoader';

const DatasetTable = ({ 
  datasets, 
  onViewDetails, 
  onDownload, 
  onReprocess,
  loading = false
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      validated: {
        label: 'Validated',
        className: 'bg-success/10 text-success border-success/20'
      },
      pending: {
        label: 'Pending',
        className: 'bg-warning/10 text-warning border-warning/20'
      },
      error: {
        label: 'Error',
        className: 'bg-error/10 text-error border-error/20'
      },
      processing: {
        label: 'Processing',
        className: 'bg-secondary/10 text-secondary border-secondary/20'
      }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {config?.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <GridSkeleton rows={5} columns={6} />;
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                Dataset Name
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                Upload Date
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                Record Count
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                Status
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                Validation Results
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {datasets?.map((dataset) => (
              <tr
                key={dataset?.id}
                className="hover:bg-muted/30 transition-all duration-200 hover:shadow-sm"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="FileSpreadsheet" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{dataset?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Year: {dataset?.reportingYear}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {formatDate(dataset?.uploadDate)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-foreground">
                    {dataset?.recordCount?.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(dataset?.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="CheckCircle" size={14} className="text-success" />
                      <span className="text-foreground">
                        {dataset?.validRecords?.toLocaleString()} valid
                      </span>
                    </div>
                    {dataset?.errorRecords > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="AlertCircle" size={14} className="text-error" />
                        <span className="text-error">
                          {dataset?.errorRecords?.toLocaleString()} errors
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(dataset)}
                      iconName="Eye"
                      iconPosition="left"
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(dataset)}
                      iconName="Download"
                      iconPosition="left"
                    >
                      Download
                    </Button>
                    {dataset?.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReprocess(dataset)}
                        iconName="RefreshCw"
                        iconPosition="left"
                      >
                        Reprocess
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {datasets?.map((dataset) => (
          <div key={dataset?.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="FileSpreadsheet" size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 truncate">
                  {dataset?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Year: {dataset?.reportingYear}
                </p>
              </div>
              {getStatusBadge(dataset?.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Upload Date</p>
                <p className="font-medium text-foreground">
                  {formatDate(dataset?.uploadDate)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Record Count</p>
                <p className="font-medium text-foreground">
                  {dataset?.recordCount?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-3 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Validation Results
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="CheckCircle" size={14} className="text-success" />
                  <span className="text-foreground">
                    {dataset?.validRecords?.toLocaleString()} valid records
                  </span>
                </div>
                {dataset?.errorRecords > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="AlertCircle" size={14} className="text-error" />
                    <span className="text-error">
                      {dataset?.errorRecords?.toLocaleString()} error records
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(dataset)}
                iconName="Eye"
                iconPosition="left"
                className="flex-1"
              >
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(dataset)}
                iconName="Download"
                iconPosition="left"
                className="flex-1"
              >
                Download
              </Button>
              {dataset?.status === 'error' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReprocess(dataset)}
                  iconName="RefreshCw"
                  iconPosition="left"
                  fullWidth
                >
                  Reprocess Dataset
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {datasets?.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Icon name="Database" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Datasets Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No datasets match your current filters. Try adjusting your search criteria or upload a new dataset.
          </p>
        </div>
      )}
    </div>
  );
};

export default DatasetTable;