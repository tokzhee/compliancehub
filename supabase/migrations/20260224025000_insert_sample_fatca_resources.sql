-- Insert comprehensive sample FATCA resources for rendition process
-- This migration creates 8 detailed resources covering the complete FATCA workflow

DO $$
DECLARE
  ahlibank_org_id UUID;
BEGIN
  -- Get Ahli Bank organization ID
  SELECT id INTO ahlibank_org_id FROM public.organizations WHERE name = 'Ahli Bank' LIMIT 1;
  
  IF ahlibank_org_id IS NULL THEN
    RAISE NOTICE 'Organization not found. Please ensure organizations table has data.';
    RETURN;
  END IF;

  -- Resource 1: FATCA Rendition Overview
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-overview',
    'FATCA Rendition Overview',
    'BookOpen',
    'markdown',
    E'# FATCA Rendition Overview

## Introduction to FATCA

The **Foreign Account Tax Compliance Act (FATCA)** is a United States federal law enacted in 2010 to combat tax evasion by U.S. persons holding financial accounts outside the United States. FATCA requires Foreign Financial Institutions (FFIs) to report information about financial accounts held by U.S. taxpayers or foreign entities with substantial U.S. ownership.

## Key Objectives

- **Prevent Tax Evasion**: Identify U.S. taxpayers holding assets in foreign accounts
- **Increase Transparency**: Require FFIs to report account information to the IRS
- **Enforce Compliance**: Impose withholding penalties on non-compliant institutions
- **Global Cooperation**: Establish information exchange agreements between countries

## Who Must Comply?

### Financial Institutions
- Banks and credit unions
- Investment funds and asset managers
- Insurance companies offering cash value products
- Broker-dealers and custodians

### Reportable Accounts
- Accounts held by U.S. persons (citizens, residents, green card holders)
- Accounts held by entities with substantial U.S. ownership (>10%)
- Accounts exceeding threshold amounts ($50,000 for individuals)

## FATCA Rendition Timeline

| Phase | Timeline | Key Activities |
|-------|----------|----------------|
| **Data Collection** | January - February | Gather customer data, account balances, income payments |
| **Classification** | February - March | Apply due diligence, classify accounts, validate documentation |
| **Enrichment** | March | Complete missing data, resolve quality issues |
| **Rule Application** | March | Execute compliance rules, review flagged cases |
| **Report Generation** | March | Generate IRS Form 8966 XML files |
| **Submission** | By March 31 | Submit reports via IRS IDES portal |

## Reporting Requirements

### Information to Report
1. **Account Holder Information**
   - Name and address
   - U.S. Tax Identification Number (TIN)
   - Account number
   - Account balance or value (as of December 31)

2. **Financial Information**
   - Total gross amounts paid or credited
   - Interest payments
   - Dividend payments
   - Other income amounts

3. **Entity Classification**
   - U.S. person status
   - Entity type (individual, corporation, trust, etc.)
   - Substantial U.S. owner information (for entities)

## Penalties for Non-Compliance

- **30% Withholding**: On U.S. source payments to non-compliant FFIs
- **Account Closure**: Requirement to close recalcitrant accounts
- **Regulatory Sanctions**: Potential loss of banking licenses
- **Reputational Risk**: Damage to institutional credibility

## ComplianceHub FATCA Solution

Our platform streamlines the entire FATCA rendition process:

✓ **Automated Data Collection**: Import customer data from core banking systems
✓ **Intelligent Classification**: Apply rules-based account classification
✓ **Data Enrichment Portal**: Complete missing information efficiently
✓ **Case Review Workflow**: Review and approve flagged accounts
✓ **IRS-Compliant Reporting**: Generate Form 8966 XML files
✓ **Audit Trail**: Maintain complete documentation for regulatory review

## Next Steps

Proceed to the following resources for detailed guidance:
1. Step-by-Step FATCA Data Collection Process
2. FATCA Customer Classification Guide
3. FATCA Data Upload and Validation Process
4. FATCA Rule Configuration and Testing
5. FATCA Case Review and Enrichment Process
6. FATCA Report Generation and Submission Guide
7. FATCA Compliance Checklist',
    'FATCA',
    ARRAY['Rendition', 'Overview', 'Introduction', 'Timeline', 'Requirements'],
    1,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  -- Resource 2: Step-by-Step FATCA Data Collection Process
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-data-collection',
    'Step-by-Step FATCA Data Collection Process',
    'Database',
    'markdown',
    E'# Step-by-Step FATCA Data Collection Process

## Overview

Data collection is the foundation of FATCA compliance. This process involves gathering comprehensive customer information, account balances, and transaction data required for accurate reporting.

## Step 1: Prepare Data Sources

### Identify Required Systems
- Core banking system (CBS)
- Customer Relationship Management (CRM)
- Know Your Customer (KYC) database
- Transaction processing systems
- Document management systems

### Data Elements Checklist

**Customer Identification:**
- [ ] Full legal name (as per official documents)
- [ ] Date of birth
- [ ] Country of citizenship
- [ ] Country of residence
- [ ] Residential address
- [ ] Mailing address (if different)
- [ ] U.S. Tax Identification Number (SSN, ITIN, or EIN)
- [ ] Foreign Tax Identification Number

**Account Information:**
- [ ] Account number
- [ ] Account type (savings, checking, investment, etc.)
- [ ] Account opening date
- [ ] Account balance as of December 31
- [ ] Account status (active, dormant, closed)
- [ ] Joint account holder information (if applicable)

**Financial Data:**
- [ ] Interest paid or credited
- [ ] Dividend payments
- [ ] Gross proceeds from sales or redemptions
- [ ] Other income amounts
- [ ] Total gross amounts paid or credited

**U.S. Indicia:**
- [ ] U.S. place of birth
- [ ] U.S. address or P.O. box
- [ ] U.S. telephone number
- [ ] Standing instructions to transfer funds to U.S. account
- [ ] Power of attorney granted to person with U.S. address
- [ ] "In care of" or "hold mail" address (sole address)

## Step 2: Extract Data from Core Systems

### Database Query Guidelines

```sql
-- Example query structure (adapt to your CBS)
SELECT 
  customer_id,
  account_number,
  full_name,
  date_of_birth,
  citizenship,
  residence_country,
  address,
  tax_id_number,
  account_balance_dec31,
  interest_paid_ytd,
  dividend_paid_ytd,
  account_status
FROM customer_accounts
WHERE account_status IN (\'ACTIVE\', \'DORMANT\')
  AND account_balance_dec31 >= 50000
  AND reporting_year = 2025;
```

### Data Extraction Best Practices

1. **Use Reporting Date Snapshots**: Extract account balances as of December 31
2. **Include Closed Accounts**: Report accounts closed during the year if they met thresholds
3. **Aggregate Related Accounts**: Apply aggregation rules for related accounts
4. **Validate Data Types**: Ensure numeric fields are properly formatted
5. **Handle Null Values**: Document missing or unavailable data

## Step 3: Prepare Data File for Upload

### Supported File Formats
- **CSV** (Comma-Separated Values) - Recommended
- **Excel** (.xlsx) - Supported

### Required Column Headers

```csv
account_number,customer_name,date_of_birth,citizenship,residence_country,address,us_tin,foreign_tin,account_balance,interest_paid,dividend_paid,us_indicia,entity_type,substantial_us_owner
```

### Data Formatting Rules

| Field | Format | Example |
|-------|--------|----------|
| Date of Birth | YYYY-MM-DD | 1985-06-15 |
| Account Balance | Numeric (no commas) | 125000.50 |
| TIN | No dashes or spaces | 123456789 |
| Country Codes | ISO 3166-1 alpha-2 | US, QA, AE |
| Boolean Fields | true/false or 1/0 | true |

### Sample Data Row

```csv
"ACC-2025-001","John Michael Smith","1985-06-15","US","QA","123 Main St, Doha, Qatar","123456789","QA987654321","250000.00","5000.00","0.00","true","Individual",""
```

## Step 4: Upload Data to ComplianceHub

### Upload Process

1. **Navigate to Dataset Management**
   - Click "Dataset Management" in the sidebar
   - Click "Upload Dataset" button

2. **Select File and Configure**
   - Choose your prepared CSV/Excel file
   - Select regime: **FATCA**
   - Enter dataset name: e.g., "FATCA 2025 Customer Data"
   - Add description (optional)

3. **Review Validation Results**
   - System automatically validates data format
   - Review error report if validation fails
   - Check warnings for data quality issues

4. **Confirm Upload**
   - Review summary statistics
   - Confirm upload to process data
   - Monitor processing status

## Step 5: Validate Uploaded Data

### Automatic Validations

The system performs the following checks:

✓ **Format Validation**: Ensures correct data types and formats
✓ **Mandatory Fields**: Verifies required fields are present
✓ **TIN Validation**: Checks TIN format and checksum (where applicable)
✓ **Country Code Validation**: Verifies ISO country codes
✓ **Duplicate Detection**: Identifies duplicate account numbers
✓ **Threshold Checks**: Flags accounts below reporting thresholds

### Manual Review

1. **Preview Customer Records**
   - Click "Preview" on uploaded dataset
   - Review sample records for accuracy
   - Verify data mapping is correct

2. **Check Validation Report**
   - Review errors and warnings
   - Export error report for correction
   - Re-upload corrected data if needed

## Step 6: Handle Data Quality Issues

### Common Issues and Resolutions

| Issue | Resolution |
|-------|------------|
| Missing TIN | Flag for enrichment, request from customer |
| Invalid address | Update via Business Enrichment Portal |
| Incorrect country code | Correct in source system and re-upload |
| Duplicate accounts | Investigate and merge or mark as separate |
| Below threshold | Exclude from reporting or aggregate with related accounts |

### Data Enrichment Workflow

For accounts with missing or incomplete data:
1. System automatically flags accounts for enrichment
2. Enrichment team receives notification
3. Use Business Enrichment Portal to complete data
4. Submit enriched data for revalidation

## Step 7: Confirm Data Readiness

### Pre-Classification Checklist

- [ ] All required datasets uploaded successfully
- [ ] Validation errors resolved
- [ ] Data quality warnings reviewed
- [ ] Account balances verified as of December 31
- [ ] Income amounts calculated correctly
- [ ] U.S. indicia documented
- [ ] Entity information complete (for non-individual accounts)

