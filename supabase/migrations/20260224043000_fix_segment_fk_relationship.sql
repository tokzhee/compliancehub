-- Migration: Fix segment foreign key relationship
-- Purpose: Update fatca_crs_rule_sets to reference segment_giin_configuration instead of business_segments
-- This fixes the issue where segment dropdown shows 2 records but names don't display

DO $$
BEGIN
    -- Step 1: Drop existing foreign key constraint on fatca_crs_rule_sets
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fatca_crs_rule_sets_segment_id_fkey' 
        AND table_name = 'fatca_crs_rule_sets'
    ) THEN
        ALTER TABLE public.fatca_crs_rule_sets 
        DROP CONSTRAINT fatca_crs_rule_sets_segment_id_fkey;
        RAISE NOTICE 'Dropped old foreign key constraint on fatca_crs_rule_sets';
    END IF;

    -- Step 2: Add new foreign key constraint pointing to segment_giin_configuration
    ALTER TABLE public.fatca_crs_rule_sets 
    ADD CONSTRAINT fatca_crs_rule_sets_segment_id_fkey 
    FOREIGN KEY (segment_id) 
    REFERENCES public.segment_giin_configuration(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Added new foreign key constraint to segment_giin_configuration';

    -- Step 3: Drop existing foreign key constraint on fatca_crs_dataset_batch
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fatca_crs_dataset_batch_segment_id_fkey' 
        AND table_name = 'fatca_crs_dataset_batch'
    ) THEN
        ALTER TABLE public.fatca_crs_dataset_batch 
        DROP CONSTRAINT fatca_crs_dataset_batch_segment_id_fkey;
        RAISE NOTICE 'Dropped old foreign key constraint on fatca_crs_dataset_batch';
    END IF;

    -- Step 4: Add new foreign key constraint for dataset_batch
    ALTER TABLE public.fatca_crs_dataset_batch 
    ADD CONSTRAINT fatca_crs_dataset_batch_segment_id_fkey 
    FOREIGN KEY (segment_id) 
    REFERENCES public.segment_giin_configuration(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Added new foreign key constraint for dataset_batch';

    -- Step 5: Drop existing foreign key constraint on user_segment_roles
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_segment_roles_segment_id_fkey' 
        AND table_name = 'user_segment_roles'
    ) THEN
        ALTER TABLE public.user_segment_roles 
        DROP CONSTRAINT user_segment_roles_segment_id_fkey;
        RAISE NOTICE 'Dropped old foreign key constraint on user_segment_roles';
    END IF;

    -- Step 6: Add new foreign key constraint for user_segment_roles
    ALTER TABLE public.user_segment_roles 
    ADD CONSTRAINT user_segment_roles_segment_id_fkey 
    FOREIGN KEY (segment_id) 
    REFERENCES public.segment_giin_configuration(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Added new foreign key constraint for user_segment_roles';

    RAISE NOTICE 'Successfully migrated all segment foreign keys to segment_giin_configuration';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during migration: %', SQLERRM;
        RAISE;
END $$;

-- Step 7: Create index for the new foreign key relationship
CREATE INDEX IF NOT EXISTS idx_rule_sets_segment_giin_fk 
ON public.fatca_crs_rule_sets(segment_id);

CREATE INDEX IF NOT EXISTS idx_dataset_batch_segment_giin_fk 
ON public.fatca_crs_dataset_batch(segment_id);

CREATE INDEX IF NOT EXISTS idx_user_segment_roles_segment_giin_fk 
ON public.user_segment_roles(segment_id);
