import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { permissionService } from '../services/permissionService';

const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  const { userProfile, loading: authLoading, profileLoading } = useAuth();
  
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      console.log('UserContext: fetchUserDetails called', {
        authLoading,
        profileLoading,
        hasUserProfile: !!userProfile,
        userProfileId: userProfile?.id,
        userProfileEmail: userProfile?.email,
        userProfileOrgId: userProfile?.organization_id,
        userProfileRoleId: userProfile?.role_id
      });

      // Wait for both auth and profile to finish loading
      if (authLoading || profileLoading) {
        console.log('UserContext: Still loading (authLoading:', authLoading, ', profileLoading:', profileLoading, ')');
        setLoading(true);
        return;
      }

      if (!userProfile) {
        console.warn('UserContext: No userProfile from AuthContext after loading completed. User may not be authenticated or profile failed to load.');
        console.log('UserContext: No userProfile, clearing user state');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (userProfile) {
        try {
          console.log('UserContext: Loading user profile data:', {
            id: userProfile?.id,
            email: userProfile?.email,
            full_name: userProfile?.full_name,
            organization_id: userProfile?.organization_id,
            role_id: userProfile?.role_id
          });

          // Fetch organization name
          let organizationName = 'ComplianceHub';
          let brandingConfig = null;
          if (userProfile?.organization_id) {
            const { data: orgData, error: orgError } = await supabase
              ?.from('organizations')
              ?.select('name')
              ?.eq('id', userProfile?.organization_id)
              ?.single();
            
            if (orgError) {
              console.error('Error fetching organization:', orgError);
            } else if (orgData?.name) {
              organizationName = orgData?.name;
              console.log('UserContext: Organization name loaded:', organizationName);
            } else {
              console.warn('UserContext: Organization data returned but no name field');
            }

            // Fetch branding configuration
            const { data: brandingData, error: brandingError } = await supabase
              ?.from('branding_config')
              ?.select('*')
              ?.eq('organization_id', userProfile?.organization_id)
              ?.single();
            
            if (brandingError) {
              console.error('Error fetching branding config:', brandingError);
            } else if (brandingData) {
              brandingConfig = brandingData;
              console.log('UserContext: Branding config loaded:', brandingConfig);
            }
          } else {
            console.warn('UserContext: No organization_id in userProfile');
          }

          // Fetch role name
          let roleName = null;
          if (userProfile?.role_id) {
            const { data: roleData, error: roleError } = await supabase
              ?.from('roles')
              ?.select('role_name')
              ?.eq('id', userProfile?.role_id)
              ?.single();
            
            if (roleError) {
              console.error('Error fetching role:', roleError);
            } else if (roleData?.role_name) {
              roleName = roleData?.role_name;
              console.log('UserContext: Role name loaded:', roleName);
            }
          }

          // Fetch role permissions
          let permissions = [];
          if (userProfile?.role_id) {
            const { data: permissionsData, error: permissionsError } = await supabase
              ?.from('role_permissions')
              ?.select('module, action')
              ?.eq('role_id', userProfile?.role_id);
            
            if (permissionsError) {
              console.error('Error fetching permissions:', permissionsError);
            } else if (permissionsData && permissionsData?.length > 0) {
              permissions = permissionsData?.map(p => `${p?.module}.${p?.action}`);
              console.log('UserContext: Permissions loaded:', permissions?.length, 'permissions');
            } else {
              console.warn('UserContext: No permissions found for role_id:', userProfile?.role_id);
            }
          }

          const mappedUser = {
            userId: userProfile?.id,
            organizationId: userProfile?.organization_id,
            roleId: userProfile?.role_id,
            name: userProfile?.full_name || 'User',
            email: userProfile?.email,
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
          
          console.log('UserContext: Setting user state with:', {
            name: mappedUser?.name,
            organizationName: mappedUser?.branding?.organizationName,
            organizationId: mappedUser?.organizationId,
            roleName: mappedUser?.roleName
          });

          setUser(mappedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      } else {
        console.log('UserContext: No userProfile, clearing user state');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    fetchUserDetails();
  }, [userProfile, authLoading, profileLoading]);

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions) => {
    return permissions?.some(permission => hasPermission(permission));
  };

  /**
   * Force-refresh permissions from Supabase, bypassing any cache.
   * Call this on screens that rely on recently-migrated permissions.
   * @returns {Promise<string[]>} Updated permissions array
   */
  const refreshPermissions = async () => {
    if (!user?.roleId) {
      console.warn('UserContext.refreshPermissions: No roleId available, skipping refresh');
      return [];
    }

    const freshPermissions = await permissionService?.refreshUserPermissions(user?.roleId);

    if (freshPermissions?.length > 0) {
      setUser(prev => ({
        ...prev,
        permissions: freshPermissions
      }));
    }

    return freshPermissions;
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