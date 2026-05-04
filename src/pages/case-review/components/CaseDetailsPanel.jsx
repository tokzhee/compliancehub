import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CaseDetailsPanel = ({ caseData, onClose, onAddComment, onOverride }) => {
  if (!caseData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Case Details</h2>
            <p className="text-sm text-muted-foreground mt-1">Account: {caseData?.accountNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-base"
            aria-label="Close panel"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Account Information */}
          <div className="bg-muted/50 rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="User" size={20} />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Account Holder</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.accountHolder}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Account Number</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Account Balance</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatCurrency(caseData?.accountBalance)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Country</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.country}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Tax ID</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.taxId}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Reportability Status</p>
                <p className={`text-sm md:text-base font-medium mt-1 ${caseData?.isReportable ? 'text-error' : 'text-success'}`}>
                  {caseData?.isReportable ? 'Reportable' : 'Non-Reportable'}
                </p>
              </div>
            </div>
          </div>

          {/* Rule Application Results */}
          <div className="bg-muted/50 rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Rule Application Results
            </h3>
            <div className="space-y-3">
              {caseData?.ruleResults?.map((rule, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-md">
                  <Icon 
                    name={rule?.passed ? "CheckCircle" : "XCircle"} 
                    size={20} 
                    className={rule?.passed ? "text-success" : "text-error"}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{rule?.ruleName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rule?.description}</p>
                    {rule?.details && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{rule?.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review History */}
          <div className="bg-muted/50 rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="History" size={20} />
              Review History
            </h3>
            <div className="space-y-3">
              {caseData?.reviewHistory?.map((entry, index) => (
                <div key={index} className="flex gap-3 p-3 bg-background rounded-md">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{entry?.reviewer}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry?.timestamp)}</p>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">{entry?.action}</p>
                    {entry?.comment && (
                      <p className="text-xs md:text-sm text-foreground mt-2 p-2 bg-muted rounded">{entry?.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-border">
          <Button
            variant="outline"
            iconName="MessageSquare"
            iconPosition="left"
            onClick={onAddComment}
            className="flex-1"
          >
            Add Comment
          </Button>
          <Button
            variant="warning"
            iconName="AlertTriangle"
            iconPosition="left"
            onClick={onOverride}
            className="flex-1"
          >
            Override Decision
          </Button>
          <Button
            variant="default"
            iconName="CheckCircle"
            iconPosition="left"
            className="flex-1"
          >
            Mark as Resolved
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsPanel;