import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';
import { useToast } from '../../../contexts/ToastContext';

import Select from '../../../components/ui/Select';
import { adConfigService } from '../../../services/adConfigService';
import { useUserContext } from '../../../contexts/UserContext';

const CreateUserModal = ({ isOpen, onClose, onCreateUser, availableRoles }) => {
  const { user: currentUser } = useUserContext();
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    roleId: '',
    password: '',
    confirmPassword: '',
    authenticationSource: 'local_db',
    adConfigId: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validFields, setValidFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [adConfigurations, setAdConfigurations] = useState([]);
  const [loadingAdConfigs, setLoadingAdConfigs] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shakingFields, setShakingFields] = useState({});

  useEffect(() => {
    if (isOpen && currentUser?.organizationId) {
      fetchAdConfigurations();
    }
  }, [isOpen, currentUser?.organizationId]);

  const fetchAdConfigurations = async () => {
    setLoadingAdConfigs(true);
    try {
      const configs = await adConfigService?.getActiveAdConfigurations(currentUser?.organizationId);
      setAdConfigurations(configs);
    } catch (err) {
      console.error('Error fetching AD configurations:', err);
    } finally {
      setLoadingAdConfigs(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password?.length >= 8) score++;
    if (password?.length >= 12) score++;
    if (/[a-z]/?.test(password) && /[A-Z]/?.test(password)) score++;
    if (/\d/?.test(password)) score++;
    if (/[^a-zA-Z\d]/?.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' };
    if (score === 3) return { score, label: 'Fair', color: 'text-yellow-500' };
    if (score === 4) return { score, label: 'Good', color: 'text-blue-500' };
    return { score, label: 'Strong', color: 'text-green-500' };
  };

  const validateField = (field, value) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'username':
        if (!value?.trim()) {
          error = 'Full name is required';
        } else if (value?.length < 3) {
          error = 'Full name must be at least 3 characters';
        } else {
          isValid = true;
        }
        break;

      case 'email':
        if (!value?.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(value)) {
          error = 'Please enter a valid email address (e.g., user@example.com)';
        } else {
          isValid = true;
        }
        break;

      case 'roleId':
        if (!value) {
          error = 'Role selection is required';
        } else {
          isValid = true;
        }
        break;

      case 'authenticationSource':
        if (!value) {
          error = 'Authentication source is required';
        } else {
          isValid = true;
        }
        break;

      case 'adConfigId':
        if (formData?.authenticationSource === 'active_directory' && !value) {
          error = 'AD configuration selection is required for AD authentication';
        } else if (formData?.authenticationSource === 'active_directory') {
          isValid = true;
        }
        break;

      case 'password':
        if (formData?.authenticationSource === 'local_db') {
          if (!value) {
            error = 'Password is required';
          } else if (value?.length < 8) {
            error = 'Password must be at least 8 characters';
          } else if (!/(?=.*[a-z])/?.test(value)) {
            error = 'Password must contain at least one lowercase letter';
          } else if (!/(?=.*[A-Z])/?.test(value)) {
            error = 'Password must contain at least one uppercase letter';
          } else if (!/(?=.*\d)/?.test(value)) {
            error = 'Password must contain at least one number';
          } else {
            isValid = true;
          }
        }
        break;

      case 'confirmPassword':
        if (formData?.authenticationSource === 'local_db') {
          if (!value) {
            error = 'Please confirm your password';
          } else if (value !== formData?.password) {
            error = 'Passwords do not match';
          } else {
            isValid = true;
          }
        }
        break;

      default:
        break;
    }

    return { error, isValid };
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const { error, isValid } = validateField(field, formData?.[field]);
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      setValidFields(prev => ({ ...prev, [field]: false }));
      triggerShake(field);
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      setValidFields(prev => ({ ...prev, [field]: isValid }));
    }
  };

  const triggerShake = (field) => {
    setShakingFields(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setShakingFields(prev => ({ ...prev, [field]: false }));
    }, 500);
  };

  const validateForm = () => {
    const newErrors = {};
    const newValidFields = {};

    Object.keys(formData)?.forEach(field => {
      const { error, isValid } = validateField(field, formData?.[field]);
      if (error) {
        newErrors[field] = error;
        newValidFields[field] = false;
      } else if (isValid) {
        newValidFields[field] = true;
      }
    });

    setErrors(newErrors);
    setValidFields(newValidFields);
    setTouched({
      username: true,
      email: true,
      roleId: true,
      authenticationSource: true,
      adConfigId: true,
      password: true,
      confirmPassword: true
    });

    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // Validate all fields
    const allTouched = {
      username: true,
      email: true,
      roleId: true,
      password: formData?.authenticationSource === 'local_db',
      confirmPassword: formData?.authenticationSource === 'local_db',
      adConfigId: formData?.authenticationSource === 'active_directory'
    };
    setTouched(allTouched);

    const newErrors = {};
    const newValidFields = {};
    const fieldsToShake = [];

    Object.keys(allTouched)?.forEach(field => {
      if (allTouched?.[field]) {
        const { error, isValid } = validateField(field, formData?.[field]);
        if (error) {
          newErrors[field] = error;
          newValidFields[field] = false;
          fieldsToShake?.push(field);
        } else {
          newValidFields[field] = isValid;
        }
      }
    });

    setErrors(newErrors);
    setValidFields(newValidFields);

    if (Object.keys(newErrors)?.length > 0) {
      fieldsToShake?.forEach(field => triggerShake(field));
      toast?.error('Please fix all validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateUser(formData);
      setShowSuccess(true);
      toast?.success('User created successfully');
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Create user error:', error);
      toast?.error(error?.message || 'Failed to create user. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for touched fields
    if (touched?.[field]) {
      const { error, isValid } = validateField(field, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        setValidFields(prev => ({ ...prev, [field]: false }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
        setValidFields(prev => ({ ...prev, [field]: isValid }));
      }
    }

    // Password strength calculation
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear AD config when switching to local_db
    if (field === 'authenticationSource' && value === 'local_db') {
      setFormData(prev => ({ ...prev, adConfigId: '' }));
      setErrors(prev => ({ ...prev, adConfigId: '' }));
      setValidFields(prev => ({ ...prev, adConfigId: false }));
    }

    // Clear password fields when switching to AD
    if (field === 'authenticationSource' && value === 'active_directory') {
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setValidFields(prev => ({ ...prev, password: false, confirmPassword: false }));
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  };

  const handleInputChange = (field, value) => {
    handleChange(field, value);
  };

  const getFieldBorderClass = (field) => {
    if (!touched?.[field]) return 'border-input';
    if (errors?.[field]) return 'border-red-500';
    if (validFields?.[field]) return 'border-green-500';
    return 'border-input';
  };

  const renderFieldIcon = (field) => {
    if (!touched?.[field]) return null;
    if (errors?.[field]) {
      return <Icon name="XCircle" size={18} className="text-red-500" />;
    }
    if (validFields?.[field]) {
      return <Icon name="CheckCircle" size={18} className="text-green-500" />;
    }
    return null;
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      roleId: '',
      password: '',
      confirmPassword: '',
      authenticationSource: 'local_db',
      adConfigId: ''
    });
    setErrors({});
    setTouched({});
    setValidFields({});
    setIsSubmitting(false);
    setShowSuccess(false);
    setPasswordStrength({ score: 0, label: '', color: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShakingFields({});
    onClose();
  };

  if (!isOpen) return null;

  const authSourceOptions = [
    { value: 'local_db', label: 'Local Database' },
    { value: 'active_directory', label: 'Active Directory' }
  ];

  const adConfigOptions = adConfigurations?.map(config => ({
    value: config?.id,
    label: config?.configName
  })) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[60] bg-green-500 text-white px-6 py-4 rounded-lg shadow-elevation-xl flex items-center gap-3 animate-in slide-in-from-top-5">
          <Icon name="CheckCircle" size={24} />
          <div>
            <p className="font-semibold">User Created Successfully!</p>
            <p className="text-sm opacity-90">The new user has been added to the system.</p>
          </div>
        </div>
      )}
      <div className="bg-card rounded-lg border border-border shadow-elevation-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="UserPlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground transition-colors">
                Create New User
              </h2>
              <p className="text-sm text-muted-foreground transition-colors">Add a new user to your organization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-muted rounded-lg transition-all disabled:opacity-50"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {showSuccess && (
            <div className="flex flex-col items-center justify-center py-8">
              <SuccessCheckmark size={80} />
              <p className="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">User Created Successfully!</p>
            </div>
          )}
          {!showSuccess && (
            <>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData?.username}
                  onChange={(e) => handleInputChange('username', e?.target?.value)}
                  onBlur={() => handleBlur('username')}
                  className={`
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                    bg-card text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${errors?.username && touched?.username ? 'error-field animate-shake' : 'border-input'}
                    ${shakingFields?.username ? 'animate-shake' : ''}
                    ${validFields?.username ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                  `}
                  placeholder="Enter full name"
                />
                {validFields?.username && (
                  <Icon name="CheckCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
                {errors?.username && touched?.username && (
                  <Icon name="XCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {errors?.username && touched?.username && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors?.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData?.email}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  onBlur={() => handleBlur('email')}
                  className={`
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                    bg-card text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${errors?.email && touched?.email ? 'error-field animate-shake' : 'border-input'}
                    ${shakingFields?.email ? 'animate-shake' : ''}
                    ${validFields?.email ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                  `}
                  placeholder="user@example.com"
                />
                {validFields?.email && (
                  <Icon name="CheckCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
                {errors?.email && touched?.email && (
                  <Icon name="XCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {errors?.email && touched?.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors?.email}
                </p>
              )}
              {!errors?.email && touched?.email && (
                <p className="text-sm text-muted-foreground mt-1">Valid email format</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                Role <span className="text-red-500">*</span>
              </label>
              <div className={`${shakingFields?.roleId ? 'animate-shake' : ''}`}>
                <Select
                  value={formData?.roleId}
                  onChange={(value) => handleInputChange('roleId', value)}
                  onBlur={() => handleBlur('roleId')}
                  options={availableRoles}
                  placeholder="Select a role"
                  error={errors?.roleId && touched?.roleId}
                  className={errors?.roleId && touched?.roleId ? 'error-field' : ''}
                />
              </div>
              {errors?.roleId && touched?.roleId && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors?.roleId}
                </p>
              )}
            </div>

            {/* Authentication Source */}
            <div>
              <Select
                label="Authentication Source"
                placeholder="Select authentication method"
                options={authSourceOptions}
                value={formData?.authenticationSource}
                onChange={(value) => {
                  handleChange('authenticationSource', value);
                  handleBlur('authenticationSource');
                }}
                error={touched?.authenticationSource ? errors?.authenticationSource : ''}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* AD Configuration */}
            {formData?.authenticationSource === 'active_directory' && (
              <div>
                <Select
                  label="Active Directory Configuration"
                  placeholder={loadingAdConfigs ? 'Loading configurations...' : 'Select AD configuration'}
                  options={adConfigOptions}
                  value={formData?.adConfigId}
                  onChange={(value) => {
                    handleChange('adConfigId', value);
                    handleBlur('adConfigId');
                  }}
                  error={touched?.adConfigId ? errors?.adConfigId : ''}
                  required
                  disabled={isSubmitting || loadingAdConfigs}
                />
              </div>
            )}

            {/* Password Fields for Local DB */}
            {formData?.authenticationSource === 'local_db' && (
              <>
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData?.password}
                      onChange={(e) => handleInputChange('password', e?.target?.value)}
                      onBlur={() => handleBlur('password')}
                      className={`
                        w-full px-4 py-2.5 pr-10 rounded-lg border transition-all duration-200
                        bg-card text-foreground placeholder:text-muted-foreground
                        focus:outline-none focus:ring-2 focus:ring-primary/20
                        ${errors?.password && touched?.password ? 'error-field animate-shake' : 'border-input'}
                        ${shakingFields?.password ? 'animate-shake' : ''}
                        ${validFields?.password ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                      `}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                  {errors?.password && touched?.password && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {errors?.password}
                    </p>
                  )}
                  {formData?.password && passwordStrength?.label && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Password Strength:</span>
                        <span className={`text-xs font-medium ${passwordStrength?.color}`}>
                          {passwordStrength?.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength?.score <= 2 ? 'bg-red-500' :
                            passwordStrength?.score === 3 ? 'bg-yellow-500' :
                            passwordStrength?.score === 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength?.score / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use uppercase, lowercase, numbers, and special characters
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData?.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`
                        w-full px-4 py-2.5 pr-10 rounded-lg border transition-all duration-200
                        bg-card text-foreground placeholder:text-muted-foreground
                        focus:outline-none focus:ring-2 focus:ring-primary/20
                        ${errors?.confirmPassword && touched?.confirmPassword ? 'error-field animate-shake' : 'border-input'}
                        ${shakingFields?.confirmPassword ? 'animate-shake' : ''}
                        ${validFields?.confirmPassword ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                      `}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                  {errors?.confirmPassword && touched?.confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {errors?.confirmPassword}
                    </p>
                  )}
                  {touched?.confirmPassword && !errors?.confirmPassword && validFields?.confirmPassword && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Icon name="CheckCircle" size={14} />
                      Passwords match
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Submit Error */}
          {errors?.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <Icon name="AlertCircle" size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errors?.submit}</p>
            </div>
          )}
          </>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border bg-muted/30 p-4 md:p-6 transition-colors">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName="UserPlus"
              iconPosition="left"
              className="flex-1"
            >
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;