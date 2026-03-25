import { describe, expect, it } from 'vitest';
import type { Profile, RiskCase, RiskPrediction, Transaction, UserTask } from '@/lib/types';
import { buildRiskFeatureSections, buildRiskGraphEdges, scoreRiskFeatureSections } from '@/lib/risk/engine';
import type { TransactionRiskContext } from '@/lib/risk/types';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
    return {
        id: 'user-1',
        username: 'alpha',
        display_name: 'Alpha',
        phone: '',
        phone_number: null,
        role: 'user',
        level_id: 1,
        referral_code: 'ABC123',
        referred_by: null,
        wallet_balance: -40,
        profit: 10,
        total_earned: 120,
        freeze_balance: 80,
        referral_earned: 0,
        avatar_url: null,
        email: 'alpha@example.com',
        completed_count: 4,
        current_set: 1,
        last_reset_at: new Date().toISOString(),
        language: 'en',
        currency: 'USD',
        pending_bundle: { active: true },
        notifications_enabled: true,
        is_verified: false,
        verification_status: 'pending',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        ...overrides,
    };
}

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        id: 42,
        user_id: 'user-1',
        type: 'withdrawal',
        amount: 900,
        description: 'Withdrawal',
        status: 'pending',
        created_at: new Date().toISOString(),
        wallet_address: 'wallet-1',
        proof_url: 'proof-1',
        network: 'TRC20',
        ...overrides,
    };
}

function makeTask(overrides: Partial<UserTask> = {}): UserTask {
    return {
        id: 10,
        user_id: 'user-1',
        task_item_id: 5,
        status: 'completed',
        earned_amount: 12,
        cost_amount: 30,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

function makePrediction(overrides: Partial<RiskPrediction> = {}): RiskPrediction {
    return {
        id: 1,
        entity_type: 'transaction',
        entity_id: '12',
        user_id: 'user-1',
        model_family: 'fusion',
        model_name: 'champion',
        model_version: '1.0.0',
        risk_score: 0.61,
        severity: 'medium',
        confidence: 0.82,
        recommended_action: 'queue_review',
        explanation: {},
        component_scores: {},
        rule_signals: {},
        graph_signals: {},
        shadow_mode: false,
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

function makeCase(overrides: Partial<RiskCase> = {}): RiskCase {
    return {
        id: 'case-1',
        entity_type: 'transaction',
        entity_id: '12',
        user_id: 'user-1',
        status: 'open',
        priority: 'high',
        current_risk_score: 0.71,
        title: 'Risk case',
        opened_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

describe('risk engine', () => {
    it('builds feature sections with graph and rule signals', () => {
        const context: TransactionRiskContext = {
            entityType: 'transaction',
            entityId: '42',
            userId: 'user-1',
            profile: makeProfile(),
            transaction: makeTransaction(),
            recentTransactions: [
                makeTransaction({ id: 1, amount: 100, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'approved', type: 'deposit' }),
                makeTransaction({ id: 2, amount: 110, created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'approved', type: 'deposit' }),
                makeTransaction({ id: 3, amount: 120, created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), status: 'rejected', type: 'withdrawal' }),
                makeTransaction(),
            ],
            recentTasks: [makeTask(), makeTask({ id: 11 }), makeTask({ id: 12 })],
            relatedProfiles: [makeProfile({ id: 'user-2', username: 'beta', withdrawal_wallet_address: 'wallet-1' })],
            sharedWalletTransactions: [makeTransaction({ id: 44, user_id: 'user-2', wallet_address: 'wallet-1' })],
            sharedProofTransactions: [makeTransaction({ id: 45, user_id: 'user-2', proof_url: 'proof-1' })],
            openCases: [makeCase()],
            latestPredictions: [makePrediction()],
            referredProfiles: [makeProfile({ id: 'user-3', username: 'gamma' })],
        };

        const features = buildRiskFeatureSections(context);
        const edges = buildRiskGraphEdges(context);

        expect(features.ruleFeatures.proofReuseFlag).toBe(true);
        expect(features.graphFeatures.sharedProofTransactions).toBe(1);
        expect(features.scalarFeatures.pendingTransactionCount).toBeGreaterThanOrEqual(1);
        expect(features.embeddingFeatures.graphLatent.length).toBeGreaterThan(0);
        expect(edges.some((edge) => edge.relationType === 'uses_proof')).toBe(true);
    });

    it('scores high-risk transaction contexts consistently', () => {
        const context: TransactionRiskContext = {
            entityType: 'transaction',
            entityId: '42',
            userId: 'user-1',
            profile: makeProfile(),
            transaction: makeTransaction(),
            recentTransactions: [
                makeTransaction({ id: 1, amount: 90, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'approved', type: 'deposit' }),
                makeTransaction({ id: 2, amount: 95, created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'approved', type: 'deposit' }),
                makeTransaction({ id: 3, amount: 105, created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), status: 'pending', type: 'withdrawal' }),
                makeTransaction(),
            ],
            recentTasks: [makeTask(), makeTask({ id: 11 }), makeTask({ id: 12 })],
            relatedProfiles: [makeProfile({ id: 'user-2', username: 'beta', withdrawal_wallet_address: 'wallet-1' })],
            sharedWalletTransactions: [makeTransaction({ id: 44, user_id: 'user-2', wallet_address: 'wallet-1' })],
            sharedProofTransactions: [makeTransaction({ id: 45, user_id: 'user-2', proof_url: 'proof-1' })],
            openCases: [makeCase()],
            latestPredictions: [makePrediction()],
            referredProfiles: [makeProfile({ id: 'user-3', username: 'gamma' })],
        };

        const features = buildRiskFeatureSections(context);
        const result = scoreRiskFeatureSections(context, features);

        expect(result.riskScore).toBeGreaterThan(0.4);
        expect(['medium', 'high', 'critical']).toContain(result.severity);
        expect(result.componentScores.rules).toBeGreaterThan(0);
        expect(result.explanation.topSignals.length).toBeGreaterThan(0);
    });
});
