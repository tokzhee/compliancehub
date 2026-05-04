-- Fix RLS policies for role_permissions table
-- Add INSERT, UPDATE, and DELETE policies to allow administrators to manage permissions

-- Drop existing policies if any
DROP POLICY IF EXISTS "users_insert_role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "users_update_role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "users_delete_role_permissions" ON public.role_permissions;

-- Allow INSERT for users who can manage roles in their organization
CREATE POLICY "users_insert_role_permissions"
ON public.role_permissions
FOR INSERT
TO authenticated
WITH CHECK (
    role_id IN (
        SELECT r.id FROM public.roles r
        JOIN public.user_profiles up ON r.organization_id = up.organization_id
        WHERE up.id = auth.uid()
    )
);

-- Allow UPDATE for users who can manage roles in their organization
CREATE POLICY "users_update_role_permissions"
ON public.role_permissions
FOR UPDATE
TO authenticated
USING (
    role_id IN (
        SELECT r.id FROM public.roles r
        JOIN public.user_profiles up ON r.organization_id = up.organization_id
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    role_id IN (
        SELECT r.id FROM public.roles r
        JOIN public.user_profiles up ON r.organization_id = up.organization_id
        WHERE up.id = auth.uid()
    )
);

-- Allow DELETE for users who can manage roles in their organization
CREATE POLICY "users_delete_role_permissions"
ON public.role_permissions
FOR DELETE
TO authenticated
USING (
    role_id IN (
        SELECT r.id FROM public.roles r
        JOIN public.user_profiles up ON r.organization_id = up.organization_id
        WHERE up.id = auth.uid()
    )
);