### Next Steps

Once data collection is complete:
1. Proceed to **FATCA Customer Classification Guide**
2. Apply due diligence procedures
3. Classify accounts based on FATCA status

## Best Practices

✓ **Start Early**: Begin data collection in January to allow time for corrections
✓ **Automate Extraction**: Use scheduled queries to extract data consistently
✓ **Document Sources**: Maintain records of data sources and extraction dates
✓ **Version Control**: Keep copies of uploaded files with version numbers
✓ **Coordinate Teams**: Ensure IT, compliance, and operations teams collaborate
✓ **Test First**: Upload a small sample dataset to test the process

## Support

For assistance with data collection:
- Contact your System Administrator
- Review Dataset Management user guide
- Submit support ticket for technical issues',
    'FATCA',
    ARRAY['Data Collection', 'Process', 'Upload', 'Validation', 'Step-by-Step'],
    2,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  -- Resource 3: FATCA Customer Classification Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-classification',
    'FATCA Customer Classification Guide',
    'Users',
    'markdown',
    E'# FATCA Customer Classification Guide

## Overview

Proper customer classification is critical for FATCA compliance. This guide explains how to classify accounts based on account holder type, U.S. person status, and entity classification.

## Classification Framework

### Primary Classifications

1. **U.S. Person** - Reportable
2. **Specified U.S. Person** - Reportable
3. **Non-U.S. Person** - Not reportable (unless entity with substantial U.S. ownership)
4. **Recalcitrant Account Holder** - Special reporting requirements

## Individual Account Classification

### Step 1: Determine U.S. Person Status

An individual is a **U.S. Person** if they are:

✓ **U.S. Citizen** (regardless of residence)
✓ **U.S. Resident** (green card holder or meets substantial presence test)
✓ **U.S. National** (American Samoa or Swains Island)

### Step 2: Check for U.S. Indicia

Review account records for the following indicators:

| U.S. Indicia | Action Required |
|--------------|------------------|
| U.S. place of birth | Request self-certification or documentary evidence |
| U.S. address or P.O. box | Obtain Form W-9 or W-8BEN with non-U.S. address |
| U.S. telephone number | Request explanation or additional documentation |
| Standing transfer instructions to U.S. account | Obtain self-certification |
| Power of attorney to person with U.S. address | Request clarification |
| "In care of" or "hold mail" address (sole) | Obtain documentary evidence of non-U.S. status |

### Step 3: Apply Due Diligence Procedures

**For Pre-Existing Individual Accounts:**

**High-Value Accounts (>$1,000,000):**
1. Electronic record search for U.S. indicia
2. Paper record search if no electronic records
3. Relationship manager inquiry
4. Obtain self-certification if indicia found

**Lower-Value Accounts ($50,000 - $1,000,000):**
1. Electronic record search for U.S. indicia
2. Obtain self-certification if indicia found

**For New Individual Accounts:**
1. Obtain self-certification (Form W-9 or W-8BEN) at account opening
2. Validate reasonableness of self-certification
3. Document any U.S. indicia and resolution

### Step 4: Classify Individual Accounts

**Classification Decision Tree:**

```
Is the account holder a U.S. citizen or resident?
├─ YES → Classify as "U.S. Person" → REPORTABLE
└─ NO → Does account have unresolved U.S. indicia?
    ├─ YES → Classify as "Recalcitrant" → REPORTABLE (limited info)
    └─ NO → Classify as "Non-U.S. Person" → NOT REPORTABLE
```

## Entity Account Classification

### Step 1: Determine Entity Type

**Entity Categories:**

1. **Financial Institution (FI)**
   - Participating FFI
   - Deemed-Compliant FFI
   - Exempt Beneficial Owner

2. **Non-Financial Foreign Entity (NFFE)**
   - Active NFFE
   - Passive NFFE

3. **U.S. Entity**
   - U.S. Corporation
   - U.S. Partnership
   - U.S. Trust

### Step 2: Identify Substantial U.S. Owners

For **Passive NFFEs**, identify controlling persons who are U.S. persons:

**Substantial U.S. Owner Definition:**
- Owns >10% of equity or profits
- Exercises control over the entity

**Required Information:**
- Name of substantial U.S. owner
- Address
- U.S. TIN
- Percentage ownership

### Step 3: Obtain Entity Documentation

**Required Forms:**

| Entity Type | Required Form | Purpose |
|-------------|---------------|----------|
| Participating FFI | W-8BEN-E | Claim treaty benefits, provide GIIN |
| Active NFFE | W-8BEN-E | Certify active NFFE status |
| Passive NFFE | W-8BEN-E | Disclose substantial U.S. owners |
| U.S. Entity | W-9 | Provide U.S. TIN |

### Step 4: Classify Entity Accounts

**Classification Matrix:**

| Entity Type | Substantial U.S. Owners? | Classification | Reportable? |
|-------------|--------------------------|----------------|-------------|
| U.S. Entity | N/A | U.S. Person | YES |
| Participating FFI | N/A | Financial Institution | NO |
| Active NFFE | No | Active NFFE | NO |
| Passive NFFE | Yes | Passive NFFE with U.S. owners | YES (report owners) |
| Passive NFFE | No | Passive NFFE | NO |
| Recalcitrant Entity | Unknown | Recalcitrant | YES (limited info) |

## Special Cases

### Joint Accounts

**Classification Rule:**
- If ANY joint account holder is a U.S. person → Account is REPORTABLE
- Report full account balance (not proportional share)
- List all U.S. person joint holders

### Trust Accounts

**Classification Considerations:**
1. Identify all U.S. person beneficiaries
2. Determine if trust is a U.S. trust (court test and control test)
3. Report if trust or any beneficiary is a U.S. person

### Dormant Accounts

**Special Rules:**
- Accounts with no activity for 3+ years may be excluded (if balance <$1,000,000)
- Must still perform due diligence if account becomes active
- Document dormant status in case review

## Using ComplianceHub for Classification

### Automated Classification

1. **Navigate to Rule Management**
   - Access FATCA classification rules
   - Review pre-configured rule logic

2. **Execute Classification Rules**
   - Select dataset to classify
   - Run classification rules
   - Review automated classifications

3. **Review Flagged Cases**
   - Access Case Review module
   - Review accounts flagged for manual review
   - Approve or override system classifications

### Manual Classification Override

**When to Override:**
- System classification appears incorrect
- Additional documentation received
- Relationship manager provides clarification
- Regulatory guidance changes

**Override Process:**
1. Navigate to Case Review
2. Select account to override
3. Click "Override Decision"
4. Select correct classification
5. Provide detailed justification
6. Upload supporting documentation
7. Submit for approval

## Classification Checklist

### For Individual Accounts
- [ ] Electronic record search completed
- [ ] U.S. indicia identified and documented
- [ ] Self-certification obtained (if required)
- [ ] Documentary evidence reviewed
- [ ] Classification decision documented
- [ ] Relationship manager consulted (for high-value accounts)

### For Entity Accounts
- [ ] Entity type determined
- [ ] W-8BEN-E or W-9 obtained
- [ ] GIIN verified (for FFIs)
- [ ] Substantial U.S. owners identified (for Passive NFFEs)
- [ ] Controlling person information collected
- [ ] Classification decision documented

## Common Classification Errors

### Error 1: Misclassifying Active vs. Passive NFFE

**Correct Approach:**
- Review entity\'s business activities
- Verify >50% of income is active business income
- Confirm <50% of assets produce passive income
- Obtain audited financial statements if needed

### Error 2: Missing Substantial U.S. Owners

**Correct Approach:**
- Request complete ownership structure
- Trace ownership through holding companies
- Identify ultimate beneficial owners
- Document ownership percentages

### Error 3: Incorrect Joint Account Treatment

**Correct Approach:**
- Classify based on ANY U.S. person joint holder
- Report full account balance (not split)
- List all U.S. person holders separately

## Next Steps

After completing classification:
1. Proceed to **FATCA Rule Configuration and Testing**
2. Validate classification rules
3. Review flagged cases in Case Review module

## References

- IRS FATCA Regulations (Treasury Regulations §1.1471-1.1474)
- IRS Publication 5124: FATCA XML Schema User Guide
- FATCA FFI Agreement
- Intergovernmental Agreement (IGA) - if applicable',
    'FATCA',
    ARRAY['Classification', 'Customer', 'Due Diligence', 'Entity', 'Individual'],
    3,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  -- Resource 4: FATCA Data Upload and Validation Process
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-upload-validation',
    'FATCA Data Upload and Validation Process',
    'Upload',
    'markdown',
    E'# FATCA Data Upload and Validation Process

## Overview

This guide provides detailed instructions for uploading customer data to ComplianceHub and validating data quality before classification and reporting.

## Pre-Upload Preparation

### Data File Requirements

**Supported Formats:**
- CSV (Comma-Separated Values) - **Recommended**
- Excel (.xlsx) - Supported
- Maximum file size: 50 MB
- Maximum records: 100,000 per file

**Character Encoding:**
- UTF-8 (recommended)
- UTF-16
- ASCII

### Required Data Fields

**Mandatory Fields:**

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|----------|
| account_number | Text | Unique account identifier | ACC-2025-001 |
| customer_name | Text | Full legal name | John Michael Smith |
| date_of_birth | Date | YYYY-MM-DD format | 1985-06-15 |
| citizenship | Text | ISO 3166-1 alpha-2 code | US |
| residence_country | Text | ISO 3166-1 alpha-2 code | QA |
| address | Text | Full residential address | 123 Main St, Doha |
| account_balance | Numeric | Balance as of Dec 31 | 250000.00 |
| entity_type | Text | Individual or Entity | Individual |

**Optional but Recommended Fields:**

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|----------|
| us_tin | Text | U.S. Tax ID (SSN/ITIN/EIN) | 123456789 |
| foreign_tin | Text | Non-U.S. Tax ID | QA987654321 |
| interest_paid | Numeric | Interest paid during year | 5000.00 |
| dividend_paid | Numeric | Dividends paid during year | 2500.00 |
| us_indicia | Boolean | Has U.S. indicia? | true/false |
| substantial_us_owner | Text | Name of U.S. owner (entities) | Jane Doe |
| substantial_us_owner_tin | Text | U.S. owner TIN | 987654321 |
| substantial_us_owner_percentage | Numeric | Ownership percentage | 25.5 |

### Sample CSV Template

```csv
account_number,customer_name,date_of_birth,citizenship,residence_country,address,us_tin,foreign_tin,account_balance,interest_paid,dividend_paid,us_indicia,entity_type,substantial_us_owner
"ACC-2025-001","John Michael Smith","1985-06-15","US","QA","123 Main St, Doha, Qatar","123456789","QA987654321","250000.00","5000.00","0.00","true","Individual",""
"ACC-2025-002","Sarah Johnson","1990-03-22","GB","QA","456 Palm Ave, Doha, Qatar","","QA123456789","175000.00","3500.00","1200.00","false","Individual",""
"ACC-2025-003","Global Trading LLC","","US","QA","789 Business Park, Doha, Qatar","987654321","QA555666777","1500000.00","25000.00","0.00","true","Entity","Robert Williams"
```

## Upload Process

### Step 1: Access Dataset Management

1. Log in to ComplianceHub
2. Click **"Dataset Management"** in the sidebar navigation
3. Review existing datasets (if any)
4. Click **"Upload Dataset"** button (top right)

### Step 2: Configure Upload Settings

**Upload Modal Fields:**

1. **Dataset Name** (required)
   - Use descriptive naming convention
   - Example: "FATCA 2025 Q4 Customer Data"
   - Include year and period for tracking

2. **Regime Selection** (required)
   - Select: **FATCA**
   - (CRS option available for CRS reporting)

3. **Description** (optional)
   - Add context about data source
   - Example: "Customer accounts extracted from CBS on 2025-01-15"

4. **File Selection** (required)
   - Click "Choose File" or drag-and-drop
   - Select your prepared CSV or Excel file
   - Verify file name displays correctly

### Step 3: Initiate Upload

1. Click **"Upload"** button
2. System displays upload progress bar
3. Wait for upload to complete (do not close browser)
4. System automatically begins validation

### Step 4: Review Validation Results

**Validation Summary Screen:**

The system displays:
- Total records uploaded
- Valid records count
- Records with errors
- Records with warnings
- Validation status (Passed/Failed)

**Validation Status Indicators:**

✅ **Passed** - All records valid, ready for processing
⚠️ **Passed with Warnings** - Valid but has data quality issues
❌ **Failed** - Critical errors found, cannot process

## Validation Rules

### Critical Validations (Must Pass)

**Format Validations:**
- [ ] File format is CSV or Excel
- [ ] Character encoding is valid
- [ ] All mandatory columns present
- [ ] Column headers match expected names
- [ ] No completely empty rows

**Data Type Validations:**
- [ ] Dates in YYYY-MM-DD format
- [ ] Numeric fields contain only numbers
- [ ] Boolean fields are true/false or 1/0
- [ ] Country codes are valid ISO 3166-1 alpha-2

**Business Rule Validations:**
- [ ] Account numbers are unique within file
- [ ] Account balance >= 0
- [ ] Date of birth is in the past
- [ ] Entity type is "Individual" or "Entity"

### Warning Validations (Should Review)

**Data Quality Warnings:**
- ⚠️ Missing U.S. TIN for accounts with U.S. indicia
- ⚠️ Missing foreign TIN
- ⚠️ Address appears incomplete
- ⚠️ Account balance below reporting threshold ($50,000)
- ⚠️ Missing income payment amounts
- ⚠️ Entity account missing substantial U.S. owner info

**Data Consistency Warnings:**
- ⚠️ Citizenship and residence country mismatch
- ⚠️ U.S. citizenship but no U.S. TIN
- ⚠️ U.S. indicia flag but no supporting data
- ⚠️ Entity type "Individual" but has substantial owner

## Handling Validation Errors

### Error Report

**Accessing Error Report:**
1. Click **"Download Error Report"** button
2. Excel file downloads with error details
3. Review each error row

**Error Report Columns:**
- Row Number: Line in original file
- Account Number: Affected account
- Field Name: Field with error
- Error Type: Category of error
- Error Message: Detailed description
- Suggested Fix: Recommended correction

### Common Errors and Fixes

**Error 1: Invalid Date Format**
```
Error: date_of_birth "15/06/1985" is not in YYYY-MM-DD format
Fix: Change to "1985-06-15"
```

**Error 2: Invalid Country Code**
```
Error: citizenship "USA" is not a valid ISO 3166-1 alpha-2 code
Fix: Change to "US"
```

**Error 3: Missing Mandatory Field**
```
Error: account_balance is required but empty
Fix: Provide account balance value or remove row
```

**Error 4: Duplicate Account Number**
```
Error: account_number "ACC-2025-001" appears multiple times
Fix: Ensure each account number is unique or aggregate data
```

**Error 5: Invalid Numeric Value**
```
Error: account_balance "$250,000.00" contains non-numeric characters
Fix: Change to "250000.00" (remove $ and commas)
```

### Correction Workflow

1. **Download Error Report**
   - Export error details to Excel

2. **Correct Source Data**
   - Fix errors in original data file
   - Validate corrections

3. **Re-Upload Corrected File**
   - Return to Dataset Management
   - Upload corrected file
   - Use same dataset name with version suffix (e.g., "v2")

4. **Verify Validation Passes**
   - Review new validation results
   - Confirm all critical errors resolved

## Post-Validation Actions

### Step 1: Review Dataset Summary

**Dataset Details Screen:**
- Total accounts: 1,247
- U.S. persons identified: 89
- Entities with U.S. owners: 12
- Accounts requiring enrichment: 34
- Total account balance: $125,450,000

### Step 2: Preview Customer Records

1. Click **"Preview"** button on dataset
2. Review sample records (first 50)
3. Verify data mapping is correct
4. Check for any obvious data quality issues

**Preview Checklist:**
- [ ] Names display correctly
- [ ] Dates formatted properly
- [ ] Balances show correct amounts
- [ ] Country codes display as expected
- [ ] TINs masked appropriately (for security)

### Step 3: Confirm Dataset for Processing

1. Click **"Confirm Dataset"** button
2. System marks dataset as "Ready for Classification"
3. Dataset now available for rule execution

### Step 4: Handle Warnings

**For Accounts with Warnings:**

**Option 1: Enrich Data Now**
- Navigate to Business Enrichment Portal
- Complete missing information
- Submit enriched data

**Option 2: Proceed with Classification**
- Accept warnings
- Flag accounts for manual review
- Complete enrichment during case review

## Best Practices

### Data Preparation

✓ **Validate Before Upload**: Check data quality in source system first
✓ **Use Templates**: Download and use provided CSV template
✓ **Test with Sample**: Upload small sample file first to test process
✓ **Document Assumptions**: Note any data assumptions or limitations
✓ **Version Control**: Keep copies of uploaded files with version numbers

### Upload Timing

✓ **Upload During Off-Peak Hours**: Avoid system slowdowns
✓ **Allow Processing Time**: Large files may take 10-15 minutes
✓ **Don\'t Close Browser**: Keep browser open during upload
✓ **Check Internet Connection**: Ensure stable connection

### Error Resolution

✓ **Fix All Critical Errors**: Don\'t proceed with failed validation
✓ **Review Warnings**: Assess impact of data quality warnings
✓ **Coordinate with IT**: Involve IT team for systematic data issues
✓ **Document Corrections**: Keep record of changes made

## Troubleshooting

### Issue: Upload Fails Immediately

**Possible Causes:**
- File size exceeds 50 MB limit
- File format not supported
- File is corrupted

**Solutions:**
- Split large files into smaller batches
- Convert to CSV format
- Re-export data from source system

### Issue: Validation Takes Too Long

**Possible Causes:**
- Large file size
- System under heavy load
- Network connectivity issues

**Solutions:**
- Wait for validation to complete (can take 10-15 min)
- Upload during off-peak hours
- Check internet connection

### Issue: Many Records Flagged with Warnings

**Possible Causes:**
- Source data quality issues
- Incomplete KYC information
- Missing documentation

**Solutions:**
- Review data quality in source system
- Coordinate with KYC team to complete information
- Use Business Enrichment Portal to complete data

## Next Steps

After successful upload and validation:
1. Proceed to **FATCA Rule Configuration and Testing**
2. Execute classification rules on uploaded dataset
3. Review flagged cases in Case Review module

## Support Resources

- **CSV Template**: Download from Dataset Management screen
- **User Guide**: Access detailed documentation
- **Support Ticket**: Submit for technical assistance
- **Training Videos**: Watch upload process demonstrations',
    'FATCA',
    ARRAY['Upload', 'Validation', 'Data Quality', 'Process', 'Dataset'],
    4,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  -- Resource 5: FATCA Rule Configuration and Testing
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-rule-config',
    'FATCA Rule Configuration and Testing',
    'Settings',
    'markdown',
    E'# FATCA Rule Configuration and Testing

## Overview

Rules automate the classification and flagging of accounts based on FATCA requirements. This guide explains how to configure, test, and activate compliance rules in ComplianceHub.

## Understanding FATCA Rules

### What are Compliance Rules?

Compliance rules are logical conditions that automatically:
- Classify accounts based on customer attributes
- Flag accounts requiring manual review
- Identify reportable accounts
- Detect data quality issues
- Apply regulatory thresholds

### Rule Components

**1. Conditions**: Logical tests applied to customer data
**2. Actions**: What happens when conditions are met
**3. Priority**: Order of rule execution
**4. Status**: Draft, Active, or Inactive

## Pre-Configured FATCA Rules

ComplianceHub includes standard FATCA rules:

### Rule 1: U.S. Citizen Classification

**Purpose**: Identify and classify U.S. citizens as reportable

**Conditions:**
```
IF citizenship = "US"
THEN classify_as = "U.S. Person"
AND reportable = true
```

**Priority**: High (1)

### Rule 2: U.S. Indicia Detection

**Purpose**: Flag accounts with U.S. indicia for review

**Conditions:**
```
IF us_indicia = true
OR address CONTAINS "USA"
OR phone_number STARTS_WITH "+1"
OR place_of_birth = "US"
THEN flag_for_review = true
AND review_reason = "U.S. Indicia Detected"
```

