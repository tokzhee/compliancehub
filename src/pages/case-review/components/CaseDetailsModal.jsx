import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CaseDetailsModal = ({ caseData, onClose, onAddComment, onOverride }) => {
  const [activeTab, setActiveTab] = useState('customer');

  if (!caseData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'customer', label: 'Customer Information', icon: 'User' },
    { id: 'account', label: 'Account Details', icon: 'CreditCard' },
    { id: 'tax', label: 'Tax Information', icon: 'FileText' },
    { id: 'fatca', label: 'FATCA/CRS Classification', icon: 'Shield' },
    { id: 'regulatory', label: 'Regulatory Details', icon: 'AlertCircle' },
    { id: 'enrichment', label: 'Enrichment Data', icon: 'Database' },
    { id: 'history', label: 'Case History', icon: 'History' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'customer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Customer Name</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.accountHolder || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Customer ID</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.customerId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Customer Type</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.customerType || 'Individual'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Contact Email</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.contactEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Contact Phone</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.contactPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Address</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">City</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Country</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.country || 'N/A'}</p>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Account Number</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Account Type</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.accountType || 'Savings'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Account Balance</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatCurrency(caseData?.accountBalance)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Account Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.accountStatus || 'Active'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Opening Date</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatDate(caseData?.openingDate)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Currency</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.currency || 'USD'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Branch Code</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.branchCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Product Code</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.productCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        );

      case 'tax':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Tax Identification Number (TIN)</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.taxId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Tax Residency</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.taxResidency || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Country Code</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.country || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Secondary Tax Residency</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.secondaryTaxResidency || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">TIN Issuing Country</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.tinIssuingCountry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">TIN Type</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.tinType || 'N/A'}</p>
              </div>
            </div>
          </div>
        );

      case 'fatca':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">W9 Form Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.w9FormStatus || 'Not Submitted'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">W8 Form Type</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.w8FormType || 'Not Applicable'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Recalcitrant Customer</p>
                <p className={`text-sm md:text-base font-medium mt-1 ${caseData?.recalcitrantCustomer ? 'text-error' : 'text-success'}`}>
                  {caseData?.recalcitrantCustomer ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">US Person Indicator</p>
                <p className={`text-sm md:text-base font-medium mt-1 ${caseData?.usPersonIndicator ? 'text-warning' : 'text-foreground'}`}>
                  {caseData?.usPersonIndicator ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">GIIN</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.giin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Chapter 3 Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.chapter3Status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Chapter 4 Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.chapter4Status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Documentation Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.documentationStatus || 'Pending'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Certification Date</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatDate(caseData?.certificationDate)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Self Certification</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.selfCertificationFlag ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        );

      case 'regulatory':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Regime Applicability</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.regimeApplicability || 'FATCA'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Reportable Status</p>
                <p className={`text-sm md:text-base font-medium mt-1 ${caseData?.isReportable ? 'text-error' : 'text-success'}`}>
                  {caseData?.isReportable ? 'Reportable' : 'Non-Reportable'}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Indicia Found</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.indiciaFound || 'None'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Classification Rules Applied</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.classificationRulesApplied || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Entity Classification</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.entityClassification || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Controlling Persons</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.controllingPersons || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Risk Rating</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.riskRating || 'Medium'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.complianceScore || 'N/A'}</p>
              </div>
            </div>
          </div>
        );

      case 'enrichment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Business Enrichment Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.enrichmentStatus || 'Not Enriched'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Enrichment Date</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatDate(caseData?.enrichmentDate)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Data Completeness</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.completenessStatus || 'Complete'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Additional Data Collected</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.additionalDataCollected || 'None'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Enriched By</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.enrichedBy || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Validation Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.validationStatus || 'Pending'}</p>
              </div>
            </div>

            {/* Rule Application Results */}
            {caseData?.ruleResults && caseData?.ruleResults?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Rule Application Results</h4>
                <div className="space-y-3">
                  {caseData?.ruleResults?.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
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
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Case Status</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.reviewStatus || 'Pending'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Priority</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.priority || 'Medium'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Assigned To</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{caseData?.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Review Deadline</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatDate(caseData?.reviewDeadline)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Created At</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatDate(caseData?.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm md:text-base font-medium text-foreground mt-1">{formatDate(caseData?.updatedAt)}</p>
              </div>
            </div>

            {/* Review History Timeline */}
            {caseData?.reviewHistory && caseData?.reviewHistory?.length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Status Changes & Comments</h4>
                <div className="space-y-3">
                  {caseData?.reviewHistory?.map((entry, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-md">
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
                          <p className="text-xs md:text-sm text-foreground mt-2 p-2 bg-background rounded">{entry?.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="History" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No review history available</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Case Details</h2>
            <p className="text-sm text-muted-foreground mt-1">Account: {caseData?.accountNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-base"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-border overflow-x-auto">
          <div className="flex px-4 md:px-6 min-w-max">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-base border-b-2 whitespace-nowrap ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                {tab?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="bg-muted/50 rounded-lg p-4 md:p-6">
            {renderTabContent()}
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

export default CaseDetailsModal;