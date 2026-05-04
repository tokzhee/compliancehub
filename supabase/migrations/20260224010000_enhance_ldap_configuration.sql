-- Enhanced LDAP Configuration Migration
-- Created: 2026-02-24
-- Purpose: Add advanced LDAP configuration fields for comprehensive directory integration

-- ============================================================================
-- SECTION 1: ADD ENHANCED LDAP CONFIGURATION COLUMNS
-- ============================================================================

-- Add LDAP host and port (separate from server URL for better control)
ALTER TABLE public.ad_configurations
ADD COLUMN IF NOT EXISTS ldap_host TEXT,
ADD COLUMN IF NOT EXISTS ldap_port INTEGER DEFAULT 389,
ADD COLUMN IF NOT EXISTS use_ssl BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS use_tls BOOLEAN DEFAULT false;

-- Add user attribute mappings
ALTER TABLE public.ad_configurations
ADD COLUMN IF NOT EXISTS attr_email TEXT DEFAULT 'mail',
ADD COLUMN IF NOT EXISTS attr_username TEXT DEFAULT 'uid',
ADD COLUMN IF NOT EXISTS attr_full_name TEXT DEFAULT 'cn';

-- Add sync schedule settings
ALTER TABLE public.ad_configurations
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_frequency TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS sync_interval_hours INTEGER DEFAULT 24;

-- Add connection timeout
ALTER TABLE public.ad_configurations
ADD COLUMN IF NOT EXISTS connection_timeout_seconds INTEGER DEFAULT 30;

-- Add last sync timestamp
ALTER TABLE public.ad_configurations
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- ============================================================================
-- SECTION 2: UPDATE COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.ad_configurations.ldap_host IS 'LDAP server hostname or IP address';
COMMENT ON COLUMN public.ad_configurations.ldap_port IS 'LDAP server port (389 for LDAP, 636 for LDAPS)';
COMMENT ON COLUMN public.ad_configurations.use_ssl IS 'Enable SSL/LDAPS connection';
COMMENT ON COLUMN public.ad_configurations.use_tls IS 'Enable STARTTLS for LDAP connection';
COMMENT ON COLUMN public.ad_configurations.attr_email IS 'LDAP attribute name for user email';
COMMENT ON COLUMN public.ad_configurations.attr_username IS 'LDAP attribute name for username';
COMMENT ON COLUMN public.ad_configurations.attr_full_name IS 'LDAP attribute name for full name';
COMMENT ON COLUMN public.ad_configurations.sync_enabled IS 'Enable automatic user synchronization';
COMMENT ON COLUMN public.ad_configurations.sync_frequency IS 'Sync frequency: manual, hourly, daily, weekly';
COMMENT ON COLUMN public.ad_configurations.sync_interval_hours IS 'Sync interval in hours for custom frequency';
COMMENT ON COLUMN public.ad_configurations.connection_timeout_seconds IS 'Connection timeout in seconds';
COMMENT ON COLUMN public.ad_configurations.last_sync_at IS 'Timestamp of last successful sync';

-- ============================================================================
-- SECTION 3: UPDATE EXISTING RECORDS WITH DEFAULT VALUES
-- ============================================================================

DO $$
BEGIN
    -- Parse existing ldap_server_url to extract host and port
    UPDATE public.ad_configurations
    SET 
        ldap_host = CASE
            WHEN ldap_server_url ~ '^ldaps?://([^:]+):?([0-9]*)' THEN
                (regexp_matches(ldap_server_url, '^ldaps?://([^:]+):?([0-9]*)'))[1]
            ELSE NULL
        END,
        ldap_port = CASE
            WHEN ldap_server_url ~ '^ldaps?://[^:]+:([0-9]+)' THEN
                (regexp_matches(ldap_server_url, '^ldaps?://[^:]+:([0-9]+)'))[1]::INTEGER
            WHEN ldap_server_url ~ '^ldaps://' THEN 636
            WHEN ldap_server_url ~ '^ldap://' THEN 389
            ELSE 389
        END,
        use_ssl = CASE
            WHEN ldap_server_url ~ '^ldaps://' THEN true
            ELSE false
        END
    WHERE ldap_host IS NULL;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Default values update failed: %', SQLERRM;
END $$;