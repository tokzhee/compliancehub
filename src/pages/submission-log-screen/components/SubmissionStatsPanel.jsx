import React from 'react';
import Icon from '../../../components/AppIcon';

const SubmissionStatsPanel = ({ stats }) => {
  const successRate = stats?.totalSubmissions > 0
    ? Math.round((stats?.successfulSubmissions / stats?.totalSubmissions) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Total Submissions</span>
          <Icon name="Send" className="w-5 h-5 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats?.totalSubmissions}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Successful</span>
          <Icon name="CheckCircle" className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-green-600">{stats?.successfulSubmissions}</p>
        <p className="text-xs text-muted-foreground mt-1">{successRate}% success rate</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Pending</span>
          <Icon name="Clock" className="w-5 h-5 text-yellow-600" />
        </div>
        <p className="text-2xl font-bold text-yellow-600">{stats?.pendingSubmissions}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Errors</span>
          <Icon name="AlertCircle" className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-2xl font-bold text-red-600">{stats?.errorSubmissions}</p>
      </div>
    </div>
  );
};

export default SubmissionStatsPanel;