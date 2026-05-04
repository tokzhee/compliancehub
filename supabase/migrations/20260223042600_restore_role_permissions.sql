-- ============================================================================
-- RESTORE ROLE PERMISSIONS AFTER TRUNCATION
-- Created: 2026-02-23 04:26:00
-- Purpose: Re-insert granular RBAC permissions that were deleted by truncate migration
--          This migration restores permissions for all roles in the system
-- ============================================================================

DO $$
DECLARE
    v_compliance_officer_id UUID;
    v_analyst_id UUID;
    v_admin_id UUID;
    v_reviewer_id UUID;
    v_org_id UUID;
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Restoring role permissions...';
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

    -- Get role IDs for Ahlibank organization
    SELECT id INTO v_compliance_officer_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Compliance Officer'
    LIMIT 1;

    SELECT id INTO v_analyst_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Compliance Analyst'
    LIMIT 1;

    SELECT id INTO v_admin_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'System Administrator'
    LIMIT 1;

    SELECT id INTO v_reviewer_id
    FROM public.roles
    WHERE organization_id = v_org_id AND role_name = 'Data Reviewer'
    LIMIT 1;

    -- Verify all roles exist
    IF v_compliance_officer_id IS NULL OR v_analyst_id IS NULL OR v_admin_id IS NULL OR v_reviewer_id IS NULL THEN
        RAISE EXCEPTION 'One or more required roles not found for Ahlibank organization';
    END IF;

    RAISE NOTICE 'Found all role IDs: Officer=%, Analyst=%, Admin=%, Reviewer=%',
        v_compliance_officer_id, v_analyst_id, v_admin_id, v_reviewer_id;

    -- Clear any existing permissions to avoid conflicts
    DELETE FROM public.role_permissions
    WHERE role_id IN (v_compliance_officer_id, v_analyst_id, v_admin_id, v_reviewer_id);

    RAISE NOTICE 'Cleared existing permissions for Ahlibank roles';

    -- ========================================================================
    -- SYSTEM ADMINISTRATOR PERMISSIONS (FULL ACCESS)
    -- ========================================================================
    
    -- Dashboard permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'dashboard', 'view'),
    (v_admin_id, 'dashboard', 'export');

    -- Dataset permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'datasets', 'view'),
    (v_admin_id, 'datasets', 'manage'),
    (v_admin_id, 'datasets', 'upload'),
    (v_admin_id, 'datasets', 'delete');

    -- Rules permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'rules', 'view'),
    (v_admin_id, 'rules', 'manage'),
    (v_admin_id, 'rules', 'approve'),
    (v_admin_id, 'rules', 'delete');

    -- Cases permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'cases', 'view'),
    (v_admin_id, 'cases', 'review'),
    (v_admin_id, 'cases', 'assign'),
    (v_admin_id, 'cases', 'override');

    -- Reporting permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'reporting', 'view'),
    (v_admin_id, 'reporting', 'generate'),
    (v_admin_id, 'reporting', 'approve'),
    (v_admin_id, 'reporting', 'export');

    -- Enrichment permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'enrichment', 'access'),
    (v_admin_id, 'enrichment', 'update');

    -- Submissions permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'submissions', 'view'),
    (v_admin_id, 'submissions', 'submit');

    -- Users permissions (full access)
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'users', 'view'),
    (v_admin_id, 'users', 'manage'),
    (v_admin_id, 'users', 'create'),
    (v_admin_id, 'users', 'delete');

    -- Roles permissions (full access)
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'roles', 'view'),
    (v_admin_id, 'roles', 'manage'),
    (v_admin_id, 'roles', 'create'),
    (v_admin_id, 'roles', 'delete');

    -- LDAP permissions (full access)
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_admin_id, 'ldap', 'view'),
    (v_admin_id, 'ldap', 'manage'),
    (v_admin_id, 'ldap', 'configure');

    RAISE NOTICE '✅ Inserted % permissions for System Administrator', 38;

    -- ========================================================================
    -- COMPLIANCE OFFICER PERMISSIONS
    -- ========================================================================
    
    -- Dashboard permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'dashboard', 'view'),
    (v_compliance_officer_id, 'dashboard', 'export');

    -- Dataset permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'datasets', 'view'),
    (v_compliance_officer_id, 'datasets', 'manage'),
    (v_compliance_officer_id, 'datasets', 'upload');

    -- Rules permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'rules', 'view'),
    (v_compliance_officer_id, 'rules', 'manage'),
    (v_compliance_officer_id, 'rules', 'approve');

    -- Cases permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'cases', 'view'),
    (v_compliance_officer_id, 'cases', 'review'),
    (v_compliance_officer_id, 'cases', 'assign');

    -- Reporting permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'reporting', 'view'),
    (v_compliance_officer_id, 'reporting', 'generate'),
    (v_compliance_officer_id, 'reporting', 'approve');

    -- Enrichment permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'enrichment', 'access'),
    (v_compliance_officer_id, 'enrichment', 'update');

    -- Submissions permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'submissions', 'view'),
    (v_compliance_officer_id, 'submissions', 'submit');

    -- Users permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'users', 'view'),
    (v_compliance_officer_id, 'users', 'manage');

    -- Roles permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'roles', 'view');

    -- LDAP permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_compliance_officer_id, 'ldap', 'view');

    RAISE NOTICE '✅ Inserted % permissions for Compliance Officer', 26;

    -- ========================================================================
    -- COMPLIANCE ANALYST PERMISSIONS
    -- ========================================================================
    
    -- Dashboard permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_analyst_id, 'dashboard', 'view');

    -- Dataset permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_analyst_id, 'datasets', 'view');

    -- Rules permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_analyst_id, 'rules', 'view');

    -- Cases permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_analyst_id, 'cases', 'view'),
    (v_analyst_id, 'cases', 'review'),
    (v_analyst_id, 'cases', 'assign');

    -- Reporting permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_analyst_id, 'reporting', 'view');

    -- Enrichment permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_analyst_id, 'enrichment', 'access'),
    (v_analyst_id, 'enrichment', 'update');

    -- Submissions permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_analyst_id, 'submissions', 'view');

    RAISE NOTICE '✅ Inserted % permissions for Compliance Analyst', 11;

    -- ========================================================================
    -- DATA REVIEWER PERMISSIONS
    -- ========================================================================
    
    -- Dashboard permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_reviewer_id, 'dashboard', 'view');

    -- Dataset permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_reviewer_id, 'datasets', 'view');

    -- Rules permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_reviewer_id, 'rules', 'view');

    -- Cases permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_reviewer_id, 'cases', 'view'),
    (v_reviewer_id, 'cases', 'review');

    -- Reporting permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_reviewer_id, 'reporting', 'view');

    -- Enrichment permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_reviewer_id, 'enrichment', 'access');

    -- Submissions permissions
    INSERT INTO public.role_permissions (role_id, module, action) VALUES
    (v_reviewer_id, 'submissions', 'view');

    RAISE NOTICE '✅ Inserted % permissions for Data Reviewer', 9;

    -- ========================================================================
    -- CREATE INDEXES FOR PERFORMANCE
    -- ========================================================================
    
    CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id 
    ON public.role_permissions(role_id);
    
    CREATE INDEX IF NOT EXISTS idx_role_permissions_module_action 
    ON public.role_permissions(module, action);

    RAISE NOTICE '✅ Created performance indexes';

    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Role permissions restoration completed!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Total permissions inserted: 84';
    RAISE NOTICE '  - System Administrator: 38 permissions';
    RAISE NOTICE '  - Compliance Officer: 26 permissions';
    RAISE NOTICE '  - Compliance Analyst: 11 permissions';
    RAISE NOTICE '  - Data Reviewer: 9 permissions';
    RAISE NOTICE '=========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error restoring role permissions: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Uncomment to verify permissions were inserted correctly:
-- SELECT 
--     r.role_name,
--     COUNT(rp.id) as permission_count,
--     array_agg(DISTINCT rp.module ORDER BY rp.module) as modules
-- FROM public.roles r
-- LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
-- WHERE r.organization_id = (SELECT id FROM public.organizations WHERE name = 'Ahlibank' LIMIT 1)
-- GROUP BY r.role_name
-- ORDER BY r.role_name;