-- Update FATCA resources to be practical portal-usage guides
-- Tied to ComplianceHub features with actual screen references, navigation paths, and database tables

DO $$
BEGIN
  -- Delete existing FATCA resources
  DELETE FROM public.resources_content WHERE category = 'FATCA';

  -- Resource 1: Dataset Management Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-dataset-management',
    'Dataset Management - Upload & View FATCA Data',
    'Database',
    'markdown',
    E'# Dataset Management - Upload & View FATCA Data

## Overview

The **Dataset Management** screen allows you to upload customer account data for FATCA rendition and view all uploaded datasets from the `fatca_crs_dataset_batch` table.

## Navigation Path

**Dashboard → Data Management → Dataset Management**

## Uploading a New Dataset

### Step 1: Access Upload Modal

1. Click the **"Upload Dataset"** button (top-right corner)
2. The upload modal will open

### Step 2: Prepare Your Data File

**Required Format:** CSV or Excel (.xlsx)

**Required Columns:**
- `account_number` - Unique account identifier
- `customer_name` - Full legal name
- `date_of_birth` - Format: YYYY-MM-DD
- `citizenship` - ISO country code (e.g., US, QA)
- `residence_country` - ISO country code
- `address` - Full residential address
- `us_tin` - U.S. Tax ID (SSN/ITIN/EIN) if applicable
- `account_balance` - Balance as of December 31 (numeric)
- `interest_paid` - Annual interest amount
- `us_indicia` - Comma-separated U.S. indicators

**Example CSV:**
```csv
account_number,customer_name,date_of_birth,citizenship,residence_country,address,us_tin,account_balance,interest_paid,us_indicia
ACC001,John Smith,1985-06-15,US,QA,"123 Main St, Doha",123456789,125000.50,1250.00,"US_BIRTH_PLACE,US_ADDRESS"
ACC002,Sarah Johnson,1990-03-22,QA,QA,"456 Pearl St, Doha",,85000.00,850.00,
```

### Step 3: Upload Configuration

1. **Select File:** Click "Choose File" and select your CSV/Excel
2. **Dataset Name:** Enter descriptive name (e.g., "FATCA 2026 Q1 Upload")
3. **Regime:** Select **"FATCA"** from dropdown
4. **Description:** (Optional) Add notes about this dataset
5. Click **"Upload"**

### Step 4: Validation Results

The system automatically validates:
- ✓ Required fields present
- ✓ Date formats correct (YYYY-MM-DD)
- ✓ Country codes valid (ISO 3166-1)
- ✓ TIN formats valid
- ✓ Numeric fields properly formatted
- ✓ No duplicate account numbers

**If Errors Found:**
- Download the error report
- Fix issues in your source file
- Re-upload corrected file

## Viewing Uploaded Datasets

### Dataset Table Columns

| Column | Description | Source Table |
|--------|-------------|-------------|
| **Batch ID** | Unique dataset identifier | `fatca_crs_dataset_batch.id` |
| **Dataset Name** | Name you provided during upload | `fatca_crs_dataset_batch.batch_name` |
| **Regime** | FATCA or CRS | `fatca_crs_dataset_batch.regime` |
| **Upload Date** | When dataset was uploaded | `fatca_crs_dataset_batch.created_at` |
| **Record Count** | Number of accounts in dataset | `fatca_crs_dataset_batch.total_records` |
| **Status** | Processing status | `fatca_crs_dataset_batch.status` |
| **Uploaded By** | User who uploaded | `fatca_crs_dataset_batch.uploaded_by` |

### Dataset Status Values

- **Uploaded** - File received, pending validation
- **Validated** - All checks passed, ready for processing
- **Processing** - Rules being applied
- **Completed** - All processing finished
- **Failed** - Validation or processing errors

### Filtering Datasets

Use the filter panel to find specific datasets:
- **Regime Filter:** Show only FATCA or CRS datasets
- **Status Filter:** Filter by processing status
- **Date Range:** Select upload date range
- **Search:** Search by dataset name or batch ID

### Dataset Actions

**View Details Button:**
- Click to see complete dataset information
- View validation results
- See error details (if any)
- Download original file
- View processing logs

**Download Button:**
- Download processed dataset with classification results
- Export to CSV or Excel

## Database Tables Reference

### Primary Table: `fatca_crs_dataset_batch`

**Key Fields:**
- `id` - Unique batch identifier (UUID)
- `organization_id` - Your organization
- `regime` - FATCA or CRS
- `batch_name` - Dataset name
- `file_path` - Uploaded file location
- `total_records` - Number of accounts
- `status` - Processing status
- `uploaded_by` - User ID who uploaded
- `created_at` - Upload timestamp

### Related Table: `fatca_crs_customer_accounts`

**Contains individual account records from your upload:**
- `batch_id` - Links to dataset batch
- `account_number` - Account identifier
- `customer_name` - Account holder name
- `account_balance` - Balance amount
- `classification_status` - U.S. person classification
- All other fields from your CSV

## Next Steps After Upload

1. **Wait for Validation** - System validates data (usually < 1 minute)
2. **Review Validation Results** - Check for any errors
3. **Proceed to Rule Management** - Configure classification rules
4. **Run Classification** - Apply rules to classify accounts
5. **Review Cases** - Go to Case Review screen for flagged accounts

## Tips & Best Practices

✓ **Upload Early:** Upload datasets well before March 31 deadline
✓ **Validate Externally:** Check data quality before upload
✓ **Use Descriptive Names:** Include date/period in dataset name
✓ **Keep Originals:** Maintain backup of source files
✓ **Monitor Status:** Check processing status regularly
✓ **Review Errors Immediately:** Fix validation errors promptly

## Common Issues

**Issue:** "Invalid date format" error
**Solution:** Ensure dates are YYYY-MM-DD format (e.g., 2026-01-15)

**Issue:** "Duplicate account number" error
**Solution:** Remove duplicate rows or use unique account identifiers

**Issue:** "Missing required field" error
**Solution:** Ensure all required columns present with values

**Issue:** Dataset stuck in "Processing" status
**Solution:** Contact system administrator or check processing logs',
    'FATCA',
    ARRAY['Dataset Management', 'Upload', 'Portal Guide', 'How-To'],
    1,
    true,
    'published'
  );

  -- Resource 2: Rule Management Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-rule-management',
    'Rule Management - Configure FATCA Classification Rules',
    'Settings',
    'markdown',
    E'# Rule Management - Configure FATCA Classification Rules

## Overview

The **Rule Management** screen allows you to create, configure, and test classification rules that automatically identify U.S. reportable accounts from the `fatca_crs_rule_sets` table.

## Navigation Path

**Dashboard → Configuration → Rule Management**

## Understanding Rule Sets

### What Are Rule Sets?

Rule sets are collections of conditions that classify accounts as:
- **U.S. Reportable** - Must be reported to IRS
- **Non-Reportable** - No reporting required
- **Requires Review** - Manual review needed

### Rule Set Components

**From `fatca_crs_rule_sets` table:**
- `rule_name` - Descriptive rule name
- `regime` - FATCA or CRS
- `rule_type` - Classification type (indicia_based, documentation_based, threshold_based)
- `conditions` - JSON array of rule conditions
- `priority` - Execution order (lower = higher priority)
- `is_active` - Whether rule is enabled
- `version` - Rule version number

## Creating a New Rule

### Step 1: Open Create Rule Modal

1. Click **"Create Rule"** button (top-right)
2. The rule configuration modal opens

### Step 2: Basic Rule Information

**Rule Name:** Enter descriptive name
- Example: "U.S. Birth Place Indicator"
- Example: "High Balance U.S. TIN Holder"

**Regime:** Select **FATCA**

**Rule Type:** Choose from:
- **Indicia-Based** - Uses U.S. indicators (birth place, address, phone)
- **Documentation-Based** - Uses W-9/W-8 forms
- **Threshold-Based** - Uses account balance thresholds

**Priority:** Set execution order (1-100)
- Lower numbers execute first
- Critical rules should have priority 1-10

### Step 3: Define Conditions

Click **"Add Condition"** to create rule logic:

**Condition Structure:**
```json
{
  "field": "us_indicia",
  "operator": "contains",
  "value": "US_BIRTH_PLACE"
}
```

**Available Fields:**
- `us_tin` - U.S. Tax ID present
- `us_indicia` - U.S. indicators
- `citizenship` - Country of citizenship
- `residence_country` - Country of residence
- `account_balance` - Account balance amount
- `date_of_birth` - Birth date
- `address` - Residential address

**Available Operators:**
- `equals` - Exact match
- `contains` - Partial match
- `greater_than` - Numeric comparison
- `less_than` - Numeric comparison
- `is_null` - Field is empty
- `is_not_null` - Field has value

### Step 4: Set Classification Result

**Classification Options:**
- **U.S. Reportable** - Account will be included in IRS report
- **Non-Reportable** - Account excluded from reporting
- **Requires Review** - Flagged for manual review in Case Review screen

### Step 5: Test Rule (Optional)

Before activating:
1. Click **"Test Rule"** button
2. System shows how many accounts match conditions
3. Review sample matching accounts
4. Adjust conditions if needed

### Step 6: Save and Activate

1. Click **"Save Rule"**
2. Rule saved to `fatca_crs_rule_sets` table
3. Toggle **"Active"** switch to enable

## Pre-Configured Rule Examples

### Rule 1: U.S. TIN Holder

**Name:** "U.S. TIN Present - Reportable"
**Type:** Documentation-Based
**Priority:** 1
**Conditions:**
```json
[
  {
    "field": "us_tin",
    "operator": "is_not_null",
    "value": null
  }
]
```
**Classification:** U.S. Reportable

### Rule 2: U.S. Birth Place Indicator

**Name:** "U.S. Birth Place - Review Required"
**Type:** Indicia-Based
**Priority:** 5
**Conditions:**
```json
[
  {
    "field": "us_indicia",
    "operator": "contains",
    "value": "US_BIRTH_PLACE"
  }
]
```
**Classification:** Requires Review

### Rule 3: High Balance Threshold

**Name:** "Balance Over $50,000 with U.S. Address"
**Type:** Threshold-Based
**Priority:** 10
**Conditions:**
```json
[
  {
    "field": "account_balance",
    "operator": "greater_than",
    "value": 50000
  },
  {
    "field": "us_indicia",
    "operator": "contains",
    "value": "US_ADDRESS"
  }
]
```
**Classification:** Requires Review

## Viewing and Managing Rules

### Rule Table Columns

| Column | Description | Source |
|--------|-------------|--------|
| **Rule Name** | Rule identifier | `fatca_crs_rule_sets.rule_name` |
| **Type** | Classification method | `fatca_crs_rule_sets.rule_type` |
| **Priority** | Execution order | `fatca_crs_rule_sets.priority` |
| **Status** | Active/Inactive | `fatca_crs_rule_sets.is_active` |
| **Version** | Rule version | `fatca_crs_rule_sets.version` |
| **Matches** | Accounts matching rule | Calculated from `fatca_crs_customer_accounts` |
| **Last Modified** | Update timestamp | `fatca_crs_rule_sets.updated_at` |

### Rule Actions

**Edit Button:**
- Modify rule conditions
- Update priority
- Change classification result
- Creates new version (old version archived)

**Activate/Deactivate Toggle:**
- Enable or disable rule
- Inactive rules not applied during classification

**Test Button:**
- Run rule against current dataset
- See matching account count
- Preview affected accounts

**Delete Button:**
- Remove rule permanently
- Only available for unused rules

## Running Classification

### Step 1: Verify Active Rules

1. Check that required rules are **Active**
2. Verify rule priorities are correct
3. Test rules if recently modified

### Step 2: Execute Classification

1. Click **"Run Classification"** button
2. Select dataset batch from dropdown
3. Confirm execution
4. System applies all active rules in priority order

### Step 3: Monitor Progress

**Progress Indicators:**
- Processing status bar
- Accounts processed count
- Estimated time remaining

### Step 4: Review Results

**Classification Summary:**
- Total accounts processed
- U.S. Reportable count
- Non-Reportable count
- Requires Review count

## Database Tables Reference

### Primary Table: `fatca_crs_rule_sets`

**Key Fields:**
- `id` - Unique rule identifier
- `organization_id` - Your organization
- `rule_name` - Rule name
- `regime` - FATCA or CRS
- `rule_type` - Classification method
- `conditions` - JSON rule logic
- `classification_result` - Output classification
- `priority` - Execution order
- `is_active` - Enabled status
- `version` - Version number

### Results Table: `fatca_crs_customer_accounts`

**Classification Fields Updated:**
- `classification_status` - Final classification
- `matched_rules` - Array of rule IDs that matched
- `requires_review` - Boolean flag
- `classification_date` - When classified

## Next Steps After Classification

1. **Review Classification Summary** - Check distribution of results
2. **Go to Case Review** - Review accounts flagged as "Requires Review"
3. **Business Enrichment** - Complete missing data for reportable accounts
4. **Generate Reports** - Proceed to Reporting Module

## Tips & Best Practices

✓ **Test Before Activating:** Always test rules before enabling
✓ **Use Priority Wisely:** Critical rules (U.S. TIN) should execute first
✓ **Version Control:** System maintains rule history automatically
✓ **Document Rules:** Add clear descriptions for future reference
✓ **Review Regularly:** Update rules based on IRS guidance changes
✓ **Backup Rules:** Export rule configurations periodically

## Common Issues

**Issue:** Rule matches too many accounts
**Solution:** Add more specific conditions or increase threshold values

**Issue:** Rule matches no accounts
**Solution:** Check field names match your data, verify operator logic

**Issue:** Rules conflict with each other
**Solution:** Adjust priorities so most specific rules execute first

**Issue:** Classification results unexpected
**Solution:** Use Test function to debug, check condition logic',
    'FATCA',
    ARRAY['Rule Management', 'Configuration', 'Portal Guide', 'Classification'],
    2,
    true,
    'published'
  );

  -- Resource 3: Case Review Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-case-review',
    'Case Review - Review Flagged FATCA Accounts',
    'FileSearch',
    'markdown',
    E'# Case Review - Review Flagged FATCA Accounts

## Overview

The **Case Review** screen displays accounts flagged as "Requires Review" from the `fatca_crs_case_master` table. Use this screen to manually review ambiguous cases and make final classification decisions.

## Navigation Path

**Dashboard → Case Management → Case Review**

## Understanding Cases

### What Are Cases?

Cases are accounts that:
- Matched indicia-based rules but lack documentation
- Have conflicting information (e.g., U.S. birth but non-U.S. citizenship)
- Exceed balance thresholds with partial U.S. indicators
- Require compliance officer judgment

### Case Sources

**Cases are created when:**
1. Rule classification result = "Requires Review"
2. Multiple rules with conflicting results match
3. Data quality issues detected
4. Manual escalation from Business Enrichment

## Case Review Interface

### Cases Table Columns

| Column | Description | Source Table |
|--------|-------------|-------------|
| **Case ID** | Unique case identifier | `fatca_crs_case_master.id` |
| **Account Number** | Account identifier | `fatca_crs_case_master.account_number` |
| **Customer Name** | Account holder name | `fatca_crs_customer_accounts.customer_name` |
| **Case Type** | Reason for review | `fatca_crs_case_master.case_type` |
| **Priority** | Urgency level | `fatca_crs_case_master.priority` |
| **Status** | Review status | `fatca_crs_case_master.status` |
| **Assigned To** | Reviewer name | `fatca_crs_case_master.assigned_to` |
| **Created Date** | When flagged | `fatca_crs_case_master.created_at` |

### Case Status Values

- **Open** - Awaiting review
- **In Progress** - Currently being reviewed
- **Resolved** - Decision made, classification updated
- **Escalated** - Sent to senior compliance officer
- **Closed** - Final decision recorded

### Case Type Categories

- **Indicia Conflict** - Conflicting U.S. indicators
- **Documentation Missing** - W-9/W-8 forms not provided
- **Threshold Exceeded** - High balance with partial indicia
- **Data Quality** - Incomplete or inconsistent data
- **Manual Escalation** - Flagged by user

## Reviewing a Case

### Step 1: Select Case

1. Click on case row in table
2. Case details panel opens on right side

### Step 2: Review Account Information

**Account Details Section:**
- Account number and type
- Current balance (as of December 31)
- Account opening date
- Account status

**Customer Information:**
- Full legal name
- Date of birth
- Citizenship(s)
- Residence country
- Residential address
- Contact information

**U.S. Indicia Present:**
- ☑ U.S. birth place
- ☑ U.S. residential address
- ☑ U.S. mailing address
- ☑ U.S. telephone number
- ☑ Standing transfer instructions to U.S. account
- ☑ U.S. power of attorney
- ☑ U.S. "in care of" address

**Documentation Status:**
- W-9 form (U.S. person)
- W-8BEN form (Non-U.S. individual)
- W-8BEN-E form (Non-U.S. entity)
- Self-certification forms
- Supporting documents (passport, ID, etc.)

### Step 3: Review Matched Rules

**Rules Applied Section:**
- Lists all rules that matched this account
- Shows rule name, type, and classification result
- Displays rule conditions that were met

**Example:**
```
Rule: "U.S. Birth Place - Review Required"
Type: Indicia-Based
Result: Requires Review
Conditions Met:
  ✓ us_indicia contains "US_BIRTH_PLACE"
```

### Step 4: Review Case History

**Activity Timeline:**
- Case creation date and reason
- Previous review attempts
- Comments from other reviewers
- Data enrichment updates
- Status changes

### Step 5: Make Classification Decision

**Decision Options:**

1. **Classify as U.S. Reportable**
   - Account will be included in IRS report
   - Requires justification comment
   - Updates `classification_status` to "US_REPORTABLE"

2. **Classify as Non-Reportable**
   - Account excluded from reporting
   - Requires justification comment
   - Updates `classification_status` to "NON_REPORTABLE"

3. **Request Additional Information**
   - Send to Business Enrichment for data completion
   - Specify required information
   - Case status changes to "Pending Enrichment"

4. **Escalate to Senior Officer**
   - Complex cases requiring higher authority
   - Add escalation reason
   - Case assigned to senior compliance officer

### Step 6: Add Review Comments

**Required Information:**
- Classification decision rationale
- Supporting documentation reviewed
- Any assumptions made
- Regulatory guidance applied

**Example Comment:**
```
Reviewed account ACC001 for John Smith.

U.S. Indicia Present:
- U.S. birth place (New York)
- U.S. telephone number

Documentation Reviewed:
- Valid W-8BEN form provided
- Foreign passport (Qatar)
- Self-certification of non-U.S. tax residency

Decision: Classify as NON-REPORTABLE

Rationale: Customer provided valid W-8BEN certifying non-U.S. 
tax residency. U.S. birth place explained by birth during 
parents'' temporary U.S. assignment. Customer is Qatari citizen 
with no current U.S. ties. Per IRS guidance, valid W-8BEN 
overrides birth place indicia.
```

### Step 7: Submit Decision

1. Click **"Submit Decision"** button
2. System updates:
   - `fatca_crs_case_master.status` → "Resolved"
   - `fatca_crs_case_master.resolution_date` → Current timestamp
   - `fatca_crs_case_master.resolved_by` → Your user ID
   - `fatca_crs_customer_accounts.classification_status` → Your decision
   - `fatca_crs_customer_accounts.manual_override` → true
3. Case removed from "Open Cases" view
4. Decision logged in audit trail

## Filtering and Searching Cases

### Filter Panel Options

**Status Filter:**
- Open
- In Progress
- Resolved
- Escalated

**Case Type Filter:**
- Indicia Conflict
- Documentation Missing
- Threshold Exceeded
- Data Quality

**Priority Filter:**
- High
- Medium
- Low

**Assigned To Filter:**
- My Cases (assigned to you)
- Unassigned
- Specific user

**Date Range Filter:**
- Created date range
- Due date range

### Search Functionality

**Search by:**
- Account number
- Customer name
- Case ID
- TIN

## Case Assignment

### Assigning Cases to Reviewers

1. Select one or multiple cases (checkboxes)
2. Click **"Assign"** button
3. Choose reviewer from dropdown
4. Click **"Assign Cases"**
5. System updates `assigned_to` field
6. Assigned user receives notification

### Auto-Assignment Rules

**System can auto-assign based on:**
- Case type (e.g., all documentation cases to specific reviewer)
- Priority (high priority to senior officers)
- Workload balancing (distribute evenly)
- Expertise (complex cases to experienced reviewers)

