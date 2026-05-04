-- Migration: Add granular RBAC permissions for dynamic role management
-- This migration adds comprehensive module-level permissions to support dynamic RBAC

-- First, clear any existing permissions to avoid conflicts
DELETE FROM public.role_permissions;

-- Insert granular permissions for Compliance Officer role
DO $$
DECLARE
    v_compliance_officer_id UUID;
BEGIN
    -- Get Compliance Officer role ID
    SELECT id INTO v_compliance_officer_id
    FROM public.roles
    WHERE role_name = 'Compliance Officer'
    LIMIT 1;

    IF v_compliance_officer_id IS NOT NULL THEN
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
    END IF;
END $$;

-- Insert granular permissions for Compliance Analyst role
DO $$
DECLARE
    v_analyst_id UUID;
BEGIN
    -- Get Compliance Analyst role ID
    SELECT id INTO v_analyst_id
    FROM public.roles
    WHERE role_name = 'Compliance Analyst'
    LIMIT 1;

    IF v_analyst_id IS NOT NULL THEN
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
    END IF;
END $$;

-- Insert granular permissions for System Administrator role
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Get System Administrator role ID
    SELECT id INTO v_admin_id
    FROM public.roles
    WHERE role_name = 'System Administrator'
    LIMIT 1;

    IF v_admin_id IS NOT NULL THEN
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
    END IF;
END $$;

-- Insert granular permissions for Data Reviewer role
DO $$
DECLARE
    v_reviewer_id UUID;
BEGIN
    -- Get Data Reviewer role ID
    SELECT id INTO v_reviewer_id
    FROM public.roles
    WHERE role_name = 'Data Reviewer'
    LIMIT 1;

    IF v_reviewer_id IS NOT NULL THEN
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
    END IF;
END $$;

-- Create index for faster permission lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module_action ON public.role_permissions(module, action);