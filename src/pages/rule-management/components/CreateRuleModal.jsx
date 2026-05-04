import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';
import { useToast } from '../../../contexts/ToastContext';

import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { ruleSimulationService } from '../../../services/ruleSimulationService';

const CreateRuleModal = ({ isOpen, onClose, onSubmit, segments, selectedRule, conditions = [], organizationId, regimeType, isInlineMode = false }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    ruleName: '',
    regime: '',
    segmentId: '',
    reportingYear: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validFields, setValidFields] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakingFields, setShakingFields] = useState({});
  
  // Simulation state
  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [showSimulationPanel, setShowSimulationPanel] = useState(false);

  // Conditions state
  const [ruleConditions, setRuleConditions] = useState([]);
  const [conditionLogic, setConditionLogic] = useState('AND'); // 'AND' or 'OR'

  // Field options for conditions
  const fieldOptions = [
    { value: 'customer_type', label: 'Customer Type' },
    { value: 'account_balance', label: 'Account Balance' },
    { value: 'country_of_residence', label: 'Country of Residence' },
    { value: 'tax_residency', label: 'Tax Residency' },
    { value: 'us_person', label: 'US Person' },
    { value: 'recalcitrant_status', label: 'Recalcitrant Status' },
    { value: 'account_status', label: 'Account Status' },
    { value: 'entity_type', label: 'Entity Type' },
    { value: 'fatca_status', label: 'FATCA Status' },
    { value: 'crs_status', label: 'CRS Status' }
  ];

  // Operator options for conditions
  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not In' }
  ];

  useEffect(() => {
    if (selectedRule) {
      setFormData({
        ruleName: selectedRule?.ruleName || '',
        regime: selectedRule?.regimeType || regimeType || '',
        segmentId: selectedRule?.segmentId || '',
        reportingYear: String(selectedRule?.reportingYear) || '',
        description: selectedRule?.description || ''
      });
      // Load existing simulation results if available
      if (selectedRule?.simulationResults) {
        setSimulationResults(selectedRule?.simulationResults);
        setHasSimulated(true);
      }
      // Load existing conditions when editing
      if (conditions && conditions?.length > 0) {
        const mappedConditions = conditions?.map(c => ({
          id: c?.id || Date.now()?.toString() + Math.random(),
          field: c?.field || c?.fieldName || '',
          operator: c?.operator || '',
          value: c?.value || ''
        }));
        setRuleConditions(mappedConditions);
      } else {
        setRuleConditions([]);
      }
    } else {
      setFormData({
        ruleName: '',
        regime: regimeType || '',
        segmentId: '',
        reportingYear: '',
        description: ''
      });
      setSimulationResults(null);
      setHasSimulated(false);
      setShowSimulationPanel(false);
      setRuleConditions([]);
    }
    setErrors({});
    setTouched({});
    setValidFields({});
  }, [selectedRule, isOpen, conditions]);

  const segmentOptions = segments?.map(segment => ({
    value: segment?.id,
    label: `${segment?.segment_name || 'Unknown'} - ${segment?.giin || 'N/A'} (${segment?.entity_name || 'N/A'})`,
    description: segment?.entity_name || ''
  })) || [];

  console.log('🎨 CreateRuleModal - segments prop:', segments);
  console.log('🎨 CreateRuleModal - segments count:', segments?.length);
  console.log('🎨 CreateRuleModal - first segment:', segments?.[0]);
  console.log('🎨 CreateRuleModal - segmentOptions:', segmentOptions);
  console.log('🎨 CreateRuleModal - first segmentOption:', segmentOptions?.[0]);

  const reportingYearOptions = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];

  const regimeOptions = [
    { value: 'FATCA', label: 'FATCA' },
    { value: 'CRS', label: 'CRS' },
    { value: 'BOTH', label: 'BOTH' }
  ];

  const validateField = (field, value) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'ruleName':
        if (!value?.trim()) {
          error = 'Rule name is required';
        } else if (value?.length < 3) {
          error = 'Rule name must be at least 3 characters';
        } else if (value?.length > 100) {
          error = 'Rule name must not exceed 100 characters';
        } else {
          isValid = true;
        }
        break;

      case 'regime':
        if (!value) {
          error = 'Regime is required';
        } else {
          isValid = true;
        }
        break;

      case 'segmentId':
        if (!value) {
          error = 'Business segment is required';
        } else {
          isValid = true;
        }
        break;

      case 'reportingYear':
        if (!value) {
          error = 'Reporting year is required';
        } else {
          isValid = true;
        }
        break;

      case 'description':
        if (value && value?.length > 500) {
          error = 'Description must not exceed 500 characters';
        } else if (value?.trim()) {
          isValid = true;
        }
        break;

      default:
        break;
    }

    return { error, isValid };
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const { error, isValid } = validateField(field, formData?.[field]);
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      setValidFields(prev => ({ ...prev, [field]: false }));
      triggerShake(field);
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      setValidFields(prev => ({ ...prev, [field]: isValid }));
    }
  };

  const triggerShake = (field) => {
    setShakingFields(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setShakingFields(prev => ({ ...prev, [field]: false }));
    }, 500);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for touched fields
    if (touched?.[field]) {
      const { error, isValid } = validateField(field, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        setValidFields(prev => ({ ...prev, [field]: false }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
        setValidFields(prev => ({ ...prev, [field]: isValid }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const newValidFields = {};

    ['ruleName', 'regime', 'segmentId', 'reportingYear', 'description']?.forEach(field => {
      const { error, isValid } = validateField(field, formData?.[field]);
      if (error) {
        newErrors[field] = error;
        newValidFields[field] = false;
      } else if (isValid) {
        newValidFields[field] = true;
      }
    });

    setErrors(newErrors);
    setValidFields(newValidFields);
    setTouched({
      ruleName: true,
      regime: true,
      segmentId: true,
      reportingYear: true,
      description: true
    });

    return Object.keys(newErrors)?.length === 0;
  };

  const handleSimulateRule = async () => {
    // Validate form first
    const allTouched = { ruleName: true, regime: true, segmentId: true, reportingYear: true, description: true };
    setTouched(allTouched);

    const newErrors = {};
    const fieldsToShake = [];

    ['ruleName', 'regime', 'segmentId', 'reportingYear']?.forEach(field => {
      const { error } = validateField(field, formData?.[field]);
      if (error) {
        newErrors[field] = error;
        fieldsToShake?.push(field);
      }
    });

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      fieldsToShake?.forEach(field => triggerShake(field));
      toast?.error('Please fill all required fields before simulating');
      return;
    }

    // Check if conditions exist
    if (!ruleConditions || ruleConditions?.length === 0) {
      toast?.error('Please add at least one rule condition before simulating');
      return;
    }

    // Validate all conditions are complete
    const incompleteConditions = ruleConditions?.filter(
      c => !c?.field || !c?.operator || !c?.value
    );

    if (incompleteConditions?.length > 0) {
      toast?.error('Please complete all condition fields before simulating');
      return;
    }

    setIsSimulating(true);
    setShowSimulationPanel(true);

    try {
      const ruleData = {
        organizationId: organizationId,
        segmentId: formData?.segmentId,
        regimeType: formData?.regime || regimeType,
        reportingYear: parseInt(formData?.reportingYear)
      };

      const results = await ruleSimulationService?.simulateRule(ruleData, ruleConditions);
      
      setSimulationResults(results);
      setHasSimulated(results?.success);

      if (results?.success) {
        toast?.success(`Simulation complete: ${results?.matched_count} of ${results?.total_count} records matched`);
      } else {
        toast?.error(results?.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast?.error('Failed to simulate rule. Please try again.');
      setHasSimulated(false);
    } finally {
      setIsSimulating(false);
    }
  };

  const addCondition = () => {
    const newCondition = {
      id: Date.now()?.toString(),
      field: '',
      operator: '',
      value: ''
    };
    setRuleConditions([...ruleConditions, newCondition]);
  };

  const removeCondition = (conditionId) => {
    setRuleConditions(ruleConditions?.filter(c => c?.id !== conditionId));
    // Reset simulation if conditions change
    setHasSimulated(false);
    setSimulationResults(null);
  };

  const updateCondition = (conditionId, field, value) => {
    setRuleConditions(
      ruleConditions?.map(c => 
        c?.id === conditionId ? { ...c, [field]: value } : c
      )
    );
    // Reset simulation if conditions change
    setHasSimulated(false);
    setSimulationResults(null);
  };

  const editCondition = (conditionId) => {
    // Scroll to the condition for editing (already visible in the builder)
    const conditionElement = document.getElementById(`condition-${conditionId}`);
    if (conditionElement) {
      conditionElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // Check if simulation has been run
    if (!hasSimulated) {
      toast?.error('Please simulate the rule before saving');
      setShowSimulationPanel(true);
      return;
    }

    // Validate all fields
    const allTouched = { ruleName: true, regime: true, segmentId: true, reportingYear: true, description: true };
    setTouched(allTouched);

    const newErrors = {};
    const newValidFields = {};
    const fieldsToShake = [];

    ['ruleName', 'regime', 'segmentId', 'reportingYear', 'description']?.forEach(field => {
      const { error, isValid } = validateField(field, formData?.[field]);
      if (error) {
        newErrors[field] = error;
        newValidFields[field] = false;
        fieldsToShake?.push(field);
      } else if (isValid) {
        newValidFields[field] = true;
      }
    });

    setErrors(newErrors);
    setValidFields(newValidFields);

    if (Object.keys(newErrors)?.length > 0) {
      fieldsToShake?.forEach(field => triggerShake(field));
      toast?.error('Please fix all validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Include simulation results and conditions in submission
      await onSubmit({ 
        ...formData,
        regimeType: formData?.regime,
        conditions: ruleConditions,
        conditionLogic: conditionLogic,
        simulationResults 
      });
      toast?.success(selectedRule ? 'Rule updated successfully' : 'Rule created successfully');
      // Close modal immediately - parent component handles tab switch and list refresh
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast?.error(error?.message || 'Failed to save rule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldBorderClass = (field) => {
    if (!touched?.[field]) return 'border-input';
    if (errors?.[field]) return 'border-red-500';
    if (validFields?.[field]) return 'border-green-500';
    return 'border-input';
  };

  const renderFieldIcon = (field) => {
    if (!touched?.[field]) return null;
    if (errors?.[field]) {
      return <Icon name="XCircle" size={18} className="text-red-500" />;
    }
    if (validFields?.[field]) {
      return <Icon name="CheckCircle" size={18} className="text-green-500" />;
    }
    return null;
  };

  if (!isOpen) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
      {showSuccess && (
        <div className="flex flex-col items-center justify-center py-8">
          <SuccessCheckmark size={80} />
          <p className="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">Rule Created Successfully!</p>
        </div>
      )}
      {!showSuccess && (
        <>
          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Rule Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter rule name"
                value={formData?.ruleName}
                onChange={(e) => handleChange('ruleName', e?.target?.value)}
                onBlur={() => handleBlur('ruleName')}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 pr-10 bg-background border ${getFieldBorderClass('ruleName')} rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {renderFieldIcon('ruleName')}
              </div>
            </div>
            {touched?.ruleName && errors?.ruleName && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.ruleName}
              </p>
            )}
            {touched?.ruleName && !errors?.ruleName && validFields?.ruleName && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />
                Rule name is valid
              </p>
            )}
          </div>

          {/* Regime */}
          <div>
            <Select
              label="Regime"
              placeholder="Select regime"
              options={regimeOptions}
              value={formData?.regime}
              onChange={(value) => {
                handleChange('regime', value);
                handleBlur('regime');
              }}
              error={touched?.regime ? errors?.regime : ''}
              required
              disabled={isSubmitting}
            />
            {touched?.regime && !errors?.regime && validFields?.regime && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />
                Regime selected
              </p>
            )}
          </div>

          {/* Business Segment and Reporting Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Segment */}
            <div>
              <Select
                label="Business Segment"
                placeholder="Select segment"
                options={segmentOptions}
                value={formData?.segmentId}
                onChange={(value) => {
                  handleChange('segmentId', value);
                  handleBlur('segmentId');
                }}
                error={touched?.segmentId ? errors?.segmentId : ''}
                required
                disabled={isSubmitting}
              />
              {touched?.segmentId && !errors?.segmentId && validFields?.segmentId && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="CheckCircle" size={14} />
                  Segment selected
                </p>
              )}
            </div>

            {/* Reporting Year */}
            <div>
              <Select
                label="Reporting Year"
                placeholder="Select year"
                options={reportingYearOptions}
                value={formData?.reportingYear}
                onChange={(value) => {
                  handleChange('reportingYear', value);
                  handleBlur('reportingYear');
                }}
                error={touched?.reportingYear ? errors?.reportingYear : ''}
                required
                disabled={isSubmitting}
              />
              {touched?.reportingYear && !errors?.reportingYear && validFields?.reportingYear && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="CheckCircle" size={14} />
                  Year selected
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-2">
                (Optional, {formData?.description?.length}/500 characters)
              </span>
            </label>
            <div className="relative">
              <textarea
                placeholder="Describe the rule's purpose and logic..."
                value={formData?.description}
                onChange={(e) => handleChange('description', e?.target?.value)}
                onBlur={() => handleBlur('description')}
                disabled={isSubmitting}
                rows={4}
                className={`w-full px-3 py-2 bg-background border ${getFieldBorderClass('description')} rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none disabled:opacity-50`}
              />
            </div>
            {touched?.description && errors?.description && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.description}
              </p>
            )}
            {touched?.description && !errors?.description && validFields?.description && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />
                Description is valid
              </p>
            )}
          </div>

          {/* Rule Conditions Section */}
          <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Icon name="Filter" size={20} className="text-primary" />
                Rule Conditions
                <span className="text-xs font-normal text-muted-foreground">({ruleConditions?.length})</span>
              </h3>
              {ruleConditions?.length > 1 && (
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1">
                  <span className="text-xs text-muted-foreground">Logic:</span>
                  <button
                    type="button"
                    onClick={() => setConditionLogic(conditionLogic === 'AND' ? 'OR' : 'AND')}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    {conditionLogic}
                  </button>
                </div>
              )}
            </div>

            {/* Condition Builder */}
            <div className="space-y-3">
              {ruleConditions?.map((condition, index) => (
                <div key={condition?.id} className="bg-background border border-border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Condition {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconName="Trash2"
                      onClick={() => removeCondition(condition?.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Field Dropdown */}
                    <div>
                      <Select
                        label="Field"
                        placeholder="Select field"
                        options={fieldOptions}
                        value={condition?.field}
                        onChange={(value) => updateCondition(condition?.id, 'field', value)}
                        required
                      />
                    </div>

                    {/* Operator Dropdown */}
                    <div>
                      <Select
                        label="Operator"
                        placeholder="Select operator"
                        options={operatorOptions}
                        value={condition?.operator}
                        onChange={(value) => updateCondition(condition?.id, 'operator', value)}
                        required
                      />
                    </div>

                    {/* Value Input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter value"
                        value={condition?.value}
                        onChange={(e) => updateCondition(condition?.id, 'value', e?.target?.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                    </div>
                  </div>

                  {index < ruleConditions?.length - 1 && (
                    <div className="flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {conditionLogic}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Display Added Conditions as Cards */}
            {ruleConditions?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 mb-2">Active Conditions:</p>
                <div className="space-y-2">
                  {ruleConditions?.map((condition, index) => (
                    <div key={condition?.id} className="flex items-center justify-between bg-white rounded p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {fieldOptions?.find(f => f?.value === condition?.field)?.label || condition?.field}
                        </span>
                        <span className="text-muted-foreground">
                          {operatorOptions?.find(o => o?.value === condition?.operator)?.label || condition?.operator}
                        </span>
                        <span className="font-medium text-primary">{condition?.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editCondition(condition?.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Icon name="Edit" size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCondition(condition?.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Condition Button */}
            <Button
              type="button"
              variant="outline"
              fullWidth
              iconName="Plus"
              iconPosition="left"
              onClick={addCondition}
              disabled={isSubmitting}
            >
              Add Condition
            </Button>

            {ruleConditions?.length === 0 && (
              <div className="text-center py-4">
                <Icon name="AlertCircle" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conditions added yet. Click "Add Condition" to start.</p>
              </div>
            )}
          </div>

          {/* Helper Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="Info" size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Workflow:</p>
              <p>1. Fill rule details → 2. Add conditions → 3. Simulate rule → 4. Save rule → 5. Submit for approval</p>
            </div>
          </div>

          {/* Simulation Panel */}
          {showSimulationPanel && (
            <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Icon name="Play" size={20} className="text-primary" />
                  Rule Simulation
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowSimulationPanel(false)}
                />
              </div>

              {!simulationResults && (
                <div className="text-center py-6">
                  <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Click "Simulate Rule" to test against sample data</p>
                </div>
              )}

              {simulationResults && (
                <div className="space-y-4">
                  {/* Simulation Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-background border border-border rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-foreground">{simulationResults?.matched_count || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Matched</p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-foreground">{simulationResults?.total_count || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Records</p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{simulationResults?.match_percentage || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Match Rate</p>
                    </div>
                  </div>

                  {/* Sample Matches */}
                  {simulationResults?.sample_matches?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Sample Matched Records:</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {simulationResults?.sample_matches?.map((record, index) => (
                          <div key={index} className="bg-background border border-border rounded p-3 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground">Account:</span>
                                <span className="ml-2 text-foreground font-medium">{record?.account_number}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Balance:</span>
                                <span className="ml-2 text-foreground font-medium">${record?.account_balance?.toLocaleString()}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="ml-2 text-foreground">{record?.account_holder_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Country:</span>
                                <span className="ml-2 text-foreground">{record?.country_code}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <span className="ml-2 text-foreground">{record?.customer_type}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {simulationResults?.matched_count === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">No records matched the rule conditions. Please review your conditions.</p>
                    </div>
                  )}

                  {simulationResults?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-600" />
                      <p className="text-xs text-green-700 font-medium">Simulation completed successfully</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                fullWidth
                iconName="Play"
                iconPosition="left"
                onClick={handleSimulateRule}
                loading={isSimulating}
                disabled={isSimulating || !ruleConditions || ruleConditions?.length === 0}
              >
                {isSimulating ? 'Simulating...' : hasSimulated ? 'Re-simulate Rule' : 'Simulate Rule'}
              </Button>
            </div>
          )}

          {!showSimulationPanel && (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              iconName="Play"
              iconPosition="left"
              onClick={() => setShowSimulationPanel(true)}
            >
              Open Simulation Panel
            </Button>
          )}

          {/* Submit Error */}
          {errors?.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errors?.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border bg-muted/30 p-4 md:p-6 transition-colors">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              fullWidth
              iconName={selectedRule ? 'Save' : 'Plus'}
              iconPosition="left"
              loading={isSubmitting}
              disabled={!hasSimulated || isSubmitting}
            >
              {selectedRule ? 'Update Rule' : 'Save Rule'}
            </Button>
          </div>
        </>
      )}
    </form>
  );

  // Inline mode - render form without modal wrapper
  if (isInlineMode) {
    return formContent;
  }

  // Modal mode - render with modal wrapper
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[60] bg-green-500 text-white px-6 py-4 rounded-lg shadow-elevation-xl flex items-center gap-3 animate-in slide-in-from-top-5">
          <Icon name="CheckCircle" size={24} />
          <div>
            <p className="font-semibold">{selectedRule ? 'Rule Updated Successfully!' : 'Rule Created Successfully!'}</p>
            <p className="text-sm opacity-90">{selectedRule ? 'The rule has been updated.' : 'The new rule has been created.'}</p>
          </div>
        </div>
      )}
      <div className="bg-card rounded-lg border border-border shadow-elevation-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0 bg-card z-10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={selectedRule ? 'Edit' : 'Plus'} size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground transition-colors">
                {selectedRule ? 'Edit Rule' : 'Create New Rule'}
              </h2>
              <p className="text-sm text-muted-foreground transition-colors">
                {selectedRule ? 'Update rule details' : 'Define a new compliance rule'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
            disabled={isSubmitting}
          />
        </div>

        <div className="overflow-y-auto flex-1">
          {formContent}
        </div>
      </div>
    </div>
  );
};

export default CreateRuleModal;