## Bulk Actions

### Bulk Classification

**For similar cases:**
1. Select multiple cases (checkboxes)
2. Click **"Bulk Action"** dropdown
3. Choose classification decision
4. Add bulk comment
5. Confirm action
6. All selected cases updated simultaneously

**Use Cases:**
- Multiple accounts with same documentation issue
- Batch of accounts from same customer
- Similar indicia patterns

## Database Tables Reference

### Primary Table: `fatca_crs_case_master`

**Key Fields:**
- `id` - Unique case identifier
- `organization_id` - Your organization
- `regime` - FATCA or CRS
- `account_number` - Related account
- `case_type` - Review reason
- `priority` - Urgency level
- `status` - Current status
- `assigned_to` - Reviewer user ID
- `created_at` - Creation timestamp
- `resolution_date` - When resolved
- `resolved_by` - Resolver user ID

### Related Table: `fatca_crs_case_comments`

**Stores review comments:**
- `case_id` - Links to case
- `user_id` - Commenter
- `comment_text` - Comment content
- `created_at` - Comment timestamp

## Next Steps After Case Review

1. **Complete All Open Cases** - Resolve before report generation
2. **Business Enrichment** - Send incomplete cases for data completion
3. **Final Validation** - Verify all classifications correct
4. **Generate Reports** - Proceed to Reporting Module

## Tips & Best Practices

✓ **Review Daily:** Check for new cases regularly
✓ **Document Thoroughly:** Add detailed comments for audit trail
✓ **Use Filters:** Focus on high-priority cases first
✓ **Escalate When Uncertain:** Don''t guess on complex cases
✓ **Verify Documentation:** Always check original documents
✓ **Follow IRS Guidance:** Apply latest regulatory guidance
✓ **Maintain Consistency:** Use similar rationale for similar cases

## Common Scenarios

### Scenario 1: U.S. Birth Place, Non-U.S. Citizen

**Indicia:** U.S. birth place
**Documentation:** Valid W-8BEN, foreign passport
**Decision:** Non-Reportable (valid self-certification overrides birth place)

### Scenario 2: U.S. Address, High Balance

**Indicia:** U.S. mailing address, balance $150,000
**Documentation:** No W-8BEN or W-9
**Decision:** Request documentation (cannot classify without forms)

### Scenario 3: U.S. TIN, Claims Non-Resident

**Indicia:** Valid U.S. TIN (SSN)
**Documentation:** Claims non-U.S. tax residency
**Decision:** U.S. Reportable (U.S. TIN = U.S. person regardless of residency claim)

### Scenario 4: Multiple Conflicting Indicators

**Indicia:** U.S. phone, U.S. power of attorney, non-U.S. address
**Documentation:** Partial documentation
**Decision:** Escalate to senior officer (complex case requiring expertise)',
    'FATCA',
    ARRAY['Case Review', 'Portal Guide', 'Manual Review', 'Classification'],
    3,
    true,
    'published'
  );

  -- Resource 4: Business Enrichment Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-business-enrichment',
    'Business Enrichment - Complete Missing Account Data',
    'Edit',
    'markdown',
    E'# Business Enrichment - Complete Missing Account Data

## Overview

The **Business Enrichment Portal** allows you to complete missing or incomplete data for accounts that require additional information before final classification and reporting.

## Navigation Path

**Dashboard → Data Management → Business Enrichment Portal**

## Understanding Data Enrichment

### Why Enrichment Is Needed

**Common Data Issues:**
- Missing U.S. TIN for identified U.S. persons
- Incomplete address information
- Missing date of birth
- Unclear citizenship status
- Missing documentation (W-9/W-8 forms)
- Incomplete entity ownership information

**Impact of Missing Data:**
- Cannot generate compliant IRS reports
- Accounts stuck in "Requires Review" status
- Risk of reporting errors
- Potential IRS penalties

## Enrichment Interface

### Data Completeness Panel

**Top Section Shows:**
- Total accounts requiring enrichment
- Data completeness percentage
- Critical fields missing count
- Optional fields missing count
- Enrichment progress over time

**Completeness Calculation:**
```
Completeness % = (Populated Required Fields / Total Required Fields) × 100
```

### Accounts Grid

**Table Columns:**

| Column | Description | Source |
|--------|-------------|--------|
| **Account Number** | Account identifier | `fatca_crs_customer_accounts.account_number` |
| **Customer Name** | Account holder | `fatca_crs_customer_accounts.customer_name` |
| **Completeness** | Data completeness % | Calculated |
| **Missing Fields** | Count of empty required fields | Calculated |
| **Priority** | Enrichment urgency | Based on classification |
| **Status** | Enrichment status | `fatca_crs_customer_accounts.enrichment_status` |
| **Last Updated** | Last modification date | `fatca_crs_customer_accounts.updated_at` |

### Priority Levels

- **Critical** - U.S. reportable accounts missing required IRS fields
- **High** - Accounts in review with missing documentation
- **Medium** - Accounts with optional fields missing
- **Low** - Non-reportable accounts with minor gaps

## Enriching Account Data

### Step 1: Select Account

1. Click **"Enrich"** button on account row
2. Enrichment modal opens with account details

### Step 2: Review Current Data

**Modal Shows:**
- All existing account information
- Fields highlighted in red = missing/required
- Fields highlighted in yellow = incomplete/needs verification
- Fields in green = complete and validated

### Step 3: Complete Missing Fields

**Required Fields for U.S. Reportable Accounts:**

**Personal Information:**
- ☐ Full Legal Name (as per official ID)
- ☐ Date of Birth (YYYY-MM-DD)
- ☐ Country of Citizenship
- ☐ Country of Tax Residence
- ☐ Residential Address (complete with postal code)

**U.S. Tax Information:**
- ☐ U.S. TIN (SSN, ITIN, or EIN)
- ☐ TIN Type (SSN/ITIN/EIN)
- ☐ U.S. Person Status (Yes/No)

**Account Information:**
- ☐ Account Balance (as of December 31)
- ☐ Account Type (Savings/Checking/Investment/etc.)
- ☐ Account Opening Date

**Financial Data:**
- ☐ Interest Paid (annual amount)
- ☐ Dividends Paid (if applicable)
- ☐ Gross Proceeds (if applicable)

**Documentation:**
- ☐ W-9 Form (for U.S. persons)
- ☐ W-8BEN Form (for non-U.S. individuals)
- ☐ W-8BEN-E Form (for non-U.S. entities)
- ☐ Supporting ID Documents

### Step 4: Upload Documentation

**Document Upload Section:**
1. Click **"Upload Document"** button
2. Select document type from dropdown:
   - W-9 Form
   - W-8BEN Form
   - W-8BEN-E Form
   - Passport Copy
   - National ID
   - Proof of Address
   - Other Supporting Documents
3. Choose file (PDF, JPG, PNG)
4. Add document description
5. Click **"Upload"**

**Uploaded Documents:**
- Stored in Supabase Storage bucket: `fatca-documents`
- Linked to account in `fatca_crs_customer_documents` table
- Accessible for audit and review

### Step 5: Add Enrichment Notes

**Notes Section:**
- Document data source (e.g., "Obtained from customer via email")
- Verification method (e.g., "Verified against passport copy")
- Any assumptions or clarifications
- Contact with customer (date, method, outcome)

**Example Note:**
```
Enrichment Date: 2026-02-15
Data Source: Customer provided via secure email
Verification: Cross-checked TIN against W-9 form dated 2026-02-10
Documentation: W-9 form uploaded, passport copy uploaded
Notes: Customer confirmed U.S. citizenship and current U.S. tax residency.
All required fields now complete.
```

### Step 6: Validate Data

**Before Saving:**
1. Click **"Validate"** button
2. System checks:
   - ✓ All required fields populated
   - ✓ Data formats correct (dates, TINs, country codes)
   - ✓ TIN matches TIN type
   - ✓ Documentation uploaded for classification
   - ✓ No conflicting information

**Validation Results:**
- ✓ Green checkmark = All validations passed
- ⚠ Yellow warning = Optional fields missing
- ✗ Red error = Required fields missing or invalid

### Step 7: Save Enrichment

1. Click **"Save Enrichment"** button
2. System updates:
   - `fatca_crs_customer_accounts` table with new data
   - `enrichment_status` → "Completed"
   - `enrichment_date` → Current timestamp
   - `enriched_by` → Your user ID
3. Account removed from enrichment queue
4. If classification was pending, account re-classified automatically

## Bulk Enrichment

### For Multiple Similar Accounts

**Use Case:** Multiple accounts from same customer or with same missing field

**Process:**
1. Select multiple accounts (checkboxes)
2. Click **"Bulk Enrich"** button
3. Enter common data (e.g., same TIN for joint accounts)
4. Upload documentation once (applies to all)
5. Save bulk enrichment
6. All selected accounts updated simultaneously

## Data Sources for Enrichment

### Internal Sources

1. **Core Banking System (CBS)**
   - Account opening forms
   - KYC documentation
   - Transaction history
   - Customer contact information

2. **CRM System**
   - Customer profiles
   - Communication history
   - Relationship manager notes

3. **Document Management System**
   - Stored ID documents
   - Tax forms
   - Signed agreements

### External Sources

1. **Customer Direct Contact**
   - Email requests
   - Phone calls
   - In-branch visits
   - Secure portal submissions

2. **Third-Party Verification**
   - TIN verification services
   - Address verification services
   - Identity verification providers

## Filtering Enrichment Queue

### Filter Options

**Priority Filter:**
- Critical
- High
- Medium
- Low

**Status Filter:**
- Pending Enrichment
- In Progress
- Completed
- Verification Required

**Missing Fields Filter:**
- Missing TIN
- Missing Documentation
- Missing Address
- Missing Date of Birth
- Multiple Missing Fields

**Classification Filter:**
- U.S. Reportable
- Requires Review
- Non-Reportable

### Search Functionality

**Search by:**
- Account number
- Customer name
- TIN
- Relationship manager

## Database Tables Reference

### Primary Table: `fatca_crs_customer_accounts`

**Enrichment Fields:**
- `enrichment_status` - Current enrichment status
- `enrichment_date` - When enrichment completed
- `enriched_by` - User who enriched
- `data_completeness_score` - Calculated completeness %
- All customer/account data fields

### Documents Table: `fatca_crs_customer_documents`

**Key Fields:**
- `account_number` - Links to account
- `document_type` - Type of document
- `file_path` - Storage location
- `uploaded_by` - User who uploaded
- `upload_date` - Upload timestamp

### Enrichment History: `fatca_crs_enrichment_log`

**Tracks all enrichment activities:**
- `account_number` - Account enriched
- `field_name` - Field updated
- `old_value` - Previous value
- `new_value` - Updated value
- `enriched_by` - User who made change
- `enrichment_date` - Timestamp
- `notes` - Enrichment notes

## Next Steps After Enrichment

1. **Re-Classification** - System automatically re-classifies enriched accounts
2. **Case Review** - If still flagged, return to Case Review
3. **Final Validation** - Verify all reportable accounts complete
4. **Generate Reports** - Proceed to Reporting Module

## Tips & Best Practices

✓ **Prioritize Critical Accounts:** Focus on U.S. reportable accounts first
✓ **Verify Data:** Always cross-check against official documents
✓ **Document Sources:** Record where data came from
✓ **Upload Documentation:** Attach supporting documents for audit trail
✓ **Contact Customers Early:** Don''t wait until deadline to request information
✓ **Use Bulk Enrichment:** Save time on similar accounts
✓ **Validate Before Saving:** Use validation function to catch errors
✓ **Track Progress:** Monitor completeness percentage regularly

## Common Issues

**Issue:** Customer won''t provide U.S. TIN
**Solution:** Request W-8BEN form with explanation, or classify as recalcitrant account

**Issue:** Conflicting information in different systems
**Solution:** Verify with customer, use most recent official documentation

**Issue:** Documentation in foreign language
**Solution:** Obtain certified translation, or use English summary with original attached

**Issue:** Customer unreachable
**Solution:** Try multiple contact methods, escalate to relationship manager, document attempts

**Issue:** Bulk enrichment fails for some accounts
**Solution:** Review error log, complete failed accounts individually',
    'FATCA',
    ARRAY['Business Enrichment', 'Portal Guide', 'Data Completion', 'Documentation'],
    4,
    true,
    'published'
  );

  -- Resource 5: Reporting Module Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-reporting',
    'Reporting Module - Generate IRS FATCA Reports',
    'FileText',
    'markdown',
    E'# Reporting Module - Generate IRS FATCA Reports

## Overview

The **Reporting Module** generates IRS-compliant FATCA reports (Form 8966 XML files) from classified account data in the `fatca_crs_report_batch` table.

## Navigation Path

**Dashboard → Reporting → Reporting Module**

## Understanding FATCA Reporting

### What Is Form 8966?

Form 8966 is the **FATCA Report** submitted to the IRS via the International Data Exchange Service (IDES) portal. It contains:
- Financial institution information (GIIN, name, address)
- Reportable account holder information
- Account balances and financial data
- Payment information (interest, dividends, etc.)

### Reporting Deadline

**Annual Deadline: March 31**
- Reports cover previous calendar year (January 1 - December 31)
- Late submissions subject to penalties
- Extensions rarely granted

## Report Generation Process

### Step 1: Pre-Generation Validation

**Before Generating Report:**

1. **Verify All Cases Resolved**
   - Go to Case Review screen
   - Ensure no "Open" or "In Progress" cases remain
   - All accounts must have final classification

2. **Check Data Completeness**
   - Go to Business Enrichment Portal
   - Verify all U.S. reportable accounts 100% complete
   - All required fields populated
   - Documentation uploaded

3. **Validate Classification Results**
   - Review classification summary
   - Verify U.S. reportable count reasonable
   - Check for obvious errors (e.g., all accounts reportable)

### Step 2: Generate Report

1. Click **"Generate Report"** button (top-right)
2. Report configuration modal opens

**Configuration Options:**

**Report Type:** Select **FATCA**

**Reporting Year:** Select year (e.g., 2025)
- System automatically includes accounts from January 1 - December 31

**Report Name:** Enter descriptive name
- Example: "FATCA 2025 Annual Report - Ahli Bank"

**Include Accounts:**
- ☑ U.S. Reportable Accounts (required)
- ☐ Nil Reports (accounts closed during year)
- ☐ Corrected Reports (amendments to previous submissions)

**Financial Institution Information:**
- GIIN (Global Intermediary Identification Number)
- Legal Name
- Country of Residence
- Address
- Contact Person
- Contact Email
- Contact Phone

**Pre-filled from:** `organizations` table and FATCA configuration

3. Click **"Generate"**

### Step 3: Report Generation Progress

**System Processing:**
- Extracts all U.S. reportable accounts
- Validates required fields present
- Formats data per IRS XML schema
- Generates Form 8966 XML file
- Performs schema validation
- Creates report batch record

**Progress Indicators:**
- Accounts processed count
- Validation status
- Estimated time remaining

**Generation Time:**
- Small reports (< 100 accounts): 1-2 minutes
- Medium reports (100-1,000 accounts): 2-5 minutes
- Large reports (> 1,000 accounts): 5-15 minutes

### Step 4: Review Report Summary

**Report Summary Shows:**

**Report Metadata:**
- Report Batch ID
- Generation Date
- Reporting Year
- Generated By (your name)
- Report Status

**Account Statistics:**
- Total Reportable Accounts
- Individual Accounts Count
- Entity Accounts Count
- Total Account Balance (aggregate)
- Total Interest Paid
- Total Dividends Paid

**Validation Results:**
- ✓ Schema Validation Passed
- ✓ All Required Fields Present
- ✓ TIN Formats Valid
- ✓ Country Codes Valid
- ✓ Numeric Fields Valid
- ⚠ Warnings (if any)

### Step 5: Download Report Files

**Available Downloads:**

1. **XML Report File (Form 8966)**
   - IRS-compliant XML format
   - Ready for IDES portal submission
   - Filename: `FATCA_Report_2025_[GIIN]_[Date].xml`

2. **Excel Summary Report**
   - Human-readable account listing
   - All reportable accounts with details
   - Summary statistics
   - For internal review and audit

3. **Validation Report**
   - Validation results details
   - Any warnings or issues
   - Recommendations for corrections

**Download Process:**
1. Click **"Download XML"** button
2. Save file to secure location
3. Download Excel and Validation reports for records

## Report Table Interface

### Report Batches Table

**Displays all generated reports:**

| Column | Description | Source |
|--------|-------------|--------|
| **Batch ID** | Unique report identifier | `fatca_crs_report_batch.id` |
| **Report Name** | Name you provided | `fatca_crs_report_batch.report_name` |
| **Reporting Year** | Year covered | `fatca_crs_report_batch.reporting_year` |
| **Account Count** | Reportable accounts | `fatca_crs_report_batch.total_accounts` |
| **Total Balance** | Aggregate balance | `fatca_crs_report_batch.total_balance` |
| **Status** | Report status | `fatca_crs_report_batch.status` |
| **Generated Date** | Creation date | `fatca_crs_report_batch.created_at` |
| **Generated By** | User who generated | `fatca_crs_report_batch.generated_by` |

### Report Status Values

- **Generated** - Report created, ready for review
- **Validated** - Passed all validation checks
- **Downloaded** - XML file downloaded
- **Submitted** - Submitted to IRS IDES (tracked in Submission Log)
- **Accepted** - IRS accepted submission
- **Rejected** - IRS rejected submission (requires correction)

## Submitting to IRS IDES Portal

### IDES Portal Access

**Portal URL:** https://www.irs.gov/ides

**Prerequisites:**
- Valid GIIN (Global Intermediary Identification Number)
- IDES portal account credentials
- Digital certificate for secure transmission
- Authorized signatory access

### Submission Process

**Outside ComplianceHub (IRS Portal):**

1. Log in to IRS IDES portal
2. Navigate to "Upload File"
3. Select your downloaded XML file
4. Upload file
5. IRS validates file (may take 24-48 hours)
6. Receive acceptance or rejection notification
7. Download IRS receipt/acknowledgment

**Back in ComplianceHub:**

1. Go to **Submission Log** screen
2. Click **"Record Submission"**
3. Enter submission details:
   - Report Batch ID
   - Submission Date
   - IRS Receipt Number
   - Submission Status
4. Upload IRS acknowledgment file
5. Save submission record

## Corrected Reports (Amendments)

### When Corrections Are Needed

**Common Scenarios:**
- Discovered missing accounts after submission
- Found errors in reported data
- Received updated information from customers
- IRS rejected original submission

### Generating Corrected Report

1. Click **"Generate Report"** button
2. Select **"Corrected Report"** option
3. Select original report batch to correct
4. Choose correction type:
   - **Add Accounts** - Include previously omitted accounts
   - **Modify Data** - Correct errors in reported data
   - **Remove Accounts** - Exclude incorrectly reported accounts
5. Make necessary data corrections in source tables
6. Generate corrected report
7. XML file includes correction indicators per IRS requirements

## Database Tables Reference

### Primary Table: `fatca_crs_report_batch`

**Key Fields:**
- `id` - Unique report batch identifier
- `organization_id` - Your organization
- `regime` - FATCA or CRS
- `report_name` - Report name
- `reporting_year` - Year covered
- `total_accounts` - Reportable accounts count
- `total_balance` - Aggregate balance
- `xml_file_path` - Generated XML file location
- `status` - Report status
- `generated_by` - User who generated
- `created_at` - Generation timestamp

### Report Details Table: `fatca_crs_report_details`

**Contains individual account records in report:**
- `report_batch_id` - Links to report batch
- `account_number` - Account identifier
- `customer_name` - Account holder
- `us_tin` - U.S. TIN
- `account_balance` - Balance reported
- `interest_paid` - Interest amount
- All other reportable fields

## Audit Trail & Year-End Certification

### Audit Summary Card

**Displays compliance audit information:**
- Total reports generated this year
- Total accounts reported
- Submission status summary
- Outstanding issues count
- Compliance score

### Year-End Certification

**Before March 31 Deadline:**

1. Review **Year-End Certification Card**
2. Verify checklist items:
   - ☑ All datasets uploaded and validated
   - ☑ All rules configured and tested
   - ☑ All cases reviewed and resolved
   - ☑ All data enrichment completed
   - ☑ Reports generated and validated
   - ☑ Reports submitted to IRS
   - ☑ IRS acknowledgments received
   - ☑ Audit documentation complete
