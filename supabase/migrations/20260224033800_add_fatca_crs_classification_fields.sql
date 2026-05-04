-- ============================================================================
-- ADD FATCA/CRS CLASSIFICATION FIELDS TO FATCA_DATASET
-- Created: 2026-02-24
-- Purpose: Add W9, W8, Recalcitrant Customer, and other classification fields
--          to the account_data JSONB column for customer records
-- ============================================================================

DO $$
DECLARE
    v_record RECORD;
BEGIN
    -- Update existing records to include new classification fields
    -- This adds the fields to account_data JSONB without removing existing data
    FOR v_record IN 
        SELECT id, account_data 
        FROM public.fatca_dataset
    LOOP
        UPDATE public.fatca_dataset
        SET account_data = account_data || jsonb_build_object(
            'w9_form_status', COALESCE(account_data->>'w9_form_status', 'Not Submitted'),
            'w8_form_type', COALESCE(account_data->>'w8_form_type', 'Not Applicable'),
            'recalcitrant_customer', COALESCE((account_data->>'recalcitrant_customer')::boolean, false),
            'us_person_indicator', COALESCE((account_data->>'us_person_indicator')::boolean, false),
            'giin', COALESCE(account_data->>'giin', ''),
            'chapter_3_status', COALESCE(account_data->>'chapter_3_status', ''),
            'chapter_4_status', COALESCE(account_data->>'chapter_4_status', ''),
            'documentation_status', COALESCE(account_data->>'documentation_status', 'Pending'),
            'certification_date', COALESCE(account_data->>'certification_date', ''),
            'self_certification_flag', COALESCE((account_data->>'self_certification_flag')::boolean, false)
        )
        WHERE id = v_record.id;
    END LOOP;
    
    RAISE NOTICE 'Successfully added FATCA/CRS classification fields to % records', 
        (SELECT COUNT(*) FROM public.fatca_dataset);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating classification fields: %', SQLERRM;
END $$;

-- Add sample data with new classification fields for demonstration
DO $$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
BEGIN
    -- Get organization and user for sample data
    SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
    SELECT id INTO v_user_id FROM public.user_profiles LIMIT 1;
    
    IF v_org_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        -- Update first 5 records with diverse classification data
        UPDATE public.fatca_dataset
        SET account_data = account_data || jsonb_build_object(
            'w9_form_status', 'Submitted',
            'w8_form_type', 'Not Applicable',
            'recalcitrant_customer', false,
            'us_person_indicator', true,
            'giin', '',
            'chapter_3_status', 'US Person',
            'chapter_4_status', 'Specified US Person',
            'documentation_status', 'Complete',
            'certification_date', '2026-01-15',
            'self_certification_flag', true
        )
        WHERE account_number = 'ACC-IND-001';
        
        UPDATE public.fatca_dataset
        SET account_data = account_data || jsonb_build_object(
            'w9_form_status', 'Not Submitted',
            'w8_form_type', 'W8-BEN',
            'recalcitrant_customer', false,
            'us_person_indicator', false,
            'giin', '',
            'chapter_3_status', 'Foreign Person',
            'chapter_4_status', 'Active NFFE',
            'documentation_status', 'Complete',
            'certification_date', '2026-02-10',
            'self_certification_flag', true
        )
        WHERE account_number = 'ACC-IND-002';
        
        UPDATE public.fatca_dataset
        SET account_data = account_data || jsonb_build_object(
            'w9_form_status', 'Not Submitted',
            'w8_form_type', 'W8-BEN-E',
            'recalcitrant_customer', false,
            'us_person_indicator', false,
            'giin', '1A2B3C.00000.LE.123',
            'chapter_3_status', 'Foreign Person',
            'chapter_4_status', 'Participating FFI',
            'documentation_status', 'Complete',
            'certification_date', '2025-12-20',
            'self_certification_flag', true
        )
        WHERE account_number = 'ACC-ENT-001';
        
        UPDATE public.fatca_dataset
        SET account_data = account_data || jsonb_build_object(
            'w9_form_status', 'Not Submitted',
            'w8_form_type', 'Not Applicable',
            'recalcitrant_customer', true,
            'us_person_indicator', false,
            'giin', '',
            'chapter_3_status', 'Foreign Person',
            'chapter_4_status', 'Recalcitrant Account Holder',
            'documentation_status', 'Incomplete',
            'certification_date', '',
            'self_certification_flag', false
        )
        WHERE account_number = 'ACC-IND-003';
        
        UPDATE public.fatca_dataset
        SET account_data = account_data || jsonb_build_object(
            'w9_form_status', 'Not Submitted',
            'w8_form_type', 'W8-ECI',
            'recalcitrant_customer', false,
            'us_person_indicator', false,
            'giin', '',
            'chapter_3_status', 'Foreign Person',
            'chapter_4_status', 'Exempt Beneficial Owner',
            'documentation_status', 'Complete',
            'certification_date', '2026-01-05',
            'self_certification_flag', true
        )
        WHERE account_number = 'ACC-ENT-002';
        
        RAISE NOTICE 'Successfully updated sample records with classification data';
    ELSE
        RAISE NOTICE 'Organization or user not found. Skipping sample data update.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating sample data: %', SQLERRM;
END $$;