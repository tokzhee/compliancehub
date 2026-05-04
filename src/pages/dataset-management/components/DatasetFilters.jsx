import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';


const DatasetFilters = ({ 
  filters, 
  onFilterChange, 
  onReset,
  reportingYears,
  viewMode = 'datasets'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'validated', label: 'Validated' },
    { value: 'pending', label: 'Pending Validation' },
    { value: 'error', label: 'Validation Error' },
    { value: 'processing', label: 'Processing' }
  ];

  const w9StatusOptions = [
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Not Submitted', label: 'Not Submitted' },
    { value: 'Pending', label: 'Pending' }
  ];

  const w8FormTypeOptions = [
    { value: 'W8-BEN', label: 'W8-BEN' },
    { value: 'W8-BEN-E', label: 'W8-BEN-E' },
    { value: 'W8-ECI', label: 'W8-ECI' },
    { value: 'W8-EXP', label: 'W8-EXP' },
    { value: 'W8-IMY', label: 'W8-IMY' },
    { value: 'Not Applicable', label: 'Not Applicable' }
  ];

  const recalcitrantOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ];

  const usPersonOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ];

  const giinOptions = [
    { value: 'Has GIIN', label: 'Has GIIN' },
    { value: 'No GIIN', label: 'No GIIN' }
  ];

  const handleMultiSelectToggle = (filterKey, value) => {
    const currentValues = filters?.[filterKey] || [];
    const newValues = currentValues?.includes(value)
      ? currentValues?.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(filterKey, newValues);
  };

  const MultiSelectDropdown = ({ label, filterKey, options, placeholder }) => {
    const selectedValues = filters?.[filterKey] || [];
    const isOpen = openDropdown === filterKey;
    const selectedCount = selectedValues?.length;

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
          className="w-full px-3 py-2 text-left bg-background border border-input rounded-lg hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-base flex items-center justify-between"
        >
          <span className="text-sm text-foreground flex items-center gap-2">
            {selectedCount > 0 ? (
              <>
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                  {selectedCount}
                </span>
                <span>{placeholder}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-elevation-lg max-h-60 overflow-y-auto">
            <div className="p-2 space-y-1">
              {options?.map(option => (
                <label
                  key={option?.value}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md cursor-pointer transition-base"
                >
                  <Checkbox
                    checked={selectedValues?.includes(option?.value)}
                    onChange={() => handleMultiSelectToggle(filterKey, option?.value)}
                  />
                  <span className="text-sm text-foreground">{option?.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-elevation-md p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-base"
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-muted-foreground" />
        </button>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${viewMode === 'customers' ? '5' : '4'} gap-4 ${isExpanded ? 'block' : 'hidden lg:grid'}`}>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Reporting Year
          </label>
          <Select
            value={filters?.reportingYear}
            onChange={(e) => onFilterChange('reportingYear', e?.target?.value)}
            options={[
              { value: 'all', label: 'All Years' },
              ...reportingYears
            ]}
          />
        </div>

        {viewMode === 'customers' && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Customer Type
              </label>
              <Select
                value={filters?.customerType}
                onChange={(e) => onFilterChange('customerType', e?.target?.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'INDIVIDUAL', label: 'Individual' },
                  { value: 'ENTITY', label: 'Entity' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Regime
              </label>
              <Select
                value={filters?.regimeType}
                onChange={(e) => onFilterChange('regimeType', e?.target?.value)}
                options={[
                  { value: 'all', label: 'All Regimes' },
                  { value: 'FATCA', label: 'FATCA' },
                  { value: 'CRS', label: 'CRS' },
                  { value: 'BOTH', label: 'Both' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Status
              </label>
              <Select
                value={filters?.accountStatus}
                onChange={(e) => onFilterChange('accountStatus', e?.target?.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                  { value: 'Suspended', label: 'Suspended' },
                  { value: 'Closed', label: 'Closed' }
                ]}
              />
            </div>

            <MultiSelectDropdown
              label="W9 Status"
              filterKey="w9Status"
              options={w9StatusOptions}
              placeholder="Select W9 Status"
            />

            <MultiSelectDropdown
              label="W8 Form Type"
              filterKey="w8FormType"
              options={w8FormTypeOptions}
              placeholder="Select W8 Form Type"
            />

            <MultiSelectDropdown
              label="Recalcitrant Status"
              filterKey="recalcitrantStatus"
              options={recalcitrantOptions}
              placeholder="Select Recalcitrant Status"
            />

            <MultiSelectDropdown
              label="US Person Indicator"
              filterKey="usPersonIndicator"
              options={usPersonOptions}
              placeholder="Select US Person"
            />

            <MultiSelectDropdown
              label="GIIN"
              filterKey="giinStatus"
              options={giinOptions}
              placeholder="Select GIIN Status"
            />
          </>
        )}

        {viewMode === 'datasets' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <Select
              value={filters?.status}
              onChange={(e) => onFilterChange('status', e?.target?.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'validated', label: 'Validated' },
                { value: 'processing', label: 'Processing' },
                { value: 'error', label: 'Error' }
              ]}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Upload Date From
          </label>
          <Input
            type="date"
            value={filters?.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e?.target?.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Upload Date To
          </label>
          <Input
            type="date"
            value={filters?.dateTo}
            onChange={(e) => onFilterChange('dateTo', e?.target?.value)}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Input
          type="search"
          placeholder="Search by dataset name..."
          value={filters?.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e?.target?.value)}
          className="flex-1"
        />
        
        <Button
          variant="outline"
          onClick={onReset}
          iconName="RotateCcw"
          iconPosition="left"
          className="sm:w-auto"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default DatasetFilters;