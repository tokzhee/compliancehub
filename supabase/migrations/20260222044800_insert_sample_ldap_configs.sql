-- Insert Sample LDAP Configuration Records
-- Created: 2026-02-22
-- Purpose: Add sample LDAP configurations for Production and Test environments
-- Fixed: Insert for ALL organizations to ensure visibility

DO $$
DECLARE
    org_record RECORD;
    records_inserted INTEGER := 0;
BEGIN
    -- Loop through ALL organizations and insert sample configs for each
    FOR org_record IN SELECT id, name FROM public.organizations LOOP
        -- Insert ProdLDAP Configuration for this organization
        INSERT INTO public.ad_configurations (
            id,
            organization_id,
            config_name,
            ldap_server_url,
            base_dn,
            bind_dn,
            bind_password,
            user_search_base,
            user_search_filter,
            group_search_base,
            status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            org_record.id,
            'ProdLDAP',
            'ldaps://prod-ldap.company.com:636',
            'dc=company,dc=com',
            'cn=ldapadmin,dc=company,dc=com',
            'prod_secure_password_2026',
            'ou=users,dc=company,dc=com',
            '(uid={{username}})',
            'ou=groups,dc=company,dc=com',
            'active'::public.ad_config_status,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (organization_id, config_name) DO UPDATE SET
            ldap_server_url = EXCLUDED.ldap_server_url,
            base_dn = EXCLUDED.base_dn,
            bind_dn = EXCLUDED.bind_dn,
            bind_password = EXCLUDED.bind_password,
            user_search_base = EXCLUDED.user_search_base,
            user_search_filter = EXCLUDED.user_search_filter,
            group_search_base = EXCLUDED.group_search_base,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP;

        -- Insert TestLDAP Configuration for this organization
        INSERT INTO public.ad_configurations (
            id,
            organization_id,
            config_name,
            ldap_server_url,
            base_dn,
            bind_dn,
            bind_password,
            user_search_base,
            user_search_filter,
            group_search_base,
            status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            org_record.id,
            'TestLDAP',
            'ldaps://test-ldap.company.com:636',
            'dc=test,dc=company,dc=com',
            'cn=testadmin,dc=test,dc=company,dc=com',
            'test_secure_password_2026',
            'ou=testusers,dc=test,dc=company,dc=com',
            '(mail={{username}})',
            'ou=testgroups,dc=test,dc=company,dc=com',
            'active'::public.ad_config_status,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (organization_id, config_name) DO UPDATE SET
            ldap_server_url = EXCLUDED.ldap_server_url,
            base_dn = EXCLUDED.base_dn,
            bind_dn = EXCLUDED.bind_dn,
            bind_password = EXCLUDED.bind_password,
            user_search_base = EXCLUDED.user_search_base,
            user_search_filter = EXCLUDED.user_search_filter,
            group_search_base = EXCLUDED.group_search_base,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP;

        records_inserted := records_inserted + 2;
        RAISE NOTICE 'Inserted ProdLDAP and TestLDAP for organization: % (ID: %)', org_record.name, org_record.id;
    END LOOP;

    IF records_inserted > 0 THEN
        RAISE NOTICE 'Successfully inserted % sample LDAP configurations across all organizations', records_inserted;
    ELSE
        RAISE NOTICE 'No organizations found. Please create an organization first.';
    END IF;
END $$;