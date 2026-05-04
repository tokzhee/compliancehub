-- ============================================================================
-- FIX USER ROLE ASSIGNMENTS
-- Created: 2026-02-23 04:27:00
-- Purpose: Assign correct role_id to existing user_profiles that have null role_id
--          This fixes users created manually in Supabase Dashboard before the
--          user profiles migration ran
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_admin_role_id UUID;
    v_officer_role_id UUID;
    v_analyst_role_id UUID;
    v_reviewer_role_id UUID;
    v_updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Fixing user role assignments...';
    RAISE NOTICE '=========================================';

    -- Get Ahlibank organization ID
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE name = 'Ahlibank'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Ahlibank organization not found';
    END IF;

    RAISE NOTICE 'Found Ahlibank organization (ID: %)', v_org_id;

    -- Get role IDs for Ahlibank
    SELECT id INTO v_admin_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'System Administrator'
    LIMIT 1;

    SELECT id INTO v_officer_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Compliance Officer'
    LIMIT 1;

    SELECT id INTO v_analyst_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Compliance Analyst'
    LIMIT 1;

    SELECT id INTO v_reviewer_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Data Reviewer'
    LIMIT 1;

    -- Verify all roles exist
    IF v_admin_role_id IS NULL OR v_officer_role_id IS NULL OR v_analyst_role_id IS NULL OR v_reviewer_role_id IS NULL THEN
        RAISE EXCEPTION 'One or more required roles not found for Ahlibank organization';
    END IF;

    RAISE NOTICE 'Found all role IDs:';
    RAISE NOTICE '  - System Administrator: %', v_admin_role_id;
    RAISE NOTICE '  - Compliance Officer: %', v_officer_role_id;
    RAISE NOTICE '  - Compliance Analyst: %', v_analyst_role_id;
    RAISE NOTICE '  - Data Reviewer: %', v_reviewer_role_id;

    -- Update admin@ahlibank.com to System Administrator role
    UPDATE public.user_profiles
    SET 
        role_id = v_admin_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        email = 'admin@ahlibank.com'
        AND organization_id = v_org_id
        AND (role_id IS NULL OR role_id != v_admin_role_id);
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Updated admin@ahlibank.com to System Administrator role';
    ELSE
        RAISE NOTICE 'ℹ️  admin@ahlibank.com already has correct role or does not exist';
    END IF;

    -- Update officer@ahlibank.com to Compliance Officer role
    UPDATE public.user_profiles
    SET 
        role_id = v_officer_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        email = 'officer@ahlibank.com'
        AND organization_id = v_org_id
        AND (role_id IS NULL OR role_id != v_officer_role_id);
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Updated officer@ahlibank.com to Compliance Officer role';
    ELSE
        RAISE NOTICE 'ℹ️  officer@ahlibank.com already has correct role or does not exist';
    END IF;

    -- Update analyst@ahlibank.com to Compliance Analyst role
    UPDATE public.user_profiles
    SET 
        role_id = v_analyst_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        email = 'analyst@ahlibank.com'
        AND organization_id = v_org_id
        AND (role_id IS NULL OR role_id != v_analyst_role_id);
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Updated analyst@ahlibank.com to Compliance Analyst role';
    ELSE
        RAISE NOTICE 'ℹ️  analyst@ahlibank.com already has correct role or does not exist';
    END IF;

    -- Update reviewer@ahlibank.com to Data Reviewer role
    UPDATE public.user_profiles
    SET 
        role_id = v_reviewer_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        email = 'reviewer@ahlibank.com'
        AND organization_id = v_org_id
        AND (role_id IS NULL OR role_id != v_reviewer_role_id);
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Updated reviewer@ahlibank.com to Data Reviewer role';
    ELSE
        RAISE NOTICE 'ℹ️  reviewer@ahlibank.com already has correct role or does not exist';
    END IF;

    RAISE NOTICE '=========================================';
    RAISE NOTICE 'User role assignment fix completed!';
    RAISE NOTICE '=========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fixing user role assignments: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Uncomment to verify role assignments:
-- SELECT 
--     up.email,
--     up.full_name,
--     r.role_name,
--     up.role_id,
--     up.organization_id
-- FROM public.user_profiles up
-- LEFT JOIN public.roles r ON up.role_id = r.id
-- WHERE up.organization_id = (SELECT id FROM public.organizations WHERE name = 'Ahlibank' LIMIT 1)
-- ORDER BY up.email;