-- Create resources_content_history table for version tracking
CREATE TABLE IF NOT EXISTS public.resources_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources_content(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('markdown', 'html')),
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  display_order INTEGER,
  changed_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'status_changed')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_resources_history_resource_id ON public.resources_content_history(resource_id);
CREATE INDEX IF NOT EXISTS idx_resources_history_changed_at ON public.resources_content_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_history_changed_by ON public.resources_content_history(changed_by);

-- Add status column to resources_content table
ALTER TABLE public.resources_content
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published'));

ALTER TABLE public.resources_content
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.resources_content
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

ALTER TABLE public.resources_content
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.resources_content_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view history
DROP POLICY IF EXISTS "authenticated_users_can_view_history" ON public.resources_content_history;
CREATE POLICY "authenticated_users_can_view_history"
ON public.resources_content_history
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: System administrators can manage history
DROP POLICY IF EXISTS "admins_can_manage_history" ON public.resources_content_history;
CREATE POLICY "admins_can_manage_history"
ON public.resources_content_history
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND r.role_name = 'System Administrator'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND r.role_name = 'System Administrator'
  )
);

-- Update existing RLS policy to filter by status
DROP POLICY IF EXISTS "authenticated_users_can_view_resources" ON public.resources_content;
CREATE POLICY "authenticated_users_can_view_resources"
ON public.resources_content
FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
      AND r.role_name = 'System Administrator'
    )
  )
);

-- Create function to automatically save history on update
CREATE OR REPLACE FUNCTION public.save_resources_content_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only save history if content, title, status, or display_order changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.display_order IS DISTINCT FROM NEW.display_order
  )) THEN
    INSERT INTO public.resources_content_history (
      resource_id,
      organization_id,
      title,
      content_type,
      content,
      status,
      display_order,
      changed_by,
      changed_at,
      change_type
    ) VALUES (
      OLD.id,
      OLD.organization_id,
      OLD.title,
      OLD.content_type,
      OLD.content,
      OLD.status,
      OLD.display_order,
      COALESCE(NEW.updated_by, auth.uid()),
      CURRENT_TIMESTAMP,
      CASE
        WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_changed'
        ELSE 'updated'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to save history on update
DROP TRIGGER IF EXISTS trigger_save_resources_history ON public.resources_content;
CREATE TRIGGER trigger_save_resources_history
  BEFORE UPDATE ON public.resources_content
  FOR EACH ROW
  EXECUTE FUNCTION public.save_resources_content_history();

-- Update existing resources to have published status
UPDATE public.resources_content
SET status = 'published'
WHERE status IS NULL;