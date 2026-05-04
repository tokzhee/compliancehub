import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useTheme } from '../../contexts/ThemeContext';
import AppIcon from '../AppIcon';
import NavigationSection from './NavigationSection';

const SidebarNavigation = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { user, loading: userLoading, hasAnyPermission } = useUserContext();
  const { mobileSidebarOpen, toggleMobileSidebar, sidebarCollapsed, toggleSidebar, setSidebarHovered, isSidebarExpanded } = useNavigationContext();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    const { error } = await signOut();
    
    if (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      return;
    }
    
    // Redirect to login page
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    toggleMobileSidebar();
  };

  const navigationSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      requiredPermissions: ['dashboard.view'],
      items: [
        {
          path: '/dashboard',
          label: 'Overview',
          icon: 'Home',
          requiredPermissions: ['dashboard.view']
        }
      ]
    },
    {
      id: 'data-management',
      label: 'Data Management',
      icon: 'Database',
      requiredPermissions: ['datasets.view', 'rules.view'],
      items: [
        {
          path: '/dataset-management',
          label: 'Dataset Management',
          icon: 'FolderOpen',
          requiredPermissions: ['datasets.view']
        },
        {
          path: '/rule-management',
          label: 'Rule Management',
          icon: 'Settings',
          requiredPermissions: ['rules.view']
        }
      ]
    },
    {
      id: 'review-reporting',
      label: 'Review & Reporting',
      icon: 'FileText',
      requiredPermissions: ['cases.view', 'reporting.view'],
      items: [
        {
          path: '/case-review',
          label: 'Case Review',
          icon: 'CheckSquare',
          badge: 12,
          requiredPermissions: ['cases.view']
        },
        {
          path: '/business-enrichment-portal',
          label: 'Business Enrichment',
          icon: 'Edit',
          requiredPermissions: ['enrichment.access']
        },
        {
          path: '/reporting',
          label: 'Reporting Module',
          icon: 'BarChart3',
          requiredPermissions: ['reporting.view']
        },
        {
          path: '/submission-log-screen',
          label: 'Submission Log',
          icon: 'Send',
          requiredPermissions: ['submissions.view']
        }
      ]
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: 'Shield',
      requiredPermissions: ['users.view', 'roles.view', 'ldap.view', 'segment_giin.view'],
      items: [
        {
          path: '/user-management',
          label: 'User Management',
          icon: 'Users',
          requiredPermissions: ['users.view']
        },
        {
          path: '/role-management',
          label: 'Role Management',
          icon: 'UserCog',
          requiredPermissions: ['roles.view']
        },
        {
          path: '/ad-configuration',
          label: 'AD Configuration',
          icon: 'Server',
          requiredPermissions: ['ldap.view']
        },
        {
          path: '/segment-giin-management',
          label: 'Segment GIIN',
          icon: 'Building',
          requiredPermissions: ['segment_giin.view']
        },
        {
          path: '/administration',
          label: 'System Settings',
          icon: 'Cog',
          requiredPermissions: ['ldap.view']
        }
      ]
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: 'BookOpen',
      requiredPermissions: [],
      items: [
        {
          path: '/resources',
          label: 'Compliance Guides',
          icon: 'FileText',
          requiredPermissions: []
        }
      ]
    }
  ];

  // Filter sections and items based on permissions
  const filteredSections = navigationSections
    ?.map(section => {
      // Filter items within section
      const filteredItems = section?.items?.filter(item => {
        // If requiredPermissions is empty array or not provided, allow access
        if (!item?.requiredPermissions || item?.requiredPermissions?.length === 0) {
          return true;
        }
        // Otherwise check permissions
        return hasAnyPermission(item?.requiredPermissions);
      });

      // Only include section if it has visible items
      if (filteredItems?.length > 0) {
        return {
          ...section,
          items: filteredItems
        };
      }
      return null;
    })
    ?.filter(Boolean); // Remove null sections

  // Determine if sidebar should show expanded (either locked expanded or hovering while collapsed)
  const isExpanded = isSidebarExpanded;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => sidebarCollapsed && setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border z-50
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0 shadow-lg
          ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }
          ${
            isExpanded ? 'w-64' : 'w-20'
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b border-border transition-all duration-300 ${
            isExpanded ? 'px-6' : 'px-4'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-3 overflow-hidden ${
                isExpanded ? 'w-full' : 'w-12'
              }`}>
                {/* Logo - Show image if available, fallback to icon */}
                {user?.branding?.logoUrl ? (
                  <img
                    src={user?.branding?.logoUrl}
                    alt={`${user?.branding?.organizationName || 'Organization'} logo`}
                    className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ display: user?.branding?.logoUrl ? 'none' : 'flex' }}
                >
                  <AppIcon name="Shield" size={24} className="text-white" />
                </div>
                {isExpanded && (
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base font-bold text-foreground truncate">
                      {userLoading ? 'Loading...' : (user?.branding?.organizationName || 'ComplianceHub')}
                    </h1>
                    <p className="text-xs text-muted-foreground truncate">
                      {userLoading ? 'Loading...' : (user?.name || 'User')}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-base flex-shrink-0"
              >
                <AppIcon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            {/* Theme Toggle Button */}
            <div className="mb-4">
              <button
                onClick={toggleTheme}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium 
                  text-foreground hover:bg-muted rounded-lg transition-all duration-300
                  ${
                    !isExpanded ? 'justify-center' : ''
                  }
                `}
                title={!isExpanded ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : ''}
              >
                <AppIcon 
                  name={theme === 'dark' ? 'Sun' : 'Moon'} 
                  size={20} 
                  className="flex-shrink-0 text-accent" 
                />
                {isExpanded && (
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                )}
              </button>
            </div>
            
            {/* User Profile Info - Only show when expanded */}
            {isExpanded && (
              <div className="transition-all duration-300">
                {userLoading ? (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ) : user ? (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <AppIcon name="User" size={14} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">
                        {user?.name || 'No Name'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AppIcon name="Building2" size={14} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        Org ID: {user?.organizationId?.slice(0, 8) || 'N/A'}...
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Toggle Button - Desktop only */}
            <button
              onClick={toggleSidebar}
              className={`
                hidden lg:flex items-center justify-center
                w-8 h-8 rounded-lg bg-muted hover:bg-muted/80
                transition-all duration-300 mt-4
                ${
                  isExpanded ? 'ml-auto' : 'mx-auto'
                }
              `}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <AppIcon 
                name={sidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
                size={16} 
                className="text-muted-foreground"
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredSections?.map((section, index) => (
                <NavigationSection
                  key={index}
                  id={section?.id}
                  label={section?.label}
                  icon={section?.icon}
                  title={section?.title}
                  items={section?.items}
                  onNavigate={handleNavigation}
                  isExpanded={isExpanded}
                />
              ))}
            </div>
          </nav>

          {/* Footer with Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-sm font-medium 
                text-error hover:bg-error/10 rounded-lg transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  !isExpanded ? 'justify-center' : ''
                }
              `}
              title={!isExpanded ? 'Logout' : ''}
            >
              <AppIcon name="LogOut" size={20} className="flex-shrink-0" />
              {isExpanded && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNavigation;