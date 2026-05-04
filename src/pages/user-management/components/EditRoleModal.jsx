import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';
import { useToast } from '../../../contexts/ToastContext';

const EditRoleModal = ({ isOpen, onClose, user, availableRoles, onUpdateRole }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    roleId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakingFields, setShakingFields] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      const currentRole = availableRoles?.find(role => role?.label === user?.role);
      setFormData({
        fullName: user?.fullName || user?.username || '',
        email: user?.email || '',
        roleId: currentRole?.value || ''
      });
      setErrors({});
    }
  }, [user, isOpen, availableRoles]);

  const triggerShake = (field) => {
    setShakingFields(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setShakingFields(prev => ({ ...prev, [field]: false }));
    }, 500);
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToShake = [];

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
      fieldsToShake?.push('fullName');
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
      fieldsToShake?.push('email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Invalid email format';
      fieldsToShake?.push('email');
    }

    if (!formData?.roleId) {
      newErrors.roleId = 'Please select a role';
      fieldsToShake?.push('roleId');
    }

    setErrors(newErrors);
    
    if (fieldsToShake?.length > 0) {
      fieldsToShake?.forEach(field => triggerShake(field));
      toast?.error('Please fix all validation errors before submitting');
    }
    
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onUpdateRole(user?.userId, formData?.roleId, {
        full_name: formData?.fullName,
        email: formData?.email
      });
      
      setShowSuccess(true);
      toast?.success('User updated successfully');
      setTimeout(() => {
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Update user error:', error);
      toast?.error(error?.message || 'Failed to update user. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      <div className="bg-card border border-border rounded-lg shadow-elevation-xl w-full max-w-md transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Icon name="UserCog" size={20} className="text-secondary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Edit User</h2>
              <p className="text-sm text-muted-foreground transition-colors">Update user details and role</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconSize={20}
            onClick={onClose}
            disabled={isSubmitting}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {showSuccess && (
            <div className="flex flex-col items-center justify-center py-8">
              <SuccessCheckmark size={80} />
              <p className="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">User Updated Successfully!</p>
            </div>
          )}
          {!showSuccess && (
            <>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 transition-colors">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground transition-colors">User ID:</span>
              <span className="font-medium text-foreground transition-colors">{user?.userId?.substring(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground transition-colors">Current Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                user?.status === 'Active' ? 'bg-success/10 text-success' :
                user?.status === 'Suspended'? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
              }`}>
                {user?.status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData?.fullName}
                onChange={(e) => handleChange('fullName', e?.target?.value)}
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                  bg-card text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/20
                  ${errors?.fullName ? 'error-field' : 'border-input'}
                  ${shakingFields?.fullName ? 'animate-shake' : ''}
                `}
                placeholder="Enter full name"
              />
              {errors?.fullName && (
                <Icon name="XCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {errors?.fullName && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData?.email}
                onChange={(e) => handleChange('email', e?.target?.value)}
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                  bg-card text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/20
                  ${errors?.email ? 'error-field' : 'border-input'}
                  ${shakingFields?.email ? 'animate-shake' : ''}
                `}
                placeholder="user@example.com"
              />
              {errors?.email && (
                <Icon name="XCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {errors?.email && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Role
            </label>
            <div className={`${shakingFields?.roleId ? 'animate-shake' : ''}`}>
              <Select
                value={formData?.roleId}
                onChange={(value) => handleChange('roleId', value)}
                options={availableRoles}
                placeholder="Select a role"
                error={errors?.roleId}
                className={errors?.roleId ? 'error-field' : ''}
              />
            </div>
            {errors?.roleId && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.roleId}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border transition-colors">
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
              iconName="Save"
              iconPosition="left"
              className="flex-1"
            >
              Update User
            </Button>
          </div>
          </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;