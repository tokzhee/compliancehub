import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient, { tokenStorage } from '../api/apiClient';
import { useToast } from './ToastContext';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

const normalizeProfile = (raw, fallbackUserId) => {
  if (!raw) return null;
  const permissionList = raw?.permissionList || raw?.permission_list || '';
  const permissions =
    typeof permissionList === 'string' && permissionList?.length > 0 ? permissionList?.split(',')?.map((p) => p?.trim())?.filter(Boolean)
      : Array.isArray(permissionList)
      ? permissionList
      : [];

  return {
    ...raw,
    id: raw?.userId || raw?.id || fallbackUserId,
    userId: raw?.userId || raw?.id || fallbackUserId,
    fullName: raw?.fullName || raw?.full_name || '',
    full_name: raw?.full_name || raw?.fullName || '',
    email: raw?.email || '',
    username: raw?.username || '',
    organizationId: raw?.organizationId || raw?.organization_id || '',
    organization_id: raw?.organization_id || raw?.organizationId || '',
    organizationName: raw?.organizationName || raw?.organization_name || '',
    organizationCode: raw?.organizationCode || raw?.organization_code || '',
    roleId: raw?.roleId || raw?.role_id || '',
    role_id: raw?.role_id || raw?.roleId || '',
    roleName: raw?.roleName || raw?.role_name || '',
    roleDescription: raw?.roleDescription || raw?.role_description || '',
    permissions,
    permissionList: raw?.permissionList || raw?.permission_list || '',
    isActive: raw?.isActive ?? raw?.is_active ?? true,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState(null)
  const toast = useToast();

  // ─── Load profile from API ────────────────────────────────────────────────
  const loadProfileFromApi = useCallback(async (userId, signal) => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const response = await apiClient?.get('/api/auth/profile', {
        params: { userId },
        ...(signal ? { signal } : {}),
      });
      const data = response?.data;
      if (!data) return;

      const raw = Array.isArray(data)
        ? data?.[0]
        : data?.data || data?.user || data?.profile || data?.result || data?.payload || data;

      if (!raw) {
        console.warn('AuthContext: Could not extract profile from response');
        toast?.warning?.('User profile data could not be loaded. Some features may be limited.');
        return;
      }

      setUserProfile(normalizeProfile(raw, userId));
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
      console.error('AuthContext: Profile load error:', error?.message);
      toast?.error?.('Failed to load user profile. Please refresh or log in again.');
    } finally {
      setProfileLoading(false);
    }
  }, [toast]);

  // ─── Session restoration on mount ────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const restoreSession = async () => {
      const token = tokenStorage?.getAccessToken();
      const storedUserId = tokenStorage?.getUserId();

      // No stored credentials — nothing to restore
      if (!token || !storedUserId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // Validate the stored token by fetching the profile directly.
        // If the token is expired the apiClient interceptor will attempt
        // a refresh automatically before this call fails.
        const response = await apiClient?.get('/api/auth/profile', {
          params: { userId: storedUserId },
          signal: controller?.signal,
        });

        if (!isMounted) return;

        const data = response?.data;
        const raw = Array.isArray(data)
          ? data?.[0]
          : data?.data || data?.user || data?.profile || data?.result || data?.payload || data;

        if (raw) {
          const profile = normalizeProfile(raw, storedUserId);
          setUser({
            id: profile?.id,
            email: profile?.email,
            name: profile?.fullName,
          });
          setUserProfile(profile);
          setAuthMethod('api');
        } else {
          // Profile fetch succeeded but returned empty — clear stale tokens
          tokenStorage?.clearTokens();
        }
      } catch (error) {
        if (error?.name === 'CanceledError' || error?.name === 'AbortError') return;
        // Token invalid / refresh failed — clear storage so user sees login
        console.warn('AuthContext: Session restore failed, clearing tokens:', error?.message);
        tokenStorage?.clearTokens();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    // Listen for forced logout events dispatched by the apiClient interceptor
    const handleForceLogout = () => {
      if (!isMounted) return;
      setUser(null);
      setUserProfile(null);
      setAuthMethod(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);

    return () => {
      isMounted = false;
      controller?.abort();
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, []);

  // ─── Sign in ──────────────────────────────────────────────────────────────
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
          userId =
            payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            payload?.sub ||
            payload?.userId ||
            payload?.user_id;
        } catch (e) {
          console.error('AuthContext: Failed to decode JWT payload:', e?.message);
        }
      }

      // Persist tokens
      if (accessToken) localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      if (userId) localStorage.setItem('user_id', userId);

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
      const message =
        error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      return { data: null, error: { message } };
    }
  };

  // ─── Sign out ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      try {
        await apiClient?.post('/api/auth/logout');
      } catch {
        // Ignore logout API errors — always clear local state
      }
      tokenStorage?.clearTokens();
      setUser(null);
      setAuthMethod(null);
      setUserProfile(null);
      setProfileLoading(false);
      return { error: null };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  // ─── Update profile ───────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } };
    try {
      const response = await apiClient?.put(`/api/users/${user?.id}`, updates);
      const data = response?.data;
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Profile update failed.';
      return { data: null, error: { message } };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    authMethod,
    signIn,
    signOut,
    updateProfile,
    loadProfileFromApi,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
