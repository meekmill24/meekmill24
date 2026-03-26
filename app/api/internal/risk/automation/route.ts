import { NextRequest, NextResponse } from 'next/server';
import { requireAutomationSecret } from '@/lib/supabase/admin';
import { runRiskAutomationCycle } from '@/lib/risk/orchestration';

export async function POST(request: NextRequest) {
    try {
        const { adminClient } = requireAutomationSecret(request);
        const body = await request.json().catch(() => ({}));
        const result = await runRiskAutomationCycle(adminClient, {
            eventBatchSize: body.eventBatchSize ? Number(body.eventBatchSize) : undefined,
            maxEventBatches: body.maxEventBatches ? Number(body.maxEventBatches) : undefined,
            maxTrainingRuns: body.maxTrainingRuns ? Number(body.maxTrainingRuns) : undefined,
            forceQueueTraining: Boolean(body.forceQueueTraining),
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to run internal risk automation cycle' },
            { status: error?.status || 500 }
        );
    }
}
