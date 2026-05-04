import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import apiClient from '../lib/apiClient';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
const useRestApi = !!API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState(null)

  // Load profile via REST API
  const loadProfileFromApi = async (userId) => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const response = await apiClient?.get('/api/auth/profile', { params: { userId } });
      const data = response?.data;
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('AuthContext: REST profile load error:', error?.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Load profile via Supabase (fallback)
  const loadProfileFromSupabase = async (userId) => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();
      if (error) {
        console.error('AuthContext: Profile load error:', error);
      }
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('AuthContext: Profile load exception:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const profileOperations = {
    async load(userId) {
      if (useRestApi) {
        await loadProfileFromApi(userId);
      } else {
        await loadProfileFromSupabase(userId);
      }
    },
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  // Restore session from REST API
  const restoreApiSession = async () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const storedUserId = localStorage.getItem('user_id');

    if (!token && !refreshToken) {
      setLoading(false);
      return;
    }

    try {
      if (storedUserId) {
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
    if (useRestApi) {
      restoreApiSession();
    } else {
      // Supabase auth flow
      supabase?.auth?.getSession()?.then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setAuthMethod('database');
          loadProfileFromSupabase(session?.user?.id);
        }
      });

      const { data: { subscription } } = supabase?.auth?.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setAuthMethod('database');
          loadProfileFromSupabase(session?.user?.id);
        } else {
          setAuthMethod(null);
          profileOperations?.clear();
        }
      });

      return () => subscription?.unsubscribe();
    }
  }, []);

  // Sign in via REST API
  const signInWithApi = async (username, password) => {
    try {
      const response = await apiClient?.post('/api/auth/login', { username, password });
      const data = response?.data;

      const accessToken = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken;
      const userId = data?.userId || data?.user?.id;

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

  // Sign in via Supabase (fallback)
  const signIn = async (email, password) => {
    if (useRestApi) {
      return signInWithApi(email, password);
    }
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({ email, password });
      if (!error) {
        setAuthMethod('database');
      }
      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const signOut = async () => {
    try {
      if (useRestApi) {
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
        profileOperations?.clear();
        return { error: null };
      }

      const { error } = await supabase?.auth?.signOut();
      if (error) return { error };
      setUser(null);
      setAuthMethod(null);
      profileOperations?.clear();
      return { error: null };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } };
    try {
      if (useRestApi) {
        const response = await apiClient?.put(`/api/users/${user?.id}`, updates);
        const data = response?.data;
        setUserProfile(data);
        return { data, error: null };
      }
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single();
      if (!error) setUserProfile(data);
      return { data, error };
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
    useRestApi,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
