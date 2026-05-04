import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeScreen, setActiveScreen] = useState('/dashboard');
  
  // Initialize collapsed state from localStorage or default to true (collapsed)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCollapsed = localStorage.getItem('sidebarCollapsed');
        return savedCollapsed !== null ? JSON.parse(savedCollapsed) : true; // Default to collapsed
      } catch (error) {
        console.error('Error loading sidebar state:', error);
        return true; // Default to collapsed on error
      }
    }
    return true; // Default to collapsed
  });

  // Track hover state so pages can compute the correct margin
  const [sidebarHovered, setSidebarHovered] = useState(false);
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // True when the sidebar is visually wide (either locked-expanded or hover-expanded)
  const isSidebarExpanded = !sidebarCollapsed || sidebarHovered;

  useEffect(() => {
    const path = location?.pathname;
    setActiveScreen(path);

    if (path === '/dashboard') {
      setActiveSection('dashboard');
    } else if (path === '/dataset-management' || path === '/rule-configuration') {
      setActiveSection('data-management');
    } else if (path === '/case-review' || path?.startsWith('/reporting')) {
      setActiveSection('review-reporting');
    } else if (path === '/user-management' || path === '/role-management' || path?.startsWith('/administration')) {
      setActiveSection('administration');
    }
  }, [location]);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      } catch (error) {
        console.error('Error saving sidebar state:', error);
      }
    }
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const value = {
    activeSection,
    setActiveSection,
    activeScreen,
    setActiveScreen,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    toggleMobileSidebar,
    sidebarHovered,
    setSidebarHovered,
    isSidebarExpanded,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationContext must be used within NavigationProvider');
  }
  return context;
};

export default NavigationContext;
function useNavigation(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: useNavigation is not implemented yet.', args);
  return null;
}

export { useNavigation };