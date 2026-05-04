import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivateRuleModal = ({ isOpen, onClose, rule, onConfirm }) => {
  const [comments, setComments] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    
    setTimeout(() => {
      onConfirm(rule, comments);
      setIsActivating(false);
      setComments('');
    }, 1500);
  };

  if (!isOpen || !rule) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-md transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Activate Rule</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              Activating this rule will deactivate any currently active rule of the same type for the selected reporting year. This action requires approval and will be logged for audit purposes.
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

        <div className="p-4 md:p-6 space-y-4">
          <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Important Notice</p>
                <p className="text-sm text-muted-foreground">
                  Activating this rule will deactivate any currently active rule of the same type for the selected reporting year. This action requires approval and will be logged for audit purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Rule Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rule Name:</span>
                <span className="font-medium text-foreground">{rule?.ruleName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium text-foreground">{rule?.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium text-foreground">{rule?.ruleType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Effective Date:</span>
                <span className="font-medium text-foreground">{rule?.effectiveDate}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Approval Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e?.target?.value)}
              placeholder="Enter activation comments or notes..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 md:p-6 border-t border-border">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isActivating}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            fullWidth
            iconName="Power"
            iconPosition="left"
            loading={isActivating}
            onClick={handleActivate}
          >
            {isActivating ? 'Activating...' : 'Activate Rule'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivateRuleModal;