import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const PermissionMatrix = ({ role, permissions, onSave, onCancel }) => {
  const [modifiedPermissions, setModifiedPermissions] = useState(permissions);
  const [hasChanges, setHasChanges] = useState(false);

  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'LayoutDashboard',
      permissions: ['dashboard.view', 'dashboard.export']
    },
    {
      id: 'dataset',
      name: 'Dataset Management',
      icon: 'Database',
      permissions: ['dataset.view', 'dataset.manage', 'dataset.upload', 'dataset.delete']
    },
    {
      id: 'rules',
      name: 'Rule Configuration',
      icon: 'Settings',
      permissions: ['rules.view', 'rules.configure', 'rules.activate', 'rules.simulate']
    },
    {
      id: 'cases',
      name: 'Case Review',
      icon: 'CheckSquare',
      permissions: ['cases.view', 'cases.review', 'cases.assign', 'cases.override']
    },
    {
      id: 'reports',
      name: 'Reporting Module',
      icon: 'FileText',
      permissions: ['reports.view', 'reports.generate', 'reports.approve', 'reports.export']
    },
    {
      id: 'users',
      name: 'User Management',
      icon: 'Users',
      permissions: ['users.view', 'users.create', 'users.edit', 'users.suspend']
    },
    {
      id: 'roles',
      name: 'Role Management',
      icon: 'Shield',
      permissions: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete']
    },
    {
      id: 'admin',
      name: 'Administration',
      icon: 'Cog',
      permissions: ['admin.view', 'admin.configure', 'admin.audit']
    }
  ];

  const handlePermissionToggle = (permission) => {
    let updated = modifiedPermissions?.includes(permission)
      ? modifiedPermissions?.filter(p => p !== permission)
      : [...modifiedPermissions, permission];
    
    setModifiedPermissions(updated);
    setHasChanges(true);
  };

  const handleSelectAll = (modulePermissions) => {
    const allSelected = modulePermissions?.every(p => modifiedPermissions?.includes(p));
    
    let updated;
    if (allSelected) {
      updated = modifiedPermissions?.filter(p => !modulePermissions?.includes(p));
    } else {
      updated = [...new Set([...modifiedPermissions, ...modulePermissions])];
    }
    
    setModifiedPermissions(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(modifiedPermissions);
    setHasChanges(false);
  };

  const formatPermissionLabel = (permission) => {
    const action = permission?.split('.')?.[1];
    return action?.charAt(0)?.toUpperCase() + action?.slice(1);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
              Permission Matrix
            </h3>
            <p className="text-sm text-muted-foreground">
              Configure permissions for {role?.name || 'selected role'}
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2 text-sm text-warning">
              <Icon name="AlertCircle" size={16} />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 md:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {modules?.map((module) => {
          const modulePermissions = module.permissions;
          const allSelected = modulePermissions?.every(p => modifiedPermissions?.includes(p));
          const someSelected = modulePermissions?.some(p => modifiedPermissions?.includes(p)) && !allSelected;

          return (
            <div key={module.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={module.icon} size={20} className="text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">
                    {module.name}
                  </h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(modulePermissions)}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modulePermissions?.map((permission) => (
                  <Checkbox
                    key={permission}
                    label={formatPermissionLabel(permission)}
                    checked={modifiedPermissions?.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="text-sm"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 md:p-6 border-t border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={!hasChanges}
            fullWidth
            className="sm:w-auto"
          >
            Save Permissions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;