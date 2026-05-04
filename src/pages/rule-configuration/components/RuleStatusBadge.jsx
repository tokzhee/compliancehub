import React from 'react';

const RuleStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      label: 'Draft'
    },
    pending_approval: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      label: 'Pending Approval'
    },
    active: {
      bg: 'bg-success/10',
      text: 'text-success',
      label: 'Active'
    },
    inactive: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      label: 'Inactive'
    },
    archived: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      label: 'Archived'
    }
  };

  const config = statusConfig?.[status] || statusConfig?.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
      {config?.label}
    </span>
  );
};

export default RuleStatusBadge;