import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import CaseStatusBadge from './CaseStatusBadge';
import { GridSkeleton } from '../../../components/ui/SkeletonLoader';

const CasesTable = ({ 
  cases, 
  selectedCases, 
  onSelectCase, 
  onSelectAll, 
  onReviewCase, 
  onAddComment, 
  onOverride,
  loading = false
}) => {
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

  const isAllSelected = cases?.length > 0 && selectedCases?.length === cases?.length;
  const isSomeSelected = selectedCases?.length > 0 && selectedCases?.length < cases?.length;

  if (loading) {
    return <GridSkeleton rows={8} columns={9} />;
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={onSelectAll}
                  aria-label="Select all cases"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Account
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Holder
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reportable
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases?.map((caseItem) => (
              <tr 
                key={caseItem?.id}
                className="hover:bg-muted/30 transition-all duration-200 hover:shadow-sm"
              >
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedCases?.some(c => c?.id === caseItem?.id)}
                    onChange={() => onSelectCase(caseItem)}
                    aria-label={`Select case ${caseItem?.accountNumber}`}
                  />
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{caseItem?.accountNumber}</p>
                  <p className="text-xs text-muted-foreground">{caseItem?.country}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-foreground">{caseItem?.accountHolder}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(caseItem?.accountBalance)}</p>
                </td>
                <td className="px-4 py-4">
                  <CaseStatusBadge status={caseItem?.reviewStatus} priority={caseItem?.priority} />
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-foreground">{caseItem?.assignedTo || 'Unassigned'}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-foreground">{formatDate(caseItem?.reviewDeadline)}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${caseItem?.isReportable ? 'text-error' : 'text-success'}`}>
                    <Icon name={caseItem?.isReportable ? "AlertCircle" : "CheckCircle"} size={16} />
                    {caseItem?.isReportable ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={() => onReviewCase(caseItem)}
                      aria-label="Review case"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="MessageSquare"
                      onClick={() => onAddComment(caseItem)}
                      aria-label="Add comment"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="AlertTriangle"
                      onClick={() => onOverride(caseItem)}
                      aria-label="Override decision"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {cases?.map((caseItem) => (
          <div key={caseItem?.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <Checkbox
                checked={selectedCases?.some(c => c?.id === caseItem?.id)}
                onChange={() => onSelectCase(caseItem)}
                aria-label={`Select case ${caseItem?.accountNumber}`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{caseItem?.accountNumber}</p>
                    <p className="text-xs text-muted-foreground">{caseItem?.accountHolder}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${caseItem?.isReportable ? 'text-error' : 'text-success'}`}>
                    <Icon name={caseItem?.isReportable ? "AlertCircle" : "CheckCircle"} size={14} />
                    {caseItem?.isReportable ? 'Reportable' : 'Non-Reportable'}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-medium text-foreground">{formatCurrency(caseItem?.accountBalance)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Assigned To:</span>
                    <span className="text-foreground">{caseItem?.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="text-foreground">{formatDate(caseItem?.reviewDeadline)}</span>
                  </div>
                </div>

                <CaseStatusBadge status={caseItem?.reviewStatus} priority={caseItem?.priority} />

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye"
                    onClick={() => onReviewCase(caseItem)}
                    className="flex-1"
                  >
                    Review
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="MessageSquare"
                    onClick={() => onAddComment(caseItem)}
                    aria-label="Add comment"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="AlertTriangle"
                    onClick={() => onOverride(caseItem)}
                    aria-label="Override"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {cases?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
          <p className="text-base font-medium text-foreground mb-1">No cases found</p>
          <p className="text-sm text-muted-foreground text-center">
            Try adjusting your filters or check back later for new cases
          </p>
        </div>
      )}
    </div>
  );
};

export default CasesTable;