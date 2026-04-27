import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
    try {
        const { username, password, phone, withdrawalPassword, referral, isLinkOnly, existingUserId, isRealEmail, email: providedEmail } = await req.json();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Standard link-only flow (can be kept for edge cases, but unified flow is used now)
        if (isLinkOnly && existingUserId) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { data: userObj } = await supabaseAdmin.auth.admin.getUserById(existingUserId);
            if (userObj.user) {
                await processProfileSetup(supabaseAdmin, existingUserId, username, referral);
            }
            return NextResponse.json({ success: true });
        }

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        // 1. Check if username is already taken
        const { data: existingUser } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
        }

        const email = isRealEmail ? providedEmail : `${username}@captiv8s.com`;
        const emailConfirm = !isRealEmail; // Only auto-confirm if it's a fake email

        // Perform the registration
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Allow immediate login without waiting for email confirmation
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
            
            // Generate and send verification link via Resend for real emails
            // Note: Even though we auto-confirmed for login, we still send a link to verify the identity for withdrawals
            if (isRealEmail) {
                const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
                    type: 'signup',
                    email: email,
                    password: password,
                    options: { redirectTo: `${new URL(req.url).origin}/auth/verified?u=${data.user.id}` }
                });

                if (linkData?.properties?.action_link) {
                    await sendEmail({
                        to: email,
                        subject: 'Unlock Your Withdrawals - Captiv8',
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #0a0a0b; color: white; border-radius: 24px; border: 1px solid #333;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #007CBA; font-size: 24px; text-transform: uppercase; letter-spacing: 4px; font-style: italic; margin: 0;">Captiv8</h1>
                                    <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Identity Node Verification</p>
                                </div>
                                <p style="font-size: 14px; line-height: 1.6; color: #ccc;">Welcome <strong>${username}</strong>,</p>
                                <p style="font-size: 14px; line-height: 1.6; color: #ccc;">Your institutional node is active and you can now start earning. However, to enable **withdrawals** and higher capital settlement limits, you must authorize your identity link:</p>
                                <div style="text-align: center; margin: 40px 0;">
                                    <a href="${linkData.properties.action_link}" style="background: #007CBA; color: white; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; box-shadow: 0 10px 20px rgba(0, 124, 186, 0.3);">Enable Withdrawal Node</a>
                                </div>
                                <p style="font-size: 12px; color: #555; text-align: center;">This link will expire in 24 hours. If you did not request this, please disregard.</p>
                                <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
                                <p style="font-size: 9px; color: #444; text-align: center; text-transform: uppercase; letter-spacing: 1px;">© 2024 Captiv8 • Distributed Governance Protocol</p>
                            </div>
                        `
                    });
                }
            }
        }

        return NextResponse.json({ success: true, fakeEmail: !isRealEmail ? email : undefined });
    } catch (err: any) {
        console.error('Registration/Verification Flow Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

async function generateUniqueReferralCode(supabaseAdmin: any): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string = '';
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
        attempts++;

        // Generate a random 4-character code
        code = '';
        for (let i = 0; i < 4; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if this code already exists
        const { data: existing, error } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('referral_code', code)
            .single();

        // PGRST116 = no rows found = code is unique
        if (error?.code === 'PGRST116' || !existing) {
            isUnique = true;
        }
    }

    if (!isUnique) {
        throw new Error('Unable to generate unique referral code after maximum attempts');
    }

    return code;
}

async function processProfileSetup(supabaseAdmin: any, userId: string, username: string, referralCode?: string) {
    // Generate a unique referral code for the new user
    const uniqueReferralCode = await generateUniqueReferralCode(supabaseAdmin);

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

    // Update new user's profile: set welcome bonus + link referrer + assign referral code
    const profileUpdate: Record<string, any> = {};
    if (welcomeBonus > 0) profileUpdate.wallet_balance = welcomeBonus;
    if (referrerId) profileUpdate.referred_by = referrerId;
    if (username) profileUpdate.username = username; // Update username directly for strict email flow
    profileUpdate.referral_code = uniqueReferralCode; // Always assign a unique referral code
    profileUpdate.is_verified = false; // Initialize verification as false for all users

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
                description: 'System Welcome Bonus',
                status: 'approved'
            });
        }
    }

    console.log(`[Register/Link] Agent: ${username} | Referral code: ${uniqueReferralCode} | Welcome bonus: $${welcomeBonus} | Referred by: ${referrerId || 'none'}`);
}
