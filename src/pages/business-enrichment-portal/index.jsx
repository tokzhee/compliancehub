import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useUserContext } from '../../contexts/UserContext';
import CasesGrid from './components/CasesGrid';
import EnrichDataModal from './components/EnrichDataModal';
import DataCompletenessPanel from './components/DataCompletenessPanel';
import RegimeToggle from './components/RegimeToggle';
import { enrichmentService } from '../../services/enrichmentService';
import { regimeService } from '../../services/regimeService';
import { supabase } from '../../lib/supabase';
import Breadcrumb from '../../components/ui/Breadcrumb';
import AccessRestricted from '../../components/ui/AccessRestricted';
import { SkeletonGrid } from '../../components/ui/SkeletonLoader';
import { logActivity } from '../../services/activityService';

const BusinessEnrichmentPortal = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { user, hasPermission } = useUserContext();

  useEffect(() => {
    if (!hasPermission('enrichment.access')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  const [selectedRegime, setSelectedRegime] = useState('FATCA');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showEnrichModal, setShowEnrichModal] = useState(false);
  const [userSegments, setUserSegments] = useState([]);
  const [filters, setFilters] = useState({
    regimeType: 'all',
    caseStatus: 'all',
    completenessStatus: 'all',
    search: ''
  });

  useEffect(() => {
    const fetchUserSegments = async () => {
      if (!user?.userId) return;

      try {
        const segments = await regimeService?.getUserSegmentRoles(user?.userId);
        setUserSegments(segments);
      } catch (err) {
        console.error('Error fetching user segments:', err);
      }
    };

    fetchUserSegments();
  }, [user?.userId]);

  useEffect(() => {
    const fetchCases = async () => {
      if (!user?.organizationId || !user?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedCases = await enrichmentService?.getCasesForEnrichment(
          user?.organizationId,
          user?.userId,
          { ...filters, regimeType: selectedRegime }
        );
        setCases(fetchedCases);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError('Failed to load cases. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();

    // Set up real-time subscription for case changes
    let caseMasterChannel = null;
    let caseDetailsChannel = null;

    if (supabase) {
      caseMasterChannel = supabase?.channel('case_master_realtime')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fatca_crs_case_master'
          },
          () => {
            // Refetch cases when any case is updated
            if (user?.organizationId && user?.userId) {
              enrichmentService?.getCasesForEnrichment(
                user?.organizationId,
                user?.userId,
                { ...filters, regimeType: selectedRegime }
              )?.then(setCases);
            }
          }
        )?.subscribe();

      // Set up real-time subscription for case details changes
      caseDetailsChannel = supabase?.channel('case_details_realtime')?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fatca_crs_case_details'
          },
          () => {
            // Refetch cases when case details are updated
            if (user?.organizationId && user?.userId) {
              enrichmentService?.getCasesForEnrichment(
                user?.organizationId,
                user?.userId,
                { ...filters, regimeType: selectedRegime }
              )?.then(setCases);
            }
          }
        )?.subscribe();
    }

    // Cleanup function
    return () => {
      if (caseMasterChannel) {
        supabase?.removeChannel(caseMasterChannel);
      }
      if (caseDetailsChannel) {
        supabase?.removeChannel(caseDetailsChannel);
      }
    };
  }, [user?.organizationId, user?.userId, selectedRegime, filters]);

  const handleEnrichData = (caseItem) => {
    setSelectedCase(caseItem);
    setShowEnrichModal(true);
  };

  const handleSaveEnrichment = async (enrichmentData) => {
    try {
      // Update each field
      for (const [fieldName, value] of Object.entries(enrichmentData)) {
        if (value) {
          await enrichmentService?.updateCaseField(
            selectedCase?.id,
            user?.userId,
            fieldName,
            value
          );
        }
      }

      // Refresh cases
      const fetchedCases = await enrichmentService?.getCasesForEnrichment(
        user?.organizationId,
        user?.userId,
        { ...filters, regimeType: selectedRegime }
      );
      setCases(fetchedCases);

      await logActivity(
        user?.userId,
        user?.organizationId,
        'case_enrichment_saved',
        'business_enrichment_portal'
      );
      setShowEnrichModal(false);
      setSelectedCase(null);
    } catch (err) {
      console.error('Error saving enrichment:', err);
      alert('Failed to save enrichment data. Please try again.');
    }
  };

  const handleMarkReady = async (caseId) => {
    try {
      await enrichmentService?.markCaseReady(caseId, user?.userId);

      // Refresh cases
      const fetchedCases = await enrichmentService?.getCasesForEnrichment(
        user?.organizationId,
        user?.userId,
        { ...filters, regimeType: selectedRegime }
      );
      setCases(fetchedCases);

      await logActivity(
        user?.userId,
        user?.organizationId,
        'case_marked_ready',
        'business_enrichment_portal'
      );
    } catch (err) {
      console.error('Error marking case ready:', err);
      alert('Failed to mark case as ready. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredCases = cases?.filter(caseItem => {
    // Search filter
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      const matchesSearch = 
        caseItem?.customer_name?.toLowerCase()?.includes(searchLower) ||
        caseItem?.account_number?.toLowerCase()?.includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Case status filter
    if (filters?.caseStatus !== 'all' && caseItem?.case_status !== filters?.caseStatus) {
      return false;
    }

    // Completeness status filter
    if (filters?.completenessStatus !== 'all' && caseItem?.completeness_status !== filters?.completenessStatus) {
      return false;
    }

    return true;
  });

  const completenessStats = {
    total: cases?.length || 0,
    complete: cases?.filter(c => c?.completeness_status === 'Complete')?.length || 0,
    incomplete: cases?.filter(c => c?.completeness_status !== 'Complete')?.length || 0,
    readyForReview: cases?.filter(c => c?.case_status === 'Ready for Review')?.length || 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Business Enrichment Portal - ComplianceHub</title>
      </Helmet>
      <SidebarNavigation />
      <main 
        className={`transition-all duration-250 ease-out ${
          isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumb />
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="typography-h2 mb-2">
                  Business Enrichment Portal
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update customer tax information and entity classifications
                </p>
              </div>
              <RegimeToggle 
                selectedRegime={selectedRegime}
                onRegimeChange={setSelectedRegime}
              />
            </div>

            {/* User Segment Info */}
            {userSegments?.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="Users" className="w-5 h-5 text-primary" />
                  <span className="typography-label text-foreground">
                    Assigned Teams:
                  </span>
                  <div className="flex gap-2">
                    {userSegments?.map(segment => (
                      <span 
                        key={segment?.id}
                        className="px-3 py-1 bg-primary/10 text-primary typography-caption rounded-full"
                      >
                        {segment?.assignment_team} - {segment?.business_segments?.segment_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Completeness Panel */}
          <DataCompletenessPanel stats={completenessStats} />

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block typography-label text-foreground mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Customer name or account..."
                  value={filters?.search}
                  onChange={(e) => handleFilterChange('search', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block typography-label text-foreground mb-2">
                  Case Status
                </label>
                <select
                  value={filters?.caseStatus}
                  onChange={(e) => handleFilterChange('caseStatus', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="Incomplete">Incomplete</option>
                  <option value="Under Enrichment">Under Enrichment</option>
                  <option value="Ready for Review">Ready for Review</option>
                </select>
              </div>
              <div>
                <label className="block typography-label text-foreground mb-2">
                  Completeness
                </label>
                <select
                  value={filters?.completenessStatus}
                  onChange={(e) => handleFilterChange('completenessStatus', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All</option>
                  <option value="Complete">Complete</option>
                  <option value="Missing TIN">Missing TIN</option>
                  <option value="Missing Tax Residency">Missing Tax Residency</option>
                  <option value="Missing Classification">Missing Classification</option>
                  <option value="Multiple Issues">Multiple Issues</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    regimeType: 'all',
                    caseStatus: 'all',
                    completenessStatus: 'all',
                    search: ''
                  })}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Cases Grid */}
          {!hasPermission('enrichment.access') ? (
            <AccessRestricted message="You don't have permission to access enrichment portal" />
          ) : loading ? (
            <SkeletonGrid cards={9} columns={3} />
          ) : error ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
              <Icon name="alert-circle" className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-foreground font-medium">{error}</p>
            </div>
          ) : filteredCases?.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors">
              <Icon name="database" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No cases available for enrichment</p>
              <p className="text-muted-foreground text-sm mt-2">
                Cases requiring data enrichment will appear here
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <CasesGrid 
                cases={cases}
                onEnrichData={handleEnrichData}
                onMarkReady={handleMarkReady}
              />
            </div>
          )}
        </div>
      </main>

      {/* Enrich Data Modal */}
      {showEnrichModal && selectedCase && (
        <EnrichDataModal
          isOpen={showEnrichModal}
          onClose={() => {
            setShowEnrichModal(false);
            setSelectedCase(null);
          }}
          caseData={selectedCase}
          onSave={handleSaveEnrichment}
          regimeType={selectedRegime}
        />
      )}
    </div>
  );
};

export default BusinessEnrichmentPortal;