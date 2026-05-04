import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const ManagePermissionsModal = ({ isOpen, onClose, onSubmit, role, currentPermissions, availablePermissions }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentPermissions) {
      const permissionStrings = currentPermissions?.map(p => `${p?.module}.${p?.action}`);
      setSelectedPermissions(permissionStrings);
      setHasChanges(false);
    }
  }, [isOpen, currentPermissions]);

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

  const moduleNames = {
    dashboard: 'Dashboard',
    users: 'User Management',
    roles: 'Role Management',
    datasets: 'Dataset Management',
    cases: 'Case Review',
    rules: 'Rule Configuration',
    reporting: 'Reporting',
    enrichment: 'Business Enrichment',
    submissions: 'Submission Log',
    ldap: 'LDAP Configuration'
  };

  // Group available permissions by module
  const groupedPermissions = availablePermissions?.reduce((acc, perm) => {
    const module = perm?.module;
    if (!acc?.[module]) {
      acc[module] = [];
    }
    acc?.[module]?.push(perm);
    return acc;
  }, {});

  const handlePermissionToggle = (permission) => {
    const permString = `${permission?.module}.${permission?.action}`;
    let updated = selectedPermissions?.includes(permString)
      ? selectedPermissions?.filter(p => p !== permString)
      : [...selectedPermissions, permString];
    
    setSelectedPermissions(updated);
    setHasChanges(true);
  };

  const handleSelectAllModule = (modulePerms) => {
    const modulePermStrings = modulePerms?.map(p => `${p?.module}.${p?.action}`);
    const allSelected = modulePermStrings?.every(p => selectedPermissions?.includes(p));
    
    let updated;
    if (allSelected) {
      updated = selectedPermissions?.filter(p => !modulePermStrings?.includes(p));
    } else {
      updated = [...new Set([...selectedPermissions, ...modulePermStrings])];
    }
    
    setSelectedPermissions(updated);
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(selectedPermissions);
      handleClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPermissions([]);
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      <div className="bg-card border border-border rounded-lg shadow-elevation-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card transition-colors">
          <div>
            <h2 className="text-xl font-semibold text-foreground transition-colors">Manage Permissions</h2>
            <p className="text-sm text-muted-foreground mt-1 transition-colors">
              Add or remove permissions for {role?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <div className="flex items-center gap-2 text-sm text-warning">
                <Icon name="AlertCircle" size={16} />
                <span>Unsaved changes</span>
              </div>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-muted transition-base flex items-center justify-center"
            >
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {Object.entries(groupedPermissions || {})?.map(([module, perms]) => {
              const modulePermStrings = perms?.map(p => `${p?.module}.${p?.action}`);
              const allSelected = modulePermStrings?.every(p => selectedPermissions?.includes(p));
              const someSelected = modulePermStrings?.some(p => selectedPermissions?.includes(p)) && !allSelected;

              return (
                <div key={module} className="border border-border rounded-lg p-4 bg-card transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon
                          name={moduleIcons?.[module] || 'Settings'}
                          size={20}
                          className="text-primary"
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground transition-colors">
                          {moduleNames?.[module] || module}
                        </h4>
                        <p className="text-xs text-muted-foreground transition-colors">
                          {perms?.length} available {perms?.length === 1 ? 'permission' : 'permissions'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAllModule(perms)}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms?.map((perm) => {
                      const permString = `${perm?.module}.${perm?.action}`;
                      return (
                        <Checkbox
                          key={permString}
                          label={perm?.label || perm?.action}
                          checked={selectedPermissions?.includes(permString)}
                          onChange={() => handlePermissionToggle(perm)}
                          className="text-sm"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/30 flex gap-3 transition-colors">
          <Button
            variant="outline"
            onClick={handleClose}
            fullWidth
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            fullWidth
            disabled={!hasChanges || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManagePermissionsModal;