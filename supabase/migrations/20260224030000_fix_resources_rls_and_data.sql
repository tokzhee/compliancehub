-- Fix RLS policy to allow viewing resources without organization_id filter
-- Make FATCA resources organization-agnostic (shared across all organizations)

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "authenticated_users_can_view_resources" ON public.resources_content;

-- Create new policy that allows viewing published resources regardless of organization
CREATE POLICY "authenticated_users_can_view_published_resources"
ON public.resources_content
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND status = 'published'
  AND (organization_id IS NULL OR organization_id = (
    SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
  ))
);

-- Insert organization-agnostic FATCA resources (NULL organization_id means visible to all)
DO $$
BEGIN
  -- Delete any existing FATCA resources to avoid duplicates
  DELETE FROM public.resources_content WHERE category = 'FATCA' AND section_id LIKE 'fatca-%';

  -- Resource 1: FATCA Rendition Overview
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,  -- Organization-agnostic (visible to all)
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
  );

  -- Resource 2: FATCA Data Collection Process
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-data-collection',
    'FATCA Data Collection Process',
    'Database',
    'markdown',
    E'# FATCA Data Collection Process

## Overview

Data collection is the foundation of FATCA compliance. This process involves gathering comprehensive customer information, account balances, and transaction data required for accurate reporting.

## Step 1: Identify Data Sources

### Required Systems
- Core banking system (CBS)
- Customer Relationship Management (CRM)
- Know Your Customer (KYC) database
- Transaction processing systems
- Document management systems

### Data Elements Checklist

**Customer Identification:**
- Full legal name (as per official documents)
- Date of birth
- Country of citizenship
- Country of residence
- Residential address
- U.S. Tax Identification Number (SSN, ITIN, or EIN)
- Foreign Tax Identification Number

**Account Information:**
- Account number
- Account type (savings, checking, investment, etc.)
- Account opening date
- Account balance as of December 31
- Account status (active, dormant, closed)
- Joint account holder information (if applicable)

**Financial Data:**
- Interest paid or credited
- Dividend payments
- Gross proceeds from sales or redemptions
- Other income amounts

**U.S. Indicia:**
- U.S. place of birth
- U.S. address or P.O. box
- U.S. telephone number
- Standing instructions to transfer funds to U.S. account
- Power of attorney granted to person with U.S. address

## Step 2: Extract Data

### Best Practices

1. **Use Reporting Date Snapshots**: Extract account balances as of December 31
2. **Include Closed Accounts**: Report accounts closed during the year if they met thresholds
3. **Aggregate Related Accounts**: Apply aggregation rules for related accounts
4. **Validate Data Types**: Ensure numeric fields are properly formatted
5. **Handle Null Values**: Document missing or unavailable data

## Step 3: Prepare Upload File

### Supported Formats
- CSV (Comma-Separated Values) - Recommended
- Excel (.xlsx) - Supported

### Required Columns

```csv
account_number,customer_name,date_of_birth,citizenship,residence_country,address,us_tin,account_balance,interest_paid,us_indicia
```

### Data Formatting Rules

| Field | Format | Example |
|-------|--------|----------|
| Date of Birth | YYYY-MM-DD | 1985-06-15 |
| Account Balance | Numeric (no commas) | 125000.50 |
| TIN | No dashes or spaces | 123456789 |
| Country Codes | ISO 3166-1 alpha-2 | US, QA, AE |
| Boolean Fields | true/false | true |

## Step 4: Upload to ComplianceHub

### Upload Process

1. Navigate to **Dataset Management**
2. Click **Upload Dataset** button
3. Select your prepared CSV/Excel file
4. Choose regime: **FATCA**
5. Enter dataset name
6. Review validation results
7. Confirm upload

## Step 5: Validation

### Automatic Checks

- Data format validation
- Required field completeness
- TIN format verification
- Country code validation
- Duplicate account detection
- Threshold amount checks

### Error Resolution

If validation errors occur:
1. Download error report
2. Correct issues in source file
3. Re-upload corrected file
4. Verify successful validation',
    'FATCA',
    ARRAY['Rendition', 'Data Collection', 'Process', 'Upload'],
    2,
    true,
    'published'
  );

  -- Resource 3: FATCA Classification Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-classification',
    'FATCA Classification Guide',
    'Users',
    'markdown',
    E'# FATCA Classification Guide

## Overview

Proper classification of accounts is critical for FATCA compliance. This guide covers the classification process for individuals and entities.

## Individual Accounts

### U.S. Person Identification

An individual is a U.S. person if they are:
- U.S. citizen
- U.S. resident (green card holder)
- U.S. resident for tax purposes (substantial presence test)

### Classification Steps

1. **Review Documentation**
   - W-9 form (U.S. persons)
   - W-8BEN form (non-U.S. persons)
   - Government-issued ID
   - Proof of address

2. **Check for U.S. Indicia**
   - U.S. place of birth
   - U.S. address
   - U.S. telephone number
   - Standing instructions to U.S. account
   - Power of attorney with U.S. address

3. **Apply Due Diligence**
   - Electronic record search
   - Paper record search (if required)
   - Relationship manager inquiry

4. **Determine Reportability**
   - U.S. person = Reportable
   - Non-U.S. person = Not reportable

## Entity Accounts

### Entity Types

1. **Active NFFE** (Non-Financial Foreign Entity)
   - Less than 50% passive income
   - Less than 50% assets produce passive income
   - Not reportable

2. **Passive NFFE**
   - 50% or more passive income
   - 50% or more assets produce passive income
   - Reportable if substantial U.S. owners

3. **Financial Institution**
   - Investment entity
   - Custodial institution
   - Depository institution
   - Insurance company

### Substantial U.S. Owner

A substantial U.S. owner is:
- U.S. person owning >10% of entity (directly or indirectly)
- Must be identified and reported for Passive NFFEs

### Classification Process

1. **Obtain Self-Certification**
   - W-8BEN-E form
   - Entity classification declaration
   - Ownership structure documentation

2. **Verify Entity Type**
   - Review financial statements
   - Analyze income sources
   - Assess asset composition

3. **Identify Controlling Persons**
   - Review ownership structure
   - Identify beneficial owners >10%
   - Determine U.S. person status

4. **Apply Classification Rules**
   - Active NFFE: Not reportable
   - Passive NFFE with U.S. owners: Reportable
   - FFI: Apply FFI rules

## Threshold Rules

### Reporting Thresholds

| Account Type | Threshold |
|--------------|----------|
| Individual | $50,000 |
| Entity | $250,000 |

### Aggregation Rules

Aggregate account balances when:
- Multiple accounts held by same person
- Accounts held by related entities
- Joint accounts (apply to each holder)

## Documentation Requirements

### Required Documents

**For Individuals:**
- W-9 (U.S. persons) or W-8BEN (non-U.S. persons)
- Government-issued photo ID
- Proof of address
- TIN documentation

**For Entities:**
- W-8BEN-E form
- Certificate of incorporation
- Ownership structure chart
- Financial statements
- Beneficial owner identification

### Document Retention

Retain all classification documents for:
- Minimum 6 years from last transaction
- Until account closure + 6 years
- As required by local regulations

## Common Classification Errors

### Avoid These Mistakes

1. **Relying solely on self-certification** without verification
2. **Ignoring U.S. indicia** in electronic records
3. **Failing to identify controlling persons** for entities
4. **Not applying aggregation rules** for related accounts
5. **Missing threshold calculations** for joint accounts

## Next Steps

After classification:
1. Document classification decisions
2. Flag incomplete or questionable accounts
3. Route to Business Enrichment Portal if needed
4. Proceed to Rule Application phase',
    'FATCA',
    ARRAY['Rendition', 'Classification', 'Due Diligence', 'Entity Types'],
    3,
    true,
    'published'
  );

  -- Resource 4: FATCA Case Review Process
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-case-review',
    'FATCA Case Review Process',
    'CheckSquare',
    'markdown',
    E'# FATCA Case Review Process

## Overview

The Case Review module allows compliance officers to review flagged accounts, validate system classifications, and make final reporting decisions.

## Accessing Case Review

1. Navigate to **Review & Reporting** → **Case Review**
2. Select **FATCA** regime filter
3. Choose reporting year
4. Apply filters as needed

## Case Statuses

| Status | Description | Action Required |
|--------|-------------|----------------|
| **Incomplete** | Missing required data | Route to enrichment |
| **Under Enrichment** | Being completed by enrichment team | Monitor progress |
| **Ready for Review** | Complete data, awaiting review | Review and approve |
| **Approved** | Reviewed and approved for reporting | No action |
| **Rejected** | Excluded from reporting | Document reason |

