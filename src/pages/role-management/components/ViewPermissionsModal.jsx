import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ViewPermissionsModal = ({ isOpen, onClose, role, permissions }) => {
  if (!isOpen) return null;

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

  // Group permissions by module
  const groupedPermissions = (permissions || [])?.reduce((acc, perm) => {
    const module = perm?.module;
    if (!acc?.[module]) {
      acc[module] = [];
    }
    acc?.[module]?.push(perm);
    return acc;
  }, {});

  const formatAction = (action) => {
    return action?.charAt(0)?.toUpperCase() + action?.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      <div className="bg-card border border-border rounded-lg shadow-elevation-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card transition-colors">
          <div>
            <h2 className="text-xl font-semibold text-foreground transition-colors">View Permissions</h2>
            <p className="text-sm text-muted-foreground mt-1 transition-colors">
              Permissions assigned to {role?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted transition-base flex items-center justify-center"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(groupedPermissions)?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Icon name="Lock" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors">
                No Permissions Assigned
              </h3>
              <p className="text-sm text-muted-foreground transition-colors">
                This role doesn't have any permissions yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPermissions)?.map(([module, perms]) => (
                <div key={module} className="border border-border rounded-lg p-4 bg-card transition-colors">
                  <div className="flex items-center gap-3 mb-3">
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
                        {perms?.length} {perms?.length === 1 ? 'permission' : 'permissions'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {perms?.map((perm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg"
                      >
                        <Icon name="Check" size={14} className="text-success flex-shrink-0" />
                        <span className="text-sm text-foreground transition-colors">
                          {formatAction(perm?.action)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-muted/30 transition-colors">
          <Button
            variant="default"
            onClick={onClose}
            fullWidth
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewPermissionsModal;