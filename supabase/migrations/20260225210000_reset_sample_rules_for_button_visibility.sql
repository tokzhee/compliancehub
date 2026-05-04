-- Migration: Reset sample rules so action buttons are visible
-- Fixes: Submit for Approval button (needs approval_status='draft')
--        Retire button (needs approval_status='approved')

DO $$
DECLARE
  v_org_id uuid;
  v_segment_id uuid;
  v_user_id uuid;
  v_approver_id uuid;
  v_rule_id uuid;
BEGIN
  -- Get org, segment, user for reference
  SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
  SELECT id INTO v_segment_id FROM public.segment_giin_configuration WHERE organization_id = v_org_id LIMIT 1;

  -- Get the first user as creator
  SELECT id INTO v_user_id FROM public.user_profiles WHERE organization_id = v_org_id ORDER BY created_at ASC LIMIT 1;

  -- Get a different user as approver (separation of duties constraint)
  SELECT id INTO v_approver_id FROM public.user_profiles
  WHERE organization_id = v_org_id
    AND id != v_user_id
  ORDER BY created_at ASC LIMIT 1;

  -- If no second user exists, use NULL for approved_by (constraint allows NULL)
  -- approved_by IS NULL satisfies: created_by != approved_by OR approved_by IS NULL

  -- Step 1: Reset fy2024 rule back to 'draft' approval_status
  -- This makes the Submit for Approval button visible
  UPDATE public.fatca_crs_rule_sets
  SET
    approval_status = 'draft',
    status = 'draft',
    submitted_at = NULL,
    approved_by_user_id = NULL,
    approved_at = NULL,
    approval_comments = NULL,
    updated_at = NOW()
  WHERE rule_name = 'fy2024'
    AND organization_id = v_org_id;

  RAISE NOTICE 'Reset fy2024 rule to draft approval_status';

  -- Step 2: Check if an approved rule already exists for Retire button testing
  SELECT id INTO v_rule_id
  FROM public.fatca_crs_rule_sets
  WHERE organization_id = v_org_id
    AND approval_status = 'approved'
    AND is_active = true
  LIMIT 1;

  -- Step 3: If no approved rule exists, create one so Retire button is visible
  IF v_rule_id IS NULL AND v_segment_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO public.fatca_crs_rule_sets (
      organization_id,
      segment_id,
      regime_type,
      reporting_year,
      version_number,
      rule_name,
      description,
      status,
      approval_status,
      created_by,
      created_by_user_id,
      approved_by,
      approved_by_user_id,
      approved_at,
      is_active,
      created_on,
      updated_at
    )
    SELECT
      v_org_id,
      v_segment_id,
      'FATCA',
      2025,
      1,
      'fy2025-approved',
      'Approved rule for testing Retire button',
      'active',
      'approved',
      v_user_id,
      v_user_id,
      COALESCE(v_approver_id, NULL),
      COALESCE(v_approver_id, NULL),
      NOW(),
      true,
      NOW(),
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM public.fatca_crs_rule_sets
      WHERE rule_name = 'fy2025-approved'
        AND organization_id = v_org_id
    );

    RAISE NOTICE 'Created approved sample rule fy2025-approved for Retire button testing';
  ELSE
    RAISE NOTICE 'Approved rule already exists, skipping creation';
  END IF;

END $$;
