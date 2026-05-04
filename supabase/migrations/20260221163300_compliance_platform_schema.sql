-- Multi-Tenant Regulatory Compliance Platform Schema
-- Created: 2026-02-21
-- Purpose: Complete database schema for FATCA compliance management

-- ============================================================================
-- SECTION 1: CUSTOM TYPES
-- ============================================================================

DROP TYPE IF EXISTS public.user_status CASCADE;
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');

DROP TYPE IF EXISTS public.organization_status CASCADE;
CREATE TYPE public.organization_status AS ENUM ('active', 'inactive', 'trial');

DROP TYPE IF EXISTS public.review_status CASCADE;
CREATE TYPE public.review_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'escalated');

DROP TYPE IF EXISTS public.rule_status CASCADE;
CREATE TYPE public.rule_status AS ENUM ('draft', 'pending_approval', 'active', 'inactive', 'archived');

DROP TYPE IF EXISTS public.job_status CASCADE;
CREATE TYPE public.job_status AS ENUM ('pending', 'running', 'completed', 'failed');

DROP TYPE IF EXISTS public.year_status CASCADE;
CREATE TYPE public.year_status AS ENUM ('open', 'closed', 'archived');

DROP TYPE IF EXISTS public.override_status CASCADE;
CREATE TYPE public.override_status AS ENUM ('pending', 'approved', 'rejected');

DROP TYPE IF EXISTS public.rule_type CASCADE;
CREATE TYPE public.rule_type AS ENUM ('classification', 'validation', 'reporting', 'custom');

-- ============================================================================
-- SECTION 2: CORE TABLES
-- ============================================================================

-- Organizations table (parent for all tenant data)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status public.organization_status DEFAULT 'trial'::public.organization_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table (extends auth.users with organization context)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role_id UUID,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    status public.user_status DEFAULT 'active'::public.user_status,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Roles table (organization-specific roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_role_per_org UNIQUE (organization_id, role_name)
);

-- Add foreign key to user_profiles after roles table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_role_id'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD CONSTRAINT fk_user_profiles_role_id
        FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Role permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_permission_per_role UNIQUE (role_id, module, action)
);

-- ============================================================================
-- SECTION 3: FATCA DATASET TABLES
-- ============================================================================

-- FATCA dataset table (raw account data)
CREATE TABLE IF NOT EXISTS public.fatca_dataset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    reporting_year INTEGER NOT NULL,
    account_number TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    account_balance DECIMAL(15, 2),
    country_code TEXT,
    tax_id TEXT,
    account_data JSONB,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_account_per_year UNIQUE (organization_id, reporting_year, account_number)
);

-- FATCA results table (classification results)
CREATE TABLE IF NOT EXISTS public.fatca_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES public.fatca_dataset(id) ON DELETE CASCADE,
    reporting_year INTEGER NOT NULL,
    is_reportable BOOLEAN DEFAULT false,
    classification_reason TEXT,
    review_status public.review_status DEFAULT 'pending'::public.review_status,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 4: CASE REVIEW TABLES
-- ============================================================================

-- Case reviews table
CREATE TABLE IF NOT EXISTS public.case_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    result_id UUID NOT NULL REFERENCES public.fatca_results(id) ON DELETE CASCADE,
    status public.review_status DEFAULT 'pending'::public.review_status,
    priority TEXT DEFAULT 'medium',
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Case comments table
CREATE TABLE IF NOT EXISTS public.case_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.case_reviews(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Overrides table (separation of duties: created_by != approved_by)
CREATE TABLE IF NOT EXISTS public.overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.case_reviews(id) ON DELETE CASCADE,
    original_classification BOOLEAN NOT NULL,
    override_classification BOOLEAN NOT NULL,
    justification TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    override_status public.override_status DEFAULT 'pending'::public.override_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    CONSTRAINT separation_of_duties CHECK (created_by != approved_by)
);

-- ============================================================================
-- SECTION 5: RULE MANAGEMENT TABLES
-- ============================================================================

-- Rule master table
CREATE TABLE IF NOT EXISTS public.rule_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    rule_type public.rule_type NOT NULL,
    description TEXT,
    status public.rule_status DEFAULT 'draft'::public.rule_status,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_rule_per_org UNIQUE (organization_id, rule_name),
    CONSTRAINT rule_separation_of_duties CHECK (created_by != approved_by OR approved_by IS NULL)
);

