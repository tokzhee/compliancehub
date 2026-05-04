import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DatasetDetailsModal = ({ isOpen, onClose, dataset }) => {
  if (!isOpen || !dataset) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const detailSections = [
    {
      title: 'Dataset Information',
      icon: 'FileText',
      items: [
        { label: 'Dataset Name', value: dataset?.name },
        { label: 'Reporting Year', value: dataset?.reportingYear },
        { label: 'Upload Date', value: formatDate(dataset?.uploadDate) },
        { label: 'File Size', value: dataset?.fileSize },
        { label: 'File Format', value: dataset?.fileFormat }
      ]
    },
    {
      title: 'Record Statistics',
      icon: 'BarChart3',
      items: [
        { label: 'Total Records', value: dataset?.recordCount?.toLocaleString() },
        { label: 'Valid Records', value: dataset?.validRecords?.toLocaleString() },
        { label: 'Error Records', value: dataset?.errorRecords?.toLocaleString() },
        { label: 'Validation Rate', value: `${((dataset?.validRecords / dataset?.recordCount) * 100)?.toFixed(2)}%` }
      ]
    },
    {
      title: 'Processing History',
      icon: 'Clock',
      items: [
        { label: 'Processing Started', value: formatDate(dataset?.processingStarted) },
        { label: 'Processing Completed', value: formatDate(dataset?.processingCompleted) },
        { label: 'Processing Duration', value: dataset?.processingDuration },
        { label: 'Last Modified', value: formatDate(dataset?.lastModified) }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Dataset Details</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              Complete information about this dataset
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-all"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {detailSections?.map((section, index) => (
            <div key={index} className="bg-muted/30 rounded-lg p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name={section?.icon} size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {section?.title}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section?.items?.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item?.label}
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {item?.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {dataset?.errorRecords > 0 && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 md:p-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-error mb-2">
                    Validation Errors Detected
                  </h3>
                  <p className="text-sm text-foreground mb-3">
                    {dataset?.errorRecords?.toLocaleString()} records failed validation. Common issues include:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                    <li>Missing required fields (TIN, Account Number)</li>
                    <li>Invalid date formats</li>
                    <li>Incorrect data types</li>
                    <li>Duplicate records</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-success/10 border border-success/20 rounded-lg p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-success mb-2">
                  Audit Trail
                </h3>
                <p className="text-sm text-foreground">
                  All dataset operations are logged in the system audit trail. Upload, validation, and processing activities are tracked with timestamps and user information for compliance purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-border sticky bottom-0 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
            className="sm:flex-1"
          >
            Close
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            fullWidth
            className="sm:flex-1"
          >
            Download Dataset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetailsModal;