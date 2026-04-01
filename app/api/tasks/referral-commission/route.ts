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

        // 1. Find the referrer of this user
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('referred_by, username')
            .eq('id', userId)
            .single();

        if (profileError || !userProfile?.referred_by) {
            return NextResponse.json({ skipped: true, reason: 'No referrer found' });
        }

        const referrerId = userProfile.referred_by;

        // 2. Fetch referral commission rate from site_settings (default 20%)
        const { data: settings } = await supabaseAdmin
            .from('site_settings')
            .select('key, value')
            .eq('key', 'referral_commission_rate');

        const commissionRate = Number(
            settings?.find(s => s.key === 'referral_commission_rate')?.value ?? 0.20
        );

        const commissionAmount = Number((Number(earnedAmount) * commissionRate).toFixed(2));

        if (commissionAmount <= 0) {
            return NextResponse.json({ skipped: true, reason: 'Commission too small' });
        }

        // 3. Fetch referrer's current balances
        const { data: referrerProfile, error: referrerError } = await supabaseAdmin
            .from('profiles')
            .select('wallet_balance, referral_earned, username')
            .eq('id', referrerId)
            .single();

        if (referrerError || !referrerProfile) {
            return NextResponse.json({ skipped: true, reason: 'Referrer profile not found' });
        }

        const newWalletBalance = Number(referrerProfile.wallet_balance || 0) + commissionAmount;
        const newReferralEarned = Number(referrerProfile.referral_earned || 0) + commissionAmount;

        // 4. Credit the commission to the referrer
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                wallet_balance: newWalletBalance,
                referral_earned: newReferralEarned
            })
            .eq('id', referrerId);

        if (updateError) {
            console.error('[Commission] Failed to credit referrer:', updateError.message);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        console.log(
            `[Commission] Credited $${commissionAmount} (${commissionRate * 100}%) to ${referrerProfile.username} ` +
            `from task by ${userProfile.username} (earned: $${earnedAmount})`
        );

        return NextResponse.json({
            success: true,
            referrerId,
            commissionAmount,
            commissionRate,
            newWalletBalance,
            newReferralEarned
        });

    } catch (err: any) {
        console.error('[Commission] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
