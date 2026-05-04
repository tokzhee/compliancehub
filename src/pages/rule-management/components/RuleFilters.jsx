import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const RuleFilters = ({ filters, segments, onFilterChange, onResetFilters }) => {
  const segmentOptions = [
    { value: 'all', label: 'All Segments' },
    ...segments?.map(segment => ({
      value: segment?.id,
      label: segment?.segment_name
    }))
  ];

  const reportingYearOptions = [
    { value: 'all', label: 'All Years' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'approved', label: 'Approved' },
    { value: 'locked', label: 'Locked' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Input
            type="text"
            placeholder="Search rules..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            iconName="Search"
          />
        </div>

        <Select
          placeholder="Select segment"
          options={segmentOptions}
          value={filters?.segmentId}
          onChange={(value) => onFilterChange('segmentId', value)}
        />

        <Select
          placeholder="Select year"
          options={reportingYearOptions}
          value={filters?.reportingYear}
          onChange={(value) => onFilterChange('reportingYear', value)}
        />

        <Select
          placeholder="Select status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />
      </div>

      {(filters?.search || filters?.segmentId !== 'all' || filters?.reportingYear !== 'all' || filters?.status !== 'all') && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Active filters applied
          </p>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={onResetFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default RuleFilters;
