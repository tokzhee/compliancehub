-- ============================================================================
-- FIX ADMINISTRATOR ROLE NAME AND RESTORE PERMISSIONS
-- Created: 2026-02-23 10:40:00
-- Updated: 2026-02-23 10:42:00
-- Purpose: 
--   1. Consolidate 'Administrator' and 'System Administrator' roles
--   2. Restore all permissions for the System Administrator role
--   3. Ensure admin user has correct role assignment
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_admin_role_id UUID;
    v_old_admin_role_id UUID;
    v_system_admin_role_id UUID;
    v_officer_role_id UUID;
    v_analyst_role_id UUID;
    v_reviewer_role_id UUID;
    v_updated_count INTEGER := 0;
    v_permission_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Starting comprehensive admin role fix...';
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

    -- ========================================================================
    -- STEP 1: Handle Role Name Consolidation
    -- ========================================================================
    
    -- Check if 'Administrator' role exists
    SELECT id INTO v_old_admin_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Administrator'
    LIMIT 1;

    -- Check if 'System Administrator' role exists
    SELECT id INTO v_system_admin_role_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'System Administrator'
    LIMIT 1;

    -- Handle different scenarios
    IF v_old_admin_role_id IS NOT NULL AND v_system_admin_role_id IS NOT NULL THEN
        -- Both exist - consolidate into System Administrator
        RAISE NOTICE 'Both "Administrator" and "System Administrator" exist - consolidating...';
        
        -- Transfer all users from Administrator to System Administrator
        UPDATE public.user_profiles
        SET 
            role_id = v_system_admin_role_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE role_id = v_old_admin_role_id;
        
        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        RAISE NOTICE '✅ Transferred % users from Administrator to System Administrator', v_updated_count;
        
        -- Delete the old Administrator role (cascade will handle permissions)
        DELETE FROM public.roles
        WHERE id = v_old_admin_role_id;
        
        RAISE NOTICE '✅ Deleted old "Administrator" role';
        
        v_admin_role_id := v_system_admin_role_id;
        
    ELSIF v_old_admin_role_id IS NOT NULL AND v_system_admin_role_id IS NULL THEN
        -- Only Administrator exists - rename it
        UPDATE public.roles
        SET 
            role_name = 'System Administrator',
            description = 'Full system access with administrative privileges',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_old_admin_role_id;
        
        RAISE NOTICE '✅ Renamed "Administrator" to "System Administrator" (ID: %)', v_old_admin_role_id;
        
        v_admin_role_id := v_old_admin_role_id;
        
    ELSIF v_old_admin_role_id IS NULL AND v_system_admin_role_id IS NOT NULL THEN
        -- Only System Administrator exists - use it
        RAISE NOTICE 'ℹ️  "System Administrator" role already exists (ID: %)', v_system_admin_role_id;
        
        v_admin_role_id := v_system_admin_role_id;
        
    ELSE
        -- Neither exists - error
        RAISE EXCEPTION 'No administrator role found (neither "Administrator" nor "System Administrator")';
    END IF;

    -- Get other role IDs
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

    -- ========================================================================
    -- STEP 2: Clear and Restore Permissions for System Administrator
    -- ========================================================================
    
    -- Delete existing permissions for admin role
    DELETE FROM public.role_permissions
    WHERE role_id = v_admin_role_id;
    
    RAISE NOTICE 'Cleared existing permissions for System Administrator';

    -- Insert all System Administrator permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    -- Dashboard
    (v_admin_role_id, 'dashboard', 'view'),
    (v_admin_role_id, 'dashboard', 'export'),
    -- Datasets
    (v_admin_role_id, 'datasets', 'view'),
    (v_admin_role_id, 'datasets', 'manage'),
    (v_admin_role_id, 'datasets', 'upload'),
    (v_admin_role_id, 'datasets', 'delete'),
    -- Rules
    (v_admin_role_id, 'rules', 'view'),
    (v_admin_role_id, 'rules', 'manage'),
    (v_admin_role_id, 'rules', 'approve'),
    (v_admin_role_id, 'rules', 'delete'),
    -- Cases
    (v_admin_role_id, 'cases', 'view'),
    (v_admin_role_id, 'cases', 'review'),
    (v_admin_role_id, 'cases', 'assign'),
    (v_admin_role_id, 'cases', 'override'),
    -- Reporting
    (v_admin_role_id, 'reporting', 'view'),
    (v_admin_role_id, 'reporting', 'generate'),
    (v_admin_role_id, 'reporting', 'approve'),
    (v_admin_role_id, 'reporting', 'export'),
    -- Enrichment
    (v_admin_role_id, 'enrichment', 'access'),
    (v_admin_role_id, 'enrichment', 'update'),
    -- Submissions
    (v_admin_role_id, 'submissions', 'view'),
    (v_admin_role_id, 'submissions', 'submit'),
    -- Users (full access)
    (v_admin_role_id, 'users', 'view'),
    (v_admin_role_id, 'users', 'manage'),
    (v_admin_role_id, 'users', 'create'),
    (v_admin_role_id, 'users', 'delete'),
    -- Roles (full access)
    (v_admin_role_id, 'roles', 'view'),
    (v_admin_role_id, 'roles', 'manage'),
    (v_admin_role_id, 'roles', 'create'),
    (v_admin_role_id, 'roles', 'delete'),
    -- LDAP (full access)
    (v_admin_role_id, 'ldap', 'view'),
    (v_admin_role_id, 'ldap', 'manage'),
    (v_admin_role_id, 'ldap', 'configure');

    SELECT COUNT(*) INTO v_permission_count
    FROM public.role_permissions
    WHERE role_id = v_admin_role_id;

    RAISE NOTICE '✅ Inserted % permissions for System Administrator', v_permission_count;

    -- ========================================================================
    -- STEP 3: Ensure admin@ahlibank.com has correct role assignment
    -- ========================================================================
    
    UPDATE public.user_profiles
    SET 
        role_id = v_admin_role_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        email = 'admin@ahlibank.com'
        AND organization_id = v_org_id;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    IF v_updated_count > 0 THEN
        RAISE NOTICE '✅ Confirmed admin@ahlibank.com has System Administrator role';
    ELSE
        RAISE NOTICE 'ℹ️  admin@ahlibank.com already has correct role';
    END IF;

    -- ========================================================================
    -- VERIFICATION
    -- ========================================================================
    
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '  - Role Name: System Administrator';
    RAISE NOTICE '  - Role ID: %', v_admin_role_id;
    RAISE NOTICE '  - Permissions: %', v_permission_count;
    RAISE NOTICE '  - Admin User: admin@ahlibank.com';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Admin role fix completed successfully!';
    RAISE NOTICE '=========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fixing administrator role: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- ============================================================================
