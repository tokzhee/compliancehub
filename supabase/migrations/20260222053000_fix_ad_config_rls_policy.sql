-- Fix AD Configuration RLS Policy
-- Created: 2026-02-22
-- Purpose: Allow all authenticated users to view AD configurations from their organization
--          while restricting write operations to Administrators only

-- ============================================================================
-- SECTION 1: DROP EXISTING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "users_view_org_ad_configurations" ON public.ad_configurations;
DROP POLICY IF EXISTS "admins_manage_ad_configurations" ON public.ad_configurations;

-- ============================================================================
-- SECTION 2: CREATE NEW POLICIES
-- ============================================================================

-- Policy 1: Allow all authenticated users to VIEW AD configurations from their organization
CREATE POLICY "users_view_org_ad_configurations"
ON public.ad_configurations
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.user_profiles 
        WHERE id = auth.uid()
    )
);

-- Policy 2: Allow only Administrators to INSERT AD configurations
CREATE POLICY "admins_insert_ad_configurations"
ON public.ad_configurations
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id IN (
        SELECT up.organization_id
        FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid()
        AND r.role_name = 'Administrator'
    )
);

-- Policy 3: Allow only Administrators to UPDATE AD configurations
CREATE POLICY "admins_update_ad_configurations"
ON public.ad_configurations
FOR UPDATE
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

-- Policy 4: Allow only Administrators to DELETE AD configurations
CREATE POLICY "admins_delete_ad_configurations"
ON public.ad_configurations
FOR DELETE
TO authenticated
USING (
    organization_id IN (
        SELECT up.organization_id
        FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid()
        AND r.role_name = 'Administrator'
    )
);

-- ============================================================================
-- SECTION 3: VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated successfully for ad_configurations table';
    RAISE NOTICE 'All authenticated users can now VIEW AD configurations from their organization';
    RAISE NOTICE 'Only Administrators can INSERT, UPDATE, or DELETE AD configurations';
END $$;