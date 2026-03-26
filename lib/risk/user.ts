import type { Profile, RiskCase, RiskSeverity } from '@/lib/types';

export interface UserRiskSummary {
    riskScore: number;
    riskSegment: RiskSeverity;
    reviewPriority: number;
    recommendedAction: string | null;
    holdActive: boolean;
    caseId: string | null;
    openCaseCount: number;
    openCase?: Pick<RiskCase, 'id' | 'status' | 'priority' | 'summary' | 'title' | 'recommended_action'> | null;
}

export function buildUserRiskSummary(
    profile: Partial<Profile> | null | undefined,
    openCase?: Pick<RiskCase, 'id' | 'status' | 'priority' | 'summary' | 'title' | 'recommended_action'> | null,
    openCaseCount = 0
): UserRiskSummary {
    const riskScore = Number(profile?.risk_score || 0);
    const riskSegment = (profile?.risk_segment || 'low') as RiskSeverity;
    const recommendedAction = openCase?.recommended_action || profile?.risk_recommended_action || null;
    const holdActive =
        Boolean(profile?.risk_hold_active) ||
        riskSegment === 'high' ||
        riskSegment === 'critical' ||
        /freeze|hold|manual_review/i.test(recommendedAction || '');

    return {
        riskScore,
        riskSegment,
        reviewPriority: Number(profile?.risk_review_priority || 0),
        recommendedAction,
        holdActive,
        caseId: openCase?.id || (profile?.risk_case_id as string | null | undefined) || null,
        openCaseCount,
        openCase: openCase || null,
    };
}

export function shouldBlockWithdrawal(summary: UserRiskSummary) {
    return summary.holdActive || summary.riskSegment === 'high' || summary.riskSegment === 'critical';
}
