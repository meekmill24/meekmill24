-- Captiv8 Platform - Full Backend Schema
-- Run this in your Supabase SQL Editor to initialize the database.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LEVELS TABLE
CREATE TABLE IF NOT EXISTS public.levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(6,5) NOT NULL DEFAULT 0.005,
    tasks_per_set INT NOT NULL DEFAULT 40,
    sets_per_day INT NOT NULL DEFAULT 3,
    daily_tasks INT GENERATED ALWAYS AS (tasks_per_set * sets_per_day) STORED,
    yield_rate DECIMAL(6,5) DEFAULT 1.0, -- Multiplier shown in UI
    description TEXT,
    badge_color TEXT DEFAULT '#00C2FF',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT DEFAULT 'Agent',
    email TEXT,
    phone_number TEXT,
    level_id INT REFERENCES public.levels(id) DEFAULT 1,
    wallet_balance DECIMAL(12,2) DEFAULT 0,
    total_earned DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    yesterday_profit DECIMAL(12,2) DEFAULT 0,
    freeze_balance DECIMAL(12,2) DEFAULT 0,
    completed_count INT DEFAULT 0,
    current_set INT DEFAULT 1,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    referral_earned DECIMAL(12,2) DEFAULT 0,
    salary_days_count INT DEFAULT 0,
    last_work_day_at TIMESTAMPTZ,
    pending_bundle JSONB,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    withdrawal_wallet_address TEXT
);

-- 4. TASK ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.task_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'Strategic',
    description TEXT,
    level_id INT REFERENCES public.levels(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER TASKS TABLE
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_item_id INT REFERENCES public.task_items(id),
    status TEXT DEFAULT 'pending', -- pending, completed, cancelled
    earned_amount DECIMAL(12,2) DEFAULT 0,
    cost_amount DECIMAL(12,2) DEFAULT 0,
    is_bundle BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- deposit, withdrawal, commission, freeze, unfreeze
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    description TEXT,
    proof_url TEXT,
    wallet_address TEXT,
    network TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BUNDLE PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.bundle_packages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_index INT NOT NULL,
    shortage_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    bonus_amount DECIMAL(12,2) NOT NULL,
    expires_in INT DEFAULT 86400,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_packages ENABLE ROW LEVEL SECURITY;

-- 9. POLICIES
CREATE POLICY "Public levels are viewable by everyone" ON public.levels FOR SELECT USING (true);
CREATE POLICY "Public tasks are viewable by everyone" ON public.task_items FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own tasks" ON public.user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- 10. SEED DATA
INSERT INTO public.levels (id, name, price, commission_rate, tasks_per_set, badge_color) VALUES
(1, 'Level 1 Collector', 100, 0.005, 40, '#00C2FF'),
(2, 'Level 2 Collector', 500, 0.006, 45, '#8B5CF6'),
(3, 'Level 3 Collector', 1500, 0.008, 50, '#F59E0B'),
(4, 'Level 4 Collector', 5000, 0.012, 60, '#EF4444'),
(5, 'Level 5 Collector', 10000, 0.015, 80, '#EC4899')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    commission_rate = EXCLUDED.commission_rate,
    tasks_per_set = EXCLUDED.tasks_per_set,
    badge_color = EXCLUDED.badge_color;

-- Ensure SERIAL sequences are in sync
SELECT setval('levels_id_seq', (SELECT MAX(id) FROM levels));
