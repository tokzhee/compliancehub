-- Migration: Add rules.retire permission for rule retirement functionality
-- Description: Adds rules.retire permission to System Administrator and Compliance Officer roles
--              This permission controls who can retire approved rules

DO $$
DECLARE
    v_admin_role_id UUID;
    v_officer_role_id UUID;
BEGIN
    -- Get System Administrator role ID
    SELECT id INTO v_admin_role_id
    FROM public.roles
    WHERE role_name = 'System Administrator'
    LIMIT 1;

    -- Get Compliance Officer role ID
    SELECT id INTO v_officer_role_id
    FROM public.roles
    WHERE role_name = 'Compliance Officer'
    LIMIT 1;

    -- Add rules.retire permission to System Administrator
    IF v_admin_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (v_admin_role_id, 'rules', 'retire')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Added rules.retire permission to System Administrator role';
    ELSE
        RAISE WARNING 'System Administrator role not found';
    END IF;

    -- Add rules.retire permission to Compliance Officer
    IF v_officer_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (v_officer_role_id, 'rules', 'retire')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Added rules.retire permission to Compliance Officer role';
    ELSE
        RAISE WARNING 'Compliance Officer role not found';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error adding rules.retire permission: %', SQLERRM;
END $$;

-- Add comment for documentation
COMMENT ON TABLE public.role_permissions IS 'Stores granular permissions for roles. The rules.retire permission allows users to retire approved rules, marking them as inactive while preserving historical data.';