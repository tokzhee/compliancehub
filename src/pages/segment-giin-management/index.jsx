import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import CreateSegmentGiinModal from './components/CreateSegmentGiinModal';
import EditSegmentGiinModal from './components/EditSegmentGiinModal';
import ViewDetailsModal from './components/ViewDetailsModal';
import { segmentGiinService } from '../../services/segmentGiinService';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonGrid } from '../../components/ui/SkeletonLoader';
import { logActivity } from '../../services/activityService';


const SegmentGiinManagement = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission, refreshPermissions } = useUserContext();
  const { showToast } = useToast();

  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState('approve');
  const [permissionsRefreshing, setPermissionsRefreshing] = useState(false);

  // Force-refresh permissions on mount to ensure newly migrated permissions reflect immediately
  useEffect(() => {
    const doRefreshPermissions = async () => {
      setPermissionsRefreshing(true);
      try {
        const perms = await refreshPermissions();
        console.log(`SegmentGiinManagement: ✅ Permissions refreshed on load — ${perms?.length} permissions active`);
      } catch (err) {
        console.warn('SegmentGiinManagement: Permission refresh failed (non-critical):', err);
      } finally {
        setPermissionsRefreshing(false);
      }
    };
    doRefreshPermissions();
  }, []);

  useEffect(() => {
    if (!hasPermission('segment_giin.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    if (!user?.organizationId) {
      setLoading(false);
      setError('Unable to load configurations: Organization ID not found. Please refresh the page.');
      return;
    }

    fetchConfigurations();
  }, [user?.organizationId]);

  const fetchConfigurations = async () => {
    if (!user?.organizationId) {
      setLoading(false);
      setError('Unable to load configurations: Organization ID not found. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const configs = await segmentGiinService?.getSegmentGiinConfigurations(user?.organizationId);
      setConfigurations(configs);
    } catch (err) {
      console.error('Error fetching segment GIIN configurations:', err);
      setError('Failed to load segment GIIN configurations. Please try again.');
      showToast('Failed to load configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async (configData) => {
    try {
      const { data, error } = await segmentGiinService?.createSegmentGiinConfiguration({
        ...configData,
        organizationId: user?.organizationId,
        createdByUserId: user?.id
      });

      if (error) {
        showToast('Failed to create segment GIIN configuration. Please try again.', 'error');
        return;
      }

      await logActivity(
        user?.userId,
        user?.organizationId,
        'segment_giin_created',
        'segment_giin_management',
        {
          newConfigId: data?.id || null,
          segmentName: configData?.segmentName,
          giin: configData?.giin,
          entityName: configData?.entityName,
          contactPerson: configData?.contactPerson
        }
      );
      showToast('Segment GIIN configuration created successfully', 'success');
      await fetchConfigurations();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating segment GIIN configuration:', err);
      showToast('An error occurred while creating segment GIIN configuration.', 'error');
    }
  };

  const handleEditConfig = (config) => {
    setSelectedConfig(config);
    setIsEditModalOpen(true);
  };

  const handleUpdateConfig = async (configId, updates) => {
    try {
      const { error } = await segmentGiinService?.updateSegmentGiinConfiguration(configId, updates);

      if (error) {
        showToast('Failed to update segment GIIN configuration. Please try again.', 'error');
        return;
      }

      const existingConfig = configurations?.find(c => c?.id === configId);
      await logActivity(
        user?.userId,
        user?.organizationId,
        'segment_giin_updated',
        'segment_giin_management',
        {
          configId,
          segmentName: updates?.segmentName || existingConfig?.segmentName,
          giin: updates?.giin || existingConfig?.giin,
          entityName: updates?.entityName || existingConfig?.entityName,
          changedFields: Object.keys(updates)
        }
      );
      showToast('Segment GIIN configuration updated successfully', 'success');
      await fetchConfigurations();
      setIsEditModalOpen(false);
      setSelectedConfig(null);
    } catch (err) {
      console.error('Error updating segment GIIN configuration:', err);
      showToast('An error occurred while updating segment GIIN configuration.', 'error');
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!confirm('Are you sure you want to delete this segment GIIN configuration? This action cannot be undone.')) {
      return;
    }

    const configToDelete = configurations?.find(c => c?.id === configId);
    try {
      const { error } = await segmentGiinService?.deleteSegmentGiinConfiguration(configId);

      if (error) {
        showToast('Failed to delete segment GIIN configuration. Please try again.', 'error');
        return;
      }

      await logActivity(
        user?.userId,
        user?.organizationId,
        'segment_giin_deleted',
        'segment_giin_management',
        {
          deletedConfigId: configId,
          segmentName: configToDelete?.segmentName || null,
          giin: configToDelete?.giin || null,
          entityName: configToDelete?.entityName || null
        }
      );
      showToast('Segment GIIN configuration deleted successfully', 'success');
      await fetchConfigurations();
    } catch (err) {
      console.error('Error deleting segment GIIN configuration:', err);
      showToast('An error occurred while deleting segment GIIN configuration.', 'error');
    }
  };

  const handleSubmitForApproval = async (configId) => {
    const configToSubmit = configurations?.find(c => c?.id === configId);
    try {
      const { error } = await segmentGiinService?.submitForApproval(configId);

      if (error) {
        showToast('Failed to submit for approval. Please try again.', 'error');
        return;
      }

      await logActivity(
        user?.userId,
        user?.organizationId,
        'segment_giin_submitted_for_approval',
        'segment_giin_management',
        {
          configId,
          segmentName: configToSubmit?.segmentName || null,
          giin: configToSubmit?.giin || null,
          entityName: configToSubmit?.entityName || null,
          previousApprovalStatus: configToSubmit?.approvalStatus || 'draft'
        }
      );
      showToast('Configuration submitted for approval successfully', 'success');
      await fetchConfigurations();
    } catch (err) {
      console.error('Error submitting for approval:', err);
      showToast('An error occurred while submitting for approval.', 'error');
    }
  };

  const handleApprove = (config) => {
    setSelectedConfig(config);
    setApprovalActionType('approve');
    setIsApprovalModalOpen(true);
  };

  const handleReject = (config) => {
    setSelectedConfig(config);
    setApprovalActionType('reject');
    setIsApprovalModalOpen(true);
  };

  const handleApproveConfig = async (configId, comments) => {
    try {
      const { error } = await segmentGiinService?.approveConfiguration(
        configId,
        user?.id,
        comments
      );

      if (error) {
        if (error?.message?.includes('cannot approve their own')) {
          showToast('You cannot approve your own submission. Maker-checker separation required.', 'error');
        } else {
          showToast('Failed to approve configuration. Please try again.', 'error');
        }
        return;
      }

      await logActivity(
        user?.userId,
        user?.organizationId,
        'segment_giin_approved',
        'segment_giin_management',
        {
          configId,
          segmentName: selectedConfig?.segmentName || null,
          giin: selectedConfig?.giin || null,
          entityName: selectedConfig?.entityName || null,
          approverUserId: user?.userId,
          approvalComments: comments || null
        }
      );
      showToast('Configuration approved successfully', 'success');
      await fetchConfigurations();
      setIsApprovalModalOpen(false);
    } catch (err) {
      console.error('Error approving configuration:', err);
      if (err?.message?.includes('cannot approve their own')) {
        showToast('You cannot approve your own submission. Maker-checker separation required.', 'error');
      } else {
        showToast('An error occurred while approving configuration.', 'error');
      }
    }
  };

  const handleRejectConfig = async (configId, comments) => {
    try {
      const { error } = await segmentGiinService?.rejectConfiguration(
        configId,
        user?.id,
        comments
      );

      if (error) {
        if (error?.message?.includes('cannot approve their own')) {
          showToast('You cannot reject your own submission. Maker-checker separation required.', 'error');
        } else {
          showToast('Failed to reject configuration. Please try again.', 'error');
        }
        return;
      }

      await logActivity(
        user?.userId,
        user?.organizationId,
        'segment_giin_rejected',
        'segment_giin_management',
        {
          configId,
          segmentName: selectedConfig?.segmentName || null,
          giin: selectedConfig?.giin || null,
          entityName: selectedConfig?.entityName || null,
          rejectorUserId: user?.userId,
          rejectionComments: comments || null
        }
      );
      showToast('Configuration rejected successfully', 'success');
      await fetchConfigurations();
      setIsApprovalModalOpen(false);
    } catch (err) {
      console.error('Error rejecting configuration:', err);
      if (err?.message?.includes('cannot approve their own')) {
        showToast('You cannot reject your own submission. Maker-checker separation required.', 'error');
      } else {
        showToast('An error occurred while rejecting configuration.', 'error');
      }
    }
  };

  const handleViewDetails = (config) => {
    setSelectedConfig(config);
    setIsViewModalOpen(true);
  };

  const filteredConfigurations = configurations?.filter(config => {
    const matchesSearch = config?.segmentName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         config?.giin?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         config?.entityName?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && config?.isActive) ||
                         (statusFilter === 'inactive' && !config?.isActive);
    return matchesSearch && matchesStatus;
  });

  const activeCount = configurations?.filter(c => c?.isActive)?.length || 0;
  const inactiveCount = configurations?.filter(c => !c?.isActive)?.length || 0;

  const getApprovalStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      pending_approval: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-300' }
    };

    const config = statusConfig?.[status] || statusConfig?.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const canApprove = (config) => {
    return hasPermission('segment_giin.approve') && 
           config?.approvalStatus === 'pending_approval' &&
           config?.createdByUserId !== user?.id;
  };

  const canSubmitForApproval = (config) => {
    return hasPermission('segment_giin.submit_for_approval') && 
           (config?.approvalStatus === 'draft' || config?.approvalStatus === 'rejected');
  };

  if (!hasPermission('segment_giin.view')) {
    return <AccessRestricted />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNavigation />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarExpanded ? 'ml-64' : 'ml-20'
      }`}>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <Breadcrumb />
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="typography-h2 mb-2">
                  Segment GIIN Management
                </h1>
                <p className="text-muted-foreground mt-1">Configure GIIN and entity details for business segments</p>
              </div>
              {hasPermission('segment_giin.create') && (
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Segment GIIN
                </Button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Configurations</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{configurations?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Building" size={24} className="text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Icon name="CheckCircle" size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{inactiveCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Icon name="XCircle" size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by segment name, GIIN, or entity name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e?.target?.value)}
                  className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Configurations Grid */}
            {loading ? (
              <SkeletonGrid count={3} />
            ) : error ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">Error Loading Configurations</p>
                <p className="text-muted-foreground text-sm mb-4">{error}</p>
                <Button onClick={fetchConfigurations} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredConfigurations?.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Icon name="Building" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">No Configurations Found</p>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery || statusFilter !== 'all' ?'Try adjusting your search or filters' :'Get started by creating your first segment GIIN configuration'}
                </p>
                {hasPermission('segment_giin.create') && !searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => setIsCreateModalOpen(true)} iconName="Plus">
                    Create Segment GIIN
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Segment Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">GIIN</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Person</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredConfigurations?.map((config) => (
                        <tr key={config?.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{config?.segmentName}</td>
                          <td className="px-4 py-3 text-sm text-foreground font-mono">{config?.giin}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{config?.entityName}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{config?.contactPerson}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              config?.isActive 
                                ? 'bg-green-100 text-green-800' :'bg-orange-100 text-orange-800'
                            }`}>
                              {config?.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                iconName="Eye"
                                onClick={() => handleViewDetails(config)}
                                className="text-primary hover:text-primary/80"
                              />
                              {hasPermission('segment_giin.edit') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  iconName="Edit"
                                  onClick={() => handleEditConfig(config)}
                                  className="text-primary hover:text-primary/80"
                                />
                              )}
                              {hasPermission('segment_giin.delete') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  iconName="Trash2"
                                  onClick={() => handleDeleteConfig(config?.id)}
                                  className="text-destructive hover:text-destructive/80"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateSegmentGiinModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateConfig={handleCreateConfig}
      />

      <EditSegmentGiinModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedConfig(null);
        }}
        config={selectedConfig}
        onUpdateConfig={handleUpdateConfig}
      />

      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedConfig(null);
        }}
        config={selectedConfig}
      />
    </div>
  );
};

export default SegmentGiinManagement;