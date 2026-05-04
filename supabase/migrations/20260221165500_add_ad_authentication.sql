-- Multi-AD Authentication Support Migration
-- Created: 2026-02-21
-- Purpose: Add support for multiple Active Directory configurations and authentication source selection

-- ============================================================================
-- SECTION 1: CUSTOM TYPES
-- ============================================================================

DROP TYPE IF EXISTS public.authentication_source CASCADE;
CREATE TYPE public.authentication_source AS ENUM ('local_db', 'active_directory');

DROP TYPE IF EXISTS public.ad_config_status CASCADE;
CREATE TYPE public.ad_config_status AS ENUM ('active', 'inactive');

-- ============================================================================
-- SECTION 2: AD CONFIGURATIONS TABLE
-- ============================================================================

-- AD configurations table (stores multiple AD instances per organization)
CREATE TABLE IF NOT EXISTS public.ad_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    config_name TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    authority_url TEXT NOT NULL,
    status public.ad_config_status DEFAULT 'active'::public.ad_config_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_ad_config_name_per_org UNIQUE (organization_id, config_name)
);

-- ============================================================================
-- SECTION 3: UPDATE USER_PROFILES TABLE
-- ============================================================================

-- Add authentication_source column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS authentication_source public.authentication_source DEFAULT 'local_db'::public.authentication_source;

-- Add ad_config_id column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS ad_config_id UUID REFERENCES public.ad_configurations(id) ON DELETE SET NULL;

-- ============================================================================
-- SECTION 4: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ad_configurations_organization_id ON public.ad_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ad_configurations_status ON public.ad_configurations(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_authentication_source ON public.user_profiles(authentication_source);
CREATE INDEX IF NOT EXISTS idx_user_profiles_ad_config_id ON public.user_profiles(ad_config_id);

-- ============================================================================
-- SECTION 5: ENABLE RLS
-- ============================================================================

ALTER TABLE public.ad_configurations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 6: RLS POLICIES
-- ============================================================================

-- AD configurations: Organization-scoped access
DROP POLICY IF EXISTS "users_view_org_ad_configurations" ON public.ad_configurations;
CREATE POLICY "users_view_org_ad_configurations"
ON public.ad_configurations
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "admins_manage_ad_configurations" ON public.ad_configurations;
CREATE POLICY "admins_manage_ad_configurations"
ON public.ad_configurations
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT up.organization_id 
        FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() 
        AND r.role_name = 'Administrator'
    )
)
WITH CHECK (
    organization_id IN (
        SELECT up.organization_id 
        FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() 
        AND r.role_name = 'Administrator'
    )
);

-- ============================================================================
-- SECTION 7: MOCK DATA
-- ============================================================================

DO $$
DECLARE
    org1_id UUID;
    org2_id UUID;
    ad_config1_id UUID := gen_random_uuid();
    ad_config2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing organization IDs
    SELECT id INTO org1_id FROM public.organizations WHERE name = 'Global Financial Corp' LIMIT 1;
    SELECT id INTO org2_id FROM public.organizations WHERE name = 'Regional Bank Ltd' LIMIT 1;

    IF org1_id IS NOT NULL THEN
        -- Create AD configurations for organization 1
        INSERT INTO public.ad_configurations (
            id, organization_id, config_name, tenant_id, client_id, authority_url, status
        ) VALUES
            (
                ad_config1_id,
                org1_id,
                'Primary AD',
                'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
                '11111111-2222-3333-4444-555555555555',
                'https://login.microsoftonline.com/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
                'active'::public.ad_config_status
            ),
            (
                gen_random_uuid(),
                org1_id,
                'Secondary AD',
                'ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj',
                '66666666-7777-8888-9999-000000000000',
                'https://login.microsoftonline.com/ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj',
                'active'::public.ad_config_status
            )
        ON CONFLICT (organization_id, config_name) DO NOTHING;
    END IF;

    IF org2_id IS NOT NULL THEN
        -- Create AD configuration for organization 2
        INSERT INTO public.ad_configurations (
            id, organization_id, config_name, tenant_id, client_id, authority_url, status
        ) VALUES
            (
                ad_config2_id,
                org2_id,
                'Corporate AD',
                'kkkkkkkk-llll-mmmm-nnnn-oooooooooooo',
                'pppppppp-qqqq-rrrr-ssss-tttttttttttt',
                'https://login.microsoftonline.com/kkkkkkkk-llll-mmmm-nnnn-oooooooooooo',
                'active'::public.ad_config_status
            )
        ON CONFLICT (organization_id, config_name) DO NOTHING;
    END IF;

    -- Update existing users with authentication source
    UPDATE public.user_profiles
    SET authentication_source = 'local_db'::public.authentication_source,
        ad_config_id = NULL
    WHERE authentication_source IS NULL;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;

-- ============================================================================
-- SECTION 8: COMMENTS
-- ============================================================================

COMMENT ON TABLE public.ad_configurations IS 'Stores multiple Active Directory configurations per organization';
COMMENT ON COLUMN public.user_profiles.authentication_source IS 'Authentication method: local_db or active_directory';
COMMENT ON COLUMN public.user_profiles.ad_config_id IS 'Reference to AD configuration if authentication_source is active_directory';