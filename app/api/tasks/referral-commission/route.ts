import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { userId, earnedAmount } = await req.json();

        if (!userId || !earnedAmount || Number(earnedAmount) <= 0) {
            return NextResponse.json({ skipped: true, reason: 'No valid earned amount' });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Security Verification: Ensure the user actually completed a task recently
        // Checking both created_at and completed_at in a 15-minute window for maximum resilience
        const verificationWindow = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        
        const { data: recentTask } = await supabaseAdmin
            .from('user_tasks')
            .select('id, earned_amount, completed_at, created_at')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .or(`completed_at.gte.${verificationWindow},created_at.gte.${verificationWindow}`)
            .limit(1);

        if (!recentTask || recentTask.length === 0) {
            // Check transactions as final fallback
            const { data: recentTransactions } = await supabaseAdmin
                .from('transactions')
                .select('id')
                .eq('user_id', userId)
                .gte('created_at', verificationWindow)
                .limit(1);

            if (!recentTransactions || recentTransactions.length === 0) {
                return NextResponse.json({ skipped: true, reason: 'Identity verification failed: No recent node activity detected.' });
            }
        }

        // 2. Find the referrer of this user
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('referred_by, username')
            .eq('id', userId)
            .single();

        if (profileError || !userProfile?.referred_by) {
            return NextResponse.json({ skipped: true, reason: 'No referrer found' });
        }

        const referrerId = userProfile.referred_by;

        // 3. Fetch referral commission rate from site_settings (default 20%)
        const { data: settings } = await supabaseAdmin
            .from('site_settings')
            .select('key, value')
            .eq('key', 'referral_commission_rate');

        const commissionRate = Number(
            settings?.find((s: any) => s.key === 'referral_commission_rate')?.value ?? 0.20
        );

        const commissionAmount = Number((Number(earnedAmount) * commissionRate).toFixed(2));

        if (commissionAmount <= 0) {
            return NextResponse.json({ skipped: true, reason: 'Commission too small' });
        }

        // 4. Update referrer's balances (Note: Using RPC for atomic increment is recommended for high-traffic systems)
        const { data: referrerProfile, error: referrerError } = await supabaseAdmin
            .from('profiles')
            .select('wallet_balance, referral_earned, username, profit')
            .eq('id', referrerId)
            .single();

        if (referrerError || !referrerProfile) {
            return NextResponse.json({ skipped: true, reason: 'Referrer profile not found' });
        }

        const newWalletBalance = Number(referrerProfile.wallet_balance || 0) + commissionAmount;
        const newReferralEarned = Number(referrerProfile.referral_earned || 0) + commissionAmount;
        const newProfit = Number(referrerProfile.profit || 0) + commissionAmount;

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                wallet_balance: newWalletBalance,
                referral_earned: newReferralEarned,
                profit: newProfit
            })
            .eq('id', referrerId);

        if (updateError) {
            console.error('[Commission] Failed to credit referrer:', updateError.message);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 5. Create transaction for referrer
        const description = `Optimization Team Referral Bonus (20%)`;
        await supabaseAdmin.from('transactions').insert({
            user_id: referrerId,
            type: 'commission',
            amount: commissionAmount,
            description: description,
            status: 'approved'
        });

        // 6. Send Notification to Referrer
        await supabaseAdmin.from('notifications').insert({
            user_id: referrerId,
            title: 'Protocol Yield Synchronized',
            message: `Neural network validated a task optimization by your agent ${userProfile.username}. A referral bonus of $${commissionAmount} has been credited to your node.`,
            type: 'success',
            is_read: false
        });

        console.log(
            `[Commission] Credited $${commissionAmount} (20%) to ${referrerProfile.username} ` +
            `from task by ${userProfile.username} (earned: $${earnedAmount})`
        );

        return NextResponse.json({
            success: true,
            referrerId,
            commissionAmount,
            newWalletBalance,
            newReferralEarned,
            newProfit
        });

    } catch (err: any) {
        console.error('[Commission] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

