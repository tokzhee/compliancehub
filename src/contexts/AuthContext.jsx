import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';
import { useToast } from './ToastContext';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState(null)
  const toast = useToast();

  const loadProfileFromApi = async (userId, signal) => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const response = await apiClient?.get('/api/auth/profile', {
        params: { userId },
        ...(signal ? { signal } : {})
      });
      const data = response?.data;

      if (data) {
        // API returns an array — always use index 0
        const raw = Array.isArray(data) ? data?.[0] : (data?.data || data?.user || data?.profile || data?.result || data?.payload || data);

        if (!raw) {
          console.warn('AuthContext [loadProfileFromApi]: Could not extract profile object from response');
          toast?.warning?.('User profile data could not be loaded. Some features may be limited.');
          return;
        }

        // Parse permissionList comma-separated string into array
        const permissionList = raw?.permissionList || raw?.permission_list || '';
        const permissions = typeof permissionList === 'string' && permissionList?.length > 0 ? permissionList?.split(',')?.map(p => p?.trim())?.filter(Boolean)
          : (Array.isArray(permissionList) ? permissionList : []);

        const normalized = {
          // Spread raw fields so nothing is lost
          ...raw,
          // Canonical id field
          id: raw?.userId || raw?.id || userId,
          userId: raw?.userId || raw?.id || userId,
          // Name fields
          fullName: raw?.fullName || raw?.full_name || '',
          full_name: raw?.full_name || raw?.fullName || '',
          // Email
          email: raw?.email || '',
          // Username
          username: raw?.username || '',
          // Organization
          organizationId: raw?.organizationId || raw?.organization_id || '',
          organization_id: raw?.organization_id || raw?.organizationId || '',
          organizationName: raw?.organizationName || raw?.organization_name || '',
          organizationCode: raw?.organizationCode || raw?.organization_code || '',
          // Role
          roleId: raw?.roleId || raw?.role_id || '',
          role_id: raw?.role_id || raw?.roleId || '',
          roleName: raw?.roleName || raw?.role_name || '',
          roleDescription: raw?.roleDescription || raw?.role_description || '',
          // Permissions
          permissions,
          permissionList: raw?.permissionList || raw?.permission_list || '',
          // Status
          isActive: raw?.isActive ?? raw?.is_active ?? true,
        };

        setUserProfile(normalized);
      }
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
      console.error('AuthContext: REST profile load error:', error?.message);
      toast?.error?.('Failed to load user profile. Please refresh or log in again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const restoreApiSession = async () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const storedUserId = localStorage.getItem('user_id');

    if (!token || !storedUserId) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient?.get('/api/auth/session', {
        params: { userId: storedUserId, refreshToken }
      });
      const sessionData = response?.data;
      if (sessionData) {
        const userData = {
          id: sessionData?.userId || storedUserId,
          email: sessionData?.email,
          name: sessionData?.fullName,
        };
        setUser(userData);
        setAuthMethod('api');
        await loadProfileFromApi(userData?.id);
      }
    } catch (error) {
      console.error('AuthContext: Session restore error:', error?.message);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const restoreApiSessionSafe = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const storedUserId = localStorage.getItem('user_id');

      if (!token || !storedUserId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await apiClient?.get('/api/auth/session', {
          params: { userId: storedUserId, refreshToken },
          signal: controller?.signal
        });
        if (!isMounted) return;
        const sessionData = response?.data;
        if (sessionData) {
          const userData = {
            id: sessionData?.userId || storedUserId,
            email: sessionData?.email,
            name: sessionData?.fullName,
          };
          setUser(userData);
          setAuthMethod('api');
          await loadProfileFromApi(userData?.id, controller?.signal);
        }
      } catch (error) {
        if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
        console.error('AuthContext: Session restore error:', error?.message);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreApiSessionSafe();

    return () => {
      isMounted = false;
      controller?.abort();
    };
  }, []);

  const signIn = async (username, password) => {
    try {
      const response = await apiClient?.post('/api/auth/login', { username, password });
      const data = response?.data;

      const accessToken = data?.access_token || data?.accessToken || data?.token;
      const refreshToken = data?.refresh_token || data?.refreshToken;

      let userId = data?.userId || data?.user?.id;
      if (!userId && accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken?.split('.')?.[1]));
          userId = payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            || payload?.sub
            || payload?.userId
            || payload?.user_id;
        } catch (e) {
          console.error('AuthContext: Failed to decode JWT payload:', e?.message);
        }
      }

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      if (userId) {
        localStorage.setItem('user_id', userId);
      }

      const userData = {
        id: userId,
        email: data?.email || data?.user?.email,
        name: data?.fullName || data?.user?.fullName,
      };

      setUser(userData);
      setAuthMethod('api');

      if (userId) {
        await loadProfileFromApi(userId);
      }

      return { data, error: null };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      return { data: null, error: { message } };
    }
  };

  const signOut = async () => {
    try {
      try {
        await apiClient?.post('/api/auth/logout');
      } catch (e) {
        // Ignore logout API errors - clear local state regardless
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      setUser(null);
      setAuthMethod(null);
      setUserProfile(null);
      setProfileLoading(false);
      return { error: null };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } };
    try {
      const response = await apiClient?.put(`/api/users/${user?.id}`, updates);
      const data = response?.data;
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    authMethod,
    useRestApi: true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
