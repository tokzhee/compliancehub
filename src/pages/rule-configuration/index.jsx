import React, { useState, useEffect } from 'react';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import RuleFilters from './components/RuleFilters';
import RuleTable from './components/RuleTable';
import RuleCard from './components/RuleCard';
import CreateRuleModal from './components/CreateRuleModal';
import RuleHistoryModal from './components/RuleHistoryModal';
import RuleSimulationPanel from './components/RuleSimulationPanel';
import ActivateRuleModal from './components/ActivateRuleModal';
import { ruleService } from '../../services/ruleService';
import { logActivity } from '../../services/activityService';

const RuleConfiguration = () => {
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user } = useUserContext();

  const [filters, setFilters] = useState({
    search: '',
    ruleType: 'all',
    status: 'all',
    reportingYear: 'all'
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [selectedRuleForSimulation, setSelectedRuleForSimulation] = useState(null);
  const [showSimulationPanel, setShowSimulationPanel] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedRules = await ruleService?.getRules(user?.organizationId, filters);
        setRules(fetchedRules);
      } catch (err) {
        console.error('Error fetching rules:', err);
        setError('Failed to load rules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [user?.organizationId, filters?.status, filters?.ruleType, filters?.search]);

  const [filteredRules, setFilteredRules] = useState([]);

  useEffect(() => {
    let filtered = [...rules];

    if (filters?.search) {
      filtered = filtered?.filter(rule =>
        rule?.ruleName?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    if (filters?.ruleType !== 'all') {
      filtered = filtered?.filter(rule => rule?.ruleType === filters?.ruleType);
    }

    if (filters?.status !== 'all') {
      filtered = filtered?.filter(rule => rule?.status === filters?.status);
    }

    setFilteredRules(filtered);
  }, [filters, rules]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      ruleType: 'all',
      status: 'all',
      reportingYear: 'all'
    });
  };

  const handleCreateRule = (formData) => {
    const newRule = {
      id: `rule_${String(rules?.length + 1)?.padStart(3, '0')}`,
      ruleName: formData?.ruleName,
      ruleType: formData?.ruleType,
      version: '1.0',
      status: 'draft',
      effectiveDate: new Date(formData.effectiveDate)?.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      createdBy: user?.name,
      createdDate: new Date()?.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      isActive: false
    };

    setRules(prev => [newRule, ...prev]);
    setIsCreateModalOpen(false);
    logActivity(
      user?.userId,
      user?.organizationId,
      'rule_configuration_created',
      'rule_configuration'
    );
  };

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setIsCreateModalOpen(true);
  };

  const handleActivateRule = (rule) => {
    setSelectedRule(rule);
    setIsActivateModalOpen(true);
  };

  const handleConfirmActivation = (rule, comments) => {
    setRules(prev =>
      prev?.map(r =>
        r?.id === rule?.id
          ? { ...r, status: 'active', isActive: true }
          : r?.ruleType === rule?.ruleType && r?.isActive
          ? { ...r, status: 'inactive', isActive: false }
          : r
      )
    );
    logActivity(
      user?.userId,
      user?.organizationId,
      'rule_configuration_activated',
      'rule_configuration'
    );
    setIsActivateModalOpen(false);
    setSelectedRule(null);
  };

  const handleViewHistory = (rule) => {
    setSelectedRule(rule);
    setIsHistoryModalOpen(true);
  };

  const handleSimulate = (rule) => {
    setSelectedRuleForSimulation(rule);
    setShowSimulationPanel(true);
  };

  const handleSimulationComplete = (rule, params, results) => {
    console.log('Simulation completed:', { rule, params, results });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNavigation />
      <main
        className={`flex-1 transition-all duration-250 ease-out ${
          isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="typography-h1 mb-2">
                  Rule Configuration
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage FATCA regulatory rules with version control and activation workflows
                </p>
              </div>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Rule
              </Button>
            </div>
          </div>

          <RuleFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                  <div>
                    <h2 className="typography-h4">
                      Rule Master
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredRules?.length} rule{filteredRules?.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="icon"
                      iconName="List"
                      onClick={() => setViewMode('table')}
                    />
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      iconName="LayoutGrid"
                      onClick={() => setViewMode('grid')}
                    />
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  {filteredRules?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="FileX" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="typography-h5 mb-2">No Rules Found</h3>
                      <p className="typography-body text-muted-foreground mb-4">
                        Try adjusting your filters or create a new rule
                      </p>
                      <Button
                        variant="outline"
                        iconName="Plus"
                        iconPosition="left"
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        Create First Rule
                      </Button>
                    </div>
                  ) : viewMode === 'table' ? (
                    <div className="hidden md:block">
                      <RuleTable
                        rules={filteredRules}
                        onEdit={handleEditRule}
                        onActivate={handleActivateRule}
                        onViewHistory={handleViewHistory}
                        onSimulate={handleSimulate}
                      />
                    </div>
                  ) : null}

                  {(viewMode === 'grid' || viewMode === 'table') && (
                    <div className={viewMode === 'table' ? 'md:hidden' : ''}>
                      <div className="grid grid-cols-1 gap-4">
                        {filteredRules?.map(rule => (
                          <RuleCard
                            key={rule?.id}
                            rule={rule}
                            onEdit={handleEditRule}
                            onActivate={handleActivateRule}
                            onViewHistory={handleViewHistory}
                            onSimulate={handleSimulate}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              {showSimulationPanel ? (
                <div className="sticky top-4">
                  <div className="mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="X"
                      iconPosition="left"
                      onClick={() => {
                        setShowSimulationPanel(false);
                        setSelectedRuleForSimulation(null);
                      }}
                    >
                      Close Simulation
                    </Button>
                  </div>
                  <RuleSimulationPanel
                    selectedRule={selectedRuleForSimulation}
                    onSimulate={handleSimulationComplete}
                  />
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border p-6 md:p-8 text-center sticky top-4">
                  <Icon name="Info" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="typography-h5 mb-2">
                    Rule Simulation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the simulate button on any rule to test it against sample data
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3 text-left">
                      <Icon name="Lightbulb" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="typography-label text-foreground mb-1">Quick Tip</p>
                        <p className="typography-caption text-muted-foreground">
                          Simulations help validate rule logic before activation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedRule(null);
        }}
        onSubmit={handleCreateRule}
      />
      <RuleHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
      />
      <ActivateRuleModal
        isOpen={isActivateModalOpen}
        onClose={() => {
          setIsActivateModalOpen(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
        onConfirm={handleConfirmActivation}
      />
    </div>
  );
};

export default RuleConfiguration;