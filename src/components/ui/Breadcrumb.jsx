import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ customPaths = null }) => {
  const location = useLocation();
  
  // Route name mapping
  const routeNameMap = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/user-management': 'User Management',
    '/role-management': 'Role Management',
    '/rule-management': 'Rule Management',
    '/dataset-management': 'Dataset Management',
    '/case-review': 'Case Review',
    '/reporting': 'Reporting',
    '/business-enrichment-portal': 'Business Enrichment',
    '/submission-log-screen': 'Submission Log',
    '/ad-configuration': 'AD Configuration',
    '/administration': 'Administration',
  };

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    if (customPaths) return customPaths;
    
    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    
    // Always start with Dashboard
    const breadcrumbs = [{ name: 'Dashboard', path: '/dashboard' }];
    
    // If we're on dashboard, return just that
    if (pathSegments?.length === 0 || (pathSegments?.length === 1 && pathSegments?.[0] === 'dashboard')) {
      return breadcrumbs;
    }
    
    // Build path progressively
    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = routeNameMap?.[currentPath] || segment?.split('-')?.map(word => 
        word?.charAt(0)?.toUpperCase() + word?.slice(1)
      )?.join(' ');
      
      breadcrumbs?.push({
        name,
        path: currentPath,
        isLast: index === pathSegments?.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={crumb?.path}>
          {index > 0 && (
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          )}
          {crumb?.isLast || index === breadcrumbs?.length - 1 ? (
            <span className="text-foreground font-medium">
              {crumb?.name}
            </span>
          ) : (
            <Link
              to={crumb?.path}
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 inline-block"
            >
              {crumb?.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;