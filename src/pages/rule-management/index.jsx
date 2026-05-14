import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import Select from '../../components/ui/Select';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import RegimeToggle from './components/RegimeToggle';
import RuleFilters from './components/RuleFilters';
import RulesGrid from './components/RulesGrid';
import CreateRuleModal from './components/CreateRuleModal';
import RuleConditionsModal from './components/RuleConditionsModal';
import ApproveRuleModal from './components/ApproveRuleModal';
import VersionHistoryModal from './components/VersionHistoryModal';
import ApprovalModal from './components/ApprovalModal';
import RuleApprovalModal from './components/RuleApprovalModal';
import { fatcaCrsRuleService } from '../../services/fatcaCrsRuleService';
import { supabase } from '../../lib/supabase';
import AccessRestricted from '../../components/ui/AccessRestricted';
import RuleSimulationPanel from './components/RuleSimulationPanel';
import RuleHistoryTab from './components/RuleHistoryTab';
import RetireRuleModal from './components/RetireRuleModal';
import { logActivity } from '../../services/activityService';


const RuleManagement = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission, refreshPermissions } = useUserContext();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('list');
  const [selectedRegime, setSelectedRegime] = useState('FATCA');
  const [filters, setFilters] = useState({
    search: '',
    segmentId: 'all',
    reportingYear: 'all',
    status: 'all'
  });
  const [showRetired, setShowRetired] = useState(false);

  const [rules, setRules] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [selectedRuleForSimulation, setSelectedRuleForSimulation] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [ruleConditions, setRuleConditions] = useState([]);
  const [isRuleApprovalModalOpen, setIsRuleApprovalModalOpen] = useState(false);
  const [approvalModalAction, setApprovalModalAction] = useState(null);
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [permissionsRefreshing, setPermissionsRefreshing] = useState(false);

  // Force-refresh permissions on mount to ensure newly migrated permissions
  // (e.g. rules.retire, rules.submit_for_approval) reflect immediately
  useEffect(() => {
    if (!user?.roleId) {
      console.log('RuleManagement: user.roleId not yet available, waiting...');
      return;
    }
    const doRefreshPermissions = async () => {
      setPermissionsRefreshing(true);
      try {
        const perms = await refreshPermissions();
        console.log(`RuleManagement: ✅ Permissions refreshed — ${perms?.length} permissions active`);
        console.log('RuleManagement: rules.retire present?', perms?.includes('rules.retire'));
      } catch (err) {
        console.warn('RuleManagement: Permission refresh failed (non-critical):', err);
      } finally {
        setPermissionsRefreshing(false);
      }
    };
    doRefreshPermissions();
  }, [user?.roleId]);

  useEffect(() => {
    if (!hasPermission('rules.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    if (user?.organizationId) {
      loadSegments();
    }
  }, [user?.organizationId]);

  const loadSegments = async () => {
    try {
      console.log('🔄 loadSegments called with organizationId:', user?.organizationId);
      const segmentsData = await fatcaCrsRuleService?.getSegments(user?.organizationId);
      console.log('📦 Segments data received in index.jsx:', segmentsData);
      console.log('📦 Segments count:', segmentsData?.length);
      console.log('📦 First segment in index:', segmentsData?.[0]);
      setSegments(segmentsData);
      console.log('✅ Segments state updated');
    } catch (error) {
      console.error('Error loading segments:', error);
      toast?.error('Failed to load segments');
    }
  };

  useEffect(() => {
    const fetchRules = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
          ...filters,
          regimeType: selectedRegime,
          showRetired: showRetired
        });
        setRules(fetchedRules);
      } catch (err) {
        console.error('Error fetching rules:', err);
        setError('Failed to load rules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();

    // Set up real-time subscription for rule sets changes
    const ruleSetsChannel = supabase?.channel('rule_sets_realtime')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fatca_crs_rule_sets',
          filter: `organization_id=eq.${user?.organizationId}`
        },
        () => {
          // Refetch rules when any rule set is updated
          if (user?.organizationId) {
            fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
              ...filters,
              regimeType: selectedRegime
            })?.then(setRules);
          }
        }
      )?.subscribe();

    // Set up real-time subscription for rule conditions changes
    const ruleConditionsChannel = supabase?.channel('rule_conditions_realtime')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fatca_crs_rule_conditions'
        },
        () => {
          // Refetch rules when rule conditions are updated
          if (user?.organizationId) {
            fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
              ...filters,
              regimeType: selectedRegime
            })?.then(setRules);
          }
        }
      )?.subscribe();

    // Cleanup function
    return () => {
      if (ruleSetsChannel) {
        supabase?.removeChannel(ruleSetsChannel);
      }
      if (ruleConditionsChannel) {
        supabase?.removeChannel(ruleConditionsChannel);
      }
    };
  }, [user?.organizationId, selectedRegime, filters, showRetired]);

  const handleRegimeChange = (regime) => {
    setSelectedRegime(regime);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      segmentId: 'all',
      reportingYear: 'all',
      status: 'all'
    });
  };

  const handleCreateRule = async (formData) => {
    try {
      // Detect edit mode by checking if selectedRule exists
      const isEditMode = selectedRule && selectedRule?.id;

      let data, error;

      if (isEditMode) {
        // Edit mode: Update existing rule
        const updateResult = await fatcaCrsRuleService?.updateRuleSet(
          selectedRule?.id,
          {
            rule_name: formData?.ruleName,
            description: formData?.description,
            segment_id: formData?.segmentId,
            regime_type: formData?.regimeType,
            reporting_year: formData?.reportingYear,
            simulation_results: formData?.simulationResults
          },
          formData?.conditions || ruleConditions // Pass conditions for update
        );
        data = updateResult?.data;
        error = updateResult?.error;
      } else {
        // Create mode: Create new rule
        const createResult = await fatcaCrsRuleService?.createRuleSet({
          organizationId: user?.organizationId,
          segmentId: formData?.segmentId,
          regimeType: formData?.regimeType,
          reportingYear: formData?.reportingYear,
          ruleName: formData?.ruleName,
          description: formData?.description,
          createdBy: user?.userId,
          createdByUserId: user?.userId,
          conditions: formData?.conditions || ruleConditions,
          simulationResults: formData?.simulationResults
        });
        data = createResult?.data;
        error = createResult?.error;
      }

      if (error) {
        toast?.error(`Failed to ${isEditMode ? 'update' : 'create'} rule: ${error?.message || 'Please try again.'}`);
        return;
      }

      toast?.success(`Rule "${formData?.ruleName}" ${isEditMode ? 'updated' : 'created'} successfully`);

      // Log rule create/update activity
      logActivity(
        user?.userId,
        user?.organizationId,
        isEditMode ? 'rule_updated' : 'rule_created',
        `Rule "${formData?.ruleName}" ${isEditMode ? 'updated' : 'created'} (${selectedRegime})`,
        {
          ruleId: data?.id || selectedRule?.id || null,
          ruleName: formData?.ruleName,
          regimeType: selectedRegime,
          segmentId: formData?.segmentId || null,
          reportingYear: formData?.reportingYear || null,
          conditionCount: formData?.conditions?.length || ruleConditions?.length || 0,
          isEditMode
        }
      );

      // Refresh rules list
      const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
        ...filters,
        regimeType: selectedRegime
      });
      setRules(fetchedRules);
      setIsCreateModalOpen(false);
      setActiveTab('list');
      setRuleConditions([]); // Reset conditions

      // Prompt to submit for approval
      if (data && hasPermission('rules.submit_for_approval')) {
        const shouldSubmit = confirm(
          `Rule "${formData?.ruleName}" saved successfully!\n\nWould you like to submit it for approval now?`
        );
        
        if (shouldSubmit) {
          const { error: submitError } = await fatcaCrsRuleService?.submitRuleForApproval(data?.id);
          
          if (submitError) {
            toast?.error(`Failed to submit "${formData?.ruleName}" for approval: ${submitError?.message || 'Please try again.'}`);
          } else {
            toast?.success(`Rule "${formData?.ruleName}" submitted for approval successfully`);

            // Log submit-for-approval activity
            logActivity(
              user?.userId,
              user?.organizationId,
              'rule_submitted_for_approval',
              `Rule "${formData?.ruleName}" submitted for approval (${selectedRegime})`,
              {
                ruleId: data?.id || null,
                ruleName: formData?.ruleName,
                regimeType: selectedRegime,
                submittedByUserId: user?.userId
              }
            );

            // Refresh rules list again to show updated status
            const updatedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
              ...filters,
              regimeType: selectedRegime
            });
            setRules(updatedRules);
          }
        }
      }
    } catch (err) {
      console.error('Error creating rule:', err);
      alert('Failed to create rule');
    }
  };

  const handleEditRule = async (rule) => {
    setSelectedRule(rule);
    // Fetch conditions for the rule
    if (rule?.id) {
      try {
        const conditions = await fatcaCrsRuleService?.getRuleConditions(rule?.id);
        setRuleConditions(conditions || []);
      } catch (err) {
        console.error('Error fetching rule conditions:', err);
        setRuleConditions([]);
      }
    }
    setIsCreateModalOpen(true);
  };

  const handleViewConditions = async (rule) => {
    setSelectedRule(rule);
    // Fetch conditions for the rule
    if (rule?.id) {
      try {
        const conditions = await fatcaCrsRuleService?.getRuleConditions(rule?.id);
        setRuleConditions(conditions || []);
      } catch (err) {
        console.error('Error fetching rule conditions:', err);
        setRuleConditions([]);
      }
    }
    setIsConditionsModalOpen(true);
  };

  const handleApproveRule = (rule) => {
    setSelectedRule(rule);
    setApprovalAction('approve');
    setIsApproveModalOpen(true);
  };

  const handleRejectRule = (rule) => {
    setSelectedRule(rule);
    setApprovalAction('reject');
    setIsApproveModalOpen(true);
  };

  const handleSubmitForApproval = async (rule) => {
    if (!confirm(`Submit "${rule?.ruleName}" for approval?`)) {
      return;
    }

    toast?.info(`Submitting "${rule?.ruleName}" for approval...`);

    try {
      const { error } = await fatcaCrsRuleService?.submitRuleForApproval(rule?.id);

      if (error) {
        toast?.error(`Failed to submit "${rule?.ruleName}" for approval: ${error?.message || 'Please try again.'}`);
        return;
      }

      toast?.success(`Rule "${rule?.ruleName}" submitted for approval successfully`);

      // Log submit-for-approval activity
      logActivity(
        user?.userId,
        user?.organizationId,
        'rule_submitted_for_approval',
        `Rule "${rule?.ruleName}" submitted for approval (${selectedRegime})`,
        {
          ruleId: rule?.id,
          ruleName: rule?.ruleName,
          regimeType: selectedRegime,
          versionNumber: rule?.versionNumber || null,
          submittedByUserId: user?.userId
        }
      );

      // Refresh rules list
      const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
        ...filters,
        regimeType: selectedRegime
      });
      setRules(fetchedRules);
    } catch (err) {
      console.error('Error submitting rule for approval:', err);
      toast?.error(`Failed to submit "${rule?.ruleName}" for approval. Please try again.`);
    }
  };

  const handleApprovalAction = async (ruleId, comments) => {
    const ruleName = selectedRule?.ruleName || 'Rule';
    const approverName = user?.fullName || user?.email || 'Unknown';
    try {
      if (approvalAction === 'approve') {
        const { error } = await fatcaCrsRuleService?.approveRuleSet(ruleId, user?.userId, comments);
        if (error) {
          toast?.error(`Failed to approve "${ruleName}": ${error?.message || 'Please try again.'}`);
          return;
        }
        toast?.success(`Rule "${ruleName}" approved successfully by ${approverName}`);
      } else {
        const { error } = await fatcaCrsRuleService?.rejectRuleSet(ruleId, user?.userId, comments);
        if (error) {
          toast?.error(`Failed to reject "${ruleName}": ${error?.message || 'Please try again.'}`);
          return;
        }
        toast?.success(`Rule "${ruleName}" rejected successfully`);
      }

      // Log approval/rejection activity
      logActivity(
        user?.userId,
        user?.organizationId,
        approvalAction === 'approve' ? 'rule_approved' : 'rule_rejected',
        `Rule "${ruleName}" ${approvalAction === 'approve' ? 'approved' : 'rejected'} (${selectedRegime})`,
        {
          ruleId: ruleId,
          ruleName: ruleName,
          regimeType: selectedRegime,
          approvalAction,
          approverUserId: user?.userId,
          approverName: user?.fullName || user?.email || null,
          comments: comments || null,
          versionNumber: selectedRule?.versionNumber || null
        }
      );

      // Refresh rules list
      const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
        ...filters,
        regimeType: selectedRegime
      });
      setRules(fetchedRules);
    } catch (err) {
      console.error('Error processing approval action:', err);
      toast?.error(`Failed to process approval action for "${ruleName}". Please try again.`);
    }
  };

  const handleConfirmApproval = async () => {
    if (!selectedRule) return;

    try {
      const { error } = await fatcaCrsRuleService?.approveRule(
        selectedRule?.id,
        user?.userId,
        selectedRule?.createdById
      );

      if (error) {
        toast?.error(error?.message || 'Failed to approve rule');
        return;
      }

      toast?.success(`Rule "${selectedRule?.ruleName}" approved successfully`);

      // Refresh rules list
      const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
        ...filters,
        regimeType: selectedRegime
      });
      setRules(fetchedRules);
      setIsApproveModalOpen(false);
      setSelectedRule(null);
    } catch (err) {
      console.error('Error approving rule:', err);
      toast?.error('Failed to approve rule');
    }
  };

  const handleLockRule = async (rule) => {
    if (!confirm('Are you sure you want to lock this rule? It will become immutable.')) {
      return;
    }

    try {
      const { error } = await fatcaCrsRuleService?.lockRule(rule?.id);

      if (error) {
        toast?.error('Failed to lock rule: ' + error?.message);
        return;
      }

      toast?.success(`Rule "${rule?.ruleName}" locked successfully`);

      // Refresh rules list
      const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
        ...filters,
        regimeType: selectedRegime
      });
      setRules(fetchedRules);
    } catch (err) {
      console.error('Error locking rule:', err);
      toast?.error('Failed to lock rule');
    }
  };

  const handleViewVersionHistory = (rule) => {
    setSelectedRule(rule);
    setIsVersionHistoryModalOpen(true);
  };

  const handleSimulateRule = (rule) => {
    setSelectedRuleForSimulation(rule);
    setSimulationResults(rule?.simulationResults || null);
    setActiveTab('simulation');
  };

  const handleRunSimulation = async () => {
    if (!selectedRuleForSimulation) return;

    try {
      setLoading(true);
      // Simulate rule execution
      const mockResults = {
        totalRecords: 150,
        matchedRecords: 23,
        flaggedRecords: 23,
        executionTime: '1.2s',
        details: [
          { customerId: 'CUST001', customerName: 'John Doe', matched: true, reason: 'US Indicia found' },
          { customerId: 'CUST002', customerName: 'Jane Smith', matched: true, reason: 'US Phone Number' },
          { customerId: 'CUST003', customerName: 'Bob Johnson', matched: false, reason: 'No US indicators' }
        ]
      };

      setSimulationResults(mockResults);
      toast?.success('Simulation completed successfully');
    } catch (err) {
      console.error('Error running simulation:', err);
      toast?.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleRetireRule = (rule) => {
    setSelectedRule(rule);
    setIsRetireModalOpen(true);
  };

  const handleConfirmRetirement = async (ruleId, retirementReason) => {
    const ruleName = selectedRule?.ruleName || 'Rule';
    try {
      const { error } = await fatcaCrsRuleService?.retireRule(
        ruleId,
        user?.userId,
        retirementReason
      );

      if (error) {
        toast?.error(`Failed to retire "${ruleName}": ${error?.message || 'Please try again.'}`);
        return;
      }

      toast?.success(`Rule "${ruleName}" retired successfully and excluded from active workflows`);

      // Log retirement activity
      logActivity(
        user?.userId,
        user?.organizationId,
        'rule_retired',
        `Rule "${ruleName}" retired (${selectedRegime}): ${retirementReason || 'No reason provided'}`,
        {
          ruleId: ruleId,
          ruleName: ruleName,
          regimeType: selectedRegime,
          retirementReason: retirementReason || null,
          retiredByUserId: user?.userId,
          versionNumber: selectedRule?.versionNumber || null
        }
      );

      // Refresh rules list
      const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
        ...filters,
        regimeType: selectedRegime,
        showRetired: showRetired
      });
      setRules(fetchedRules);
      setIsRetireModalOpen(false);
      setSelectedRule(null);
    } catch (err) {
      console.error('Error retiring rule:', err);
      toast?.error(`Failed to retire "${ruleName}". Please try again.`);
    }
  };

  const handleDeleteRule = async (rule) => {
    if (!confirm(`Are you sure you want to delete "${rule?.ruleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await fatcaCrsRuleService?.deleteRuleSet(rule?.id);

      if (error) {
        toast?.error(`Failed to delete "${rule?.ruleName}": ${error?.message || 'Please try again.'}`);
        return;
      }

      toast?.success(`Rule "${rule?.ruleName}" deleted successfully`);

      // Log deletion activity
      logActivity(
        user?.userId,
        user?.organizationId,
        'rule_deleted',
        `Rule "${rule?.ruleName}" deleted (${selectedRegime})`,
        {
          ruleId: rule?.id,
          ruleName: rule?.ruleName,
          regimeType: selectedRegime,
          versionNumber: rule?.versionNumber || null,
          deletedByUserId: user?.userId
        }
      );

      // Refresh rules list
      const fetchedRules = await fatcaCrsRuleService?.getRuleSets(user?.organizationId, {
        ...filters,
        regimeType: selectedRegime,
        showRetired: showRetired
      });
      setRules(fetchedRules);
    } catch (err) {
      console.error('Error deleting rule:', err);
      toast?.error(`Failed to delete "${rule?.ruleName}". Please try again.`);
    }
  };

  const handleToggleShowRetired = (checked) => {
    setShowRetired(checked);
  };

  const tabs = [
    { id: 'list', label: 'Rule List', icon: 'List' },
    { id: 'create', label: 'Create Rule', icon: 'Plus' },
    { id: 'simulation', label: 'Rule Simulation', icon: 'Play' },
    { id: 'approve', label: 'Approve Rules', icon: 'CheckCircle' },
    { id: 'history', label: 'Rule History', icon: 'History' }
  ];

  const pendingApprovalRules = rules?.filter(r => r?.approvalStatus === 'pending_approval');

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNavigation />
      <main
        className={`flex-1 transition-all duration-250 ease-out ${
          isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumb />
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="typography-h1 mb-2">
                  Rule Management
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage FATCA and CRS regulatory rules with version control and approval workflows
                </p>
              </div>
              <div className="flex items-center gap-3">
                <RegimeToggle selectedRegime={selectedRegime} onRegimeChange={handleRegimeChange} />
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => {
                    setSelectedRule(null);
                    setRuleConditions([]);
                    setIsCreateModalOpen(true);
                  }}
                  disabled={!hasPermission('rules.create')}
                >
                  Create Rule
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-border">
              <div className="flex flex-wrap gap-2">
                {tabs?.map(tab => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary font-medium' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span className="text-sm">{tab?.label}</span>
                    {tab?.id === 'approve' && pendingApprovalRules?.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                        {pendingApprovalRules?.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Rule List Tab */}
            {activeTab === 'list' && (
              <div>
                <RuleFilters
                  filters={filters}
                  segments={segments}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                />

                <div className="bg-card rounded-lg shadow-elevation-sm border border-border overflow-hidden">
                  {!hasPermission('rules.view') ? (
                    <AccessRestricted
                      title="Rule Data Access Restricted"
                      reason="You don't have permission to view rule data. Contact your administrator to request 'rules.view' permission."
                      className="min-h-[400px]"
                    />
                  ) : loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Icon name="Loader2" className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading rules...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                      <Icon name="AlertCircle" className="w-8 h-8 text-destructive mx-auto mb-2" />
                      <p className="text-destructive">{error}</p>
                    </div>
                  ) : (
                    <div className="fade-in">
                      <RulesGrid
                        rules={rules}
                        onEdit={handleEditRule}
                        onViewConditions={handleViewConditions}
                        onApprove={handleApproveRule}
                        onReject={handleRejectRule}
                        onSubmitForApproval={handleSubmitForApproval}
                        onLock={handleLockRule}
                        onViewHistory={handleViewVersionHistory}
                        onSimulate={handleSimulateRule}
                        onRetire={handleRetireRule}
                        onDelete={handleDeleteRule}
                        currentUserId={user?.userId}
                        hasApprovePermission={hasPermission('rules.approve')}
                        hasSubmitPermission={hasPermission('rules.submit_for_approval')}
                        hasRetirePermission={hasPermission('rules.retire')}
                        hasDeletePermission={hasPermission('rules.create') || hasPermission('rules.submit_for_approval')}
                        loading={loading}
                        showRetired={showRetired}
                        onToggleShowRetired={handleToggleShowRetired}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Create Rule Tab */}
            {activeTab === 'create' && (
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <Button
                    variant="outline"
                    iconName="ArrowLeft"
                    iconPosition="left"
                    onClick={() => setActiveTab('list')}
                  >
                    Back to Rule List
                  </Button>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon name="Plus" size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="typography-h4">Create New Rule</h2>
                      <p className="text-sm text-muted-foreground">Define a new {selectedRegime} regulatory rule</p>
                    </div>
                  </div>

                  {/* Inline CreateRuleModal Form */}
                  <CreateRuleModal
                    isOpen={true}
                    onClose={() => setActiveTab('list')}
                    onSubmit={handleCreateRule}
                    segments={segments}
                    selectedRule={null}
                    conditions={[]}
                    organizationId={user?.organizationId}
                    regimeType={selectedRegime}
                    isInlineMode={true}
                  />
                </div>
              </div>
            )}

            {/* Rule Simulation Tab */}
            {activeTab === 'simulation' && (
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <Button
                    variant="outline"
                    iconName="ArrowLeft"
                    iconPosition="left"
                    onClick={() => {
                      setActiveTab('list');
                      setSelectedRuleForSimulation(null);
                      setSimulationResults(null);
                    }}
                  >
                    Back to Rule List
                  </Button>
                </div>

                {selectedRuleForSimulation ? (
                  <div className="space-y-6">
                    {/* Rule Info */}
                    <div className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-2">
                            {selectedRuleForSimulation?.ruleName}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {selectedRuleForSimulation?.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className="text-sm text-muted-foreground">
                            Segment: {selectedRuleForSimulation?.segmentName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Year: {selectedRuleForSimulation?.reportingYear}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Regime: {selectedRuleForSimulation?.regimeType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Simulation Results */}
                    <RuleSimulationPanel
                      simulationResults={simulationResults}
                      onClose={null}
                    />
                  </div>
                ) : (
                  <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <Icon name="Play" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Rule Selected</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Select a rule from the list to view its simulation results
                    </p>
                    <Button
                      variant="default"
                      iconName="List"
                      iconPosition="left"
                      onClick={() => setActiveTab('list')}
                    >
                      Go to Rule List
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Approve Rules Tab */}
            {activeTab === 'approve' && (
              <div>
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Icon name="CheckCircle" size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <h2 className="typography-h4">Pending Approvals</h2>
                      <p className="text-sm text-muted-foreground">Review and approve rules using maker-checker workflow</p>
                    </div>
                  </div>

                  {pendingApprovalRules?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="typography-h5 mb-2">No Pending Approvals</h3>
                      <p className="text-muted-foreground">All rules have been reviewed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingApprovalRules?.map(rule => (
                        <div key={rule?.id} className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">{rule?.ruleName}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{rule?.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                  {rule?.regimeType}
                                </span>
                                <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                  {rule?.businessSegments?.segmentName}
                                </span>
                                <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                                  Year: {rule?.reportingYear}
                                </span>
                                <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                                  v{rule?.versionNumber}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              iconName="CheckCircle"
                              iconPosition="left"
                              onClick={() => handleApproveRule(rule)}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rule History Tab */}
            {activeTab === 'history' && (
              <div>
                {/* Rule Selector */}
                {!selectedRule && (
                  <div className="bg-card rounded-lg border border-border p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Icon name="History" size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <h2 className="typography-h4">Rule Version History</h2>
                        <p className="text-sm text-muted-foreground">Select a rule to view its complete version history and changes</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {rules?.map(rule => (
                        <div
                          key={rule?.id}
                          className="border border-border rounded-lg p-4 hover:border-primary hover:bg-accent/50 transition-all cursor-pointer"
                          onClick={() => setSelectedRule(rule)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">{rule?.ruleName}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{rule?.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                  {rule?.regimeType}
                                </span>
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                  {rule?.segmentName}
                                </span>
                                <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                                  Year: {rule?.reportingYear}
                                </span>
                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                                  v{rule?.versionNumber}
                                </span>
                              </div>
                            </div>
                            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                          </div>
                        </div>
                      ))}

                      {rules?.length === 0 && (
                        <div className="text-center py-12">
                          <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
                          <h3 className="typography-h5 mb-2">No Rules Found</h3>
                          <p className="text-muted-foreground">Create rules to view their version history</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rule History Component */}
                {selectedRule && (
                  <div>
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        iconName="ArrowLeft"
                        iconPosition="left"
                        onClick={() => setSelectedRule(null)}
                      >
                        Back to Rule List
                      </Button>
                    </div>
                    <RuleHistoryTab selectedRule={selectedRule} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedRule(null);
          setRuleConditions([]);
        }}
        onSubmit={handleCreateRule}
        segments={segments}
        selectedRule={selectedRule}
        conditions={ruleConditions}
        organizationId={user?.organizationId}
        regimeType={selectedRegime}
      />

      <RuleConditionsModal
        isOpen={isConditionsModalOpen}
        onClose={() => {
          setIsConditionsModalOpen(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
      />

      <ApprovalModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedRule(null);
          setApprovalAction(null);
        }}
        onApprove={handleApprovalAction}
        onReject={handleApprovalAction}
        rule={selectedRule}
        actionType={approvalAction}
      />

      <ApproveRuleModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedRule(null);
        }}
        onConfirm={handleConfirmApproval}
        rule={selectedRule}
      />

      <VersionHistoryModal
        isOpen={isVersionHistoryModalOpen}
        onClose={() => {
          setIsVersionHistoryModalOpen(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
      />

      {isRuleApprovalModalOpen && (
        <RuleApprovalModal
          isOpen={isRuleApprovalModalOpen}
          onClose={() => {
            setIsRuleApprovalModalOpen(false);
            setSelectedRule(null);
            setApprovalModalAction(null);
          }}
          onConfirm={handleConfirmApproval}
          rule={selectedRule}
          actionType={approvalModalAction}
          currentUserId={user?.userId}
        />
      )}

      <RetireRuleModal
        isOpen={isRetireModalOpen}
        onClose={() => {
          setIsRetireModalOpen(false);
          setSelectedRule(null);
        }}
        onConfirm={handleConfirmRetirement}
        rule={selectedRule}
      />
    </div>
  );
};

export default RuleManagement;
