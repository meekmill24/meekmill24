import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key);
};


// GET all bundle packages
export async function GET(req: NextRequest) {

    try {
        const supabaseAdmin = getAdminClient();
        const { data, error } = await supabaseAdmin
            .from('bundle_packages')
            .select('*')
            .order('total_amount', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Add new bundle package
export async function POST(req: NextRequest) {

    try {
        const bundle = await req.json();
        const supabaseAdmin = getAdminClient();

        const { data, error } = await supabaseAdmin
            .from('bundle_packages')
            .insert(bundle)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: Update existing bundle package
export async function PATCH(req: NextRequest) {

    try {
        const { id, ...updates } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const supabaseAdmin = getAdminClient();
        const { data, error } = await supabaseAdmin
            .from('bundle_packages')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Remove bundle package
export async function DELETE(req: NextRequest) {

    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const supabaseAdmin = getAdminClient();
        const { error } = await supabaseAdmin
            .from('bundle_packages')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
