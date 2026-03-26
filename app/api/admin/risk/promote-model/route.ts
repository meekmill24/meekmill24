import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';
import { activateRiskModel, getRiskRuntimeStatus, promoteRiskModel } from '@/lib/risk/training';

export async function POST(request: NextRequest) {
    try {
        const { adminClient } = await requireAdminAccess();
        const body = await request.json();
        const modelId = Number(body.modelId);

        if (!Number.isFinite(modelId) || modelId <= 0) {
            return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
        }

        const model = await promoteRiskModel(adminClient, modelId);
        const activation = await activateRiskModel(adminClient, model.id);
        const runtime = await getRiskRuntimeStatus(adminClient);
        return NextResponse.json({ model, activation, runtime });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to promote risk model' },
            { status: 500 }
        );
    }
}
