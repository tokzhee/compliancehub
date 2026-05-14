import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerPreviewModal = ({ isOpen, onClose, customer }) => {
  const [activeTab, setActiveTab] = useState('account');

  if (!isOpen || !customer) return null;

  // Support both nested DTO and flat column shapes
  const customerType = customer?.customerType || customer?.customer_type;
  const accountNumber = customer?.accountNumber || customer?.account_number;
  const accountBalance = customer?.accountBalance ?? customer?.net_account_balance ?? 0;
  const currencyCode = customer?.currencyCode || customer?.currency_code || 'USD';
  const status = customer?.status;
  const regimeApplicability = customer?.regimeApplicability || customer?.regime_applicability;

  // Nested DTO sections
  const personal = customer?.personalDetails || {};
  const entity = customer?.entityDetails || {};
  const contact = customer?.contactDetails || {};
  const regulatory = customer?.regulatoryDetails || {};
  const directors = Array.isArray(customer?.directors) ? customer?.directors : [];

  const isIndividual = customerType === 'INDIVIDUAL';
  const isEntity = customerType === 'ENTITY';

  const tabs = [
    { id: 'account', label: 'Account Information', icon: 'CreditCard', show: true },
    { id: 'personal', label: 'Personal Details', icon: 'User', show: isIndividual },
    { id: 'entity', label: 'Entity Details', icon: 'Building2', show: isEntity },
    { id: 'directors', label: 'Directors & Shareholders', icon: 'Users', show: isEntity },
    { id: 'contact', label: 'Contact Information', icon: 'Mail', show: true },
    { id: 'regulatory', label: 'Regulatory Metadata', icon: 'FileText', show: true },
  ]?.filter(tab => tab?.show);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })?.format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const renderField = (label, value, icon = null) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={14} className="text-muted-foreground" />}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-medium text-foreground">{value ?? 'N/A'}</p>
    </div>
  );

  const renderStatusBadge = (statusVal, type = 'default') => {
    const colors = {
      success: 'bg-success/10 text-success border-success/20',
      error: 'bg-error/10 text-error border-error/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      default: 'bg-primary/10 text-primary border-primary/20',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors?.[type]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {statusVal}
      </span>
    );
  };

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Account Balance</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(accountBalance)}</p>
          </div>
          {(customer?.exceedThreshold || customer?.exceed_threshold) && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg">
              <Icon name="TrendingUp" size={16} className="text-warning" />
              <span className="text-xs font-medium text-warning">Above Threshold</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {status && renderStatusBadge(status, status === 'Active' ? 'success' : 'default')}
          {regimeApplicability && renderStatusBadge(regimeApplicability, regimeApplicability === 'BOTH' ? 'warning' : 'default')}
          {(regulatory?.recalcitrantCustomer || customer?.recalcitrant_customer) && renderStatusBadge('Recalcitrant', 'error')}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="CreditCard" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Account Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderField('Account Number', accountNumber, 'Hash')}
          {renderField('Currency', currencyCode, 'DollarSign')}
          {renderField('Customer Type', customerType, 'Tag')}
          {renderField('Regime', regimeApplicability, 'Shield')}
          {renderField('Reporting Year', customer?.reportingYear || customer?.reporting_year, 'Calendar')}
          {renderField('Status', status, 'CheckCircle')}
        </div>
      </div>
    </div>
  );

  const renderPersonalTab = () => {
    // Support nested DTO or flat columns
    const firstName = personal?.firstName || customer?.first_name;
    const lastName = personal?.lastName || customer?.last_name;
    const middleName = personal?.middleName || customer?.middle_name;
    const dob = personal?.dateOfBirth || customer?.date_of_birth;
    const nationality = personal?.nationality || customer?.nationality;
    const gender = personal?.gender || customer?.sex;
    const maritalStatus = personal?.maritalStatus || customer?.marital_status;
    const profession = personal?.profession || customer?.profession;
    const idType = personal?.identificationType || customer?.identification_type;
    const idNumber = personal?.identificationNumber || customer?.identification_number;
    const taxId = personal?.taxIdentificationNo || customer?.tax_identification_no;
    const ssn = personal?.socialSecurityNumber || customer?.social_security_number;
    const dualCitizenship = personal?.dualCitizenship ?? customer?.dual_citizenship;

    return (
      <div className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="User" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderField('First Name', firstName, 'User')}
            {renderField('Middle Name', middleName, 'User')}
            {renderField('Last Name', lastName, 'User')}
            {renderField('Gender', gender, 'Users')}
            {renderField('Date of Birth', formatDate(dob), 'Calendar')}
            {renderField('Nationality', nationality, 'Flag')}
            {renderField('Marital Status', maritalStatus, 'Heart')}
            {renderField('Profession', profession, 'Briefcase')}
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="FileText" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Identification</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderField('Identification Type', idType, 'CreditCard')}
            {renderField('Identification Number', idNumber, 'Hash')}
            {renderField('Tax Identification No', taxId, 'FileText')}
            {renderField('Social Security Number', ssn, 'Shield')}
            {renderField('Dual Citizenship', dualCitizenship != null ? (dualCitizenship ? 'Yes' : 'No') : null, 'Flag')}
          </div>
        </div>
      </div>
    );
  };

  const renderEntityTab = () => {
    const entityName = entity?.entityName || customer?.entity_name;
    const regNumber = entity?.registrationNumber || customer?.registration_number;
    const countryOfIncorp = entity?.countryOfIncorporation || customer?.country_of_incorporation;
    const entityClass = entity?.entityClassification || customer?.entity_classification;
    const giinVal = entity?.giin || customer?.giin;
    const taxIdEntity = entity?.taxIdentificationNo || customer?.tax_identification_no_entity;
    const beneficialOwner = entity?.beneficialOwnerFlag ?? customer?.beneficial_owner_flag;

    return (
      <div className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Building2" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Entity Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderField('Entity Name', entityName, 'Building2')}
            {renderField('Registration Number', regNumber, 'Hash')}
            {renderField('Country of Incorporation', countryOfIncorp, 'Flag')}
            {renderField('Entity Classification', entityClass, 'Tag')}
            {renderField('GIIN', giinVal, 'Key')}
            {renderField('Tax Identification No', taxIdEntity, 'FileText')}
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Shield" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Beneficial Ownership</h3>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${beneficialOwner ? 'bg-success/10' : 'bg-muted'}`}>
              <Icon name={beneficialOwner ? 'CheckCircle' : 'XCircle'} size={24}
                className={beneficialOwner ? 'text-success' : 'text-muted-foreground'} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {beneficialOwner ? 'Beneficial Owner Identified' : 'No Beneficial Owner'}
              </p>
              <p className="text-xs text-muted-foreground">
                {beneficialOwner
                  ? 'This entity has identified beneficial owners on record'
                  : 'No beneficial ownership information available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDirectorsTab = () => {
    // Support both nested DTO directors array and legacy flat columns
    let directorList = directors;
    if (directorList?.length === 0) {
      // Fallback: try flat columns director_name1..5
      for (let i = 1; i <= 5; i++) {
        const name = customer?.[`director_name${i}`];
        if (name) {
          directorList?.push({
            name,
            nationality: customer?.[`nationality_director${i}`],
            sharePercentage: customer?.[`share_director${i}`],
          });
        }
      }
    }

    return (
      <div className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Users" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Directors & Shareholders</h3>
          </div>
          {directorList?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No directors or shareholders information available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {directorList?.map((director, index) => (
                <div key={index} className="bg-card rounded-lg border border-border p-4 hover:shadow-elevation-md transition-base">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-foreground mb-1">
                        {director?.name || director?.directorName || 'N/A'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(director?.nationality || director?.nationalityDirector) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                            <Icon name="Flag" size={12} />
                            {director?.nationality || director?.nationalityDirector}
                          </span>
                        )}
                        {(director?.sharePercentage || director?.share) != null && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                            <Icon name="PieChart" size={12} />
                            {director?.sharePercentage || director?.share}% Share
                          </span>
                        )}
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

  const renderContactTab = () => {
    const addr1 = contact?.addressLine1 || customer?.address_line_1;
    const addr2 = contact?.addressLine2 || customer?.address_line_2;
    const addr3 = contact?.addressLine3 || customer?.address_line_3;
    const city = contact?.city || customer?.city;
    const state = contact?.state || customer?.state;
    const country = contact?.countryOfResidence || customer?.country_of_residence;
    const phone1 = contact?.mainPhoneNumber || customer?.main_phone_number;
    const phone2 = contact?.secondPhoneNumber || customer?.second_phone_number;
    const email = contact?.email || customer?.email;

    return (
      <div className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="MapPin" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Address</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('Address Line 1', addr1, 'Home')}
            {renderField('Address Line 2', addr2, 'Home')}
            {renderField('Address Line 3', addr3, 'Home')}
            {renderField('City', city, 'MapPin')}
            {renderField('State/Province', state, 'Map')}
            {renderField('Country', country, 'Flag')}
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Phone" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Contact Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('Main Phone', phone1, 'Phone')}
            {renderField('Second Phone', phone2, 'Phone')}
            {renderField('Email', email, 'Mail')}
          </div>
        </div>
      </div>
    );
  };

  const renderRegulatoryTab = () => {
    const w9Status = regulatory?.w9FormStatus || customer?.w9_form_status;
    const w8FormType = regulatory?.w8FormType || customer?.w8_form_type;
    const usPerson = regulatory?.usPersonIndicator ?? customer?.us_person_indicator;
    const giinVal = entity?.giin || customer?.giin;
    const chapter3 = regulatory?.chapter3Status || customer?.chapter_3_status;
    const chapter4 = regulatory?.chapter4Status || customer?.chapter_4_status;
    const docStatus = regulatory?.documentationStatus || customer?.documentation_status;
    const certDate = regulatory?.certificationDate || customer?.certification_date;
    const selfCert = regulatory?.selfCertificationFlag ?? customer?.self_certification_flag;
    const recalcitrant = regulatory?.recalcitrantCustomer ?? customer?.recalcitrant_customer;
    const createdOn = customer?.createdOn || customer?.created_on;
    const modifiedOn = customer?.modifiedOn || customer?.modified_on;

    return (
      <div className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="FileText" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">FATCA/CRS Classification</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderField('W9 Form Status', w9Status || 'Not Submitted', 'FileCheck')}
            {renderField('W8 Form Type', w8FormType || 'Not Applicable', 'FileText')}
            {renderField('US Person Indicator', usPerson != null ? (usPerson ? 'Yes' : 'No') : null, 'Flag')}
            {renderField('GIIN', giinVal || 'N/A', 'Key')}
            {renderField('Chapter 3 Status', chapter3 || 'N/A', 'BookOpen')}
            {renderField('Chapter 4 Status', chapter4 || 'N/A', 'BookOpen')}
            {renderField('Documentation Status', docStatus || 'Pending', 'FileCheck')}
            {renderField('Certification Date', certDate ? formatDate(certDate) : 'N/A', 'Calendar')}
            {renderField('Self-Certification', selfCert != null ? (selfCert ? 'Yes' : 'No') : null, 'CheckCircle')}
          </div>
          {recalcitrant && (
            <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={24} className="text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-error mb-1">Recalcitrant Customer</p>
                  <p className="text-xs text-error/80">
                    This customer has been classified as recalcitrant due to failure to provide required
                    documentation or information for FATCA/CRS compliance.
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
            {renderField('Created On', formatDate(createdOn), 'Calendar')}
            {renderField('Modified On', formatDate(modifiedOn), 'Calendar')}
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Shield" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">System Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('Customer ID', customer?.customerId || customer?.customer_id, 'Hash')}
            {renderField('Customer Type', customerType, 'Tag')}
            {renderField('Organization ID', customer?.organizationId || customer?.organization_id, 'Building2')}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account': return renderAccountTab();
      case 'personal': return renderPersonalTab();
      case 'entity': return renderEntityTab();
      case 'directors': return renderDirectorsTab();
      case 'contact': return renderContactTab();
      case 'regulatory': return renderRegulatoryTab();
      default: return null;
    }
  };

  const displayName = isIndividual
    ? `${personal?.firstName || customer?.first_name || ''} ${personal?.lastName || customer?.last_name || ''}`?.trim()
    : (entity?.entityName || customer?.entity_name || 'N/A');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg border border-border shadow-elevation-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isIndividual ? 'bg-primary/10' : 'bg-accent/10'}`}>
              <Icon name={isIndividual ? 'User' : 'Building2'} size={24}
                className={isIndividual ? 'text-primary' : 'text-accent'} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{displayName || 'Customer Details'}</h2>
              <p className="text-sm text-muted-foreground">
                {accountNumber} • {customerType}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-base">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{renderTabContent()}</div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 md:p-6 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="default" iconName="Download" iconPosition="left">Export Details</Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPreviewModal;