import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserMobileCard = ({ user, onEditRole, onSuspend, onViewDetails }) => {
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
    return loginDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-medium text-primary">
              {user?.username?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground text-base truncate">
              {user?.username}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${getStatusColor(user?.status)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {user?.status}
        </span>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Role:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/10 text-secondary text-xs font-medium">
            <Icon name="Shield" size={12} />
            {user?.role}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Login:</span>
          <span className="text-foreground font-medium">
            {formatLastLogin(user?.lastLogin)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          iconName="Edit"
          iconSize={16}
          onClick={() => onEditRole(user)}
          className="flex-1"
        >
          Edit Role
        </Button>
        <Button
          variant={user?.status === 'Active' ? 'destructive' : 'success'}
          size="sm"
          iconName={user?.status === 'Active' ? 'Ban' : 'CheckCircle'}
          iconSize={16}
          onClick={() => onSuspend(user)}
          className="flex-1"
        >
          {user?.status === 'Active' ? 'Suspend' : 'Activate'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="Eye"
          iconSize={16}
          onClick={() => onViewDetails(user)}
        />
      </div>
    </div>
  );
};

export default UserMobileCard;