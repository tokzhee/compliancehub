-- Migration: Truncate all user-related data and start fresh
-- Purpose: Clean up all seeded user data from auth.users, auth.identities, user_profiles, and related tables
-- Preserves: organizations, roles, and core system configuration

DO $$
DECLARE
    v_deleted_users INTEGER := 0;
    v_deleted_profiles INTEGER := 0;
    v_deleted_identities INTEGER := 0;
    v_deleted_activity_logs INTEGER := 0;
    v_deleted_role_permissions INTEGER := 0;
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Starting complete user data truncation...';
    RAISE NOTICE '=========================================';

    -- Step 1: Delete all user activity logs (references user_profiles)
    DELETE FROM public.user_activity_log;
    GET DIAGNOSTICS v_deleted_activity_logs = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from user_activity_log', v_deleted_activity_logs;

    -- Step 2: Delete all role permissions (references roles, but we're cleaning this up)
    DELETE FROM public.role_permissions;
    GET DIAGNOSTICS v_deleted_role_permissions = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from role_permissions', v_deleted_role_permissions;

    -- Step 3: Delete all records from tables that reference user_profiles
    -- These are the foreign key dependencies we need to clean up first
    
    -- Delete case_reviews entirely (has NOT NULL constraint on created_by)
    DELETE FROM public.case_reviews;
    RAISE NOTICE 'Deleted all case_reviews records';

    -- Clean up fatca_dataset uploads
    UPDATE public.fatca_dataset SET uploaded_by = NULL WHERE uploaded_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_dataset';

    -- Clean up fatca_results assignments
    UPDATE public.fatca_results SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
    UPDATE public.fatca_results SET reviewed_by = NULL WHERE reviewed_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_results';

    -- Clean up case_comments
    DELETE FROM public.case_comments;
    RAISE NOTICE 'Deleted all case_comments';

    -- Clean up overrides
    UPDATE public.overrides SET created_by = NULL WHERE created_by IS NOT NULL;
    UPDATE public.overrides SET approved_by = NULL WHERE approved_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from overrides';

    -- Clean up rule_master
    UPDATE public.rule_master SET created_by = NULL WHERE created_by IS NOT NULL;
    UPDATE public.rule_master SET approved_by = NULL WHERE approved_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from rule_master';

    -- Clean up rule_version
    UPDATE public.rule_version SET created_by = NULL WHERE created_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from rule_version';

    -- Clean up rule_simulation_results
    UPDATE public.rule_simulation_results SET simulated_by = NULL WHERE simulated_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from rule_simulation_results';

    -- Clean up reporting_jobs
    UPDATE public.reporting_jobs SET generated_by = NULL WHERE generated_by IS NOT NULL;
    UPDATE public.reporting_jobs SET approved_by = NULL WHERE approved_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from reporting_jobs';

    -- Clean up engine_settings
    UPDATE public.engine_settings SET updated_by = NULL WHERE updated_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from engine_settings';

    -- Clean up FATCA/CRS tables
    UPDATE public.fatca_crs_rule_sets SET created_by = NULL WHERE created_by IS NOT NULL;
    UPDATE public.fatca_crs_rule_sets SET approved_by = NULL WHERE approved_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_crs_rule_sets';

    UPDATE public.fatca_crs_dataset_batch SET executed_by = NULL WHERE executed_by IS NOT NULL;
    UPDATE public.fatca_crs_dataset_batch SET locked_by = NULL WHERE locked_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_crs_dataset_batch';

    UPDATE public.fatca_crs_case_master SET assigned_user = NULL WHERE assigned_user IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_crs_case_master';

    UPDATE public.fatca_crs_case_details SET updated_by = NULL WHERE updated_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_crs_case_details';

    DELETE FROM public.fatca_crs_case_assignment;
    RAISE NOTICE 'Deleted all fatca_crs_case_assignment records';

    DELETE FROM public.fatca_crs_case_notes;
    RAISE NOTICE 'Deleted all fatca_crs_case_notes records';

    UPDATE public.fatca_crs_report_batch SET initiated_by = NULL WHERE initiated_by IS NOT NULL;
    UPDATE public.fatca_crs_report_batch SET approved_by = NULL WHERE approved_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_crs_report_batch';

    UPDATE public.fatca_crs_submission_log SET submitted_by = NULL WHERE submitted_by IS NOT NULL;
    RAISE NOTICE 'Cleared user references from fatca_crs_submission_log';

    DELETE FROM public.user_segment_roles;
    RAISE NOTICE 'Deleted all user_segment_roles records';

    -- Step 4: Delete all user_profiles (now that all references are cleared)
    DELETE FROM public.user_profiles;
    GET DIAGNOSTICS v_deleted_profiles = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from user_profiles', v_deleted_profiles;

    -- Step 5: Delete all auth.identities
    DELETE FROM auth.identities;
    GET DIAGNOSTICS v_deleted_identities = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from auth.identities', v_deleted_identities;

    -- Step 6: Delete all auth.users
    DELETE FROM auth.users;
    GET DIAGNOSTICS v_deleted_users = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from auth.users', v_deleted_users;

    RAISE NOTICE '=========================================';
    RAISE NOTICE 'User data truncation completed successfully!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Deleted % auth.users', v_deleted_users;
    RAISE NOTICE '  - Deleted % auth.identities', v_deleted_identities;
    RAISE NOTICE '  - Deleted % user_profiles', v_deleted_profiles;
    RAISE NOTICE '  - Deleted % user_activity_log entries', v_deleted_activity_logs;
    RAISE NOTICE '  - Deleted % role_permissions', v_deleted_role_permissions;
    RAISE NOTICE '  - Cleared all user references from related tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Preserved:';
    RAISE NOTICE '  - Organizations table (intact)';
    RAISE NOTICE '  - Roles table (intact)';
    RAISE NOTICE '  - All system configuration tables';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'HOW TO CREATE NEW USERS:';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Option 1: Supabase Dashboard (Recommended)';
    RAISE NOTICE '  1. Go to Authentication > Users';
    RAISE NOTICE '  2. Click "Add User"';
    RAISE NOTICE '  3. Enter email and password';
    RAISE NOTICE '  4. Enable "Auto Confirm User"';
    RAISE NOTICE '  5. Click "Create User"';
    RAISE NOTICE '  6. user_profiles will be auto-created by trigger';
    RAISE NOTICE '';
    RAISE NOTICE 'Option 2: Supabase Admin API';
    RAISE NOTICE '  const { data, error } = await supabase.auth.admin.createUser({';
    RAISE NOTICE '    email: "user@ahlibank.com",';
    RAISE NOTICE '    password: "YourPassword123",';
    RAISE NOTICE '    email_confirm: true,';
    RAISE NOTICE '    user_metadata: {';
    RAISE NOTICE '      full_name: "User Name",';
    RAISE NOTICE '      organization_id: "your-org-uuid"';
    RAISE NOTICE '    }';
    RAISE NOTICE '  });';
    RAISE NOTICE '=========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during user data truncation: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;