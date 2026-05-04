import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ApprovalModal = ({ isOpen, onClose, onApprove, onReject, config, actionType }) => {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!comments?.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        await onApprove(config?.id, comments);
      } else {
        await onReject(config?.id, comments);
      }
      setComments('');
      onClose();
    } catch (error) {
      console.error('Error processing approval action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComments('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              actionType === 'approve' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Icon 
                name={actionType === 'approve' ? 'CheckCircle' : 'XCircle'} 
                className={`w-6 h-6 ${
                  actionType === 'approve' ? 'text-green-600' : 'text-red-600'
                }`} 
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {actionType === 'approve' ? 'Approve Configuration' : 'Reject Configuration'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Configuration Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Configuration Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Segment Name:</span>
                <span className="ml-2 font-medium text-gray-900">{config?.segmentName}</span>
              </div>
              <div>
                <span className="text-gray-500">GIIN:</span>
                <span className="ml-2 font-medium text-gray-900">{config?.giin}</span>
              </div>
              <div>
                <span className="text-gray-500">Entity Name:</span>
                <span className="ml-2 font-medium text-gray-900">{config?.entityName}</span>
              </div>
              <div>
                <span className="text-gray-500">Created By:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {config?.createdBy?.full_name || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {actionType === 'approve' ? 'Approval Comments' : 'Rejection Reason'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e?.target?.value)}
              placeholder={`Enter ${actionType === 'approve' ? 'approval comments' : 'rejection reason'}...`}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Please provide detailed comments for audit trail purposes.
            </p>
          </div>

          {/* Warning Message */}
          <div className={`flex items-start gap-3 p-4 rounded-lg ${
            actionType === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <Icon 
              name="AlertCircle" 
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                actionType === 'approve' ? 'text-green-600' : 'text-red-600'
              }`} 
            />
            <div className="text-sm">
              <p className={`font-medium ${
                actionType === 'approve' ? 'text-green-800' : 'text-red-800'
              }`}>
                {actionType === 'approve' ? 'Approval Confirmation' : 'Rejection Confirmation'}
              </p>
              <p className={`mt-1 ${
                actionType === 'approve' ? 'text-green-700' : 'text-red-700'
              }`}>
                {actionType === 'approve' ?'This action will approve the configuration and make it active for use in reporting.' :'This action will reject the configuration and send it back to the creator for revision.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={actionType === 'approve' ? 'primary' : 'danger'}
            onClick={handleSubmit}
            disabled={!comments?.trim() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icon name={actionType === 'approve' ? 'Check' : 'X'} className="w-4 h-4" />
                <span>{actionType === 'approve' ? 'Approve' : 'Reject'}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;