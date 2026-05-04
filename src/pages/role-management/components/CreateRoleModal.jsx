import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';
import { useToast } from '../../../contexts/ToastContext';

import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { roleService } from '../../../services/roleService';

const CreateRoleModal = ({ isOpen, onClose, onSubmit, existingRoles = [] }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    permissions: []
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validFields, setValidFields] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakingFields, setShakingFields] = useState({});

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Get all available permissions from service
  const allPermissions = roleService?.getAllAvailablePermissions();

  // Group permissions by module
  const permissionModules = allPermissions?.reduce((acc, perm) => {
    const existing = acc?.find(m => m?.module === perm?.module);
    if (existing) {
      existing?.permissions?.push(perm);
    } else {
      acc?.push({
        module: perm?.module,
        label: perm?.module?.charAt(0)?.toUpperCase() + perm?.module?.slice(1),
        permissions: [perm]
      });
    }
    return acc;
  }, []);

  const moduleIcons = {
    dashboard: 'LayoutDashboard',
    users: 'Users',
    roles: 'Shield',
    datasets: 'Database',
    cases: 'CheckSquare',
    rules: 'Settings',
    reporting: 'FileText',
    enrichment: 'Sparkles',
    submissions: 'Send',
    ldap: 'Server'
  };

  const validateField = (field, value) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'name':
        if (!value?.trim()) {
          error = 'Role name is required';
        } else if (value?.length < 3) {
          error = 'Role name must be at least 3 characters';
        } else if (existingRoles?.some(role => role?.name?.toLowerCase() === value?.trim()?.toLowerCase())) {
          error = 'A role with this name already exists';
        } else {
          isValid = true;
        }
        break;

      case 'description':
        if (!value?.trim()) {
          error = 'Description is required';
        } else if (value?.length < 10) {
          error = 'Description must be at least 10 characters to properly explain the role';
        } else if (value?.length > 500) {
          error = 'Description must not exceed 500 characters';
        } else {
          isValid = true;
        }
        break;

      case 'permissions':
        if (!value || value?.length === 0) {
          error = 'At least one permission must be selected';
        } else {
          isValid = true;
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
  };

  const handleInputChange = (field, value) => {
    handleChange(field, value);
  };

  const handlePermissionToggle = (permission) => {
    const permKey = `${permission?.module}.${permission?.action}`;
    setFormData(prev => {
      const permissions = prev?.permissions || [];
      const hasPermission = permissions?.includes(permKey);
      
      const newPermissions = hasPermission
        ? permissions?.filter(p => p !== permKey)
        : [...permissions, permKey];

      // Validate permissions immediately
      if (touched?.permissions) {
        const { error, isValid } = validateField('permissions', newPermissions);
        setErrors(prevErrors => ({ ...prevErrors, permissions: error }));
        setValidFields(prevValid => ({ ...prevValid, permissions: isValid }));
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleModuleToggle = (modulePerms) => {
    const modulePermKeys = modulePerms?.map(p => `${p?.module}.${p?.action}`);
    const allSelected = modulePermKeys?.every(key => formData?.permissions?.includes(key));

    setFormData(prev => {
      const newPermissions = allSelected
        ? prev?.permissions?.filter(p => !modulePermKeys?.includes(p))
        : [...new Set([...prev?.permissions, ...modulePermKeys])];

      // Validate permissions immediately
      if (touched?.permissions) {
        const { error, isValid } = validateField('permissions', newPermissions);
        setErrors(prevErrors => ({ ...prevErrors, permissions: error }));
        setValidFields(prevValid => ({ ...prevValid, permissions: isValid }));
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const newValidFields = {};

    ['name', 'description', 'permissions']?.forEach(field => {
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
    setTouched({ name: true, description: true, permissions: true });

    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate all fields
    const allTouched = { name: true, description: true, permissions: true };
    setTouched(allTouched);

    const newErrors = {};
    const newValidFields = {};
    const fieldsToShake = [];

    ['name', 'description', 'permissions']?.forEach(field => {
      const { error, isValid } = validateField(field, formData?.[field]);
      if (error) {
        newErrors[field] = error;
        newValidFields[field] = false;
        fieldsToShake?.push(field);
      } else if (isValid) {
        newValidFields[field] = true;
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
      await onSubmit(formData);
      setShowSuccess(true);
      toast?.success('Role created successfully');
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 1500);
    } catch (error) {
      toast?.error(error?.message || 'Failed to create role. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      permissions: []
    });
    setErrors({});
    setTouched({});
    setValidFields({});
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[2100] bg-green-500 text-white px-6 py-4 rounded-lg shadow-elevation-xl flex items-center gap-3 animate-in slide-in-from-top-5">
          <Icon name="CheckCircle" size={24} />
          <div>
            <p className="font-semibold">Role Created Successfully!</p>
            <p className="text-sm opacity-90">The new role has been added with selected permissions.</p>
          </div>
        </div>
      )}
      <div className="bg-card rounded-lg border border-border shadow-elevation-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground transition-colors">
                Create New Role
              </h2>
              <p className="text-sm text-muted-foreground transition-colors">
                Define a new role with custom permissions
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-muted rounded-lg transition-all disabled:opacity-50"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {showSuccess && (
            <div className="flex flex-col items-center justify-center py-8">
              <SuccessCheckmark size={80} />
              <p className="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">Role Created Successfully!</p>
            </div>
          )}
          {!showSuccess && (
            <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                Role Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  onBlur={() => handleBlur('name')}
                  className={`
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                    bg-card text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${errors?.name && touched?.name ? 'error-field' : 'border-input'}
                    ${shakingFields?.name ? 'animate-shake' : ''}
                    ${validFields?.name ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                  `}
                  placeholder="e.g., Compliance Officer"
                />
                {validFields?.name && (
                  <Icon name="CheckCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
                {errors?.name && touched?.name && (
                  <Icon name="XCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {errors?.name && touched?.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors?.name}
                </p>
              )}
            </div>

            {/* Status */}
            <Select
              label="Status"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleChange('status', value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({formData?.description?.length}/500 characters)
              </span>
            </label>
            <div className="relative">
              <textarea
                placeholder="Describe the role's responsibilities and access level..."
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                onBlur={() => handleBlur('description')}
                disabled={isSubmitting}
                rows={3}
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                  bg-card text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none
                  ${errors?.description && touched?.description ? 'error-field' : 'border-input'}
                  ${shakingFields?.description ? 'animate-shake' : ''}
                  ${validFields?.description ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                `}
              />
              {validFields?.description && (
                <Icon name="CheckCircle" size={18} className="absolute right-3 top-3 text-green-500" />
              )}
              {errors?.description && touched?.description && (
                <Icon name="XCircle" size={18} className="absolute right-3 top-3 text-red-500" />
              )}
            </div>
            {errors?.description && touched?.description && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.description}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground transition-colors">
              {formData?.description?.length}/500 characters
            </p>
          </div>

          {/* Permissions */}
          <div className={`${shakingFields?.permissions ? 'animate-shake' : ''}`}>
            <label className="block text-sm font-medium text-foreground mb-3 transition-colors">
              Permissions <span className="text-red-500">*</span>
            </label>
            <div className={`
              border rounded-lg p-4 space-y-4 transition-all duration-200
              ${errors?.permissions && touched?.permissions ? 'error-field' : 'border-input'}
            `}>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {permissionModules?.map(module => (
                  <div key={module?.module} className="border border-border rounded-lg p-4 bg-card transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon
                            name={moduleIcons?.[module?.module] || 'Settings'}
                            size={20}
                            className="text-primary"
                          />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-foreground transition-colors">
                            {module?.label}
                          </h4>
                          <p className="text-xs text-muted-foreground transition-colors">
                            {module?.permissions?.length} permissions available
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleModuleToggle(module?.permissions);
                          setTouched(prev => ({ ...prev, permissions: true }));
                        }}
                        disabled={isSubmitting}
                      >
                        {module?.permissions?.every(p => formData?.permissions?.includes(`${p?.module}.${p?.action}`)) ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {module?.permissions?.map(perm => (
                        <label
                          key={perm?.key}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-all group"
                        >
                          <Checkbox
                            checked={formData?.permissions?.includes(perm?.key)}
                            onCheckedChange={() => {
                              handlePermissionToggle(perm);
                              setTouched(prev => ({ ...prev, permissions: true }));
                            }}
                            disabled={isSubmitting}
                          />
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                            {perm?.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
          )}
        </form>

        <div className="flex gap-3 pt-4 border-t border-border bg-muted/30 p-4 md:p-6 transition-colors">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSubmit}
            iconName="Plus"
            iconPosition="left"
            fullWidth
            className="sm:w-auto"
          >
            Create Role
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleModal;