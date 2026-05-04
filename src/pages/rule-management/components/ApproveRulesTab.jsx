import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { GridSkeleton } from '../../../components/ui/SkeletonLoader';
import ApprovalHistoryTimeline from './ApprovalHistoryTimeline';

const ApproveRulesTab = ({ 
  rules, 
  loading, 
  onApprove, 
  onReject, 
  currentUserId, 
  hasApprovePermission 
}) => {
  const [expandedRuleId, setExpandedRuleId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatConditions = (conditions) => {
    if (!conditions || conditions?.length === 0) return 'No conditions';
    if (conditions?.length === 1) {
      const c = conditions?.[0];
      return `${c?.fieldName || c?.field_name} ${c?.operator} ${c?.value}`;
    }
    return `${conditions?.length} conditions defined`;
  };

  const getSimulationSummary = (simulationResults) => {
    if (!simulationResults) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
          <Icon name="AlertCircle" size={12} className="mr-1" />
          Not Simulated
        </span>
      );
    }

    if (simulationResults?.success) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          <Icon name="CheckCircle" size={12} className="mr-1" />
          {simulationResults?.matched_count || 0}/{simulationResults?.total_count || 0} matched
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-600">
        <Icon name="XCircle" size={12} className="mr-1" />
        Failed
      </span>
    );
  };

  const canApproveRule = (rule) => {
    // Check if user has permission
    if (!hasApprovePermission) return false;
    
    // Check maker-checker: user cannot approve their own rule
    if (rule?.createdByUserId === currentUserId) return false;
    
    return true;
  };

  const toggleExpanded = (ruleId) => {
    setExpandedRuleId(expandedRuleId === ruleId ? null : ruleId);
  };

  if (loading) {
    return <GridSkeleton rows={5} columns={8} />;
  }

  if (!rules || rules?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="p-4 bg-green-100 rounded-full mb-4">
            <Icon name="CheckCircle" size={48} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Approvals</h3>
          <p className="text-muted-foreground">All rules have been reviewed and processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Icon name="CheckCircle" size={24} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Pending Approvals</h2>
            <p className="text-sm text-muted-foreground">Review and approve rules using maker-checker workflow</p>
          </div>
        </div>
      </div>
      {/* Rules Grid */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rule Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Regime
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Segment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Conditions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Simulation
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {rules?.map((rule) => {
                const canApprove = canApproveRule(rule);
                const isExpanded = expandedRuleId === rule?.id;
                
                return (
                  <React.Fragment key={rule?.id}>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpanded(rule?.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Icon 
                              name={isExpanded ? 'ChevronDown' : 'ChevronRight'} 
                              size={16} 
                            />
                          </button>
                          <div>
                            <div className="font-medium text-foreground">{rule?.ruleName}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {rule?.description?.substring(0, 60)}{rule?.description?.length > 60 ? '...' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {rule?.regimeType}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-foreground">
                          {rule?.businessSegments?.segmentName || rule?.segmentName || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-foreground">
                          {rule?.createdByUser?.full_name || rule?.creator?.full_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rule?.createdByUser?.email || ''}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-foreground">
                          {formatDate(rule?.submittedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-muted-foreground">
                          {formatConditions(rule?.conditions)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getSimulationSummary(rule?.simulationResults)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {canApprove ? (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                iconName="Check"
                                onClick={() => onApprove(rule)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="X"
                                onClick={() => onReject(rule)}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">
                              {!hasApprovePermission ? 'No permission' : 'Cannot approve own rule'}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="8" className="px-4 py-4 bg-muted/30">
                          <div className="space-y-4">
                            {/* Rule Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Rule Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rule Type:</span>
                                    <span className="text-foreground font-medium">{rule?.ruleType || 'Classification'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reporting Year:</span>
                                    <span className="text-foreground font-medium">{rule?.reportingYear}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Version:</span>
                                    <span className="text-foreground font-medium">v{rule?.versionNumber}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created On:</span>
                                    <span className="text-foreground font-medium">{formatDate(rule?.createdOn)}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Rule Conditions</h4>
                                {rule?.conditions && rule?.conditions?.length > 0 ? (
                                  <div className="space-y-2">
                                    {rule?.conditions?.map((condition, idx) => (
                                      <div key={idx} className="text-sm bg-card rounded p-2 border border-border">
                                        <span className="font-medium text-foreground">
                                          {condition?.fieldName || condition?.field_name}
                                        </span>
                                        <span className="text-muted-foreground mx-2">{condition?.operator}</span>
                                        <span className="text-foreground">{condition?.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No conditions defined</p>
                                )}
                              </div>
                            </div>

                            {/* Approval History */}
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-3">Approval History</h4>
                              <ApprovalHistoryTimeline rule={rule} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApproveRulesTab;