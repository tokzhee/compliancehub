import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';
import { useToast } from '../../../contexts/ToastContext';

const ApproveRuleModal = ({ isOpen, onClose, onConfirm, rule }) => {
  const toast = useToast();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      setShowSuccess(true);
      toast?.success('Rule approved successfully');
      setTimeout(() => {
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Approve rule error:', error);
      toast?.error('Failed to approve rule. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !rule) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Approve Rule</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
                You are about to approve this rule. Once approved, the rule status will change to "Approved" and can be locked for regulatory compliance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-all"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {showSuccess && (
            <div className="flex flex-col items-center justify-center py-8">
              <SuccessCheckmark size={80} />
              <p className="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">Rule Approved Successfully!</p>
            </div>
          )}
          {!showSuccess && (
            <>
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 mb-6 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground transition-colors">Rule Name:</span>
              <span className="text-sm font-medium text-foreground transition-colors">{rule?.rule_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground transition-colors">Segment:</span>
              <span className="text-sm font-medium text-foreground transition-colors">{rule?.segment_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground transition-colors">Reporting Year:</span>
              <span className="text-sm font-medium text-foreground transition-colors">{rule?.reporting_year}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground transition-colors">Version:</span>
              <span className="text-sm font-medium text-foreground transition-colors">v{rule?.version_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground transition-colors">Created By:</span>
              <span className="text-sm font-medium text-foreground transition-colors">{rule?.created_by}</span>
            </div>
          </div>
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg transition-colors">
              <div className="flex items-start gap-2">
                <Icon name="AlertTriangle" size={18} className="text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1 transition-colors">Important Notice</p>
                  <p className="text-xs text-muted-foreground transition-colors">
                    This is a sample important notice. Please read it carefully.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                fullWidth
                iconName="CheckCircle"
                iconPosition="left"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                Approve Rule
              </Button>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproveRuleModal;
