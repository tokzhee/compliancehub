import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserTableRow = ({ user, onEditRole, onSuspend, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success';
      case 'Suspended':
        return 'bg-error/10 text-error';
      case 'Pending':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    const loginDate = new Date(date);
    const now = new Date();
    const diffMs = now - loginDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return loginDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
      <td className="px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-primary">
              {user?.username?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm md:text-base truncate">
              {user?.username}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 md:px-6">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/10 text-secondary text-xs md:text-sm font-medium">
          <Icon name="Shield" size={14} />
          {user?.role}
        </span>
      </td>
      <td className="px-4 py-4 md:px-6">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs md:text-sm font-medium ${getStatusColor(user?.status)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {user?.status}
        </span>
      </td>
      <td className="px-4 py-4 md:px-6 text-sm text-muted-foreground whitespace-nowrap">
        {formatLastLogin(user?.lastLogin)}
      </td>
      <td className="px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit"
            iconSize={16}
            onClick={() => onEditRole(user)}
            className="text-primary hover:text-primary"
          >
            <span className="hidden md:inline">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName={user?.status === 'Active' ? 'Ban' : 'CheckCircle'}
            iconSize={16}
            onClick={() => onSuspend(user)}
            className={user?.status === 'Active' ? 'text-error hover:text-error' : 'text-success hover:text-success'}
          >
            <span className="hidden md:inline">
              {user?.status === 'Active' ? 'Suspend' : 'Activate'}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Eye"
            iconSize={16}
            onClick={() => onViewDetails(user)}
            className="text-muted-foreground hover:text-foreground"
          >
            <span className="hidden md:inline">View</span>
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;