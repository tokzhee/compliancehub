import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const OverrideDecisionModal = ({ isOpen, onClose, onSubmit, caseData }) => {
  const [overrideReason, setOverrideReason] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasonOptions = [
    { value: 'data_error', label: 'Data Quality Issue' },
    { value: 'rule_exception', label: 'Rule Exception Applies' },
    { value: 'manual_review', label: 'Manual Review Required' },
    { value: 'regulatory_guidance', label: 'Regulatory Guidance Update' },
    { value: 'customer_documentation', label: 'Additional Customer Documentation' },
    { value: 'other', label: 'Other (Specify in Justification)' }
  ];

  const decisionOptions = [
    { value: 'reportable', label: 'Mark as Reportable' },
    { value: 'non_reportable', label: 'Mark as Non-Reportable' },
    { value: 'escalate', label: 'Escalate for Senior Review' }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!overrideReason || !newDecision || !justification?.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit({
      caseId: caseData?.id,
      overrideReason,
      newDecision,
      justification: justification?.trim(),
      timestamp: new Date()?.toISOString()
    });

    setOverrideReason('');
    setNewDecision('');
    setJustification('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-md transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Override Decision</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              Case: {caseData?.accountNumber}
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

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Important Notice</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Override decisions create immutable audit trail entries without modifying original FATCA results. All overrides require detailed justification and are subject to compliance review.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Current Decision</p>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className={`text-sm font-medium ${caseData?.isReportable ? 'text-error' : 'text-success'}`}>
                {caseData?.isReportable ? 'Reportable' : 'Non-Reportable'}
              </p>
            </div>
          </div>

          <Select
            label="Override Reason"
            description="Select the primary reason for this override"
            required
            options={reasonOptions}
            value={overrideReason}
            onChange={setOverrideReason}
            placeholder="Choose a reason..."
          />

          <Select
            label="New Decision"
            description="Select the corrected decision for this case"
            required
            options={decisionOptions}
            value={newDecision}
            onChange={setNewDecision}
            placeholder="Choose new decision..."
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Detailed Justification <span className="text-error">*</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e?.target?.value)}
              placeholder="Provide detailed justification for this override decision. Include references to regulatory guidance, documentation reviewed, or specific circumstances..."
              required
              rows={6}
              className="w-full px-3 py-2 text-sm md:text-base border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Minimum 50 characters required. This justification will be permanently logged.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="warning"
              loading={isSubmitting}
              disabled={!overrideReason || !newDecision || !justification?.trim() || justification?.trim()?.length < 50}
              iconName="AlertTriangle"
              iconPosition="left"
              className="flex-1"
            >
              Submit Override
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverrideDecisionModal;