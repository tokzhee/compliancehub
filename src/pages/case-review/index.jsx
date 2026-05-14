import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonTable } from '../../components/ui/SkeletonLoader';


import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import CaseFilters from './components/CaseFilters';
import CasesTable from './components/CasesTable';

import AddCommentModal from './components/AddCommentModal';
import OverrideDecisionModal from './components/OverrideDecisionModal';
import AssignCaseModal from './components/AssignCaseModal';
import { caseService } from '../../services/caseService';
import CaseDetailsModal from './components/CaseDetailsModal';
import { logActivity } from '../../services/activityService';


const CaseReview = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission, refreshPermissions } = useUserContext();

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    reportability: '',
    assignee: '',
    deadlineFrom: '',
    deadlineTo: ''
  });

  const [selectedCases, setSelectedCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionsRefreshing, setPermissionsRefreshing] = useState(false);

  // Force-refresh permissions on mount to ensure newly migrated permissions reflect immediately
  useEffect(() => {
    const doRefreshPermissions = async () => {
      setPermissionsRefreshing(true);
      try {
        const perms = await refreshPermissions();
        console.log(`CaseReview: ✅ Permissions refreshed on load — ${perms?.length} permissions active`);
      } catch (err) {
        console.warn('CaseReview: Permission refresh failed (non-critical):', err);
      } finally {
        setPermissionsRefreshing(false);
      }
    };
    doRefreshPermissions();
  }, []);

  useEffect(() => {
    if (!hasPermission('cases.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    const fetchCases = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedCases = await caseService?.getCases(user?.organizationId, filters);
        setCases(fetchedCases);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError('Failed to load cases. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [user?.organizationId, filters?.status, filters?.reportability, filters?.assignee, filters?.search]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      reportability: '',
      assignee: '',
      deadlineFrom: '',
      deadlineTo: ''
    });
  };

  const handleSelectCase = (caseItem) => {
    setSelectedCases(prev => {
      const exists = prev?.some(c => c?.id === caseItem?.id);
      if (exists) {
        return prev?.filter(c => c?.id !== caseItem?.id);
      }
      return [...prev, caseItem];
    });
  };

  const handleSelectAll = () => {
    if (selectedCases?.length === cases?.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases([...cases]);
    }
  };

  const handleReviewCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowDetailsPanel(true);
  };

  const handleAddComment = (caseItem) => {
    setSelectedCase(caseItem);
    setShowCommentModal(true);
  };

  const handleOverride = (caseItem) => {
    setSelectedCase(caseItem);
    setShowOverrideModal(true);
  };

  const handleSubmitComment = (commentData) => {
    console.log('Comment submitted:', commentData);
    // In real app: INSERT into case_comments table
    // Then log to user_activity_log
    logActivity(
      user?.userId,
      user?.organizationId,
      'case_comment_added',
      `Comment added to case${selectedCase?.id ? ` #${selectedCase?.id}` : ''}`,
      {
        caseId: selectedCase?.id || null,
        caseCustomerName: selectedCase?.customerName || selectedCase?.customer_name || null,
        commentType: commentData?.commentType || null,
        commentLength: commentData?.comment?.length || 0
      }
    );
  };

  const handleSubmitOverride = (overrideData) => {
    console.log('Override submitted:', overrideData);
    // In real app: INSERT into overrides table
    // Then log to user_activity_log
    logActivity(
      user?.userId,
      user?.organizationId,
      'case_override_submitted',
      `Override decision submitted for case${selectedCase?.id ? ` #${selectedCase?.id}` : ''}`,
      {
        caseId: selectedCase?.id || null,
        caseCustomerName: selectedCase?.customerName || selectedCase?.customer_name || null,
        overrideDecision: overrideData?.decision || null,
        overrideReason: overrideData?.reason || null,
        previousStatus: selectedCase?.reviewStatus || null
      }
    );
  };

  const handleAssignCases = (assignmentData) => {
    try {
      console.log('Cases assigned:', assignmentData);
      // In real app: UPDATE fatca_results.assigned_to
      // Then log to user_activity_log
      const caseCount = assignmentData?.caseIds?.length || 0;
      logActivity(
        user?.userId,
        user?.organizationId,
        'cases_assigned',
        `${caseCount} case${caseCount !== 1 ? 's' : ''} assigned to ${assignmentData?.assigneeId || 'user'}`,
        {
          caseIds: assignmentData?.caseIds || [],
          affectedCaseCount: caseCount,
          assigneeId: assignmentData?.assigneeId || null,
          assigneeName: assignmentData?.assigneeName || null
        }
      );

      toast?.success(`${caseCount} case${caseCount !== 1 ? 's' : ''} assigned successfully`);
      
      setSelectedCases([]);
    } catch (error) {
      console.error('Assignment error:', error);
      toast?.error('Failed to assign cases. Please try again.');
    }
  };

  const handleBulkStatusUpdate = (newStatus) => {
    try {
      console.log('Bulk status update:', { cases: selectedCases, newStatus });
      // In real app: UPDATE fatca_results.review_status
      // Then log to user_activity_log
      const caseCount = selectedCases?.length || 0;
      logActivity(
        user?.userId,
        user?.organizationId,
        'cases_status_updated',
        `${caseCount} case${caseCount !== 1 ? 's' : ''} status updated to "${newStatus}"`,
        {
          caseIds: selectedCases?.map(c => c?.id) || [],
          affectedCaseCount: caseCount,
          previousStatuses: selectedCases?.map(c => ({ id: c?.id, status: c?.reviewStatus })) || [],
          newStatus
        }
      );

      toast?.success(`${caseCount} case${caseCount !== 1 ? 's' : ''} updated to ${newStatus}`);
      
      setSelectedCases([]);
    } catch (error) {
      console.error('Status update error:', error);
      toast?.error('Failed to update case status. Please try again.');
    }
  };

  const stats = {
    total: cases?.length,
    pending: cases?.filter(c => c?.reviewStatus === 'Pending')?.length,
    inProgress: cases?.filter(c => c?.reviewStatus === 'In Progress')?.length,
    highPriority: cases?.filter(c => c?.priority === 'High')?.length,
    unassigned: cases?.filter(c => !c?.assignedTo)?.length
  };

  return (
    <>
      <Helmet>
        <title>Case Review - ComplianceHub</title>
        <meta name="description" content="Review and manage FATCA compliance cases with comprehensive analysis and audit trails" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <SidebarNavigation />

        <main
          className={`transition-all duration-250 ease-out ${
            isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          <div className="p-4 md:p-6 lg:p-8">
            <Breadcrumb />
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="typography-h1 mb-2">
                    Case Review
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Review and manage FATCA compliance cases requiring attention
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-xs font-medium text-blue-700">Organization:</span>
                      <span className="text-xs font-semibold text-blue-900">{user?.branding?.organizationName || 'ComplianceHub'}</span>
                    </div>
                    {user?.roleName && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                        <span className="text-xs font-medium text-purple-700">Role:</span>
                        <span className="text-xs font-semibold text-purple-900">{user?.roleName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    iconName="Download"
                    iconPosition="left"
                  >
                    Export Cases
                  </Button>
                  <Button
                    variant="default"
                    iconName="RefreshCw"
                    iconPosition="left"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon name="Inbox" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="typography-h3 text-foreground">{stats?.total}</p>
                    <p className="typography-caption text-muted-foreground">Total Cases</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
                    <Icon name="Clock" size={20} className="text-warning" />
                  </div>
                  <div>
                    <p className="typography-h3 text-foreground">{stats?.pending}</p>
                    <p className="typography-caption text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon name="Activity" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="typography-h3 text-foreground">{stats?.inProgress}</p>
                    <p className="typography-caption text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-error/10 flex items-center justify-center">
                    <Icon name="AlertCircle" size={20} className="text-error" />
                  </div>
                  <div>
                    <p className="typography-h3 text-foreground">{stats?.highPriority}</p>
                    <p className="typography-caption text-muted-foreground">High Priority</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <Icon name="UserX" size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="typography-h3 text-foreground">{stats?.unassigned}</p>
                    <p className="typography-caption text-muted-foreground">Unassigned</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <CaseFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>

            {/* Bulk Actions */}
            {selectedCases?.length > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckSquare" size={20} className="text-primary" />
                    <p className="typography-label text-foreground">
                      {selectedCases?.length} case{selectedCases?.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="UserPlus"
                      onClick={() => setShowAssignModal(true)}
                    >
                      Assign Cases
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="CheckCircle"
                      onClick={() => handleBulkStatusUpdate('In Progress')}
                    >
                      Mark In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="X"
                      onClick={() => setSelectedCases([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cases Table */}
            <div className="bg-card rounded-lg shadow-elevation-sm border border-border overflow-hidden">
              {!hasPermission('cases.view') ? (
                <AccessRestricted
                  title="Case Data Access Restricted"
                  reason="You don't have permission to view case data. Contact your administrator to request 'cases.view' permission."
                  className="min-h-[400px]"
                />
              ) : loading ? (
                <SkeletonTable rows={10} columns={8} />
              ) : error ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                  <Icon name="alert-circle" className="w-12 h-12 text-error mx-auto mb-4" />
                  <p className="text-foreground font-medium">{error}</p>
                </div>
              ) : cases?.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                  <Icon name="briefcase" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium">No cases found</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Cases will appear here once datasets are processed
                  </p>
                </div>
              ) : (
                <div className="fade-in">
                  <CasesTable
                    cases={cases}
                    selectedCases={selectedCases}
                    onSelectCase={handleSelectCase}
                    onSelectAll={handleSelectAll}
                    onReviewCase={handleReviewCase}
                    onAddComment={(caseItem) => {
                      setSelectedCase(caseItem);
                      setShowCommentModal(true);
                    }}
                    onOverride={(caseItem) => {
                      setSelectedCase(caseItem);
                      setShowOverrideModal(true);
                    }}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modals and Panels */}
        {showDetailsPanel && (
          <CaseDetailsModal
            caseData={selectedCase}
            onClose={() => setShowDetailsPanel(false)}
            onAddComment={() => {
              setShowDetailsPanel(false);
              setShowCommentModal(true);
            }}
            onOverride={() => {
              setShowDetailsPanel(false);
              setShowOverrideModal(true);
            }}
          />
        )}

        <AddCommentModal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleSubmitComment}
          caseData={selectedCase}
        />

        <OverrideDecisionModal
          isOpen={showOverrideModal}
          onClose={() => setShowOverrideModal(false)}
          onSubmit={handleSubmitOverride}
          caseData={selectedCase}
        />

        <AssignCaseModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSubmit={handleAssignCases}
          selectedCases={selectedCases}
        />
      </div>
    </>
  );
};

export default CaseReview;