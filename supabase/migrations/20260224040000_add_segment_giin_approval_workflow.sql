-- Migration: Add approval workflow to segment_giin_configuration
-- Purpose: Implement maker-checker separation of duties with approval status tracking

-- Step 1: Add approval workflow columns
ALTER TABLE public.segment_giin_configuration
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approval_comments TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_segment_giin_approval_status ON public.segment_giin_configuration(approval_status);
CREATE INDEX IF NOT EXISTS idx_segment_giin_created_by ON public.segment_giin_configuration(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_segment_giin_approved_by ON public.segment_giin_configuration(approved_by_user_id);

-- Step 3: Create function to prevent self-approval
CREATE OR REPLACE FUNCTION public.validate_segment_giin_approval()
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

-- Step 4: Create trigger for approval validation
DROP TRIGGER IF EXISTS segment_giin_approval_validation_trigger ON public.segment_giin_configuration;
CREATE TRIGGER segment_giin_approval_validation_trigger
BEFORE UPDATE ON public.segment_giin_configuration
FOR EACH ROW
EXECUTE FUNCTION public.validate_segment_giin_approval();

-- Step 5: Insert permissions for approval workflow
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM public.roles WHERE role_name = 'Administrator' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Add segment_giin.approve permission
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (admin_role_id, 'segment_giin', 'approve')
        ON CONFLICT DO NOTHING;
        
        -- Add segment_giin.submit_for_approval permission
        INSERT INTO public.role_permissions (role_id, module, action)
        VALUES (admin_role_id, 'segment_giin', 'submit_for_approval')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Approval permissions added successfully';
    ELSE
        RAISE NOTICE 'Administrator role not found. Please add permissions manually.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding permissions: %', SQLERRM;
END $$;

-- Step 6: Update existing records to set created_by_user_id
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get first user from user_profiles
    SELECT id INTO first_user_id FROM public.user_profiles LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update existing records without created_by_user_id
        UPDATE public.segment_giin_configuration
        SET created_by_user_id = first_user_id,
            approval_status = 'draft'
        WHERE created_by_user_id IS NULL;
        
        RAISE NOTICE 'Existing records updated with created_by_user_id';
    ELSE
        RAISE NOTICE 'No users found. Existing records not updated.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating existing records: %', SQLERRM;
END $$;