-- Migration: Add Ahlibank logo to branding_config
-- Description: Updates the branding_config table with Ahlibank logo image path

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get Ahlibank organization ID
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE name = 'Ahlibank'
    LIMIT 1;

    -- Update branding config with logo URL
    IF v_org_id IS NOT NULL THEN
        UPDATE public.branding_config
        SET
            logo_url = '/assets/images/image-1771788194868.png',
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = v_org_id;

        -- If no branding config exists, create one with logo
        IF NOT FOUND THEN
            INSERT INTO public.branding_config (organization_id, logo_url, display_name, primary_color, secondary_color)
            VALUES (v_org_id, '/assets/images/image-1771788194868.png', 'Ahlibank', '#1e40af', '#3b82f6')
            ON CONFLICT (organization_id) DO UPDATE
            SET logo_url = '/assets/images/image-1771788194868.png', updated_at = CURRENT_TIMESTAMP;
        END IF;

        RAISE NOTICE 'Ahlibank logo updated successfully';
    ELSE
        RAISE NOTICE 'Ahlibank organization not found';
    END IF;
END $$;