## Review Process

### Step 1: Filter Cases

Apply filters to focus on specific cases:
- **Status**: Ready for Review
- **Priority**: High, Medium, Low
- **Assigned Team**: Retail, Corporate, Special
- **Completeness**: Complete, Missing TIN, Missing Residency

### Step 2: Review Account Details

For each case, review:

**Account Information:**
- Account number and type
- Account balance
- Account holder name
- Opening date and status

**Customer Information:**
- Full name and date of birth
- Citizenship and residence
- Address and contact details
- TIN (U.S. and foreign)

**Classification:**
- U.S. person status
- Entity type (if applicable)
- Reportability determination
- System recommendation

**U.S. Indicia:**
- Place of birth
- Address indicators
- Telephone number
- Standing instructions

### Step 3: Validate Classification

Verify system classification:

1. **Check Documentation**
   - Review uploaded forms (W-9, W-8BEN, W-8BEN-E)
   - Verify TIN format and validity
   - Confirm address information

2. **Assess U.S. Indicia**
   - Evaluate each indicator
   - Determine if cured by documentation
   - Document assessment

3. **Apply Professional Judgment**
   - Consider all available information
   - Assess reasonableness of classification
   - Document decision rationale

### Step 4: Take Action

**Approve:**
- Classification is correct
- Documentation is complete
- Ready for reporting
- Click **Approve** button

**Override:**
- System classification needs correction
- Click **Override Decision**
- Select correct classification
- Provide justification
- Submit for approval

**Reject:**
- Account should not be reported
- Click **Reject**
- Document reason for exclusion
- Submit decision

**Request Enrichment:**
- Additional information needed
- Click **Assign to Enrichment**
- Specify required data
- Add comments for enrichment team

### Step 5: Add Comments

Document your review:
1. Click **Add Comment**
2. Select comment type:
   - General note
   - Classification issue
   - Documentation concern
   - Follow-up required
3. Enter detailed comment
4. Submit

## Override Process

### When to Override

Override system classification when:
- Documentation contradicts system determination
- Professional judgment differs from automated rules
- New information changes classification
- Error in data entry or processing

### Override Procedure

1. **Initiate Override**
   - Click **Override Decision** button
   - System displays current classification

2. **Select New Classification**
   - Choose correct classification
   - Specify reportability status

3. **Provide Justification**
   - Explain reason for override
   - Reference supporting documentation
   - Cite applicable regulations

4. **Submit for Approval**
   - Override requires second-level approval
   - Routed to supervisor or compliance manager

5. **Track Override Status**
   - Monitor approval status
   - Respond to approval questions
   - Document final decision

## Quality Assurance

### Review Checklist

Before approving a case:

- [ ] All required fields are complete
- [ ] TIN format is valid
- [ ] Documentation supports classification
- [ ] U.S. indicia are properly addressed
- [ ] Threshold rules are correctly applied
- [ ] Entity ownership is verified (if applicable)
- [ ] Comments document review process
- [ ] Decision is consistent with policy

### Common Review Issues

1. **Missing TIN**
   - Request from customer
   - Document reasonable efforts
   - Report without TIN if unavailable

2. **Conflicting Documentation**
   - Obtain clarification from customer
   - Apply most recent documentation
   - Document resolution

3. **Unclear Entity Classification**
   - Request additional information
   - Consult with legal/tax advisors
   - Document classification basis

4. **Threshold Aggregation**
   - Verify related account identification
   - Apply aggregation rules correctly
   - Document aggregation calculation

## Reporting

### Case Review Metrics

Monitor these metrics:
- Total cases reviewed
- Approval rate
- Override rate
- Average review time
- Cases pending review

### Audit Trail

All review actions are logged:
- Reviewer name and timestamp
- Actions taken (approve, override, reject)
- Comments and justifications
- Document uploads
- Status changes

## Next Steps

After case review:
1. Approved cases proceed to Report Generation
2. Overrides await second-level approval
3. Rejected cases are excluded from reporting
4. Enrichment cases return to enrichment team',
    'FATCA',
    ARRAY['Rendition', 'Case Review', 'Approval', 'Override'],
    4,
    true,
    'published'
  );

  RAISE NOTICE 'FATCA resources inserted successfully (organization-agnostic)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to insert FATCA resources: %', SQLERRM;
END $$;