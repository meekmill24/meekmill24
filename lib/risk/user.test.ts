import { describe, expect, it } from 'vitest';
import { buildUserRiskSummary, shouldBlockWithdrawal } from '@/lib/risk/user';

describe('risk user helpers', () => {
    it('builds a blocking summary for held or high-risk profiles', () => {
        const summary = buildUserRiskSummary(
            {
                risk_score: 0.82,
                risk_segment: 'high',
                risk_review_priority: 0.93,
                risk_recommended_action: 'payout_hold_and_review',
                risk_hold_active: true,
                risk_case_id: 'case-1',
            },
            {
                id: 'case-1',
                status: 'open',
                priority: 'high',
                title: 'Security review',
                summary: 'Withdrawal ring pattern detected.',
                recommended_action: 'payout_hold_and_review',
            },
            1
        );

        expect(summary.holdActive).toBe(true);
        expect(summary.caseId).toBe('case-1');
        expect(shouldBlockWithdrawal(summary)).toBe(true);
    });

    it('keeps low-risk users clear for withdrawals', () => {
        const summary = buildUserRiskSummary(
            {
                risk_score: 0.12,
                risk_segment: 'low',
                risk_review_priority: 0.04,
                risk_recommended_action: 'allow_with_monitoring',
                risk_hold_active: false,
            },
            null,
            0
        );

        expect(summary.holdActive).toBe(false);
        expect(shouldBlockWithdrawal(summary)).toBe(false);
    });

    it('prefers the resolved open case when profile pointers are stale', () => {
        const summary = buildUserRiskSummary(
            {
                risk_score: 0.98,
                risk_segment: 'critical',
                risk_review_priority: 1,
                risk_recommended_action: 'manual_review',
                risk_hold_active: true,
                risk_case_id: 'stale-case-id',
            },
            {
                id: 'fresh-case-id',
                status: 'open',
                priority: 'high',
                title: 'Fresh payout hold',
                summary: 'Newly opened payout hold case.',
                recommended_action: 'payout_hold_and_review',
            },
            2
        );

        expect(summary.caseId).toBe('fresh-case-id');
        expect(summary.recommendedAction).toBe('payout_hold_and_review');
        expect(summary.openCase?.id).toBe('fresh-case-id');
    });
});
