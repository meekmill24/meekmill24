import type { RiskEntityType, RiskSeverity } from '@/lib/types';
import type { RiskContextBundle, RiskFeatureSections, RiskGraphEdgeInput, RiskScoringResult } from '@/lib/risk/types';

const EPSILON = 1e-6;
const FEATURE_VERSION = 'v1';

function hoursBetween(a?: string | null, b?: string | null) {
    if (!a || !b) {
        return 0;
    }

    const start = new Date(a).getTime();
    const end = new Date(b).getTime();
    return Math.max(0, (end - start) / (1000 * 60 * 60));
}

function hoursSince(date?: string | null) {
    if (!date) {
        return 0;
    }

    return Math.max(0, (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
}

function mean(values: number[]) {
    if (values.length === 0) {
        return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: number[]) {
    if (values.length < 2) {
        return 0;
    }

    const avg = mean(values);
    return mean(values.map((value) => (value - avg) ** 2));
}

function stdDev(values: number[]) {
    return Math.sqrt(variance(values));
}

function clamp(value: number, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
}

function sigmoid(value: number) {
    return 1 / (1 + Math.exp(-value));
}

function normalizeRatio(value: number, scale: number) {
    return clamp(value / Math.max(scale, EPSILON));
}

function sortTopSignals(signals: RiskScoringResult['explanation']['topSignals']) {
    return [...signals]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 6);
}

function severityFromScore(score: number): RiskSeverity {
    if (score >= 0.85) {
        return 'critical';
    }

    if (score >= 0.65) {
        return 'high';
    }

    if (score >= 0.4) {
        return 'medium';
    }

    return 'low';
}

function priorityAction(entityType: RiskEntityType, severity: RiskSeverity, ruleSignals: Record<string, number | boolean | string | null>) {
    if (severity === 'critical') {
        if (ruleSignals.walletReuseFlag || ruleSignals.proofReuseFlag) {
            return 'freeze_and_manual_review';
        }

        return 'manual_review_immediately';
    }

    if (severity === 'high') {
        if (entityType === 'transaction' && (ruleSignals.rapidWithdrawalAfterDepositFlag || ruleSignals.withdrawalWalletPresentFlag)) {
            return 'payout_hold_and_review';
        }

        return 'queue_priority_review';
    }

    if (severity === 'medium') {
        return 'queue_review';
    }

    return 'allow_with_monitoring';
}

function baseFeatureSections(): RiskFeatureSections {
    return {
        scalarFeatures: {},
        ruleFeatures: {},
        graphFeatures: {},
        sequenceFeatures: {},
        embeddingFeatures: {},
        labels: {
            feature_version: FEATURE_VERSION,
        },
    };
}

function buildBaseEdges(context: RiskContextBundle) {
    const edges: RiskGraphEdgeInput[] = [];

    if (context.profile) {
        edges.push({
            leftEntityType: context.entityType,
            leftEntityId: context.entityId,
            rightEntityType: 'profile',
            rightEntityId: context.profile.id,
            relationType: 'belongs_to_profile',
            weight: 1,
            metadata: {
                username: context.profile.username,
            },
        });

        if (context.profile.referred_by) {
            edges.push({
                leftEntityType: 'profile',
                leftEntityId: context.profile.id,
                rightEntityType: 'profile',
                rightEntityId: context.profile.referred_by,
                relationType: 'referred_by',
                weight: 0.75,
            });
        }

        if (context.profile.withdrawal_wallet_address) {
            edges.push({
                leftEntityType: 'profile',
                leftEntityId: context.profile.id,
                rightEntityType: 'wallet_address',
                rightEntityId: context.profile.withdrawal_wallet_address,
                relationType: 'uses_withdrawal_wallet',
                weight: 1,
            });
        }
    }

    return edges;
}

function commonFeatures(context: RiskContextBundle) {
    const txAmounts = context.recentTransactions.map((transaction) => Number(transaction.amount || 0));
    const txStdDev = stdDev(txAmounts);
    const txMean = mean(txAmounts);
    const pendingTransactions = context.recentTransactions.filter((transaction) => transaction.status === 'pending');
    const rejectedTransactions = context.recentTransactions.filter((transaction) => transaction.status === 'rejected');
    const approvedTransactions = context.recentTransactions.filter((transaction) => transaction.status === 'approved');
    const recent24hTransactions = context.recentTransactions.filter(
        (transaction) => hoursSince(transaction.created_at) <= 24
    );
    const recent72hTransactions = context.recentTransactions.filter(
        (transaction) => hoursSince(transaction.created_at) <= 72
    );
    const recent24hTasks = context.recentTasks.filter((task) => hoursSince(task.created_at) <= 24);

    return {
        txAmounts,
        txStdDev,
        txMean,
        pendingTransactions,
        rejectedTransactions,
        approvedTransactions,
        recent24hTransactions,
        recent72hTransactions,
        recent24hTasks,
    };
}

export function buildRiskFeatureSections(context: RiskContextBundle): RiskFeatureSections {
    const sections = baseFeatureSections();
    const common = commonFeatures(context);
    const latestPredictionScore = context.latestPredictions[0]?.risk_score ?? 0;

    sections.scalarFeatures.accountAgeHours = hoursSince(context.profile?.created_at);
    sections.scalarFeatures.walletBalance = Number(context.profile?.wallet_balance || 0);
    sections.scalarFeatures.freezeBalance = Number(context.profile?.freeze_balance || 0);
    sections.scalarFeatures.totalEarned = Number(context.profile?.total_earned || 0);
    sections.scalarFeatures.referralChildrenCount = context.referredProfiles.length;
    sections.scalarFeatures.openCaseCount = context.openCases.length;
    sections.scalarFeatures.recentPredictionScore = Number(latestPredictionScore);
    sections.scalarFeatures.pendingTransactionCount = common.pendingTransactions.length;
    sections.scalarFeatures.approvedTransactionCount = common.approvedTransactions.length;
    sections.scalarFeatures.rejectedTransactionCount = common.rejectedTransactions.length;
    sections.scalarFeatures.transactionCount24h = common.recent24hTransactions.length;
    sections.scalarFeatures.transactionCount72h = common.recent72hTransactions.length;
    sections.scalarFeatures.taskCount24h = common.recent24hTasks.length;
    sections.scalarFeatures.averageTransactionAmount = Number(common.txMean.toFixed(6));
    sections.scalarFeatures.transactionAmountStdDev = Number(common.txStdDev.toFixed(6));
    sections.scalarFeatures.sharedWalletUserCount = context.relatedProfiles.length;
    sections.scalarFeatures.sharedWalletTransactionCount = context.sharedWalletTransactions.length;
    sections.scalarFeatures.sharedProofTransactionCount = context.sharedProofTransactions.length;
    sections.scalarFeatures.profileNegativeBalance = context.profile && context.profile.wallet_balance < 0 ? 1 : 0;
    sections.scalarFeatures.hasPendingBundle = context.profile?.pending_bundle ? 1 : 0;

    sections.graphFeatures.sharedWalletUsers = context.relatedProfiles.length;
    sections.graphFeatures.sharedWalletTransactions = context.sharedWalletTransactions.length;
    sections.graphFeatures.sharedProofTransactions = context.sharedProofTransactions.length;
    sections.graphFeatures.referralChildrenCount = context.referredProfiles.length;
    sections.graphFeatures.openCaseCount = context.openCases.length;
    sections.graphFeatures.graphNeighborhoodScore = clamp(
        normalizeRatio(context.relatedProfiles.length, 4) * 0.45 +
            normalizeRatio(context.sharedProofTransactions.length, 3) * 0.4 +
            normalizeRatio(context.referredProfiles.length, 6) * 0.15
    );

    sections.sequenceFeatures.recentTransactionAmounts = common.txAmounts.slice(0, 10);
    sections.sequenceFeatures.recentTransactionAgesHours = context.recentTransactions
        .slice(0, 10)
        .map((transaction) => Number(hoursSince(transaction.created_at).toFixed(6)));
    sections.sequenceFeatures.recentTaskAgesHours = context.recentTasks
        .slice(0, 10)
        .map((task) => Number(hoursSince(task.created_at).toFixed(6)));

    sections.embeddingFeatures.tabularLatent = [
        clamp(sigmoid((sections.scalarFeatures.walletBalance as number) / 500)),
        clamp(sigmoid((sections.scalarFeatures.averageTransactionAmount as number) / 250)),
        clamp(normalizeRatio(sections.scalarFeatures.transactionCount24h as number, 8)),
        clamp(normalizeRatio(sections.scalarFeatures.rejectedTransactionCount as number, 5)),
        clamp(normalizeRatio(sections.scalarFeatures.pendingTransactionCount as number, 5)),
        clamp(normalizeRatio(sections.scalarFeatures.accountAgeHours as number, 720)),
    ];
    sections.embeddingFeatures.graphLatent = [
        clamp(normalizeRatio(sections.graphFeatures.sharedWalletUsers, 5)),
        clamp(normalizeRatio(sections.graphFeatures.sharedProofTransactions, 3)),
        clamp(normalizeRatio(sections.graphFeatures.referralChildrenCount, 10)),
        clamp(normalizeRatio(sections.graphFeatures.openCaseCount, 4)),
        sections.graphFeatures.graphNeighborhoodScore,
    ];

    if (context.entityType === 'transaction') {
        const tx = context.transaction;
        const amount = Number(tx.amount || 0);
        const amountZScore = common.txStdDev > EPSILON ? Math.abs((amount - common.txMean) / common.txStdDev) : 0;
        const recentApprovedDeposit = context.recentTransactions.find(
            (transaction) => transaction.type === 'deposit' && transaction.status === 'approved'
        );
        const hoursSinceLastApprovedDeposit = recentApprovedDeposit
            ? hoursBetween(recentApprovedDeposit.created_at, tx.created_at)
            : 0;

        sections.scalarFeatures.entityAmount = amount;
        sections.scalarFeatures.entityAmountZScore = Number(amountZScore.toFixed(6));
        sections.scalarFeatures.hoursSinceLastApprovedDeposit = Number(hoursSinceLastApprovedDeposit.toFixed(6));
        sections.scalarFeatures.isWithdrawal = tx.type === 'withdrawal' ? 1 : 0;
        sections.scalarFeatures.isDeposit = tx.type === 'deposit' ? 1 : 0;

        sections.ruleFeatures.walletReuseFlag = context.relatedProfiles.length > 1;
        sections.ruleFeatures.proofReuseFlag = context.sharedProofTransactions.length > 0;
        sections.ruleFeatures.highAmountSpikeFlag = amountZScore >= 2.5;
        sections.ruleFeatures.newAccountHighAmountFlag =
            (sections.scalarFeatures.accountAgeHours as number) < 72 && amount >= Math.max(common.txMean * 2, 300);
        sections.ruleFeatures.rapidWithdrawalAfterDepositFlag =
            tx.type === 'withdrawal' && hoursSinceLastApprovedDeposit > 0 && hoursSinceLastApprovedDeposit < 12;
        sections.ruleFeatures.pendingBurstFlag = common.pendingTransactions.length >= 3;
        sections.ruleFeatures.negativeBalanceFlag = (sections.scalarFeatures.profileNegativeBalance as number) > 0;
        sections.ruleFeatures.bundleDeficitFlag = (sections.scalarFeatures.hasPendingBundle as number) > 0;
        sections.ruleFeatures.withdrawalWalletPresentFlag = Boolean(tx.wallet_address);
        sections.ruleFeatures.network = tx.network || 'unknown';

    } else if (context.entityType === 'profile') {
        sections.ruleFeatures.walletReuseFlag = context.relatedProfiles.length > 1;
        sections.ruleFeatures.referralClusterFlag = context.referredProfiles.length >= 5;
        sections.ruleFeatures.negativeBalanceFlag = (sections.scalarFeatures.profileNegativeBalance as number) > 0;
        sections.ruleFeatures.caseRecurrenceFlag = context.openCases.length >= 2;
        sections.ruleFeatures.pendingBurstFlag = common.pendingTransactions.length >= 3;
    } else {
        const task = context.userTask;
        const completedTasks = context.recentTasks.filter((candidate) => candidate.status === 'completed');

        sections.scalarFeatures.entityEarnedAmount = Number(task.earned_amount || 0);
        sections.scalarFeatures.entityCostAmount = Number(task.cost_amount || 0);
        sections.scalarFeatures.completedTaskCount = completedTasks.length;
        sections.scalarFeatures.bundleTaskFlag = task.is_bundle ? 1 : 0;

        sections.ruleFeatures.bundleTaskFlag = Boolean(task.is_bundle);
        sections.ruleFeatures.highVelocityTaskingFlag = completedTasks.length >= 8 && common.recent24hTasks.length >= 6;
        sections.ruleFeatures.negativeBalanceFlag = (sections.scalarFeatures.profileNegativeBalance as number) > 0;
        sections.ruleFeatures.caseRecurrenceFlag = context.openCases.length >= 2;
    }

    return sections;
}

export function buildRiskGraphEdges(context: RiskContextBundle) {
    const edges = buildBaseEdges(context);

    if (context.entityType === 'transaction') {
        const transaction = context.transaction;

        if (transaction.wallet_address) {
            edges.push({
                leftEntityType: 'transaction',
                leftEntityId: transaction.id.toString(),
                rightEntityType: 'wallet_address',
                rightEntityId: transaction.wallet_address,
                relationType: transaction.type === 'withdrawal' ? 'withdrawal_destination' : 'deposit_destination',
                weight: 1,
                metadata: {
                    network: transaction.network || 'unknown',
                    amount: transaction.amount,
                },
            });
        }

        if (transaction.proof_url) {
            edges.push({
                leftEntityType: 'transaction',
                leftEntityId: transaction.id.toString(),
                rightEntityType: 'proof_asset',
                rightEntityId: transaction.proof_url,
                relationType: 'uses_proof',
                weight: 0.85,
            });
        }
    }

    context.relatedProfiles.forEach((profile) => {
        if (!context.profile || profile.id === context.profile.id) {
            return;
        }

        edges.push({
            leftEntityType: 'profile',
            leftEntityId: context.profile.id,
            rightEntityType: 'profile',
            rightEntityId: profile.id,
            relationType: 'shares_wallet_identifier',
            weight: 0.95,
            metadata: {
                wallet_address: context.profile.withdrawal_wallet_address,
            },
        });
    });

    context.sharedProofTransactions.forEach((transaction) => {
        if (context.entityType === 'transaction' && transaction.id === context.transaction.id) {
            return;
        }

        edges.push({
            leftEntityType: context.entityType,
            leftEntityId: context.entityId,
            rightEntityType: 'transaction',
            rightEntityId: transaction.id.toString(),
            relationType: 'shares_proof_asset',
            weight: 1,
            metadata: {
                user_id: transaction.user_id,
            },
        });
    });

    return edges;
}

export function scoreRiskFeatureSections(context: RiskContextBundle, featureSections: RiskFeatureSections): RiskScoringResult {
    const amountZScore = featureSections.scalarFeatures.entityAmountZScore || 0;
    const pendingTxNorm = normalizeRatio(featureSections.scalarFeatures.pendingTransactionCount || 0, 5);
    const rejectedNorm = normalizeRatio(featureSections.scalarFeatures.rejectedTransactionCount || 0, 4);
    const walletReuseNorm = normalizeRatio(featureSections.graphFeatures.sharedWalletUsers || 0, 4);
    const proofReuseNorm = normalizeRatio(featureSections.graphFeatures.sharedProofTransactions || 0, 2);
    const referralNorm = normalizeRatio(featureSections.graphFeatures.referralChildrenCount || 0, 8);
    const openCaseNorm = normalizeRatio(featureSections.graphFeatures.openCaseCount || 0, 3);
    const negativeBalanceNorm = featureSections.scalarFeatures.profileNegativeBalance || 0;
    const taskVelocityNorm = normalizeRatio(featureSections.scalarFeatures.taskCount24h || 0, 10);

    const rulesScore = clamp(
        (featureSections.ruleFeatures.walletReuseFlag ? 0.26 : 0) +
            (featureSections.ruleFeatures.proofReuseFlag ? 0.28 : 0) +
            (featureSections.ruleFeatures.highAmountSpikeFlag ? 0.12 : 0) +
            (featureSections.ruleFeatures.newAccountHighAmountFlag ? 0.12 : 0) +
            (featureSections.ruleFeatures.rapidWithdrawalAfterDepositFlag ? 0.15 : 0) +
            (featureSections.ruleFeatures.pendingBurstFlag ? 0.09 : 0) +
            (featureSections.ruleFeatures.referralClusterFlag ? 0.11 : 0) +
            (featureSections.ruleFeatures.caseRecurrenceFlag ? 0.08 : 0) +
            (featureSections.ruleFeatures.highVelocityTaskingFlag ? 0.08 : 0)
    );

    const behaviorScore = clamp(sigmoid(amountZScore * 0.9 + pendingTxNorm * 1.4 + rejectedNorm * 1.2 + taskVelocityNorm * 0.8) - 0.5);
    const graphScore = clamp(walletReuseNorm * 0.45 + proofReuseNorm * 0.4 + referralNorm * 0.15 + openCaseNorm * 0.2);
    const accountScore = clamp(
        negativeBalanceNorm * 0.45 +
            normalizeRatio(featureSections.scalarFeatures.hasPendingBundle || 0, 1) * 0.15 +
            normalizeRatio(featureSections.scalarFeatures.recentPredictionScore || 0, 1) * 0.2 +
            normalizeRatio(featureSections.scalarFeatures.accountAgeHours || 0, 24) * -0.15 +
            normalizeRatio(featureSections.scalarFeatures.freezeBalance || 0, 200) * 0.15
    );

    const riskScore = clamp(rulesScore * 0.34 + behaviorScore * 0.24 + graphScore * 0.27 + accountScore * 0.15);
    const severity = severityFromScore(riskScore);
    const recommendedAction = priorityAction(context.entityType, severity, featureSections.ruleFeatures);
    const confidence = clamp(0.58 + Math.abs(riskScore - 0.5) * 0.45 + normalizeRatio(Object.keys(featureSections.ruleFeatures).length, 10) * 0.08);

    const topSignals = sortTopSignals([
        {
            key: 'sharedProofTransactions',
            value: featureSections.graphFeatures.sharedProofTransactions || 0,
            weight: proofReuseNorm * 0.4 + (featureSections.ruleFeatures.proofReuseFlag ? 0.2 : 0),
            section: 'graph',
        },
        {
            key: 'sharedWalletUsers',
            value: featureSections.graphFeatures.sharedWalletUsers || 0,
            weight: walletReuseNorm * 0.45 + (featureSections.ruleFeatures.walletReuseFlag ? 0.18 : 0),
            section: 'graph',
        },
        {
            key: 'entityAmountZScore',
            value: Number(amountZScore.toFixed(4)),
            weight: normalizeRatio(amountZScore, 4) * 0.18,
            section: 'behavior',
        },
        {
            key: 'pendingTransactionCount',
            value: featureSections.scalarFeatures.pendingTransactionCount || 0,
            weight: pendingTxNorm * 0.14,
            section: 'behavior',
        },
        {
            key: 'openCaseCount',
            value: featureSections.graphFeatures.openCaseCount || 0,
            weight: openCaseNorm * 0.12,
            section: 'account',
        },
        {
            key: 'negativeBalanceFlag',
            value: Boolean(featureSections.ruleFeatures.negativeBalanceFlag),
            weight: negativeBalanceNorm * 0.12,
            section: 'account',
        },
    ]);

    return {
        modelFamily: 'fusion',
        modelName: 'captiv8-fallback-fusion',
        modelVersion: '0.1.0',
        ensembleVersion: 'fallback-v1',
        riskScore,
        severity,
        confidence,
        recommendedAction,
        explanation: {
            summary: `${context.entityType} ${context.entityId} scored ${severity.toUpperCase()} (${riskScore.toFixed(3)}) with ${recommendedAction}.`,
            topSignals,
            metadata: {
                featureVersion: FEATURE_VERSION,
            },
        },
        componentScores: {
            rules: Number(rulesScore.toFixed(6)),
            behavior: Number(behaviorScore.toFixed(6)),
            graph: Number(graphScore.toFixed(6)),
            account: Number(accountScore.toFixed(6)),
        },
        ruleSignals: featureSections.ruleFeatures,
        graphSignals: featureSections.graphFeatures,
        featureSections,
    };
}
