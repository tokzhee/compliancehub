-- Migration: Add component-level permissions for granular UI control
-- This migration adds view_count permissions for dashboard metrics and view permissions for all screens

-- Insert component-level permissions for System Administrator role
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
        -- Dashboard metric view_count permissions
        INSERT INTO public.role_permissions (role_id, module, action) VALUES
        (v_admin_id, 'datasets', 'view_count'),
        (v_admin_id, 'cases', 'view_count'),
        (v_admin_id, 'rules', 'view_count'),
        (v_admin_id, 'users', 'view_count'),
        (v_admin_id, 'roles', 'view_count'),
        (v_admin_id, 'reports', 'view_count'),
        (v_admin_id, 'submissions', 'view_count'),
        (v_admin_id, 'sessions', 'view_count'),
        (v_admin_id, 'ldap', 'view_count'),
        (v_admin_id, 'enrichment', 'view_count')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert component-level permissions for Compliance Officer role
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
        -- Dashboard metric view_count permissions
        INSERT INTO public.role_permissions (role_id, module, action) VALUES
        (v_compliance_officer_id, 'datasets', 'view_count'),
        (v_compliance_officer_id, 'cases', 'view_count'),
        (v_compliance_officer_id, 'rules', 'view_count'),
        (v_compliance_officer_id, 'reports', 'view_count'),
        (v_compliance_officer_id, 'submissions', 'view_count'),
        (v_compliance_officer_id, 'enrichment', 'view_count')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert component-level permissions for Compliance Analyst role
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
        -- Dashboard metric view_count permissions
        INSERT INTO public.role_permissions (role_id, module, action) VALUES
        (v_analyst_id, 'datasets', 'view_count'),
        (v_analyst_id, 'cases', 'view_count'),
        (v_analyst_id, 'rules', 'view_count'),
        (v_analyst_id, 'reports', 'view_count'),
        (v_analyst_id, 'submissions', 'view_count'),
        (v_analyst_id, 'enrichment', 'view_count')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert component-level permissions for Data Reviewer role
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
        -- Dashboard metric view_count permissions
        INSERT INTO public.role_permissions (role_id, module, action) VALUES
        (v_reviewer_id, 'datasets', 'view_count'),
        (v_reviewer_id, 'cases', 'view_count'),
        (v_reviewer_id, 'rules', 'view_count'),
        (v_reviewer_id, 'reports', 'view_count'),
        (v_reviewer_id, 'submissions', 'view_count'),
        (v_reviewer_id, 'enrichment', 'view_count')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create index for faster permission lookups on component-level permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_view_count ON public.role_permissions(module, action) WHERE action = 'view_count';