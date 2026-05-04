import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityCard = ({ activities }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      'user_created': 'UserPlus',
      'role_updated': 'Shield',
      'user_suspended': 'Ban',
      'user_activated': 'CheckCircle',
      'login': 'LogIn'
    };
    return iconMap?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'user_created': 'text-success',
      'role_updated': 'text-primary',
      'user_suspended': 'text-error',
      'user_activated': 'text-success',
      'login': 'text-secondary'
    };
    return colorMap?.[type] || 'text-muted-foreground';
  };

  const formatTimestamp = (date) => {
    const activityDate = new Date(date);
    const now = new Date();
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-sm">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon name="Activity" size={20} className="text-accent md:w-6 md:h-6" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs md:text-sm text-muted-foreground">Last 24 hours</p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        {activities?.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 md:pb-4 border-b border-border last:border-0 last:pb-0">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={16} className="md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-medium text-foreground mb-1">
                {activity?.description}
              </p>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <span className="truncate">{activity?.performedBy}</span>
                <span>•</span>
                <span className="whitespace-nowrap">{formatTimestamp(activity?.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityCard;