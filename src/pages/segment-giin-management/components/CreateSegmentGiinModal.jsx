import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CreateSegmentGiinModal = ({ isOpen, onClose, onCreateConfig }) => {
  const [formData, setFormData] = useState({
    segmentName: '',
    giin: '',
    entityName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Qatar',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const segmentOptions = [
    { value: 'Ahlibank', label: 'Ahlibank' },
    { value: 'AhliIslamic', label: 'AhliIslamic' }
  ];

  const countryOptions = [
    { value: 'Qatar', label: 'Qatar' },
    { value: 'UAE', label: 'United Arab Emirates' },
    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Bahrain', label: 'Bahrain' },
    { value: 'Oman', label: 'Oman' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.segmentName?.trim()) {
      newErrors.segmentName = 'Segment name is required';
    }

    if (!formData?.giin?.trim()) {
      newErrors.giin = 'GIIN is required';
    } else if (!/^[A-Z0-9]{6}\.[A-Z0-9]{5}\.[A-Z]{2}\.[0-9]{3}$/?.test(formData?.giin)) {
      newErrors.giin = 'GIIN format should be: XXXXXX.XXXXX.XX.XXX (e.g., ABC123.00000.LE.634)';
    }

    if (!formData?.entityName?.trim()) {
      newErrors.entityName = 'Entity name is required';
    }

    if (!formData?.addressLine1?.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData?.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData?.postalCode?.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData?.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData?.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData?.contactEmail?.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    await onCreateConfig(formData);
    
    setFormData({
      segmentName: '',
      giin: '',
      entityName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Qatar',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      isActive: true
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({
      segmentName: '',
      giin: '',
      entityName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Qatar',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      isActive: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Plus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Create Segment GIIN</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
                Configure GIIN and entity details for a business segment
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-muted rounded-md transition-all disabled:opacity-50"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Segment Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Building" size={18} />
              Segment Information
            </h3>
            
            <Select
              label="Segment Name"
              options={segmentOptions}
              value={formData?.segmentName}
              onChange={(value) => handleChange('segmentName', value)}
              error={errors?.segmentName}
              required
              disabled={isSubmitting}
            />

            <Input
              label="GIIN (Global Intermediary Identification Number)"
              type="text"
              placeholder="e.g., ABC123.00000.LE.634"
              value={formData?.giin}
              onChange={(e) => handleChange('giin', e?.target?.value?.toUpperCase())}
              error={errors?.giin}
              required
              disabled={isSubmitting}
            />

            <Input
              label="Legal Entity Name"
              type="text"
              placeholder="e.g., Ahlibank Qatar"
              value={formData?.entityName}
              onChange={(e) => handleChange('entityName', e?.target?.value)}
              error={errors?.entityName}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="MapPin" size={18} />
              Address Information
            </h3>
            
            <Input
              label="Address Line 1"
              type="text"
              placeholder="Street address, building number"
              value={formData?.addressLine1}
              onChange={(e) => handleChange('addressLine1', e?.target?.value)}
              error={errors?.addressLine1}
              required
              disabled={isSubmitting}
            />

            <Input
              label="Address Line 2"
              type="text"
              placeholder="Floor, suite, apartment (optional)"
              value={formData?.addressLine2}
              onChange={(e) => handleChange('addressLine2', e?.target?.value)}
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                type="text"
                placeholder="e.g., Doha"
                value={formData?.city}
                onChange={(e) => handleChange('city', e?.target?.value)}
                error={errors?.city}
                required
                disabled={isSubmitting}
              />

              <Input
                label="State/Province"
                type="text"
                placeholder="Optional"
                value={formData?.state}
                onChange={(e) => handleChange('state', e?.target?.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Postal Code"
                type="text"
                placeholder="e.g., 12345"
                value={formData?.postalCode}
                onChange={(e) => handleChange('postalCode', e?.target?.value)}
                error={errors?.postalCode}
                required
                disabled={isSubmitting}
              />

              <Select
                label="Country"
                options={countryOptions}
                value={formData?.country}
                onChange={(value) => handleChange('country', value)}
                error={errors?.country}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="User" size={18} />
              Contact Information
            </h3>
            
            <Input
              label="Contact Person"
              type="text"
              placeholder="Full name of contact person"
              value={formData?.contactPerson}
              onChange={(e) => handleChange('contactPerson', e?.target?.value)}
              error={errors?.contactPerson}
              required
              disabled={isSubmitting}
            />

            <Input
              label="Contact Email"
              type="email"
              placeholder="contact@example.com"
              value={formData?.contactEmail}
              onChange={(e) => handleChange('contactEmail', e?.target?.value)}
              error={errors?.contactEmail}
              required
              disabled={isSubmitting}
            />

            <Input
              label="Contact Phone"
              type="text"
              placeholder="+974-XXXX-XXXX (optional)"
              value={formData?.contactPhone}
              onChange={(e) => handleChange('contactPhone', e?.target?.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={formData?.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
              Active Configuration
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSegmentGiinModal;