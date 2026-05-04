-- Migration: Add approval workflow to fatca_crs_rule_sets and fatca_crs_submission_log
-- Purpose: Implement maker-checker separation of duties with approval status tracking for regulatory governance

-- Step 1: Add approval workflow columns to fatca_crs_rule_sets
ALTER TABLE public.fatca_crs_rule_sets
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approval_comments TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Step 2: Add approval workflow columns to fatca_crs_submission_log
ALTER TABLE public.fatca_crs_submission_log
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approval_comments TEXT,
ADD COLUMN IF NOT EXISTS submitted_at_approval TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Step 3: Create indexes for performance on fatca_crs_rule_sets
CREATE INDEX IF NOT EXISTS idx_rule_sets_approval_status ON public.fatca_crs_rule_sets(approval_status);
CREATE INDEX IF NOT EXISTS idx_rule_sets_created_by ON public.fatca_crs_rule_sets(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_rule_sets_approved_by ON public.fatca_crs_rule_sets(approved_by_user_id);

-- Step 4: Create indexes for performance on fatca_crs_submission_log
CREATE INDEX IF NOT EXISTS idx_submission_log_approval_status ON public.fatca_crs_submission_log(approval_status);
CREATE INDEX IF NOT EXISTS idx_submission_log_created_by ON public.fatca_crs_submission_log(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_submission_log_approved_by ON public.fatca_crs_submission_log(approved_by_user_id);

-- Step 5: Create function to prevent self-approval for rule sets
CREATE OR REPLACE FUNCTION public.validate_rule_sets_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Prevent users from approving their own submissions
    IF NEW.approval_status IN ('approved', 'rejected') AND 
       NEW.approved_by_user_id IS NOT NULL AND 
       NEW.created_by_user_id IS NOT NULL AND 
       NEW.approved_by_user_id = NEW.created_by_user_id THEN
        RAISE EXCEPTION 'Users cannot approve their own submissions. Maker-checker separation required.';
    END IF;
    
    -- Set approved_at timestamp when status changes to approved or rejected
    IF NEW.approval_status IN ('approved', 'rejected') AND 
       (OLD.approval_status IS NULL OR OLD.approval_status != NEW.approval_status) THEN
        NEW.approved_at := CURRENT_TIMESTAMP;
    END IF;
    
    -- Set submitted_at timestamp when status changes to pending_approval
    IF NEW.approval_status = 'pending_approval' AND 
       (OLD.approval_status IS NULL OR OLD.approval_status != 'pending_approval') THEN
        NEW.submitted_at := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Step 6: Create function to prevent self-approval for submission log
CREATE OR REPLACE FUNCTION public.validate_submission_log_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Prevent users from approving their own submissions
    IF NEW.approval_status IN ('approved', 'rejected') AND 
       NEW.approved_by_user_id IS NOT NULL AND 
       NEW.created_by_user_id IS NOT NULL AND 
       NEW.approved_by_user_id = NEW.created_by_user_id THEN
        RAISE EXCEPTION 'Users cannot approve their own submissions. Maker-checker separation required.';
    END IF;
    
    -- Set approved_at timestamp when status changes to approved or rejected
    IF NEW.approval_status IN ('approved', 'rejected') AND 
       (OLD.approval_status IS NULL OR OLD.approval_status != NEW.approval_status) THEN
        NEW.approved_at := CURRENT_TIMESTAMP;
    END IF;
    
    -- Set submitted_at_approval timestamp when status changes to pending_approval
    IF NEW.approval_status = 'pending_approval' AND 
       (OLD.approval_status IS NULL OR OLD.approval_status != 'pending_approval') THEN
        NEW.submitted_at_approval := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Step 7: Create trigger for rule sets approval validation
DROP TRIGGER IF EXISTS rule_sets_approval_validation_trigger ON public.fatca_crs_rule_sets;
CREATE TRIGGER rule_sets_approval_validation_trigger
BEFORE UPDATE ON public.fatca_crs_rule_sets
FOR EACH ROW
EXECUTE FUNCTION public.validate_rule_sets_approval();

-- Step 8: Create trigger for submission log approval validation
DROP TRIGGER IF EXISTS submission_log_approval_validation_trigger ON public.fatca_crs_submission_log;
CREATE TRIGGER submission_log_approval_validation_trigger
BEFORE UPDATE ON public.fatca_crs_submission_log
FOR EACH ROW
EXECUTE FUNCTION public.validate_submission_log_approval();

-- Step 9: Insert permissions for approval workflow
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM public.roles WHERE role_name = 'Administrator' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Add rules.approve permission
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (admin_role_id, 'rules', 'approve')
        ON CONFLICT DO NOTHING;
        
        -- Add rules.submit_for_approval permission
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (admin_role_id, 'rules', 'submit_for_approval')
        ON CONFLICT DO NOTHING;
        
        -- Add submissions.approve permission
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (admin_role_id, 'submissions', 'approve')
        ON CONFLICT DO NOTHING;
        
        -- Add submissions.submit_for_approval permission
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (admin_role_id, 'submissions', 'submit_for_approval')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Approval permissions added successfully';
    ELSE
        RAISE NOTICE 'Administrator role not found. Please add permissions manually.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding permissions: %', SQLERRM;
END $$;

-- Step 10: Update existing rule sets to set created_by_user_id
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get first user from user_profiles
    SELECT id INTO first_user_id FROM public.user_profiles LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update existing records without created_by_user_id
        UPDATE public.fatca_crs_rule_sets
        SET created_by_user_id = created_by,
            approval_status = 'draft'
        WHERE created_by_user_id IS NULL AND created_by IS NOT NULL;
        
        RAISE NOTICE 'Existing rule sets updated with created_by_user_id';
    ELSE
        RAISE NOTICE 'No users found. Existing records not updated.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating existing rule sets: %', SQLERRM;
END $$;

-- Step 11: Update existing submission logs to set created_by_user_id
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get first user from user_profiles
    SELECT id INTO first_user_id FROM public.user_profiles LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update existing records without created_by_user_id
        UPDATE public.fatca_crs_submission_log
        SET created_by_user_id = submitted_by,
            approval_status = 'draft'
        WHERE created_by_user_id IS NULL AND submitted_by IS NOT NULL;
        
        RAISE NOTICE 'Existing submission logs updated with created_by_user_id';
    ELSE
        RAISE NOTICE 'No users found. Existing records not updated.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating existing submission logs: %', SQLERRM;
END $$;