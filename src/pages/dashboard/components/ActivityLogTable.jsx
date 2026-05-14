import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityLogTable = ({ activities }) => {
  const getActionIcon = (action) => {
    const iconMap = {
      'User Login': 'LogIn',
      'Dataset Upload': 'Upload',
      'Rule Created': 'Plus',
      'Rule Activated': 'CheckCircle',
      'Case Assigned': 'UserCheck',
      'Report Generated': 'FileText',
      'Override Applied': 'AlertTriangle',
      'User Created': 'UserPlus',
      'Role Updated': 'Shield'
    };
    return iconMap?.[action] || 'Activity';
  };

  const getActionColor = (action) => {
    const colorMap = {
      'User Login': 'var(--color-primary)',
      'Dataset Upload': 'var(--color-accent)',
      'Rule Created': 'var(--color-success)',
      'Rule Activated': 'var(--color-success)',
      'Case Assigned': 'var(--color-secondary)',
      'Report Generated': 'var(--color-primary)',
      'Override Applied': 'var(--color-warning)',
      'User Created': 'var(--color-success)',
      'Role Updated': 'var(--color-accent)'
    };
    return colorMap?.[action] || 'var(--color-muted-foreground)';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    // Normalize SQL Server datetime format: replace space separator with T
    const normalized = typeof timestamp === 'string' ? timestamp?.replace(' ', 'T') : timestamp;
    const date = new Date(normalized);
    if (isNaN(date?.getTime())) return 'Unknown';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date?.getFullYear() !== now?.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-sm border border-border overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-border">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest actions across your organization</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                User
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Details
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities?.map((activity) => (
              <tr key={activity?.id} className="hover:bg-muted/30 transition-all duration-200 hover:shadow-sm">
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded-lg"
                      style={{ backgroundColor: `${getActionColor(activity?.action)}15` }}
                    >
                      <Icon 
                        name={getActionIcon(activity?.action)} 
                        size={16} 
                        color={getActionColor(activity?.action)} 
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{activity?.action}</span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <span className="text-sm text-foreground">{activity?.userName}</span>
                </td>
                <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground line-clamp-1">{activity?.details}</span>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{formatTimestamp(activity?.timestamp)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogTable;