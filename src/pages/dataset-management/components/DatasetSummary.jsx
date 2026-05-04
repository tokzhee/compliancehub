import React from 'react';
import Icon from '../../../components/AppIcon';

const DatasetSummary = ({ summary, viewMode = 'datasets' }) => {
  const summaryCards = viewMode === 'datasets' ? [
    {
      label: 'Total Datasets',
      value: summary?.totalDatasets || 0,
      icon: 'Database',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Total Records',
      value: (summary?.totalRecords || 0)?.toLocaleString(),
      icon: 'FileText',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      label: 'Validated',
      value: summary?.validatedDatasets || 0,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Errors',
      value: (summary?.errorCount || 0)?.toLocaleString(),
      icon: 'AlertCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    }
  ] : [
    {
      label: 'Total Customers',
      value: summary?.totalCustomers || 0,
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Individuals',
      value: summary?.individuals || 0,
      icon: 'User',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      label: 'Entities',
      value: summary?.entities || 0,
      icon: 'Building2',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Above Threshold',
      value: summary?.aboveThreshold || 0,
      icon: 'TrendingUp',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
      {summaryCards?.map((card) => (
        <div
          key={card?.id}
          className="bg-card rounded-lg border border-border p-4 md:p-6 transition-base hover:shadow-elevation-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{card?.label}</p>
              <p className="text-2xl md:text-3xl font-semibold text-foreground">
                {card?.value}
              </p>
            </div>
            <div className={`${card?.bgColor} ${card?.color} p-3 rounded-lg`}>
              <Icon name={card?.icon} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DatasetSummary;