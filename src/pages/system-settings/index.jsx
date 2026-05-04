import React, { useState } from 'react';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';

const SystemSettings = () => {
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user } = useUserContext();

  const settingsSections = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Configure general system preferences and defaults',
      icon: 'Settings',
      status: 'Coming Soon'
    },
    {
      id: 'security',
      title: 'Security & Authentication',
      description: 'Manage security policies, password requirements, and session settings',
      icon: 'Shield',
      status: 'Coming Soon'
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Configure email notifications, alerts, and system messages',
      icon: 'Bell',
      status: 'Coming Soon'
    },
    {
      id: 'integration',
      title: 'Integration Settings',
      description: 'Manage third-party integrations and API configurations',
      icon: 'Link',
      status: 'Coming Soon'
    },
    {
      id: 'compliance',
      title: 'Compliance Configuration',
      description: 'Set compliance thresholds, reporting periods, and regulatory parameters',
      icon: 'FileText',
      status: 'Coming Soon'
    },
    {
      id: 'audit',
      title: 'Audit & Logging',
      description: 'Configure audit trails, log retention, and monitoring settings',
      icon: 'Activity',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation />
      
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarExpanded ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <div className="bg-surface border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="typography-h1 mb-2">
                System Settings
              </h1>
              <p className="text-sm text-onBackground/60 mt-1">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Icon name="Info" className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                System Settings Module
              </h3>
              <p className="text-sm text-blue-700">
                This section will contain system-wide configuration options. Additional settings modules are currently under development and will be available soon.
              </p>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsSections?.map((section) => (
              <div
                key={section?.id}
                className="bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={section?.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    {section?.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-onBackground mb-2">
                  {section?.title}
                </h3>
                
                <p className="text-sm text-onBackground/60 mb-4">
                  {section?.description}
                </p>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full"
                >
                  Configure
                </Button>
              </div>
            ))}
          </div>

          {/* Quick Access Section */}
          <div className="mt-8 bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-onBackground mb-4 flex items-center gap-2">
              <Icon name="Zap" className="w-5 h-5" />
              Quick Access
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Icon name="Users" className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-onBackground">User Management</p>
                  <p className="text-xs text-onBackground/60">Manage users and roles</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/user-management'}
                >
                  Go
                </Button>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Icon name="Shield" className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-onBackground">AD Configuration</p>
                  <p className="text-xs text-onBackground/60">Configure LDAP settings</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/ad-configuration'}
                >
                  Go
                </Button>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Icon name="UserCog" className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-onBackground">Role Management</p>
                  <p className="text-xs text-onBackground/60">Configure roles and permissions</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/role-management'}
                >
                  Go
                </Button>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Icon name="FileText" className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-onBackground">Reporting</p>
                  <p className="text-xs text-onBackground/60">Access reports and exports</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/reporting'}
                >
                  Go
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;