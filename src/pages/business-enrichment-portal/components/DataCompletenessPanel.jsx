import React from 'react';
import Icon from '../../../components/AppIcon';

const DataCompletenessPanel = ({ stats }) => {
  const completionPercentage = stats?.total > 0 
    ? Math.round((stats?.complete / stats?.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Total Cases</span>
          <Icon name="FileText" className="w-5 h-5 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Complete</span>
          <Icon name="CheckCircle" className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-green-600">{stats?.complete}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Incomplete</span>
          <Icon name="AlertCircle" className="w-5 h-5 text-orange-600" />
        </div>
        <p className="text-2xl font-bold text-orange-600">{stats?.incomplete}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Ready for Review</span>
          <Icon name="Clock" className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-blue-600">{stats?.readyForReview}</p>
      </div>

      {/* Completion Progress Bar */}
      <div className="md:col-span-4 bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Enrichment Progress</span>
          <span className="text-sm font-semibold text-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DataCompletenessPanel;