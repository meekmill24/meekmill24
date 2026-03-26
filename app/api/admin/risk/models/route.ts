import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';
import { getRiskRuntimeStatus } from '@/lib/risk/training';

export async function GET() {
    try {
        const { adminClient } = await requireAdminAccess();
        const [modelsResult, runsResult, operationRunsResult, settingsResult, runtime] = await Promise.all([
            adminClient.from('risk_model_registry').select('*').order('created_at', { ascending: false }).limit(20),
            adminClient.from('risk_training_runs').select('*').order('created_at', { ascending: false }).limit(20),
            adminClient.from('risk_operation_runs').select('*').order('started_at', { ascending: false }).limit(20),
            adminClient.from('risk_system_settings').select('*').order('key', { ascending: true }),
            getRiskRuntimeStatus(adminClient),
        ]);

        return NextResponse.json({
            models: modelsResult.data || [],
            trainingRuns: runsResult.data || [],
            operationRuns: operationRunsResult.data || [],
            settings: settingsResult.data || [],
            runtime: {
                serviceUrlConfigured: Boolean(process.env.AI_RISK_SERVICE_URL),
                localFallbackModel: 'captiv8-fallback-fusion@0.1.0',
                runtimeModelDir: runtime.runtimeModelDir,
                activationManifest: runtime.activationManifest,
                serviceReachable: runtime.serviceReachable,
                serviceStatus: runtime.serviceStatus,
                championModel: runtime.championModel,
            },
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to load risk model registry' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { adminClient, user } = await requireAdminAccess();
        const body = await request.json().catch(() => ({}));
        const runKey = `manual-${Date.now()}`;

        const { data, error } = await adminClient
            .from('risk_training_runs')
            .insert({
                run_key: runKey,
                status: 'queued',
                notes: {
                    requested_by: user.id,
                    requested_at: new Date().toISOString(),
                    ...body,
                },
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            trainingRun: data,
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to queue risk training run' },
            { status: 500 }
        );
    }
}