**Priority**: High (2)

### Rule 3: Passive NFFE with U.S. Owners

**Purpose**: Identify entities with substantial U.S. ownership

**Conditions:**
```
IF entity_type = "Entity"
AND nffe_type = "Passive"
AND substantial_us_owner IS NOT NULL
THEN classify_as = "Passive NFFE with U.S. Owners"
AND reportable = true
```

**Priority**: Medium (3)

### Rule 4: Reporting Threshold Check

**Purpose**: Exclude accounts below reporting threshold

**Conditions:**
```
IF account_balance < 50000
AND entity_type = "Individual"
THEN reportable = false
AND exclusion_reason = "Below Threshold"
```

**Priority**: Low (4)

### Rule 5: Missing TIN Flag

**Purpose**: Flag U.S. persons without TIN

**Conditions:**
```
IF citizenship = "US"
AND (us_tin IS NULL OR us_tin = "")
THEN flag_for_enrichment = true
AND enrichment_reason = "Missing U.S. TIN"
```

**Priority**: Medium (5)

## Creating Custom Rules

### Step 1: Access Rule Management

1. Navigate to **Rule Management** in sidebar
2. Select **FATCA** regime toggle
3. Click **"Create Rule"** button

### Step 2: Define Rule Basics

**Rule Information Form:**

- **Rule Name**: Descriptive name (e.g., "Joint Account U.S. Person Check")
- **Description**: Detailed explanation of rule purpose
- **Regime**: FATCA
- **Category**: Classification / Flagging / Validation
- **Priority**: High / Medium / Low
- **Status**: Draft (for testing)

### Step 3: Build Rule Conditions

**Condition Builder Interface:**

**Available Operators:**
- `=` Equal to
- `!=` Not equal to
- `>` Greater than
- `<` Less than
- `>=` Greater than or equal to
- `<=` Less than or equal to
- `CONTAINS` Text contains substring
- `STARTS_WITH` Text starts with
- `ENDS_WITH` Text ends with
- `IS NULL` Field is empty
- `IS NOT NULL` Field has value
- `IN` Value in list

**Logical Operators:**
- `AND` All conditions must be true
- `OR` Any condition must be true
- `NOT` Negate condition

**Example Rule Condition:**

```
Condition Group 1 (AND):
  - citizenship = "US"
  - account_balance >= 50000
  
OR

Condition Group 2 (AND):
  - us_indicia = true
  - entity_type = "Individual"
  - us_tin IS NOT NULL
```

### Step 4: Define Rule Actions

**Available Actions:**

1. **Classify Account**
   - Set classification value
   - Options: U.S. Person, Non-U.S. Person, Passive NFFE, etc.

2. **Set Reportable Status**
   - Mark as reportable = true/false

3. **Flag for Review**
   - Add to case review queue
   - Set review priority (High/Medium/Low)
   - Specify review reason

4. **Flag for Enrichment**
   - Send to Business Enrichment Portal
   - Specify missing data fields

5. **Add Comment**
   - Attach automated comment to account
   - Document rule application

**Example Actions:**

```
Actions:
1. Classify as: "U.S. Person"
2. Set reportable: true
3. Add comment: "Classified as U.S. Person based on citizenship"
```

### Step 5: Save Rule as Draft

1. Click **"Save as Draft"**
2. Rule saved with status = "Draft"
3. Rule not yet applied to datasets

## Testing Rules

### Step 1: Access Rule Simulation

1. Navigate to Rule Management
2. Find your draft rule
3. Click **"Simulate"** button

### Step 2: Select Test Dataset

**Simulation Options:**

**Option 1: Use Sample Data**
- System provides 10 sample accounts
- Covers various scenarios
- Quick testing

**Option 2: Select Existing Dataset**
- Choose uploaded dataset
- Test against real data
- More comprehensive

**Option 3: Upload Test File**
- Upload small CSV with test cases
- Specific scenario testing

### Step 3: Run Simulation

1. Click **"Run Simulation"**
2. System applies rule to test data
3. Results displayed in table

**Simulation Results Table:**

| Account | Conditions Met? | Actions Taken | Classification | Reportable |
|---------|----------------|---------------|----------------|------------|
| ACC-001 | ✅ Yes | Classified, Flagged | U.S. Person | Yes |
| ACC-002 | ❌ No | None | - | - |
| ACC-003 | ✅ Yes | Classified | U.S. Person | Yes |

### Step 4: Review Simulation Results

**Analysis Metrics:**
- Total accounts tested: 100
- Conditions met: 23 (23%)
- Actions executed: 23
- Accounts classified: 23
- Accounts flagged: 5

**Review Checklist:**
- [ ] Rule applied to expected accounts
- [ ] No false positives (incorrect matches)
- [ ] No false negatives (missed matches)
- [ ] Actions executed correctly
- [ ] Performance acceptable (execution time)

### Step 5: Refine Rule (if needed)

**If simulation reveals issues:**

1. Click **"Edit Rule"**
2. Adjust conditions or actions
3. Save changes
4. Re-run simulation
5. Repeat until results are correct

## Activating Rules

### Step 1: Request Rule Approval

1. Navigate to draft rule
2. Click **"Submit for Approval"**
3. Add approval notes
4. Submit request

**Approval Workflow:**
- Compliance Officer reviews rule
- Verifies regulatory alignment
- Tests rule logic
- Approves or requests changes

### Step 2: Activate Approved Rule

**Once approved:**

1. Navigate to approved rule
2. Click **"Activate"** button
3. Confirm activation
4. Rule status changes to "Active"

**Activation Confirmation:**
```
⚠️ Warning: Activating this rule will apply it to all future 
dataset processing. Ensure rule has been thoroughly tested.

✓ Rule has been simulated
✓ Rule has been approved
✓ Rule logic is correct

[Cancel] [Activate Rule]
```

### Step 3: Apply Rules to Dataset

**Automatic Application:**
- Active rules automatically apply to new uploads

**Manual Application:**
1. Navigate to Dataset Management
2. Select dataset
3. Click **"Apply Rules"**
4. Select rules to apply
5. Click **"Execute"**

**Execution Progress:**
- Processing: 1,247 accounts
- Rules applied: 5 active rules
- Execution time: ~2 minutes
- Results: 89 accounts classified, 34 flagged

## Rule Management Best Practices

### Rule Design

✓ **Keep Rules Simple**: One clear purpose per rule
✓ **Use Descriptive Names**: Clearly indicate rule function
✓ **Document Logic**: Add detailed descriptions
✓ **Set Appropriate Priority**: High priority for critical classifications
✓ **Test Thoroughly**: Simulate with diverse test cases

### Rule Testing

✓ **Test Edge Cases**: Unusual or boundary scenarios
✓ **Test with Real Data**: Use actual customer data samples
✓ **Verify Performance**: Ensure rules execute quickly
✓ **Check for Conflicts**: Ensure rules don\'t contradict each other
✓ **Document Test Results**: Keep records of simulation outcomes

### Rule Maintenance

✓ **Review Regularly**: Quarterly review of all active rules
✓ **Update for Regulatory Changes**: Adjust rules when regulations change
✓ **Monitor Performance**: Track rule execution times
✓ **Deactivate Obsolete Rules**: Remove rules no longer needed
✓ **Version Control**: Maintain history of rule changes

## Common Rule Scenarios

### Scenario 1: Identify U.S. Persons with Missing TINs

**Business Need**: Flag U.S. persons without TINs for enrichment

**Rule Configuration:**
```
Conditions:
  citizenship = "US" AND us_tin IS NULL
  
Actions:
  - Flag for enrichment
  - Enrichment reason: "Missing U.S. TIN"
  - Priority: High
```

### Scenario 2: Exclude Low-Balance Accounts

**Business Need**: Don\'t report accounts below $50,000 threshold

**Rule Configuration:**
```
Conditions:
  account_balance < 50000 AND entity_type = "Individual"
  
Actions:
  - Set reportable: false
  - Add comment: "Excluded - Below reporting threshold"
```

### Scenario 3: Flag Joint Accounts with U.S. Persons

**Business Need**: Identify joint accounts requiring special handling

**Rule Configuration:**
```
Conditions:
  account_type = "Joint" AND 
  (primary_holder_citizenship = "US" OR 
   joint_holder_citizenship = "US")
  
Actions:
  - Classify as: "U.S. Person - Joint Account"
  - Set reportable: true
  - Flag for review
  - Review reason: "Joint account with U.S. person"
```

## Troubleshooting

### Issue: Rule Not Matching Expected Accounts

**Possible Causes:**
- Condition logic error
- Data field mismatch
- Case sensitivity issue

**Solutions:**
- Review condition logic carefully
- Verify field names match data
- Use case-insensitive operators

### Issue: Rule Execution Too Slow

**Possible Causes:**
- Complex condition logic
- Large dataset
- Multiple rules with overlapping conditions

**Solutions:**
- Simplify rule conditions
- Optimize rule priority order
- Process dataset in smaller batches

### Issue: Conflicting Rule Results

**Possible Causes:**
- Multiple rules modifying same field
- Incorrect rule priority

**Solutions:**
- Review rule priority settings
- Ensure rules have clear precedence
- Consolidate conflicting rules

## Next Steps

After configuring and activating rules:
1. Proceed to **FATCA Case Review and Enrichment Process**
2. Review accounts flagged by rules
3. Complete data enrichment for flagged accounts

## Support

- **Rule Templates**: Access pre-built rule templates
- **Documentation**: Review detailed rule syntax guide
- **Training**: Attend rule configuration workshop
- **Support**: Submit ticket for rule assistance',
    'FATCA',
    ARRAY['Rules', 'Configuration', 'Testing', 'Automation', 'Classification'],
    5,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  -- Resource 6: FATCA Case Review and Enrichment Process
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-case-review',
    'FATCA Case Review and Enrichment Process',
    'CheckSquare',
    'markdown',
    E'# FATCA Case Review and Enrichment Process

## Overview

Case review and data enrichment are critical steps to ensure accurate FATCA reporting. This guide explains how to review flagged accounts, complete missing data, and approve accounts for reporting.

## Understanding Case Review

### What is Case Review?

Case review is the process of:
- Manually reviewing accounts flagged by automated rules
- Validating system classifications
- Resolving data quality issues
- Making final reporting decisions
- Documenting review rationale

### When is Case Review Required?

**Accounts Requiring Review:**
- ✓ Accounts with unresolved U.S. indicia
- ✓ Conflicting documentation
- ✓ Missing mandatory information
- ✓ High-value accounts (>$1,000,000)
- ✓ Complex entity structures
- ✓ System classification uncertainty
- ✓ Recalcitrant account holders

## Accessing Case Review Module

### Step 1: Navigate to Case Review

1. Click **"Case Review"** in sidebar navigation
2. Select **FATCA** regime toggle
3. View list of flagged accounts

### Step 2: Understand Case Status

**Status Indicators:**

| Status | Meaning | Action Required |
|--------|---------|------------------|
| 🔴 **Pending Review** | Not yet reviewed | Review and decide |
| 🟡 **In Progress** | Currently being reviewed | Complete review |
| 🟢 **Approved** | Review completed, approved | None |
| 🔵 **Enrichment Required** | Missing data | Complete in Enrichment Portal |
| ⚫ **Rejected** | Excluded from reporting | None |

## Case Review Workflow

### Step 1: Filter and Prioritize Cases

**Filter Options:**

**By Status:**
- Pending Review
- In Progress
- Enrichment Required

**By Priority:**
- High (U.S. indicia, high-value accounts)
- Medium (Missing documentation)
- Low (Data quality warnings)

**By Classification:**
- U.S. Person
- Passive NFFE with U.S. Owners
- Recalcitrant
- Unclassified

**By Review Reason:**
- U.S. Indicia Detected
- Missing TIN
- Conflicting Documentation
- High-Value Account
- Entity Classification Uncertain

**Sorting Options:**
- Account Balance (High to Low)
- Review Priority
- Date Flagged

### Step 2: Select Case for Review

1. Click on account row to open case details
2. Case details panel opens on right side
3. Review all available information

**Case Details Panel Sections:**

**1. Account Summary**
- Account number
- Customer name
- Account balance
- Account type
- Opening date

**2. Customer Information**
- Date of birth
- Citizenship
- Residence country
- Address
- Contact information

**3. Tax Information**
- U.S. TIN (if available)
- Foreign TIN
- Tax residence
- Self-certification status

**4. System Classification**
- Automated classification
- Confidence score
- Rules applied
- Classification rationale

**5. U.S. Indicia**
- List of detected indicia
- Supporting evidence
- Resolution status

**6. Financial Information**
- Account balance (Dec 31)
- Interest paid
- Dividends paid
- Other income

**7. Documents**
- Uploaded documentation
- Self-certification forms
- Supporting evidence

**8. Review History**
- Previous review comments
- Status changes
- Reviewer names and dates

### Step 3: Analyze Case Information

**Review Checklist:**

**For Individual Accounts:**
- [ ] Verify customer identity
- [ ] Review citizenship and residence
- [ ] Check for U.S. indicia
- [ ] Validate TIN (if provided)
- [ ] Review self-certification form
- [ ] Assess account balance and income
- [ ] Check for joint account holders

**For Entity Accounts:**
- [ ] Verify entity type and structure
- [ ] Review entity classification (FFI/NFFE)
- [ ] Identify controlling persons
- [ ] Check for substantial U.S. owners
- [ ] Validate entity TIN
- [ ] Review W-8BEN-E form
- [ ] Verify GIIN (for FFIs)

### Step 4: Make Review Decision

**Decision Options:**

**1. Approve System Classification**
- Agree with automated classification
- Account ready for reporting
- Click **"Approve"** button

**2. Override Classification**
- Disagree with system classification
- Select correct classification
- Provide detailed justification
- Upload supporting documentation
- Click **"Override and Approve"**

**3. Request Enrichment**
- Missing critical information
- Send to Business Enrichment Portal
- Specify required data fields
- Set enrichment priority
- Click **"Request Enrichment"**

**4. Reject/Exclude**
- Account should not be reported
- Provide exclusion reason
- Document decision rationale
- Click **"Reject"**

### Step 5: Add Review Comments

**Comment Best Practices:**

✓ **Be Specific**: Clearly state reasoning
✓ **Reference Documentation**: Cite supporting documents
✓ **Note Consultations**: Document discussions with relationship managers
✓ **Explain Overrides**: Justify any classification changes
✓ **Include Dates**: Note when information was verified

**Example Comments:**

**Good Comment:**
```
Reviewed self-certification form W-8BEN dated 2024-12-15. 
Customer confirmed non-U.S. residence. U.S. place of birth 
explained by Certificate of Loss of Nationality (CLN) provided 
and verified. Override system classification from "U.S. Person" 
to "Non-U.S. Person" based on CLN documentation.
```

**Poor Comment:**
```
Not a U.S. person.
```

### Step 6: Submit Review Decision

1. Verify all required fields completed
2. Review decision summary
3. Click **"Submit Review"**
4. Case status updates automatically
5. Move to next case

## Data Enrichment Process

### When to Use Business Enrichment Portal

**Enrichment Scenarios:**
- Missing U.S. TIN for U.S. persons
- Incomplete address information
- Missing self-certification forms
- Unclear entity ownership structure
- Missing substantial U.S. owner details
- Incomplete financial information

### Step 1: Access Business Enrichment Portal

**From Case Review:**
1. Click **"Request Enrichment"** in case details
2. System automatically creates enrichment task
3. Redirects to Business Enrichment Portal

**Direct Access:**
1. Click **"Business Enrichment Portal"** in sidebar
2. Select **FATCA** regime
3. View list of accounts requiring enrichment

### Step 2: Select Account for Enrichment

1. Filter by enrichment priority (High/Medium/Low)
2. Click on account to open enrichment form
3. Review missing data fields highlighted in red

### Step 3: Complete Missing Information

**Enrichment Form Sections:**

**Customer Information:**
- Update name (if incorrect)
- Add/correct address
- Update contact information
- Verify date of birth

**Tax Information:**
- Add U.S. TIN
- Add foreign TIN
- Update tax residence
- Specify TIN type (SSN/ITIN/EIN)

**U.S. Indicia Resolution:**
- Explain U.S. indicia
- Provide supporting documentation
- Update indicia status

**Entity Information (if applicable):**
- Add substantial U.S. owner details
- Update entity classification
- Provide ownership percentages
- Add controlling person information

**Financial Information:**
- Verify account balance
- Add missing income amounts
- Correct any discrepancies

### Step 4: Upload Supporting Documents

**Document Upload:**

1. Click **"Upload Document"** button
2. Select document type:
   - Self-Certification Form (W-8/W-9)
   - Passport/ID Copy
   - Certificate of Loss of Nationality
   - Entity Formation Documents
   - Ownership Structure Chart
   - Other Supporting Evidence

3. Choose file (PDF, JPG, PNG)
4. Add document description
5. Click **"Upload"**

**Document Requirements:**
- Maximum file size: 10 MB
- Supported formats: PDF, JPG, PNG
- Clear and legible
- Complete document (all pages)

### Step 5: Submit Enriched Data

1. Review all completed fields
2. Verify uploaded documents
3. Add enrichment notes
4. Click **"Submit for Validation"**

**Validation Process:**
- System validates enriched data
- Checks for completeness
- Verifies data format
- Updates account record
- Returns to case review queue

### Step 6: Re-Review Enriched Account

1. Return to Case Review module
2. Locate enriched account
3. Verify enriched data is complete
4. Make final review decision
5. Approve for reporting

## Special Review Scenarios

### Scenario 1: Recalcitrant Account Holder

**Definition**: Account holder refuses to provide required documentation

**Review Process:**
1. Document refusal attempts
2. Classify as "Recalcitrant"
3. Report with limited information
4. Apply 30% withholding (if applicable)
5. Consider account closure

**Required Documentation:**
- Record of documentation requests
- Customer communication log
- Refusal notice (if provided)

### Scenario 2: High-Value Account (>$1,000,000)

**Enhanced Due Diligence:**
1. Perform comprehensive record search
2. Consult relationship manager
3. Review all available documentation
4. Verify current information
5. Document enhanced review process

**Additional Checks:**
- Verify source of funds
- Review transaction patterns
- Check for related accounts
- Aggregate account balances

### Scenario 3: Complex Entity Structure

**Review Approach:**
1. Obtain organizational chart
2. Identify all layers of ownership
3. Trace to ultimate beneficial owners
4. Identify all U.S. persons in structure
5. Calculate ownership percentages
6. Determine substantial U.S. owners (>10%)

**Required Information:**
- Entity formation documents
- Shareholder registry
- Ownership structure diagram
- Beneficial owner declarations

### Scenario 4: Joint Account with Mixed Status

**Classification Rule:**
- If ANY joint holder is U.S. person → Account is reportable
- Report full account balance (not proportional)
- List all U.S. person joint holders

**Review Steps:**
1. Identify all joint account holders
2. Determine U.S. person status for each
3. Classify based on any U.S. person
4. Document all joint holders
5. Report full balance

## Review Performance Metrics

**Track Your Progress:**

- **Cases Reviewed Today**: 15
- **Cases Approved**: 12
- **Cases Requiring Enrichment**: 2
- **Cases Rejected**: 1
- **Average Review Time**: 8 minutes per case
- **Pending Cases**: 34

**Team Performance:**

- **Total Cases**: 150
- **Completed**: 116 (77%)
- **In Progress**: 12 (8%)
- **Pending**: 22 (15%)
- **Target Completion**: March 25

## Best Practices

### Review Quality

✓ **Be Thorough**: Review all available information
✓ **Document Decisions**: Provide clear rationale
✓ **Consult Experts**: Involve relationship managers for complex cases
✓ **Verify Information**: Don\'t rely solely on system data
✓ **Follow Procedures**: Adhere to due diligence requirements

### Efficiency

✓ **Prioritize High-Risk Cases**: Review high-value and U.S. indicia cases first
✓ **Batch Similar Cases**: Review similar cases together
✓ **Use Templates**: Standard comments for common scenarios
✓ **Set Daily Goals**: Target number of cases per day
✓ **Track Time**: Monitor review time per case

### Compliance

✓ **Maintain Audit Trail**: Document all decisions
✓ **Retain Documentation**: Keep copies of supporting documents
✓ **Follow Regulatory Guidance**: Stay updated on IRS guidance
✓ **Escalate Uncertainties**: Consult compliance officer for unclear cases
✓ **Quality Control**: Peer review of complex cases

## Troubleshooting

### Issue: Unable to Make Decision

**Possible Causes:**
- Insufficient information
- Conflicting documentation
- Unclear regulatory guidance

**Solutions:**
- Request additional documentation
- Consult compliance officer
- Escalate to senior reviewer
- Document uncertainty and rationale

### Issue: Enrichment Data Not Updating

**Possible Causes:**
- Validation errors
- System synchronization delay
- Incorrect data format

**Solutions:**
- Check validation error messages
- Wait 5 minutes and refresh
- Verify data format matches requirements
- Contact technical support

## Next Steps

After completing case review and enrichment:
1. Proceed to **FATCA Report Generation and Submission Guide**
2. Generate IRS Form 8966 XML files
3. Submit reports via IDES portal

## Support

- **Review Guidelines**: Access detailed review procedures
- **Training**: Attend case review workshop
- **Consultation**: Schedule session with compliance officer
- **Support**: Submit ticket for case-specific questions',
    'FATCA',
    ARRAY['Case Review', 'Enrichment', 'Process', 'Approval', 'Data Quality'],
    6,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  -- Resource 7: FATCA Report Generation and Submission Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-report-submission',
    'FATCA Report Generation and Submission Guide',
    'FileOutput',
    'markdown',
    E'# FATCA Report Generation and Submission Guide

## Overview

This guide provides step-by-step instructions for generating IRS Form 8966 XML files and submitting FATCA reports through the IRS International Data Exchange Service (IDES) portal.

## Pre-Report Generation Checklist

### Data Readiness

- [ ] All datasets uploaded and validated
- [ ] Classification rules executed successfully
- [ ] Case review completed for all flagged accounts
- [ ] Data enrichment completed
- [ ] All reportable accounts approved
- [ ] Financial information verified (balances, income)
- [ ] TINs validated for all U.S. persons

### Organizational Readiness

- [ ] FFI GIIN (Global Intermediary Identification Number) available
- [ ] Sponsoring entity information (if applicable)
- [ ] Responsible officer details confirmed
- [ ] IRS IDES portal access credentials active
- [ ] Submission deadline confirmed (March 31)

## Understanding FATCA Reporting

### Form 8966 Overview

**IRS Form 8966**: Foreign Account Tax Compliance Act (FATCA) Report

**Purpose**: Report financial accounts held by U.S. taxpayers or foreign entities with substantial U.S. ownership

**Format**: XML file compliant with IRS FATCA XML Schema v2.0

**Submission Method**: IRS International Data Exchange Service (IDES)

### Reporting Elements

**Part I: Filer Information**
- FFI name and GIIN
- Address and contact information
- Reporting period (calendar year)

**Part II: Account Holder Information**
- Name and address
- U.S. TIN (SSN, ITIN, or EIN)
- Date of birth (individuals)
- Country of residence

**Part III: Account Information**
- Account number
- Account balance (as of December 31)
- Account closed indicator (if applicable)

**Part IV: Payment Information**
- Interest paid or credited
- Dividends paid
- Gross proceeds from sales/redemptions
- Other income amounts

**Part V: Substantial U.S. Owner Information** (for entities)
- Name and address of U.S. owner
- U.S. TIN
- Percentage ownership

## Report Generation Process

### Step 1: Access Reporting Module

1. Click **"Reporting"** in sidebar navigation
2. Navigate to **"Generate Report"** section
3. Click **"Generate New Report"** button

### Step 2: Configure Report Parameters

**Report Configuration Form:**

**1. Report Type**
- Select: **FATCA (Form 8966)**

**2. Reporting Year**
- Select: **2025** (or applicable year)
- Note: Reports are for previous calendar year

**3. Reporting Period**
- Start Date: 2025-01-01
- End Date: 2025-12-31
- (Auto-populated based on year)

**4. Filer Information**
- FFI Name: [Auto-populated from organization]
- GIIN: [Enter your GIIN]
- Contact Name: [Responsible officer]
- Contact Email: [Email address]
- Contact Phone: [Phone number]

**5. Dataset Selection**
- Select datasets to include in report
- Multiple datasets can be combined
- Only approved accounts will be included

**6. Report Options**

**Include:**
- [ ] New accounts (opened during year)
- [ ] Existing accounts
- [ ] Closed accounts (closed during year)
- [ ] Dormant accounts (if applicable)

**Exclude:**
- [ ] Accounts below threshold (<$50,000)
- [ ] Non-reportable classifications
- [ ] Rejected cases

### Step 3: Validate Report Data

**Pre-Generation Validation:**

System performs automatic checks:

✓ **Mandatory Fields**: All required fields present
✓ **TIN Format**: Valid U.S. TIN format (9 digits)
✓ **Country Codes**: Valid ISO 3166-1 alpha-2 codes
✓ **Date Formats**: Correct date format (YYYY-MM-DD)
✓ **Numeric Values**: Valid numeric formats
✓ **GIIN Format**: Valid GIIN format
✓ **Account Numbers**: Unique account identifiers

**Validation Results:**

- Total accounts selected: 89
- Accounts passing validation: 87
- Accounts with errors: 2
- Accounts with warnings: 5

**If Errors Found:**
1. Click **"View Error Report"**
2. Review error details
3. Return to Case Review to fix errors
4. Re-run validation

### Step 4: Generate XML Report

1. Review report summary
2. Confirm all parameters correct
3. Click **"Generate Report"**

**Generation Progress:**
```
Generating FATCA Report...

✓ Extracting account data
✓ Formatting XML structure
✓ Validating against IRS schema
✓ Encrypting sensitive data
✓ Creating report package

Report generated successfully!
```

**Generation Time**: Typically 2-5 minutes for 100-500 accounts

### Step 5: Review Generated Report

**Report Summary:**

- **Report ID**: FATCA-2025-001
- **Generation Date**: 2026-03-15 10:30:00
- **Reporting Year**: 2025
- **Total Accounts**: 87
- **Total Account Balance**: $125,450,000
- **Total Interest Paid**: $2,150,000
- **Total Dividends Paid**: $850,000
- **File Size**: 2.5 MB
- **File Name**: FATCA_2025_GIIN123456_20260315.xml

**Account Breakdown:**

| Classification | Count | Total Balance |
|----------------|-------|---------------|
| U.S. Person - Individual | 75 | $85,200,000 |
| U.S. Person - Entity | 8 | $32,500,000 |
| Passive NFFE with U.S. Owners | 4 | $7,750,000 |
| **Total** | **87** | **$125,450,000** |

### Step 6: Download Report Files

**Available Downloads:**

**1. XML Report File** (Required for submission)
- Click **"Download XML"**
- File: FATCA_2025_GIIN123456_20260315.xml
- Use for IRS IDES submission

**2. Metadata File** (Required for submission)
- Click **"Download Metadata"**
- File: FATCA_2025_GIIN123456_20260315_Metadata.xml
- Accompanies XML report

**3. Human-Readable Report** (For internal review)
- Click **"Download PDF Summary"**
- File: FATCA_2025_Summary.pdf
- For management review and audit trail

**4. Detailed Account Listing** (For internal records)
- Click **"Download Excel Report"**
- File: FATCA_2025_Accounts.xlsx
- Complete account details

### Step 7: Validate XML Against IRS Schema

**Built-in Validation:**

ComplianceHub automatically validates against IRS FATCA XML Schema v2.0

**Validation Checks:**
✓ XML structure compliant
✓ All mandatory elements present
✓ Data types correct
✓ Enumerated values valid
✓ Cross-field validations passed

**Validation Result:**
```
✅ XML Report Valid

Schema Version: FATCA XML Schema v2.0
Validation Date: 2026-03-15 10:35:00
Errors: 0
Warnings: 0

Report is ready for IRS submission.
```

## IRS IDES Submission Process

### Step 1: Access IRS IDES Portal

**Portal URL**: https://www.irs.gov/ides

**Login Requirements:**
- IDES User ID
- Password
- Two-factor authentication

**First-Time Setup:**
1. Register for IDES account
2. Complete identity verification
3. Receive approval from IRS (2-4 weeks)
4. Set up two-factor authentication

### Step 2: Prepare Submission Package

**Required Files:**

1. **XML Report File**
   - FATCA_2025_GIIN123456_20260315.xml

2. **Metadata File**
   - FATCA_2025_GIIN123456_20260315_Metadata.xml

**File Preparation:**
- Ensure files are in same folder
- Do not rename files
- Do not modify file contents
- Keep backup copies

### Step 3: Upload to IDES Portal

**Upload Process:**

1. **Log in to IDES**
   - Enter credentials
   - Complete two-factor authentication

2. **Navigate to Upload Section**
   - Click "Upload Files"
   - Select "FATCA Report"

3. **Select Files**
   - Click "Choose Files"
   - Select XML and Metadata files
   - Both files must be uploaded together

4. **Initiate Upload**
   - Click "Upload"
   - Monitor upload progress
   - Wait for upload confirmation

**Upload Time**: Typically 1-5 minutes depending on file size

### Step 4: IDES Validation

**Automatic IDES Validation:**

IRS system performs additional validation:

- Schema compliance check
- GIIN verification
- File integrity check
- Metadata consistency check

**Validation Outcomes:**

**✅ Accepted**
- Files pass all validations
- Submission successful
- Receive confirmation number

**⚠️ Accepted with Warnings**
- Files accepted but have non-critical issues
- Review warning messages
- Consider corrections for next year

**❌ Rejected**
- Files fail validation
- Review error messages
- Correct errors and re-submit

### Step 5: Receive Submission Confirmation

**Confirmation Details:**

- **Submission ID**: IDES-2026-0315-12345
- **Submission Date**: March 15, 2026
- **Reporting Year**: 2025
- **Status**: Accepted
- **Number of Records**: 87
- **Confirmation Number**: CONF-2026-67890

**Save Confirmation:**
- Download confirmation receipt
- Print for records
- Store in compliance documentation

### Step 6: Monitor Submission Status

**Status Tracking:**

1. Log in to IDES portal
2. Navigate to "Submission History"
3. View status of submitted reports

**Possible Statuses:**

| Status | Meaning | Action |
|--------|---------|--------|
| Uploaded | File received | Wait for validation |
| Validating | IRS validating | Wait (can take 24-48 hours) |
| Accepted | Validation passed | No action needed |
| Rejected | Validation failed | Review errors, correct, re-submit |
| Processing | IRS processing data | Wait for final confirmation |
| Completed | Fully processed | Submission complete |

## Post-Submission Activities

### Step 1: Update ComplianceHub

1. Return to ComplianceHub Reporting module
2. Locate generated report
3. Click **"Update Submission Status"**
4. Enter IDES confirmation number
5. Upload confirmation receipt
6. Mark as "Submitted to IRS"

### Step 2: Document Submission

**Required Documentation:**

- [ ] Generated XML report (copy)
- [ ] Metadata file (copy)
- [ ] PDF summary report
- [ ] Excel account listing
- [ ] IDES confirmation receipt
- [ ] Submission date and confirmation number
- [ ] Any correspondence with IRS

**Storage:**
- Retain for minimum 6 years
- Store in secure, backed-up location
- Organize by reporting year

### Step 3: Notify Stakeholders

**Internal Notification:**

**Email Template:**
```
Subject: FATCA 2025 Report Successfully Submitted

Dear Team,

The FATCA report for tax year 2025 has been successfully 
submitted to the IRS via the IDES portal.

Submission Details:
- Submission Date: March 15, 2026
- Reporting Year: 2025
- Total Accounts Reported: 87
- IRS Confirmation Number: CONF-2026-67890
- Status: Accepted

All documentation has been saved to the compliance archive.

Thank you to everyone involved in the rendition process.

Best regards,
[Compliance Officer Name]
```

**Notify:**
- Compliance Officer
- CFO/Finance Director
- Internal Audit
- Relationship Managers (if needed)
- IT Team

### Step 4: Conduct Post-Submission Review

**Review Meeting Agenda:**

1. **Process Review**
   - What went well?
   - What challenges were encountered?
   - Timeline adherence

2. **Data Quality Assessment**
   - Completeness of data
   - Accuracy of classifications
   - Enrichment effectiveness

3. **System Performance**
   - ComplianceHub functionality
   - Rule effectiveness
   - Report generation efficiency

4. **Improvement Opportunities**
   - Process enhancements
   - Training needs
   - System improvements

5. **Next Year Planning**
   - Timeline adjustments
   - Resource allocation
   - Early preparation activities

## Troubleshooting

### Issue: XML Validation Fails in IDES

**Common Causes:**
- GIIN format incorrect
- Invalid country codes
- TIN format errors
- Missing mandatory fields

**Solutions:**
1. Review IDES error messages carefully
2. Return to ComplianceHub
3. Correct identified errors
4. Regenerate report
5. Re-submit to IDES

### Issue: Cannot Access IDES Portal

**Possible Causes:**
- Expired password
- Account locked
- Two-factor authentication issue

**Solutions:**
- Reset password through IDES
- Contact IRS IDES support: 1-866-255-0654
- Verify two-factor authentication device

### Issue: Report Generation Fails

**Possible Causes:**
- Incomplete case reviews
- Data validation errors
- System timeout

**Solutions:**
- Complete all pending case reviews
- Fix data validation errors
- Try generating during off-peak hours
- Contact technical support

## Important Deadlines

### FATCA Reporting Timeline

| Date | Milestone |
|------|------------|
| **January 1-31** | Data collection and upload |
| **February 1-28** | Classification and case review |
| **March 1-20** | Data enrichment and final approvals |
| **March 21-25** | Report generation and validation |
| **March 26-30** | IRS submission |
| **March 31** | ⚠️ **FINAL DEADLINE** |

**Late Submission Consequences:**
- Potential IRS penalties
- Regulatory scrutiny
- Reputational risk

## Best Practices

### Report Generation

✓ **Generate Early**: Don\'t wait until deadline
✓ **Test First**: Generate test report with sample data
✓ **Review Thoroughly**: Check report summary carefully
✓ **Validate Multiple Times**: Use both ComplianceHub and IDES validation
✓ **Keep Backups**: Save multiple copies of generated files

### Submission

✓ **Submit Early**: Aim for March 25 (allows time for corrections)
✓ **Verify Confirmation**: Ensure you receive confirmation number
✓ **Monitor Status**: Check IDES portal daily after submission
✓ **Document Everything**: Keep detailed records
✓ **Plan for Contingencies**: Have backup submission plan

## Next Steps

After successful submission:
1. Review **FATCA Compliance Checklist** to ensure all steps completed
2. Begin planning for next year\'s rendition cycle
3. Archive all documentation
4. Conduct lessons learned session

## Support Resources

- **IRS IDES Support**: 1-866-255-0654
- **IRS FATCA Website**: www.irs.gov/fatca
- **IDES Portal**: www.irs.gov/ides
- **ComplianceHub Support**: Submit support ticket
- **FATCA XML Schema**: Download from IRS website',
    'FATCA',
    ARRAY['Report Generation', 'Submission', 'IDES', 'IRS', 'Form 8966'],
    7,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  -- Resource 8: FATCA Compliance Checklist
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    ahlibank_org_id,
    'fatca-compliance-checklist',
    'FATCA Compliance Checklist',
    'CheckCircle',
    'markdown',
    E'# FATCA Compliance Checklist

## Overview

This comprehensive checklist ensures all FATCA compliance requirements are met throughout the rendition process. Use this checklist to track progress and verify completion of all critical tasks.

## Pre-Rendition Preparation

### Organizational Readiness

- [ ] **FFI Registration Complete**
  - GIIN obtained from IRS
  - FFI Agreement signed and submitted
  - GIIN active and verified

- [ ] **Policies and Procedures Updated**
  - FATCA compliance policy documented
  - Due diligence procedures defined
  - Classification procedures established
  - Escalation procedures documented

- [ ] **Team Training Completed**
  - Compliance team trained on FATCA requirements
  - IT team trained on ComplianceHub
  - Relationship managers briefed on documentation requirements
  - Case reviewers trained on review procedures

- [ ] **System Access Configured**
  - ComplianceHub user accounts created
  - Role-based permissions assigned
  - IRS IDES portal access obtained
  - Two-factor authentication set up

- [ ] **Timeline Established**
  - Rendition schedule created
  - Milestones defined
  - Responsibilities assigned
  - Deadline reminders set

### Technical Preparation

- [ ] **Data Sources Identified**
  - Core banking system access confirmed
  - CRM system access verified
  - KYC database accessible
  - Document management system ready

- [ ] **Data Extraction Tested**
  - SQL queries validated
  - Data extraction scripts tested
  - File format verified
  - Sample data extracted successfully

- [ ] **ComplianceHub Configuration**
  - Organization profile updated
  - FATCA rules reviewed and activated
  - User roles and permissions configured
  - Integration with source systems tested (if applicable)

## Phase 1: Data Collection (January 1-31)

### Data Extraction

- [ ] **Customer Data Extracted**
  - All active accounts included
  - Dormant accounts reviewed
  - Closed accounts (during year) included
  - Joint account holders identified

- [ ] **Account Balances Captured**
  - Balances as of December 31 extracted
  - All account types included
  - Aggregation rules applied
  - Currency conversions performed (if applicable)

- [ ] **Financial Information Compiled**
  - Interest payments calculated
  - Dividend payments calculated
  - Gross proceeds from sales recorded
  - Other income amounts identified

- [ ] **Tax Information Gathered**
  - U.S. TINs collected (where available)
  - Foreign TINs collected
  - Self-certification forms reviewed
  - Tax residence information verified

### Data Quality Checks

- [ ] **Mandatory Fields Verified**
  - Customer names complete
  - Account numbers present
  - Citizenship information available
  - Residence country documented
  - Addresses complete

- [ ] **Data Format Validated**
  - Dates in YYYY-MM-DD format
  - Country codes in ISO 3166-1 alpha-2 format
  - Numeric fields properly formatted
  - TINs in correct format

- [ ] **Data Consistency Checked**
  - No duplicate account numbers
  - Citizenship and residence alignment reviewed
  - U.S. indicia consistency verified
  - Entity information complete

### File Preparation

- [ ] **CSV File Created**
  - Template format used
  - All required columns included
  - Column headers correct
  - Data properly formatted

- [ ] **File Validated**
  - File size within limits (<50 MB)
  - Character encoding correct (UTF-8)
  - No formatting errors
  - Sample records reviewed

- [ ] **Backup Created**
  - Original data file saved
  - Version number assigned
  - Storage location documented

## Phase 2: Data Upload and Validation (February 1-7)

### Upload to ComplianceHub

- [ ] **Dataset Uploaded**
  - File uploaded successfully
  - Dataset name assigned
  - Regime selected (FATCA)
  - Description added

- [ ] **Validation Completed**
  - Automatic validation passed
  - Error report reviewed (if applicable)
  - Warnings assessed
  - Validation status: Passed

- [ ] **Dataset Confirmed**
  - Preview reviewed
  - Record count verified
  - Sample records checked
  - Dataset marked as "Ready for Classification"

### Error Resolution

- [ ] **Critical Errors Fixed**
  - All validation errors corrected
  - Corrected file re-uploaded
  - Re-validation successful

- [ ] **Warnings Reviewed**
  - Data quality warnings assessed
  - Decision made: fix now or enrich later
  - Warnings documented

## Phase 3: Classification (February 8-14)

### Rule Configuration

- [ ] **Rules Reviewed**
  - All FATCA rules reviewed
  - Rule logic validated
  - Rule priority confirmed
  - Custom rules created (if needed)

- [ ] **Rules Tested**
  - Simulation performed with sample data
  - Results reviewed
  - Rule adjustments made (if needed)
  - Re-simulation successful

- [ ] **Rules Activated**
  - Rules approved by compliance officer
  - Rules activated in production
  - Activation confirmed

### Rule Execution

- [ ] **Rules Applied to Dataset**
  - Classification rules executed
  - Execution completed successfully
  - Results summary reviewed

- [ ] **Classification Results Reviewed**
  - Total accounts classified: _____
  - U.S. Persons identified: _____
  - Entities with U.S. owners: _____
  - Accounts flagged for review: _____
  - Accounts flagged for enrichment: _____

## Phase 4: Case Review (February 15 - March 10)

### Case Assignment

- [ ] **Cases Assigned to Reviewers**
  - High-priority cases assigned
  - Workload distributed evenly
  - Review deadlines set
  - Reviewers notified

### Individual Case Review

**For Each Flagged Account:**

- [ ] **Account Information Reviewed**
  - Customer details verified
  - Account balance confirmed
  - Financial information checked

- [ ] **Classification Assessed**
  - System classification reviewed
  - Supporting evidence examined
  - Documentation reviewed

- [ ] **Decision Made**
  - Approve system classification, OR
  - Override classification with justification, OR
  - Request enrichment, OR
  - Reject/exclude from reporting

- [ ] **Review Documented**
  - Comments added
  - Supporting documents uploaded
  - Decision rationale documented
  - Review submitted

### High-Value Account Review

**For Accounts >$1,000,000:**

- [ ] **Enhanced Due Diligence Performed**
  - Electronic record search completed
  - Paper record search completed (if applicable)
  - Relationship manager consulted
  - Current information verified

- [ ] **Documentation Complete**
  - All required forms obtained
  - Self-certification current
  - Enhanced review documented

### Entity Account Review

**For Entity Accounts:**

- [ ] **Entity Classification Verified**
  - Entity type confirmed (FFI/NFFE)
  - Active vs. Passive status determined
  - W-8BEN-E form reviewed

- [ ] **Ownership Structure Reviewed**
  - Controlling persons identified
  - Substantial U.S. owners identified (>10%)
  - Ownership percentages calculated
  - Beneficial owner information complete

### Review Completion

- [ ] **All Cases Reviewed**
  - Pending cases: 0
  - Approved cases: _____
  - Cases requiring enrichment: _____
  - Rejected cases: _____

- [ ] **Quality Control Performed**
  - Sample of reviews audited
  - Complex cases peer-reviewed
  - Consistency verified

## Phase 5: Data Enrichment (February 15 - March 10)

### Enrichment Tasks

**For Each Account Requiring Enrichment:**

- [ ] **Missing Information Identified**
  - Required fields listed
  - Priority assigned
  - Responsible party assigned

- [ ] **Data Collected**
  - Customer contacted (if needed)
  - Documentation requested
  - Information obtained

- [ ] **Data Entered in Portal**
  - Business Enrichment Portal accessed
  - Missing fields completed
  - Information verified

- [ ] **Supporting Documents Uploaded**
  - Self-certification forms uploaded
  - ID documents uploaded
  - Other supporting evidence uploaded

- [ ] **Enrichment Submitted**
  - Data submitted for validation
  - Validation passed
  - Account returned to case review

### Enrichment Completion

- [ ] **All Enrichment Tasks Completed**
  - Enrichment queue empty
  - All required data collected
  - Documentation complete

- [ ] **Enriched Accounts Re-Reviewed**
  - Enriched data verified
  - Final classification confirmed
  - Accounts approved for reporting

## Phase 6: Report Generation (March 11-20)

### Pre-Generation Checks

- [ ] **Data Readiness Verified**
  - All case reviews completed
  - All enrichment completed
  - All reportable accounts approved
  - No pending tasks

- [ ] **Filer Information Confirmed**
  - FFI name correct
  - GIIN verified
  - Contact information current
  - Responsible officer details confirmed

### Report Generation

- [ ] **Report Parameters Configured**
  - Report type: FATCA (Form 8966)
  - Reporting year: _____
  - Datasets selected
  - Report options configured

- [ ] **Pre-Generation Validation Passed**
  - All mandatory fields present
  - TIN formats valid
  - Country codes valid
  - No critical errors

- [ ] **XML Report Generated**
  - Generation completed successfully
  - Report summary reviewed
  - Account count verified: _____
  - Total balance verified: $_____

### Report Validation

- [ ] **ComplianceHub Validation Passed**
  - XML structure valid
  - IRS schema compliance confirmed
  - No validation errors
  - Warnings reviewed and accepted

- [ ] **Report Files Downloaded**
  - XML report file downloaded
  - Metadata file downloaded
  - PDF summary downloaded
  - Excel account listing downloaded

- [ ] **Manual Review Completed**
  - PDF summary reviewed by compliance officer
  - Account listing spot-checked
  - Totals verified
  - Approval obtained

## Phase 7: IRS Submission (March 21-30)

### Pre-Submission

- [ ] **IDES Portal Access Verified**
  - Login credentials active
  - Two-factor authentication working
  - Portal accessible

- [ ] **Submission Files Prepared**
  - XML report file ready
  - Metadata file ready
  - Files in same folder
  - Backup copies saved

### Submission

- [ ] **Files Uploaded to IDES**
  - Logged in to IDES portal
  - Files uploaded successfully
  - Upload confirmation received

- [ ] **IDES Validation Passed**
  - Automatic validation completed
  - Status: Accepted
  - Confirmation number received: _____

- [ ] **Confirmation Documented**
  - Confirmation receipt downloaded
  - Confirmation number recorded
  - Submission date documented: _____

### Post-Submission

- [ ] **Submission Status Monitored**
  - Status checked in IDES portal
  - Final status: Completed
  - Processing confirmation received

- [ ] **ComplianceHub Updated**
  - Submission status updated
  - Confirmation number entered
  - Confirmation receipt uploaded

## Phase 8: Documentation and Archival (March 21-31)

### Documentation

- [ ] **All Reports Saved**
  - XML report file
  - Metadata file
  - PDF summary
  - Excel account listing
  - IDES confirmation receipt

- [ ] **Process Documentation Complete**
  - Timeline documented
  - Issues and resolutions documented
  - Lessons learned documented
  - Improvement recommendations documented

- [ ] **Audit Trail Complete**
  - All case review comments saved
  - All enrichment activities documented
  - All system logs exported
  - All email communications archived

### Archival

- [ ] **Files Organized**
  - Folder structure created: FATCA_2025
  - Subfolders created (Data, Reports, Documentation)
  - All files organized by category

- [ ] **Files Backed Up**
  - Primary backup completed
  - Secondary backup completed
  - Backup integrity verified
  - Backup location documented

- [ ] **Retention Schedule Applied**
  - Retention period: 6 years minimum
  - Destruction date calculated: _____
  - Retention schedule documented

### Stakeholder Communication

- [ ] **Internal Notification Sent**
  - Compliance officer notified
  - CFO/Finance director notified
  - Internal audit notified
  - Management report prepared

- [ ] **External Communication (if required)**
  - Regulators notified (if required)
  - External auditors informed
  - Board of directors briefed

## Phase 9: Post-Rendition Review (April)

### Process Review

- [ ] **Review Meeting Conducted**
  - Team debriefing completed
  - Process effectiveness assessed
  - Challenges identified
  - Successes celebrated

- [ ] **Metrics Analyzed**
  - Total accounts processed: _____
  - Accounts reported: _____
  - Data quality issues: _____
  - Average case review time: _____
  - Total process time: _____ days

- [ ] **Improvement Opportunities Identified**
  - Process improvements documented
  - System enhancements identified
  - Training needs identified
  - Resource requirements assessed

### Next Year Planning

- [ ] **Timeline Adjusted**
  - Next year\'s schedule created
  - Milestones adjusted based on lessons learned
  - Buffer time added for contingencies

- [ ] **Action Items Assigned**
  - Process improvements assigned
  - System enhancements requested
  - Training scheduled
  - Resource allocation planned

- [ ] **Documentation Updated**
  - Procedures updated
  - Templates updated
  - Training materials updated
  - Checklists updated

## Ongoing Compliance

### Quarterly Activities

- [ ] **Q1: Post-Submission Review**
  - Review previous year\'s submission
  - Implement improvements
  - Update procedures

- [ ] **Q2: Mid-Year Preparation**
  - Review data sources
  - Test data extraction
  - Update KYC information

- [ ] **Q3: Pre-Rendition Planning**
  - Finalize timeline
  - Assign responsibilities
  - Conduct training refresher

- [ ] **Q4: Year-End Preparation**
  - Prepare for data extraction
  - Review rule configurations
  - Verify system access

### Continuous Monitoring

- [ ] **Regulatory Updates Monitored**
  - IRS guidance reviewed
  - Regulatory changes tracked
  - Procedures updated as needed

- [ ] **System Maintenance**
  - ComplianceHub updates applied
  - User access reviewed quarterly
  - System performance monitored

- [ ] **Training Maintained**
  - New staff trained
  - Annual refresher training conducted
  - Procedure changes communicated

## Sign-Off

### Completion Certification

**I certify that all items in this checklist have been completed for the FATCA rendition process for tax year _____.**

**Compliance Officer:**
- Name: _____________________
- Signature: _____________________
- Date: _____________________

**CFO/Finance Director:**
- Name: _____________________
- Signature: _____________________
- Date: _____________________

**Internal Audit (if applicable):**
- Name: _____________________
- Signature: _____________________
- Date: _____________________

---

## Summary Statistics

**Rendition Cycle Summary:**

- **Reporting Year**: _____
- **Start Date**: _____
- **Submission Date**: _____
- **Total Duration**: _____ days
- **Total Accounts Processed**: _____
- **Accounts Reported**: _____
- **Total Account Balance Reported**: $_____
- **IRS Confirmation Number**: _____
- **Submission Status**: Completed ✓

**Team Performance:**

- **Cases Reviewed**: _____
- **Average Review Time**: _____ minutes
- **Enrichment Tasks Completed**: _____
- **Data Quality Issues Resolved**: _____
- **Errors Encountered**: _____
- **On-Time Completion**: Yes / No

---

**Document Version**: 1.0
**Last Updated**: March 2026
**Next Review Date**: April 2027',
    'FATCA',
    ARRAY['Checklist', 'Compliance', 'Process', 'Verification', 'Quality Control'],
    8,
    true,
    'published'
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully inserted 8 comprehensive FATCA resources for organization: %', ahlibank_org_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to insert FATCA resources: %', SQLERRM;
END $$;