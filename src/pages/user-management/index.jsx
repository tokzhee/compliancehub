import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import UserTableRow from './components/UserTableRow';
import UserMobileCard from './components/UserMobileCard';
import CreateUserModal from './components/CreateUserModal';
import EditRoleModal from './components/EditRoleModal';
import UserDetailsModal from './components/UserDetailsModal';
import RoleDistributionCard from './components/RoleDistributionCard';
import RecentActivityCard from './components/RecentActivityCard';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { supabase } from '../../lib/supabase';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { useToast } from '../../contexts/ToastContext';
import { logActivity } from '../../services/activityService';


const UserManagement = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user: currentUser, hasPermission, refreshPermissions } = useUserContext();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [permissionsRefreshing, setPermissionsRefreshing] = useState(false);

  // Force-refresh permissions on mount to ensure newly migrated permissions reflect immediately
  useEffect(() => {
    const doRefreshPermissions = async () => {
      setPermissionsRefreshing(true);
      try {
        const perms = await refreshPermissions();
        console.log(`UserManagement: ✅ Permissions refreshed on load — ${perms?.length} permissions active`);
      } catch (err) {
        console.warn('UserManagement: Permission refresh failed (non-critical):', err);
      } finally {
        setPermissionsRefreshing(false);
      }
    };
    doRefreshPermissions();
  }, []);

  useEffect(() => {
    if (!hasPermission('users.view')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  // Fetch roles from database
  useEffect(() => {
    const fetchRoles = async () => {
      if (!currentUser?.organizationId) {
        setLoadingRoles(false);
        return;
      }

      try {
        setLoadingRoles(true);
        const roles = await roleService?.getRoles(currentUser?.organizationId);
        const formattedRoles = roles?.map(role => ({
          value: role?.id,
          label: role?.name,
          description: role?.description || 'No description'
        }));
        setAvailableRoles(formattedRoles);
      } catch (err) {
        console.error('Error fetching roles:', err);
        toast?.error('Failed to load roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [currentUser?.organizationId]);

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedUsers = await userService?.getUsers(currentUser?.organizationId);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?.organizationId]);

  // Real-time subscription for user_profiles table
  useEffect(() => {
    if (!currentUser?.organizationId) return;

    const channel = supabase?.channel('user_profiles_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `organization_id=eq.${currentUser?.organizationId}`
        },
        async (payload) => {
          if (payload?.eventType === 'INSERT') {
            // Fetch the new user with role details
            const { data, error } = await supabase?.from('user_profiles')?.select(`
                id,
                email,
                full_name,
                status,
                last_login,
                created_at,
                updated_at,
                organization_id,
                role_id,
                authentication_source,
                roles!fk_user_profiles_role_id(
                  id,
                  role_name
                )
              `)?.eq('id', payload?.new?.id)?.single();

            if (!error && data) {
              const newUser = {
                userId: data?.id,
                username: data?.email?.split('@')?.[0] || 'unknown',
                email: data?.email,
                fullName: data?.full_name,
                role: data?.roles?.role_name || 'No Role',
                roleId: data?.role_id,
                status: data?.status === 'active' ? 'Active' : data?.status === 'inactive' ? 'Inactive' : 'Suspended',
                lastLogin: data?.last_login ? new Date(data?.last_login) : null,
                createdAt: new Date(data?.created_at),
                modifiedAt: new Date(data?.updated_at),
                loginCount: 0,
                organizationId: data?.organization_id,
                authenticationSource: data?.authentication_source,
                legalEntityAccess: [],
                reportingYearAccess: []
              };
              setUsers(prev => [...prev, newUser]);
            }
          } else if (payload?.eventType === 'UPDATE') {
            // Fetch updated user with role details
            const { data, error } = await supabase?.from('user_profiles')?.select(`
                id,
                email,
                full_name,
                status,
                last_login,
                created_at,
                updated_at,
                organization_id,
                role_id,
                authentication_source,
                roles!fk_user_profiles_role_id(
                  id,
                  role_name
                )
              `)?.eq('id', payload?.new?.id)?.single();

            if (!error && data) {
              setUsers(prev => prev?.map(user => 
                user?.userId === data?.id
                  ? {
                      userId: data?.id,
                      username: data?.email?.split('@')?.[0] || 'unknown',
                      email: data?.email,
                      fullName: data?.full_name,
                      role: data?.roles?.role_name || 'No Role',
                      roleId: data?.role_id,
                      status: data?.status === 'active' ? 'Active' : data?.status === 'inactive' ? 'Inactive' : 'Suspended',
                      lastLogin: data?.last_login ? new Date(data?.last_login) : null,
                      createdAt: new Date(data?.created_at),
                      modifiedAt: new Date(data?.updated_at),
                      loginCount: 0,
                      organizationId: data?.organization_id,
                      authenticationSource: data?.authentication_source,
                      legalEntityAccess: [],
                      reportingYearAccess: []
                    }
                  : user
              ));
            }
          } else if (payload?.eventType === 'DELETE') {
            setUsers(prev => prev?.filter(user => user?.userId !== payload?.old?.id));
          }
        }
      )?.subscribe();

    return () => {
      if (channel) {
        supabase?.removeChannel(channel);
      }
    };
  }, [currentUser?.organizationId]);

  const recentActivities = [
    {
      type: 'user_created',
      description: 'New user account created for Jennifer Taylor',
      performedBy: 'Sarah Mitchell',
      timestamp: new Date('2026-02-20T16:00:00')
    },
    {
      type: 'role_updated',
      description: 'Role updated from Analyst to Compliance Officer for David Kim',
      performedBy: 'Sarah Mitchell',
      timestamp: new Date('2026-02-20T14:25:00')
    },
    {
      type: 'user_suspended',
      description: 'User account suspended for Michael Brown',
      performedBy: 'Sarah Mitchell',
      timestamp: new Date('2026-02-10T17:00:00')
    },
    {
      type: 'login',
      description: 'Successful login from new device',
      performedBy: 'John Anderson',
      timestamp: new Date('2026-02-21T13:20:00')
    },
    {
      type: 'user_created',
      description: 'New user account created for Robert Wilson',
      performedBy: 'Sarah Mitchell',
      timestamp: new Date('2025-07-10T09:30:00')
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    ...availableRoles?.map(role => ({ value: role?.label, label: role?.label }))
  ];

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users?.filter(user => {
      const matchesSearch = user?.username?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                          user?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user?.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user?.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });

    filtered?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      if (sortConfig?.key === 'lastLogin') {
        aValue = aValue ? new Date(aValue)?.getTime() : 0;
        bValue = bValue ? new Date(bValue)?.getTime() : 0;
      }

      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, statusFilter, roleFilter, sortConfig]);

  const roleStats = useMemo(() => {
    const stats = {};
    users?.forEach(user => {
      stats[user.role] = (stats?.[user?.role] || 0) + 1;
    });
    return Object.entries(stats)?.map(([role, count]) => ({ role, count }));
  }, [users]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCreateUser = async (newUserData) => {
    try {
      const userData = {
        email: newUserData?.email,
        fullName: newUserData?.username,
        organizationId: currentUser?.organizationId,
        roleId: newUserData?.roleId,
        authenticationSource: newUserData?.authenticationSource || 'local_db',
        password: newUserData?.password,
        adConfigId: newUserData?.adConfigId
      };

      const result = await userService?.createUser(userData);

      if (result?.error) {
        toast?.error(result?.error?.message || 'Failed to create user');
        return;
      }

      await logActivity(
        currentUser?.userId,
        currentUser?.organizationId,
        'user_created',
        `user_management`,
        {
          newUserId: result?.data?.id || null,
          newUserEmail: newUserData?.email,
          newUserName: newUserData?.username,
          assignedRoleId: newUserData?.roleId,
          assignedRoleName: availableRoles?.find(r => r?.value === newUserData?.roleId)?.label || null,
          authenticationSource: newUserData?.authenticationSource || 'local_db'
        }
      );
      toast?.success(`User "${newUserData?.username}" created successfully`);
    } catch (error) {
      console.error('Create user error:', error);
      toast?.error('Failed to create user. Please try again.');
    }
  };

  const handleUpdateRole = async (userId, newRoleId, additionalUpdates) => {
    try {
      const roleLabel = availableRoles?.find(r => r?.value === newRoleId)?.label || 'User';
      const user = users?.find(u => u?.userId === userId);

      const updates = {
        role_id: newRoleId,
        ...additionalUpdates
      };

      const result = await userService?.updateUser(userId, updates);

      if (result?.error) {
        toast?.error(result?.error?.message || 'Failed to update user');
        return;
      }

      await logActivity(
        currentUser?.userId,
        currentUser?.organizationId,
        'user_role_updated',
        `user_management`,
        {
          targetUserId: userId,
          targetUserEmail: user?.email,
          targetUserName: user?.username,
          previousRoleId: user?.roleId || null,
          previousRoleName: user?.role || null,
          newRoleId: newRoleId,
          newRoleName: roleLabel
        }
      );
      toast?.success(`User "${user?.username}" updated successfully`);
    } catch (error) {
      console.error('Update user error:', error);
      toast?.error('Failed to update user. Please try again.');
    }
  };

  const handleSuspendUser = async (user) => {
    try {
      const newStatus = user?.status === 'Active' ? 'suspended' : 'active';

      const result = await userService?.updateUser(user?.userId, {
        status: newStatus
      });

      if (result) {
        const statusMessage = newStatus === 'suspended' ? 'User suspended successfully' : 'User activated successfully';
        await logActivity(
          currentUser?.userId,
          currentUser?.organizationId,
          newStatus === 'suspended' ? 'user_suspended' : 'user_activated',
          `user_management`,
          {
            targetUserId: user?.userId,
            targetUserEmail: user?.email,
            targetUserName: user?.username,
            previousStatus: user?.status,
            newStatus: newStatus === 'suspended' ? 'Suspended' : 'Active'
          }
        );
        toast?.success(statusMessage);
        setUsers(prevUsers => 
          prevUsers?.map(u => 
            u?.userId === user?.userId 
              ? { ...u, status: newStatus === 'active' ? 'Active' : 'Suspended' }
              : u
          )
        );
      }
    } catch (error) {
      console.error('Suspend/Activate user error:', error);
      toast?.error(error?.message || 'Failed to update user status. Please try again.');
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation />
      <main className={`transition-all duration-250 ${isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumb />
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="typography-h1 mb-2">
                  User Management
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage user accounts and role assignments for {currentUser?.branding?.organizationName || 'ComplianceHub'}
                </p>
              </div>
              <Button
                variant="default"
                iconName="UserPlus"
                iconPosition="left"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full md:w-auto"
                disabled={loadingRoles || !hasPermission('users.create')}
              >
                Create User
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon name="Loader2" size={48} className="mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="typography-body">Loading users...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <Icon name="AlertCircle" size={48} className="mx-auto text-destructive mb-4" />
              <p className="typography-body text-destructive mb-2">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location?.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg shadow-elevation-sm border border-border overflow-hidden">
                  {!hasPermission('users.view') ? (
                    <AccessRestricted
                      title="User Data Access Restricted"
                      reason="You don't have permission to view user data. Contact your administrator to request 'users.view' permission."
                      className="min-h-[400px]"
                    />
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                          <Input
                            type="search"
                            placeholder="Search by username or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e?.target?.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:flex md:gap-4">
                          <Select
                            placeholder="Status"
                            options={statusOptions}
                            value={statusFilter}
                            onChange={setStatusFilter}
                          />
                          <Select
                            placeholder="Role"
                            options={roleOptions}
                            value={roleFilter}
                            onChange={setRoleFilter}
                          />
                        </div>
                      </div>

                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="px-4 py-3 md:px-6 text-left">
                                <button
                                  onClick={() => handleSort('username')}
                                  className="flex items-center gap-2 typography-label text-muted-foreground hover:text-foreground transition-base"
                                >
                                  User
                                  <Icon 
                                    name={sortConfig?.key === 'username' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                                    size={16} 
                                  />
                                </button>
                              </th>
                              <th className="px-4 py-3 md:px-6 text-left">
                                <button
                                  onClick={() => handleSort('role')}
                                  className="flex items-center gap-2 typography-label text-muted-foreground hover:text-foreground transition-base"
                                >
                                  Role
                                  <Icon 
                                    name={sortConfig?.key === 'role' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                                    size={16} 
                                  />
                                </button>
                              </th>
                              <th className="px-4 py-3 md:px-6 text-left">
                                <button
                                  onClick={() => handleSort('status')}
                                  className="flex items-center gap-2 typography-label text-muted-foreground hover:text-foreground transition-base"
                                >
                                  Status
                                  <Icon 
                                    name={sortConfig?.key === 'status' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                                    size={16} 
                                  />
                                </button>
                              </th>
                              <th className="px-4 py-3 md:px-6 text-left">
                                <button
                                  onClick={() => handleSort('lastLogin')}
                                  className="flex items-center gap-2 typography-label text-muted-foreground hover:text-foreground transition-base"
                                >
                                  Last Login
                                  <Icon 
                                    name={sortConfig?.key === 'lastLogin' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                                    size={16} 
                                  />
                                </button>
                              </th>
                              <th className="px-4 py-3 md:px-6 text-left">
                                <span className="typography-label text-muted-foreground">Actions</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAndSortedUsers?.map(user => (
                              <UserTableRow
                                key={user?.userId}
                                user={user}
                                onEditRole={handleEditRole}
                                onSuspend={handleSuspendUser}
                                onViewDetails={handleViewDetails}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="lg:hidden space-y-4">
                        {filteredAndSortedUsers?.map(user => (
                          <UserMobileCard
                            key={user?.userId}
                            user={user}
                            onEditRole={handleEditRole}
                            onSuspend={handleSuspendUser}
                            onViewDetails={handleViewDetails}
                          />
                        ))}
                      </div>

                      {filteredAndSortedUsers?.length === 0 && (
                        <div className="text-center py-12">
                          <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                          <p className="typography-body mb-2">No users found</p>
                          <p className="typography-caption">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <RoleDistributionCard roleStats={roleStats} />
                <RecentActivityCard activities={recentActivities} />
              </div>
            </div>
          )}
        </div>
      </main>
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={handleCreateUser}
        availableRoles={availableRoles}
      />
      <EditRoleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        availableRoles={availableRoles}
        onUpdateRole={handleUpdateRole}
      />
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;