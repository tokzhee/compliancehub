import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';
import { useToast } from '../../../contexts/ToastContext';
import Select from '../../../components/ui/Select';

const UploadDatasetModal = ({ isOpen, onClose, onUpload, reportingYears }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    datasetName: '',
    reportingYear: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validFields, setValidFields] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [shakingFields, setShakingFields] = useState({});

  const validateField = (field, value) => {
    let error = '';
    let isValid = false;

    switch (field) {
      case 'datasetName':
        if (!value?.trim()) {
          error = 'Dataset name is required';
        } else if (value?.length < 3) {
          error = 'Dataset name must be at least 3 characters';
        } else if (value?.length > 100) {
          error = 'Dataset name must not exceed 100 characters';
        } else {
          isValid = true;
        }
        break;

      case 'reportingYear':
        if (!value) {
          error = 'Reporting year is required';
        } else {
          isValid = true;
        }
        break;

      case 'file':
        if (!value) {
          error = 'Please select a file to upload';
        } else if (value?.size > 50 * 1024 * 1024) {
          error = 'File size must be less than 50MB';
        } else if (!value?.name?.match(/\.(csv|xlsx|xls)$/i)) {
          error = 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed';
        } else {
          isValid = true;
        }
        break;

      default:
        break;
    }

    return { error, isValid };
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const { error, isValid } = validateField(field, formData?.[field]);
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      setValidFields(prev => ({ ...prev, [field]: false }));
      triggerShake(field);
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      setValidFields(prev => ({ ...prev, [field]: isValid }));
    }
  };

  const triggerShake = (field) => {
    setShakingFields(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setShakingFields(prev => ({ ...prev, [field]: false }));
    }, 500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for touched fields
    if (touched?.[field]) {
      const { error, isValid } = validateField(field, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        setValidFields(prev => ({ ...prev, [field]: false }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
        setValidFields(prev => ({ ...prev, [field]: isValid }));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setTouched(prev => ({ ...prev, file: true }));

      const { error, isValid } = validateField('file', file);
      if (error) {
        setErrors(prev => ({ ...prev, file: error }));
        setValidFields(prev => ({ ...prev, file: false }));
        triggerShake('file');
      } else {
        setErrors(prev => ({ ...prev, file: '' }));
        setValidFields(prev => ({ ...prev, file: isValid }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const newValidFields = {};

    ['datasetName', 'reportingYear', 'file']?.forEach(field => {
      const { error, isValid } = validateField(field, formData?.[field]);
      if (error) {
        newErrors[field] = error;
        newValidFields[field] = false;
      } else if (isValid) {
        newValidFields[field] = true;
      }
    });

    setErrors(newErrors);
    setValidFields(newValidFields);
    setTouched({ datasetName: true, reportingYear: true, file: true });

    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // Validate all fields
    const allTouched = { datasetName: true, reportingYear: true, file: true };
    setTouched(allTouched);

    const newErrors = {};
    const newValidFields = {};
    const fieldsToShake = [];

    ['datasetName', 'reportingYear', 'file']?.forEach(field => {
      const { error, isValid } = validateField(field, formData?.[field]);
      if (error) {
        newErrors[field] = error;
        newValidFields[field] = false;
        fieldsToShake?.push(field);
      } else if (isValid) {
        newValidFields[field] = true;
      }
    });

    setErrors(newErrors);
    setValidFields(newValidFields);

    if (Object.keys(newErrors)?.length > 0) {
      fieldsToShake?.forEach(field => triggerShake(field));
      toast?.error('Please fix all validation errors before uploading');
      return;
    }

    setUploading(true);
    try {
      await onUpload(formData);
      setShowSuccess(true);
      toast?.success('Dataset uploaded successfully');
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ datasetName: '', reportingYear: '', file: null });
        setErrors({});
        setTouched({});
        setValidFields({});
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      toast?.error(error?.message || 'Failed to upload dataset. Please try again.');
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFormData({ datasetName: '', reportingYear: '', file: null });
      setErrors({});
      setTouched({});
      setValidFields({});
      onClose();
    }
  };

  const getFieldBorderClass = (field) => {
    if (!touched?.[field]) return 'border-input';
    if (errors?.[field]) return 'border-red-500';
    if (validFields?.[field]) return 'border-green-500';
    return 'border-input';
  };

  const renderFieldIcon = (field) => {
    if (!touched?.[field]) return null;
    if (errors?.[field]) {
      return <Icon name="XCircle" size={18} className="text-red-500" />;
    }
    if (validFields?.[field]) {
      return <Icon name="CheckCircle" size={18} className="text-green-500" />;
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes?.[i];
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    const file = e?.dataTransfer?.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setTouched(prev => ({ ...prev, file: true }));
      
      const { error, isValid } = validateField('file', file);
      if (error) {
        setErrors(prev => ({ ...prev, file: error }));
        setValidFields(prev => ({ ...prev, file: false }));
        triggerShake('file');
      } else {
        setErrors(prev => ({ ...prev, file: '' }));
        setValidFields(prev => ({ ...prev, file: isValid }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-colors">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[60] bg-green-500 text-white px-6 py-4 rounded-lg shadow-elevation-xl flex items-center gap-3 animate-in slide-in-from-top-5">
          <Icon name="CheckCircle" size={24} />
          <div>
            <p className="font-semibold">Dataset Uploaded Successfully!</p>
            <p className="text-sm opacity-90">Your dataset is being processed and validated.</p>
          </div>
        </div>
      )}
      <div className="bg-card rounded-lg border border-border shadow-elevation-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Upload" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground transition-colors">
                Upload Dataset
              </h2>
              <p className="text-sm text-muted-foreground transition-colors">
                Upload FATCA dataset for validation and processing
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-muted rounded-lg transition-all disabled:opacity-50"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {showSuccess && (
            <div className="flex flex-col items-center justify-center py-8">
              <SuccessCheckmark size={80} />
              <p className="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">Dataset Uploaded Successfully!</p>
            </div>
          )}
          {!showSuccess && (
            <>
          {/* Dataset Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Dataset Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter dataset name"
                value={formData?.datasetName}
                onChange={(e) => handleInputChange('datasetName', e?.target?.value)}
                onBlur={() => handleBlur('datasetName')}
                disabled={uploading}
                className={`w-full px-3 py-2 pr-10 bg-background border ${getFieldBorderClass('datasetName')} rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {renderFieldIcon('datasetName')}
              </div>
            </div>
            {touched?.datasetName && errors?.datasetName && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.datasetName}
              </p>
            )}
            {touched?.datasetName && !errors?.datasetName && validFields?.datasetName && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />
                Dataset name is valid
              </p>
            )}
          </div>

          {/* Reporting Year */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Reporting Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Select
                label="Reporting Year"
                options={reportingYears}
                value={formData?.reportingYear}
                onChange={(value) => {
                  handleInputChange('reportingYear', value);
                  handleBlur('reportingYear');
                }}
                placeholder="Select reporting year"
                error={touched?.reportingYear ? errors?.reportingYear : ''}
                required
                disabled={uploading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {renderFieldIcon('reportingYear')}
              </div>
            </div>
            {touched?.reportingYear && !errors?.reportingYear && validFields?.reportingYear && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />
                Reporting year selected
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Dataset File <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => !uploading && fileInputRef?.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5' : getFieldBorderClass('file') === 'border-red-500'
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : getFieldBorderClass('file') === 'border-green-500'
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :'border-border bg-muted/30 hover:border-primary hover:bg-primary/5'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              {formData?.file ? (
                <div className="flex items-center justify-center gap-3">
                  <Icon name="FileText" size={32} className="text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground transition-colors">{formData?.file?.name}</p>
                    <p className="text-xs text-muted-foreground transition-colors">
                      {(formData?.file?.size / 1024 / 1024)?.toFixed(2)} MB
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleInputChange('file', null);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Icon name="X" size={16} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1 transition-colors">
                    {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground transition-colors">
                    CSV or Excel files (.csv, .xlsx, .xls) up to 50MB
                  </p>
                </div>
              )}
            </div>
            {touched?.file && errors?.file && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors?.file}
              </p>
            )}
            {touched?.file && !errors?.file && validFields?.file && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />
                File is valid and ready to upload
              </p>
            )}
          </div>

          {/* Upload Requirements Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Upload Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>File must contain required FATCA fields</li>
                  <li>Accepted formats: CSV, XLSX, XLS</li>
                  <li>Maximum file size: 50MB</li>
                  <li>Data will be validated automatically after upload</li>
                  <li>Processing may take several minutes for large datasets</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors?.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errors?.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border bg-muted/30 p-4 md:p-6 transition-colors">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              fullWidth
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={uploading}
              iconName="Upload"
              iconPosition="left"
              fullWidth
              className="sm:flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload Dataset'}
            </Button>
          </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadDatasetModal;