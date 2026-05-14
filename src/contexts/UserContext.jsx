import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../lib/apiClient';
import { permissionService } from '../services/permissionService';
import { useToast } from './ToastContext';

const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  const { userProfile, loading: authLoading, profileLoading } = useAuth();
  const toast = useToast();
  
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUserDetails = async () => {
      if (authLoading || profileLoading) {
        if (isMounted) setLoading(true);
        return;
      }

      if (!userProfile) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        const profileId = userProfile?.id || userProfile?.userId;
        const profileEmail = userProfile?.email;
        const profileFullName = userProfile?.full_name || userProfile?.fullName;
        const profileOrgId = userProfile?.organization_id || userProfile?.organizationId;
        const profileRoleId = userProfile?.role_id || userProfile?.roleId;
        // Use roleName and permissions already parsed in AuthContext from the profile response
        const profileRoleName = userProfile?.roleName || userProfile?.role_name || null;
        const profilePermissions = Array.isArray(userProfile?.permissions) ? userProfile?.permissions : [];

        // Fetch organization and branding via REST API
        let organizationName = userProfile?.organizationName || userProfile?.organization_name || 'ComplianceHub';
        let brandingConfig = null;
        if (profileOrgId) {
          try {
            const orgResponse = await apiClient?.get(`/api/organizations/${profileOrgId}`, {
              signal: controller?.signal
            });
            if (!isMounted) return;
            const orgData = orgResponse?.data;
            if (orgData?.name) organizationName = orgData?.name;
            if (orgData?.branding) brandingConfig = orgData?.branding;
          } catch (error) {
            if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
            console.error('Error fetching organization:', error?.message);
            // Fallback: continue with organizationName from profile; no toast needed as it's non-critical
          }
        } else {
          console.warn('UserContext: No organization_id in userProfile');
        }

        if (!isMounted) return;

        // Use roleName from profile; only fetch from API if not already available
        let roleName = profileRoleName;
        if (!roleName && profileRoleId) {
          try {
            const roleResponse = await apiClient?.get(`/api/roles/${profileRoleId}`, {
              signal: controller?.signal
            });
            if (!isMounted) return;
            const roleData = roleResponse?.data;
            if (roleData?.role_name || roleData?.roleName) {
              roleName = roleData?.role_name || roleData?.roleName;
            }
          } catch (error) {
            if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
            console.error('Error fetching role:', error?.message);
            toast?.warning?.('Could not load role information. Displaying with limited role details.');
            // Fallback: roleName stays null — user can still operate with reduced info
          }
        }

        if (!isMounted) return;

        // Use permissions from profile; only fetch from API if not already available
        let permissions = profilePermissions;
        if (permissions?.length === 0 && profileRoleId) {
          try {
            const permResponse = await apiClient?.get(`/api/roles/${profileRoleId}/permissions`, {
              signal: controller?.signal
            });
            if (!isMounted) return;
            const permissionsData = permResponse?.data;
            if (permissionsData && permissionsData?.length > 0) {
              permissions = permissionsData?.map(p => `${p?.module}.${p?.action}`);
            }
          } catch (error) {
            if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
            console.error('Error fetching permissions:', error?.message);
            toast?.error?.('Failed to load permissions. Some features may be restricted. Please refresh the page.');
            // Fallback: permissions stays empty array — access-restricted UI will handle gating
          }
        }

        if (!isMounted) return;

        const mappedUser = {
          userId: profileId,
          organizationId: profileOrgId,
          roleId: profileRoleId,
          name: profileFullName || 'User',
          email: profileEmail,
          roleName: roleName,
          permissions: permissions,
          branding: {
            primaryColor: brandingConfig?.primary_color || '#1E3A5F',
            secondaryColor: brandingConfig?.secondary_color || '#4A6B8A',
            accentColor: '#B87333',
            logoUrl: brandingConfig?.logo_url || null,
            organizationName: brandingConfig?.display_name || organizationName
          }
        };

        if (isMounted) {
          setUser(mappedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
        console.error('Error fetching user details:', error);
        toast?.error?.('Failed to load user details. Please refresh the page or log in again.');
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserDetails();

    return () => {
      isMounted = false;
      controller?.abort();
    };
  }, [userProfile, authLoading, profileLoading]);

  const hasPermission = (permission) => {
    if (!user?.permissions?.length) return false;
    // Direct match (e.g. 'VIEW_DATASETS')
    if (user?.permissions?.includes(permission)) return true;
    // FULL_ACCESS grants everything
    if (user?.permissions?.includes('FULL_ACCESS')) return true;
    // Map dot-notation permission keys used in the dashboard to API uppercase strings
    const permissionMap = {
      'datasets.view_count': ['VIEW_DATASETS', 'VIEW_DASHBOARD'],
      'cases.view_count': ['VIEW_CASES', 'VIEW_DASHBOARD'],
      'rules.view_count': ['VIEW_RULES', 'VIEW_DASHBOARD'],
      'reporting.view_count': ['VIEW_REPORTING', 'VIEW_DASHBOARD'],
      'submissions.view_count': ['VIEW_SUBMISSIONS', 'VIEW_DASHBOARD'],
      'enrichment.view_count': ['VIEW_ENRICHMENT', 'VIEW_DASHBOARD'],
      'users.view_count': ['VIEW_USERS', 'VIEW_ADMIN_METRICS'],
      'roles.view_count': ['VIEW_ROLES', 'VIEW_ADMIN_METRICS'],
      'sessions.view_count': ['VIEW_ADMIN_METRICS'],
      'ldap.view_count': ['VIEW_AD_CONFIG', 'MANAGE_AD_CONFIG'],
      'reports.view_count': ['VIEW_REPORTING', 'VIEW_DASHBOARD'],
    };
    const mapped = permissionMap?.[permission];
    if (mapped) {
      return mapped?.some(p => user?.permissions?.includes(p));
    }
    return false;
  };

  const hasAnyPermission = (permissions) => {
    return permissions?.some(permission => hasPermission(permission));
  };

  /**
   * Force-refresh permissions from REST API, bypassing any cache.
   * @returns {Promise<string[]>} Updated permissions array
   */
  const refreshPermissions = async () => {
    if (!user?.roleId) {
      console.warn('UserContext.refreshPermissions: No roleId available, skipping refresh');
      return [];
    }

    try {
      const freshPermissions = await permissionService?.refreshUserPermissions(user?.roleId);

      if (freshPermissions?.length > 0) {
        setUser(prev => ({
          ...prev,
          permissions: freshPermissions
        }));
      }

      return freshPermissions;
    } catch (error) {
      console.error('UserContext.refreshPermissions: Failed to refresh permissions:', error?.message);
      toast?.error?.('Failed to refresh permissions. Please reload the page.');
      return user?.permissions || [];
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    hasPermission,
    hasAnyPermission,
    refreshPermissions,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserContextProvider');
  }
  return context;
};

export default UserContext;