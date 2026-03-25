import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';
import type { RiskEntityType } from '@/lib/types';
import { scoreAndPersistEntity } from '@/lib/risk/runtime';

export async function POST(request: NextRequest) {
    try {
        const { adminClient } = await requireAdminAccess();
        const body = await request.json();
        const entityType = body.entityType as RiskEntityType;
        const entityId = String(body.entityId || '');

        if (!entityType || !entityId) {
            return NextResponse.json({ error: 'entityType and entityId are required' }, { status: 400 });
        }

        const scored = await scoreAndPersistEntity(adminClient, entityType, entityId);

        return NextResponse.json(scored);
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to rescore entity' },
            { status: 500 }
        );
    }
}
