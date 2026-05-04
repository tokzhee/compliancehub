-- ============================================================================
-- ADD SIMULATION SUPPORT TO RULE MANAGEMENT
-- Created: 2026-02-24
-- Purpose: Add simulation_results field to store rule simulation data
--          before rules are saved and submitted for approval
-- ============================================================================

-- Add simulation_results column to fatca_crs_rule_sets
ALTER TABLE public.fatca_crs_rule_sets
ADD COLUMN IF NOT EXISTS simulation_results JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.fatca_crs_rule_sets.simulation_results IS 'Stores last simulation results including matched_count, total_count, sample_matches, and simulation_date';

-- Create index for querying simulation results
CREATE INDEX IF NOT EXISTS idx_fatca_crs_rule_sets_simulation 
ON public.fatca_crs_rule_sets USING GIN (simulation_results);