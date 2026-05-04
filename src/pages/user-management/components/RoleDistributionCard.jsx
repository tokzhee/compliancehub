import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleDistributionCard = ({ roleStats }) => {
  const totalUsers = roleStats?.reduce((sum, stat) => sum + stat?.count, 0);

  const getRoleIcon = (roleName) => {
    const iconMap = {
      'Administrator': 'ShieldCheck',
      'Compliance Officer': 'Shield',
      'Reviewer': 'FileCheck',
      'Auditor': 'Search',
      'Analyst': 'BarChart3'
    };
    return iconMap?.[roleName] || 'User';
  };

  const getRoleColor = (roleName) => {
    const colorMap = {
      'Administrator': 'text-error',
      'Compliance Officer': 'text-primary',
      'Reviewer': 'text-secondary',
      'Auditor': 'text-accent',
      'Analyst': 'text-success'
    };
    return colorMap?.[roleName] || 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-sm">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="Users" size={20} className="text-primary md:w-6 md:h-6" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">Role Distribution</h3>
          <p className="text-xs md:text-sm text-muted-foreground">Total: {totalUsers} users</p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        {roleStats?.map((stat, index) => {
          const percentage = totalUsers > 0 ? (stat?.count / totalUsers) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Icon 
                    name={getRoleIcon(stat?.role)} 
                    size={16} 
                    className={`flex-shrink-0 ${getRoleColor(stat?.role)}`}
                  />
                  <span className="text-sm md:text-base font-medium text-foreground truncate">
                    {stat?.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {percentage?.toFixed(0)}%
                  </span>
                  <span className="text-sm md:text-base font-semibold text-foreground min-w-[2rem] text-right">
                    {stat?.count}
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleDistributionCard;