import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import RuleStatusBadge from './RuleStatusBadge';

const RuleHistoryModal = ({ isOpen, onClose, rule }) => {
  if (!isOpen || !rule) return null;

  const historyData = [
    {
      id: 1,
      version: '1.0',
      status: 'archived',
      effectiveDate: '01/15/2024',
      modifiedBy: 'John Smith',
      modifiedDate: '01/15/2024 10:30 AM',
      changes: 'Initial rule creation'
    },
    {
      id: 2,
      version: '1.1',
      status: 'archived',
      effectiveDate: '06/01/2024',
      modifiedBy: 'Sarah Mitchell',
      modifiedDate: '05/28/2024 02:15 PM',
      changes: 'Updated threshold values for high-value accounts'
    },
    {
      id: 3,
      version: '2.0',
      status: 'active',
      effectiveDate: '01/01/2025',
      modifiedBy: 'Michael Chen',
      modifiedDate: '12/20/2024 09:45 AM',
      changes: 'Major revision: Added new classification criteria for entity types'
    },
    {
      id: 4,
      version: '2.1',
      status: 'pending_approval',
      effectiveDate: '07/01/2025',
      modifiedBy: 'Sarah Mitchell',
      modifiedDate: '02/15/2025 11:20 AM',
      changes: 'Updated reporting categories and validation rules'
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Rule History</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              Version History
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

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {historyData?.map((history, index) => (
              <div
                key={history?.id}
                className="bg-muted/30 rounded-lg border border-border p-4 hover:shadow-elevation-sm transition-base"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-foreground">
                        Version {history?.version}
                      </h3>
                      <RuleStatusBadge status={history?.status} />
                      {index === 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Icon name="Calendar" size={14} className="mr-1.5" />
                        <span>Effective: {history?.effectiveDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="User" size={14} className="mr-1.5" />
                        <span>{history?.modifiedBy}</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="Clock" size={14} className="mr-1.5" />
                        <span>{history?.modifiedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-background rounded-md p-3 border border-border">
                  <p className="text-sm text-foreground">{history?.changes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end p-4 md:p-6 border-t border-border sticky bottom-0 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RuleHistoryModal;