-- FATCA/CRS Multi-Regime Reporting System Migration
-- Created: 2026-02-22
-- Purpose: Transform FATCA-only system into unified FATCA/CRS multi-regime platform

-- ============================================================================
-- SECTION 1: NEW CUSTOM TYPES
-- ============================================================================

DROP TYPE IF EXISTS public.regime_type CASCADE;
CREATE TYPE public.regime_type AS ENUM ('FATCA', 'CRS');

DROP TYPE IF EXISTS public.xml_schema_type CASCADE;
CREATE TYPE public.xml_schema_type AS ENUM ('IRS', 'OECD');

DROP TYPE IF EXISTS public.assignment_team CASCADE;
CREATE TYPE public.assignment_team AS ENUM ('Retail', 'Corporate', 'Special');

DROP TYPE IF EXISTS public.dataset_batch_status CASCADE;
CREATE TYPE public.dataset_batch_status AS ENUM ('Generated', 'Under Review', 'Locked', 'Reported');

DROP TYPE IF EXISTS public.case_status CASCADE;
CREATE TYPE public.case_status AS ENUM ('Incomplete', 'Under Enrichment', 'Ready for Review', 'Approved', 'Rejected');

DROP TYPE IF EXISTS public.completeness_status CASCADE;
CREATE TYPE public.completeness_status AS ENUM ('Complete', 'Missing TIN', 'Missing Tax Residency', 'Missing Classification', 'Multiple Issues');

DROP TYPE IF EXISTS public.submission_status CASCADE;
CREATE TYPE public.submission_status AS ENUM ('Pending', 'Submitted', 'Acknowledged', 'Error', 'Rejected');

-- ============================================================================
-- SECTION 2: REFERENCE TABLES
-- ============================================================================

-- Business segments table (Conventional / Islamic)
CREATE TABLE IF NOT EXISTS public.business_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    segment_name TEXT NOT NULL,
    segment_code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_segment_per_org UNIQUE (organization_id, segment_code)
);

-- Reporting regimes table (FATCA / CRS)
CREATE TABLE IF NOT EXISTS public.reporting_regimes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regime_type public.regime_type NOT NULL,
    regime_name TEXT NOT NULL,
    description TEXT,
    regulatory_authority TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_regime_type UNIQUE (regime_type)
);

-- Insert default regimes
INSERT INTO public.reporting_regimes (regime_type, regime_name, description, regulatory_authority)
VALUES 
    ('FATCA', 'Foreign Account Tax Compliance Act', 'US tax law requiring foreign financial institutions to report US account holders', 'Internal Revenue Service (IRS)'),
    ('CRS', 'Common Reporting Standard', 'OECD standard for automatic exchange of financial account information', 'OECD')
ON CONFLICT (regime_type) DO NOTHING;

-- User segment roles table (for segment isolation)
CREATE TABLE IF NOT EXISTS public.user_segment_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES public.business_segments(id) ON DELETE CASCADE,
    assignment_team public.assignment_team,
    can_enrich_data BOOLEAN DEFAULT false,
    can_review_cases BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_segment UNIQUE (user_id, segment_id)
);

-- ============================================================================
-- SECTION 3: REGIME-AWARE RULE ENGINE TABLES
-- ============================================================================

-- FATCA/CRS rule sets table (replaces rule_master for regime-aware rules)
CREATE TABLE IF NOT EXISTS public.fatca_crs_rule_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES public.business_segments(id) ON DELETE CASCADE,
    regime_type public.regime_type NOT NULL,
    reporting_year INTEGER NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    rule_name TEXT NOT NULL,
    description TEXT,
    status public.rule_status DEFAULT 'draft'::public.rule_status,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_on TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_rule_per_regime_year UNIQUE (organization_id, segment_id, regime_type, reporting_year, rule_name),
    CONSTRAINT rule_separation_of_duties CHECK (created_by != approved_by OR approved_by IS NULL)
);

-- FATCA/CRS rule conditions table
CREATE TABLE IF NOT EXISTS public.fatca_crs_rule_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id UUID NOT NULL REFERENCES public.fatca_crs_rule_sets(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    operator TEXT NOT NULL,
    value TEXT NOT NULL,
    logical_group INTEGER DEFAULT 1,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_operator CHECK (operator IN ('equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains', 'in', 'not_in', 'is_null', 'is_not_null'))
);

-- ============================================================================
-- SECTION 4: DWH SOURCE VIEW (Reference Only - Not Created Here)
-- ============================================================================
-- Note: vw_REGULATORY_Source_Customers should be created in DWH
-- Expected columns:
--   - customer_id, customer_name, account_number, account_balance
--   - tax_residency, tin, entity_classification, controlling_persons
--   - segment_id, reporting_year, country_code, etc.

-- ============================================================================
-- SECTION 5: SNAPSHOT DATASET TABLES
-- ============================================================================

