import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubmissionsGrid = ({ submissions, onViewDetails, onDownloadResponse, onResubmit, onApprove, onReject, onSubmitForApproval, currentUserId, hasApprovePermission, hasSubmitPermission }) => {
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

  const getApprovalStatusBadge = (approvalStatus) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig?.[approvalStatus] || statusConfig?.draft;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getSchemaIcon = (schemaType) => {
    return schemaType === 'IRS' ? 'Flag' : 'Globe';
  };

  if (!submissions || submissions?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="FileText" className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">No submissions found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Regime
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Response
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions?.map((submission) => {
                const canApprove = submission?.approval_status === 'pending_approval' && 
                                  submission?.created_by_user_id !== currentUserId && 
                                  hasApprovePermission;
                const canReject = submission?.approval_status === 'pending_approval' && 
                                 submission?.created_by_user_id !== currentUserId && 
                                 hasApprovePermission;
                const canSubmitForApproval = (submission?.approval_status === 'draft' || submission?.approval_status === 'rejected') && 
                                            hasSubmitPermission;

                return (
                <tr key={submission?.id} className="hover:bg-muted/30 transition-all duration-200 hover:shadow-sm">
                  <td className="px-4 py-4 text-sm text-foreground">
                    {new Date(submission?.submitted_on)?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={getSchemaIcon(submission?.fatca_crs_generated_files?.xml_schema_type)} 
                        className="w-4 h-4 text-primary" 
                      />
                      <span className="text-sm font-medium text-foreground">
                        {submission?.fatca_crs_report_batch?.regime_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({submission?.fatca_crs_generated_files?.xml_schema_type})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {submission?.fatca_crs_generated_files?.file_name || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {submission?.fatca_crs_report_batch?.report_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission?.response_status)}`}>
                      {submission?.response_status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {getApprovalStatusBadge(submission?.approval_status)}
                      {submission?.approval_comments && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs" title={submission?.approval_comments}>
                          {submission?.approval_comments}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {submission?.submission_channel || 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    {submission?.response_message ? (
                      <div className="text-sm text-foreground max-w-xs truncate" title={submission?.response_message}>
                        {submission?.response_message}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No response</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canSubmitForApproval && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSubmitForApproval(submission)}
                        >
                          <Icon name="Send" className="w-4 h-4 mr-1" />
                          Submit
                        </Button>
                      )}
                      {canApprove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove(submission)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Icon name="CheckCircle" className="w-4 h-4" />
                        </Button>
                      )}
                      {canReject && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReject(submission)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Icon name="XCircle" className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(submission)}
                      >
                        <Icon name="Eye" className="w-4 h-4" />
                      </Button>
                      {submission?.acknowledgment_file && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadResponse(submission)}
                        >
                          <Icon name="Download" className="w-4 h-4" />
                        </Button>
                      )}
                      {(submission?.response_status === 'Error' || submission?.response_status === 'Rejected') && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onResubmit(submission)}
                        >
                          <Icon name="RefreshCw" className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {submissions?.map((submission) => {
          const canApprove = submission?.approval_status === 'pending_approval' && 
                            submission?.created_by_user_id !== currentUserId && 
                            hasApprovePermission;
          const canReject = submission?.approval_status === 'pending_approval' && 
                           submission?.created_by_user_id !== currentUserId && 
                           hasApprovePermission;
          const canSubmitForApproval = (submission?.approval_status === 'draft' || submission?.approval_status === 'rejected') && 
                                      hasSubmitPermission;

          return (
          <div key={submission?.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon 
                    name={getSchemaIcon(submission?.fatca_crs_generated_files?.xml_schema_type)} 
                    className="w-4 h-4 text-primary" 
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {submission?.fatca_crs_report_batch?.regime_type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {submission?.fatca_crs_generated_files?.file_name || 'N/A'}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission?.response_status)}`}>
                {submission?.response_status}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Approval Status</span>
                {getApprovalStatusBadge(submission?.approval_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Submitted</span>
                <span className="text-xs font-medium text-foreground">
                  {new Date(submission?.submitted_on)?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Channel</span>
                <span className="text-xs font-medium text-foreground">
                  {submission?.submission_channel || 'N/A'}
                </span>
              </div>
            </div>

            {submission?.response_message && (
              <div className="bg-muted/30 rounded-lg p-2 mb-3">
                <p className="text-xs text-foreground">{submission?.response_message}</p>
              </div>
            )}

            <div className="flex gap-2">
              {canSubmitForApproval && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSubmitForApproval(submission)}
                  className="flex-1"
                >
                  <Icon name="Send" className="w-4 h-4 mr-1" />
                  Submit
                </Button>
              )}
              {canApprove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApprove(submission)}
                  className="flex-1 text-green-600"
                >
                  <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              )}
              {canReject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject(submission)}
                  className="flex-1 text-red-600"
                >
                  <Icon name="XCircle" className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(submission)}
                className="flex-1"
              >
                <Icon name="Eye" className="w-4 h-4 mr-1" />
                Details
              </Button>
              {submission?.acknowledgment_file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadResponse(submission)}
                  className="flex-1"
                >
                  <Icon name="Download" className="w-4 h-4 mr-1" />
                  Download
                </Button>
              )}
              {(submission?.response_status === 'Error' || submission?.response_status === 'Rejected') && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onResubmit(submission)}
                  className="flex-1"
                >
                  <Icon name="RefreshCw" className="w-4 h-4 mr-1" />
                  Resubmit
                </Button>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionsGrid;