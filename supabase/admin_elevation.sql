-- CAPTIV8 - ADMIN PRIVILEGE ELEVATION
-- Grants full CRUD access to admins for Catalog, Levels, and Transactions.

-- 1. ADMINS CAN MANAGE TASK CATALOG
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.task_items;
CREATE POLICY "Admins can manage all tasks" ON public.task_items
    FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 2. ADMINS CAN MANAGE LEVELS
DROP POLICY IF EXISTS "Admins can manage all levels" ON public.levels;
CREATE POLICY "Admins can manage all levels" ON public.levels
    FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. ADMINS CAN MANAGE USER TASKS (FOR AUDIT)
DROP POLICY IF EXISTS "Admins can manage user tasks" ON public.user_tasks;
CREATE POLICY "Admins can manage user tasks" ON public.user_tasks
    FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 4. ADMINS CAN VIEW GLOBAL TRANSACTIONS
DROP POLICY IF EXISTS "Admins can view global transactions" ON public.transactions;
CREATE POLICY "Admins can view global transactions" ON public.transactions
    FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. ADMINS CAN VIEW ALL PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
