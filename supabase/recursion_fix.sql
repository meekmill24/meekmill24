-- CAPTIV8 - RECURSION FIX & ADMIN OVERRIDE
-- Repairs the 'infinite recursion' in the profiles table and authorizes admins.

-- 1. DROP CONFLICTING POLICIES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.task_items;
DROP POLICY IF EXISTS "Admins can manage all levels" ON public.levels;
DROP POLICY IF EXISTS "Admins can manage user tasks" ON public.user_tasks;

-- 2. SECURE ROLE CHECK (Security Definer avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-APPLY POLICIES (Using the secure function)
-- Profiles: Users can see themselves, Admins can see everyone
CREATE POLICY "Profiles access policy" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

-- Task Items: Publicly viewable, Admin manageable
CREATE POLICY "Admin task management" ON public.task_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Levels: Publicly viewable, Admin manageable
CREATE POLICY "Admin level management" ON public.levels
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- User Tasks: User view own, Admin view all
CREATE POLICY "Admin user_tasks management" ON public.user_tasks
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());