-- VERIFICATION QUERY - Check the results
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_role_record RECORD;
    v_user_record RECORD;
    v_permission_count INTEGER;
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Final Verification Results:';
    RAISE NOTICE '=========================================';
    
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE name = 'Ahlibank'
    LIMIT 1;
    
    -- Check role
    SELECT id, role_name, description INTO v_role_record
    FROM public.roles
    WHERE organization_id = v_org_id 
      AND role_name = 'System Administrator'
    LIMIT 1;
    
    IF v_role_record.id IS NOT NULL THEN
        RAISE NOTICE 'Role: % (ID: %)', v_role_record.role_name, v_role_record.id;
        
        -- Count permissions
        SELECT COUNT(*) INTO v_permission_count
        FROM public.role_permissions
        WHERE role_id = v_role_record.id;
        
        RAISE NOTICE 'Permissions: % total', v_permission_count;
    ELSE
        RAISE NOTICE 'ERROR: System Administrator role not found!';
    END IF;
    
    -- Check user
    SELECT up.email, up.full_name, r.role_name INTO v_user_record
    FROM public.user_profiles up
    LEFT JOIN public.roles r ON up.role_id = r.id
    WHERE up.email = 'admin@ahlibank.com'
      AND up.organization_id = v_org_id
    LIMIT 1;
    
    IF v_user_record.email IS NOT NULL THEN
        RAISE NOTICE 'User: % (%)', v_user_record.email, v_user_record.full_name;
        RAISE NOTICE 'Assigned Role: %', v_user_record.role_name;
    ELSE
        RAISE NOTICE 'ERROR: admin@ahlibank.com not found!';
    END IF;
    
    RAISE NOTICE '=========================================';
END $$;