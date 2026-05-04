import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleStatsCard = ({ icon, label, value, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent'
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation-md transition-base">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses?.[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-success' : 'text-error'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
};

export default RoleStatsCard;