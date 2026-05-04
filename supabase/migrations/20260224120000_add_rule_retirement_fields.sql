-- Migration: Add rule retirement fields for soft-delete functionality
-- Description: Adds is_active, retirement_date, retirement_reason, retired_by_user_id fields
--              Updates version history trigger to capture retirement events

-- Add retirement fields to fatca_crs_rule_sets table
DO $$
BEGIN
  -- Add is_active column (default true)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fatca_crs_rule_sets' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.fatca_crs_rule_sets 
    ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
  END IF;

  -- Add retirement_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fatca_crs_rule_sets' 
    AND column_name = 'retirement_date'
  ) THEN
    ALTER TABLE public.fatca_crs_rule_sets 
    ADD COLUMN retirement_date TIMESTAMPTZ;
  END IF;

  -- Add retirement_reason column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fatca_crs_rule_sets' 
    AND column_name = 'retirement_reason'
  ) THEN
    ALTER TABLE public.fatca_crs_rule_sets 
    ADD COLUMN retirement_reason TEXT;
  END IF;

  -- Add retired_by_user_id column with FK to users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fatca_crs_rule_sets' 
    AND column_name = 'retired_by_user_id'
  ) THEN
    ALTER TABLE public.fatca_crs_rule_sets 
    ADD COLUMN retired_by_user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fatca_crs_rule_sets_is_active 
  ON public.fatca_crs_rule_sets(is_active);

CREATE INDEX IF NOT EXISTS idx_fatca_crs_rule_sets_retirement_date 
  ON public.fatca_crs_rule_sets(retirement_date) 
  WHERE retirement_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fatca_crs_rule_sets_retired_by_user_id 
  ON public.fatca_crs_rule_sets(retired_by_user_id) 
  WHERE retired_by_user_id IS NOT NULL;

-- Update existing version history trigger to capture retirement events
CREATE OR REPLACE FUNCTION public.track_fatca_crs_rule_version_history()
RETURNS TRIGGER AS $$
DECLARE
  v_change_type TEXT;
  v_old_values JSONB;
  v_new_values JSONB;
  v_changed_by_user_id UUID;
BEGIN
  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    v_change_type := 'created';
    v_old_values := '{}'::jsonb;
    v_new_values := to_jsonb(NEW);
    v_changed_by_user_id := NEW.created_by_user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is a retirement
    IF OLD.is_active = true AND NEW.is_active = false AND NEW.retirement_date IS NOT NULL THEN
      v_change_type := 'retired';
      v_changed_by_user_id := NEW.retired_by_user_id;
    -- Check if this is an approval
    ELSIF OLD.approval_status != 'approved' AND NEW.approval_status = 'approved' THEN
      v_change_type := 'approved';
      v_changed_by_user_id := NEW.approved_by_user_id;
    -- Check if this is a rejection
    ELSIF OLD.approval_status != 'rejected' AND NEW.approval_status = 'rejected' THEN
      v_change_type := 'rejected';
      v_changed_by_user_id := NEW.approved_by_user_id;
    -- Check if this is a submission
    ELSIF OLD.approval_status != 'pending_approval' AND NEW.approval_status = 'pending_approval' THEN
      v_change_type := 'submitted';
      v_changed_by_user_id := NEW.created_by_user_id;
    ELSE
      v_change_type := 'modified';
      v_changed_by_user_id := NEW.created_by_user_id;
    END IF;
    
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSE
    RETURN NULL;
  END IF;

  -- Insert version history record
  INSERT INTO public.fatca_crs_rule_version_history (
    rule_set_id,
    version_number,
    change_type,
    changed_by_user_id,
    old_values,
    new_values,
    change_summary
  ) VALUES (
    NEW.id,
    NEW.version_number,
    v_change_type,
    v_changed_by_user_id,
    v_old_values,
    v_new_values,
    CASE 
      WHEN v_change_type = 'retired' THEN 'Rule retired: ' || COALESCE(NEW.retirement_reason, 'No reason provided')
      WHEN v_change_type = 'approved' THEN 'Rule approved'
      WHEN v_change_type = 'rejected' THEN 'Rule rejected'
      WHEN v_change_type = 'submitted' THEN 'Rule submitted for approval'
      WHEN v_change_type = 'created' THEN 'Rule created'
      ELSE 'Rule modified'
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to use updated function
DROP TRIGGER IF EXISTS trigger_track_fatca_crs_rule_version_history ON public.fatca_crs_rule_sets;

CREATE TRIGGER trigger_track_fatca_crs_rule_version_history
  AFTER INSERT OR UPDATE ON public.fatca_crs_rule_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.track_fatca_crs_rule_version_history();

-- Add comment for documentation
COMMENT ON COLUMN public.fatca_crs_rule_sets.is_active IS 'Indicates if rule is active (true) or retired (false). Retired rules are excluded from simulations and approval workflows.';
COMMENT ON COLUMN public.fatca_crs_rule_sets.retirement_date IS 'Timestamp when the rule was retired';
COMMENT ON COLUMN public.fatca_crs_rule_sets.retirement_reason IS 'Mandatory reason provided for retiring the rule';
COMMENT ON COLUMN public.fatca_crs_rule_sets.retired_by_user_id IS 'User ID of the person who retired the rule (must have rules.retire permission)';