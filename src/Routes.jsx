import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { UserContextProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "pages/NotFound";
import Login from "./pages/login";
import RoleManagement from './pages/role-management';
import UserManagement from './pages/user-management';
import Dashboard from './pages/dashboard';
import CaseReview from './pages/case-review';
import DatasetManagement from './pages/dataset-management';
import AdConfiguration from './pages/ad-configuration';
import Reporting from './pages/reporting';
import BusinessEnrichmentPortal from './pages/business-enrichment-portal';
import SubmissionLogScreen from './pages/submission-log-screen';
import RuleManagement from './pages/rule-management';
import SystemSettings from './pages/system-settings';
import Resources from './pages/resources';
import SegmentGiinManagement from './pages/segment-giin-management';

const Routes = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <UserContextProvider>
              <NavigationProvider>
                <ErrorBoundary>
                  <ScrollToTop />
                  <RouterRoutes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/role-management" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
                    <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                    <Route path="/case-review" element={<ProtectedRoute><CaseReview /></ProtectedRoute>} />
                    <Route path="/dataset-management" element={<ProtectedRoute><DatasetManagement /></ProtectedRoute>} />
                    <Route path="/ad-configuration" element={<ProtectedRoute><AdConfiguration /></ProtectedRoute>} />
                    <Route path="/reporting" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
                    <Route path="/business-enrichment-portal" element={<ProtectedRoute><BusinessEnrichmentPortal /></ProtectedRoute>} />
                    <Route path="/submission-log-screen" element={<ProtectedRoute><SubmissionLogScreen /></ProtectedRoute>} />
                    <Route path="/rule-management" element={<ProtectedRoute><RuleManagement /></ProtectedRoute>} />
                    <Route path="/administration" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
                    <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                    <Route path="/segment-giin-management" element={<ProtectedRoute><SegmentGiinManagement /></ProtectedRoute>} />
                    
                    <Route path="*" element={<NotFound />} />
                  </RouterRoutes>
                </ErrorBoundary>
              </NavigationProvider>
            </UserContextProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default Routes;
