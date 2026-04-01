import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {

    try {
        const { userId, newPassword } = await req.json();

        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'User ID and New Password are required.' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Update the password in Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
        console.error('Password Reset Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
