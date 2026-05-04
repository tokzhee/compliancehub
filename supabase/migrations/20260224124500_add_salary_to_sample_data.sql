-- ============================================================================
-- ADD SALARY DATA TO SAMPLE CUSTOMERS
-- Created: 2026-02-24
-- Purpose: Add salary/annual_income fields to existing sample customer records
--          to support salary-based rule simulations
-- ============================================================================

DO $$
DECLARE
    v_record RECORD;
BEGIN
    -- Update Individual 1: John Michael Smith (High salary - Software Engineer)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', 125000,
        'annual_income', 125000
    )
    WHERE account_number = 'ACC-IND-001'
    AND account_data->>'salary' IS NULL;

    -- Update Individual 2: Emma Charlotte Wilson (Medium salary - Marketing Manager)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', 65000,
        'annual_income', 65000
    )
    WHERE account_number = 'ACC-IND-002'
    AND account_data->>'salary' IS NULL;

    -- Update Individual 3: Sarah Marie Johnson (Very high salary - Physician)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', 280000,
        'annual_income', 280000
    )
    WHERE account_number = 'ACC-IND-003'
    AND account_data->>'salary' IS NULL;

    -- Update Individual 4: Hans Peter Mueller (Medium salary - Architect)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', 72000,
        'annual_income', 72000
    )
    WHERE account_number = 'ACC-IND-004'
    AND account_data->>'salary' IS NULL;

    -- Update Individual 5: Australian (High salary)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', 95000,
        'annual_income', 95000
    )
    WHERE account_number = 'ACC-IND-005'
    AND account_data->>'salary' IS NULL;

    -- Update Entity 1: Tech Corp (No salary - entity)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', NULL,
        'annual_income', NULL,
        'annual_revenue', 5000000
    )
    WHERE account_number = 'ACC-ENT-001'
    AND account_data->>'salary' IS NULL;

    -- Update Entity 2: Investment Fund (No salary - entity)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', NULL,
        'annual_income', NULL,
        'annual_revenue', 2500000
    )
    WHERE account_number = 'ACC-ENT-002'
    AND account_data->>'salary' IS NULL;

    -- Update Entity 3: Consulting LLC (No salary - entity)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', NULL,
        'annual_income', NULL,
        'annual_revenue', 1200000
    )
    WHERE account_number = 'ACC-ENT-003'
    AND account_data->>'salary' IS NULL;

    -- Update Entity 4: Trading Company (No salary - entity)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', NULL,
        'annual_income', NULL,
        'annual_revenue', 800000
    )
    WHERE account_number = 'ACC-ENT-004'
    AND account_data->>'salary' IS NULL;

    -- Update Entity 5: Real Estate Trust (No salary - entity)
    UPDATE public.fatca_dataset
    SET account_data = account_data || jsonb_build_object(
        'salary', NULL,
        'annual_income', NULL,
        'annual_revenue', 3500000
    )
    WHERE account_number = 'ACC-ENT-005'
    AND account_data->>'salary' IS NULL;

    RAISE NOTICE 'Successfully added salary data to sample customer records';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding salary data: %', SQLERRM;
END $$;

-- Verify the updates
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.fatca_dataset
    WHERE account_data->>'salary' IS NOT NULL
    OR account_data->>'annual_income' IS NOT NULL;

    RAISE NOTICE 'Total records with salary/income data: %', v_count;
END $$;
