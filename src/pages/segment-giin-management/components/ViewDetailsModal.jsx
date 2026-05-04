import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ViewDetailsModal = ({ isOpen, onClose, config }) => {
  if (!isOpen || !config) return null;

  const getApprovalStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: 'FileText' },
      pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: 'Clock' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300', icon: 'CheckCircle' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-300', icon: 'XCircle' }
    };

    const statusInfo = statusConfig?.[status] || statusConfig?.draft;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo?.color}`}>
        <Icon name={statusInfo?.icon} size={14} />
        {statusInfo?.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Eye" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Segment GIIN Details</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
                Complete configuration information
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

        <div className="p-4 md:p-6 space-y-6">
          {/* Approval Status Section */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Shield" size={18} />
              Approval Status
            </h3>
            <div className="flex items-center gap-3">
              {getApprovalStatusBadge(config?.approvalStatus)}
            </div>
          </div>

          {/* Approval History Section */}
          {(config?.createdBy || config?.approvedBy || config?.submittedAt || config?.approvedAt) && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <Icon name="History" size={18} />
                Approval History
              </h3>
              
              <div className="space-y-3">
                {/* Created By */}
                {config?.createdBy && (
                  <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="UserPlus" size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Created by {config?.createdBy?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{config?.createdBy?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {config?.createdAt ? new Date(config?.createdAt)?.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submitted For Approval */}
                {config?.submittedAt && (
                  <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="Send" size={16} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Submitted for Approval</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(config?.submittedAt)?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Approved/Rejected By */}
                {config?.approvedBy && config?.approvedAt && (
                  <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      config?.approvalStatus === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Icon 
                        name={config?.approvalStatus === 'approved' ? 'CheckCircle' : 'XCircle'} 
                        size={16} 
                        className={config?.approvalStatus === 'approved' ? 'text-green-600' : 'text-red-600'} 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {config?.approvalStatus === 'approved' ? 'Approved' : 'Rejected'} by {config?.approvedBy?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{config?.approvedBy?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(config?.approvedAt)?.toLocaleString()}
                      </p>
                      {config?.approvalComments && (
                        <div className="mt-2 p-2 bg-background rounded border border-border">
                          <p className="text-xs font-medium text-foreground mb-1">Comments:</p>
                          <p className="text-xs text-muted-foreground">{config?.approvalComments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Segment Information */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Building" size={18} />
              Segment Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Segment Name</p>
                <p className="text-sm font-medium text-foreground">{config?.segmentName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  config?.isActive 
                    ? 'bg-green-100 text-green-800' :'bg-orange-100 text-orange-800'
                }`}>
                  {config?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">GIIN (Global Intermediary Identification Number)</p>
              <p className="text-sm font-medium text-foreground font-mono">{config?.giin}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Legal Entity Name</p>
              <p className="text-sm font-medium text-foreground">{config?.entityName}</p>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="MapPin" size={18} />
              Address Information
            </h3>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Address Line 1</p>
              <p className="text-sm font-medium text-foreground">{config?.addressLine1}</p>
            </div>

            {config?.addressLine2 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Address Line 2</p>
                <p className="text-sm font-medium text-foreground">{config?.addressLine2}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">City</p>
                <p className="text-sm font-medium text-foreground">{config?.city}</p>
              </div>
              {config?.state && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">State/Province</p>
                  <p className="text-sm font-medium text-foreground">{config?.state}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Postal Code</p>
                <p className="text-sm font-medium text-foreground">{config?.postalCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Country</p>
                <p className="text-sm font-medium text-foreground">{config?.country}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="User" size={18} />
              Contact Information
            </h3>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
              <p className="text-sm font-medium text-foreground">{config?.contactPerson}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Contact Email</p>
                <a href={`mailto:${config?.contactEmail}`} className="text-sm font-medium text-primary hover:underline">
                  {config?.contactEmail}
                </a>
              </div>
              {config?.contactPhone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact Phone</p>
                  <a href={`tel:${config?.contactPhone}`} className="text-sm font-medium text-primary hover:underline">
                    {config?.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Clock" size={18} />
              Metadata
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created At</p>
                <p className="text-sm font-medium text-foreground">
                  {config?.createdAt ? new Date(config?.createdAt)?.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm font-medium text-foreground">
                  {config?.updatedAt ? new Date(config?.updatedAt)?.toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
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

export default ViewDetailsModal;