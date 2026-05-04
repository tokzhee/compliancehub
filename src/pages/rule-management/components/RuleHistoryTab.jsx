import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  Search,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  Edit3,
  Plus,
  Send,
  Calendar,
  ChevronDown
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import RuleVersionComparisonModal from './RuleVersionComparisonModal';
import {
  getRuleVersionHistory,
  getRuleModifiers,
  getRuleVersionStats
} from '../../../services/ruleVersionHistoryService';
import { useToast } from '../../../contexts/ToastContext';

const RuleHistoryTab = ({ selectedRule }) => {
  const [versions, setVersions] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [modifiers, setModifiers] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const { showToast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    changeType: '',
    changedBy: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch version history
  useEffect(() => {
    if (selectedRule?.id) {
      fetchVersionHistory();
      fetchModifiers();
      fetchStats();
    }
  }, [selectedRule]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [versions, filters]);

  const fetchVersionHistory = async () => {
    setLoading(true);
    try {
      const result = await getRuleVersionHistory(selectedRule?.id);
      if (result?.success) {
        setVersions(result?.data);
      } else {
        showToast(result?.error || 'Failed to fetch version history', 'error');
      }
    } catch (error) {
      showToast('Error loading version history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchModifiers = async () => {
    try {
      const result = await getRuleModifiers(selectedRule?.id);
      if (result?.success) {
        setModifiers(result?.data);
      }
    } catch (error) {
      console.error('Error fetching modifiers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await getRuleVersionStats(selectedRule?.id);
      if (result?.success) {
        setStats(result?.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...versions];

    // Search term filter
    if (filters?.searchTerm) {
      const term = filters?.searchTerm?.toLowerCase();
      filtered = filtered?.filter(
        (v) =>
          v?.changedBy?.fullName?.toLowerCase()?.includes(term) ||
          v?.changeType?.toLowerCase()?.includes(term) ||
          v?.versionNumber?.toString()?.includes(term)
      );
    }

    // Change type filter
    if (filters?.changeType) {
      filtered = filtered?.filter((v) => v?.changeType === filters?.changeType);
    }

    // Changed by filter
    if (filters?.changedBy) {
      filtered = filtered?.filter((v) => v?.changedBy?.id === filters?.changedBy);
    }

    // Date range filter
    if (filters?.startDate) {
      filtered = filtered?.filter(
        (v) => new Date(v.modifiedDate) >= new Date(filters.startDate)
      );
    }
    if (filters?.endDate) {
      filtered = filtered?.filter(
        (v) => new Date(v.modifiedDate) <= new Date(filters.endDate)
      );
    }

    setFilteredVersions(filtered);
  };

  const handleViewChanges = (version) => {
    setSelectedVersion(version);
    setShowComparisonModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      changeType: '',
      changedBy: '',
      startDate: '',
      endDate: ''
    });
  };

  const getChangeTypeIcon = (changeType) => {
    switch (changeType) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <Edit3 className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'submitted':
        return <Send className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getChangeTypeBadge = (changeType) => {
    const badges = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      submitted: 'bg-purple-100 text-purple-800'
    };
    return badges?.[changeType] || 'bg-gray-100 text-gray-800';
  };

  if (!selectedRule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Select a rule to view its history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalVersions}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Versions</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="text-2xl font-bold text-green-700">
              {stats?.created}
            </div>
            <div className="text-xs text-green-600 mt-1">Created</div>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="text-2xl font-bold text-yellow-700">
              {stats?.updated}
            </div>
            <div className="text-xs text-yellow-600 mt-1">Updated</div>
          </div>
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="text-2xl font-bold text-purple-700">
              {stats?.submitted}
            </div>
            <div className="text-xs text-purple-600 mt-1">Submitted</div>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="text-2xl font-bold text-blue-700">
              {stats?.approved}
            </div>
            <div className="text-xs text-blue-600 mt-1">Approved</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-700">
              {stats?.rejected}
            </div>
            <div className="text-xs text-red-600 mt-1">Rejected</div>
          </div>
        </div>
      )}
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by version, user, or change type..."
              value={filters?.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e?.target?.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <Select
              label="Change Type"
              value={filters?.changeType}
              onChange={(e) => handleFilterChange('changeType', e?.target?.value)}
            >
              <option value="">All Types</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>

            <Select
              label="Changed By"
              value={filters?.changedBy}
              onChange={(e) => handleFilterChange('changedBy', e?.target?.value)}
            >
              <option value="">All Users</option>
              {modifiers?.map((user) => (
                <option key={user?.id} value={user?.id}>
                  {user?.fullName}
                </option>
              ))}
            </Select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters?.startDate}
                onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters?.endDate}
                onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
              />
            </div>

            <div className="md:col-span-4 flex justify-end">
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Version Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Version History Timeline
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredVersions?.length} version{filteredVersions?.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredVersions?.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No version history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVersions?.map((version, index) => (
                <div
                  key={version?.id}
                  className="relative bg-gray-50 rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  {/* Timeline connector */}
                  {index < filteredVersions?.length - 1 && (
                    <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-300 -mb-4"></div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Version Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        v{version?.versionNumber}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Change Type Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                getChangeTypeBadge(version?.changeType)
                              }`}
                            >
                              {getChangeTypeIcon(version?.changeType)}
                              {version?.changeType?.toUpperCase()}
                            </span>
                          </div>

                          {/* Date and User */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(version.modifiedDate)?.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              <span>{version?.changedBy?.fullName}</span>
                            </div>
                          </div>

                          {/* Changed Fields Summary */}
                          {version?.changes?.new_values && (
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">Changed fields:</span>
                              <span className="ml-2">
                                {Object.keys(version?.changes?.new_values)?.filter((key) => key !== 'conditions')?.join(', ') || 'None'}
                              </span>
                              {version?.changes?.new_values?.conditions && (
                                <span className="ml-2 text-blue-600">
                                  + Conditions
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* View Changes Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewChanges(version)}
                        >
                          View Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Comparison Modal */}
      <RuleVersionComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        versionData={selectedVersion}
      />
    </div>
  );
};

export default RuleHistoryTab;