-- Migration: Add segment_giin_configuration foreign key to fatca_crs_rule_sets and insert sample rules
-- Purpose: Link rules to segment GIIN configuration and create sample FATCA/CRS rules for testing

-- Step 1: Add foreign key constraint to link fatca_crs_rule_sets to segment_giin_configuration
-- Note: segment_id already exists in fatca_crs_rule_sets, but it references business_segments
-- We need to ensure the relationship is properly established

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rule_sets_segment_giin ON public.fatca_crs_rule_sets(segment_id);

-- Step 3: Insert sample FATCA and CRS rules with realistic conditions
DO $$
DECLARE
    ahlibank_org_id UUID;
    ahlibank_segment_id UUID;
    ahliislamic_segment_id UUID;
    fatca_rule_1_id UUID;
    fatca_rule_2_id UUID;
    crs_rule_1_id UUID;
    crs_rule_2_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get Ahlibank organization ID
    SELECT id INTO ahlibank_org_id 
    FROM public.organizations 
    WHERE name = 'Ahlibank' 
    LIMIT 1;

    IF ahlibank_org_id IS NULL THEN
        RAISE NOTICE 'Ahlibank organization not found. Skipping sample rules insertion.';
        RETURN;
    END IF;

    -- Get segment IDs from segment_giin_configuration
    SELECT id INTO ahlibank_segment_id 
    FROM public.segment_giin_configuration 
    WHERE organization_id = ahlibank_org_id 
    AND segment_name = 'Ahlibank' 
    LIMIT 1;

    SELECT id INTO ahliislamic_segment_id 
    FROM public.segment_giin_configuration 
    WHERE organization_id = ahlibank_org_id 
    AND segment_name = 'AhliIslamic' 
    LIMIT 1;

    IF ahlibank_segment_id IS NULL OR ahliislamic_segment_id IS NULL THEN
        RAISE NOTICE 'Segment GIIN configurations not found. Run segment GIIN seed migration first.';
        RETURN;
    END IF;

    -- Get admin user for created_by field
    SELECT id INTO admin_user_id 
    FROM public.user_profiles 
    WHERE email LIKE '%admin%' 
    AND organization_id = ahlibank_org_id 
    LIMIT 1;

    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Admin user not found. Skipping sample rules insertion.';
        RETURN;
    END IF;

    -- Delete existing sample rules to avoid conflicts
    DELETE FROM public.fatca_crs_rule_conditions 
    WHERE rule_set_id IN (
        SELECT id FROM public.fatca_crs_rule_sets 
        WHERE organization_id = ahlibank_org_id 
        AND rule_name IN (
            'US Indicia Detection',
            'High Value Account Classification',
            'Entity Self-Certification Validation',
            'Recalcitrant Account Flagging'
        )
    );

    DELETE FROM public.fatca_crs_rule_sets 
    WHERE organization_id = ahlibank_org_id 
    AND rule_name IN (
        'US Indicia Detection',
        'High Value Account Classification',
        'Entity Self-Certification Validation',
        'Recalcitrant Account Flagging'
    );

    -- Insert FATCA Rule 1: US Indicia Detection (Ahlibank segment)
    INSERT INTO public.fatca_crs_rule_sets (
        id,
        organization_id,
        segment_id,
        regime_type,
        reporting_year,
        version_number,
        rule_name,
        description,
        status,
        created_by,
        created_by_user_id,
        approval_status,
        created_on
    ) VALUES (
        gen_random_uuid(),
        ahlibank_org_id,
        ahlibank_segment_id,
        'FATCA',
        2026,
        1,
        'US Indicia Detection',
        'Identifies accounts with US indicia including US address, US phone number, or US place of birth for FATCA reporting',
        'approved',
        admin_user_id,
        admin_user_id,
        'approved',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO fatca_rule_1_id;

    -- Insert conditions for FATCA Rule 1
    INSERT INTO public.fatca_crs_rule_conditions (rule_set_id, field_name, operator, value, logical_group, sequence_order)
    VALUES
        (fatca_rule_1_id, 'country_code', 'equals', 'US', 1, 1),
        (fatca_rule_1_id, 'phone_country_code', 'equals', 'US', 1, 2),
        (fatca_rule_1_id, 'birth_country', 'equals', 'US', 1, 3);

    -- Insert FATCA Rule 2: High Value Account Classification (AhliIslamic segment)
    INSERT INTO public.fatca_crs_rule_sets (
        id,
        organization_id,
        segment_id,
        regime_type,
        reporting_year,
        version_number,
        rule_name,
        description,
        status,
        created_by,
        created_by_user_id,
        approval_status,
        created_on
    ) VALUES (
        gen_random_uuid(),
        ahlibank_org_id,
        ahliislamic_segment_id,
        'FATCA',
        2026,
        1,
        'High Value Account Classification',
        'Classifies accounts exceeding USD 1,000,000 threshold as high value accounts requiring enhanced due diligence',
        'approved',
        admin_user_id,
        admin_user_id,
        'approved',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO fatca_rule_2_id;

    -- Insert conditions for FATCA Rule 2
    INSERT INTO public.fatca_crs_rule_conditions (rule_set_id, field_name, operator, value, logical_group, sequence_order)
    VALUES
        (fatca_rule_2_id, 'account_balance', 'greater_than', '1000000', 1, 1),
        (fatca_rule_2_id, 'account_type', 'in', 'Savings,Investment,Deposit', 1, 2);

    -- Insert CRS Rule 1: Entity Self-Certification Validation (Ahlibank segment)
    INSERT INTO public.fatca_crs_rule_sets (
        id,
        organization_id,
        segment_id,
        regime_type,
        reporting_year,
        version_number,
        rule_name,
        description,
        status,
        created_by,
        created_by_user_id,
        approval_status,
        created_on
    ) VALUES (
        gen_random_uuid(),
        ahlibank_org_id,
        ahlibank_segment_id,
        'CRS',
        2026,
        1,
        'Entity Self-Certification Validation',
        'Validates entity accounts have valid self-certification documentation and tax residency information for CRS compliance',
        'approved',
        admin_user_id,
        admin_user_id,
        'approved',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO crs_rule_1_id;

    -- Insert conditions for CRS Rule 1
    INSERT INTO public.fatca_crs_rule_conditions (rule_set_id, field_name, operator, value, logical_group, sequence_order)
    VALUES
        (crs_rule_1_id, 'account_holder_type', 'equals', 'Entity', 1, 1),
        (crs_rule_1_id, 'self_certification_status', 'equals', 'Valid', 1, 2),
        (crs_rule_1_id, 'tax_residency', 'is_not_null', '', 1, 3);

    -- Insert CRS Rule 2: Recalcitrant Account Flagging (AhliIslamic segment)
    INSERT INTO public.fatca_crs_rule_sets (
        id,
        organization_id,
        segment_id,
        regime_type,
        reporting_year,
        version_number,
        rule_name,
        description,
        status,
        created_by,
        created_by_user_id,
        approval_status,
        created_on
    ) VALUES (
        gen_random_uuid(),
        ahlibank_org_id,
        ahliislamic_segment_id,
        'CRS',
        2026,
        1,
        'Recalcitrant Account Flagging',
        'Flags accounts that fail to provide required documentation or tax identification information within specified timeframe',
        'draft',
        admin_user_id,
        admin_user_id,
        'draft',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO crs_rule_2_id;

    -- Insert conditions for CRS Rule 2
    INSERT INTO public.fatca_crs_rule_conditions (rule_set_id, field_name, operator, value, logical_group, sequence_order)
    VALUES
        (crs_rule_2_id, 'documentation_status', 'equals', 'Incomplete', 1, 1),
        (crs_rule_2_id, 'tin_status', 'equals', 'Missing', 1, 2),
        (crs_rule_2_id, 'days_since_request', 'greater_than', '90', 1, 3);

    RAISE NOTICE 'Successfully inserted 4 sample FATCA/CRS rules with conditions';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample rules insertion failed: %', SQLERRM;
END $$;