-- Rule version table
CREATE TABLE IF NOT EXISTS public.rule_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES public.rule_master(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    rule_logic JSONB NOT NULL,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_version_per_rule UNIQUE (rule_id, version_number)
);

-- Rule simulation results table
CREATE TABLE IF NOT EXISTS public.rule_simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    rule_version_id UUID NOT NULL REFERENCES public.rule_version(id) ON DELETE CASCADE,
    reporting_year INTEGER NOT NULL,
    total_records INTEGER DEFAULT 0,
    matched_records INTEGER DEFAULT 0,
    simulation_data JSONB,
    simulated_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 6: REPORTING TABLES
-- ============================================================================

-- Reporting years table
CREATE TABLE IF NOT EXISTS public.reporting_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    status public.year_status DEFAULT 'open'::public.year_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_year_per_org UNIQUE (organization_id, year)
);

-- Reporting jobs table (separation of duties: generated_by != approved_by)
CREATE TABLE IF NOT EXISTS public.reporting_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    reporting_year_id UUID NOT NULL REFERENCES public.reporting_years(id) ON DELETE CASCADE,
    job_name TEXT NOT NULL,
    status public.job_status DEFAULT 'pending'::public.job_status,
    report_data JSONB,
    generated_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    CONSTRAINT reporting_separation_of_duties CHECK (generated_by != approved_by OR approved_by IS NULL)
);

-- ============================================================================
-- SECTION 7: AUDIT AND CONFIGURATION TABLES
-- ============================================================================

-- User activity log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Branding configuration table
CREATE TABLE IF NOT EXISTS public.branding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1e40af',
    secondary_color TEXT DEFAULT '#3b82f6',
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_branding_per_org UNIQUE (organization_id)
);

-- Engine settings table
CREATE TABLE IF NOT EXISTS public.engine_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    scheduler_enabled BOOLEAN DEFAULT true,
    auto_classify BOOLEAN DEFAULT false,
    notification_enabled BOOLEAN DEFAULT true,
    settings_data JSONB,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_settings_per_org UNIQUE (organization_id)
);

-- ============================================================================
-- SECTION 8: INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON public.user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Roles indexes
CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON public.roles(organization_id);

-- Role permissions indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);

-- FATCA dataset indexes (composite with organization_id for tenant isolation)
CREATE INDEX IF NOT EXISTS idx_fatca_dataset_org_year ON public.fatca_dataset(organization_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_fatca_dataset_uploaded_by ON public.fatca_dataset(uploaded_by);

-- FATCA results indexes
CREATE INDEX IF NOT EXISTS idx_fatca_results_org_year ON public.fatca_results(organization_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_fatca_results_dataset_id ON public.fatca_results(dataset_id);
CREATE INDEX IF NOT EXISTS idx_fatca_results_assigned_to ON public.fatca_results(assigned_to);
CREATE INDEX IF NOT EXISTS idx_fatca_results_review_status ON public.fatca_results(organization_id, review_status);

-- Case reviews indexes
CREATE INDEX IF NOT EXISTS idx_case_reviews_org_status ON public.case_reviews(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_case_reviews_assigned_to ON public.case_reviews(assigned_to);
CREATE INDEX IF NOT EXISTS idx_case_reviews_result_id ON public.case_reviews(result_id);

-- Case comments indexes
CREATE INDEX IF NOT EXISTS idx_case_comments_case_id ON public.case_comments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_comments_organization_id ON public.case_comments(organization_id);

-- Overrides indexes
CREATE INDEX IF NOT EXISTS idx_overrides_org_status ON public.overrides(organization_id, override_status);
CREATE INDEX IF NOT EXISTS idx_overrides_case_id ON public.overrides(case_id);

-- Rule master indexes
CREATE INDEX IF NOT EXISTS idx_rule_master_org_status ON public.rule_master(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_rule_master_created_by ON public.rule_master(created_by);

-- Rule version indexes
CREATE INDEX IF NOT EXISTS idx_rule_version_rule_id ON public.rule_version(rule_id);

-- Rule simulation indexes
CREATE INDEX IF NOT EXISTS idx_rule_simulation_org_year ON public.rule_simulation_results(organization_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_rule_simulation_rule_version ON public.rule_simulation_results(rule_version_id);

-- Reporting years indexes
CREATE INDEX IF NOT EXISTS idx_reporting_years_org_year ON public.reporting_years(organization_id, year);

-- Reporting jobs indexes
CREATE INDEX IF NOT EXISTS idx_reporting_jobs_org_status ON public.reporting_jobs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_reporting_jobs_year_id ON public.reporting_jobs(reporting_year_id);

-- User activity log indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_org_user ON public.user_activity_log(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity_log(created_at DESC);

-- ============================================================================
-- SECTION 9: FUNCTIONS
-- ============================================================================

-- Function to handle new user creation (trigger-based)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        organization_id,
        email,
        full_name,
        status
    ) VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'organization_id')::UUID, (SELECT id FROM public.organizations LIMIT 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'active'::public.user_status
    );
    RETURN NEW;
END;
$$;

-- Function to update last_login timestamp
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 10: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_dataset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatca_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporting_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engine_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 11: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Organizations policies (users can only see their own organization)
DROP POLICY IF EXISTS "users_view_own_organization" ON public.organizations;
CREATE POLICY "users_view_own_organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- User profiles policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_view_org_user_profiles" ON public.user_profiles;
CREATE POLICY "users_view_org_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Roles policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_roles" ON public.roles;
CREATE POLICY "users_manage_org_roles"
ON public.roles
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Role permissions policies
DROP POLICY IF EXISTS "users_view_role_permissions" ON public.role_permissions;
CREATE POLICY "users_view_role_permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (
    role_id IN (
        SELECT r.id FROM public.roles r
        JOIN public.user_profiles up ON r.organization_id = up.organization_id
        WHERE up.id = auth.uid()
    )
);

-- FATCA dataset policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_fatca_dataset" ON public.fatca_dataset;
CREATE POLICY "users_manage_org_fatca_dataset"
ON public.fatca_dataset
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- FATCA results policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_fatca_results" ON public.fatca_results;
CREATE POLICY "users_manage_org_fatca_results"
ON public.fatca_results
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Case reviews policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_case_reviews" ON public.case_reviews;
CREATE POLICY "users_manage_org_case_reviews"
ON public.case_reviews
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Case comments policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_case_comments" ON public.case_comments;
CREATE POLICY "users_manage_org_case_comments"
ON public.case_comments
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Overrides policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_overrides" ON public.overrides;
CREATE POLICY "users_manage_org_overrides"
ON public.overrides
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Rule master policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_rule_master" ON public.rule_master;
CREATE POLICY "users_manage_org_rule_master"
ON public.rule_master
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Rule version policies
DROP POLICY IF EXISTS "users_manage_rule_versions" ON public.rule_version;
CREATE POLICY "users_manage_rule_versions"
ON public.rule_version
FOR ALL
TO authenticated
USING (
    rule_id IN (
        SELECT rm.id FROM public.rule_master rm
        JOIN public.user_profiles up ON rm.organization_id = up.organization_id
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    rule_id IN (
        SELECT rm.id FROM public.rule_master rm
        JOIN public.user_profiles up ON rm.organization_id = up.organization_id
        WHERE up.id = auth.uid()
    )
);

-- Rule simulation results policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_rule_simulation" ON public.rule_simulation_results;
CREATE POLICY "users_manage_org_rule_simulation"
ON public.rule_simulation_results
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Reporting years policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_reporting_years" ON public.reporting_years;
CREATE POLICY "users_manage_org_reporting_years"
ON public.reporting_years
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Reporting jobs policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_reporting_jobs" ON public.reporting_jobs;
CREATE POLICY "users_manage_org_reporting_jobs"
ON public.reporting_jobs
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- User activity log policies (tenant isolation)
DROP POLICY IF EXISTS "users_view_org_activity_log" ON public.user_activity_log;
CREATE POLICY "users_view_org_activity_log"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_insert_own_activity_log" ON public.user_activity_log;
CREATE POLICY "users_insert_own_activity_log"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() AND
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Branding config policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_branding" ON public.branding_config;
CREATE POLICY "users_manage_org_branding"
ON public.branding_config
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Engine settings policies (tenant isolation)
DROP POLICY IF EXISTS "users_manage_org_engine_settings" ON public.engine_settings;
CREATE POLICY "users_manage_org_engine_settings"
ON public.engine_settings
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- ============================================================================
-- SECTION 12: TRIGGERS
-- ============================================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger for last login update
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.update_last_login();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fatca_dataset_updated_at ON public.fatca_dataset;
CREATE TRIGGER update_fatca_dataset_updated_at
    BEFORE UPDATE ON public.fatca_dataset
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fatca_results_updated_at ON public.fatca_results;
CREATE TRIGGER update_fatca_results_updated_at
    BEFORE UPDATE ON public.fatca_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_case_reviews_updated_at ON public.case_reviews;
CREATE TRIGGER update_case_reviews_updated_at
    BEFORE UPDATE ON public.case_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rule_master_updated_at ON public.rule_master;
CREATE TRIGGER update_rule_master_updated_at
    BEFORE UPDATE ON public.rule_master
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reporting_years_updated_at ON public.reporting_years;
CREATE TRIGGER update_reporting_years_updated_at
    BEFORE UPDATE ON public.reporting_years
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_branding_config_updated_at ON public.branding_config;
CREATE TRIGGER update_branding_config_updated_at
    BEFORE UPDATE ON public.branding_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_engine_settings_updated_at ON public.engine_settings;
CREATE TRIGGER update_engine_settings_updated_at
    BEFORE UPDATE ON public.engine_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 13: MOCK DATA
-- ============================================================================

DO $$
DECLARE
    org1_uuid UUID := gen_random_uuid();
    org2_uuid UUID := gen_random_uuid();
    admin1_uuid UUID := gen_random_uuid();
    user1_uuid UUID := gen_random_uuid();
    admin2_uuid UUID := gen_random_uuid();
    role_admin_uuid UUID := gen_random_uuid();
    role_reviewer_uuid UUID := gen_random_uuid();
    role_analyst_uuid UUID := gen_random_uuid();
    year_2024_uuid UUID := gen_random_uuid();
    year_2025_uuid UUID := gen_random_uuid();
BEGIN
    -- Create organizations
    INSERT INTO public.organizations (id, name, status) VALUES
        (org1_uuid, 'Global Financial Services Inc', 'active'::public.organization_status),
        (org2_uuid, 'Regional Bank Corp', 'trial'::public.organization_status)
    ON CONFLICT (id) DO NOTHING;

    -- Create auth users (trigger will create user_profiles)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@globalfinancial.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Sarah Johnson', 'organization_id', org1_uuid::TEXT),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'reviewer@globalfinancial.com', crypt('reviewer123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Michael Chen', 'organization_id', org1_uuid::TEXT),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (admin2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@regionalbank.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Emily Rodriguez', 'organization_id', org2_uuid::TEXT),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Create roles
    INSERT INTO public.roles (id, organization_id, role_name, description) VALUES
        (role_admin_uuid, org1_uuid, 'Administrator', 'Full system access'),
        (role_reviewer_uuid, org1_uuid, 'Compliance Reviewer', 'Review and approve cases'),
        (role_analyst_uuid, org1_uuid, 'Data Analyst', 'View and analyze data')
    ON CONFLICT (organization_id, role_name) DO NOTHING;

    -- Update user profiles with role_id
    UPDATE public.user_profiles SET role_id = role_admin_uuid WHERE id = admin1_uuid;
    UPDATE public.user_profiles SET role_id = role_reviewer_uuid WHERE id = user1_uuid;
    UPDATE public.user_profiles SET role_id = role_admin_uuid WHERE id = admin2_uuid;

    -- Create role permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
        (role_admin_uuid, 'users', 'create'),
        (role_admin_uuid, 'users', 'read'),
        (role_admin_uuid, 'users', 'update'),
        (role_admin_uuid, 'users', 'delete'),
        (role_admin_uuid, 'roles', 'manage'),
        (role_admin_uuid, 'rules', 'manage'),
        (role_admin_uuid, 'reports', 'generate'),
        (role_reviewer_uuid, 'cases', 'review'),
        (role_reviewer_uuid, 'cases', 'approve'),
        (role_reviewer_uuid, 'dataset', 'read'),
        (role_analyst_uuid, 'dataset', 'read'),
        (role_analyst_uuid, 'reports', 'view')
    ON CONFLICT (role_id, module, action) DO NOTHING;

    -- Create reporting years
    INSERT INTO public.reporting_years (id, organization_id, year, status) VALUES
        (year_2024_uuid, org1_uuid, 2024, 'closed'::public.year_status),
        (year_2025_uuid, org1_uuid, 2025, 'open'::public.year_status)
    ON CONFLICT (organization_id, year) DO NOTHING;

    -- Create FATCA dataset
    INSERT INTO public.fatca_dataset (
        organization_id, reporting_year, account_number, account_holder_name,
        account_balance, country_code, tax_id, uploaded_by
    ) VALUES
        (org1_uuid, 2025, 'ACC-2025-001', 'John Smith', 125000.00, 'US', '123-45-6789', admin1_uuid),
        (org1_uuid, 2025, 'ACC-2025-002', 'Maria Garcia', 85000.00, 'MX', 'RFC-987654', admin1_uuid),
        (org1_uuid, 2025, 'ACC-2025-003', 'David Lee', 250000.00, 'US', '987-65-4321', admin1_uuid),
        (org1_uuid, 2025, 'ACC-2025-004', 'Sophie Martin', 45000.00, 'FR', 'FR-123456', admin1_uuid),
        (org1_uuid, 2025, 'ACC-2025-005', 'Ahmed Hassan', 175000.00, 'EG', 'EG-789012', admin1_uuid)
    ON CONFLICT (organization_id, reporting_year, account_number) DO NOTHING;

    -- Create FATCA results
    INSERT INTO public.fatca_results (
        organization_id, dataset_id, reporting_year, is_reportable,
        classification_reason, review_status, assigned_to
    )
    SELECT
        fd.organization_id,
        fd.id,
        fd.reporting_year,
        CASE WHEN fd.country_code = 'US' THEN true ELSE false END,
        CASE WHEN fd.country_code = 'US' THEN 'US Person - Reportable' ELSE 'Non-US Person' END,
        CASE WHEN fd.country_code = 'US' THEN 'pending'::public.review_status ELSE 'approved'::public.review_status END,
        CASE WHEN fd.country_code = 'US' THEN user1_uuid ELSE NULL END
    FROM public.fatca_dataset fd
    WHERE fd.organization_id = org1_uuid
    ON CONFLICT DO NOTHING;

    -- Create case reviews
    INSERT INTO public.case_reviews (
        organization_id, result_id, status, priority, assigned_to, created_by
    )
    SELECT
        fr.organization_id,
        fr.id,
        'pending'::public.review_status,
        'high',
        user1_uuid,
        admin1_uuid
    FROM public.fatca_results fr
    WHERE fr.is_reportable = true AND fr.organization_id = org1_uuid
    LIMIT 3
    ON CONFLICT DO NOTHING;

    -- Create branding config
    INSERT INTO public.branding_config (organization_id, display_name, primary_color, secondary_color) VALUES
        (org1_uuid, 'Global Financial Services', '#1e40af', '#3b82f6'),
        (org2_uuid, 'Regional Bank', '#059669', '#10b981')
    ON CONFLICT (organization_id) DO NOTHING;

    -- Create engine settings
    INSERT INTO public.engine_settings (organization_id, scheduler_enabled, auto_classify, notification_enabled) VALUES
        (org1_uuid, true, false, true),
        (org2_uuid, true, true, true)
    ON CONFLICT (organization_id) DO NOTHING;

    -- Create user activity log
    INSERT INTO public.user_activity_log (organization_id, user_id, action, module, details) VALUES
        (org1_uuid, admin1_uuid, 'login', 'auth', jsonb_build_object('ip', '192.168.1.1')),
        (org1_uuid, admin1_uuid, 'upload_dataset', 'dataset', jsonb_build_object('records', 5, 'year', 2025)),
        (org1_uuid, user1_uuid, 'login', 'auth', jsonb_build_object('ip', '192.168.1.2')),
        (org1_uuid, user1_uuid, 'review_case', 'cases', jsonb_build_object('case_id', 'pending', 'action', 'assigned'))
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Mock data created successfully';
    RAISE NOTICE 'Organization 1: Global Financial Services Inc (ID: %)', org1_uuid;
    RAISE NOTICE 'Organization 2: Regional Bank Corp (ID: %)', org2_uuid;
    RAISE NOTICE 'Test Credentials:';
    RAISE NOTICE '  Admin (Org 1): admin@globalfinancial.com / admin123';
    RAISE NOTICE '  Reviewer (Org 1): reviewer@globalfinancial.com / reviewer123';
    RAISE NOTICE '  Admin (Org 2): admin@regionalbank.com / admin123';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;