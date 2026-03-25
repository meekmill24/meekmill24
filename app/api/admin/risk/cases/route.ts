import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthorizationError, requireAdminAccess } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
    try {
        const { adminClient } = await requireAdminAccess();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const severity = searchParams.get('severity');
        const userId = searchParams.get('userId');
        const query = searchParams.get('q');
        const limit = Number(searchParams.get('limit') || 50);

        let caseQuery = adminClient
            .from('risk_case_overview')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(limit);

        if (status && status !== 'all') {
            caseQuery = caseQuery.eq('status', status);
        }

        if (severity && severity !== 'all') {
            caseQuery = caseQuery.eq('severity', severity);
        }

        if (userId) {
            caseQuery = caseQuery.eq('user_id', userId);
        }

        if (query) {
            caseQuery = caseQuery.or(
                `title.ilike.%${query}%,summary.ilike.%${query}%,username.ilike.%${query}%,entity_id.ilike.%${query}%`
            );
        }

        const { data, error } = await caseQuery;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            cases: data || [],
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to load risk cases' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { adminClient, user } = await requireAdminAccess();
        const body = await request.json();
        const { caseId, status, assigneeUserId, resolutionNotes, disposition } = body;

        if (!caseId) {
            return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
        }

        const updates: Record<string, unknown> = {};

        if (status) {
            updates.status = status;
            if (status === 'resolved' || status === 'dismissed') {
                updates.closed_at = new Date().toISOString();
            }
        }

        if (assigneeUserId !== undefined) {
            updates.assignee_user_id = assigneeUserId || null;
        }

        if (resolutionNotes !== undefined) {
            updates.resolution_notes = resolutionNotes || null;
        }

        if (disposition !== undefined) {
            updates.disposition = disposition || null;
        }

        const { data, error } = await adminClient
            .from('risk_cases')
            .update(updates)
            .eq('id', caseId)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        await adminClient.from('risk_feedback').insert({
            case_id: caseId,
            reviewer_user_id: user.id,
            label: status === 'dismissed' ? 'clean' : 'needs_review',
            outcome: 'case_update',
            notes: `Case updated to ${status || 'unchanged'} by admin route.`,
        });

        return NextResponse.json({
            case: data,
        });
    } catch (error: any) {
        if (error instanceof AdminAuthorizationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to update risk case' },
            { status: 500 }
        );
    }
}
