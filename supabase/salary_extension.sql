-- Captiv8 Platform - Salary & Rewards Extension
-- Run this in your Supabase SQL Editor to enable Salary payouts.

-- 1. SALARY RULES TABLE
CREATE TABLE IF NOT EXISTS public.salary_rules (
    id SERIAL PRIMARY KEY,
    level_id INT NOT NULL, 
    day_number INT NOT NULL, 
    amount DECIMAL(12,2) NOT NULL,
    UNIQUE(level_id, day_number)
);

-- 2. POPULATE SALARY RULES (Matching simple-money logic)
INSERT INTO public.salary_rules (level_id, day_number, amount) VALUES
(1, 2, 100.00), (1, 4, 300.00), (1, 7, 1000.00), (1, 15, 1800.00), (1, 30, 5000.00),
(2, 2, 200.00), (2, 4, 600.00), (2, 7, 2000.00), (2, 15, 3600.00), (2, 30, 10000.00),
(3, 2, 300.00), (3, 4, 900.00), (3, 7, 3000.00), (3, 15, 5400.00), (3, 30, 15000.00),
(4, 2, 400.00), (4, 4, 1200.00), (4, 7, 4000.00), (4, 15, 7200.00), (4, 30, 20000.00),
(5, 2, 1000.00), (5, 4, 2500.00), (5, 7, 6000.00), (5, 15, 12000.00), (5, 30, 35000.00)
ON CONFLICT (level_id, day_number) DO UPDATE SET amount = EXCLUDED.amount;

-- 3. SALARY CLAIM FUNCTION
CREATE OR REPLACE FUNCTION public.claim_salary_bonus() 
RETURNS json AS $$
DECLARE
    v_user_id UUID;
    v_level_id INT;
    v_salary_days_count INT;
    v_last_claim_at TIMESTAMPTZ;
    v_bonus_amount DECIMAL(12,2);
    v_day_number INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Fetch user profile data
    SELECT p.level_id, p.salary_days_count, p.last_salary_claim_at
    INTO v_level_id, v_salary_days_count, v_last_claim_at
    FROM public.profiles p
    WHERE p.id = v_user_id;

    -- Find eligible rule for current streak
    SELECT amount, day_number INTO v_bonus_amount, v_day_number
    FROM public.salary_rules
    WHERE level_id = v_level_id AND day_number <= v_salary_days_count
    ORDER BY day_number DESC
    LIMIT 1;

    IF v_bonus_amount IS NULL THEN
        RAISE EXCEPTION 'You haven''t reached a salary milestone yet. Keep optimizing!';
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET 
        wallet_balance = wallet_balance + v_bonus_amount,
        last_salary_claim_at = NOW()
    WHERE id = v_user_id;

    -- Record transaction
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (v_user_id, 'commission', v_bonus_amount, 'Executive Salary Payout: Milestone Day ' || v_day_number, 'approved');

    RETURN json_build_object(
        'success', true,
        'amount', v_bonus_amount,
        'day', v_day_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
