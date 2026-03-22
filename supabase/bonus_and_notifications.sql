-- CAPTIV8 - AGENT NOTIFICATIONS & UPDATED WELCOME BONUS
-- Run this in Supabase SQL Editor to enable Referral Alerts and $45 bonus.

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update the handle_new_user trigger for $45 Welcome Bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_referral_code TEXT;
  user_username TEXT;
  user_display_name TEXT;
  user_phone TEXT;
  user_referred_by_code TEXT;
  referrer_id UUID := NULL;
  welcome_bonus DECIMAL(12,2) := 45.00; -- UPDATED TO $45
BEGIN
  user_username := COALESCE(NEW.raw_user_meta_data->>'username', 'Agent_' || substr(NEW.id::text, 1, 6));
  user_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', user_username);
  user_phone := NEW.raw_user_meta_data->>'phone_number';
  user_referred_by_code := NEW.raw_user_meta_data->>'referral_code_used';
  
  new_referral_code := upper(substr(md5(random()::text), 1, 6));
  
  IF user_referred_by_code IS NOT NULL AND user_referred_by_code != '' THEN
    SELECT id INTO referrer_id FROM public.profiles WHERE referral_code = user_referred_by_code LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, username, display_name, email, phone_number, role, level_id, referral_code, referred_by, wallet_balance, profit, is_verified, verification_status, created_at)
  VALUES (NEW.id, user_username, user_display_name, NEW.email, user_phone, 'user', 1, new_referral_code, referrer_id, welcome_bonus, 0, false, 'unverified', NOW());

  INSERT INTO public.transactions (user_id, type, amount, description, status, created_at)
  VALUES (NEW.id, 'deposit', welcome_bonus, 'Strategic Welcome Bonus - Node Initialized', 'approved', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
