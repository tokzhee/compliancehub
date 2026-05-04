import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerPreviewModal = ({ isOpen, onClose, customer }) => {
  const [activeTab, setActiveTab] = useState('account');

  if (!isOpen || !customer) return null;

  const isIndividual = customer?.customer_type === 'INDIVIDUAL';
  const isEntity = customer?.customer_type === 'ENTITY';

  const tabs = [
    { id: 'account', label: 'Account Information', icon: 'CreditCard', show: true },
    { id: 'personal', label: 'Personal Details', icon: 'User', show: isIndividual },
    { id: 'entity', label: 'Entity Details', icon: 'Building2', show: isEntity },
    { id: 'directors', label: 'Directors & Shareholders', icon: 'Users', show: isEntity },
    { id: 'contact', label: 'Contact Information', icon: 'Mail', show: true },
    { id: 'regulatory', label: 'Regulatory Metadata', icon: 'FileText', show: true }
  ]?.filter(tab => tab?.show);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: customer?.currency_code || 'USD'
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderField = (label, value, icon = null) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={14} className="text-muted-foreground" />}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-foreground">
        {value || 'N/A'}
      </p>
    </div>
  );

  const renderStatusBadge = (status, type = 'default') => {
    const colors = {
      success: 'bg-success/10 text-success border-success/20',
      error: 'bg-error/10 text-error border-error/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      default: 'bg-primary/10 text-primary border-primary/20'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors?.[type]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {status}
      </span>
    );
  };

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Account Balance
            </p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(customer?.net_account_balance)}
            </p>
          </div>
          {customer?.exceed_threshold && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg">
              <Icon name="TrendingUp" size={16} className="text-warning" />
              <span className="text-xs font-medium text-warning">Above Threshold</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {renderStatusBadge(customer?.status, customer?.status === 'Active' ? 'success' : 'default')}
          {renderStatusBadge(customer?.regime_applicability, customer?.regime_applicability === 'BOTH' ? 'warning' : 'default')}
          {customer?.recalcitrant_customer && renderStatusBadge('Recalcitrant', 'error')}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="CreditCard" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Account Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderField('Account Number', customer?.account_number, 'Hash')}
          {renderField('Product', customer?.product, 'Package')}
          {renderField('Product Code', customer?.product_code, 'Code')}
          {renderField('Branch', customer?.branch, 'MapPin')}
          {renderField('Currency', customer?.currency_code, 'DollarSign')}
          {renderField('Reporting Year', customer?.reporting_year, 'Calendar')}
        </div>
      </div>

      {customer?.product_codes_monitoring && (
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Eye" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Monitoring</h3>
          </div>
          {renderField('Product Codes Monitoring', customer?.product_codes_monitoring)}
        </div>
      )}
    </div>
  );

  const renderPersonalTab = () => (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="User" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderField('Prefix', customer?.prefix, 'UserCircle')}
          {renderField('First Name', customer?.first_name, 'User')}
          {renderField('Middle Name', customer?.middle_name, 'User')}
          {renderField('Last Name', customer?.last_name, 'User')}
          {renderField('Gender', customer?.sex, 'Users')}
          {renderField('Date of Birth', formatDate(customer?.date_of_birth), 'Calendar')}
          {renderField('Nationality', customer?.nationality, 'Flag')}
          {renderField('Marital Status', customer?.marital_status, 'Heart')}
          {renderField('Profession', customer?.profession, 'Briefcase')}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="FileText" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Identification</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderField('Identification Type', customer?.identification_type, 'CreditCard')}
          {renderField('Identification Number', customer?.identification_number, 'Hash')}
          {renderField('Tax Identification No', customer?.tax_identification_no, 'FileText')}
          {renderField('Social Security Number', customer?.social_security_number, 'Shield')}
          {renderField('Dual Citizenship', customer?.dual_citizenship ? 'Yes' : 'No', 'Flag')}
        </div>
      </div>

      {customer?.religion && (
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Info" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
          </div>
          {renderField('Religion', customer?.religion)}
        </div>
      )}
    </div>
  );

  const renderEntityTab = () => (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Building2" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Entity Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderField('Entity Name', customer?.entity_name, 'Building2')}
          {renderField('Registration Number', customer?.registration_number, 'Hash')}
          {renderField('Country of Incorporation', customer?.country_of_incorporation, 'Flag')}
          {renderField('Entity Classification', customer?.entity_classification, 'Tag')}
          {renderField('GIIN', customer?.giin, 'Key')}
          {renderField('Tax Identification No', customer?.tax_identification_no_entity, 'FileText')}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Beneficial Ownership</h3>
        </div>
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            customer?.beneficial_owner_flag ? 'bg-success/10' : 'bg-muted'
          }`}>
            <Icon 
              name={customer?.beneficial_owner_flag ? 'CheckCircle' : 'XCircle'} 
              size={24} 
              className={customer?.beneficial_owner_flag ? 'text-success' : 'text-muted-foreground'} 
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {customer?.beneficial_owner_flag ? 'Beneficial Owner Identified' : 'No Beneficial Owner'}
            </p>
            <p className="text-xs text-muted-foreground">
              {customer?.beneficial_owner_flag 
                ? 'This entity has identified beneficial owners on record'
                : 'No beneficial ownership information available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDirectorsTab = () => {
    const directors = [];
    for (let i = 1; i <= 5; i++) {
      const name = customer?.[`director_name${i}`];
      if (name) {
        directors?.push({
          name,
          nationality: customer?.[`nationality_director${i}`],
          share: customer?.[`share_director${i}`]
        });
      }
    }

    return (
      <div className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Users" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Directors & Shareholders</h3>
          </div>
          {directors?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No directors or shareholders information available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {directors?.map((director, index) => (
                <div key={index} className="bg-card rounded-lg border border-border p-4 hover:shadow-elevation-md transition-base">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-foreground mb-1">
                          {director?.name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {director?.nationality && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                              <Icon name="Flag" size={12} />
                              {director?.nationality}
                            </span>
                          )}
                          {director?.share && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                              <Icon name="PieChart" size={12} />
                              {director?.share}% Share
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContactTab = () => (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="MapPin" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Address</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Address Line 1', customer?.address_line_1, 'Home')}
          {renderField('Address Line 2', customer?.address_line_2, 'Home')}
          {renderField('Address Line 3', customer?.address_line_3, 'Home')}
          {renderField('City', customer?.city, 'MapPin')}
          {renderField('State/Province', customer?.state, 'Map')}
          {renderField('Country', customer?.country_of_residence, 'Flag')}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Phone" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Contact Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Main Phone', customer?.main_phone_number, 'Phone')}
          {renderField('Second Phone', customer?.second_phone_number, 'Phone')}
          {renderField('Email', customer?.email, 'Mail')}
        </div>
      </div>
    </div>
  );

  const renderRegulatoryTab = () => (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="FileText" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">FATCA/CRS Classification</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderField('W9 Form Status', customer?.w9_form_status || 'Not Submitted', 'FileCheck')}
          {renderField('W8 Form Type', customer?.w8_form_type || 'Not Applicable', 'FileText')}
          {renderField('US Person Indicator', customer?.us_person_indicator ? 'Yes' : 'No', 'Flag')}
          {renderField('GIIN', customer?.giin || 'N/A', 'Key')}
          {renderField('Chapter 3 Status', customer?.chapter_3_status || 'N/A', 'BookOpen')}
          {renderField('Chapter 4 Status', customer?.chapter_4_status || 'N/A', 'BookOpen')}
          {renderField('Documentation Status', customer?.documentation_status || 'Pending', 'FileCheck')}
          {renderField('Certification Date', customer?.certification_date ? formatDate(customer?.certification_date) : 'N/A', 'Calendar')}
          {renderField('Self-Certification', customer?.self_certification_flag ? 'Yes' : 'No', 'CheckCircle')}
        </div>
        
        {customer?.recalcitrant_customer && (
          <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={24} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-error mb-1">Recalcitrant Customer</p>
                <p className="text-xs text-error/80">
                  This customer has been classified as recalcitrant due to failure to provide required documentation or information for FATCA/CRS compliance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Clock" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Timestamps</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Created On', formatDate(customer?.created_on), 'Calendar')}
          {renderField('Modified On', formatDate(customer?.modified_on), 'Calendar')}
          {renderField('Timestamp', customer?.timestamp ? formatDate(customer?.timestamp) : 'N/A', 'Clock')}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">System Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Customer ID', customer?.customer_id, 'Hash')}
          {renderField('Customer Type', customer?.customer_type, 'Tag')}
          {renderField('Segment ID', customer?.segment_id, 'Layers')}
          {renderField('Organization ID', customer?.organization_id, 'Building2')}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'personal':
        return renderPersonalTab();
      case 'entity':
        return renderEntityTab();
      case 'directors':
        return renderDirectorsTab();
      case 'contact':
        return renderContactTab();
      case 'regulatory':
        return renderRegulatoryTab();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg border border-border shadow-elevation-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isIndividual ? 'bg-primary/10' : 'bg-accent/10'
            }`}>
              <Icon 
                name={isIndividual ? 'User' : 'Building2'} 
                size={24} 
                className={isIndividual ? 'text-primary' : 'text-accent'} 
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {isIndividual 
                  ? `${customer?.first_name || ''} ${customer?.last_name || ''}`?.trim()
                  : customer?.entity_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {customer?.account_number} • {customer?.customer_type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-base"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex-shrink-0 overflow-x-auto">
          <div className="flex px-4 md:px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-base whitespace-nowrap ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary font-medium' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span className="text-sm">{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 md:p-6 border-t border-border flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
          >
            Export Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPreviewModal;