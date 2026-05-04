-- Fix infinite recursion in user_profiles RLS policies
-- Issue: users_view_org_user_profiles policy queries user_profiles table within its own USING clause
-- Solution: Remove circular policy - users can already view their own profile via users_manage_own_user_profiles

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "users_view_org_user_profiles" ON public.user_profiles;

-- The existing "users_manage_own_user_profiles" policy is sufficient:
-- Users can view/manage their own profile via: USING (id = auth.uid())
-- This is the correct Pattern 1 from RLS guidelines (Core User Tables)

-- If organization-wide user viewing is needed, it should be implemented via:
-- 1. A separate function that queries a different table (not user_profiles)
-- 2. Or a materialized view that caches organization memberships
-- 3. Or application-level logic that doesn't rely on RLS for this feature

-- For now, users can only access their own profile, which prevents the recursion