import React from 'react';
import Icon from '../../../components/AppIcon';

const ApprovalHistoryTimeline = ({ rule }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timelineEvents = [];

  // Event 1: Created
  if (rule?.createdOn) {
    timelineEvents?.push({
      id: 'created',
      icon: 'FileText',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Rule Created',
      description: `Created by ${rule?.createdByUser?.full_name || rule?.creator?.full_name || 'Unknown'}`,
      timestamp: formatDate(rule?.createdOn),
      status: 'completed'
    });
  }

  // Event 2: Submitted for Approval
  if (rule?.submittedAt) {
    timelineEvents?.push({
      id: 'submitted',
      icon: 'Send',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      title: 'Submitted for Approval',
      description: 'Rule submitted for maker-checker review',
      timestamp: formatDate(rule?.submittedAt),
      status: 'completed'
    });
  }

  // Event 3: Approved/Rejected (if applicable)
  if (rule?.approvedAtTimestamp && rule?.approvalStatus === 'approved') {
    timelineEvents?.push({
      id: 'approved',
      icon: 'CheckCircle',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      title: 'Approved',
      description: `Approved by ${rule?.approvedByUser?.full_name || rule?.approver?.full_name || 'Unknown'}`,
      timestamp: formatDate(rule?.approvedAtTimestamp),
      comments: rule?.approvalComments,
      status: 'completed'
    });
  } else if (rule?.approvedAtTimestamp && rule?.approvalStatus === 'rejected') {
    timelineEvents?.push({
      id: 'rejected',
      icon: 'XCircle',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      title: 'Rejected',
      description: `Rejected by ${rule?.approvedByUser?.full_name || rule?.approver?.full_name || 'Unknown'}`,
      timestamp: formatDate(rule?.approvedAtTimestamp),
      comments: rule?.approvalComments,
      status: 'completed'
    });
  } else if (rule?.approvalStatus === 'pending_approval') {
    timelineEvents?.push({
      id: 'pending',
      icon: 'Clock',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      title: 'Pending Approval',
      description: 'Awaiting approver review',
      timestamp: null,
      status: 'pending'
    });
  }

  // Event 4: Retired (if applicable)
  if (rule?.isActive === false && rule?.retirementDate) {
    timelineEvents?.push({
      id: 'retired',
      icon: 'Archive',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      title: 'Rule Retired',
      description: `Retired by ${rule?.retiredByUser?.full_name || 'Unknown'}`,
      timestamp: formatDate(rule?.retirementDate),
      comments: rule?.retirementReason,
      status: 'completed'
    });
  }

  if (timelineEvents?.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No approval history available
      </div>
    );
  }

  return (
    <div className="relative">
      {timelineEvents?.map((event, index) => {
        const isLast = index === timelineEvents?.length - 1;
        
        return (
          <div key={event?.id} className="relative pb-6">
            {/* Vertical Line */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
            )}
            
            {/* Timeline Item */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${event?.iconBg} flex items-center justify-center z-10`}>
                <Icon name={event?.icon} size={20} className={event?.iconColor} />
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-foreground">{event?.title}</h5>
                  {event?.timestamp && (
                    <span className="text-xs text-muted-foreground">{event?.timestamp}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{event?.description}</p>
                {event?.comments && (
                  <div className="mt-2 p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs font-medium text-foreground mb-1">
                      {event?.id === 'retired' ? 'Retirement Reason:' : 'Comments:'}
                    </p>
                    <p className="text-sm text-muted-foreground">{event?.comments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalHistoryTimeline;