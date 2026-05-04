import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CaseFilters = ({ filters, onFilterChange, onReset }) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending Review' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Overridden', label: 'Overridden' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];

  const reportabilityOptions = [
    { value: '', label: 'All Cases' },
    { value: 'true', label: 'Reportable Only' },
    { value: 'false', label: 'Non-Reportable Only' }
  ];

  const assigneeOptions = [
    { value: '', label: 'All Reviewers' },
    { value: 'reviewer_001', label: 'Sarah Mitchell' },
    { value: 'reviewer_002', label: 'Michael Chen' },
    { value: 'reviewer_003', label: 'Emily Rodriguez' },
    { value: 'reviewer_004', label: 'David Thompson' },
    { value: 'unassigned', label: 'Unassigned Cases' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Filter Cases</h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="RotateCcw"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search account number..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
        />

        <Select
          placeholder="Filter by status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          placeholder="Filter by priority"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => onFilterChange('priority', value)}
        />

        <Select
          placeholder="Filter by reportability"
          options={reportabilityOptions}
          value={filters?.reportability}
          onChange={(value) => onFilterChange('reportability', value)}
        />

        <Select
          placeholder="Filter by assignee"
          options={assigneeOptions}
          value={filters?.assignee}
          onChange={(value) => onFilterChange('assignee', value)}
        />

        <Input
          type="date"
          placeholder="Review deadline from"
          value={filters?.deadlineFrom}
          onChange={(e) => onFilterChange('deadlineFrom', e?.target?.value)}
        />

        <Input
          type="date"
          placeholder="Review deadline to"
          value={filters?.deadlineTo}
          onChange={(e) => onFilterChange('deadlineTo', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default CaseFilters;