import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import AdConfigCard from './components/AdConfigCard';
import CreateAdConfigModal from './components/CreateAdConfigModal';
import EditAdConfigModal from './components/EditAdConfigModal';
import { adConfigService } from '../../services/adConfigService';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonGrid } from '../../components/ui/SkeletonLoader';


const AdConfiguration = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();

  const [adConfigs, setAdConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    if (!hasPermission('ldap.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    // Wait for user context to finish loading before fetching configs
    if (!user?.organizationId) {
      setLoading(false);
      setError('Unable to load configurations: Organization ID not found. Please refresh the page.');
      return;
    }

    fetchAdConfigurations();
  }, [user?.organizationId]);

  const fetchAdConfigurations = async () => {
    if (!user?.organizationId) {
      setLoading(false);
      setError('Unable to load configurations: Organization ID not found. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const configs = await adConfigService?.getAdConfigurations(user?.organizationId);
      setAdConfigs(configs);
    } catch (err) {
      console.error('Error fetching AD configurations:', err);
      setError('Failed to load AD configurations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async (configData) => {
    try {
      const { data, error } = await adConfigService?.createAdConfiguration({
        ...configData,
        organizationId: user?.organizationId
      });

      if (error) {
        alert('Failed to create AD configuration. Please try again.');
        return;
      }

      await fetchAdConfigurations();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating AD configuration:', err);
      alert('An error occurred while creating AD configuration.');
    }
  };

  const handleEditConfig = (config) => {
    setSelectedConfig(config);
    setIsEditModalOpen(true);
  };

  const handleUpdateConfig = async (configId, updates) => {
    try {
      const { error } = await adConfigService?.updateAdConfiguration(configId, updates);

      if (error) {
        alert('Failed to update AD configuration. Please try again.');
        return;
      }

      await fetchAdConfigurations();
      setIsEditModalOpen(false);
      setSelectedConfig(null);
    } catch (err) {
      console.error('Error updating AD configuration:', err);
      alert('An error occurred while updating AD configuration.');
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!confirm('Are you sure you want to delete this AD configuration? Users assigned to this configuration will need to be reassigned.')) {
      return;
    }

    try {
      const { error } = await adConfigService?.deleteAdConfiguration(configId);

      if (error) {
        alert('Failed to delete AD configuration. Please try again.');
        return;
      }

      await fetchAdConfigurations();
    } catch (err) {
      console.error('Error deleting AD configuration:', err);
      alert('An error occurred while deleting AD configuration.');
    }
  };

  const filteredConfigs = adConfigs?.filter(config => {
    const matchesSearch = config?.configName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         config?.tenantId?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || config?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const activeConfigsCount = adConfigs?.filter(c => c?.status === 'active')?.length || 0;
  const inactiveConfigsCount = adConfigs?.filter(c => c?.status === 'inactive')?.length || 0;

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
                  AD Configuration
                </h1>
                <p className="text-muted-foreground mt-1">Manage LDAP authentication sources</p>
              </div>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Add LDAP Configuration
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Configurations</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{adConfigs?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Server" size={24} className="text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{activeConfigsCount}</p>
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
                    <p className="text-2xl font-bold text-orange-600 mt-1">{inactiveConfigsCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Icon name="XCircle" size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search by name or tenant ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  iconName="Search"
                />
                <Select
                  placeholder="Filter by status"
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </div>

            {/* Content */}
            {!hasPermission('ldap.view') ? (
              <AccessRestricted message="You don't have permission to view LDAP configurations" />
            ) : loading ? (
              <SkeletonGrid cards={6} columns={2} />
            ) : error ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                <Icon name="alert-circle" className="w-12 h-12 text-error mx-auto mb-4" />
                <p className="text-foreground font-medium">{error}</p>
              </div>
            ) : filteredConfigs?.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                <Icon name="server" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium">No LDAP configurations found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {searchQuery || statusFilter !== 'all' ?'Try adjusting your filters' :'Get started by creating your first LDAP configuration'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
                {filteredConfigs?.map(config => (
                  <AdConfigCard
                    key={config?.id}
                    config={config}
                    onEdit={handleEditConfig}
                    onDelete={handleDeleteConfig}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAdConfigModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateConfig={handleCreateConfig}
      />

      <EditAdConfigModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedConfig(null);
        }}
        config={selectedConfig}
        onUpdateConfig={handleUpdateConfig}
      />
    </div>
  );
};

export default AdConfiguration;