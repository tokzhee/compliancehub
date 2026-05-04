import React from 'react';
import Icon from '../../../components/AppIcon';

const ComplianceStatusCard = ({ status, lastUpdated, reportingYear }) => {
  const statusConfig = {
    compliant: {
      label: 'Compliant',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success)',
      icon: 'CheckCircle',
      description: 'All regulatory requirements met'
    },
    'at-risk': {
      label: 'At Risk',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning)',
      icon: 'AlertTriangle',
      description: 'Action required to maintain compliance'
    },
    'non-compliant': {
      label: 'Non-Compliant',
      color: 'var(--color-error)',
      bgColor: 'var(--color-error)',
      icon: 'XCircle',
      description: 'Immediate attention required'
    }
  };

  const config = statusConfig?.[status] || statusConfig?.compliant;

  return (
    <div className="bg-card rounded-lg p-4 md:p-6 shadow-elevation-sm border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">Compliance Status</p>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg"
              style={{ backgroundColor: `${config?.bgColor}15` }}
            >
              <Icon name={config?.icon} size={24} color={config?.color} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-semibold" style={{ color: config?.color }}>
                {config?.label}
              </h3>
              <p className="text-xs text-muted-foreground">{config?.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reporting Year</span>
          <span className="font-medium text-foreground">{reportingYear}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Updated</span>
          <span className="font-medium text-foreground">
            {new Date(lastUpdated)?.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatusCard;