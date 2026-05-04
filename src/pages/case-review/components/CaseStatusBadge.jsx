import React from 'react';

const CaseStatusBadge = ({ status, priority }) => {
  const statusConfig = {
    'Pending': {
      bg: 'bg-warning/10',
      text: 'text-warning',
      label: 'Pending Review'
    },
    'In Progress': {
      bg: 'bg-primary/10',
      text: 'text-primary',
      label: 'In Progress'
    },
    'Resolved': {
      bg: 'bg-success/10',
      text: 'text-success',
      label: 'Resolved'
    },
    'Overridden': {
      bg: 'bg-accent/10',
      text: 'text-accent',
      label: 'Overridden'
    }
  };

  const priorityConfig = {
    'High': {
      bg: 'bg-error/10',
      text: 'text-error',
      icon: '🔴'
    },
    'Medium': {
      bg: 'bg-warning/10',
      text: 'text-warning',
      icon: '🟡'
    },
    'Low': {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      icon: '🟢'
    }
  };

  const statusStyle = statusConfig?.[status] || statusConfig?.['Pending'];
  const priorityStyle = priorityConfig?.[priority] || priorityConfig?.['Medium'];

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusStyle?.bg} ${statusStyle?.text}`}>
        {statusStyle?.label}
      </span>
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${priorityStyle?.bg} ${priorityStyle?.text}`}>
        <span>{priorityStyle?.icon}</span>
        <span>{priority}</span>
      </span>
    </div>
  );
};

export default CaseStatusBadge;