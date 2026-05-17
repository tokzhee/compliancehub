import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../api/apiClient';   // ✅ Correct import
import { permissionService } from '../services/permissionService';
import { useToast } from './ToastContext';

const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  const { userProfile, loading: authLoading, profileLoading, signOut } = useAuth();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const redirectingRef = useRef(false);
  const isLoginPage = window.location.pathname === '/login';

  // Verify apiClient
  if (typeof apiClient?.get !== 'function') {
    console.error('UserContext: apiClient.get is not a function');
    if (process.env.NODE_ENV === 'development') {
      throw new Error('apiClient is not properly configured.');
    }
  }

  useEffect(() => {
    // 🚫 Do nothing on login page – no API calls
    if (isLoginPage) {
      setLoading(false);
      return;
    }

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
        const profileRoleName = userProfile?.roleName || userProfile?.role_name || null;
        const profilePermissions = Array.isArray(userProfile?.permissions) ? userProfile?.permissions : [];

        let organizationName = userProfile?.organizationName || userProfile?.organization_name || 'ComplianceHub';
        let brandingConfig = null;
        if (profileOrgId) {
          const orgResponse = await apiClient.get(`/api/organizations/${profileOrgId}`, {
            signal: controller.signal
          });
          if (!isMounted) return;
          const orgData = orgResponse?.data;
          if (orgData?.name) organizationName = orgData?.name;
          if (orgData?.branding) brandingConfig = orgData?.branding;
        }

        if (!isMounted) return;

        let roleName = profileRoleName;
        if (!roleName && profileRoleId) {
          const roleResponse = await apiClient.get(`/api/roles/${profileRoleId}`, {
            signal: controller.signal
          });
          if (!isMounted) return;
          const roleData = roleResponse?.data;
          if (roleData?.role_name || roleData?.roleName) {
            roleName = roleData?.role_name || roleData?.roleName;
          }
        }

        if (!isMounted) return;

        let permissions = profilePermissions;
        if (permissions?.length === 0 && profileRoleId) {
          const permResponse = await apiClient.get(`/api/roles/${profileRoleId}/permissions`, {
            signal: controller.signal
          });
          if (!isMounted) return;
          const permissionsData = permResponse?.data;
          if (permissionsData && permissionsData?.length > 0) {
            permissions = permissionsData?.map(p => `${p?.module}.${p?.action}`);
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
        
        // Handle 401 Unauthorized – cleanly sign out and redirect once
        if (error.response?.status === 401 && !redirectingRef.current) {
          redirectingRef.current = true;
          console.warn('UserContext: 401 Unauthorized – clearing session and redirecting');
          
          await signOut();
          
          // Also clear any lingering Authorization header from apiClient
          delete apiClient.defaults.headers.common['Authorization'];
          
          // Redirect to login page (only once)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return;
        }
        
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
  }, [userProfile, authLoading, profileLoading, toast, signOut, isLoginPage]);

  const hasPermission = (permission) => {
    if (!user?.permissions?.length) return false;
    if (user?.permissions?.includes(permission)) return true;
    if (user?.permissions?.includes('FULL_ACCESS')) return true;
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

  const refreshPermissions = async () => {
    if (!user?.roleId) {
      console.warn('UserContext.refreshPermissions: No roleId available');
      return [];
    }
    try {
      const freshPermissions = await permissionService?.refreshUserPermissions(user?.roleId);
      if (freshPermissions?.length > 0) {
        setUser(prev => ({ ...prev, permissions: freshPermissions }));
      }
      return freshPermissions;
    } catch (error) {
      console.error('Failed to refresh permissions:', error?.message);
      toast?.error?.('Failed to refresh permissions.');
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