import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {

    try {
        const { email, password, username, phone, role } = await req.json();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                username,
                display_name: username,
                phone_number: phone,
                role: role || 'user'
            }
        });

        if (authError) throw authError;

        // 2. Profile creation is usually handled by a trigger, but let's update it if needed
        // to ensure it has the right role and balance
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                username,
                display_name: username,
                phone,
                role: role || 'user',
                is_admin: role === 'admin'
            })
            .eq('id', authData.user.id);

        if (profileError) {
            console.error('Profile update error (may be fine if trigger ran):', profileError);
        }

        return NextResponse.json({ success: true, user: authData.user });
    } catch (err: any) {
        console.error('Create User Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
