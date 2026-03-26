import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifies that the current request is from an authenticated admin user.
 * Returns the profile if successful, otherwise returns a NextResponse with an error.
 */
export async function verifyAdmin(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { error: NextResponse.json({ error: 'Unauthorized Node Access' }, { status: 401 }) };
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return { error: NextResponse.json({ error: 'Permission Denied: Insufficient Clearance' }, { status: 403 }) };
        }

        return { user, profile };
    } catch (err) {
        console.error('Admin verification error:', err);
        return { error: NextResponse.json({ error: 'System Protocol Error' }, { status: 500 }) };
    }
}
