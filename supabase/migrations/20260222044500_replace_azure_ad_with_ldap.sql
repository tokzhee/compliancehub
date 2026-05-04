-- Replace Azure AD with LDAP Configuration Migration
-- Created: 2026-02-22
-- Purpose: Replace Azure AD authentication with LDAP authentication

-- ============================================================================
-- SECTION 1: DROP AZURE AD COLUMNS AND ADD LDAP COLUMNS
-- ============================================================================

-- Remove Azure AD specific columns
ALTER TABLE public.ad_configurations
DROP COLUMN IF EXISTS tenant_id,
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS authority_url;

-- Add LDAP specific columns
ALTER TABLE public.ad_configurations
ADD COLUMN IF NOT EXISTS ldap_server_url TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS base_dn TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bind_dn TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bind_password TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS user_search_base TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS user_search_filter TEXT NOT NULL DEFAULT '(uid={{username}})',
ADD COLUMN IF NOT EXISTS group_search_base TEXT;

-- ============================================================================
-- SECTION 2: UPDATE COMMENTS
-- ============================================================================

COMMENT ON TABLE public.ad_configurations IS 'Stores multiple LDAP configurations per organization';
COMMENT ON COLUMN public.ad_configurations.ldap_server_url IS 'LDAP server URL (e.g., ldap://ldap.example.com:389 or ldaps://ldap.example.com:636)';
COMMENT ON COLUMN public.ad_configurations.base_dn IS 'Base Distinguished Name for LDAP searches (e.g., dc=example,dc=com)';
COMMENT ON COLUMN public.ad_configurations.bind_dn IS 'Bind DN for LDAP admin user (e.g., cn=admin,dc=example,dc=com)';
COMMENT ON COLUMN public.ad_configurations.bind_password IS 'Password for bind DN user';
COMMENT ON COLUMN public.ad_configurations.user_search_base IS 'Search base for users (e.g., ou=users,dc=example,dc=com)';
COMMENT ON COLUMN public.ad_configurations.user_search_filter IS 'LDAP filter for user search (e.g., (uid={{username}}) or (mail={{username}}))';
COMMENT ON COLUMN public.ad_configurations.group_search_base IS 'Search base for groups (optional, e.g., ou=groups,dc=example,dc=com)';

-- ============================================================================
-- SECTION 3: UPDATE MOCK DATA
-- ============================================================================

DO $$
DECLARE
    org1_id UUID;
    org2_id UUID;
BEGIN
    -- Get existing organization IDs
    SELECT id INTO org1_id FROM public.organizations WHERE name = 'Global Financial Corp' LIMIT 1;
    SELECT id INTO org2_id FROM public.organizations WHERE name = 'Regional Bank Ltd' LIMIT 1;

    -- Clear existing AD configurations
    DELETE FROM public.ad_configurations;

    IF org1_id IS NOT NULL THEN
        -- Create LDAP configurations for organization 1
        INSERT INTO public.ad_configurations (
            id, organization_id, config_name, 
            ldap_server_url, base_dn, bind_dn, bind_password,
            user_search_base, user_search_filter, group_search_base, status
        ) VALUES
            (
                gen_random_uuid(),
                org1_id,
                'Primary LDAP',
                'ldap://ldap.globalfinancial.com:389',
                'dc=globalfinancial,dc=com',
                'cn=admin,dc=globalfinancial,dc=com',
                'admin_password_here',
                'ou=users,dc=globalfinancial,dc=com',
                '(uid={{username}})',
                'ou=groups,dc=globalfinancial,dc=com',
                'active'::public.ad_config_status
            ),
            (
                gen_random_uuid(),
                org1_id,
                'Secondary LDAP',
                'ldaps://ldap-backup.globalfinancial.com:636',
                'dc=globalfinancial,dc=com',
                'cn=ldapadmin,dc=globalfinancial,dc=com',
                'backup_password_here',
                'ou=employees,dc=globalfinancial,dc=com',
                '(mail={{username}})',
                'ou=departments,dc=globalfinancial,dc=com',
                'active'::public.ad_config_status
            )
        ON CONFLICT (organization_id, config_name) DO NOTHING;
    END IF;

    IF org2_id IS NOT NULL THEN
        -- Create LDAP configuration for organization 2
        INSERT INTO public.ad_configurations (
            id, organization_id, config_name,
            ldap_server_url, base_dn, bind_dn, bind_password,
            user_search_base, user_search_filter, group_search_base, status
        ) VALUES
            (
                gen_random_uuid(),
                org2_id,
                'Corporate LDAP',
                'ldap://ldap.regionalbank.com:389',
                'dc=regionalbank,dc=com',
                'cn=binduser,dc=regionalbank,dc=com',
                'bind_password_here',
                'ou=staff,dc=regionalbank,dc=com',
                '(sAMAccountName={{username}})',
                NULL,
                'active'::public.ad_config_status
            )
        ON CONFLICT (organization_id, config_name) DO NOTHING;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data update failed: %', SQLERRM;
END $$;