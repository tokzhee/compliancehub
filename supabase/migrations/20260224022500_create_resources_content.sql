-- Create resources_content table for configurable FATCA/CRS compliance guides
CREATE TABLE IF NOT EXISTS public.resources_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'FileText',
  content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'html')),
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resources_content_org_id ON public.resources_content(organization_id);
CREATE INDEX IF NOT EXISTS idx_resources_content_section_id ON public.resources_content(section_id);
CREATE INDEX IF NOT EXISTS idx_resources_content_display_order ON public.resources_content(display_order);

-- Enable RLS
ALTER TABLE public.resources_content ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view resources (no permission restrictions)
DROP POLICY IF EXISTS "authenticated_users_can_view_resources" ON public.resources_content;
CREATE POLICY "authenticated_users_can_view_resources"
ON public.resources_content
FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS Policy: System administrators can manage resources
DROP POLICY IF EXISTS "admins_can_manage_resources" ON public.resources_content;
CREATE POLICY "admins_can_manage_resources"
ON public.resources_content
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND r.role_name = 'System Administrator'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND r.role_name = 'System Administrator'
  )
);

-- Insert sample resources content for FATCA and CRS
DO $$
DECLARE
  ahlibank_org_id UUID;
BEGIN
  -- Get Ahli Bank organization ID
  SELECT id INTO ahlibank_org_id FROM public.organizations WHERE name = 'Ahli Bank' LIMIT 1;
  
  IF ahlibank_org_id IS NOT NULL THEN
    -- FATCA Rendition Process
    INSERT INTO public.resources_content (organization_id, section_id, title, icon, content_type, content, display_order, is_active)
    VALUES (
      ahlibank_org_id,
      'fatca-process',
      'FATCA Rendition Process',
      'FileText',
      'markdown',
      E'# FATCA Rendition Process\n\nThe Foreign Account Tax Compliance Act (FATCA) requires financial institutions to report information about financial accounts held by U.S. taxpayers or foreign entities with substantial U.S. ownership.\n\n## Step 1: Data Collection & Validation\n\nGather customer account information including account balances, income payments, and U.S. indicia.\n\n**Key Actions:**\n- Collect account holder identification (name, address, TIN)\n- Verify U.S. person status through documentation\n- Record account balances as of December 31st\n- Document all income payments (interest, dividends, etc.)\n- Validate data completeness and accuracy\n\n## Step 2: Customer Classification\n\nClassify accounts based on FATCA status and documentation requirements.\n\n**Key Actions:**\n- Identify U.S. persons and specified U.S. persons\n- Classify entities (Active NFFE, Passive NFFE, FFI)\n- Review self-certification forms (W-8, W-9)\n- Apply due diligence procedures\n- Document classification decisions\n\n## Step 3: Data Enrichment\n\nComplete missing information and resolve data quality issues using the Business Enrichment Portal.\n\n**Key Actions:**\n- Access Business Enrichment Portal\n- Review flagged accounts with incomplete data\n- Add missing TINs, addresses, or documentation\n- Resolve U.S. indicia discrepancies\n- Submit enriched data for validation\n\n## Step 4: Rule Application & Case Review\n\nApply compliance rules and review flagged cases for accuracy.\n\n**Key Actions:**\n- Execute FATCA classification rules\n- Review cases flagged by automated rules\n- Investigate high-risk accounts\n- Document review decisions and rationale\n- Approve or override system recommendations\n\n## Step 5: Report Generation\n\nGenerate FATCA XML reports in IRS-compliant format.\n\n**Key Actions:**\n- Navigate to Reporting Module\n- Select FATCA report type\n- Choose reporting year\n- Generate XML file (IRS Form 8966 format)\n- Download and review generated report\n\n## Step 6: IRS Submission\n\nSubmit FATCA reports to the IRS through the IDES portal.\n\n**Key Actions:**\n- Access IRS International Data Exchange Service (IDES)\n- Upload generated XML file\n- Validate file format and schema\n- Submit report by March 31st deadline\n- Retain submission confirmation and metadata',
      1,
      true
    ) ON CONFLICT (id) DO NOTHING;

    -- CRS Rendition Process
    INSERT INTO public.resources_content (organization_id, section_id, title, icon, content_type, content, display_order, is_active)
    VALUES (
      ahlibank_org_id,
      'crs-process',
      'CRS Rendition Process',
      'Globe',
      'markdown',
      E'# CRS Rendition Process\n\nThe Common Reporting Standard (CRS) is an OECD framework for automatic exchange of financial account information between tax authorities worldwide.\n\n## Step 1: Account Identification\n\nIdentify reportable accounts based on account holder residence and entity type.\n\n**Key Actions:**\n- Collect account holder tax residence information\n- Obtain self-certification forms\n- Identify controlling persons for entities\n- Verify Tax Identification Numbers (TINs)\n- Document residence determination process\n\n## Step 2: Due Diligence Procedures\n\nApply CRS due diligence procedures for individual and entity accounts.\n\n**Key Actions:**\n- Perform electronic record search\n- Review paper record search (if applicable)\n- Identify reportable jurisdictions\n- Apply aggregation rules for related accounts\n- Document due diligence findings\n\n## Step 3: Data Compilation\n\nCompile required reporting elements for each reportable account.\n\n**Key Actions:**\n- Record account balance as of December 31st\n- Calculate total gross amounts paid\n- Document account holder details\n- Identify controlling persons (for entities)\n- Validate data against CRS schema requirements\n\n## Step 4: Quality Assurance\n\nPerform quality checks and resolve data issues before reporting.\n\n**Key Actions:**\n- Run data validation rules\n- Review flagged accounts in Case Review\n- Correct data quality issues\n- Verify TIN formats for each jurisdiction\n- Ensure completeness of mandatory fields\n\n## Step 5: CRS XML Generation\n\nGenerate CRS XML reports compliant with OECD schema.\n\n**Key Actions:**\n- Access Reporting Module\n- Select CRS report type\n- Choose reporting year and jurisdictions\n- Generate XML file (CRS v2.0 schema)\n- Validate XML against OECD schema\n\n## Step 6: Submission to Tax Authority\n\nSubmit CRS reports to local tax authority by deadline.\n\n**Key Actions:**\n- Access local tax authority portal\n- Upload CRS XML file\n- Complete submission metadata\n- Submit by jurisdiction-specific deadline\n- Retain acknowledgment and submission records',
      2,
      true
    ) ON CONFLICT (id) DO NOTHING;

    -- Portal Usage Guide
    INSERT INTO public.resources_content (organization_id, section_id, title, icon, content_type, content, display_order, is_active)
    VALUES (
      ahlibank_org_id,
      'portal-guide',
      'Portal Usage Guide',
      'Monitor',
      'markdown',
      E'# Portal Usage Guide\n\nComplianceHub provides an integrated platform for managing FATCA and CRS compliance workflows from data upload to report submission.\n\n## Dashboard Overview\n\nMonitor compliance status, pending tasks, and key metrics.\n\n**Features:**\n- View total datasets, cases, and submissions\n- Track pending approvals and overdue tasks\n- Monitor compliance status indicators\n- Access quick action buttons for common tasks\n\n## Dataset Management\n\nUpload, validate, and manage customer data files.\n\n**How to Use:**\n- Click "Upload Dataset" to import CSV/Excel files\n- Review validation results and error reports\n- Preview customer records before processing\n- Track dataset processing status\n\n## Rule Management\n\nConfigure and manage compliance classification rules.\n\n**How to Use:**\n- Create custom rules for FATCA/CRS classification\n- Define conditions using logical operators\n- Test rules with simulation mode\n- Activate approved rules for production use\n\n## Business Enrichment Portal\n\nComplete missing data and resolve data quality issues.\n\n**How to Use:**\n- Access flagged accounts requiring enrichment\n- Add missing TINs, addresses, or documentation\n- Upload supporting documents\n- Submit enriched data for revalidation\n\n## Case Review\n\nReview and approve flagged accounts before reporting.\n\n**How to Use:**\n- Filter cases by status, regime, or priority\n- Review account details and system recommendations\n- Add comments and supporting documentation\n- Approve, reject, or override system decisions\n\n## Reporting Module\n\nGenerate and download compliance reports.\n\n**How to Use:**\n- Select report type (FATCA or CRS)\n- Choose reporting year and parameters\n- Generate XML files in regulatory format\n- Download reports for submission\n- Track submission status and history',
      3,
      true
    ) ON CONFLICT (id) DO NOTHING;

    -- FAQ Section
    INSERT INTO public.resources_content (organization_id, section_id, title, icon, content_type, content, display_order, is_active)
    VALUES (
      ahlibank_org_id,
      'faq',
      'Frequently Asked Questions',
      'HelpCircle',
      'markdown',
      E'# Frequently Asked Questions\n\n## General Questions\n\n### What is FATCA?\nFATCA (Foreign Account Tax Compliance Act) is a U.S. law requiring foreign financial institutions to report information about financial accounts held by U.S. taxpayers.\n\n### What is CRS?\nCRS (Common Reporting Standard) is an OECD framework for automatic exchange of financial account information between tax authorities worldwide.\n\n### What is the reporting deadline?\n- **FATCA**: March 31st annually\n- **CRS**: Varies by jurisdiction (typically June 30th or September 30th)\n\n## Technical Questions\n\n### How do I upload customer data?\nNavigate to Dataset Management → Click "Upload Dataset" → Select CSV/Excel file → Review validation results.\n\n### What file formats are supported?\nThe portal supports CSV and Excel (.xlsx) formats for data uploads.\n\n### How do I resolve data quality issues?\nUse the Business Enrichment Portal to add missing information, correct errors, and upload supporting documentation.\n\n### Can I test rules before activating them?\nYes, use the Rule Simulation feature to test rules against sample data before activating them for production use.\n\n## Compliance Questions\n\n### What happens if I miss the deadline?\nLate submissions may result in penalties from regulatory authorities. Contact your compliance officer immediately.\n\n### How long should I retain records?\nRetain all compliance records for at least 6 years as required by regulatory authorities.\n\n### Who can access the portal?\nAccess is role-based. Contact your System Administrator to request appropriate permissions.',
      4,
      true
    ) ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Sample resources content inserted successfully for organization: %', ahlibank_org_id;
  ELSE
    RAISE NOTICE 'Organization not found. Please ensure organizations table has data.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to insert sample resources content: %', SQLERRM;
END $$;