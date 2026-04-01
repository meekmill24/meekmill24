import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {

    try {
        const { key, value } = await req.json();

        if (!key) throw new Error('Key is required');

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Upsert setting: insert if missing, update if exists
        const { data, error } = await supabaseAdmin
            .from('site_settings')
            .upsert({ key, value }, { onConflict: 'key' })
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, setting: data?.[0] });
    } catch (err: any) {
        console.error('Update Site Setting Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
