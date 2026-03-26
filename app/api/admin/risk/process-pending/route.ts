import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';
import { processPendingRiskEvents } from '@/lib/risk/runtime';

export async function POST(request: NextRequest) {
    try {
        const { adminClient } = await requireAdminAccess();
        const body = await request.json().catch(() => ({}));
        const limit = Number(body.limit || 25);
        const processed = await processPendingRiskEvents(adminClient, limit);

        return NextResponse.json({
            processed,
            count: processed.length,
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to process pending events' },
            { status: 500 }
        );
    }
}
