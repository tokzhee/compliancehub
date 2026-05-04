import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { supabase } from '../lib/supabase';

const createMsalConfig = (tenantId, clientId, redirectUri) => ({
  auth: {
    clientId: clientId || '',
    authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
    redirectUri: redirectUri || window.location?.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
});

const loginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'],
};

let msalInstance = null;

const initializeMsal = (tenantId, clientId, redirectUri) => {
  const config = createMsalConfig(tenantId, clientId, redirectUri);
  msalInstance = new PublicClientApplication(config);
  return msalInstance;
};

export const azureAdService = {
  /**
   * Sign in with Azure AD using popup with dynamic configuration
   * @param {Object} adConfig - AD configuration object with tenantId, clientId
   * @returns {Promise<{data: object, error: object}>}
   */
  async signInWithPopup(adConfig = null) {
    try {
      // Use provided AD config or fall back to environment variables
      const tenantId = adConfig?.tenantId || import.meta.env?.VITE_AZURE_AD_TENANT_ID;
      const clientId = adConfig?.clientId || import.meta.env?.VITE_AZURE_AD_CLIENT_ID;
      const redirectUri = import.meta.env?.VITE_AZURE_AD_REDIRECT_URI || window.location?.origin;

      if (!tenantId || !clientId) {
        return {
          data: null,
          error: { message: 'Azure AD configuration is missing. Please contact your administrator.' }
        };
      }

      const msal = initializeMsal(tenantId, clientId, redirectUri);
      await msal?.initialize();

      const response = await msal?.loginPopup(loginRequest);
      
      if (!response?.account) {
        return { 
          data: null, 
          error: { message: 'No account information received from Azure AD' } 
        };
      }

      // Extract user information
      const { account, idToken } = response;
      const userEmail = account?.username || account?.email;
      const userName = account?.name || userEmail;

      // Find or create user profile in Supabase
      const profileResult = await this.syncUserProfile({
        email: userEmail,
        name: userName,
        azureAdId: account?.homeAccountId,
        idToken: idToken,
        adConfigId: adConfig?.id || null
      });

      if (profileResult?.error) {
        return { data: null, error: profileResult?.error };
      }

      return {
        data: {
          user: {
            email: userEmail,
            name: userName,
            id: profileResult?.data?.id,
          },
          account: account,
          profile: profileResult?.data,
          authMethod: 'azure_ad',
        },
        error: null,
      };
    } catch (error) {
      console.error('Azure AD login error:', error);
      
      if (error instanceof InteractionRequiredAuthError) {
        return { 
          data: null, 
          error: { message: 'User interaction required. Please try again.' } 
        };
      }

      return { 
        data: null, 
        error: { message: error?.message || 'Azure AD authentication failed' } 
      };
    }
  },

  /**
   * Sign in with Azure AD using redirect with dynamic configuration
   * @param {Object} adConfig - AD configuration object with tenantId, clientId
   * @returns {Promise<void>}
   */
  async signInWithRedirect(adConfig = null) {
    try {
      // Use provided AD config or fall back to environment variables
      const tenantId = adConfig?.tenantId || import.meta.env?.VITE_AZURE_AD_TENANT_ID;
      const clientId = adConfig?.clientId || import.meta.env?.VITE_AZURE_AD_CLIENT_ID;
      const redirectUri = import.meta.env?.VITE_AZURE_AD_REDIRECT_URI || window.location?.origin;

      if (!tenantId || !clientId) {
        return {
          data: null,
          error: { message: 'Azure AD configuration is missing. Please contact your administrator.' }
        };
      }

      const msal = initializeMsal(tenantId, clientId, redirectUri);
      await msal?.initialize();
      await msal?.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Azure AD redirect error:', error);
      throw error;
    }
  },

  /**
   * Handle redirect response after Azure AD login
   * @returns {Promise<{data: object, error: object}>}
   */
  async handleRedirectResponse() {
    try {
      const msal = initializeMsal();
      await msal?.initialize();
      
      const response = await msal?.handleRedirectPromise();
      
      if (!response) {
        return { data: null, error: null };
      }

      const { account, idToken } = response;
      const userEmail = account?.username || account?.email;
      const userName = account?.name || userEmail;

      const profileResult = await this.syncUserProfile({
        email: userEmail,
        name: userName,
        azureAdId: account?.homeAccountId,
        idToken: idToken,
      });

      if (profileResult?.error) {
        return { data: null, error: profileResult?.error };
      }

      return {
        data: {
          user: {
            email: userEmail,
            name: userName,
            id: profileResult?.data?.id,
          },
          account: account,
          profile: profileResult?.data,
          authMethod: 'azure_ad',
        },
        error: null,
      };
    } catch (error) {
      console.error('Handle redirect error:', error);
      return { 
        data: null, 
        error: { message: error?.message || 'Failed to process Azure AD response' } 
      };
    }
  },

  /**
   * Sync Azure AD user with Supabase user_profiles table
   * @param {object} userData - User data from Azure AD
   * @returns {Promise<{data: object, error: object}>}
   */
  async syncUserProfile(userData) {
    try {
      const { email, name, azureAdId } = userData;

      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('email', email)
        ?.single();

      if (fetchError && fetchError?.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        return { data: null, error: fetchError };
      }

      if (existingProfile) {
        // Update existing profile with Azure AD info
        const { data: updatedProfile, error: updateError } = await supabase
          ?.from('user_profiles')
          ?.update({ 
            azure_ad_id: azureAdId,
            last_login: new Date()?.toISOString(),
          })
          ?.eq('id', existingProfile?.id)
          ?.select()
          ?.single();

        if (updateError) {
          return { data: null, error: updateError };
        }

        return { data: updatedProfile, error: null };
      }

      // For new users, return error - they should be created in Supabase first
      return { 
        data: null, 
        error: { 
          message: 'User profile not found. Please contact your administrator to create your account.' 
        } 
      };
    } catch (error) {
      console.error('Sync user profile error:', error);
      return { 
        data: null, 
        error: { message: 'Failed to sync user profile' } 
      };
    }
  },

  /**
   * Sign out from Azure AD
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const msal = initializeMsal();
      await msal?.initialize();
      
      const accounts = msal?.getAllAccounts();
      if (accounts?.length > 0) {
        await msal?.logoutPopup({
          account: accounts?.[0],
        });
      }
    } catch (error) {
      console.error('Azure AD sign out error:', error);
      throw error;
    }
  },

  /**
   * Get current Azure AD account
   * @returns {object|null}
   */
  getCurrentAccount() {
    try {
      const msal = initializeMsal();
      const accounts = msal?.getAllAccounts();
      return accounts?.length > 0 ? accounts?.[0] : null;
    } catch (error) {
      console.error('Get current account error:', error);
      return null;
    }
  },
};

export default azureAdService;