-- FATCA/CRS dataset batch table (snapshot of rule execution)
CREATE TABLE IF NOT EXISTS public.fatca_crs_dataset_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id UUID NOT NULL REFERENCES public.fatca_crs_rule_sets(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES public.business_segments(id) ON DELETE CASCADE,
    regime_type public.regime_type NOT NULL,
    reporting_year INTEGER NOT NULL,
    execution_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status public.dataset_batch_status DEFAULT 'Generated'::public.dataset_batch_status,
    total_records INTEGER DEFAULT 0,
    reportable_records INTEGER DEFAULT 0,
    incomplete_records INTEGER DEFAULT 0,
    executed_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    locked_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- FATCA/CRS case master table (individual customer cases)
CREATE TABLE IF NOT EXISTS public.fatca_crs_case_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_batch_id UUID NOT NULL REFERENCES public.fatca_crs_dataset_batch(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL,
    account_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    account_balance DECIMAL(15, 2),
    country_code TEXT,
    completeness_status public.completeness_status DEFAULT 'Complete'::public.completeness_status,
    reportable_flag BOOLEAN DEFAULT false,
    case_status public.case_status DEFAULT 'Incomplete'::public.case_status,
    assigned_team public.assignment_team,
    assigned_user UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_customer_per_batch UNIQUE (dataset_batch_id, customer_id)
);

-- FATCA/CRS case details table (field-level tracking)
CREATE TABLE IF NOT EXISTS public.fatca_crs_case_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.fatca_crs_case_master(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    original_value TEXT,
    updated_value TEXT,
    is_overridden BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_on TIMESTAMPTZ,
    validation_status TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 6: CASE ASSIGNMENT WORKFLOW TABLES
-- ============================================================================

-- FATCA/CRS case assignment table
CREATE TABLE IF NOT EXISTS public.fatca_crs_case_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.fatca_crs_case_master(id) ON DELETE CASCADE,
    assigned_team public.assignment_team NOT NULL,
    assigned_user UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    assigned_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- FATCA/CRS case notes table
CREATE TABLE IF NOT EXISTS public.fatca_crs_case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.fatca_crs_case_master(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    note_type TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 7: REPORTING & SUBMISSION TABLES
-- ============================================================================

-- FATCA/CRS report batch table
CREATE TABLE IF NOT EXISTS public.fatca_crs_report_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_batch_id UUID NOT NULL REFERENCES public.fatca_crs_dataset_batch(id) ON DELETE CASCADE,
    regime_type public.regime_type NOT NULL,
    report_name TEXT NOT NULL,
    initiated_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    approval_status TEXT DEFAULT 'Pending',
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    submission_status public.submission_status DEFAULT 'Pending'::public.submission_status,
    initiated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_separation_of_duties CHECK (initiated_by != approved_by OR approved_by IS NULL)
);

-- FATCA/CRS generated files table
CREATE TABLE IF NOT EXISTS public.fatca_crs_generated_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_batch_id UUID NOT NULL REFERENCES public.fatca_crs_report_batch(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    xml_schema_type public.xml_schema_type NOT NULL,
    file_path TEXT,
    xml_content TEXT,
    file_size_bytes BIGINT,
    validation_status TEXT DEFAULT 'Pending',
    validation_errors JSONB,
    generated_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- FATCA/CRS submission log table
CREATE TABLE IF NOT EXISTS public.fatca_crs_submission_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_batch_id UUID NOT NULL REFERENCES public.fatca_crs_report_batch(id) ON DELETE CASCADE,
    file_id UUID REFERENCES public.fatca_crs_generated_files(id) ON DELETE SET NULL,
    submission_channel TEXT,
    submission_method TEXT,
    response_status public.submission_status NOT NULL,
    response_message TEXT,
    acknowledgment_file TEXT,
    error_details JSONB,
    submitted_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    submitted_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 8: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_business_segments_org ON public.business_segments(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_segment_roles_user ON public.user_segment_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_segment_roles_segment ON public.user_segment_roles(segment_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_rule_sets_org_regime ON public.fatca_crs_rule_sets(organization_id, regime_type);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_rule_sets_segment ON public.fatca_crs_rule_sets(segment_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_dataset_batch_org_regime ON public.fatca_crs_dataset_batch(organization_id, regime_type);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_dataset_batch_segment ON public.fatca_crs_dataset_batch(segment_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_case_master_batch ON public.fatca_crs_case_master(dataset_batch_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_case_master_assigned ON public.fatca_crs_case_master(assigned_team, assigned_user);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_case_master_status ON public.fatca_crs_case_master(case_status);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_case_details_case ON public.fatca_crs_case_details(case_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_case_assignment_case ON public.fatca_crs_case_assignment(case_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_case_assignment_team ON public.fatca_crs_case_assignment(assigned_team);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_report_batch_dataset ON public.fatca_crs_report_batch(dataset_batch_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_report_batch_regime ON public.fatca_crs_report_batch(regime_type);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_generated_files_report ON public.fatca_crs_generated_files(report_batch_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_submission_log_report ON public.fatca_crs_submission_log(report_batch_id);
CREATE INDEX IF NOT EXISTS idx_fatca_crs_submission_log_status ON public.fatca_crs_submission_log(response_status);

-- ============================================================================
-- SECTION 9: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.business_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporting_regimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segment_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_rule_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_dataset_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_case_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_case_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_case_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_report_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_generated_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_crs_submission_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_segments
CREATE POLICY business_segments_org_isolation ON public.business_segments
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

-- RLS Policies for reporting_regimes (read-only for all authenticated users)
CREATE POLICY reporting_regimes_read_all ON public.reporting_regimes
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_segment_roles
CREATE POLICY user_segment_roles_own_access ON public.user_segment_roles
    FOR ALL
    USING (
        user_id = auth.uid() OR
        user_id IN (
            SELECT id FROM public.user_profiles 
            WHERE organization_id IN (
                SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for fatca_crs_rule_sets
CREATE POLICY fatca_crs_rule_sets_org_isolation ON public.fatca_crs_rule_sets
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

-- RLS Policies for fatca_crs_rule_conditions
CREATE POLICY fatca_crs_rule_conditions_access ON public.fatca_crs_rule_conditions
    FOR ALL
    USING (
        rule_set_id IN (
            SELECT id FROM public.fatca_crs_rule_sets
            WHERE organization_id IN (
                SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for fatca_crs_dataset_batch
CREATE POLICY fatca_crs_dataset_batch_org_isolation ON public.fatca_crs_dataset_batch
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

-- RLS Policies for fatca_crs_case_master (segment isolation)
CREATE POLICY fatca_crs_case_master_segment_isolation ON public.fatca_crs_case_master
    FOR ALL
    USING (
        dataset_batch_id IN (
            SELECT id FROM public.fatca_crs_dataset_batch
            WHERE organization_id IN (
                SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
            )
            AND (
                segment_id IN (
                    SELECT segment_id FROM public.user_segment_roles WHERE user_id = auth.uid()
                )
                OR auth.uid() IN (
                    SELECT id FROM public.user_profiles WHERE role_id IN (
                        SELECT id FROM public.roles WHERE role_name IN ('Admin', 'Compliance Officer')
                    )
                )
            )
        )
    );

-- RLS Policies for fatca_crs_case_details
CREATE POLICY fatca_crs_case_details_access ON public.fatca_crs_case_details
    FOR ALL
    USING (
        case_id IN (
            SELECT id FROM public.fatca_crs_case_master
            WHERE dataset_batch_id IN (
                SELECT id FROM public.fatca_crs_dataset_batch
                WHERE organization_id IN (
                    SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for fatca_crs_case_assignment
CREATE POLICY fatca_crs_case_assignment_access ON public.fatca_crs_case_assignment
    FOR ALL
    USING (
        case_id IN (
            SELECT id FROM public.fatca_crs_case_master
            WHERE dataset_batch_id IN (
                SELECT id FROM public.fatca_crs_dataset_batch
                WHERE organization_id IN (
                    SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for fatca_crs_case_notes
CREATE POLICY fatca_crs_case_notes_access ON public.fatca_crs_case_notes
    FOR ALL
    USING (
        case_id IN (
            SELECT id FROM public.fatca_crs_case_master
            WHERE dataset_batch_id IN (
                SELECT id FROM public.fatca_crs_dataset_batch
                WHERE organization_id IN (
                    SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for fatca_crs_report_batch
CREATE POLICY fatca_crs_report_batch_org_isolation ON public.fatca_crs_report_batch
    FOR ALL
    USING (
        dataset_batch_id IN (
            SELECT id FROM public.fatca_crs_dataset_batch
            WHERE organization_id IN (
                SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for fatca_crs_generated_files
CREATE POLICY fatca_crs_generated_files_access ON public.fatca_crs_generated_files
    FOR ALL
    USING (
        report_batch_id IN (
            SELECT id FROM public.fatca_crs_report_batch
            WHERE dataset_batch_id IN (
                SELECT id FROM public.fatca_crs_dataset_batch
                WHERE organization_id IN (
                    SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for fatca_crs_submission_log
CREATE POLICY fatca_crs_submission_log_access ON public.fatca_crs_submission_log
    FOR ALL
    USING (
        report_batch_id IN (
            SELECT id FROM public.fatca_crs_report_batch
            WHERE dataset_batch_id IN (
                SELECT id FROM public.fatca_crs_dataset_batch
                WHERE organization_id IN (
                    SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
                )
            )
        )
    );

-- ============================================================================
-- SECTION 10: AUDIT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_business_segments_updated_at BEFORE UPDATE ON public.business_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fatca_crs_rule_sets_updated_at BEFORE UPDATE ON public.fatca_crs_rule_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fatca_crs_dataset_batch_updated_at BEFORE UPDATE ON public.fatca_crs_dataset_batch
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fatca_crs_case_master_updated_at BEFORE UPDATE ON public.fatca_crs_case_master
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================