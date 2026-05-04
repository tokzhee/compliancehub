-- Migration: Force add rules.retire and rules.submit_for_approval permissions
-- Description: Ensures rules.retire and rules.submit_for_approval permissions exist
--              for System Administrator and Compliance Officer roles.
--              Uses DELETE + INSERT pattern to guarantee permissions are present.

DO $$
DECLARE
    v_admin_role_id UUID;
    v_officer_role_id UUID;
    v_admin_retire_count INT;
    v_officer_retire_count INT;
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

    -- ========================================================================
    -- System Administrator: Add rules.retire and rules.submit_for_approval
    -- ========================================================================
    IF v_admin_role_id IS NOT NULL THEN
        -- Delete first to avoid conflict, then re-insert
        DELETE FROM public.role_permissions
        WHERE role_id = v_admin_role_id
          AND module = 'rules'
          AND action = 'retire';

        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (v_admin_role_id, 'rules', 'retire');

        RAISE NOTICE 'Added rules.retire to System Administrator';

        -- Also ensure rules.submit_for_approval exists
        DELETE FROM public.role_permissions
        WHERE role_id = v_admin_role_id
          AND module = 'rules'
          AND action = 'submit_for_approval';

        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (v_admin_role_id, 'rules', 'submit_for_approval');

        RAISE NOTICE 'Added rules.submit_for_approval to System Administrator';
    ELSE
        RAISE WARNING 'System Administrator role not found';
    END IF;

    -- ========================================================================
    -- Compliance Officer: Add rules.retire and rules.submit_for_approval
    -- ========================================================================
    IF v_officer_role_id IS NOT NULL THEN
        -- Delete first to avoid conflict, then re-insert
        DELETE FROM public.role_permissions
        WHERE role_id = v_officer_role_id
          AND module = 'rules'
          AND action = 'retire';

        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (v_officer_role_id, 'rules', 'retire');

        RAISE NOTICE 'Added rules.retire to Compliance Officer';

        -- Also ensure rules.submit_for_approval exists
        DELETE FROM public.role_permissions
        WHERE role_id = v_officer_role_id
          AND module = 'rules'
          AND action = 'submit_for_approval';

        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (v_officer_role_id, 'rules', 'submit_for_approval');

        RAISE NOTICE 'Added rules.submit_for_approval to Compliance Officer';
    ELSE
        RAISE WARNING 'Compliance Officer role not found';
    END IF;

    -- Verification
    SELECT COUNT(*) INTO v_admin_retire_count
    FROM public.role_permissions
    WHERE role_id = v_admin_role_id
      AND module = 'rules'
      AND action IN ('retire', 'submit_for_approval');

    SELECT COUNT(*) INTO v_officer_retire_count
    FROM public.role_permissions
    WHERE role_id = v_officer_role_id
      AND module = 'rules'
      AND action IN ('retire', 'submit_for_approval');

    RAISE NOTICE 'System Administrator rules (retire+submit) count: %', v_admin_retire_count;
    RAISE NOTICE 'Compliance Officer rules (retire+submit) count: %', v_officer_retire_count;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error adding retire/submit permissions: %', SQLERRM;
END $$;
