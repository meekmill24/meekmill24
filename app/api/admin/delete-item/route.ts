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
        const { id, type } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const supabaseAdmin = getAdminClient();
        const table = type === 'level' ? 'levels' : 'task_items';

        const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
