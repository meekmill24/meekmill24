import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';
import { activateRiskModel, getRiskRuntimeStatus } from '@/lib/risk/training';

export async function GET() {
    try {
        const { adminClient } = await requireAdminAccess();
        const runtime = await getRiskRuntimeStatus(adminClient);

        return NextResponse.json({
            runtime,
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to load risk runtime status' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { adminClient } = await requireAdminAccess();
        const body = await request.json().catch(() => ({}));
        const modelId = body.modelId ? Number(body.modelId) : undefined;
        const activation = await activateRiskModel(adminClient, modelId);
        const runtime = await getRiskRuntimeStatus(adminClient);

        return NextResponse.json({
            activation,
            runtime,
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to activate risk runtime' },
            { status: 500 }
        );
    }
}
