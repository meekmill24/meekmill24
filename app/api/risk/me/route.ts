import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildUserRiskSummary } from '@/lib/risk/user';

function isMissingRelationError(error: unknown, relation: string) {
    const message = error instanceof Error ? error.message : String(error || '');
    return message.includes(relation) || message.includes(`relation "${relation}" does not exist`);
}

export async function GET() {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profileResult = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const { data: profile, error: profileError } = profileResult;

        if (profileError) {
            throw profileError;
        }

        const preferredCaseId =
            typeof profile?.risk_case_id === 'string' && profile.risk_case_id.trim().length > 0
                ? profile.risk_case_id
                : null;

        const [preferredCaseResult, latestCaseResult, countResult] = await Promise.all([
            preferredCaseId
                ? adminClient
                    .from('risk_cases')
                    .select('id, status, priority, summary, title, recommended_action')
                    .eq('id', preferredCaseId)
                    .eq('user_id', user.id)
                    .in('status', ['open', 'investigating', 'escalated'])
                    .maybeSingle()
                : Promise.resolve({ data: null, error: null }),
            adminClient
                .from('risk_cases')
                .select('id, status, priority, summary, title, recommended_action')
                .eq('user_id', user.id)
                .in('status', ['open', 'investigating', 'escalated'])
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
            adminClient
                .from('risk_cases')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('status', ['open', 'investigating', 'escalated']),
        ]);

        let openCase = preferredCaseResult.data || latestCaseResult.data;
        let openCaseCount = countResult.count || 0;
        const preferredCaseError = preferredCaseResult.error;
        const latestCaseError = latestCaseResult.error;
        const countError = countResult.error;

        if (preferredCaseError && !isMissingRelationError(preferredCaseError, 'risk_cases')) {
            throw preferredCaseError;
        }

        if (latestCaseError && !isMissingRelationError(latestCaseError, 'risk_cases')) {
            throw latestCaseError;
        }

        if (countError && !isMissingRelationError(countError, 'risk_cases')) {
            throw countError;
        }

        if (
            (preferredCaseError && isMissingRelationError(preferredCaseError, 'risk_cases')) ||
            (latestCaseError && isMissingRelationError(latestCaseError, 'risk_cases'))
        ) {
            openCase = null;
        }

        if (countError && isMissingRelationError(countError, 'risk_cases')) {
            openCaseCount = 0;
        }

        const riskSummary = buildUserRiskSummary(profile, openCase, openCaseCount || 0);

        return NextResponse.json({
            riskSummary,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to load risk summary' },
            { status: 500 }
        );
    }
}
