# Simple Music - Database Setup Guide

## Overview
This guide walks you through setting up the Supabase database for the Simple Music task-based earning platform.

## Prerequisites
- Supabase project created and connected via v0 integration
- Access to Supabase dashboard

## Step 1: Create Tables

Copy and paste the following SQL into your Supabase SQL editor to create all required tables:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  level_id UUID,
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  total_earned DECIMAL(10, 2) DEFAULT 0.00,
  tasks_completed INT DEFAULT 0,
  credit_rating DECIMAL(3, 1),
  is_secure BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create levels table (for tier/level system)
CREATE TABLE IF NOT EXISTS public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_tasks INT NOT NULL,
  commission_rate DECIMAL(3, 2) NOT NULL,
  benefits TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  reward_amount DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'completed',
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'task_reward')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON public.task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON public.task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
```

## Step 2: Enable Row Level Security (RLS)

Run this SQL to enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
```

## Step 3: Create RLS Policies

```sql
-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'is_admin' = 'true');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Levels: Everyone can read, admins can manage
CREATE POLICY "levels_select_all" ON public.levels
  FOR SELECT USING (TRUE);

CREATE POLICY "levels_admin_manage" ON public.levels
  FOR ALL USING (auth.jwt() ->> 'is_admin' = 'true');

-- Tasks: Everyone can read active tasks, admins can manage
CREATE POLICY "tasks_select_active" ON public.tasks
  FOR SELECT USING (is_active = TRUE OR auth.jwt() ->> 'is_admin' = 'true');

CREATE POLICY "tasks_admin_manage" ON public.tasks
  FOR ALL USING (auth.jwt() ->> 'is_admin' = 'true');

-- Task Completions: Users see their own, admins see all
CREATE POLICY "completions_select_own" ON public.task_completions
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'is_admin' = 'true');

CREATE POLICY "completions_insert_own" ON public.task_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: Users see their own, admins see all
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'is_admin' = 'true');

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Site Settings: Admins only
CREATE POLICY "settings_admin_manage" ON public.site_settings
  FOR ALL USING (auth.jwt() ->> 'is_admin' = 'true');

-- Notifications: Users see their own
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 4: Create Trigger for Auto-profile Creation

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 5: Seed Initial Data

```sql
-- Insert levels
INSERT INTO public.levels (name, min_tasks, commission_rate, benefits) VALUES
  ('Level 1 Collector', 0, 1.00, ARRAY['Basic tasks', 'Standard commission']),
  ('Level 2 Contributor', 40, 1.25, ARRAY['Priority tasks', 'Bonus events']),
  ('Level 3 Expert', 100, 1.50, ARRAY['Exclusive tasks', 'Higher rewards']);

-- Insert initial tasks
INSERT INTO public.tasks (title, description, reward_amount, category, difficulty, is_active) VALUES
  ('Music Matching Task 1', 'Match songs to images', 1.00, 'music', 'easy', TRUE),
  ('Music Matching Task 2', 'Identify song genres', 2.00, 'music', 'medium', TRUE),
  ('Audio Verification', 'Verify audio quality', 1.50, 'audio', 'easy', TRUE);

-- Insert initial site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('new_registrations_enabled', 'true'),
  ('min_withdrawal', '10'),
  ('referral_bonus', '5');
```

## Step 6: Set Admin User

To make a user an admin, update their auth metadata in the Supabase dashboard:

1. Go to Authentication → Users
2. Find the user you want to make admin
3. Click the user to view details
4. Under "User Metadata", add or update: `{"is_admin": true}`
5. Save

Or use this SQL:
```sql
UPDATE auth.users 
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"is_admin": true}'::jsonb
    ELSE raw_user_meta_data || '{"is_admin": true}'::jsonb
  END
WHERE email = 'admin@example.com';
```

## Environment Variables

Make sure these are set in your .env.local:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Verification

After setup, verify everything is working:

1. Create a test user account
2. Check that a profile was auto-created
3. Sign in and view your dashboard
4. Complete a task to verify task_completion flow
5. Check transactions appear in wallet
6. Use an admin account to access /admin

## Troubleshooting

**"Permission denied" errors**: Check RLS policies are correctly set and user is authenticated.

**Profile not created on signup**: Verify the trigger function is correctly created and auth.users hook is enabled.

**Can't access admin**: Ensure user has `is_admin: true` in user metadata.

**Tasks not appearing**: Verify `is_active = TRUE` for tasks and RLS policies allow SELECT.
