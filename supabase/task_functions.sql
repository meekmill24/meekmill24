-- Captiv8 Platform - Core Task Verification Logic
-- Run this in your Supabase SQL Editor to make the Task system work.

CREATE OR REPLACE FUNCTION public.complete_user_task(
    p_task_item_id INT,
    p_cost_amount DECIMAL(12,2) DEFAULT NULL,
    p_is_bundle BOOLEAN DEFAULT FALSE
)
RETURNS json AS $$
DECLARE
    v_user_id UUID;
    v_level_id INT;
    v_completed_count INT;
    v_current_set INT;
    v_tasks_per_set INT;
    v_sets_per_day INT;
    v_commission_rate DECIMAL(5,4);
    v_wallet_balance DECIMAL(12,2);
    v_frozen_amount DECIMAL(12,2);
    v_profit DECIMAL(12,2);
    v_total_profit DECIMAL(12,2);
    v_referral_earned DECIMAL(12,2);
    v_last_reset_at TIMESTAMPTZ;
    v_task_base_offset INT := 0;
    v_tasks_in_current_set INT;
    v_earned_amount DECIMAL(10,2);
    v_random_price DECIMAL(10,2);
    v_referrer_id UUID;
    v_ref_bonus DECIMAL(10,2);
    v_task_title TEXT;
    v_levels_record RECORD;
    v_new_wallet_balance DECIMAL(12,2);
    v_is_set_complete BOOLEAN := false;
    v_pending_bundle JSONB;
    v_is_bundle_task BOOLEAN := false;
    v_pending_task_id INT;
    v_cost_amount DECIMAL(12,2) := 0;
    v_level_price DECIMAL(12,2);
    v_last_work_day TIMESTAMPTZ;
    v_days_count INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- A. Fetch profile data
    SELECT 
        COALESCE(p.level_id, 1), COALESCE(p.completed_count, 0), COALESCE(p.current_set, 1), 
        COALESCE(p.wallet_balance, 0.00), COALESCE(p.freeze_balance, 0.00), 
        COALESCE(p.profit, 0.00), COALESCE(p.total_earned, 0.00), COALESCE(p.referral_earned, 0.00),
        p.referred_by, COALESCE(p.last_reset_at, NOW()), p.pending_bundle,
        p.last_work_day_at, COALESCE(p.salary_days_count, 0)
    INTO 
        v_level_id, v_completed_count, v_current_set, 
        v_wallet_balance, v_frozen_amount, v_profit, v_total_profit, v_referral_earned,
        v_referrer_id, v_last_reset_at, v_pending_bundle,
        v_last_work_day, v_days_count
    FROM public.profiles p
    WHERE p.id = v_user_id;

    -- B. 24 HOUR RESET LOGIC
    IF NOW() - v_last_reset_at >= INTERVAL '24 hours' THEN
        v_profit := 0;
        v_current_set := 1;
        v_last_reset_at := NOW();

        -- Calculate base offset for current level
        v_task_base_offset := 0;
        FOR v_levels_record IN SELECT id, tasks_per_set, sets_per_day FROM public.levels ORDER BY price ASC LOOP
            IF v_levels_record.id = v_level_id THEN EXIT; END IF;
            v_task_base_offset := v_task_base_offset + (COALESCE(v_levels_record.sets_per_day, 3) * COALESCE(v_levels_record.tasks_per_set, 40));
        END LOOP;
        
        v_completed_count := v_task_base_offset;

        UPDATE public.profiles 
        SET profit = 0, current_set = 1, last_reset_at = v_last_reset_at, completed_count = v_task_base_offset 
        WHERE id = v_user_id;
    END IF;

    -- C. CHECK 1: DEFICIT SETTLEMENT
    IF v_wallet_balance < 0 THEN
         RAISE EXCEPTION 'Account in deficit. Please settle your balance through the recharge portal or Contact customer service to clear your negative balance to continue.';
    END IF;

    -- D. CHECK FOR PENDING TASK
    SELECT id, earned_amount, cost_amount, is_bundle 
    INTO v_pending_task_id, v_earned_amount, v_cost_amount, v_is_bundle_task
    FROM public.user_tasks 
    WHERE user_id = v_user_id AND task_item_id = p_task_item_id AND status = 'pending'
    LIMIT 1;

    -- E. GET LEVEL DATA
    SELECT tasks_per_set, sets_per_day, commission_rate, price
    INTO v_tasks_per_set, v_sets_per_day, v_commission_rate, v_level_price
    FROM public.levels WHERE id = v_level_id;

    IF v_tasks_per_set IS NULL THEN
        v_tasks_per_set := 40; v_sets_per_day := 3; v_commission_rate := 0.0045; v_level_price := 65;
    END IF;

    -- F. APPLY NEW TASK SECURITY CHECKS
    IF v_pending_task_id IS NULL THEN
        IF EXISTS (SELECT 1 FROM public.user_tasks WHERE user_id = v_user_id AND status = 'pending') THEN
            RAISE EXCEPTION 'You have a pending order. Please complete or settle it before starting a new one.';
        END IF;

        IF v_wallet_balance < v_level_price THEN
            RAISE EXCEPTION 'Insufficient balance to start new task. Minimum required for Level % is $%', v_level_id, v_level_price;
        END IF;

        IF v_current_set > v_sets_per_day THEN
            RAISE EXCEPTION 'Maximum daily sets ( % / % ) reached. Come back tomorrow!', v_sets_per_day, v_sets_per_day;
        END IF;
    END IF;

    -- G. Calculate current set progress
    FOR v_levels_record IN SELECT id, tasks_per_set, sets_per_day FROM public.levels ORDER BY price ASC LOOP
        IF v_levels_record.id = v_level_id THEN EXIT; END IF;
        v_task_base_offset := v_task_base_offset + (COALESCE(v_levels_record.sets_per_day, 3) * COALESCE(v_levels_record.tasks_per_set, 40));
    END LOOP;

    v_tasks_in_current_set := v_completed_count - v_task_base_offset - ((v_current_set - 1) * v_tasks_per_set);
    
    -- H. TASK CALCULATION
    IF v_pending_task_id IS NULL THEN
        -- Check if it's a bundle: ONLY if explicitly requested from frontend (after user accepts modal)
        IF p_is_bundle = true THEN
            v_cost_amount := (v_pending_bundle->>'totalAmount')::DECIMAL;
            v_earned_amount := (v_pending_bundle->>'bonusAmount')::DECIMAL;
            v_is_bundle_task := true;
        ELSE
            IF p_cost_amount IS NOT NULL AND p_cost_amount > 20 THEN
                v_cost_amount := p_cost_amount;
            ELSE
                v_random_price := (v_wallet_balance * (0.40 + random() * 0.45));
                v_cost_amount := ROUND(v_random_price, 2);
            END IF;
            v_earned_amount := ROUND((v_cost_amount * v_commission_rate), 2);
            v_is_bundle_task := false;
        END IF;
    END IF;

    SELECT title INTO v_task_title FROM public.task_items WHERE id = p_task_item_id;

    -- I. UPDATE PROFILE (Multi-Stage Bundle Logic)
    UPDATE public.profiles 
    SET 
        -- Rule 1: Always deduct cost for new bundles (Allowing Negative Balance)
        -- Rule 2: Only add back capital if it's being completed (from pending status)
        wallet_balance = wallet_balance 
            - (CASE WHEN v_pending_task_id IS NULL AND v_is_bundle_task THEN v_cost_amount ELSE 0 END)
            + (CASE WHEN v_pending_task_id IS NOT NULL THEN v_cost_amount ELSE 0 END) 
            + (CASE WHEN v_pending_task_id IS NOT NULL OR NOT v_is_bundle_task THEN v_earned_amount ELSE 0 END),
        
        profit = profit + (CASE WHEN v_pending_task_id IS NOT NULL OR NOT v_is_bundle_task THEN v_earned_amount ELSE 0 END),
        total_earned = total_earned + (CASE WHEN v_pending_task_id IS NOT NULL OR NOT v_is_bundle_task THEN v_earned_amount ELSE 0 END),
        
        -- Money moves in/out of freeze depending on the stage
        freeze_balance = freeze_balance 
            + (CASE WHEN v_pending_task_id IS NULL AND v_is_bundle_task THEN (v_cost_amount + v_earned_amount) ELSE 0 END)
            - (CASE WHEN v_pending_task_id IS NOT NULL THEN (v_cost_amount + v_earned_amount) ELSE 0 END),

        -- Rule 3: Progress count ONLY increments when the task is fully VERIFIED as completed
        completed_count = CASE 
            WHEN (v_pending_task_id IS NOT NULL) OR (v_pending_task_id IS NULL AND NOT v_is_bundle_task) 
            THEN completed_count + 1 
            ELSE completed_count 
        END,
        pending_bundle = CASE WHEN v_is_bundle_task THEN NULL ELSE pending_bundle END
    WHERE id = v_user_id
    RETURNING wallet_balance INTO v_new_wallet_balance;

    -- J. Log success with status-dependent logic
    IF v_pending_task_id IS NOT NULL THEN
        UPDATE public.user_tasks 
        SET status = 'completed', completed_at = NOW(), earned_amount = v_earned_amount, cost_amount = v_cost_amount, is_bundle = v_is_bundle_task
        WHERE id = v_pending_task_id;
    ELSE
        -- If it's a bundle, it starts as 'pending'. If regular, it's 'completed'.
        INSERT INTO public.user_tasks (user_id, task_item_id, status, earned_amount, cost_amount, is_bundle, completed_at)
        VALUES (
            v_user_id, 
            p_task_item_id, 
            CASE WHEN v_is_bundle_task THEN 'pending' ELSE 'completed' END, 
            v_earned_amount, 
            v_cost_amount, 
            v_is_bundle_task, 
            CASE WHEN v_is_bundle_task THEN NULL ELSE NOW() END
        );
    END IF;

    -- K. Transaction Recording (Complete Audit Trail)
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (v_user_id, 'commission', v_earned_amount, 'Optimization Reward: ' || COALESCE(v_task_title, 'Standard Task'), 'approved');

    -- Log the "Freeze/Deduction" if it's a new bundle being processed immediately
    IF v_pending_task_id IS NULL AND v_is_bundle_task AND v_cost_amount > 0 THEN
        INSERT INTO public.transactions (user_id, type, amount, description, status)
        VALUES (v_user_id, 'freeze', -v_cost_amount, 'Allocation Lock: ' || COALESCE(v_task_title, 'Bundle'), 'approved');
    END IF;

    -- Log the "Unfreeze/Return" for all bundles
    IF (v_is_bundle_task OR v_pending_task_id IS NOT NULL) AND v_cost_amount > 0 THEN
        INSERT INTO public.transactions (user_id, type, amount, description, status)
        VALUES (v_user_id, 'unfreeze', v_cost_amount, 'Capital Return: ' || COALESCE(v_task_title, 'Bundle'), 'approved');
    END IF;

    -- L. Referral Bonus (20%)
    IF v_referrer_id IS NOT NULL AND v_earned_amount > 0 THEN
        v_ref_bonus := ROUND((v_earned_amount * 0.20), 2);
        IF v_ref_bonus > 0 AND EXISTS (SELECT 1 FROM public.profiles WHERE id = v_referrer_id) THEN
            UPDATE public.profiles SET wallet_balance = wallet_balance + v_ref_bonus, referral_earned = referral_earned + v_ref_bonus WHERE id = v_referrer_id;
            INSERT INTO public.transactions (user_id, type, amount, description, status) VALUES (v_referrer_id, 'commission', v_ref_bonus, 'Optimization Team Referral Bonus (20%)', 'approved');
            INSERT INTO public.notifications (user_id, title, message, type) VALUES (v_referrer_id, 'Bonus Received!  🎉', 'Earned $' || v_ref_bonus || ' from teammate optimization.', 'success');
        END IF;
    END IF;

    -- M. SALARY TRACKING (Consecutive Days)
    IF (v_tasks_in_current_set + 1) >= v_tasks_per_set AND v_current_set >= v_sets_per_day THEN
       IF v_last_work_day IS NULL OR (NOW() - v_last_work_day) > INTERVAL '40 hours' THEN
           v_days_count := 1;
       ELSE
           v_days_count := v_days_count + 1;
       END IF;

       UPDATE public.profiles SET salary_days_count = v_days_count, last_work_day_at = NOW() WHERE id = v_user_id;
       INSERT INTO public.notifications (user_id, title, message, type) VALUES (v_user_id, 'Work Day Complete! 📅', 'Streak: ' || v_days_count || ' days. Check Salary Hub.', 'info');
    END IF;

    RETURN json_build_object(
        'success', true,
        'earned_amount', v_earned_amount,
        'new_balance', v_new_wallet_balance,
        'set_complete', (v_tasks_in_current_set + 1 >= v_tasks_per_set),
        'is_bundle', v_is_bundle_task
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G. NEW ATOMIC DEDUCTION FUNCTION FOR BUNDLES
-- This is called when a user clicks "Start Bundle Sequence"
CREATE OR REPLACE FUNCTION public.accept_bundle_deduction(
    p_user_id UUID,
    p_amount DECIMAL(12,2)
)
RETURNS JSON AS $$
DECLARE
    v_new_balance DECIMAL(12,2);
BEGIN
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - p_amount
    WHERE id = p_user_id
    RETURNING wallet_balance INTO v_new_balance;

    RETURN json_build_object(
        'success', TRUE,
        'new_balance', v_new_balance
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
