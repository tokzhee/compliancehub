import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubmissionDetailsModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Acknowledged':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'Submitted':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
      case 'Pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 'Error': case'Rejected':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Submission Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {submission?.fatca_crs_report_batch?.report_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Submission Status</h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission?.response_status)}`}>
                  {submission?.response_status}
                </span>
              </div>
              {submission?.response_message && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Response Message</p>
                  <p className="text-sm text-foreground">{submission?.response_message}</p>
                </div>
              )}
            </div>
          </div>

          {/* File Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">File Information</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">File Name</span>
                <span className="text-sm font-medium text-foreground">
                  {submission?.fatca_crs_generated_files?.file_name || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">XML Schema</span>
                <span className="text-sm font-medium text-foreground">
                  {submission?.fatca_crs_generated_files?.xml_schema_type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">File Size</span>
                <span className="text-sm font-medium text-foreground">
                  {submission?.fatca_crs_generated_files?.file_size_bytes 
                    ? `${(submission?.fatca_crs_generated_files?.file_size_bytes / 1024)?.toFixed(2)} KB`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Regime Type</span>
                <span className="text-sm font-medium text-foreground">
                  {submission?.fatca_crs_report_batch?.regime_type}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Submission Details</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submission Channel</span>
                <span className="text-sm font-medium text-foreground">
                  {submission?.submission_channel || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submission Method</span>
                <span className="text-sm font-medium text-foreground">
                  {submission?.submission_method || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submitted On</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(submission?.submitted_on)?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submitted By</span>
                <span className="text-sm font-medium text-foreground">
                  {submission?.user_profiles?.full_name || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Details (if any) */}
          {submission?.error_details && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Error Details</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono">
                  {JSON.stringify(submission?.error_details, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Acknowledgment File */}
          {submission?.acknowledgment_file && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Acknowledgment</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Acknowledgment file received and available for download
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailsModal;