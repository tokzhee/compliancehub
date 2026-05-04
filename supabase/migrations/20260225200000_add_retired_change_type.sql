-- Add 'retired' to the change_type_check constraint on fatca_crs_rule_version_history
-- The existing constraint only allows: 'created', 'updated', 'approved', 'rejected', 'submitted'
-- Rule retirement inserts change_type = 'retired' which violates the constraint

-- Drop the existing check constraint
ALTER TABLE public.fatca_crs_rule_version_history
DROP CONSTRAINT IF EXISTS fatca_crs_rule_version_history_change_type_check;

-- Re-add the constraint with 'retired' included
ALTER TABLE public.fatca_crs_rule_version_history
ADD CONSTRAINT fatca_crs_rule_version_history_change_type_check
CHECK (change_type IN ('created', 'updated', 'approved', 'rejected', 'submitted', 'retired'));
