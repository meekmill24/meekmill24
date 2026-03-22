-- CAPTIV8 - AGENT CREATION TRIGGER
-- Handles auto-profile creation, referral generation, and welcome bonuses.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_referral_code TEXT;
  user_username TEXT;
  user_display_name TEXT;
  user_phone TEXT;
  user_referred_by_code TEXT;
  referrer_id UUID := NULL;
  welcome_bonus DECIMAL(12,2) := 50.00; -- ELITE WELCOME BONUS
BEGIN
  -- Extract metadata from Auth
  user_username := COALESCE(NEW.raw_user_meta_data->>'username', 'Agent_' || substr(NEW.id::text, 1, 6));
  user_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', user_username);
  user_phone := NEW.raw_user_meta_data->>'phone_number';
  user_referred_by_code := NEW.raw_user_meta_data->>'referral_code_used';
  
  -- Generate unique referral code (Random high-entropy string)
  new_referral_code := upper(substr(md5(random()::text), 1, 6)); -- Upgrading to 6 characters for elite agents
  
  -- Look up referrer if code was provided
  IF user_referred_by_code IS NOT NULL AND user_referred_by_code != '' THEN
    SELECT id INTO referrer_id FROM public.profiles WHERE referral_code = user_referred_by_code LIMIT 1;
  END IF;

  -- Create Main Profile Node
  INSERT INTO public.profiles (
    id, 
    username, 
    display_name, 
    email, 
    phone_number, 
    role, 
    level_id,
    referral_code, 
    referred_by, 
    wallet_balance, 
    profit,
    freeze_balance,
    is_verified,
    verification_status,
    created_at
  ) VALUES (
    NEW.id,
    user_username,
    user_display_name,
    NEW.email,
    user_phone,
    'user',
    1, -- Starts at Junior Level
    new_referral_code,
    referrer_id,
    welcome_bonus,
    0.0,
    0.0,
    false, -- Pending verification
    'unverified',
    NOW()
  );

  -- Record the welcome transaction
  INSERT INTO public.transactions (user_id, type, amount, description, status, created_at)
  VALUES (NEW.id, 'deposit', welcome_bonus, 'Strategic Welcome Bonus - Node Initialized', 'approved', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-assign the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
