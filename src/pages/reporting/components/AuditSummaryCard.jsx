import React from 'react';
import Icon from '../../../components/AppIcon';

const AuditSummaryCard = ({ title, value, icon, iconColor }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon 
              name={icon} 
              size={24} 
              style={{ color: iconColor }}
            />
          </div>
        </div>
      </div>
      
      <div>
        <p className="text-3xl font-bold text-foreground mb-1">
          {value?.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          {title}
        </p>
      </div>
    </div>
  );
};

export default AuditSummaryCard;