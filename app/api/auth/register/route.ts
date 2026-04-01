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

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: fakeEmail,
            password: password,
            email_confirm: true, // Forces verification bypass
            user_metadata: {
                username: username,
                display_name: username,
                phone_number: phone,
                withdrawal_password: withdrawalPassword,
                referral_code_used: referral
            }
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, fakeEmail });
    } catch (err: any) {
        console.error('Fast-Track Registration Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
