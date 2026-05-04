import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { GridSkeleton } from '../../../components/ui/SkeletonLoader';
import { Checkbox } from '../../../components/ui/Checkbox';

export default function RulesGrid({ rules, onEdit, onViewConditions, onApprove, onReject, onSubmitForApproval, onLock, onViewHistory, onSimulate, onRetire, onDelete, currentUserId, hasApprovePermission, hasSubmitPermission, hasRetirePermission, hasDeletePermission, loading, showRetired, onToggleShowRetired }) {
  // Diagnostic: log retire permission and rule approval statuses
  React.useEffect(() => {
    console.log('RulesGrid: hasRetirePermission =', hasRetirePermission);
    if (rules?.length > 0) {
      console.log('RulesGrid: Rule approval statuses:', rules?.map(r => ({ name: r?.ruleName, approvalStatus: r?.approvalStatus, isActive: r?.isActive })));
      const retirableRules = rules?.filter(r => r?.approvalStatus === 'approved' && r?.isActive !== false);
      console.log('RulesGrid: Rules eligible for retire (approvalStatus=approved, isActive!=false):', retirableRules?.length);
    }
  }, [rules, hasRetirePermission]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Approval' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
      locked: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Locked' }
    };

    const config = statusConfig?.[status] || statusConfig?.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getApprovalStatusBadge = (approvalStatus) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' }
    };

    const config = statusConfig?.[approvalStatus] || statusConfig?.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getSimulationBadge = (simulationResults) => {
    if (!simulationResults) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <Icon name="AlertCircle" size={12} className="mr-1" />
          Not Simulated
        </span>
      );
    }

    if (simulationResults?.success) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          <Icon name="CheckCircle" size={12} className="mr-1" />
          Simulated ({simulationResults?.matched_count}/{simulationResults?.total_count})
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600 border border-red-200">
        <Icon name="XCircle" size={12} className="mr-1" />
        Failed
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <GridSkeleton rows={6} columns={8} />;
  }

  if (!rules || rules?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Icon name="FileText" className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No Rules Found</h3>
        <p className="text-sm text-muted-foreground">Create your first rule to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Show Retired Rules Toggle */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-retired"
            checked={showRetired}
            onChange={(e) => onToggleShowRetired?.(e?.target?.checked)}
          />
          <label htmlFor="show-retired" className="text-sm font-medium text-foreground cursor-pointer">
            Show Retired Rules
          </label>
        </div>
        <div className="text-xs text-muted-foreground">
          {rules?.length} rule{rules?.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Rule Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Segment</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Year</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Version</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Approval Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Simulation</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Created By</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Approved By</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules?.map((rule) => {
              const isRetired = rule?.isActive === false;
              const canApprove = rule?.approvalStatus === 'pending_approval' && 
                                rule?.createdByUserId !== currentUserId && 
                                hasApprovePermission &&
                                !isRetired;
              const canReject = rule?.approvalStatus === 'pending_approval' && 
                               rule?.createdByUserId !== currentUserId && 
                               hasApprovePermission &&
                               !isRetired;
              const canSubmitForApproval = (rule?.approvalStatus === 'draft' || rule?.approvalStatus === 'rejected') && 
                                          hasSubmitPermission &&
                                          !isRetired;
              const canLock = rule?.status === 'approved' && !isRetired;
              const canEdit = (rule?.approvalStatus === 'draft' || rule?.approvalStatus === 'rejected') && !isRetired;
              const isLocked = rule?.status === 'locked';
              const canRetire = rule?.approvalStatus === 'approved' && hasRetirePermission && !isRetired;
              const canDelete = (rule?.approvalStatus === 'draft' || rule?.approvalStatus === 'rejected') && hasDeletePermission && !isRetired;

              return (
                <tr 
                  key={rule?.id} 
                  className={`border-b border-border hover:bg-muted/30 transition-all duration-200 hover:shadow-sm ${
                    isRetired ? 'bg-gray-100 opacity-70' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{rule?.ruleName}</div>
                        {rule?.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                            {rule?.description}
                          </div>
                        )}
                      </div>
                      {isRetired && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300">
                          <Icon name="Archive" size={12} className="mr-1" />
                          Retired
                        </span>
                      )}
                    </div>
                    {isRetired && rule?.retirementDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Retired on {formatDate(rule?.retirementDate)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">{rule?.segmentName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">{rule?.reportingYear}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onViewHistory(rule)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      v{rule?.versionNumber}
                      <Icon name="History" className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(rule?.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {getApprovalStatusBadge(rule?.approvalStatus)}
                      {rule?.approvalComments && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs" title={rule?.approvalComments}>
                          {rule?.approvalComments}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getSimulationBadge(rule?.simulationResults)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-muted-foreground">{rule?.createdByUser?.full_name || rule?.createdBy}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(rule?.createdOn)}</div>
                  </td>
                  <td className="py-3 px-4">
                    {rule?.approvedByUser?.full_name || rule?.approvedBy ? (
                      <>
                        <div className="text-sm text-muted-foreground">{rule?.approvedByUser?.full_name || rule?.approvedBy}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(rule?.approvedAtTimestamp || rule?.approvedOn)}</div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {!isRetired && canSubmitForApproval && (
                        <Button
                          variant="default"
                          size="sm"
                          iconName="Send"
                          onClick={() => onSubmitForApproval(rule)}
                          title="Submit for Approval"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Submit for Approval
                        </Button>
                      )}
                      {!isRetired && canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="Edit"
                          onClick={() => onEdit(rule)}
                          title="Edit Rule"
                        />
                      )}
                      {!isRetired && canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="Trash2"
                          onClick={() => onDelete?.(rule)}
                          title="Delete Rule"
                          className="text-red-500 hover:text-red-600"
                        />
                      )}
                      {!isLocked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="List"
                          onClick={() => onViewConditions(rule)}
                          title="View Conditions"
                        />
                      )}
                      {!isRetired && canApprove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="CheckCircle"
                          onClick={() => onApprove(rule)}
                          title="Approve Rule"
                          className="text-green-600 hover:text-green-700"
                        />
                      )}
                      {!isRetired && canReject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="XCircle"
                          onClick={() => onReject(rule)}
                          title="Reject Rule"
                          className="text-red-600 hover:text-red-700"
                        />
                      )}
                      {!isRetired && canLock && (
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="Lock"
                          onClick={() => onLock(rule)}
                          title="Lock Rule"
                        />
                      )}
                      {!isRetired && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Play"
                          onClick={() => onSimulate?.(rule)}
                        >
                          Simulate
                        </Button>
                      )}
                      {canRetire && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Archive"
                          onClick={() => onRetire?.(rule)}
                          title="Retire Rule"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Retire
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
  );
}
