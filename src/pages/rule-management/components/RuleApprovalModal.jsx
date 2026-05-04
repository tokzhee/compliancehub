import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RuleApprovalModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  rule, 
  actionType, // 'approve' or 'reject'
  currentUserId 
}) => {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const isApprove = actionType === 'approve';
  const commentsRequired = actionType === 'reject';

  const handleSubmit = async () => {
    // Validation
    if (commentsRequired && !comments?.trim()) {
      setError('Comments are required for rejection');
      return;
    }

    // Maker-checker validation
    if (rule?.createdByUserId === currentUserId) {
      setError('You cannot approve your own rule. Maker-checker separation required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      await onConfirm(rule?.id, comments?.trim());
      handleClose();
    } catch (err) {
      console.error('Error processing approval action:', err);
      setError(err?.message || 'Failed to process approval action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComments('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isApprove ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Icon 
                name={isApprove ? 'CheckCircle' : 'XCircle'} 
                className={`w-6 h-6 ${
                  isApprove ? 'text-green-600' : 'text-red-600'
                }`} 
              />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {isApprove ? 'Approve Rule' : 'Reject Rule'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isSubmitting}
          >
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Rule Details */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Rule Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Rule Name:</span>
                <span className="ml-2 font-medium text-foreground">{rule?.ruleName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Regime:</span>
                <span className="ml-2 font-medium text-foreground">{rule?.regimeType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Segment:</span>
                <span className="ml-2 font-medium text-foreground">
                  {rule?.businessSegments?.segmentName || rule?.segmentName || '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Created By:</span>
                <span className="ml-2 font-medium text-foreground">
                  {rule?.createdByUser?.full_name || rule?.creator?.full_name || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Reporting Year:</span>
                <span className="ml-2 font-medium text-foreground">{rule?.reportingYear}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-2 font-medium text-foreground">v{rule?.versionNumber}</span>
              </div>
            </div>
            {rule?.description && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="text-sm text-foreground mt-1">{rule?.description}</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {isApprove ? 'Approval Comments (Optional)' : 'Rejection Reason'}
              {commentsRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => {
                setComments(e?.target?.value);
                setError(null);
              }}
              placeholder={`Enter ${isApprove ? 'approval comments' : 'rejection reason'}...`}
              rows={5}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-card text-foreground"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {isApprove 
                ? 'Optional: Provide comments for audit trail purposes.'
                : 'Required: Explain why this rule is being rejected.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Warning Message */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isApprove 
              ? 'bg-green-50 border-green-200' :'bg-red-50 border-red-200'
          }`}>
            <Icon 
              name="AlertCircle" 
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                isApprove ? 'text-green-600' : 'text-red-600'
              }`} 
            />
            <div className="text-sm">
              <p className={`font-medium ${
                isApprove ? 'text-green-800' : 'text-red-800'
              }`}>
                {isApprove ? 'Approval Confirmation' : 'Rejection Confirmation'}
              </p>
              <p className={`mt-1 ${
                isApprove ? 'text-green-700' : 'text-red-700'
              }`}>
                {isApprove 
                  ? 'This action will approve the rule and make it available for use in classification workflows.' 
                  : 'This action will reject the rule and send it back to the creator for revision.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'default' : 'outline'}
            onClick={handleSubmit}
            disabled={isSubmitting || (commentsRequired && !comments?.trim())}
            className={`min-w-[140px] ${
              isApprove 
                ? 'bg-green-600 hover:bg-green-700 text-white' :'border-red-600 text-red-600 hover:bg-red-50'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icon name={isApprove ? 'Check' : 'X'} className="w-4 h-4" />
                <span>{isApprove ? 'Approve Rule' : 'Reject Rule'}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RuleApprovalModal;