3. Click **"Certify Compliance"**
4. Enter certification statement
5. System records certification with timestamp

## Dataset Export Panel

### Exporting Data for External Use

**Export Options:**

1. **Classified Accounts Export**
   - All accounts with final classifications
   - Includes matched rules and decisions
   - Format: CSV or Excel

2. **Reportable Accounts Export**
   - Only U.S. reportable accounts
   - All required IRS fields
   - Format: CSV or Excel

3. **Audit Trail Export**
   - Complete activity log
   - All user actions and decisions
   - Format: CSV or PDF

4. **Documentation Package**
   - All uploaded documents
   - Organized by account
   - Format: ZIP file

**Export Process:**
1. Select export type
2. Choose date range (if applicable)
3. Select format
4. Click **"Export"**
5. Download generated file

## Next Steps After Report Generation

1. **Review Report Summary** - Verify statistics reasonable
2. **Download All Files** - XML, Excel, Validation reports
3. **Internal Review** - Compliance officer approval
4. **Submit to IRS** - Upload XML to IDES portal
5. **Record Submission** - Log in Submission Log screen
6. **Monitor IRS Response** - Check for acceptance/rejection
7. **Archive Records** - Store all files securely for 6 years

## Tips & Best Practices

✓ **Generate Early:** Don''t wait until March 30 to generate report
✓ **Review Thoroughly:** Check Excel summary before submitting XML
✓ **Validate Multiple Times:** Run validation checks repeatedly
✓ **Test IDES Portal:** Test upload process with small file first
✓ **Keep Backups:** Maintain copies of all generated reports
✓ **Document Everything:** Save all validation and submission receipts
✓ **Plan for Corrections:** Allow time for amendments if needed
✓ **Coordinate with IT:** Ensure IDES portal access working

## Common Issues

**Issue:** XML validation fails
**Solution:** Check IRS schema version, verify all required fields present

**Issue:** IDES portal rejects file
**Solution:** Review IRS error message, correct specific issues, regenerate report

**Issue:** Account count seems wrong
**Solution:** Verify classification results, check for duplicate accounts

**Issue:** Missing accounts in report
**Solution:** Check account classification status, verify not filtered out

