-- Function to initiate a withdrawal request atomically
CREATE OR REPLACE FUNCTION request_withdrawal(
    p_amount DECIMAL,
    p_wallet_address TEXT,
    p_network TEXT,
    p_description TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_current_balance DECIMAL;
    v_risk_hold_active BOOLEAN := false;
    v_risk_score DECIMAL := 0;
    v_risk_segment TEXT := 'low';
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- 1. Check balance and lock for update
    SELECT
        wallet_balance,
        COALESCE(risk_hold_active, false),
        COALESCE(risk_score, 0),
        COALESCE(risk_segment, 'low')
    INTO
        v_current_balance,
        v_risk_hold_active,
        v_risk_score,
        v_risk_segment
    FROM profiles 
    WHERE id = v_user_id 
    FOR UPDATE;

    IF v_risk_hold_active THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Withdrawal temporarily held for security review',
            'risk_hold', true,
            'risk_score', v_risk_score,
            'risk_segment', v_risk_segment
        );
    END IF;

    IF v_current_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance for payout request');
    END IF;

    -- 2. Deduct balance immediately
    UPDATE profiles 
    SET wallet_balance = wallet_balance - p_amount
    WHERE id = v_user_id;

    -- 3. Create transaction record
    INSERT INTO transactions (user_id, type, amount, status, wallet_address, network, description)
    VALUES (v_user_id, 'withdrawal', p_amount, 'pending', p_wallet_address, p_network, p_description);

    RETURN jsonb_build_object('success', true, 'message', 'Withdrawal logic initialized');
END;
$$;

-- Function to handle deposit approval/rejection atomically
CREATE OR REPLACE FUNCTION handle_deposit_action(
    p_transaction_id INTEGER,
    p_status TEXT -- 'approved' or 'rejected'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_amount DECIMAL;
    v_user_id UUID;
    v_current_status TEXT;
BEGIN
    -- 1. Get transaction details and lock for update
    SELECT amount, user_id, status 
    INTO v_amount, v_user_id, v_current_status
    FROM transactions 
    WHERE id = p_transaction_id 
    AND type = 'deposit'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction not found');
    END IF;

    IF v_current_status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction already processed');
    END IF;

    -- 2. Update transaction status
    UPDATE transactions 
    SET status = p_status 
    WHERE id = p_transaction_id;

    -- 3. If approved, update user balance
    IF p_status = 'approved' THEN
        UPDATE profiles 
        SET wallet_balance = wallet_balance + v_amount
        WHERE id = v_user_id;
        
        -- Notification for the user
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (v_user_id, 'deposit_approved', 'Deposit Approved', 'Your deposit of $' || v_amount || ' has been credited to your account.');
    ELSE
        -- If rejected, create notification
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (v_user_id, 'deposit_rejected', 'Deposit Rejected', 'Your deposit request for $' || v_amount || ' was rejected. Please contact support.');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Deposit ' || p_status);
END;
$$;

-- Function to handle withdrawal approval/rejection atomically
CREATE OR REPLACE FUNCTION handle_withdrawal_action(
    p_transaction_id INTEGER,
    p_status TEXT -- 'approved' or 'rejected'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_amount DECIMAL;
    v_user_id UUID;
    v_current_status TEXT;
BEGIN
    -- 1. Get transaction details
    SELECT amount, user_id, status 
    INTO v_amount, v_user_id, v_current_status
    FROM transactions 
    WHERE id = p_transaction_id 
    AND type = 'withdrawal'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction not found');
    END IF;

    IF v_current_status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction already processed');
    END IF;

    -- 2. Update transaction status
    UPDATE transactions SET status = p_status WHERE id = p_transaction_id;

    -- 3. If approved, send notification
    IF p_status = 'approved' THEN
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (v_user_id, 'withdrawal_approved', 'Withdrawal Processed', 'Your payout of $' || v_amount || ' has been approved and disbursed.');
    ELSE
        -- CRITICAL: If rejected, REFUND balance because it was deducted at request time now
        UPDATE profiles 
        SET wallet_balance = wallet_balance + v_amount
        WHERE id = v_user_id;

        INSERT INTO notifications (user_id, type, title, message)
        VALUES (v_user_id, 'withdrawal_rejected', 'Withdrawal Rejected', 'Your payout request for $' || v_amount || ' was rejected. Funds have been returned to your wallet balance.');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Withdrawal ' || p_status);
END;
$$;
