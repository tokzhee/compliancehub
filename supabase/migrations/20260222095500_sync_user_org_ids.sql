-- ============================================================================
-- SYNC USER ORGANIZATION IDS WITH AHLIBANK
-- Created: 2026-02-22
-- Purpose: Update all user_profiles to use the same organization_id as the
--          LDAP configurations (Ahlibank organization) so that users can see
--          the AD Configuration records when filtered by their organization_id
-- ============================================================================

DO $$
DECLARE
    v_ahlibank_org_id UUID;
    v_users_updated INTEGER := 0;
BEGIN
    -- Get the Ahlibank organization ID (first organization in the system)
    SELECT id INTO v_ahlibank_org_id
    FROM public.organizations
    WHERE name = 'Ahlibank'
    LIMIT 1;

    -- If Ahlibank org not found, get the first organization
    IF v_ahlibank_org_id IS NULL THEN
        SELECT id INTO v_ahlibank_org_id
        FROM public.organizations
        ORDER BY created_at ASC
        LIMIT 1;
        
        RAISE NOTICE 'Ahlibank organization not found, using first organization (ID: %)', v_ahlibank_org_id;
    ELSE
        RAISE NOTICE 'Found Ahlibank organization (ID: %)', v_ahlibank_org_id;
    END IF;

    -- Update all users to use the Ahlibank organization_id
    IF v_ahlibank_org_id IS NOT NULL THEN
        UPDATE public.user_profiles
        SET 
            organization_id = v_ahlibank_org_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id != v_ahlibank_org_id OR organization_id IS NULL;
        
        GET DIAGNOSTICS v_users_updated = ROW_COUNT;
        
        RAISE NOTICE 'Updated % user(s) to Ahlibank organization', v_users_updated;
    ELSE
        RAISE WARNING 'No organization found in the system. Cannot update user organization_ids.';
    END IF;

END $$;

-- Verify the synchronization
DO $$
DECLARE
    v_org_id UUID;
    v_org_name TEXT;
    v_user_count INTEGER;
    v_ldap_count INTEGER;
BEGIN
    -- Get the primary organization
    SELECT id, name INTO v_org_id, v_org_name
    FROM public.organizations
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF v_org_id IS NOT NULL THEN
        -- Count users with this organization_id
        SELECT COUNT(*) INTO v_user_count
        FROM public.user_profiles
        WHERE organization_id = v_org_id;
        
        -- Count LDAP configs with this organization_id
        SELECT COUNT(*) INTO v_ldap_count
        FROM public.ad_configurations
        WHERE organization_id = v_org_id;
        
        RAISE NOTICE '============================================';
        RAISE NOTICE 'Organization Synchronization Complete';
        RAISE NOTICE '============================================';
        RAISE NOTICE 'Organization: % (ID: %)', v_org_name, v_org_id;
        RAISE NOTICE 'Users with this org_id: %', v_user_count;
        RAISE NOTICE 'LDAP configs with this org_id: %', v_ldap_count;
        RAISE NOTICE '============================================';
        RAISE NOTICE 'Users should now see % LDAP configuration(s)', v_ldap_count;
        RAISE NOTICE '============================================';
    END IF;
END $$;