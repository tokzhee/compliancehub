import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';
import { useToast } from '../../../contexts/ToastContext';

const EditRoleModal = ({ isOpen, onClose, onSubmit, role }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakingFields, setShakingFields] = useState({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role?.name || '',
        description: role?.description || ''
      });
    }
  }, [role]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
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
    const fieldsToShake = [];
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Role name is required';
      fieldsToShake?.push('name');
    }
    
    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
      fieldsToShake?.push('description');
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setShowSuccess(true);
      toast?.success('Role updated successfully');
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating role:', error);
      toast?.error(error?.message || 'Failed to update role. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      <div className="bg-card border border-border rounded-lg shadow-elevation-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card transition-colors">
          <div>
            <h2 className="text-xl font-semibold text-foreground transition-colors">Edit Role</h2>
            <p className="text-sm text-muted-foreground mt-1 transition-colors">
              Update role name and description
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-muted transition-base flex items-center justify-center"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {showSuccess && (
              <div className="flex flex-col items-center justify-center py-8">
                <SuccessCheckmark size={80} />
                <p className="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">Role Updated Successfully!</p>
              </div>
            )}
            {!showSuccess && (
              <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                Role Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData?.name}
                  onChange={(e) => handleChange('name', e?.target?.value)}
                  className={`
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                    bg-card text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${errors?.name ? 'error-field' : 'border-input'}
                    ${shakingFields?.name ? 'animate-shake' : ''}
                  `}
                  placeholder="Enter role name"
                />
                {errors?.name && (
                  <Icon name="XCircle" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {errors?.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors?.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={formData?.description}
                  onChange={(e) => handleChange('description', e?.target?.value)}
                  rows={3}
                  className={`
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                    bg-card text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none
                    ${errors?.description ? 'error-field' : 'border-input'}
                    ${shakingFields?.description ? 'animate-shake' : ''}
                  `}
                  placeholder="Describe the role"
                />
                {errors?.description && (
                  <Icon name="XCircle" size={18} className="absolute right-3 top-3 text-red-500" />
                )}
              </div>
              {errors?.description && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors?.description}
                </p>
              )}
            </div>
            </>
            )}
          </div>

          <div className="p-6 border-t border-border bg-muted/30 flex gap-3 transition-colors">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              fullWidth
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;