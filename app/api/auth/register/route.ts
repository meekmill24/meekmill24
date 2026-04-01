import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { username, password, phone, withdrawalPassword, referral } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

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
            // Fetch welcome_bonus from site_settings (admin-editable)
            const { data: settings } = await supabaseAdmin
                .from('site_settings')
                .select('key, value')
                .in('key', ['welcome_bonus']);

            const welcomeBonus = Number(
                settings?.find(s => s.key === 'welcome_bonus')?.value ?? 0
            );

            // Resolve referrer profile if referral code was provided
            let referrerId: string | null = null;
            if (referral) {
                const { data: referrerProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('referral_code', referral)
                    .single();
                referrerId = referrerProfile?.id || null;
            }

            // Update new user's profile: set welcome bonus + link referrer
            const profileUpdate: Record<string, any> = {};
            if (welcomeBonus > 0) profileUpdate.wallet_balance = welcomeBonus;
            if (referrerId) profileUpdate.referred_by = referrerId;

            if (Object.keys(profileUpdate).length > 0) {
                const { error: updateError } = await supabaseAdmin
                    .from('profiles')
                    .update(profileUpdate)
                    .eq('id', data.user.id);

                if (updateError) {
                    console.error('[Register] Profile update error:', updateError.message);
                }
            }

            console.log(`[Register] New agent: ${username} | Welcome bonus: $${welcomeBonus} | Referred by: ${referrerId || 'none'}`);
        }

        return NextResponse.json({ success: true, fakeEmail });
    } catch (err: any) {
        console.error('Fast-Track Registration Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
