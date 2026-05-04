import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';


const CreateRuleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    ruleName: '',
    ruleType: '',
    description: '',
    effectiveDate: '',
    reportingYear: '',
    conditions: '',
    actions: ''
  });

  const [errors, setErrors] = useState({});

  const ruleTypeOptions = [
    { value: 'classification', label: 'Classification Rules' },
    { value: 'validation', label: 'Validation Rules' },
    { value: 'calculation', label: 'Calculation Rules' },
    { value: 'reporting', label: 'Reporting Rules' }
  ];

  const reportingYearOptions = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.ruleName?.trim()) newErrors.ruleName = 'Rule name is required';
    if (!formData?.ruleType) newErrors.ruleType = 'Rule type is required';
    if (!formData?.effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    if (!formData?.reportingYear) newErrors.reportingYear = 'Reporting year is required';
    if (!formData?.conditions?.trim()) newErrors.conditions = 'Conditions are required';
    if (!formData?.actions?.trim()) newErrors.actions = 'Actions are required';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        ruleName: '',
        ruleType: '',
        description: '',
        effectiveDate: '',
        reportingYear: '',
        conditions: '',
        actions: ''
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-md transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Create Rule</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              Configure the details of your new rule.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-all"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <Input
            label="Rule Name"
            type="text"
            placeholder="Enter rule name"
            value={formData?.ruleName}
            onChange={(e) => handleChange('ruleName', e?.target?.value)}
            error={errors?.ruleName}
            required
          />

          <Select
            label="Rule Type"
            placeholder="Select rule type"
            options={ruleTypeOptions}
            value={formData?.ruleType}
            onChange={(value) => handleChange('ruleType', value)}
            error={errors?.ruleType}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Effective Date"
              type="date"
              value={formData?.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e?.target?.value)}
              error={errors?.effectiveDate}
              required
            />

            <Select
              label="Reporting Year"
              placeholder="Select year"
              options={reportingYearOptions}
              value={formData?.reportingYear}
              onChange={(value) => handleChange('reportingYear', value)}
              error={errors?.reportingYear}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows="3"
              placeholder="Enter rule description"
              value={formData?.description}
              onChange={(e) => handleChange('description', e?.target?.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Conditions <span className="text-destructive">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows="4"
              placeholder="Define rule conditions (e.g., IF account_balance > 50000 AND country_code = 'US')"
              value={formData?.conditions}
              onChange={(e) => handleChange('conditions', e?.target?.value)}
            />
            {errors?.conditions && (
              <p className="text-sm text-destructive mt-1">{errors?.conditions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Actions <span className="text-destructive">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows="4"
              placeholder="Define rule actions (e.g., SET is_reportable = TRUE, SET reporting_category = 'High Value')"
              value={formData?.actions}
              onChange={(e) => handleChange('actions', e?.target?.value)}
            />
            {errors?.actions && (
              <p className="text-sm text-destructive mt-1">{errors?.actions}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              fullWidth
              iconName="Plus"
              iconPosition="left"
            >
              Create Rule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRuleModal;