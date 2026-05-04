import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { fatcaCrsRuleService } from '../../../services/fatcaCrsRuleService';

const VersionHistoryModal = ({ isOpen, onClose, rule }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && rule) {
      fetchVersionHistory();
    }
  }, [isOpen, rule]);

  const fetchVersionHistory = async () => {
    if (!rule) return;

    try {
      setLoading(true);
      const history = await fatcaCrsRuleService?.getVersionHistory(
        rule?.organizationId,
        rule?.segmentId,
        rule?.regimeType,
        rule?.reportingYear,
        rule?.ruleName
      );
      setVersions(history);
    } catch (err) {
      console.error('Error fetching version history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Draft' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
      locked: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Locked' }
    };

    const config = statusConfig?.[status] || statusConfig?.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  if (!isOpen || !rule) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Version History</h2>
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

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="Loader2" className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : versions?.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Icon name="AlertCircle" className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No version history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions?.map((version, index) => (
                <div
                  key={version?.id}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-base"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-semibold text-foreground">
                          Version {version?.versionNumber}
                        </span>
                        {getStatusBadge(version?.status)}
                        {index === 0 && (
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created By:</span>
                          <span className="ml-2 font-medium text-foreground">{version?.createdBy}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created On:</span>
                          <span className="ml-2 font-medium text-foreground">{formatDate(version?.createdOn)}</span>
                        </div>
                        {version?.approvedBy && (
                          <>
                            <div>
                              <span className="text-muted-foreground">Approved By:</span>
                              <span className="ml-2 font-medium text-foreground">{version?.approvedBy}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Approved On:</span>
                              <span className="ml-2 font-medium text-foreground">{formatDate(version?.approvedOn)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-border mt-6">
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

export default VersionHistoryModal;
