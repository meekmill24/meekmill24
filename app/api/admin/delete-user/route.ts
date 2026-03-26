import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key);
};


export async function DELETE(req: NextRequest) {

    try {
        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

        const supabaseAdmin = getAdminClient();

        // 1. Delete user from auth.users (this will cascade delete from profiles if schema is set up, 
        //    but let's be explicit and handle errors if they aren't linked correctly)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        // Even if auth fails (maybe user doesn't exist in auth but exists in profile), 
        // we try to delete the profile record.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (authError && profileError) {
            console.error("Delete User Auth Error:", authError);
            console.error("Delete User Profile Error:", profileError);
            return NextResponse.json({ error: profileError.message || authError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Delete User Exception:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
    }
}
