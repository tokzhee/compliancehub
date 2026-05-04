-- Migration: Assign correct roles to officer, analyst, and reviewer users
-- This migration updates the role_id field in user_profiles table for the 3 users

DO $$
DECLARE
    v_org_id UUID;
    v_officer_role_id UUID;
    v_analyst_role_id UUID;
    v_reviewer_role_id UUID;
    v_updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting role assignment migration...';

    -- Get Ahlibank organization ID
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE name = 'Ahlibank'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Ahlibank organization not found';
    END IF;

    RAISE NOTICE 'Found Ahlibank organization: %', v_org_id;

    -- Get role IDs for the three roles
    SELECT id INTO v_officer_role_id
    FROM public.roles
    WHERE role_name = 'Compliance Officer'
    AND organization_id = v_org_id
    LIMIT 1;

    SELECT id INTO v_analyst_role_id
    FROM public.roles
    WHERE role_name = 'Compliance Analyst'
    AND organization_id = v_org_id
    LIMIT 1;

    SELECT id INTO v_reviewer_role_id
    FROM public.roles
    WHERE role_name = 'Data Reviewer'
    AND organization_id = v_org_id
    LIMIT 1;

    -- Verify all roles were found
    IF v_officer_role_id IS NULL THEN
        RAISE EXCEPTION 'Compliance Officer role not found for Ahlibank';
    END IF;

    IF v_analyst_role_id IS NULL THEN
        RAISE EXCEPTION 'Compliance Analyst role not found for Ahlibank';
    END IF;

    IF v_reviewer_role_id IS NULL THEN
        RAISE EXCEPTION 'Data Reviewer role not found for Ahlibank';
    END IF;

    RAISE NOTICE 'Found all required roles:';
    RAISE NOTICE '  - Compliance Officer: %', v_officer_role_id;
    RAISE NOTICE '  - Compliance Analyst: %', v_analyst_role_id;
    RAISE NOTICE '  - Data Reviewer: %', v_reviewer_role_id;

    -- Update role_id for officer@ahlibank.com
    UPDATE public.user_profiles
    SET role_id = v_officer_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = 'officer@ahlibank.com'
    AND organization_id = v_org_id;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Updated officer@ahlibank.com with Compliance Officer role';
    ELSE
        RAISE WARNING '⚠️  User officer@ahlibank.com not found in user_profiles';
    END IF;

    -- Update role_id for analyst@ahlibank.com
    UPDATE public.user_profiles
    SET role_id = v_analyst_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = 'analyst@ahlibank.com'
    AND organization_id = v_org_id;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Updated analyst@ahlibank.com with Compliance Analyst role';
    ELSE
        RAISE WARNING '⚠️  User analyst@ahlibank.com not found in user_profiles';
    END IF;

    -- Update role_id for reviewer@ahlibank.com
    UPDATE public.user_profiles
    SET role_id = v_reviewer_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = 'reviewer@ahlibank.com'
    AND organization_id = v_org_id;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Updated reviewer@ahlibank.com with Data Reviewer role';
    ELSE
        RAISE WARNING '⚠️  User reviewer@ahlibank.com not found in user_profiles';
    END IF;

    RAISE NOTICE '🎉 Role assignment migration completed successfully';
    RAISE NOTICE 'All three users have been assigned their respective roles';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Migration failed: %', SQLERRM;
END $$;
