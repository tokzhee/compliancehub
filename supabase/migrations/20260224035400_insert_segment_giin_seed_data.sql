-- Insert seeded data for Ahlibank and AhliIslamic segments
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
        -- Delete existing sample data for these segments to avoid conflicts
        DELETE FROM public.segment_giin_configuration 
        WHERE organization_id = ahlibank_org_id 
        AND segment_name IN ('Ahlibank', 'AhliIslamic');

        -- Insert Ahlibank segment with Bahrain address
        INSERT INTO public.segment_giin_configuration (
            organization_id, 
            segment_name, 
            giin, 
            entity_name,
            address_line1, 
            address_line2, 
            city, 
            state, 
            postal_code, 
            country,
            contact_person, 
            contact_email, 
            contact_phone, 
            is_active,
            approval_status
        ) VALUES (
            ahlibank_org_id,
            'Ahlibank',
            '8A9B2C.12345.LE.048',
            'Ahlibank',
            'Building 2505, Road 2832',
            'Seef District, Block 428',
            'Manama',
            'Capital Governorate',
            '428',
            'Bahrain',
            'Ahmed Al-Khalifa',
            'ahmed.alkhalifa@ahlibank.com.bh',
            '+973-1729-8000',
            true,
            'approved'
        );

        -- Insert AhliIslamic segment with Bahrain address
        INSERT INTO public.segment_giin_configuration (
            organization_id, 
            segment_name, 
            giin, 
            entity_name,
            address_line1, 
            address_line2, 
            city, 
            state, 
            postal_code, 
            country,
            contact_person, 
            contact_email, 
            contact_phone, 
            is_active,
            approval_status
        ) VALUES (
            ahlibank_org_id,
            'AhliIslamic',
            '7D4E3F.67890.LE.048',
            'AhliIslamic',
            'Building 1234, Road 3618',
            'Diplomatic Area, Block 317',
            'Manama',
            'Capital Governorate',
            '317',
            'Bahrain',
            'Fatima Al-Mansoor',
            'fatima.almansoor@ahlibank.com.bh',
            '+973-1729-9000',
            true,
            'approved'
        );

        RAISE NOTICE 'Successfully inserted seeded data for Ahlibank and AhliIslamic segments';
    ELSE
        RAISE NOTICE 'Ahlibank organization not found. Skipping segment GIIN seed data insertion.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Segment GIIN seed data insertion failed: %', SQLERRM;
END $$;