import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { reportingService } from '../../../services/reportingService';

const GenerateReportModal = ({ organizationId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    jobName: '',
    reportingYearId: ''
  });
  const [reportingYears, setReportingYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchReportingYears = async () => {
      if (!organizationId) return;

      try {
        const years = await reportingService?.getReportingYears(organizationId);
        setReportingYears(years);
      } catch (err) {
        console.error('Error fetching reporting years:', err);
      }
    };

    fetchReportingYears();
  }, [organizationId]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors?.[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData?.jobName?.trim()) {
      newErrors.jobName = 'Report name is required';
    }

    if (!formData?.reportingYearId) {
      newErrors.reportingYearId = 'Reporting year is required';
    }

    setErrors(newErrors);
    return Object?.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = reportingYears?.map(year => ({
    value: year?.id,
    label: `${year?.year} (${new Date(year?.start_date)?.toLocaleDateString()} - ${new Date(year?.end_date)?.toLocaleDateString()})`
  }));

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground transition-colors">Generate FATCA Report</h2>
              <p className="text-sm text-muted-foreground transition-colors">Create a new compliance report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Report Name"
            placeholder="e.g., Q4 2026 FATCA Compliance Report"
            value={formData?.jobName}
            onChange={(e) => handleChange('jobName', e?.target?.value)}
            error={errors?.jobName}
            required
          />

          <Select
            label="Reporting Year"
            placeholder="Select reporting year"
            options={yearOptions}
            value={formData?.reportingYearId}
            onChange={(value) => handleChange('reportingYearId', value)}
            error={errors?.reportingYearId}
            required
          />

          {/* Info Box */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg transition-colors">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1 transition-colors">Report Generation Process</p>
                <p className="text-xs text-muted-foreground transition-colors">
                  This will create a new reporting job and trigger the .NET backend API to generate the FATCA compliance report. The report will be available for download once processing is complete.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              iconName="FileText"
              loading={loading}
              fullWidth
            >
              Generate Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportModal;