import { NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { adminClient } = await requireAdminAccess();

        const [
            openCases,
            criticalCases,
            highCases,
            pendingEvents,
            failedEvents,
            shadowModels,
            championModels,
            recentPredictions,
        ] = await Promise.all([
            adminClient.from('risk_cases').select('*', { count: 'exact', head: true }).in('status', ['open', 'investigating', 'escalated']),
            adminClient.from('risk_predictions').select('*', { count: 'exact', head: true }).eq('severity', 'critical').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
            adminClient.from('risk_predictions').select('*', { count: 'exact', head: true }).eq('severity', 'high').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
            adminClient.from('risk_events').select('*', { count: 'exact', head: true }).eq('processing_status', 'pending'),
            adminClient.from('risk_events').select('*', { count: 'exact', head: true }).eq('processing_status', 'failed'),
            adminClient.from('risk_model_registry').select('*', { count: 'exact', head: true }).eq('stage', 'shadow'),
            adminClient.from('risk_model_registry').select('*', { count: 'exact', head: true }).eq('stage', 'champion'),
            adminClient
                .from('risk_predictions')
                .select('id, entity_type, entity_id, risk_score, severity, confidence, recommended_action, created_at')
                .order('created_at', { ascending: false })
                .limit(12),
        ]);

        const averageRisk =
            ((recentPredictions.data || []) as Array<{ risk_score: number }>).reduce(
                (sum, prediction) => sum + Number(prediction.risk_score || 0),
                0
            ) / Math.max((recentPredictions.data || []).length, 1);

        return NextResponse.json({
            openCases: openCases.count || 0,
            criticalCases: criticalCases.count || 0,
            highCases: highCases.count || 0,
            pendingEvents: pendingEvents.count || 0,
            failedEvents: failedEvents.count || 0,
            shadowModels: shadowModels.count || 0,
            championModels: championModels.count || 0,
            averageRecentRisk: Number(averageRisk.toFixed(4)),
            recentPredictions: recentPredictions.data || [],
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to load risk summary' },
            { status: 500 }
        );
    }
}
