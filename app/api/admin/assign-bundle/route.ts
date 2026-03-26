import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key);
};


export async function POST(req: NextRequest) {

    try {
        const { userId, bundle } = await req.json();
        const supabaseAdmin = getAdminClient();

        // 1. Clear any existing pending tasks to allow the "edit" or "re-deploy" to take effect immediately
        await supabaseAdmin
            .from('user_tasks')
            .delete()
            .eq('user_id', userId)
            .eq('status', 'pending');

        // 2. Update the profile with bundle data
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ pending_bundle: bundle })
            .eq('id', userId);

        if (profileError) {
            console.error("Assign Bundle DB Error:", profileError);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Assign Bundle Exception:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {

    try {
        const { userId, deductAmount, freezeAmount, clearTasks } = await req.json();
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

        const supabaseAdmin = getAdminClient();

        // 1. Perform balance deduction if amount provided (Acceptance flow)
        if (deductAmount && Number(deductAmount) > 0) {
            // Fallback JS-based deduction to avoid requiring custom SQL RPC
            const { data: userRecord, error: fetchErr } = await supabaseAdmin
                .from('profiles')
                .select('wallet_balance, freeze_balance')
                .eq('id', userId)
                .single();

            if (fetchErr) {
                console.error("Fetch Balance Error:", fetchErr);
                return NextResponse.json({ error: "Failed to read balance" }, { status: 500 });
            }

            const currentBalance = Number(userRecord.wallet_balance || 0);
            const newBalance = currentBalance - Number(deductAmount);
            
            const currentFreeze = Number(userRecord.freeze_balance || 0);
            const newFreeze = currentFreeze + Number(freezeAmount || 0);

            const { error: deductError } = await supabaseAdmin
                .from('profiles')
                .update({ wallet_balance: newBalance, freeze_balance: newFreeze })
                .eq('id', userId);

            if (deductError) {
                console.error("Deduction Error:", deductError);
                return NextResponse.json({ error: "Failed to deduct balance" }, { status: 500 });
            }
        }

        // 2. Clear the profile flag (The "Meeting" hit is finished)
        await supabaseAdmin
            .from('profiles')
            .update({ pending_bundle: null })
            .eq('id', userId);

        // 3. ONLY delete pending tasks if explicitly requested (Admin cancel)
        if (clearTasks) {
            await supabaseAdmin
                .from('user_tasks')
                .delete()
                .eq('user_id', userId)
                .eq('status', 'pending');
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Clear Bundle Exception:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
    }
}
