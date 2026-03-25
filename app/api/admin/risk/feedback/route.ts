import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const { adminClient, user } = await requireAdminAccess();
        const body = await request.json();
        const { caseId, predictionId, label, outcome, notes, closeCase, disposition } = body;

        if (!caseId || !label) {
            return NextResponse.json({ error: 'caseId and label are required' }, { status: 400 });
        }

        const { data: feedback, error } = await adminClient
            .from('risk_feedback')
            .insert({
                case_id: caseId,
                prediction_id: predictionId || null,
                reviewer_user_id: user.id,
                label,
                outcome: outcome || null,
                notes: notes || null,
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        if (closeCase) {
            await adminClient
                .from('risk_cases')
                .update({
                    status: label === 'clean' ? 'dismissed' : 'resolved',
                    disposition: disposition || outcome || label,
                    resolution_notes: notes || null,
                    closed_at: new Date().toISOString(),
                })
                .eq('id', caseId);
        }

        return NextResponse.json({
            feedback,
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create risk feedback' },
            { status: 500 }
        );
    }
}
