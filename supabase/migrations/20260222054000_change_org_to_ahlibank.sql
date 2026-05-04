-- ============================================================================
-- CHANGE DEFAULT ORGANIZATION TO AHLIBANK
-- Created: 2026-02-22
-- Purpose: Rename the first organization to 'Ahlibank' so all existing
--          sample data (users, roles, FATCA datasets, etc.) becomes
--          associated with Ahlibank organization
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get the first organization (Global Financial Services Inc)
    SELECT id INTO v_org_id 
    FROM public.organizations 
    WHERE name = 'Global Financial Services Inc'
    LIMIT 1;

    -- If found, update it to Ahlibank
    IF v_org_id IS NOT NULL THEN
        UPDATE public.organizations
        SET 
            name = 'Ahlibank',
            status = 'active'::public.organization_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_org_id;
        
        RAISE NOTICE 'Successfully renamed organization to Ahlibank (ID: %)', v_org_id;
    ELSE
        -- If no organization exists, create Ahlibank as the first organization
        INSERT INTO public.organizations (name, status)
        VALUES ('Ahlibank', 'active'::public.organization_status)
        RETURNING id INTO v_org_id;
        
        RAISE NOTICE 'Created new Ahlibank organization (ID: %)', v_org_id;
    END IF;

    -- Update branding config for Ahlibank if it exists
    UPDATE public.branding_config
    SET 
        display_name = 'Ahlibank',
        updated_at = CURRENT_TIMESTAMP
    WHERE organization_id = v_org_id;

    -- If no branding config exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.branding_config (organization_id, display_name, primary_color, secondary_color)
        VALUES (v_org_id, 'Ahlibank', '#1e40af', '#3b82f6')
        ON CONFLICT (organization_id) DO UPDATE
        SET display_name = 'Ahlibank', updated_at = CURRENT_TIMESTAMP;
    END IF;

END $$;

-- Verify the change
DO $$
DECLARE
    v_org_name TEXT;
    v_user_count INTEGER;
    v_dataset_count INTEGER;
    v_role_count INTEGER;
BEGIN
    -- Get organization name
    SELECT name INTO v_org_name FROM public.organizations ORDER BY created_at LIMIT 1;
    
    -- Count associated records
    SELECT COUNT(*) INTO v_user_count 
    FROM public.user_profiles 
    WHERE organization_id = (SELECT id FROM public.organizations ORDER BY created_at LIMIT 1);
    
    SELECT COUNT(*) INTO v_dataset_count 
    FROM public.fatca_dataset 
    WHERE organization_id = (SELECT id FROM public.organizations ORDER BY created_at LIMIT 1);
    
    SELECT COUNT(*) INTO v_role_count 
    FROM public.roles 
    WHERE organization_id = (SELECT id FROM public.organizations ORDER BY created_at LIMIT 1);
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Organization Setup Complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Organization Name: %', v_org_name;
    RAISE NOTICE 'Associated Users: %', v_user_count;
    RAISE NOTICE 'Associated Datasets: %', v_dataset_count;
    RAISE NOTICE 'Associated Roles: %', v_role_count;
    RAISE NOTICE '============================================';
END $$;