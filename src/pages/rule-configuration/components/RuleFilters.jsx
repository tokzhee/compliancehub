import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const RuleFilters = ({ filters, onFilterChange, onReset }) => {
  const ruleTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'classification', label: 'Classification Rules' },
    { value: 'validation', label: 'Validation Rules' },
    { value: 'calculation', label: 'Calculation Rules' },
    { value: 'reporting', label: 'Reporting Rules' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const reportingYearOptions = [
    { value: 'all', label: 'All Years' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 mb-4 md:mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search by rule name..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
          className="w-full"
        />

        <Select
          placeholder="Select rule type"
          options={ruleTypeOptions}
          value={filters?.ruleType}
          onChange={(value) => onFilterChange('ruleType', value)}
        />

        <Select
          placeholder="Select status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          placeholder="Select reporting year"
          options={reportingYearOptions}
          value={filters?.reportingYear}
          onChange={(value) => onFilterChange('reportingYear', value)}
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={onReset}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default RuleFilters;