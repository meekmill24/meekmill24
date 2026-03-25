import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';
import { runRiskAutomationCycle } from '@/lib/risk/orchestration';

export async function POST(request: NextRequest) {
    try {
        const { adminClient } = await requireAdminAccess();
        const body = await request.json().catch(() => ({}));
        const result = await runRiskAutomationCycle(adminClient, {
            eventBatchSize: body.eventBatchSize ? Number(body.eventBatchSize) : undefined,
            maxEventBatches: body.maxEventBatches ? Number(body.maxEventBatches) : undefined,
            maxTrainingRuns: body.maxTrainingRuns ? Number(body.maxTrainingRuns) : undefined,
            forceQueueTraining: Boolean(body.forceQueueTraining),
        });

        return NextResponse.json(result);
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to run risk automation cycle' },
            { status: 500 }
        );
    }
}
