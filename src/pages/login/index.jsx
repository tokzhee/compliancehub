import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import AppIcon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithAzureAD, user, loading: authLoading } = useAuth();
  
  const [authMethod, setAuthMethod] = useState('database'); // 'database' or 'azure_ad'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adConfigId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null); // Changed to object: { type, message, canRetry }
  const [adConfigurations, setAdConfigurations] = useState([]);
  const [loadingAdConfigs, setLoadingAdConfigs] = useState(false);
  const [brandingConfig, setBrandingConfig] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Fetch branding configuration for login screen
  useEffect(() => {
    fetchBrandingConfig();
  }, []);

  const fetchBrandingConfig = async () => {
    try {
      // Fetch Ahlibank branding config
      const { data: orgData } = await supabase
        ?.from('organizations')
        ?.select('id, name')
        ?.eq('name', 'Ahlibank')
        ?.single();

      if (orgData?.id) {
        const { data: brandingData } = await supabase
          ?.from('branding_config')
          ?.select('*')
          ?.eq('organization_id', orgData?.id)
          ?.single();

        if (brandingData) {
          setBrandingConfig({
            logoUrl: brandingData?.logo_url,
            displayName: brandingData?.display_name || orgData?.name,
            primaryColor: brandingData?.primary_color,
            secondaryColor: brandingData?.secondary_color
          });
        }
      }
    } catch (err) {
      console.error('Error fetching branding config:', err);
    }
  };

  // Fetch AD configurations when AD auth method is selected
  useEffect(() => {
    if (authMethod === 'azure_ad') {
      fetchAdConfigurations();
    }
  }, [authMethod]);

  const fetchAdConfigurations = async () => {
    setLoadingAdConfigs(true);
    try {
      const { data, error } = await supabase
        ?.from('ad_configurations')
        ?.select('*')
        ?.eq('status', 'active')
        ?.order('config_name', { ascending: true });

      if (!error && data) {
        setAdConfigurations(data?.map(config => ({
          value: config?.id,
          label: config?.config_name,
          tenantId: config?.tenant_id,
          clientId: config?.client_id
        })));
      }
    } catch (err) {
      console.error('Error fetching AD configurations:', err);
    } finally {
      setLoadingAdConfigs(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (authMethod === 'database') {
      // Email validation
      if (!formData?.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      // Password validation
      if (!formData?.password) {
        newErrors.password = 'Password is required';
      } else if (formData?.password?.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (authMethod === 'azure_ad') {
      // AD configuration validation
      if (!formData?.adConfigId) {
        newErrors.adConfigId = 'Please select an AD configuration';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear auth error when user modifies form
    if (authError) {
      setAuthError(null);
      setRetryCount(0);
    }
  };

  // Error classification helper
  const classifyError = (error) => {
    if (!error) return null;

    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code || error?.status;

    // Network-related errors
    if (
      errorMessage?.includes('network') ||
      errorMessage?.includes('fetch') ||
      errorMessage?.includes('timeout') ||
      errorMessage?.includes('connection') ||
      errorMessage?.includes('econnrefused') ||
      errorCode === 'NETWORK_ERROR' ||
      errorCode === 'ETIMEDOUT' ||
      !navigator?.onLine
    ) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection and try again.',
        canRetry: true,
        icon: 'WifiOff',
        instructions: [
          'Check your internet connection',
          'Verify your network settings',
          'Try again in a few moments'
        ]
      };
    }

    // Invalid credentials
    if (
      errorMessage?.includes('invalid login credentials') ||
      errorMessage?.includes('invalid email or password') ||
      errorMessage?.includes('invalid password') ||
      errorCode === 'invalid_credentials'
    ) {
      return {
        type: 'invalid_credentials',
        message: 'Invalid email or password. Please check your credentials and try again.',
        canRetry: false,
        icon: 'AlertCircle',
        instructions: [
          'Verify your email address is correct',
          'Check that Caps Lock is off',
          'Ensure you\'re using the correct password',
          'Contact your administrator if you\'ve forgotten your password'
        ]
      };
    }

    // Account lockout / too many attempts
    if (
      errorMessage?.includes('too many') ||
      errorMessage?.includes('rate limit') ||
      errorMessage?.includes('locked') ||
      errorMessage?.includes('temporarily disabled') ||
      errorCode === 'over_request_rate_limit' ||
      errorCode === 'account_locked'
    ) {
      return {
        type: 'account_locked',
        message: 'Account temporarily locked due to too many failed login attempts.',
        canRetry: false,
        icon: 'Lock',
        instructions: [
          'Wait 15-30 minutes before trying again',
          'Contact your system administrator for immediate assistance',
          'Your account will automatically unlock after the waiting period'
        ]
      };
    }

    // Email not confirmed
    if (
      errorMessage?.includes('email not confirmed') ||
      errorMessage?.includes('email verification') ||
      errorCode === 'email_not_confirmed'
    ) {
      return {
        type: 'email_not_confirmed',
        message: 'Email address not verified. Please check your inbox for the verification email.',
        canRetry: false,
        icon: 'Mail',
        instructions: [
          'Check your email inbox for verification link',
          'Check your spam/junk folder',
          'Contact your administrator to resend verification email'
        ]
      };
    }

    // User not found
    if (
      errorMessage?.includes('user not found') ||
      errorMessage?.includes('no user') ||
      errorCode === 'user_not_found'
    ) {
      return {
        type: 'user_not_found',
        message: 'No account found with this email address.',
        canRetry: false,
        icon: 'UserX',
        instructions: [
          'Verify the email address is correct',
          'Contact your administrator to create an account',
          'Ensure you\'re using your work email address'
        ]
      };
    }

    // Account suspended/disabled
    if (
      errorMessage?.includes('suspended') ||
      errorMessage?.includes('disabled') ||
      errorMessage?.includes('deactivated') ||
      errorCode === 'user_banned'
    ) {
      return {
        type: 'account_suspended',
        message: 'Your account has been suspended or disabled.',
        canRetry: false,
        icon: 'Ban',
        instructions: [
          'Contact your system administrator immediately',
          'Your account may require reactivation',
          'Provide your email address when contacting support'
        ]
      };
    }

    // Generic error
    return {
      type: 'generic',
      message: error?.message || 'An unexpected error occurred. Please try again.',
      canRetry: true,
      icon: 'AlertTriangle',
      instructions: [
        'Try again in a few moments',
        'Contact support if the problem persists'
      ]
    };
  };

  // Exponential backoff calculation
  const calculateBackoffDelay = (attempt) => {
    // Base delay: 1 second, max delay: 16 seconds
    const baseDelay = 1000;
    const maxDelay = 16000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay;
  };

  // Retry login with exponential backoff
  const handleRetry = async () => {
    if (!authError?.canRetry) return;

    setIsRetrying(true);
    const delay = calculateBackoffDelay(retryCount);

    // Show retry delay to user
    const retryDelaySeconds = Math.ceil(delay / 1000);
    setAuthError(prev => ({
      ...prev,
      message: `Retrying in ${retryDelaySeconds} second${retryDelaySeconds > 1 ? 's' : ''}...`
    }));

    await new Promise(resolve => setTimeout(resolve, delay));

    setRetryCount(prev => prev + 1);
    setIsRetrying(false);
    
    // Retry the login
    await handleSubmit(null, true);
  };

  const handleSubmit = async (e, isRetry = false) => {
    if (e) e?.preventDefault();
    
    if (!isRetry) {
      setAuthError(null);
      setRetryCount(0);
    }

    // Handle Azure AD authentication
    if (authMethod === 'azure_ad') {
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        const selectedConfig = adConfigurations?.find(c => c?.value === formData?.adConfigId);
        
        if (!selectedConfig) {
          setAuthError({
            type: 'config_error',
            message: 'Selected AD configuration not found. Please try again.',
            canRetry: false,
            icon: 'AlertCircle',
            instructions: ['Select a valid AD configuration', 'Contact your administrator if the issue persists']
          });
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await signInWithAzureAD({
          id: selectedConfig?.value,
          tenantId: selectedConfig?.tenantId,
          clientId: selectedConfig?.clientId
        });

        if (error) {
          setAuthError(classifyError(error));
          setIsSubmitting(false);
          return;
        }

        // Success - navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Azure AD login error:', error);
        setAuthError(classifyError(error));
        setIsSubmitting(false);
      }
      return;
    }

    // Handle database authentication
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);

      if (error) {
        const classifiedError = classifyError(error);
        setAuthError(classifiedError);
        setIsSubmitting(false);
        return;
      }

      // Success - AuthContext will handle user state and UserContext will fetch profile
      // Navigation will happen via useEffect when user state updates
      setRetryCount(0);
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(classifyError(error));
      setIsSubmitting(false);
    }
  };

  const handleAuthMethodChange = (method) => {
    setAuthMethod(method);
    setAuthError(null);
    setErrors({});
    setFormData({ email: '', password: '', adConfigId: '' });
    setRetryCount(0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Logo - Show image if available, fallback to icon */}
            {brandingConfig?.logoUrl ? (
              <img
                src={brandingConfig?.logoUrl}
                alt={`${brandingConfig?.displayName || 'Organization'} logo`}
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center"
              style={{ display: brandingConfig?.logoUrl ? 'none' : 'flex' }}
            >
              <AppIcon name="Shield" size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {brandingConfig?.displayName || 'ComplianceHub'}
          </h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-6 md:p-8">
          {/* Authentication Method Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Authentication Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAuthMethodChange('database')}
                disabled={isSubmitting}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  authMethod === 'database' ?'border-primary bg-primary/10 text-primary font-medium' :'border-border bg-background text-muted-foreground hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <AppIcon name="Database" size={18} />
                <span className="text-sm">Database</span>
              </button>
              <button
                type="button"
                onClick={() => handleAuthMethodChange('azure_ad')}
                disabled={isSubmitting}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  authMethod === 'azure_ad' ?'border-primary bg-primary/10 text-primary font-medium' :'border-border bg-background text-muted-foreground hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <AppIcon name="Building2" size={18} />
                <span className="text-sm">Active Directory</span>
              </button>
            </div>
          </div>

          {authError && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              authError?.type === 'network' ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800' :
              authError?.type === 'account_locked' ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800' :
              authError?.type === 'invalid_credentials'? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800' : 'bg-error/10 border-error/20'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                <AppIcon 
                  name={authError?.icon || 'AlertCircle'} 
                  size={22} 
                  className={`flex-shrink-0 mt-0.5 ${
                    authError?.type === 'network' ? 'text-orange-600 dark:text-orange-400' :
                    authError?.type === 'account_locked' ? 'text-red-600 dark:text-red-400' :
                    authError?.type === 'invalid_credentials'? 'text-amber-600 dark:text-amber-400' : 'text-error'
                  }`}
                />
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-1 ${
                    authError?.type === 'network' ? 'text-orange-900 dark:text-orange-100' :
                    authError?.type === 'account_locked' ? 'text-red-900 dark:text-red-100' :
                    authError?.type === 'invalid_credentials'? 'text-amber-900 dark:text-amber-100' : 'text-error'
                  }`}>
                    {authError?.message}
                  </p>
                  {authError?.instructions && authError?.instructions?.length > 0 && (
                    <ul className={`text-xs space-y-1 mt-2 ${
                      authError?.type === 'network' ? 'text-orange-700 dark:text-orange-300' :
                      authError?.type === 'account_locked' ? 'text-red-700 dark:text-red-300' :
                      authError?.type === 'invalid_credentials'? 'text-amber-700 dark:text-amber-300' : 'text-error/80'
                    }`}>
                      {authError?.instructions?.map((instruction, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {authError?.canRetry && !isRetrying && (
                <Button
                  type="button"
                  onClick={handleRetry}
                  disabled={isSubmitting}
                  className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <AppIcon name="RefreshCw" size={16} />
                    Retry Connection {retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}
                  </span>
                </Button>
              )}
              {isRetrying && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-orange-700 dark:text-orange-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                  <span>Retrying...</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMethod === 'database' ? (
              <>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData?.email}
                  onChange={(e) => handleChange('email', e?.target?.value)}
                  error={errors?.email}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData?.password}
                  onChange={(e) => handleChange('password', e?.target?.value)}
                  error={errors?.password}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In with Database'
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-muted/30 rounded-lg p-4 border border-border mb-4">
                  <div className="flex items-start gap-3">
                    <AppIcon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Azure Active Directory Login</p>
                      <p>Select your organization's AD configuration and sign in with your Microsoft account.</p>
                    </div>
                  </div>
                </div>

                <Select
                  label="AD Configuration"
                  placeholder={loadingAdConfigs ? 'Loading configurations...' : 'Select AD configuration'}
                  options={adConfigurations}
                  value={formData?.adConfigId}
                  onChange={(value) => handleChange('adConfigId', value)}
                  error={errors?.adConfigId}
                  required
                  disabled={isSubmitting || loadingAdConfigs || adConfigurations?.length === 0}
                  description={adConfigurations?.length === 0 ? 'No AD configurations available. Please contact your administrator.' : ''}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !formData?.adConfigId}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing in with Azure AD...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <AppIcon name="Building2" size={18} />
                      Sign In with Azure AD
                    </span>
                  )}
                </Button>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 ComplianceHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;