import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';


import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import RoleCard from './components/RoleCard';
import CreateRoleModal from './components/CreateRoleModal';
import EditRoleModal from './components/EditRoleModal';
import ViewPermissionsModal from './components/ViewPermissionsModal';
import ManagePermissionsModal from './components/ManagePermissionsModal';
import RoleStatsCard from './components/RoleStatsCard';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import { roleService } from '../../services/roleService';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonGrid } from '../../components/ui/SkeletonLoader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';



const RoleManagement = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewPermissionsModal, setShowViewPermissionsModal] = useState(false);
  const [showManagePermissionsModal, setShowManagePermissionsModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Role Management', path: '/roles' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const filteredRoles = roles?.filter(role => {
    const matchesSearch = role?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         role?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role?.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const fetchRoles = async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedRoles = await roleService?.getRoles(user?.organizationId);
      setRoles(fetchedRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPermissions = async (role) => {
    try {
      const permissions = await roleService?.getRolePermissions(role?.id);
      setRolePermissions(permissions);
      setSelectedRole(role);
      setShowViewPermissionsModal(true);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleManagePermissions = async (role) => {
    try {
      const permissions = await roleService?.getRolePermissions(role?.id);
      const allPermissions = roleService?.getAllAvailablePermissions();
      setRolePermissions(permissions);
      setAvailablePermissions(allPermissions);
      setSelectedRole(role);
      setShowManagePermissionsModal(true);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const handleUpdateRole = async (formData) => {
    try {
      const { error } = await roleService?.updateRole(selectedRole?.id, formData);
      
      if (error) {
        console.error('Error updating role:', error);
        return;
      }

      await fetchRoles();
      setShowEditModal(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleUpdatePermissions = async (permissions) => {
    try {
      const { error } = await roleService?.updateRolePermissions(selectedRole?.id, permissions);
      
      if (error) {
        console.error('Error updating permissions:', error);
        return;
      }

      await fetchRoles();
      setShowManagePermissionsModal(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Error updating permissions:', err);
    }
  };

  const handleCreateRole = async (formData) => {
    try {
      const roleData = {
        organizationId: user?.organizationId,
        name: formData?.name,
        description: formData?.description,
        permissions: formData?.permissions || []
      };

      const { data, error } = await roleService?.createRole(roleData);

      if (error) {
        console.error('Error creating role:', error);
        return;
      }

      await fetchRoles();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating role:', err);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      await roleService?.deleteRole(roleId);
      toast?.success('Role deleted successfully');
      setRoles(roles?.filter(role => role?.id !== roleId));
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      toast?.error(err?.message || 'Failed to delete role. Please try again.');
    }
  };

  const totalRoles = roles?.length || 0;
  const activeRoles = roles?.filter(r => r?.status === 'Active')?.length || 0;
  const totalUsers = roles?.reduce((sum, role) => sum + (role?.userCount || 0), 0) || 0;
  const avgPermissions = roles?.length > 0 ? Math.round(
    roles?.reduce((sum, role) => sum + (role?.permissionCount || 0), 0) / roles?.length
  ) : 0;

  useEffect(() => {
    fetchRoles();
  }, [user?.organizationId]);

  useEffect(() => {
    if (!hasPermission('roles.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNavigation />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarExpanded ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <header className="bg-card border-b border-border px-8 py-6 transition-colors">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Role Management</h1>
              <p className="text-muted-foreground mt-1">
                Configure roles and manage permissions
              </p>
            </div>
            {hasPermission('roles.create') && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {!hasPermission('roles.view') ? (
            <AccessRestricted message="You don't have permission to view roles" />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <RoleStatsCard
                  title="Total Roles"
                  value={roles?.length || 0}
                  icon="shield"
                  color="blue"
                  label="roles"
                  trend="up"
                  trendValue={0}
                />
                <RoleStatsCard
                  title="Active Roles"
                  value={roles?.filter(r => r?.status === 'active')?.length || 0}
                  icon="check-circle"
                  color="green"
                  label="active"
                  trend="up"
                  trendValue={0}
                />
                <RoleStatsCard
                  title="Inactive Roles"
                  value={roles?.filter(r => r?.status === 'inactive')?.length || 0}
                  icon="x-circle"
                  color="gray"
                  label="inactive"
                  trend="neutral"
                  trendValue={0}
                />
              </div>

              {/* Filters */}
              <div className="bg-card border border-border rounded-lg p-6 mb-6 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Search roles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e?.target?.value)}
                      icon="search"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e?.target?.value)}
                    options={statusOptions}
                  />
                </div>
              </div>

              {/* Roles Grid */}
              {loading ? (
                <SkeletonGrid cards={6} columns={3} />
              ) : error ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                  <Icon name="alert-circle" className="w-12 h-12 text-error mx-auto mb-4" />
                  <p className="text-foreground font-medium">{error}</p>
                </div>
              ) : filteredRoles?.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
                  <Icon name="shield" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium">No roles found</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first role'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
                  {filteredRoles?.map(role => (
                    <RoleCard
                      key={role?.id}
                      role={role}
                      onEdit={handleEditRole}
                      onViewPermissions={handleViewPermissions}
                      onManagePermissions={handleManagePermissions}
                      onDelete={handleDeleteRole}
                      isSelected={selectedRole?.id === role?.id}
                      hasEditPermission={hasPermission('roles.manage')}
                      hasDeletePermission={hasPermission('roles.delete')}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRole}
        existingRoles={roles}
      />

      <EditRoleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
        }}
        onSubmit={handleUpdateRole}
        role={selectedRole}
      />

      <ViewPermissionsModal
        isOpen={showViewPermissionsModal}
        onClose={() => {
          setShowViewPermissionsModal(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        permissions={rolePermissions}
      />

      <ManagePermissionsModal
        isOpen={showManagePermissionsModal}
        onClose={() => {
          setShowManagePermissionsModal(false);
          setSelectedRole(null);
        }}
        onSubmit={handleUpdatePermissions}
        role={selectedRole}
        currentPermissions={rolePermissions}
        availablePermissions={availablePermissions}
      />
    </div>
  );
};

export default RoleManagement;