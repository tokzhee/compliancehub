import React from 'react';
import { X, ArrowRight, Plus, Minus, Edit3, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const RuleVersionComparisonModal = ({ isOpen, onClose, versionData }) => {
  if (!isOpen || !versionData) return null;

  const { changes, versionNumber, modifiedDate, changedBy, changeType } = versionData;
  const oldValues = changes?.old_values || {};
  const newValues = changes?.new_values || {};

  // Get all unique field names
  const allFields = new Set([
    ...Object.keys(oldValues),
    ...Object.keys(newValues)
  ]);

  // Field display names
  const fieldLabels = {
    rule_name: 'Rule Name',
    rule_type: 'Rule Type',
    regime: 'Regime',
    segment_id: 'Segment',
    description: 'Description',
    effective_date: 'Effective Date',
    expiry_date: 'Expiry Date',
    approval_status: 'Approval Status',
    conditions: 'Conditions',
    is_active: 'Active Status',
    retirement_date: 'Retirement Date',
    retirement_reason: 'Retirement Reason',
    retired_by_user_id: 'Retired By'
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value?.includes('T')) {
      // Try to format as date
      try {
        return new Date(value)?.toLocaleString();
      } catch {
        return value;
      }
    }
    return value;
  };

  // Render condition changes with highlighting
  const renderConditionChanges = () => {
    const oldConditions = oldValues?.conditions || [];
    const newConditions = newValues?.conditions || [];

    if (!Array.isArray(oldConditions) && !Array.isArray(newConditions)) {
      return null;
    }

    const added = [];
    const removed = [];
    const modified = [];

    // Find added and modified conditions
    newConditions?.forEach((newCond, idx) => {
      const matchingOld = oldConditions?.find(
        (oldCond) => oldCond?.field_name === newCond?.field_name
      );

      if (!matchingOld) {
        added?.push(newCond);
      } else if (JSON.stringify(matchingOld) !== JSON.stringify(newCond)) {
        modified?.push({ old: matchingOld, new: newCond });
      }
    });

    // Find removed conditions
    oldConditions?.forEach((oldCond) => {
      const matchingNew = newConditions?.find(
        (newCond) => newCond?.field_name === oldCond?.field_name
      );

      if (!matchingNew) {
        removed?.push(oldCond);
      }
    });

    return (
      <div className="space-y-3">
        {/* Added Conditions */}
        {added?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <Plus className="w-4 h-4" />
              <span>Added Conditions ({added?.length})</span>
            </div>
            {added?.map((cond, idx) => (
              <div
                key={idx}
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <div className="text-sm">
                  <span className="font-medium">{cond?.field_name}</span>
                  <span className="text-gray-600 mx-2">{cond?.operator}</span>
                  <span className="font-medium">{cond?.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Removed Conditions */}
        {removed?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700">
              <Minus className="w-4 h-4" />
              <span>Removed Conditions ({removed?.length})</span>
            </div>
            {removed?.map((cond, idx) => (
              <div
                key={idx}
                className="bg-red-50 border border-red-200 rounded-lg p-3 line-through"
              >
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{cond?.field_name}</span>
                  <span className="mx-2">{cond?.operator}</span>
                  <span className="font-medium">{cond?.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Modified Conditions */}
        {modified?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-700">
              <Edit3 className="w-4 h-4" />
              <span>Modified Conditions ({modified?.length})</span>
            </div>
            {modified?.map((change, idx) => (
              <div
                key={idx}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1 text-gray-600">
                    <span className="font-medium">{change?.old?.field_name}</span>
                    <span className="mx-2">{change?.old?.operator}</span>
                    <span className="font-medium">{change?.old?.value}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium">{change?.new?.field_name}</span>
                    <span className="mx-2">{change?.new?.operator}</span>
                    <span className="font-medium">{change?.new?.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {added?.length === 0 && removed?.length === 0 && modified?.length === 0 && (
          <div className="text-sm text-gray-500 italic">No condition changes</div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Version {versionNumber} Changes</h2>
            <p className="text-blue-100 text-sm mt-1">
              {new Date(modifiedDate)?.toLocaleString()} by {changedBy?.fullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Type Badge */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              changeType === 'created' ?'bg-green-100 text-green-800'
                : changeType === 'approved' ?'bg-blue-100 text-blue-800'
                : changeType === 'rejected' ?'bg-red-100 text-red-800'
                : changeType === 'submitted' ?'bg-purple-100 text-purple-800'
                : changeType === 'retired' ?'bg-orange-100 text-orange-800' :'bg-yellow-100 text-yellow-800'
            }`}
          >
            {changeType?.toUpperCase()}
          </span>
        </div>

        {/* Retirement Details (if applicable) */}
        {changeType === 'retired' && newValues?.retirement_reason && (
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-orange-800 mb-1">Rule Retired</h4>
                <p className="text-sm text-orange-700 mb-2">
                  <strong>Retired by:</strong> {changedBy?.fullName || 'Unknown'}
                </p>
                <p className="text-sm text-orange-700 mb-2">
                  <strong>Retirement Date:</strong> {new Date(newValues?.retirement_date)?.toLocaleString()}
                </p>
                <div className="bg-white border border-orange-200 rounded-lg p-3 mt-2">
                  <p className="text-xs font-medium text-orange-800 mb-1">Retirement Reason:</p>
                  <p className="text-sm text-orange-900">{newValues?.retirement_reason}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Field Changes */}
            {Array.from(allFields)?.filter((field) => field !== 'conditions')?.map((fieldName) => {
                const oldValue = oldValues?.[fieldName];
                const newValue = newValues?.[fieldName];
                const hasChanged =
                  JSON.stringify(oldValue) !== JSON.stringify(newValue);

                if (!hasChanged && changeType !== 'created') return null;

                return (
                  <div
                    key={fieldName}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      {fieldLabels?.[fieldName] || fieldName}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Old Value */}
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          Previous Value
                        </div>
                        <div
                          className={`bg-white rounded-lg p-3 border ${
                            hasChanged
                              ? 'border-red-200 bg-red-50' :'border-gray-200'
                          }`}
                        >
                          <div className="text-sm text-gray-700 break-words">
                            {formatValue(oldValue)}
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:flex items-center justify-center">
                        {hasChanged && (
                          <ArrowRight className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      {/* New Value */}
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          New Value
                        </div>
                        <div
                          className={`bg-white rounded-lg p-3 border ${
                            hasChanged
                              ? 'border-green-200 bg-green-50' :'border-gray-200'
                          }`}
                        >
                          <div className="text-sm text-gray-700 break-words">
                            {formatValue(newValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Condition Changes */}
            {(allFields?.has('conditions') || oldValues?.conditions || newValues?.conditions) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Conditions
                </div>
                {renderConditionChanges()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RuleVersionComparisonModal;