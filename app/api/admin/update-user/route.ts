import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {

    try {
        const { userId, updateData } = await req.json();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const payload: any = {};
        const allowedFields = [
            'username', 'display_name', 'phone', 'phone_number', 
            'role', 'level_id', 'wallet_balance', 'profit', 
            'completed_count', 'current_set', 'total_earned', 
            'total_volume', 'is_verified', 'verification_status',
            'pending_bundle', 'freeze_balance', 'is_admin',
            'withdrawal_password', 'tasks_per_set_override', 'sets_per_day_override'
        ];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                payload[key] = updateData[key];
            }
        });

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(payload)
            .eq('id', userId)
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, user: data?.[0] });
    } catch (err: any) {
        console.error('Update User Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