**Issue:** Cannot download XML file
**Solution:** Check browser settings, try different browser, contact system admin',
    'FATCA',
    ARRAY['Reporting', 'Portal Guide', 'IRS Submission', 'Form 8966'],
    5,
    true,
    'published'
  );

  -- Resource 6: Submission Log Guide
  INSERT INTO public.resources_content (
    organization_id, section_id, title, icon, content_type, content, 
    category, tags, display_order, is_active, status
  ) VALUES (
    NULL,
    'fatca-submission-log',
    'Submission Log - Track IRS Submissions',
    'Send',
    'markdown',
    E'# Submission Log - Track IRS Submissions

## Overview

The **Submission Log** screen tracks all FATCA report submissions to the IRS IDES portal from the `fatca_crs_submission_log` table. Use this screen to monitor submission status, record IRS responses, and maintain compliance audit trail.

## Navigation Path

**Dashboard → Reporting → Submission Log**

## Understanding Submission Tracking

### Why Track Submissions?

**Compliance Requirements:**
- Maintain complete audit trail of all IRS submissions
- Track submission dates and deadlines
- Record IRS acceptance/rejection status
- Document corrective actions taken
- Demonstrate due diligence for regulatory audits

**Operational Benefits:**
- Monitor submission pipeline
- Identify submission issues early
- Track resubmission attempts
- Coordinate with multiple users
- Generate compliance reports

## Submission Log Interface

### Submission Statistics Panel

**Top Dashboard Shows:**

**This Year Statistics:**
- Total Submissions (count)
- Accepted Submissions (count and %)
- Pending Submissions (awaiting IRS response)
- Rejected Submissions (requiring correction)
- On-Time Submissions (before March 31)
- Late Submissions (after deadline)

**Trend Chart:**
- Submission volume by month
- Acceptance rate over time
- Average IRS response time

### Submissions Grid

**Table Columns:**

| Column | Description | Source Table |
|--------|-------------|-------------|
| **Submission ID** | Unique submission identifier | `fatca_crs_submission_log.id` |
| **Report Batch** | Related report name | `fatca_crs_report_batch.report_name` |
| **Reporting Year** | Year covered | `fatca_crs_submission_log.reporting_year` |
| **Submission Date** | When submitted to IRS | `fatca_crs_submission_log.submission_date` |
| **Account Count** | Accounts in submission | `fatca_crs_submission_log.account_count` |
| **Status** | Current submission status | `fatca_crs_submission_log.status` |
| **IRS Receipt #** | IRS acknowledgment number | `fatca_crs_submission_log.irs_receipt_number` |
| **Response Date** | IRS response date | `fatca_crs_submission_log.irs_response_date` |
| **Submitted By** | User who submitted | `fatca_crs_submission_log.submitted_by` |

### Submission Status Values

- **Pending** - Submitted to IRS, awaiting response
- **Accepted** - IRS accepted submission, compliance complete
- **Rejected** - IRS rejected submission, correction required
- **Resubmitted** - Corrected version submitted
- **Withdrawn** - Submission withdrawn by institution

## Recording a New Submission

### Step 1: Submit Report to IRS IDES Portal

**Outside ComplianceHub:**
1. Log in to IRS IDES portal (https://www.irs.gov/ides)
2. Upload your XML file (generated from Reporting Module)
3. Submit file to IRS
4. Download IRS receipt/acknowledgment
5. Note IRS receipt number

### Step 2: Record Submission in ComplianceHub

1. Click **"Record Submission"** button (top-right)
2. Submission details modal opens

**Required Information:**

**Report Selection:**
- Select report batch from dropdown
- Shows reports with status "Generated" or "Validated"

**Submission Details:**
- **Submission Date:** Date submitted to IRS (YYYY-MM-DD)
- **Submission Time:** Time submitted (HH:MM)
- **IRS Receipt Number:** Receipt number from IRS acknowledgment
- **Submission Method:** IDES Portal (default)
- **Submitted By:** Auto-filled with your name

**File Attachments:**
- Upload IRS receipt/acknowledgment file (PDF)
- Upload submission confirmation email (optional)

**Notes:**
- Add any relevant notes about submission
- Document any issues encountered
- Record contact with IRS (if any)

3. Click **"Save Submission"**

### Step 3: System Updates

**Automatic Updates:**
- New record created in `fatca_crs_submission_log` table
- Report batch status updated to "Submitted"
- Submission date recorded
- Status set to "Pending"
- Notification sent to compliance team

## Updating Submission Status

### When IRS Responds

**IRS typically responds within 24-48 hours**

### Recording IRS Acceptance

1. Click **"View Details"** on submission row
2. Submission details panel opens
3. Click **"Update Status"** button
4. Select **"Accepted"** from status dropdown
5. Enter IRS response details:
   - **Response Date:** Date of IRS response
   - **IRS Confirmation Number:** Final confirmation number
   - **Response Message:** IRS acceptance message
6. Upload IRS acceptance notification (PDF)
7. Click **"Save Update"**

**System Updates:**
- Submission status → "Accepted"
- Report batch status → "Accepted"
- Compliance dashboard updated
- Notification sent to compliance team
- Audit trail logged

### Recording IRS Rejection

1. Click **"View Details"** on submission row
2. Click **"Update Status"** button
3. Select **"Rejected"** from status dropdown
4. Enter rejection details:
   - **Response Date:** Date of IRS rejection
   - **Rejection Reason:** IRS error message/code
   - **Error Details:** Detailed error description
   - **Affected Accounts:** Account numbers with errors (if specified)
5. Upload IRS rejection notification (PDF)
6. Click **"Save Update"**

**System Actions:**
- Submission status → "Rejected"
- Alert created for compliance team
- Affected accounts flagged for correction
- Corrective action workflow initiated

## Handling Rejected Submissions

### Step 1: Analyze Rejection Reason

**Common IRS Rejection Reasons:**

**Schema Validation Errors:**
- XML format incorrect
- Missing required fields
- Invalid data formats
- Incorrect IRS schema version

**Data Validation Errors:**
- Invalid TIN format
- Invalid country codes
- Incorrect GIIN
- Duplicate account submissions

**Business Rule Errors:**
- Accounts don''t meet reporting thresholds
- Incorrect account classifications
- Missing documentation references

### Step 2: Correct Errors

**Based on rejection reason:**

1. **Go to relevant screen:**
   - Data errors → Dataset Management or Business Enrichment
   - Classification errors → Case Review
   - Rule errors → Rule Management

2. **Fix identified issues:**
   - Update incorrect data
   - Complete missing fields
   - Reclassify accounts if needed
   - Update documentation

3. **Generate corrected report:**
   - Go to Reporting Module
   - Generate new report (or corrected report)
   - Validate thoroughly before resubmission

### Step 3: Resubmit to IRS

1. Submit corrected XML to IRS IDES portal
2. Obtain new IRS receipt
3. Record resubmission in Submission Log:
   - Click **"Record Resubmission"** on original submission
   - Enter new submission details
   - Link to original rejected submission
   - Add notes explaining corrections made

**System Links:**
- Original submission marked as "Superseded"
- New submission linked to original
- Audit trail maintains complete history

## Viewing Submission Details

### Submission Details Modal

**Click "View Details" to see:**

**Submission Information:**
- Submission ID and date
- Report batch details
- Reporting year
- Account count and total balance
- Submission method
- Submitted by user

**IRS Response Information:**
- IRS receipt number
- Response date
- Response status (Accepted/Rejected)
- IRS confirmation/error messages
- Response time (hours from submission to response)

**File Attachments:**
- Original XML file submitted
- IRS receipt/acknowledgment
- IRS response notification
- Any correspondence with IRS

**Activity Timeline:**
- Submission recorded
- Status updates
- User actions
- System notifications
- Resubmission links (if applicable)

**Related Records:**
- Link to report batch
- Link to dataset batch
- Link to affected accounts
- Link to corrected submissions (if applicable)

## Filtering and Searching

### Filter Options

**Status Filter:**
- Pending
- Accepted
- Rejected
- Resubmitted

**Year Filter:**
- Select reporting year
- View historical submissions

**Date Range Filter:**
- Submission date range
- Response date range

**Submitted By Filter:**
- Filter by user
- View your submissions only

### Search Functionality

**Search by:**
- Submission ID
- IRS receipt number
- Report batch name
- Reporting year

## Database Tables Reference

### Primary Table: `fatca_crs_submission_log`

**Key Fields:**
- `id` - Unique submission identifier
- `organization_id` - Your organization
- `regime` - FATCA or CRS
- `report_batch_id` - Links to report batch
- `reporting_year` - Year covered
- `submission_date` - When submitted to IRS
- `account_count` - Accounts in submission
- `status` - Current status
- `irs_receipt_number` - IRS receipt number
- `irs_response_date` - IRS response date
- `irs_response_message` - IRS response text
- `submitted_by` - User who submitted
- `created_at` - Record creation timestamp

### Related Table: `fatca_crs_submission_files`

**Stores submission attachments:**
- `submission_id` - Links to submission
- `file_type` - Type of file (XML, Receipt, Response)
- `file_path` - Storage location
- `uploaded_by` - User who uploaded
- `upload_date` - Upload timestamp

## Compliance Reporting

### Generating Compliance Reports

**Available Reports:**

1. **Annual Submission Summary**
   - All submissions for selected year
   - Acceptance/rejection statistics
   - Timeline compliance (on-time vs late)
   - Format: PDF or Excel

2. **Audit Trail Report**
   - Complete submission history
   - All status changes
   - User actions
   - IRS correspondence
   - Format: PDF

3. **Rejection Analysis Report**
   - All rejected submissions
   - Rejection reasons analysis
   - Corrective actions taken
   - Resubmission outcomes
   - Format: Excel

**Generate Report:**
1. Click **"Generate Report"** button
2. Select report type
3. Choose date range
4. Select format
5. Click **"Generate"**
6. Download report file

## Tips & Best Practices

✓ **Record Immediately:** Log submissions as soon as submitted to IRS
✓ **Monitor Daily:** Check for IRS responses daily during submission period
✓ **Update Promptly:** Record IRS responses immediately upon receipt
✓ **Attach Everything:** Upload all IRS correspondence for audit trail
✓ **Document Corrections:** Clearly document what was fixed in resubmissions
✓ **Track Deadlines:** Monitor March 31 deadline closely
✓ **Maintain History:** Never delete submission records
✓ **Generate Reports:** Create compliance reports for management review

## Common Issues

**Issue:** IRS receipt number not provided
**Solution:** Check IDES portal for receipt, contact IRS if not received within 24 hours

**Issue:** Cannot find submission in IDES portal
**Solution:** Verify GIIN correct, check submission date, contact IRS support

**Issue:** IRS response delayed beyond 48 hours
**Solution:** Check IDES portal status, contact IRS IDES support line

**Issue:** Duplicate submission recorded
**Solution:** Mark duplicate as "Withdrawn", keep only correct submission active

## Next Steps After Submission

1. **Monitor IRS Response** - Check IDES portal daily
2. **Update Status** - Record acceptance/rejection promptly
3. **Handle Rejections** - Correct errors and resubmit immediately
4. **Archive Records** - Store all files securely for 6 years
5. **Generate Compliance Report** - Document successful submission
6. **Year-End Certification** - Complete certification in Reporting Module
7. **Prepare for Next Year** - Review process for improvements',
    'FATCA',
    ARRAY['Submission Log', 'Portal Guide', 'IRS Tracking', 'Compliance'],
    6,
    true,
    'published'
  );

END $$;