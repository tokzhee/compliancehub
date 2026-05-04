import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RetireRuleModal = ({ isOpen, onClose, onConfirm, rule }) => {
  const [retirementReason, setRetirementReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !rule) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    // Validate retirement reason
    if (!retirementReason?.trim()) {
      setError('Retirement reason is required');
      return;
    }

    if (retirementReason?.trim()?.length < 10) {
      setError('Please provide a more detailed retirement reason (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(rule?.id, retirementReason?.trim());
      setRetirementReason('');
      setError(null);
      onClose();
    } catch (err) {
      console.error('Error retiring rule:', err);
      setError(err?.message || 'Failed to retire rule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRetirementReason('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Retire Rule</h2>
              <p className="text-orange-100 text-sm mt-0.5">Soft-delete with audit trail preservation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Rule Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Rule Details</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 min-w-[100px]">Rule Name:</span>
                <span className="text-sm font-medium text-gray-900">{rule?.ruleName}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 min-w-[100px]">Description:</span>
                <span className="text-sm text-gray-700">{rule?.description || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 min-w-[100px]">Segment:</span>
                <span className="text-sm text-gray-700">{rule?.segmentName}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 min-w-[100px]">Regime:</span>
                <span className="text-sm text-gray-700">{rule?.regimeType}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 min-w-[100px]">Year:</span>
                <span className="text-sm text-gray-700">{rule?.reportingYear}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 min-w-[100px]">Version:</span>
                <span className="text-sm text-gray-700">v{rule?.versionNumber}</span>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">Important: Retirement Confirmation</h4>
                <ul className="text-xs text-orange-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="flex-shrink-0 mt-0.5" />
                    <span>This rule will be marked as <strong>retired</strong> (soft-delete)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Complete <strong>audit trail will be preserved</strong> in version history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Retired rule will be <strong>excluded from simulations</strong> and approval workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Rule will remain <strong>visible in Rule History</strong> tab for compliance audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Retirement details (who, when, why) will be <strong>permanently recorded</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Retirement Reason Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Retirement Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={retirementReason}
                onChange={(e) => {
                  setRetirementReason(e?.target?.value);
                  setError(null);
                }}
                placeholder="Provide a detailed reason for retiring this rule (minimum 10 characters)..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                {retirementReason?.length} characters (minimum 10 required)
              </p>
            </div>

            {/* Inline Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
                <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting || !retirementReason?.trim() || retirementReason?.trim()?.length < 10}
            iconPosition="left"
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[160px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={16} />
                <span>Confirm Retirement</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RetireRuleModal;