-- ============================================================================
-- INSERT TEST USER PROFILES FOR MANUAL AUTH.USERS CREATION
-- Created: 2026-02-23
-- Purpose: Create user_profiles records for 4 test users that will be manually
--          created in Supabase Dashboard. Uses ON CONFLICT DO UPDATE for idempotency.
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_officer_role_id UUID;
    v_analyst_role_id UUID;
    v_admin_role_id UUID;
    v_reviewer_role_id UUID;
    v_officer_user_id UUID;
    v_analyst_user_id UUID;
    v_admin_user_id UUID;
    v_reviewer_user_id UUID;
BEGIN
    -- Get Ahlibank organization ID
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE name = 'Ahlibank'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Ahlibank organization not found. Please run migration 20260222054000_change_org_to_ahlibank.sql first.';
    END IF;

    RAISE NOTICE 'Found Ahlibank organization (ID: %)', v_org_id;

    -- Create missing roles for Ahlibank if they don't exist
    INSERT INTO public.roles (organization_id, role_name, description)
    VALUES 
        (v_org_id, 'Compliance Officer', 'Oversees compliance operations and approves critical decisions'),
        (v_org_id, 'Compliance Analyst', 'Analyzes compliance data and reviews cases'),
        (v_org_id, 'System Administrator', 'Full system access and configuration management'),
        (v_org_id, 'Data Reviewer', 'Reviews and validates data quality and completeness')
    ON CONFLICT (organization_id, role_name) DO NOTHING;

    RAISE NOTICE 'Ensured all required roles exist for Ahlibank';

    -- Get role IDs for Ahlibank
    SELECT id INTO v_officer_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Compliance Officer'
    LIMIT 1;

    SELECT id INTO v_analyst_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Compliance Analyst'
    LIMIT 1;

    SELECT id INTO v_admin_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'System Administrator'
    LIMIT 1;

    SELECT id INTO v_reviewer_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Data Reviewer'
    LIMIT 1;

    -- Verify all roles exist (should always pass now after INSERT above)
    IF v_officer_role_id IS NULL OR v_analyst_role_id IS NULL OR v_admin_role_id IS NULL OR v_reviewer_role_id IS NULL THEN
        RAISE EXCEPTION 'One or more required roles not found for Ahlibank organization.';
    END IF;

    RAISE NOTICE 'Found all required role IDs: Officer=%, Analyst=%, Admin=%, Reviewer=%', 
        v_officer_role_id, v_analyst_role_id, v_admin_role_id, v_reviewer_role_id;

    -- Get user IDs from auth.users (if they exist)
    SELECT id INTO v_officer_user_id FROM auth.users WHERE email = 'officer@ahlibank.com' LIMIT 1;
    SELECT id INTO v_analyst_user_id FROM auth.users WHERE email = 'analyst@ahlibank.com' LIMIT 1;
    SELECT id INTO v_admin_user_id FROM auth.users WHERE email = 'admin@ahlibank.com' LIMIT 1;
    SELECT id INTO v_reviewer_user_id FROM auth.users WHERE email = 'reviewer@ahlibank.com' LIMIT 1;

    -- Insert/Update user_profiles for Compliance Officer
    IF v_officer_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (
            id,
            organization_id,
            role_id,
            email,
            full_name,
            status,
            authentication_source,
            ad_config_id
        )
        VALUES (
            v_officer_user_id,
            v_org_id,
            v_officer_role_id,
            'officer@ahlibank.com',
            'Compliance Officer',
            'active'::public.user_status,
            'local_db'::public.authentication_source,
            NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            role_id = EXCLUDED.role_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            status = EXCLUDED.status,
            authentication_source = EXCLUDED.authentication_source,
            ad_config_id = EXCLUDED.ad_config_id,
            updated_at = CURRENT_TIMESTAMP;

        RAISE NOTICE 'Created/Updated user_profile for officer@ahlibank.com (ID: %)', v_officer_user_id;
    ELSE
        RAISE NOTICE 'User officer@ahlibank.com not found in auth.users - skipping profile creation';
    END IF;

    -- Insert/Update user_profiles for Compliance Analyst
    IF v_analyst_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (
            id,
            organization_id,
            role_id,
            email,
            full_name,
            status,
            authentication_source,
            ad_config_id
        )
        VALUES (
            v_analyst_user_id,
            v_org_id,
            v_analyst_role_id,
            'analyst@ahlibank.com',
            'Compliance Analyst',
            'active'::public.user_status,
            'local_db'::public.authentication_source,
            NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            role_id = EXCLUDED.role_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            status = EXCLUDED.status,
            authentication_source = EXCLUDED.authentication_source,
            ad_config_id = EXCLUDED.ad_config_id,
            updated_at = CURRENT_TIMESTAMP;

        RAISE NOTICE 'Created/Updated user_profile for analyst@ahlibank.com (ID: %)', v_analyst_user_id;
    ELSE
        RAISE NOTICE 'User analyst@ahlibank.com not found in auth.users - skipping profile creation';
    END IF;

    -- Insert/Update user_profiles for System Administrator
    IF v_admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (
            id,
            organization_id,
            role_id,
            email,
            full_name,
            status,
            authentication_source,
            ad_config_id
        )
        VALUES (
            v_admin_user_id,
            v_org_id,
            v_admin_role_id,
            'admin@ahlibank.com',
            'System Administrator',
            'active'::public.user_status,
            'local_db'::public.authentication_source,
            NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            role_id = EXCLUDED.role_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            status = EXCLUDED.status,
            authentication_source = EXCLUDED.authentication_source,
            ad_config_id = EXCLUDED.ad_config_id,
            updated_at = CURRENT_TIMESTAMP;

        RAISE NOTICE 'Created/Updated user_profile for admin@ahlibank.com (ID: %)', v_admin_user_id;
    ELSE
        RAISE NOTICE 'User admin@ahlibank.com not found in auth.users - skipping profile creation';
    END IF;

    -- Insert/Update user_profiles for Data Reviewer
    IF v_reviewer_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (
            id,
            organization_id,
            role_id,
            email,
            full_name,
            status,
            authentication_source,
            ad_config_id
        )
        VALUES (
            v_reviewer_user_id,
            v_org_id,
            v_reviewer_role_id,
            'reviewer@ahlibank.com',
            'Data Reviewer',
            'active'::public.user_status,
            'local_db'::public.authentication_source,
            NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            role_id = EXCLUDED.role_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            status = EXCLUDED.status,
            authentication_source = EXCLUDED.authentication_source,
            ad_config_id = EXCLUDED.ad_config_id,
            updated_at = CURRENT_TIMESTAMP;

        RAISE NOTICE 'Created/Updated user_profile for reviewer@ahlibank.com (ID: %)', v_reviewer_user_id;
    ELSE
        RAISE NOTICE 'User reviewer@ahlibank.com not found in auth.users - skipping profile creation';
    END IF;

    RAISE NOTICE '✅ Test user profiles migration completed successfully';
    RAISE NOTICE 'NOTE: If users do not exist in auth.users yet, create them manually in Supabase Dashboard and re-run this migration';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Test user profiles migration failed: %', SQLERRM;
        RAISE;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.user_profiles.authentication_source IS 'Authentication method: local_db (email/password) or active_directory (AD/LDAP)';
COMMENT ON COLUMN public.user_profiles.ad_config_id IS 'NULL for local_db users, references AD config for AD users';