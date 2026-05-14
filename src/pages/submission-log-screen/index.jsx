import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';

import Button from '../../components/ui/Button';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import SubmissionsGrid from './components/SubmissionsGrid';
import SubmissionStatsPanel from './components/SubmissionStatsPanel';
import SubmissionDetailsModal from './components/SubmissionDetailsModal';
import ApprovalModal from './components/ApprovalModal';
import { submissionService } from '../../services/submissionService';
import RegimeToggle from '../business-enrichment-portal/components/RegimeToggle';
import Breadcrumb from '../../components/ui/Breadcrumb';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonGrid, SkeletonStatCard } from '../../components/ui/SkeletonLoader';
import { Icon } from '@iconify/react';
import { logActivity } from '../../services/activityService';


const SubmissionLogScreen = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();

  const [selectedRegime, setSelectedRegime] = useState('FATCA');
  const [submissions, setSubmissions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSubmissions: 0,
    successfulSubmissions: 0,
    pendingSubmissions: 0,
    errorSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [filters, setFilters] = useState({
    regimeType: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    if (!hasPermission('submissions.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch submissions
        const fetchedSubmissions = await submissionService?.getSubmissionLogs(
          user?.organizationId,
          { ...filters, regimeType: selectedRegime }
        );
        setSubmissions(fetchedSubmissions);

        // Fetch statistics
        const stats = await submissionService?.getSubmissionStatistics(
          user?.organizationId,
          selectedRegime
        );
        setStatistics(stats);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submission logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user?.organizationId, selectedRegime, filters]);

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleApproveSubmission = (submission) => {
    setSelectedSubmission(submission);
    setApprovalAction('approve');
    setShowApprovalModal(true);
  };

  const handleRejectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setApprovalAction('reject');
    setShowApprovalModal(true);
  };

  const handleSubmitForApproval = async (submission) => {
    if (!confirm('Submit this submission for approval?')) {
      return;
    }

    try {
      const { error } = await submissionService?.submitSubmissionForApproval(submission?.id);

      if (error) {
        alert('Failed to submit for approval: ' + error?.message);
        return;
      }

      alert('Submission submitted for approval successfully');

      // Log activity
      logActivity(
        user?.userId,
        user?.organizationId,
        'submission_submitted_for_approval',
        `Submission #${submission?.id} submitted for approval (${selectedRegime})`
      );

      // Refresh submissions
      const fetchedSubmissions = await submissionService?.getSubmissionLogs(
        user?.organizationId,
        { ...filters, regimeType: selectedRegime }
      );
      setSubmissions(fetchedSubmissions);
    } catch (err) {
      console.error('Error submitting for approval:', err);
      alert('Failed to submit for approval');
    }
  };

  const handleApprovalAction = async (submissionId, comments) => {
    try {
      if (approvalAction === 'approve') {
        const { error } = await submissionService?.approveSubmission(submissionId, user?.userId, comments);
        if (error) {
          alert(error?.message || 'Failed to approve submission');
          return;
        }
        alert('Submission approved successfully');

        // Log approval activity
        logActivity(
          user?.userId,
          user?.organizationId,
          'submission_approved',
          `Submission #${submissionId} approved (${selectedRegime})`
        );
      } else {
        const { error } = await submissionService?.rejectSubmission(submissionId, user?.userId, comments);
        if (error) {
          alert(error?.message || 'Failed to reject submission');
          return;
        }
        alert('Submission rejected successfully');

        // Log rejection activity
        logActivity(
          user?.userId,
          user?.organizationId,
          'submission_rejected',
          `Submission #${submissionId} rejected (${selectedRegime})`
        );
      }

      // Refresh submissions
      const fetchedSubmissions = await submissionService?.getSubmissionLogs(
        user?.organizationId,
        { ...filters, regimeType: selectedRegime }
      );
      setSubmissions(fetchedSubmissions);
    } catch (err) {
      console.error('Error processing approval action:', err);
      alert('Failed to process approval action');
    }
  };

  const handleDownloadResponse = async (submission) => {
    try {
      const { data, error } = await submissionService?.downloadAcknowledgment(submission?.id);
      
      if (error) {
        alert('Failed to download acknowledgment file.');
        return;
      }

      // Create download link
      const blob = new Blob([data?.acknowledgment_file], { type: 'application/xml' });
      const url = window?.URL?.createObjectURL(blob);
      const link = document?.createElement('a');
      link.href = url;
      link.download = `acknowledgment_${submission?.id}.xml`;
      link?.click();
      window?.URL?.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading response:', err);
      alert('Failed to download acknowledgment file.');
    }
  };

  const handleResubmit = async (submission) => {
    if (!confirm('Are you sure you want to resubmit this report?')) {
      return;
    }

    try {
      // Call resubmission API
      await submissionService?.initiateSubmission(
        submission?.report_batch_id,
        user?.userId,
        {
          fileId: submission?.file_id,
          channel: submission?.submission_channel,
          method: submission?.submission_method
        }
      );

      // Refresh submissions
      const fetchedSubmissions = await submissionService?.getSubmissionLogs(
        user?.organizationId,
        { ...filters, regimeType: selectedRegime }
      );
      setSubmissions(fetchedSubmissions);

      alert('Resubmission initiated successfully.');
    } catch (err) {
      console.error('Error resubmitting:', err);
      alert('Failed to resubmit. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      regimeType: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Submission Log - ComplianceHub</title>
      </Helmet>
      <SidebarNavigation />
      <main 
        className={`transition-all duration-250 ease-out ${
          isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumb />
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="typography-h2 mb-2">
                  Submission Log
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track FATCA and CRS regulatory submissions and responses
                </p>
              </div>
              <RegimeToggle 
                selectedRegime={selectedRegime}
                onRegimeChange={setSelectedRegime}
              />
            </div>
          </div>

          {/* Statistics Panel */}
          {loading ? (
            <SkeletonStatCard count={4} />
          ) : (
            <div className="fade-in">
              <SubmissionStatsPanel stats={statistics} />
            </div>
          )}

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block typography-label text-foreground mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Report name or file..."
                  value={filters?.search}
                  onChange={(e) => handleFilterChange('search', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block typography-label text-foreground mb-2">
                  Status
                </label>
                <select
                  value={filters?.status}
                  onChange={(e) => handleFilterChange('status', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="Error">Error</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block typography-label text-foreground mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters?.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block typography-label text-foreground mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters?.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Submissions Grid */}
          {!hasPermission('submissions.view') ? (
            <AccessRestricted message="You don't have permission to view submission logs" />
          ) : loading ? (
            <SkeletonGrid cards={9} columns={3} />
          ) : error ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
              <Icon name="alert-circle" className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-foreground font-medium">{error}</p>
            </div>
          ) : submissions?.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
              <Icon name="send" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No submission logs found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Submission history will appear here once reports are submitted
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <SubmissionsGrid 
                submissions={submissions}
                onViewDetails={handleViewDetails}
                onDownloadResponse={handleDownloadResponse}
                onResubmit={handleResubmit}
                onApprove={handleApproveSubmission}
                onReject={handleRejectSubmission}
                onSubmitForApproval={handleSubmitForApproval}
                currentUserId={user?.userId}
                hasApprovePermission={hasPermission('submissions.approve')}
                hasSubmitPermission={hasPermission('submissions.submit_for_approval')}
              />
            </div>
          )}
        </div>
      </main>

      {/* Approval Modal */}
      {showApprovalModal && selectedSubmission && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedSubmission(null);
            setApprovalAction(null);
          }}
          onApprove={handleApprovalAction}
          onReject={handleApprovalAction}
          submission={selectedSubmission}
          actionType={approvalAction}
        />
      )}

      {/* Submission Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <SubmissionDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
        />
      )}
    </div>
  );
};

export default SubmissionLogScreen;