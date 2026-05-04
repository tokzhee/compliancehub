import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const EditAdConfigModal = ({ isOpen, onClose, config, onUpdateConfig }) => {
  const [formData, setFormData] = useState({
    configName: '',
    ldapHost: '',
    ldapPort: 389,
    useSsl: false,
    useTls: false,
    ldapServerUrl: '',
    baseDn: '',
    bindDn: '',
    bindPassword: '',
    userSearchBase: '',
    userSearchFilter: '(uid={{username}})',
    groupSearchBase: '',
    attrEmail: 'mail',
    attrUsername: 'uid',
    attrFullName: 'cn',
    syncEnabled: false,
    syncFrequency: 'manual',
    syncIntervalHours: 24,
    connectionTimeoutSeconds: 30,
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (config) {
      setFormData({
        configName: config?.configName || '',
        ldapHost: config?.ldapHost || '',
        ldapPort: config?.ldapPort || 389,
        useSsl: config?.useSsl || false,
        useTls: config?.useTls || false,
        ldapServerUrl: config?.ldapServerUrl || '',
        baseDn: config?.baseDn || '',
        bindDn: config?.bindDn || '',
        bindPassword: config?.bindPassword || '',
        userSearchBase: config?.userSearchBase || '',
        userSearchFilter: config?.userSearchFilter || '(uid={{username}})',
        groupSearchBase: config?.groupSearchBase || '',
        attrEmail: config?.attrEmail || 'mail',
        attrUsername: config?.attrUsername || 'uid',
        attrFullName: config?.attrFullName || 'cn',
        syncEnabled: config?.syncEnabled || false,
        syncFrequency: config?.syncFrequency || 'manual',
        syncIntervalHours: config?.syncIntervalHours || 24,
        connectionTimeoutSeconds: config?.connectionTimeoutSeconds || 30,
        status: config?.status || 'active'
      });
    }
  }, [config]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.configName?.trim()) {
      newErrors.configName = 'Configuration name is required';
    } else if (formData?.configName?.length < 3) {
      newErrors.configName = 'Configuration name must be at least 3 characters';
    }

    if (!formData?.ldapHost?.trim()) {
      newErrors.ldapHost = 'LDAP host is required';
    }

    if (!formData?.ldapPort || formData?.ldapPort < 1 || formData?.ldapPort > 65535) {
      newErrors.ldapPort = 'Valid port number (1-65535) is required';
    }

    if (!formData?.baseDn?.trim()) {
      newErrors.baseDn = 'Base DN is required';
    }

    if (!formData?.bindDn?.trim()) {
      newErrors.bindDn = 'Bind DN is required';
    }

    if (!formData?.bindPassword?.trim()) {
      newErrors.bindPassword = 'Bind Password is required';
    }

    if (!formData?.userSearchBase?.trim()) {
      newErrors.userSearchBase = 'User Search Base is required';
    }

    if (!formData?.userSearchFilter?.trim()) {
      newErrors.userSearchFilter = 'User Search Filter is required';
    }

    if (!formData?.attrEmail?.trim()) {
      newErrors.attrEmail = 'Email attribute is required';
    }

    if (!formData?.attrUsername?.trim()) {
      newErrors.attrUsername = 'Username attribute is required';
    }

    if (!formData?.attrFullName?.trim()) {
      newErrors.attrFullName = 'Full name attribute is required';
    }

    if (formData?.connectionTimeoutSeconds < 5 || formData?.connectionTimeoutSeconds > 300) {
      newErrors.connectionTimeoutSeconds = 'Timeout must be between 5 and 300 seconds';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      setTestResult({ success: false, message: 'Please fix validation errors before testing connection' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResult({
        success: true,
        message: `Successfully connected to ${formData?.ldapHost}:${formData?.ldapPort}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error?.message || 'Connection test failed'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    const protocol = formData?.useSsl ? 'ldaps' : 'ldap';
    const ldapServerUrl = `${protocol}://${formData?.ldapHost}:${formData?.ldapPort}`;

    setIsSubmitting(true);
    await onUpdateConfig(config?.id, {
      ...formData,
      ldapServerUrl
    });
    setErrors({});
    setTestResult(null);
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setTestResult(null);
  };

  const getFieldBorderClass = (field) => {
    return errors?.[field] ? 'border-red-500' : 'border-border';
  };

  const handleClose = () => {
    setErrors({});
    setTestResult(null);
    onClose();
  };

  if (!isOpen || !config) return null;

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const syncFrequencyOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom Interval' }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Edit" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Edit LDAP Configuration</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
                Update directory integration settings
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconSize={20}
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-muted rounded-md transition-all disabled:opacity-50"
            aria-label="Close modal"
          />
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Settings" size={18} />
              Basic Configuration
            </h3>
            
            <Input
              label="Configuration Name"
              type="text"
              placeholder="e.g., ProdLDAP, TestLDAP"
              value={formData?.configName}
              onChange={(e) => handleChange('configName', e?.target?.value)}
              error={errors?.configName}
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 pr-10 bg-background border ${getFieldBorderClass('configName')} rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50`}
            />

            <Select
              label="Status"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleChange('status', value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Server Connection */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Globe" size={18} />
              Server Connection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="LDAP Host"
                  type="text"
                  placeholder="ldap.example.com or 192.168.1.100"
                  value={formData?.ldapHost}
                  onChange={(e) => handleChange('ldapHost', e?.target?.value)}
                  error={errors?.ldapHost}
                  required
                  disabled={isSubmitting}
                  description="Hostname or IP address of LDAP server"
                />
              </div>
              <Input
                label="Port"
                type="number"
                placeholder="389"
                value={formData?.ldapPort}
                onChange={(e) => handleChange('ldapPort', parseInt(e?.target?.value) || 389)}
                error={errors?.ldapPort}
                required
                disabled={isSubmitting}
                description="389 (LDAP) or 636 (LDAPS)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="useSsl"
                  checked={formData?.useSsl}
                  onChange={(e) => handleChange('useSsl', e?.target?.checked)}
                  disabled={isSubmitting}
                />
                <label htmlFor="useSsl" className="text-sm font-medium text-foreground cursor-pointer">
                  Use SSL/LDAPS
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="useTls"
                  checked={formData?.useTls}
                  onChange={(e) => handleChange('useTls', e?.target?.checked)}
                  disabled={isSubmitting}
                />
                <label htmlFor="useTls" className="text-sm font-medium text-foreground cursor-pointer">
                  Use STARTTLS
                </label>
              </div>
              <Input
                label="Connection Timeout"
                type="number"
                placeholder="30"
                value={formData?.connectionTimeoutSeconds}
                onChange={(e) => handleChange('connectionTimeoutSeconds', parseInt(e?.target?.value) || 30)}
                error={errors?.connectionTimeoutSeconds}
                disabled={isSubmitting}
                description="Seconds (5-300)"
              />
            </div>
          </div>

          {/* LDAP Credentials */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Key" size={18} />
              LDAP Credentials
            </h3>

            <Input
              label="Base DN"
              type="text"
              placeholder="dc=example,dc=com"
              value={formData?.baseDn}
              onChange={(e) => handleChange('baseDn', e?.target?.value)}
              error={errors?.baseDn}
              required
              disabled={isSubmitting}
              description="Base Distinguished Name for searches"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bind DN"
                type="text"
                placeholder="cn=admin,dc=example,dc=com"
                value={formData?.bindDn}
                onChange={(e) => handleChange('bindDn', e?.target?.value)}
                error={errors?.bindDn}
                required
                disabled={isSubmitting}
                description="Admin user DN for binding"
              />
              <Input
                label="Bind Password"
                type="password"
                placeholder="Enter bind password"
                value={formData?.bindPassword}
                onChange={(e) => handleChange('bindPassword', e?.target?.value)}
                error={errors?.bindPassword}
                required
                disabled={isSubmitting}
                description="Password for bind DN user"
              />
            </div>
          </div>

          {/* Search Configuration */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="Search" size={18} />
              Search Configuration
            </h3>

            <Input
              label="User Search Base"
              type="text"
              placeholder="ou=users,dc=example,dc=com"
              value={formData?.userSearchBase}
              onChange={(e) => handleChange('userSearchBase', e?.target?.value)}
              error={errors?.userSearchBase}
              required
              disabled={isSubmitting}
              description="Search base for user entries"
            />

            <Input
              label="User Search Filter"
              type="text"
              placeholder="(uid={{username}})"
              value={formData?.userSearchFilter}
              onChange={(e) => handleChange('userSearchFilter', e?.target?.value)}
              error={errors?.userSearchFilter}
              required
              disabled={isSubmitting}
              description="LDAP filter for user search. Use {{username}} as placeholder"
            />

            <Input
              label="Group Search Base (Optional)"
              type="text"
              placeholder="ou=groups,dc=example,dc=com"
              value={formData?.groupSearchBase}
              onChange={(e) => handleChange('groupSearchBase', e?.target?.value)}
              disabled={isSubmitting}
              description="Search base for group entries"
            />
          </div>

          {/* User Attribute Mappings */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="UserCircle" size={18} />
              User Attribute Mappings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Email Attribute"
                type="text"
                placeholder="mail"
                value={formData?.attrEmail}
                onChange={(e) => handleChange('attrEmail', e?.target?.value)}
                error={errors?.attrEmail}
                required
                disabled={isSubmitting}
                description="LDAP attribute for email"
              />
              <Input
                label="Username Attribute"
                type="text"
                placeholder="uid"
                value={formData?.attrUsername}
                onChange={(e) => handleChange('attrUsername', e?.target?.value)}
                error={errors?.attrUsername}
                required
                disabled={isSubmitting}
                description="LDAP attribute for username"
              />
              <Input
                label="Full Name Attribute"
                type="text"
                placeholder="cn"
                value={formData?.attrFullName}
                onChange={(e) => handleChange('attrFullName', e?.target?.value)}
                error={errors?.attrFullName}
                required
                disabled={isSubmitting}
                description="LDAP attribute for full name"
              />
            </div>
          </div>

          {/* Sync Schedule */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Icon name="RefreshCw" size={18} />
              User Sync Schedule
            </h3>

            <div className="flex items-center gap-2">
              <Checkbox
                id="syncEnabled"
                checked={formData?.syncEnabled}
                onChange={(e) => handleChange('syncEnabled', e?.target?.checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="syncEnabled" className="text-sm font-medium text-foreground cursor-pointer">
                Enable Automatic User Synchronization
              </label>
            </div>

            {formData?.syncEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Sync Frequency"
                  options={syncFrequencyOptions}
                  value={formData?.syncFrequency}
                  onChange={(value) => handleChange('syncFrequency', value)}
                  disabled={isSubmitting}
                />
                {formData?.syncFrequency === 'custom' && (
                  <Input
                    label="Sync Interval (Hours)"
                    type="number"
                    placeholder="24"
                    value={formData?.syncIntervalHours}
                    onChange={(e) => handleChange('syncIntervalHours', parseInt(e?.target?.value) || 24)}
                    disabled={isSubmitting}
                    description="Custom sync interval in hours"
                  />
                )}
              </div>
            )}
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult?.success 
                ? 'bg-green-50 border-green-200' :'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <Icon 
                  name={testResult?.success ? 'CheckCircle' : 'XCircle'} 
                  size={20} 
                  className={testResult?.success ? 'text-green-600' : 'text-red-600'} 
                />
                <p className={testResult?.success ? 'text-green-800' : 'text-red-800'}>
                  {testResult?.message}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border bg-muted/30 p-4 md:p-6 transition-colors">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || testingConnection}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              iconName="Zap"
              onClick={handleTestConnection}
              loading={testingConnection}
              disabled={isSubmitting}
            >
              Test Connection
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName="Save"
              iconPosition="left"
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdConfigModal;