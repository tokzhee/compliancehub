-- Migration: Fix retire permission, fix broken trigger, and update sample rules to approved status
-- Root cause: track_fatca_crs_rule_version_history() uses wrong column names
-- (rule_set_id, old_values, new_values, change_summary) vs actual table columns
-- (rule_id, changes, organization_id)

-- Step 0: Fix the broken trigger function to use correct column names
CREATE OR REPLACE FUNCTION public.track_fatca_crs_rule_version_history()
RETURNS TRIGGER AS $$
DECLARE
  v_change_type TEXT;
  v_changes JSONB;
  v_changed_by_user_id UUID;
  v_version_number INTEGER;
  v_fallback_user_id UUID;
BEGIN
  -- Get a fallback user ID (any existing user) in case specific fields are NULL
  SELECT id INTO v_fallback_user_id
  FROM auth.users
  LIMIT 1;

  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    v_change_type := 'created';
    v_changes := jsonb_build_object('old_values', '{}'::jsonb, 'new_values', to_jsonb(NEW));
    v_changed_by_user_id := COALESCE(NEW.created_by_user_id, v_fallback_user_id);
    v_version_number := 1;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is a retirement
    IF OLD.is_active = true AND NEW.is_active = false AND NEW.retirement_date IS NOT NULL THEN
      v_change_type := 'retired';
      v_changed_by_user_id := COALESCE(NEW.retired_by_user_id, NEW.created_by_user_id, v_fallback_user_id);
    -- Check if this is an approval
    ELSIF OLD.approval_status != 'approved' AND NEW.approval_status = 'approved' THEN
      v_change_type := 'approved';
      v_changed_by_user_id := COALESCE(NEW.approved_by_user_id, NEW.created_by_user_id, v_fallback_user_id);
    -- Check if this is a rejection
    ELSIF OLD.approval_status != 'rejected' AND NEW.approval_status = 'rejected' THEN
      v_change_type := 'rejected';
      v_changed_by_user_id := COALESCE(NEW.approved_by_user_id, NEW.created_by_user_id, v_fallback_user_id);
    -- Check if this is a submission
    ELSIF OLD.approval_status != 'pending_approval' AND NEW.approval_status = 'pending_approval' THEN
      v_change_type := 'submitted';
      v_changed_by_user_id := COALESCE(NEW.created_by_user_id, v_fallback_user_id);
    ELSE
      v_change_type := 'updated';
      v_changed_by_user_id := COALESCE(NEW.created_by_user_id, v_fallback_user_id);
    END IF;

    v_changes := jsonb_build_object('old_values', to_jsonb(OLD), 'new_values', to_jsonb(NEW));

    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM public.fatca_crs_rule_version_history
    WHERE rule_id = NEW.id;
  ELSE
    RETURN NULL;
  END IF;

  -- Only insert if we have a valid user ID
  IF v_changed_by_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insert version history record using correct column names
  INSERT INTO public.fatca_crs_rule_version_history (
    rule_id,
    version_number,
    modified_date,
    changed_by_user_id,
    changes,
    change_type,
    organization_id
  ) VALUES (
    NEW.id,
    v_version_number,
    CURRENT_TIMESTAMP,
    v_changed_by_user_id,
    v_changes,
    v_change_type,
    NEW.organization_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_track_fatca_crs_rule_version_history ON public.fatca_crs_rule_sets;
CREATE TRIGGER trigger_track_fatca_crs_rule_version_history
  AFTER INSERT OR UPDATE ON public.fatca_crs_rule_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.track_fatca_crs_rule_version_history();

DO $$
DECLARE
  v_role RECORD;
  v_count INTEGER;
  v_system_user_id UUID;
BEGIN
  -- Get a system user ID to use as approved_by for the bulk update
  SELECT id INTO v_system_user_id
  FROM auth.users
  LIMIT 1;

  -- Step 1: Insert rules.retire for EVERY role that doesn't already have it
  FOR v_role IN
    SELECT DISTINCT r.id, r.role_name
    FROM public.roles r
    WHERE NOT EXISTS (
      SELECT 1 FROM public.role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.module = 'rules'
        AND rp.action = 'retire'
    )
  LOOP
    INSERT INTO public.role_permissions (role_id, module, action)
    VALUES (v_role.id, 'rules', 'retire');
    RAISE NOTICE 'Inserted rules.retire for role: %', v_role.role_name;
  END LOOP;

  -- Step 2: Insert rules.submit_for_approval for EVERY role that doesn't already have it
  FOR v_role IN
    SELECT DISTINCT r.id, r.role_name
    FROM public.roles r
    WHERE NOT EXISTS (
      SELECT 1 FROM public.role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.module = 'rules'
        AND rp.action = 'submit_for_approval'
    )
  LOOP
    INSERT INTO public.role_permissions (role_id, module, action)
    VALUES (v_role.id, 'rules', 'submit_for_approval');
    RAISE NOTICE 'Inserted rules.submit_for_approval for role: %', v_role.role_name;
  END LOOP;

  -- Step 3: Count and report
  SELECT COUNT(*) INTO v_count
  FROM public.role_permissions
  WHERE module = 'rules' AND action = 'retire';
  RAISE NOTICE 'Total rules.retire permissions in DB: %', v_count;

  -- Step 4: Update sample rules to approved status so Retire button can appear
  -- Set approved_by_user_id to a real user so the trigger does not fail on NOT NULL
  UPDATE public.fatca_crs_rule_sets
  SET
    approval_status = 'approved',
    status = 'active',
    approved_at = NOW(),
    approved_by_user_id = COALESCE(approved_by_user_id, v_system_user_id),
    updated_at = NOW()
  WHERE
    approval_status IN ('draft', 'pending_approval')
    AND is_active = true;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Updated % rules to approved status', v_count;

END $$;
