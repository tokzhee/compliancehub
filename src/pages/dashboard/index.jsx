import React, { useState, useEffect } from 'react';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import MetricCard from './components/MetricCard';
import QuickActionButton from './components/QuickActionButton';
import ActivityLogTable from './components/ActivityLogTable';
import ComplianceStatusCard from './components/ComplianceStatusCard';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { dashboardService } from '../../services/dashboardService';
import { supabase } from '../../lib/supabase';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';

const Dashboard = () => {
  const { isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();

  const [dashboardData, setDashboardData] = useState({
    totalDatasets: 0,
    totalCases: 0,
    totalRules: 0,
    totalReports: 0,
    totalSubmissions: 0,
    pendingApprovals: 0,
    complianceStatus: 'compliant',
    reportingYear: 2026,
    lastUpdated: new Date()?.toISOString()
  });

  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    activeSessions: 0,
    recentActivity: 0,
    ldapConfigs: 0,
    systemHealth: 'healthy'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.roleName === 'System Administrator';

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isAdmin) {
          // Fetch admin-specific metrics
          const metrics = await dashboardService?.getAdminMetrics(user?.organizationId);
          setAdminData(metrics);
        } else {
          // Fetch compliance metrics
          const metrics = await dashboardService?.getDashboardMetrics(user?.organizationId);
          setDashboardData(metrics);
        }

        // Fetch recent activities for all roles
        const activities = await dashboardService?.getRecentActivities(user?.organizationId, 8);
        setRecentActivities(activities);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const channels = [];

    if (user?.organizationId) {
      // Subscribe to user_profiles changes (for admin metrics)
      const userProfilesChannel = supabase?.channel('user_profiles_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles',
            filter: `organization_id=eq.${user?.organizationId}`
          },
          () => {
            if (isAdmin) {
              dashboardService?.getAdminMetrics(user?.organizationId)?.then(setAdminData);
            }
          }
        )?.subscribe();
      channels?.push(userProfilesChannel);

      // Subscribe to roles changes (for admin metrics)
      const rolesChannel = supabase?.channel('roles_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'roles',
            filter: `organization_id=eq.${user?.organizationId}`
          },
          () => {
            if (isAdmin) {
              dashboardService?.getAdminMetrics(user?.organizationId)?.then(setAdminData);
            }
          }
        )?.subscribe();
      channels?.push(rolesChannel);

      // Subscribe to ad_configurations changes (for admin metrics)
      const adConfigChannel = supabase?.channel('ad_configurations_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ad_configurations',
            filter: `organization_id=eq.${user?.organizationId}`
          },
          () => {
            if (isAdmin) {
              dashboardService?.getAdminMetrics(user?.organizationId)?.then(setAdminData);
            }
          }
        )?.subscribe();
      channels?.push(adConfigChannel);

      // Subscribe to fatca_crs_dataset_batch changes (for compliance metrics)
      const datasetBatchChannel = supabase?.channel('dataset_batch_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fatca_crs_dataset_batch',
            filter: `organization_id=eq.${user?.organizationId}`
          },
          () => {
            if (!isAdmin) {
              dashboardService?.getDashboardMetrics(user?.organizationId)?.then(setDashboardData);
            }
          }
        )?.subscribe();
      channels?.push(datasetBatchChannel);

      // Subscribe to fatca_crs_case_master changes (for compliance metrics)
      const caseMasterChannel = supabase?.channel('case_master_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fatca_crs_case_master'
          },
          () => {
            if (!isAdmin) {
              dashboardService?.getDashboardMetrics(user?.organizationId)?.then(setDashboardData);
            }
          }
        )?.subscribe();
      channels?.push(caseMasterChannel);

      // Subscribe to fatca_crs_rule_sets changes (for compliance metrics)
      const ruleSetsChannel = supabase?.channel('rule_sets_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fatca_crs_rule_sets',
            filter: `organization_id=eq.${user?.organizationId}`
          },
          () => {
            if (!isAdmin) {
              dashboardService?.getDashboardMetrics(user?.organizationId)?.then(setDashboardData);
            }
          }
        )?.subscribe();
      channels?.push(ruleSetsChannel);

      // Subscribe to fatca_crs_report_batch changes (for compliance metrics)
      const reportBatchChannel = supabase?.channel('report_batch_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fatca_crs_report_batch'
          },
          () => {
            if (!isAdmin) {
              dashboardService?.getDashboardMetrics(user?.organizationId)?.then(setDashboardData);
            }
          }
        )?.subscribe();
      channels?.push(reportBatchChannel);

      // Subscribe to fatca_crs_submission_log changes (for compliance metrics)
      const submissionLogChannel = supabase?.channel('submission_log_changes')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fatca_crs_submission_log'
          },
          () => {
            if (!isAdmin) {
              dashboardService?.getDashboardMetrics(user?.organizationId)?.then(setDashboardData);
            }
          }
        )?.subscribe();
      channels?.push(submissionLogChannel);

      // Subscribe to user_activity_log changes (for recent activities)
      const activityLogChannel = supabase?.channel('activity_log_changes')?.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_activity_log',
            filter: `organization_id=eq.${user?.organizationId}`
          },
          () => {
            dashboardService?.getRecentActivities(user?.organizationId, 8)?.then(setRecentActivities);
          }
        )?.subscribe();
      channels?.push(activityLogChannel);
    }

    // Cleanup function
    return () => {
      channels?.forEach(channel => {
        supabase?.removeChannel(channel);
      });
    };
  }, [user?.organizationId, isAdmin]);

  const renderMetricCards = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard count={isAdmin ? 8 : 6} />
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in">
          {hasPermission('users.view_count') ? (
            <MetricCard
              title="Total Users"
              value={adminData?.totalUsers || 0}
              subtitle={`${adminData?.activeUsers || 0} active users`}
              icon="users"
              trend="up"
              trendValue="12%"
              color="blue"
              iconColor="var(--color-primary)"
              linkTo="/user-management"
              linkText="Manage users"
            />
          ) : (
            <AccessRestricted message="You don't have permission to view User Count" />
          )}

          {hasPermission('users.view_count') ? (
            <MetricCard
              title="Active Sessions"
              value={adminData?.activeSessions || 0}
              subtitle="Current active sessions"
              icon="activity"
              trend="neutral"
              color="green"
              trendValue={null}
              iconColor="var(--color-success)"
              linkTo={null}
              linkText=""
            />
          ) : (
            <AccessRestricted message="You don't have permission to view Active Sessions" />
          )}

          {hasPermission('roles.view_count') ? (
            <MetricCard
              title="Total Roles"
              value={adminData?.totalRoles || 0}
              subtitle="Configured roles"
              icon="shield"
              trend="neutral"
              color="purple"
              trendValue={null}
              iconColor="var(--color-accent)"
              linkTo="/role-management"
              linkText="Manage roles"
            />
          ) : (
            <AccessRestricted message="You don't have permission to view Role Count" />
          )}

          {hasPermission('ldap.view_count') ? (
            <MetricCard
              title="LDAP Configs"
              value={adminData?.ldapConfigs || 0}
              subtitle="Active configurations"
              icon="server"
              trend="neutral"
              color="orange"
              trendValue={null}
              iconColor="var(--color-primary)"
              linkTo="/ad-configuration"
              linkText="Configure LDAP"
            />
          ) : (
            <AccessRestricted message="You don't have permission to view LDAP Config Count" />
          )}

          {hasPermission('datasets.view_count') ? (
            <MetricCard
              title="Total Datasets"
              value={dashboardData?.totalDatasets || 0}
              subtitle="Uploaded datasets"
              icon="database"
              trend="up"
              trendValue="8%"
              color="blue"
              iconColor="var(--color-primary)"
              linkTo="/dataset-management"
              linkText="View datasets"
            />
          ) : (
            <AccessRestricted message="You don't have permission to view Dataset Count" />
          )}

          {hasPermission('cases.view_count') ? (
            <MetricCard
              title="Total Cases"
              value={dashboardData?.totalCases || 0}
              subtitle="Cases under review"
              icon="briefcase"
              trend="down"
              trendValue="3%"
              color="yellow"
              iconColor="var(--color-accent)"
              linkTo="/business-enrichment-portal"
              linkText="View cases"
            />
          ) : (
            <AccessRestricted message="You don't have permission to view Case Count" />
          )}

          {hasPermission('rules.view_count') ? (
            <MetricCard
              title="Active Rules"
              value={dashboardData?.totalRules || 0}
              subtitle="Compliance rules"
              icon="file-text"
              trend="neutral"
              color="green"
              trendValue={null}
              iconColor="var(--color-success)"
              linkTo="/rule-management"
              linkText="Manage rules"
            />
          ) : (
            <AccessRestricted message="You don't have permission to view Rule Count" />
          )}

          {hasPermission('reporting.view_count') ? (
            <MetricCard
              title="Reports Generated"
              value={dashboardData?.totalReports || 0}
              subtitle={`For year ${dashboardData?.reportingYear || 2026}`}
              icon="bar-chart"
              trend="up"
              trendValue="15%"
              color="purple"
              iconColor="var(--color-info)"
              linkTo="/reporting"
              linkText="View reports"
            />
          ) : (
            <AccessRestricted message="You don't have permission to view Report Count" />
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
        {hasPermission('datasets.view_count') ? (
          <MetricCard
            title="Total Datasets"
            value={dashboardData?.totalDatasets || 0}
            subtitle="Uploaded datasets"
            icon="database"
            trend="up"
            trendValue="8%"
            color="blue"
            iconColor="var(--color-primary)"
            linkTo="/dataset-management"
            linkText="View datasets"
          />
        ) : (
          <AccessRestricted message="You don't have permission to view Dataset Count" />
        )}

        {hasPermission('cases.view_count') ? (
          <MetricCard
            title="Total Cases"
            value={dashboardData?.totalCases || 0}
            subtitle="Cases under review"
            icon="briefcase"
            trend="down"
            trendValue="3%"
            color="yellow"
            iconColor="var(--color-accent)"
            linkTo="/business-enrichment-portal"
            linkText="View cases"
          />
        ) : (
          <AccessRestricted message="You don't have permission to view Case Count" />
        )}

        {hasPermission('rules.view_count') ? (
          <MetricCard
            title="Active Rules"
            value={dashboardData?.totalRules || 0}
            subtitle="Compliance rules"
            icon="file-text"
            trend="neutral"
            color="green"
            trendValue={null}
            iconColor="var(--color-success)"
            linkTo="/rule-management"
            linkText="Manage rules"
          />
        ) : (
          <AccessRestricted message="You don't have permission to view Rule Count" />
        )}

        {hasPermission('reporting.view_count') ? (
          <MetricCard
            title="Reports Generated"
            value={dashboardData?.totalReports || 0}
            subtitle={`For year ${dashboardData?.reportingYear || 2026}`}
            icon="bar-chart"
            trend="up"
            trendValue="15%"
            color="purple"
            iconColor="var(--color-info)"
            linkTo="/reporting"
            linkText="View reports"
          />
        ) : (
          <AccessRestricted message="You don't have permission to view Report Count" />
        )}

        {hasPermission('submissions.view_count') ? (
          <MetricCard
            title="Submissions"
            value={dashboardData?.totalSubmissions || 0}
            subtitle="Total submissions"
            icon="send"
            trend="up"
            trendValue="5%"
            color="indigo"
            iconColor="var(--color-warning)"
            linkTo="/submission-log-screen"
            linkText="View submissions"
          />
        ) : (
          <AccessRestricted message="You don't have permission to view Submission Count" />
        )}

        {hasPermission('enrichment.view_count') ? (
          <MetricCard
            title="Pending Approvals"
            value={dashboardData?.pendingApprovals || 0}
            subtitle="Awaiting review"
            icon="clock"
            trend="neutral"
            color="orange"
            trendValue={null}
            iconColor="var(--color-error)"
            linkTo="/business-enrichment-portal"
            linkText="Review now"
          />
        ) : (
          <AccessRestricted message="You don't have permission to view Enrichment Count" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation />
      <main 
        className={`transition-all duration-300 ease-out ${
          isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumb />
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              {user?.branding?.logoUrl && (
                <img 
                  src={user?.branding?.logoUrl} 
                  alt={`${user?.branding?.organizationName} logo`}
                  className="w-10 h-10 md:w-12 md:h-12 object-contain"
                />
              )}
              <div>
                <h1 className="typography-h1">
                  Welcome back, {user?.name?.split(' ')?.[0] || 'User'}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {user?.branding?.organizationName || 'ComplianceHub'} Dashboard
                </p>
              </div>
            </div>
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

          {isAdmin ? (
            // Admin Dashboard Tiles
            (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {hasPermission('users.view_count') ? (
                <MetricCard
                  title="Total Users"
                  value={adminData?.totalUsers}
                  icon="Users"
                  iconColor="var(--color-primary)"
                  linkTo="/user-management"
                  linkText="Manage users"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Total Users"
                  reason="You don't have permission to view User Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('users.view_count') ? (
                <MetricCard
                  title="Active Users"
                  value={adminData?.activeUsers}
                  icon="UserCheck"
                  iconColor="var(--color-success)"
                  linkTo="/user-management"
                  linkText="View active"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Active Users"
                  reason="You don't have permission to view User Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('roles.view_count') ? (
                <MetricCard
                  title="Total Roles"
                  value={adminData?.totalRoles}
                  icon="Shield"
                  iconColor="var(--color-accent)"
                  linkTo="/role-management"
                  linkText="Manage roles"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Total Roles"
                  reason="You don't have permission to view Role Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('sessions.view_count') ? (
                <MetricCard
                  title="Active Sessions"
                  value={adminData?.activeSessions}
                  icon="Activity"
                  iconColor="var(--color-warning)"
                  linkText="Last 24 hours"
                  trend={null}
                  trendValue={null}
                  linkTo={null}
                />
              ) : (
                <AccessRestricted
                  title="Active Sessions"
                  reason="You don't have permission to view Session Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('sessions.view_count') ? (
                <MetricCard
                  title="Recent Activity"
                  value={adminData?.recentActivity}
                  icon="Clock"
                  iconColor="var(--color-info)"
                  linkText="Last 24 hours"
                  trend={null}
                  trendValue={null}
                  linkTo={null}
                />
              ) : (
                <AccessRestricted
                  title="Recent Activity"
                  reason="You don't have permission to view Session Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('ldap.view_count') ? (
                <MetricCard
                  title="LDAP Configurations"
                  value={adminData?.ldapConfigs}
                  icon="Settings"
                  iconColor="var(--color-primary)"
                  linkTo="/ad-configuration"
                  linkText="Configure LDAP"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="LDAP Configurations"
                  reason="You don't have permission to view LDAP Count"
                  className="min-h-[150px]"
                />
              )}
              <MetricCard
                title="System Health"
                value={adminData?.systemHealth === 'healthy' ? '✓' : '⚠'}
                icon="Heart"
                iconColor={adminData?.systemHealth === 'healthy' ? 'var(--color-success)' : 'var(--color-error)'}
                linkText={adminData?.systemHealth === 'healthy' ? 'All systems operational' : 'Check system status'}
                trend={null}
                trendValue={null}
                linkTo={null}
              />
            </div>)
          ) : (
            // Compliance Dashboard Tiles
            (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {hasPermission('datasets.view_count') ? (
                <MetricCard
                  title="Datasets"
                  value={dashboardData?.totalDatasets}
                  icon="Database"
                  iconColor="var(--color-primary)"
                  linkTo="/dataset-management"
                  linkText="View datasets"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Datasets"
                  reason="You don't have permission to view Dataset Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('cases.view_count') ? (
                <MetricCard
                  title="Cases"
                  value={dashboardData?.totalCases}
                  icon="FileText"
                  iconColor="var(--color-accent)"
                  linkTo="/business-enrichment-portal"
                  linkText="View cases"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Cases"
                  reason="You don't have permission to view Case Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('rules.view_count') ? (
                <MetricCard
                  title="Rules"
                  value={dashboardData?.totalRules}
                  icon="Shield"
                  iconColor="var(--color-success)"
                  linkTo="/rule-management"
                  linkText="Manage rules"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Rules"
                  reason="You don't have permission to view Rule Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('reports.view_count') ? (
                <MetricCard
                  title="Reports"
                  value={dashboardData?.totalReports}
                  icon="BarChart"
                  iconColor="var(--color-info)"
                  linkTo="/reporting"
                  linkText="View reports"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Reports"
                  reason="You don't have permission to view Report Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('submissions.view_count') ? (
                <MetricCard
                  title="Submissions"
                  value={dashboardData?.totalSubmissions}
                  icon="Send"
                  iconColor="var(--color-warning)"
                  linkTo="/submission-log-screen"
                  linkText="View submissions"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Submissions"
                  reason="You don't have permission to view Submission Count"
                  className="min-h-[150px]"
                />
              )}
              {hasPermission('cases.view_count') ? (
                <MetricCard
                  title="Pending Approvals"
                  value={dashboardData?.pendingApprovals}
                  icon="Clock"
                  iconColor="var(--color-error)"
                  linkTo="/business-enrichment-portal"
                  linkText="Review now"
                  trend={null}
                  trendValue={null}
                />
              ) : (
                <AccessRestricted
                  title="Pending Approvals"
                  reason="You don't have permission to view Case Count"
                  className="min-h-[150px]"
                />
              )}
              <ComplianceStatusCard
                status={dashboardData?.complianceStatus}
                lastUpdated={dashboardData?.lastUpdated}
                reportingYear={dashboardData?.reportingYear}
              />
            </div>)
          )}

          <div className="mb-6 md:mb-8">
            <h2 className="typography-h4 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <QuickActionButton
                icon="Upload"
                label="Upload Dataset"
                description="Import new customer data for analysis"
                linkTo="/dataset-management"
                variant="default"
                onClick={() => {}}
              />
              
              <QuickActionButton
                icon="Settings"
                label="Configure Rules"
                description="Create and manage compliance rules"
                linkTo="/rule-management"
                variant="default"
                onClick={() => {}}
              />
              
              <QuickActionButton
                icon="Play"
                label="Run Simulation"
                description="Test rules against current dataset"
                linkTo="/rule-management"
                variant="secondary"
                onClick={() => {}}
              />
              
              <QuickActionButton
                icon="Eye"
                label="Review Cases"
                description="Review and enrich flagged cases"
                linkTo="/business-enrichment-portal"
                variant="accent"
                onClick={() => {}}
              />
              
              <QuickActionButton
                icon="FileText"
                label="Generate Report"
                description="Create compliance report for submission"
                linkTo="/reporting"
                variant="default"
                onClick={() => {}}
              />
            </div>
          </div>

          <ActivityLogTable activities={recentActivities} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;