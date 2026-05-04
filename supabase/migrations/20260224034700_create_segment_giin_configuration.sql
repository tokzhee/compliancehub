-- Create segment_giin_configuration table for GIIN management
CREATE TABLE IF NOT EXISTS public.segment_giin_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    segment_name TEXT NOT NULL,
    giin TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint safely (drop if exists first)
DO $$
BEGIN
    -- Drop constraint if it exists
    ALTER TABLE public.segment_giin_configuration DROP CONSTRAINT IF EXISTS unique_segment_per_org;
    
    -- Create the constraint
    ALTER TABLE public.segment_giin_configuration 
    ADD CONSTRAINT unique_segment_per_org UNIQUE (organization_id, segment_name);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint handling: %', SQLERRM;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_segment_giin_organization_id ON public.segment_giin_configuration(organization_id);
CREATE INDEX IF NOT EXISTS idx_segment_giin_segment_name ON public.segment_giin_configuration(segment_name);
CREATE INDEX IF NOT EXISTS idx_segment_giin_is_active ON public.segment_giin_configuration(is_active);

-- Enable RLS
ALTER TABLE public.segment_giin_configuration ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organization isolation
DROP POLICY IF EXISTS "users_view_own_org_segment_giin" ON public.segment_giin_configuration;
CREATE POLICY "users_view_own_org_segment_giin"
ON public.segment_giin_configuration
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_manage_segment_giin" ON public.segment_giin_configuration;
CREATE POLICY "users_manage_segment_giin"
ON public.segment_giin_configuration
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Add segment_giin permissions to role_permissions for System Administrator and Compliance Officer
DO $$
DECLARE
    admin_role_id UUID;
    compliance_role_id UUID;
BEGIN
    -- Get System Administrator role ID
    SELECT id INTO admin_role_id 
    FROM public.roles 
    WHERE role_name = 'System Administrator' 
    LIMIT 1;

    -- Get Compliance Officer role ID
    SELECT id INTO compliance_role_id 
    FROM public.roles 
    WHERE role_name = 'Compliance Officer' 
    LIMIT 1;

    -- Add permissions for System Administrator
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES 
            (admin_role_id, 'segment_giin', 'view'),
            (admin_role_id, 'segment_giin', 'create'),
            (admin_role_id, 'segment_giin', 'edit'),
            (admin_role_id, 'segment_giin', 'delete')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Add permissions for Compliance Officer
    IF compliance_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES 
            (compliance_role_id, 'segment_giin', 'view'),
            (compliance_role_id, 'segment_giin', 'create'),
            (compliance_role_id, 'segment_giin', 'edit'),
            (compliance_role_id, 'segment_giin', 'delete')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create sample segment GIIN configurations
DO $$
DECLARE
    ahlibank_org_id UUID;
BEGIN
    -- Get Ahlibank organization ID
    SELECT id INTO ahlibank_org_id 
    FROM public.organizations 
    WHERE name = 'Ahlibank' 
    LIMIT 1;

    IF ahlibank_org_id IS NOT NULL THEN
        -- Insert sample GIIN configurations for Ahlibank segments
        INSERT INTO public.segment_giin_configuration (
            organization_id, segment_name, giin, entity_name,
            address_line1, address_line2, city, state, postal_code, country,
            contact_person, contact_email, contact_phone, is_active
        ) VALUES 
            (
                ahlibank_org_id,
                'Ahlibank',
                'ABC123.00000.LE.634',
                'Ahlibank Qatar',
                'Al Corniche Street',
                'Building 123',
                'Doha',
                'Doha',
                '12345',
                'Qatar',
                'John Smith',
                'john.smith@ahlibank.com.qa',
                '+974-4444-5555',
                true
            ),
            (
                ahlibank_org_id,
                'AhliIslamic',
                'DEF456.00000.LE.634',
                'Ahli Islamic Banking Division',
                'Al Sadd Street',
                'Tower B, Floor 5',
                'Doha',
                'Doha',
                '12346',
                'Qatar',
                'Sarah Ahmed',
                'sarah.ahmed@ahlibank.com.qa',
                '+974-4444-6666',
                true
            )
        ON CONFLICT (organization_id, segment_name) DO NOTHING;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data insertion failed: %', SQLERRM;
END $$;