-- ============================================================================
-- FIX USER PROFILES ORGANIZATION VIEW
-- Created: 2026-02-23
-- Purpose: Allow users to view all users in their organization without RLS recursion
-- Solution: Use a security definer function to cache organization_id lookup
-- ============================================================================

-- Create a security definer function to get current user's organization_id
-- This breaks the recursion by bypassing RLS in the function
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Bypass RLS by using a security definer function
  SELECT organization_id INTO org_id
  FROM public.user_profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_org_id() TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_view_org_user_profiles" ON public.user_profiles;

-- Policy 1: Users can manage their own profile
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 2: Users can view all profiles in their organization (no recursion)
CREATE POLICY "users_view_org_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (organization_id = public.get_current_user_org_id());