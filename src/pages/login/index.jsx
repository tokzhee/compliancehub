import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import AppIcon from '../../components/AppIcon';
import apiClient from '../../lib/apiClient';
import { logActivity } from '../../services/activityService';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithAzureAD, user, loading: authLoading } = useAuth();
  
  const [authMethod, setAuthMethod] = useState('database');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    adConfigId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [adConfigurations, setAdConfigurations] = useState([]);
  const [loadingAdConfigs, setLoadingAdConfigs] = useState(false);
  const [brandingConfig, setBrandingConfig] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Debug panel state
  const [debugLog, setDebugLog] = useState(null);
  const [debugExpanded, setDebugExpanded] = useState(true);

  // Detect mixed-content / unreachable API on mount
  useEffect(() => {
    const apiBase = import.meta.env?.VITE_API_BASE_URL || '';
    if (
      apiBase &&
      window.location?.protocol === 'https:' && apiBase?.startsWith('http://')
    ) {
      setAuthError({
        type: 'mixed_content',
        message: 'Cannot connect to the API server. The app is running on HTTPS but the API URL uses HTTP, which browsers block for security.',
        canRetry: false,
        icon: 'ShieldOff',
        instructions: [
          `API URL: ${apiBase}`,
          'The server must be accessible over HTTPS (https://) to work from this app',
          'Contact your administrator to enable HTTPS on the API server or configure a secure proxy'
        ]
      });
    }
  }, []);

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
    // Use local branding immediately — API endpoint is unreliable/unavailable at login time
    setBrandingConfig({
      logoUrl: '/assets/images/image-1771788194868.png',
      displayName: 'Ahlibank',
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6'
    });
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
      const response = await apiClient?.get('/api/ad-configurations', {
        params: { status: 'active' }
      });
      const data = response?.data || [];
      setAdConfigurations(data?.map(config => ({
        value: config?.id,
        label: config?.config_name || config?.configName,
        tenantId: config?.tenant_id || config?.tenantId,
        clientId: config?.client_id || config?.clientId
      })));
    } catch (err) {
      console.error('Error fetching AD configurations:', err?.message);
    } finally {
      setLoadingAdConfigs(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (authMethod === 'database') {
      if (!formData?.username) {
        newErrors.username = 'Username is required';
      }
      if (!formData?.password) {
        newErrors.password = 'Password is required';
      } else if (formData?.password?.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (authMethod === 'azure_ad') {
      if (!formData?.adConfigId) {
        newErrors.adConfigId = 'Please select an AD configuration';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    const apiBase = import.meta.env?.VITE_API_BASE_URL || '';

    if (
      apiBase?.startsWith('http://') &&
      window.location?.protocol === 'https:' && (errorMessage?.includes('network') || errorMessage?.includes('fetch') || errorMessage?.includes('failed'))
    ) {
      return {
        type: 'mixed_content',
        message: 'Cannot connect: the API server uses HTTP but this app runs on HTTPS. Browsers block this for security.',
        canRetry: false,
        icon: 'ShieldOff',
        instructions: [
          `API URL configured: ${apiBase}`,
          'The API server must support HTTPS to work from a secure (HTTPS) app',
          'Contact your administrator to enable HTTPS on the API server'
        ]
      };
    }

    if (
      apiBase?.startsWith('https://') &&
      (errorMessage?.includes('network') ||
        errorMessage?.includes('failed') ||
        errorMessage?.includes('fetch') ||
        errorCode === 'ERR_CERT_AUTHORITY_INVALID' ||
        errorCode === 'ERR_CERT_COMMON_NAME_INVALID' ||
        errorCode === 'ERR_SSL_PROTOCOL_ERROR' ||
        errorCode === 'NETWORK_ERROR')
    ) {
      return {
        type: 'ssl_cert',
        message: 'Cannot connect to the API — the server may have an invalid or self-signed SSL certificate.',
        canRetry: true,
        icon: 'ShieldAlert',
        apiUrl: apiBase,
        instructions: [
          `API URL: ${apiBase}`,
          'Since this is a dev environment, the API certificate may not be trusted by your browser.',
          'Click the button below to open the API in a new tab and accept the certificate warning, then return here and try again.'
        ]
      };
    }

    if (
      errorMessage?.includes('network') ||
      errorMessage?.includes('fetch') ||
      errorMessage?.includes('timeout') ||
      errorMessage?.includes('connection') ||
      errorMessage?.includes('econnrefused') ||
      errorCode === 'NETWORK_ERROR' ||
      errorCode === 'ETIMEDOUT'
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

  const calculateBackoffDelay = (attempt) => {
    const baseDelay = 1000;
    const maxDelay = 16000;
    return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  };

  const handleRetry = async () => {
    if (!authError?.canRetry) return;

    setIsRetrying(true);
    const delay = calculateBackoffDelay(retryCount);
    const retryDelaySeconds = Math.ceil(delay / 1000);
    setAuthError(prev => ({
      ...prev,
      message: `Retrying in ${retryDelaySeconds} second${retryDelaySeconds > 1 ? 's' : ''}...`
    }));

    await new Promise(resolve => setTimeout(resolve, delay));
    setRetryCount(prev => prev + 1);
    setIsRetrying(false);
    await handleSubmit(null, true);
  };

  const handleSubmit = async (e, isRetry = false) => {
    if (e) e?.preventDefault();
    
    if (!isRetry) {
      setAuthError(null);
      setRetryCount(0);
    }

    if (authMethod === 'azure_ad') {
      if (!validateForm()) return;

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

        navigate('/dashboard');
      } catch (error) {
        console.error('Azure AD login error:', error);
        setAuthError(classifyError(error));
        setIsSubmitting(false);
      }
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    const apiBase = import.meta.env?.VITE_API_BASE_URL || '(not set)';
    const loginUrl = `${apiBase}/api/auth/login`;
    const requestPayload = { username: formData?.username, password: '***hidden***' };
    const debugEntry = {
      timestamp: new Date()?.toISOString(),
      apiBase,
      loginUrl,
      requestPayload,
      response: null,
      error: null,
      rawError: null,
    };
    setDebugLog({ ...debugEntry, status: 'pending' });

    try {
      const { data, error } = await signIn(formData?.username, formData?.password);

      setDebugLog(prev => ({
        ...prev,
        status: error ? 'error' : 'success',
        response: data ? JSON.stringify(data, null, 2) : null,
        error: error ? {
          message: error?.message,
          code: error?.code || error?.status,
          name: error?.name,
          stack: error?.stack,
        } : null,
        rawError: error ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2) : null,
      }));

      if (error) {
        const classifiedError = classifyError(error);
        setAuthError(classifiedError);
        setIsSubmitting(false);
        return;
      }

      try {
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
          await logActivity(
            storedUserId,
            null,
            'login',
            `User logged in via ${authMethod === 'azure_ad' ? 'Azure AD' : 'username/password'}`
          );
        }
      } catch {
        // Non-critical
      }

      setRetryCount(0);
    } catch (error) {
      console.error('Login error:', error);

      setDebugLog(prev => ({
        ...prev,
        status: 'thrown',
        error: {
          message: error?.message,
          code: error?.code || error?.status,
          name: error?.name,
          stack: error?.stack,
        },
        rawError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        axiosDetails: error?.isAxiosError ? {
          url: error?.config?.url,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
          responseStatus: error?.response?.status,
          responseData: JSON.stringify(error?.response?.data, null, 2),
          responseHeaders: JSON.stringify(error?.response?.headers, null, 2),
        } : null,
      }));

      setAuthError(classifyError(error));
      setIsSubmitting(false);
    }
  };

  const handleAuthMethodChange = (method) => {
    setAuthMethod(method);
    setAuthError(null);
    setErrors({});
    setFormData({ username: '', password: '', adConfigId: '' });
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
            {brandingConfig?.logoUrl ? (
              <img
                src={brandingConfig?.logoUrl}
                alt={`${brandingConfig?.displayName || 'Organization'} logo`}
                className="h-16 w-auto object-contain"
                onError={(e) => {
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
              authError?.type === 'mixed_content' ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800' :
              authError?.type === 'ssl_cert' ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-700' :
              authError?.type === 'account_locked' ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800' :
              authError?.type === 'invalid_credentials'? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800' : 'bg-error/10 border-error/20'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                <AppIcon 
                  name={authError?.icon || 'AlertCircle'} 
                  size={22} 
                  className={`flex-shrink-0 mt-0.5 ${
                    authError?.type === 'network' ? 'text-orange-600 dark:text-orange-400' :
                    authError?.type === 'mixed_content' ? 'text-red-600 dark:text-red-400' :
                    authError?.type === 'ssl_cert' ? 'text-yellow-600 dark:text-yellow-400' :
                    authError?.type === 'account_locked' ? 'text-red-600 dark:text-red-400' :
                    authError?.type === 'invalid_credentials'? 'text-amber-600 dark:text-amber-400' : 'text-error'
                  }`}
                />
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-1 ${
                    authError?.type === 'network' ? 'text-orange-900 dark:text-orange-100' :
                    authError?.type === 'mixed_content' ? 'text-red-900 dark:text-red-100' :
                    authError?.type === 'ssl_cert' ? 'text-yellow-900 dark:text-yellow-100' :
                    authError?.type === 'account_locked' ? 'text-red-900 dark:text-red-100' :
                    authError?.type === 'invalid_credentials'? 'text-amber-900 dark:text-amber-100' : 'text-error'
                  }`}>
                    {authError?.message}
                  </p>
                  {authError?.instructions && authError?.instructions?.length > 0 && (
                    <ul className={`text-xs space-y-1 mt-2 ${
                      authError?.type === 'network' ? 'text-orange-700 dark:text-orange-300' :
                      authError?.type === 'mixed_content' ? 'text-red-700 dark:text-red-300' :
                      authError?.type === 'ssl_cert' ? 'text-yellow-700 dark:text-yellow-300' :
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
              {authError?.type === 'ssl_cert' && authError?.apiUrl && (
                <div className="mt-3 space-y-2">
                  <a
                    href={authError?.apiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition-colors"
                  >
                    <AppIcon name="ExternalLink" size={16} />
                    Open API in new tab to accept certificate
                  </a>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                    After accepting the certificate warning in the new tab, return here and click Retry.
                  </p>
                  {!isRetrying && (
                    <Button
                      type="button"
                      onClick={handleRetry}
                      disabled={isSubmitting}
                      className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border border-yellow-400"
                      size="sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <AppIcon name="RefreshCw" size={16} />
                        Retry Login
                      </span>
                    </Button>
                  )}
                </div>
              )}
              {authError?.type !== 'ssl_cert' && authError?.canRetry && !isRetrying && (
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
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData?.username}
                  onChange={(e) => handleChange('username', e?.target?.value)}
                  error={errors?.username}
                  required
                  disabled={isSubmitting}
                  autoComplete="username"
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

        {/* ── TEMPORARY DEBUG PANEL ── */}
        <div className="mt-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setDebugExpanded(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3 bg-yellow-400/30 hover:bg-yellow-400/50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-yellow-900 dark:text-yellow-200">
              <AppIcon name="Bug" size={16} />
              🐛 DEBUG PANEL (temporary)
              {debugLog && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  debugLog?.status === 'success' ? 'bg-green-200 text-green-800' :
                  debugLog?.status === 'pending'? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'
                }`}>
                  {debugLog?.status?.toUpperCase()}
                </span>
              )}
            </span>
            <AppIcon name={debugExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-yellow-800" />
          </button>

          {debugExpanded && (
            <div className="p-4 space-y-4 text-xs font-mono">
              <div>
                <p className="font-bold text-yellow-800 dark:text-yellow-300 mb-1 uppercase tracking-wide">Environment</p>
                <div className="bg-white dark:bg-gray-900 rounded p-3 border border-yellow-200 space-y-1">
                  <div><span className="text-gray-500">VITE_API_BASE_URL:</span> <span className="text-blue-700 dark:text-blue-300 break-all">{import.meta.env?.VITE_API_BASE_URL || '(not set)'}</span></div>
                  <div><span className="text-gray-500">Page protocol:</span> <span className="text-blue-700 dark:text-blue-300">{window.location?.protocol}</span></div>
                  <div><span className="text-gray-500">Page origin:</span> <span className="text-blue-700 dark:text-blue-300">{window.location?.origin}</span></div>
                  <div><span className="text-gray-500">Mixed-content risk:</span> <span className={window.location?.protocol === 'https:' && (import.meta.env?.VITE_API_BASE_URL || '')?.startsWith('http://') ? 'text-red-600 font-bold' : 'text-green-600'}>
                    {window.location?.protocol === 'https:' && (import.meta.env?.VITE_API_BASE_URL || '')?.startsWith('http://') ? '⚠️ YES — HTTPS page calling HTTP API (blocked by browser)' : 'No'}
                  </span></div>
                </div>
              </div>

              {!debugLog && (
                <p className="text-gray-500 italic">Submit the login form to capture debug info…</p>
              )}

              {debugLog && (
                <>
                  <div>
                    <p className="font-bold text-yellow-800 dark:text-yellow-300 mb-1 uppercase tracking-wide">Request</p>
                    <div className="bg-white dark:bg-gray-900 rounded p-3 border border-yellow-200 space-y-1">
                      <div><span className="text-gray-500">Timestamp:</span> <span className="text-gray-800 dark:text-gray-200">{debugLog?.timestamp}</span></div>
                      <div><span className="text-gray-500">URL:</span> <span className="text-blue-700 dark:text-blue-300 break-all">{debugLog?.loginUrl}</span></div>
                      <div><span className="text-gray-500">Method:</span> <span className="text-purple-700 dark:text-purple-300">POST</span></div>
                      <div><span className="text-gray-500">Payload:</span></div>
                      <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto text-green-800 dark:text-green-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(debugLog?.requestPayload, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {debugLog?.response && (
                    <div>
                      <p className="font-bold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wide">✅ Response Data</p>
                      <pre className="bg-white dark:bg-gray-900 rounded p-3 border border-green-300 overflow-x-auto text-green-800 dark:text-green-300 whitespace-pre-wrap break-all">
                        {debugLog?.response}
                      </pre>
                    </div>
                  )}

                  {debugLog?.error && (
                    <div>
                      <p className="font-bold text-red-700 dark:text-red-400 mb-1 uppercase tracking-wide">❌ Error Details</p>
                      <div className="bg-white dark:bg-gray-900 rounded p-3 border border-red-300 space-y-1">
                        <div><span className="text-gray-500">Type:</span> <span className="text-red-700 dark:text-red-300">{debugLog?.status}</span></div>
                        <div><span className="text-gray-500">Name:</span> <span className="text-red-700 dark:text-red-300">{debugLog?.error?.name || '—'}</span></div>
                        <div><span className="text-gray-500">Code:</span> <span className="text-red-700 dark:text-red-300">{debugLog?.error?.code || '—'}</span></div>
                        <div><span className="text-gray-500">Message:</span> <span className="text-red-700 dark:text-red-300 break-all">{debugLog?.error?.message || '—'}</span></div>
                        {debugLog?.rawError && (
                          <>
                            <div className="text-gray-500 mt-2">Full error object:</div>
                            <pre className="bg-red-50 dark:bg-red-950/40 rounded p-2 overflow-x-auto text-red-800 dark:text-red-300 whitespace-pre-wrap break-all">
                              {debugLog?.rawError}
                            </pre>
                          </>
                        )}
                        {debugLog?.error?.stack && (
                          <>
                            <div className="text-gray-500 mt-2">Stack trace:</div>
                            <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all text-[10px]">
                              {debugLog?.error?.stack}
                            </pre>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {debugLog?.axiosDetails && (
                    <div>
                      <p className="font-bold text-orange-700 dark:text-orange-400 mb-1 uppercase tracking-wide">🔌 Axios / HTTP Details</p>
                      <div className="bg-white dark:bg-gray-900 rounded p-3 border border-orange-300 space-y-1">
                        <div><span className="text-gray-500">Config URL:</span> <span className="text-orange-700 dark:text-orange-300 break-all">{debugLog?.axiosDetails?.url || '—'}</span></div>
                        <div><span className="text-gray-500">Base URL:</span> <span className="text-orange-700 dark:text-orange-300 break-all">{debugLog?.axiosDetails?.baseURL || '—'}</span></div>
                        <div><span className="text-gray-500">Method:</span> <span className="text-orange-700 dark:text-orange-300">{debugLog?.axiosDetails?.method || '—'}</span></div>
                        <div><span className="text-gray-500">Response Status:</span> <span className="text-orange-700 dark:text-orange-300">{debugLog?.axiosDetails?.responseStatus ?? '—'}</span></div>
                        {debugLog?.axiosDetails?.responseData && (
                          <>
                            <div className="text-gray-500 mt-1">Response body:</div>
                            <pre className="bg-orange-50 dark:bg-orange-950/40 rounded p-2 overflow-x-auto text-orange-800 dark:text-orange-300 whitespace-pre-wrap break-all">
                              {debugLog?.axiosDetails?.responseData}
                            </pre>
                          </>
                        )}
                        {debugLog?.axiosDetails?.responseHeaders && (
                          <>
                            <div className="text-gray-500 mt-1">Response headers:</div>
                            <pre className="bg-orange-50 dark:bg-orange-950/40 rounded p-2 overflow-x-auto text-orange-800 dark:text-orange-300 whitespace-pre-wrap break-all">
                              {debugLog?.axiosDetails?.responseHeaders}
                            </pre>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setDebugLog(null)}
                    className="text-xs text-gray-500 underline hover:text-red-600"
                  >
                    Clear debug log
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {/* ── END DEBUG PANEL ── */}

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