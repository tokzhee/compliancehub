import React, { useState, useEffect } from 'react';
import SidebarNavigation from '../../components/navigation/SidebarNavigation';
import { useNavigationContext } from '../../contexts/NavigationContext';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import AccordionSection from './components/AccordionSection';
import SearchBar from './components/SearchBar';
import { getResourcesContent, parseMarkdown } from '../../services/resourcesService';
import ResourcesEditorModal from './components/ResourcesEditorModal';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import Select from '../../components/ui/Select';
import { logActivity } from '../../services/activityService';
import { useUserContext } from '../../contexts/UserContext';

const Resources = () => {
  const { sidebarCollapsed, isSidebarExpanded } = useNavigationContext();
  const { userProfile } = useAuth();
  const { user } = useUserContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState([]);
  const [resourceSections, setResourceSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Fetch resources content from database
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResourcesContent();
      
      // Extract unique categories and tags
      const categories = [...new Set(data?.map(item => item?.category)?.filter(Boolean))];
      const tags = [...new Set(data?.flatMap(item => item?.tags || []))];
      
      setAvailableCategories(categories);
      setAvailableTags(tags);
      
      // Transform database content to component format
      const sections = data?.map(item => ({
        id: item?.id,
        sectionId: item?.sectionId,
        title: item?.title,
        category: item?.category,
        tags: item?.tags || [],
        icon: item?.icon,
        content: item?.contentType === 'markdown' 
          ? { html: parseMarkdown(item?.content) }
          : { html: item?.content }
      })) || [];
      
      setResourceSections(sections);
      
      // Expand first section by default
      if (sections?.length > 0) {
        setExpandedSections([sections?.[0]?.id]);
      }
    } catch (err) {
      console.error('Error loading resources:', err);
      setError(err?.message || 'Failed to load resources content');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is System Administrator
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        if (userProfile?.role_id) {
          const { data: roleData } = await supabase?.from('roles')?.select('role_name')?.eq('id', userProfile?.role_id)?.single();
          setIsAdmin(roleData?.role_name === 'System Administrator');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };

    checkAdminRole();
  }, [userProfile]);

  // Load resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev?.includes(sectionId) 
        ? prev?.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Filter sections based on search query, category, and tags
  const filteredSections = resourceSections?.filter(section => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery?.toLowerCase();
      const matchesSearch = section?.title?.toLowerCase()?.includes(query) ||
        section?.content?.html?.toLowerCase()?.includes(query);
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (selectedCategory && section?.category !== selectedCategory) {
      return false;
    }
    
    // Tags filter (section must have ALL selected tags)
    if (selectedTags?.length > 0) {
      const hasAllTags = selectedTags?.every(tag => section?.tags?.includes(tag));
      if (!hasAllTags) return false;
    }
    
    return true;
  });

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
    setSearchQuery('');
  };

  const handleToggleTag = (tag) => {
    setSelectedTags(prev => 
      prev?.includes(tag) 
        ? prev?.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + selectedTags?.length + (searchQuery ? 1 : 0);

  const handleCreateNew = () => {
    setEditingResourceId(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (resourceId) => {
    setEditingResourceId(resourceId);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setEditingResourceId(null);
  };

  const handleEditorSave = () => {
    // Refresh resources list
    logActivity(
      user?.userId,
      user?.organizationId,
      editingResourceId ? 'resource_updated' : 'resource_created',
      'resources'
    );
    fetchResources();
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumb
                items={[
                  { label: 'Resources', path: '/resources' }
                ]}
              />
              <h1 className="text-2xl font-bold text-foreground mt-1">
                Compliance Resources
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Step-by-step guides for FATCA and CRS compliance processes
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCreateNew}
                >
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  Create New Resource
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <Icon name="X" className="w-4 h-4 mr-1" />
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e?.target?.value)}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...availableCategories?.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
              </div>
            </div>

            {/* Tag Filter Chips */}
            {availableTags?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags?.map((tag) => {
                    const isSelected = selectedTags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {tag}
                        {isSelected && (
                          <Icon name="Check" className="w-3 h-3 ml-1 inline" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Filters Indicator */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Filter" className="w-4 h-4" />
                <span>
                  Showing {filteredSections?.length} of {resourceSections?.length} resources
                </span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading resources...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Resources</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => window.location?.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Resources Content */}
          {!loading && !error && (
            <>
              {filteredSections?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory || selectedTags?.length > 0
                      ? 'No resources match your filters' :'No resources available at this time'}
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSections?.map((section) => (
                    <div key={section?.id} className="relative">
                      <AccordionSection
                        section={section}
                        isExpanded={expandedSections?.includes(section?.id)}
                        onToggle={() => toggleSection(section?.id)}
                        searchQuery={searchQuery}
                      />
                      {isAdmin && (
                        <button
                          onClick={() => handleEdit(section?.id)}
                          className="absolute top-4 right-4 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                          title="Edit this resource"
                        >
                          <Icon name="Edit" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Resources Editor Modal */}
      <ResourcesEditorModal
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        resourceId={editingResourceId}
        onSave={handleEditorSave}
      />
    </div>
  );
};

export default Resources;