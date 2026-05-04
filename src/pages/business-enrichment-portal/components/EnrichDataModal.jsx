import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { enrichmentService } from '../../../services/enrichmentService';

const EnrichDataModal = ({ isOpen, onClose, caseData, onSave, regimeType }) => {
  const [formData, setFormData] = useState({
    tin: '',
    tax_residency: '',
    entity_classification: '',
    controlling_person: '',
    address: '',
    notes: ''
  });
  const [caseDetails, setCaseDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!caseData?.id) return;

      try {
        const details = await enrichmentService?.getCaseDetails(caseData?.id);
        setCaseDetails(details);

        // Pre-populate form with existing values
        const detailsMap = {};
        details?.forEach(detail => {
          if (detail?.updated_value) {
            detailsMap[detail?.field_name] = detail?.updated_value;
          }
        });
        setFormData(prev => ({ ...prev, ...detailsMap }));
      } catch (err) {
        console.error('Error fetching case details:', err);
      }
    };

    if (isOpen) {
      fetchCaseDetails();
    }
  }, [isOpen, caseData?.id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      console.error('Error saving enrichment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-2xl transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Enrich Customer Data</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              {caseData?.customer_name} - {caseData?.account_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-all"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Customer Info Summary */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Customer ID</p>
                <p className="text-sm font-medium text-foreground">{caseData?.customer_id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Balance</p>
                <p className="text-sm font-medium text-foreground">
                  ${caseData?.account_balance?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Country</p>
                <p className="text-sm font-medium text-foreground">{caseData?.country_code || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Regime-Specific Fields */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Flag" className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {regimeType} Required Information
              </h3>
            </div>

            <div className="space-y-4">
              {/* TIN */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tax Identification Number (TIN) *
                </label>
                <Input
                  type="text"
                  value={formData?.tin}
                  onChange={(e) => handleChange('tin', e?.target?.value)}
                  placeholder="Enter TIN"
                  required
                />
              </div>

              {/* Tax Residency */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tax Residency *
                </label>
                <Input
                  type="text"
                  value={formData?.tax_residency}
                  onChange={(e) => handleChange('tax_residency', e?.target?.value)}
                  placeholder="Enter tax residency country"
                  required
                />
              </div>

              {/* Entity Classification */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Entity Classification *
                </label>
                <select
                  value={formData?.entity_classification}
                  onChange={(e) => handleChange('entity_classification', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select classification</option>
                  <option value="Individual">Individual</option>
                  <option value="Entity">Entity</option>
                  <option value="Passive NFE">Passive NFE</option>
                  <option value="Active NFE">Active NFE</option>
                  <option value="Financial Institution">Financial Institution</option>
                </select>
              </div>

              {/* Controlling Person (for CRS) */}
              {regimeType === 'CRS' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Controlling Person(s)
                  </label>
                  <Input
                    type="text"
                    value={formData?.controlling_person}
                    onChange={(e) => handleChange('controlling_person', e?.target?.value)}
                    placeholder="Enter controlling person details"
                  />
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <textarea
                  value={formData?.address}
                  onChange={(e) => handleChange('address', e?.target?.value)}
                  placeholder="Enter complete address"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Enrichment Notes
                </label>
                <textarea
                  value={formData?.notes}
                  onChange={(e) => handleChange('notes', e?.target?.value)}
                  placeholder="Add any relevant notes or comments"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Previous Updates */}
          {caseDetails?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Previous Updates
              </h3>
              <div className="space-y-2">
                {caseDetails?.slice(0, 5)?.map((detail) => (
                  <div key={detail?.id} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        {detail?.field_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(detail?.updated_on)?.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">
                      {detail?.updated_value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader" className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="Save" className="w-4 h-4 mr-2" />
                  Save Enrichment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrichDataModal;