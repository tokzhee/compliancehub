import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';

import Button from '../../components/ui/Button';

import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import ReportJobsTable from './components/ReportJobsTable';
import AuditSummaryCard from './components/AuditSummaryCard';
import DatasetExportPanel from './components/DatasetExportPanel';
import YearEndCertificationCard from './components/YearEndCertificationCard';
import GenerateReportModal from './components/GenerateReportModal';
import { reportingService } from '../../services/reportingService';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonTable, SkeletonStatCard } from '../../components/ui/SkeletonLoader';
import Icon from '../../components/AppIcon';


const Reporting = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();

  const [reportingJobs, setReportingJobs] = useState([]);
  const [auditSummary, setAuditSummary] = useState({
    totalReports: 0,
    completedReports: 0,
    pendingApprovals: 0,
    reportableAccounts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (!hasPermission('reporting.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    const fetchReportingData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch reporting jobs
        const jobs = await reportingService?.getReportingJobs(user?.organizationId);
        setReportingJobs(jobs);

        // Fetch audit summary
        const summary = await reportingService?.getAuditSummary(user?.organizationId);
        setAuditSummary(summary);
      } catch (err) {
        console.error('Error fetching reporting data:', err);
        setError('Failed to load reporting data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportingData();
  }, [user?.organizationId]);

  const handleGenerateReport = async (reportData) => {
    try {
      // Create reporting job in database
      const newJob = await reportingService?.createReportingJob(
        user?.organizationId,
        user?.userId,
        reportData
      );

      // Call .NET API to generate report
      await reportingService?.callGenerateReportAPI(user?.organizationId, reportData);

      // Refresh reporting jobs
      const jobs = await reportingService?.getReportingJobs(user?.organizationId);
      setReportingJobs(jobs);

      setShowGenerateModal(false);
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      await reportingService?.approveReport(reportId, user?.userId);

      // Refresh reporting jobs
      const jobs = await reportingService?.getReportingJobs(user?.organizationId);
      setReportingJobs(jobs);

      // Refresh audit summary
      const summary = await reportingService?.getAuditSummary(user?.organizationId);
      setAuditSummary(summary);
    } catch (err) {
      console.error('Error approving report:', err);
      alert('Failed to approve report. Please try again.');
    }
  };

  const handleDownloadReport = (report) => {
    console.log('Download report:', report);
    // In real app: Generate download link from report_data
  };

  return (
    <>
      <Helmet>
        <title>Reporting - ComplianceHub</title>
        <meta name="description" content="FATCA compliance reports, audit summaries, and year-end certification dashboard" />
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="typography-h1">
                    Reporting Module
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    FATCA compliance reports and audit summaries
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
                <Button
                  iconName="FileText"
                  onClick={() => setShowGenerateModal(true)}
                  size="lg"
                  disabled={!hasPermission('reporting.generate')}
                >
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Audit Summary Cards */}
            {loading ? (
              <SkeletonStatCard count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
                <AuditSummaryCard
                  title="Total Reports"
                  value={auditSummary?.totalReports || 0}
                  icon="file-text"
                  color="blue"
                  iconColor="blue"
                />
                <AuditSummaryCard
                  title="Completed"
                  value={auditSummary?.completedReports || 0}
                  icon="check-circle"
                  color="green"
                  iconColor="green"
                />
                <AuditSummaryCard
                  title="Pending Approvals"
                  value={auditSummary?.pendingApprovals || 0}
                  icon="clock"
                  color="orange"
                  iconColor="orange"
                />
                <AuditSummaryCard
                  title="Reportable Accounts"
                  value={auditSummary?.reportableAccounts || 0}
                  icon="users"
                  color="purple"
                  iconColor="purple"
                />
              </div>
            )}

            {/* Year-End Certification */}
            <div className="mb-6 md:mb-8">
              <YearEndCertificationCard
                organizationId={user?.organizationId}
                userId={user?.userId}
                onApprove={handleApproveReport}
              />
            </div>

            {/* Reporting Jobs Table */}
            {!hasPermission('reporting.view') ? (
              <AccessRestricted message="You don't have permission to view reports" />
            ) : loading ? (
              <SkeletonTable rows={8} columns={7} />
            ) : error ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                <Icon name="alert-circle" className="w-12 h-12 text-error mx-auto mb-4" />
                <p className="text-foreground font-medium">{error}</p>
              </div>
            ) : (
              <div className="fade-in">
                <ReportJobsTable
                  jobs={reportingJobs}
                  loading={loading}
                  onDownload={handleDownloadReport}
                  onApprove={handleApproveReport}
                  currentUserId={user?.userId}
                />
              </div>
            )}

            {/* Dataset Export Panel */}
            <div>
              <h2 className="typography-h4 mb-4">
                Exportable Datasets
              </h2>
              <DatasetExportPanel organizationId={user?.organizationId} />
            </div>
          </div>
        </main>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <GenerateReportModal
          organizationId={user?.organizationId}
          onClose={() => setShowGenerateModal(false)}
          onSubmit={handleGenerateReport}
        />
      )}
    </>
  );
};

export default Reporting;