import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { username, password, phone, withdrawalPassword, referral, isLinkOnly, existingUserId } = await req.json();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // If this is a real-email signup flow, the user was already created via standard signUp.
        // We just need to perform the privileged profile linking.
        if (isLinkOnly && existingUserId) {
            // Give trigger a moment to run
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: userObj, error: userErr } = await supabaseAdmin.auth.admin.getUserById(existingUserId);
            if (userErr || !userObj.user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            
            const refCode = referral || userObj.user.user_metadata?.referral_code_used;
            await processProfileSetup(supabaseAdmin, existingUserId, username, refCode);
            
            return NextResponse.json({ success: true, linked: true });
        }

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const fakeEmail = `${username}@captiv8.io`;

        // Perform the registration
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: fakeEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                username: username,
                display_name: username,
                phone_number: phone,
                withdrawal_password: withdrawalPassword,
                referral_code_used: referral
            }
        });

        if (error) throw error;

        // Wait briefly for DB trigger to create the profile row
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (data.user) {
            await processProfileSetup(supabaseAdmin, data.user.id, username, referral);
        }

        return NextResponse.json({ success: true, fakeEmail });
    } catch (err: any) {
        console.error('Fast-Track Registration Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

async function processProfileSetup(supabaseAdmin: any, userId: string, username: string, referralCode?: string) {
    // Fetch welcome_bonus from site_settings (admin-editable)
    const { data: settings } = await supabaseAdmin
        .from('site_settings')
        .select('key, value')
        .in('key', ['welcome_bonus']);

    const welcomeBonus = Number(
        settings?.find((s: any) => s.key === 'welcome_bonus')?.value ?? 0
    );

    // Resolve referrer profile if referral code was provided
    let referrerId: string | null = null;
    if (referralCode) {
        const { data: referrerProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode)
            .single();
        referrerId = referrerProfile?.id || null;
    }

    // Update new user's profile: set welcome bonus + link referrer
    const profileUpdate: Record<string, any> = {};
    if (welcomeBonus > 0) profileUpdate.wallet_balance = welcomeBonus;
    if (referrerId) profileUpdate.referred_by = referrerId;
    if (username) profileUpdate.username = username; // Update username directly for strict email flow

    if (Object.keys(profileUpdate).length > 0) {
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(profileUpdate)
            .eq('id', userId);

        if (updateError) {
            console.error('[Register] Profile update error:', updateError.message);
        } else if (welcomeBonus > 0) {
            // Log the welcome bonus as a transaction for auditing
            await supabaseAdmin.from('transactions').insert({
                user_id: userId,
                type: 'deposit',
                amount: welcomeBonus,
                description: 'System Welcome Bonus'
            });
        }
    }

    console.log(`[Register/Link] Agent: ${username} | Welcome bonus: $${welcomeBonus} | Referred by: ${referrerId || 'none'}`);
}
