-- ============================================================================
-- INSERT SAMPLE CUSTOMER RECORDS FOR UNIFIED VIEW
-- Created: 2026-02-22
-- Purpose: Create 10 sample customer records (5 individuals + 5 entities)
--          with diverse data for testing the unified regulatory view
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
    v_reporting_year INTEGER := 2026;
BEGIN
    -- Get first organization
    SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
    
    -- Get first user for uploaded_by
    SELECT id INTO v_user_id FROM public.user_profiles LIMIT 1;
    
    IF v_org_id IS NULL OR v_user_id IS NULL THEN
        RAISE NOTICE 'No organization or user found. Skipping sample data insertion.';
        RETURN;
    END IF;

    -- ========================================================================
    -- INDIVIDUAL CUSTOMERS (5 records)
    -- ========================================================================
    
    -- Individual 1: US Citizen, High Balance, FATCA Applicable
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-IND-001',
        'John Michael Smith',
        125000.50,
        'US',
        '123-45-6789',
        jsonb_build_object(
            'customer_type', 'INDIVIDUAL',
            'regime_applicability', 'FATCA',
            'segment', 'Conventional',
            'product', 'Savings Account',
            'product_code', 'SAV-001',
            'branch', 'Main Branch',
            'currency_code', 'USD',
            'recalcitrant_customer', false,
            'product_codes_monitoring', 'SAV,CHK',
            'address_line_1', '123 Main Street',
            'address_line_2', 'Apt 4B',
            'city', 'New York',
            'state', 'NY',
            'main_phone_number', '+1-212-555-0101',
            'email', 'john.smith@email.com',
            'first_name', 'John',
            'middle_name', 'Michael',
            'last_name', 'Smith',
            'prefix', 'Mr.',
            'sex', 'M',
            'date_of_birth', '1985-03-15',
            'nationality', 'US',
            'marital_status', 'Married',
            'profession', 'Software Engineer',
            'religion', 'Christian',
            'dual_citizenship', false,
            'social_security_number', '123-45-6789',
            'tax_identification_no', '123-45-6789',
            'identification_type', 'Passport',
            'identification_number', 'P12345678',
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'FATCA1',
            'transmitting_country', 'US',
            'receiving_country', 'US'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Individual 2: UK Citizen, Below Threshold, CRS Applicable
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-IND-002',
        'Emma Charlotte Wilson',
        35000.00,
        'GB',
        'AB123456C',
        jsonb_build_object(
            'customer_type', 'INDIVIDUAL',
            'regime_applicability', 'CRS',
            'segment', 'Islamic',
            'product', 'Islamic Savings',
            'product_code', 'ISL-SAV-001',
            'branch', 'London Branch',
            'currency_code', 'GBP',
            'recalcitrant_customer', false,
            'address_line_1', '45 Oxford Street',
            'city', 'London',
            'state', 'Greater London',
            'main_phone_number', '+44-20-7946-0958',
            'email', 'emma.wilson@email.co.uk',
            'first_name', 'Emma',
            'middle_name', 'Charlotte',
            'last_name', 'Wilson',
            'prefix', 'Ms.',
            'sex', 'F',
            'date_of_birth', '1990-07-22',
            'nationality', 'GB',
            'marital_status', 'Single',
            'profession', 'Marketing Manager',
            'dual_citizenship', false,
            'tax_identification_no', 'AB123456C',
            'identification_type', 'National ID',
            'identification_number', 'UK987654321',
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'CRS1',
            'transmitting_country', 'GB',
            'receiving_country', 'GB'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Individual 3: Canadian, High Balance, BOTH Regimes
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-IND-003',
        'Sarah Marie Johnson',
        250000.75,
        'CA',
        '123456789',
        jsonb_build_object(
            'customer_type', 'INDIVIDUAL',
            'regime_applicability', 'BOTH',
            'segment', 'Conventional',
            'product', 'Investment Account',
            'product_code', 'INV-001',
            'branch', 'Toronto Branch',
            'currency_code', 'CAD',
            'recalcitrant_customer', false,
            'address_line_1', '789 Bay Street',
            'address_line_2', 'Suite 1200',
            'city', 'Toronto',
            'state', 'Ontario',
            'main_phone_number', '+1-416-555-0199',
            'email', 'sarah.johnson@email.ca',
            'first_name', 'Sarah',
            'middle_name', 'Marie',
            'last_name', 'Johnson',
            'prefix', 'Dr.',
            'sex', 'F',
            'date_of_birth', '1978-11-30',
            'nationality', 'CA',
            'marital_status', 'Married',
            'profession', 'Physician',
            'dual_citizenship', true,
            'tax_identification_no', '123456789',
            'identification_type', 'Passport',
            'identification_number', 'CA98765432',
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'BOTH1',
            'transmitting_country', 'CA',
            'receiving_country', 'CA'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Individual 4: German, Below Threshold, CRS
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-IND-004',
        'Hans Peter Mueller',
        42000.00,
        'DE',
        'DE123456789',
        jsonb_build_object(
            'customer_type', 'INDIVIDUAL',
            'regime_applicability', 'CRS',
            'segment', 'Conventional',
            'product', 'Checking Account',
            'product_code', 'CHK-001',
            'branch', 'Berlin Branch',
            'currency_code', 'EUR',
            'recalcitrant_customer', false,
            'address_line_1', 'Unter den Linden 10',
            'city', 'Berlin',
            'state', 'Berlin',
            'main_phone_number', '+49-30-12345678',
            'email', 'hans.mueller@email.de',
            'first_name', 'Hans',
            'middle_name', 'Peter',
            'last_name', 'Mueller',
            'prefix', 'Mr.',
            'sex', 'M',
            'date_of_birth', '1982-05-18',
            'nationality', 'DE',
            'marital_status', 'Single',
            'profession', 'Architect',
            'dual_citizenship', false,
            'tax_identification_no', 'DE123456789',
            'identification_type', 'National ID',
            'identification_number', 'DE987654321',
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'CRS1',
            'transmitting_country', 'DE',
            'receiving_country', 'DE'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Individual 5: Australian, High Balance, BOTH
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-IND-005',
        'Michael James Anderson',
        180000.00,
        'AU',
        '123456789',
        jsonb_build_object(
            'customer_type', 'INDIVIDUAL',
            'regime_applicability', 'BOTH',
            'segment', 'Islamic',
            'product', 'Islamic Investment',
            'product_code', 'ISL-INV-001',
            'branch', 'Sydney Branch',
            'currency_code', 'AUD',
            'recalcitrant_customer', false,
            'address_line_1', '100 George Street',
            'city', 'Sydney',
            'state', 'NSW',
            'main_phone_number', '+61-2-9876-5432',
            'email', 'michael.anderson@email.au',
            'first_name', 'Michael',
            'middle_name', 'James',
            'last_name', 'Anderson',
            'prefix', 'Mr.',
            'sex', 'M',
            'date_of_birth', '1975-09-12',
            'nationality', 'AU',
            'marital_status', 'Married',
            'profession', 'Business Consultant',
            'dual_citizenship', false,
            'tax_identification_no', '123456789',
            'identification_type', 'Passport',
            'identification_number', 'AU12345678',
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'BOTH1',
            'transmitting_country', 'AU',
            'receiving_country', 'AU'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- ENTITY CUSTOMERS (5 records)
    -- ========================================================================

    -- Entity 1: US Corporation, High Balance, FATCA
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-ENT-001',
        'TechCorp Solutions Inc',
        5500000.00,
        'US',
        '12-3456789',
        jsonb_build_object(
            'customer_type', 'ENTITY',
            'regime_applicability', 'FATCA',
            'segment', 'Conventional',
            'product', 'Corporate Account',
            'product_code', 'CORP-001',
            'branch', 'New York Corporate',
            'currency_code', 'USD',
            'recalcitrant_customer', false,
            'address_line_1', '500 Fifth Avenue',
            'address_line_2', 'Floor 25',
            'city', 'New York',
            'state', 'NY',
            'main_phone_number', '+1-212-555-0200',
            'email', 'finance@techcorp.com',
            'entity_name', 'TechCorp Solutions Inc',
            'registration_number', 'US-CORP-123456',
            'country_of_incorporation', 'US',
            'entity_classification', 'Active NFE',
            'GIIN', 'ABC123.12345.SL.840',
            'tax_identification_no_entity', '12-3456789',
            'beneficial_owner_flag', true,
            'directors', jsonb_build_array(
                jsonb_build_object('name', 'Robert Williams', 'nationality', 'US', 'share', '35'),
                jsonb_build_object('name', 'Jennifer Davis', 'nationality', 'US', 'share', '30'),
                jsonb_build_object('name', 'David Brown', 'nationality', 'CA', 'share', '20'),
                jsonb_build_object('name', 'Lisa Martinez', 'nationality', 'US', 'share', '15')
            ),
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'FATCA2',
            'transmitting_country', 'US',
            'receiving_country', 'US'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Entity 2: UK Limited, Below Threshold, CRS
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-ENT-002',
        'Global Trading Ltd',
        45000.00,
        'GB',
        'GB123456789',
        jsonb_build_object(
            'customer_type', 'ENTITY',
            'regime_applicability', 'CRS',
            'segment', 'Conventional',
            'product', 'Business Account',
            'product_code', 'BUS-001',
            'branch', 'London City',
            'currency_code', 'GBP',
            'recalcitrant_customer', false,
            'address_line_1', '10 Downing Street',
            'city', 'London',
            'state', 'Greater London',
            'main_phone_number', '+44-20-7946-0123',
            'email', 'info@globaltrading.co.uk',
            'entity_name', 'Global Trading Ltd',
            'registration_number', 'GB-LTD-789012',
            'country_of_incorporation', 'GB',
            'entity_classification', 'Passive NFE',
            'tax_identification_no_entity', 'GB123456789',
            'beneficial_owner_flag', true,
            'directors', jsonb_build_array(
                jsonb_build_object('name', 'James Thompson', 'nationality', 'GB', 'share', '50'),
                jsonb_build_object('name', 'Patricia White', 'nationality', 'GB', 'share', '50')
            ),
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'CRS2',
            'transmitting_country', 'GB',
            'receiving_country', 'GB'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Entity 3: Singapore Pte Ltd, High Balance, BOTH
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-ENT-003',
        'Asia Pacific Holdings Pte Ltd',
        8750000.00,
        'SG',
        'SG201234567A',
        jsonb_build_object(
            'customer_type', 'ENTITY',
            'regime_applicability', 'BOTH',
            'segment', 'Islamic',
            'product', 'Islamic Corporate',
            'product_code', 'ISL-CORP-001',
            'branch', 'Singapore Central',
            'currency_code', 'SGD',
            'recalcitrant_customer', false,
            'address_line_1', '1 Raffles Place',
            'address_line_2', 'Tower 2, Level 30',
            'city', 'Singapore',
            'state', 'Singapore',
            'main_phone_number', '+65-6123-4567',
            'email', 'contact@asiapacific.sg',
            'entity_name', 'Asia Pacific Holdings Pte Ltd',
            'registration_number', 'SG-201234567A',
            'country_of_incorporation', 'SG',
            'entity_classification', 'FI',
            'GIIN', 'XYZ789.98765.SL.702',
            'tax_identification_no_entity', 'SG201234567A',
            'beneficial_owner_flag', true,
            'directors', jsonb_build_array(
                jsonb_build_object('name', 'Wei Zhang', 'nationality', 'SG', 'share', '40'),
                jsonb_build_object('name', 'Priya Kumar', 'nationality', 'IN', 'share', '30'),
                jsonb_build_object('name', 'Ahmad Hassan', 'nationality', 'MY', 'share', '20'),
                jsonb_build_object('name', 'Tan Wei Ming', 'nationality', 'SG', 'share', '10')
            ),
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'BOTH2',
            'transmitting_country', 'SG',
            'receiving_country', 'SG'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Entity 4: German GmbH, High Balance, CRS
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-ENT-004',
        'Deutsche Manufacturing GmbH',
        3200000.00,
        'DE',
        'DE987654321',
        jsonb_build_object(
            'customer_type', 'ENTITY',
            'regime_applicability', 'CRS',
            'segment', 'Conventional',
            'product', 'Corporate Savings',
            'product_code', 'CORP-SAV-001',
            'branch', 'Frankfurt Branch',
            'currency_code', 'EUR',
            'recalcitrant_customer', false,
            'address_line_1', 'Hauptstrasse 100',
            'city', 'Frankfurt',
            'state', 'Hessen',
            'main_phone_number', '+49-69-12345678',
            'email', 'info@deutschemfg.de',
            'entity_name', 'Deutsche Manufacturing GmbH',
            'registration_number', 'DE-HRB-456789',
            'country_of_incorporation', 'DE',
            'entity_classification', 'Active NFE',
            'tax_identification_no_entity', 'DE987654321',
            'beneficial_owner_flag', true,
            'directors', jsonb_build_array(
                jsonb_build_object('name', 'Klaus Schmidt', 'nationality', 'DE', 'share', '45'),
                jsonb_build_object('name', 'Anna Weber', 'nationality', 'DE', 'share', '35'),
                jsonb_build_object('name', 'Franz Becker', 'nationality', 'AT', 'share', '20')
            ),
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'CRS2',
            'transmitting_country', 'DE',
            'receiving_country', 'DE'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    -- Entity 5: Canadian Corp, High Balance, BOTH
    INSERT INTO public.fatca_dataset (
        organization_id,
        reporting_year,
        account_number,
        account_holder_name,
        account_balance,
        country_code,
        tax_id,
        account_data,
        uploaded_by
    ) VALUES (
        v_org_id,
        v_reporting_year,
        'ACC-ENT-005',
        'Maple Leaf Investments Corp',
        6800000.00,
        'CA',
        'CA987654321',
        jsonb_build_object(
            'customer_type', 'ENTITY',
            'regime_applicability', 'BOTH',
            'segment', 'Islamic',
            'product', 'Islamic Investment',
            'product_code', 'ISL-INV-002',
            'branch', 'Toronto Financial',
            'currency_code', 'CAD',
            'recalcitrant_customer', false,
            'address_line_1', '200 Bay Street',
            'address_line_2', 'Suite 2500',
            'city', 'Toronto',
            'state', 'Ontario',
            'main_phone_number', '+1-416-555-0300',
            'email', 'contact@mapleleaf.ca',
            'entity_name', 'Maple Leaf Investments Corp',
            'registration_number', 'CA-CORP-654321',
            'country_of_incorporation', 'CA',
            'entity_classification', 'FI',
            'GIIN', 'DEF456.45678.SL.124',
            'tax_identification_no_entity', 'CA987654321',
            'beneficial_owner_flag', true,
            'directors', jsonb_build_array(
                jsonb_build_object('name', 'William MacDonald', 'nationality', 'CA', 'share', '30'),
                jsonb_build_object('name', 'Sophie Tremblay', 'nationality', 'CA', 'share', '25'),
                jsonb_build_object('name', 'Raj Patel', 'nationality', 'IN', 'share', '25'),
                jsonb_build_object('name', 'Maria Garcia', 'nationality', 'MX', 'share', '20')
            ),
            'sending_company_in', 'COMP001',
            'doc_type_indic', 'BOTH2',
            'transmitting_country', 'CA',
            'receiving_country', 'CA'
        ),
        v_user_id
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE '10 sample customer records inserted successfully for organization %', v_org_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample customers: %', SQLERRM;
END $$;