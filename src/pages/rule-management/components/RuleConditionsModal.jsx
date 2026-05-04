import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { fatcaCrsRuleService } from '../../../services/fatcaCrsRuleService';

const RuleConditionsModal = ({ isOpen, onClose, rule }) => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [formData, setFormData] = useState({
    fieldName: '',
    operator: '',
    value: '',
    logicalGroup: 1,
    sequenceOrder: 1
  });

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not In' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' }
  ];

  useEffect(() => {
    if (isOpen && rule?.id) {
      fetchConditions();
    }
  }, [isOpen, rule?.id]);

  const fetchConditions = async () => {
    if (!rule?.id) return;

    try {
      setLoading(true);
      const fetchedConditions = await fatcaCrsRuleService?.getRuleConditions(rule?.id);
      setConditions(fetchedConditions);
    } catch (err) {
      console.error('Error fetching conditions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = async () => {
    if (!formData?.fieldName || !formData?.operator) {
      alert('Field name and operator are required');
      return;
    }

    try {
      const { error } = await fatcaCrsRuleService?.createRuleCondition({
        ruleSetId: rule?.id,
        fieldName: formData?.fieldName,
        operator: formData?.operator,
        value: formData?.value,
        logicalGroup: formData?.logicalGroup,
        sequenceOrder: conditions?.length + 1
      });

      if (error) {
        alert('Failed to add condition: ' + error?.message);
        return;
      }

      // Refresh conditions
      await fetchConditions();
      resetForm();
    } catch (err) {
      console.error('Error adding condition:', err);
      alert('Failed to add condition');
    }
  };

  const handleUpdateCondition = async () => {
    if (!editingCondition || !formData?.fieldName || !formData?.operator) {
      alert('Field name and operator are required');
      return;
    }

    try {
      const { error } = await fatcaCrsRuleService?.updateRuleCondition(editingCondition?.id, {
        field_name: formData?.fieldName,
        operator: formData?.operator,
        value: formData?.value,
        logical_group: formData?.logicalGroup
      });

      if (error) {
        alert('Failed to update condition: ' + error?.message);
        return;
      }

      // Refresh conditions
      await fetchConditions();
      resetForm();
      setEditingCondition(null);
    } catch (err) {
      console.error('Error updating condition:', err);
      alert('Failed to update condition');
    }
  };

  const handleDeleteCondition = async (conditionId) => {
    if (!confirm('Are you sure you want to delete this condition?')) {
      return;
    }

    try {
      const { error } = await fatcaCrsRuleService?.deleteRuleCondition(conditionId);

      if (error) {
        alert('Failed to delete condition: ' + error?.message);
        return;
      }

      // Refresh conditions
      await fetchConditions();
    } catch (err) {
      console.error('Error deleting condition:', err);
      alert('Failed to delete condition');
    }
  };

  const handleEditCondition = (condition) => {
    setEditingCondition(condition);
    setFormData({
      fieldName: condition?.fieldName,
      operator: condition?.operator,
      value: condition?.value,
      logicalGroup: condition?.logicalGroup,
      sequenceOrder: condition?.sequenceOrder
    });
  };

  const resetForm = () => {
    setFormData({
      fieldName: '',
      operator: '',
      value: '',
      logicalGroup: 1,
      sequenceOrder: 1
    });
    setEditingCondition(null);
  };

  const getLogicalGroupLabel = (group) => {
    return group === 1 ? 'AND' : 'OR';
  };

  if (!isOpen || !rule) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Rule Conditions</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">{rule?.ruleName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-all"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Add/Edit Condition Form */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {editingCondition ? 'Edit Condition' : 'Add New Condition'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Field Name"
                type="text"
                placeholder="e.g., account_balance, country_code"
                value={formData?.fieldName}
                onChange={(e) => setFormData(prev => ({ ...prev, fieldName: e?.target?.value }))}
                required
              />

              <Select
                label="Operator"
                placeholder="Select operator"
                options={operatorOptions}
                value={formData?.operator}
                onChange={(value) => setFormData(prev => ({ ...prev, operator: value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Value"
                type="text"
                placeholder="Enter value"
                value={formData?.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e?.target?.value }))}
              />

              <Select
                label="Logical Group (AND/OR)"
                placeholder="Select group"
                options={[
                  { value: 1, label: 'AND (Group 1)' },
                  { value: 2, label: 'OR (Group 2)' }
                ]}
                value={formData?.logicalGroup}
                onChange={(value) => setFormData(prev => ({ ...prev, logicalGroup: parseInt(value) }))}
              />
            </div>

            <div className="flex gap-3">
              {editingCondition ? (
                <>
                  <Button
                    variant="default"
                    iconName="Save"
                    iconPosition="left"
                    onClick={handleUpdateCondition}
                  >
                    Update Condition
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={handleAddCondition}
                >
                  Add Condition
                </Button>
              )}
            </div>
          </div>

          {/* Conditions List */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Existing Conditions</h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : conditions?.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <Icon name="AlertCircle" className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No conditions defined yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conditions?.map((condition, index) => (
                  <div
                    key={condition?.id}
                    className="bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-base"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                            #{condition?.sequenceOrder}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                            {getLogicalGroupLabel(condition?.logicalGroup)}
                          </span>
                        </div>
                        <div className="text-sm text-foreground">
                          <span className="font-medium">{condition?.fieldName}</span>
                          {' '}
                          <span className="text-primary font-semibold">{condition?.operator}</span>
                          {' '}
                          <span className="font-medium">"{condition?.value}"</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="Edit"
                          onClick={() => handleEditCondition(condition)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="Trash2"
                          onClick={() => handleDeleteCondition(condition?.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleConditionsModal;
