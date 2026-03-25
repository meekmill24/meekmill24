import type { SupabaseClient } from '@supabase/supabase-js';
import type {
    Profile,
    RiskCase,
    RiskEntityType,
    RiskPrediction,
    RiskSeverity,
    Transaction,
    UserTask,
} from '@/lib/types';
import { buildRiskFeatureSections, buildRiskGraphEdges, scoreRiskFeatureSections } from '@/lib/risk/engine';
import type {
    ProfileRiskContext,
    RiskContextBundle,
    RiskGraphEdgeInput,
    RiskInferenceRequest,
    RiskPersistenceResult,
    RiskScoringResult,
    TransactionRiskContext,
    UserTaskRiskContext,
} from '@/lib/risk/types';

const PYTHON_RISK_TIMEOUT_MS = 5000;

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }

    return String(error || '');
}

function isMissingRelationError(error: unknown, relation: string) {
    const message = getErrorMessage(error);
    return (
        message.includes(`Could not find the table 'public.${relation}' in the schema cache`) ||
        message.includes(`relation "${relation}" does not exist`)
    );
}

function isMissingColumnError(error: unknown, column: string) {
    const message = getErrorMessage(error);
    return (
        message.includes(`Could not find the '${column}' column`) ||
        message.includes(`column "${column}" does not exist`) ||
        message.includes(`.${column} does not exist`) ||
        (message.includes('schema cache') && message.includes(column))
    );
}

function severityToWeight(severity: RiskSeverity) {
    switch (severity) {
        case 'critical':
            return 1;
        case 'high':
            return 0.8;
        case 'medium':
            return 0.5;
        default:
            return 0.2;
    }
}

function riskSeverityFromScore(score: number): RiskSeverity {
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

function deriveRiskHoldActive(severity: RiskSeverity, recommendedAction: string | null | undefined) {
    if (severity === 'critical' || severity === 'high') {
        return true;
    }

    return Boolean(recommendedAction && /(freeze|hold|manual_review_immediately|payout_hold)/.test(recommendedAction));
}

async function fetchProfile(adminClient: SupabaseClient, profileId: string) {
    const { data, error } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (error || !data) {
        throw new Error(error?.message || `Profile ${profileId} not found`);
    }

    return data as Profile;
}

async function fetchUserRiskScaffolding(adminClient: SupabaseClient, userId: string) {
    const now = new Date();
    const lookbackStart = new Date(now);
    lookbackStart.setDate(lookbackStart.getDate() - 30);

    const [transactionsResult, tasksResult, openCasesResult, predictionsResult, referredProfilesResult] = await Promise.all([
        adminClient
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', lookbackStart.toISOString())
            .order('created_at', { ascending: false })
            .limit(100),
        adminClient
            .from('user_tasks')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', lookbackStart.toISOString())
            .order('created_at', { ascending: false })
            .limit(100),
        adminClient
            .from('risk_case_overview')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['open', 'investigating', 'escalated'])
            .order('updated_at', { ascending: false })
            .limit(25),
        adminClient
            .from('risk_predictions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
        adminClient
            .from('profiles')
            .select('*')
            .eq('referred_by', userId)
            .limit(50),
    ]);

    if (transactionsResult.error) {
        throw new Error(transactionsResult.error.message);
    }

    if (openCasesResult.error && !isMissingRelationError(openCasesResult.error, 'risk_case_overview')) {
        throw new Error(openCasesResult.error.message);
    }

    if (predictionsResult.error && !isMissingRelationError(predictionsResult.error, 'risk_predictions')) {
        throw new Error(predictionsResult.error.message);
    }

    if (referredProfilesResult.error && !isMissingColumnError(referredProfilesResult.error, 'referred_by')) {
        throw new Error(referredProfilesResult.error.message);
    }

    const recentTasks =
        tasksResult.error && isMissingRelationError(tasksResult.error, 'user_tasks')
            ? []
            : ((tasksResult.data || []) as UserTask[]);

    if (tasksResult.error && !isMissingRelationError(tasksResult.error, 'user_tasks')) {
        throw new Error(tasksResult.error.message);
    }

    return {
        recentTransactions: (transactionsResult.data || []) as Transaction[],
        recentTasks,
        openCases:
            openCasesResult.error && isMissingRelationError(openCasesResult.error, 'risk_case_overview')
                ? []
                : ((openCasesResult.data || []) as RiskCase[]),
        latestPredictions:
            predictionsResult.error && isMissingRelationError(predictionsResult.error, 'risk_predictions')
                ? []
                : ((predictionsResult.data || []) as RiskPrediction[]),
        referredProfiles:
            referredProfilesResult.error && isMissingColumnError(referredProfilesResult.error, 'referred_by')
                ? []
                : ((referredProfilesResult.data || []) as Profile[]),
    };
}

async function fetchProfilesSharingWallet(adminClient: SupabaseClient, walletAddress?: string | null, excludeUserId?: string | null) {
    if (!walletAddress) {
        return [];
    }

    let query = adminClient
        .from('profiles')
        .select('*')
        .eq('withdrawal_wallet_address', walletAddress)
        .limit(25);

    if (excludeUserId) {
        query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;
    if (error) {
        if (isMissingColumnError(error, 'withdrawal_wallet_address')) {
            return [];
        }

        throw new Error(error.message);
    }
    return (data || []) as Profile[];
}

async function fetchTransactionsSharingField(
    adminClient: SupabaseClient,
    field: 'wallet_address' | 'proof_url',
    value?: string | null,
    excludeUserId?: string | null
) {
    if (!value) {
        return [];
    }

    let query = adminClient.from('transactions').select('*').eq(field, value).limit(25);

    if (excludeUserId) {
        query = query.neq('user_id', excludeUserId);
    }

    const { data, error } = await query;
    if (error) {
        if (isMissingColumnError(error, field)) {
            return [];
        }

        throw new Error(error.message);
    }
    return (data || []) as Transaction[];
}

export async function loadRiskContext(adminClient: SupabaseClient, entityType: RiskEntityType, entityId: string): Promise<RiskContextBundle> {
    if (entityType === 'profile') {
        const profile = await fetchProfile(adminClient, entityId);
        const scaffold = await fetchUserRiskScaffolding(adminClient, entityId);
        const relatedProfiles = await fetchProfilesSharingWallet(adminClient, profile.withdrawal_wallet_address, profile.id);

        return {
            entityType,
            entityId,
            userId: profile.id,
            profile,
            recentTransactions: scaffold.recentTransactions,
            recentTasks: scaffold.recentTasks,
            relatedProfiles,
            sharedWalletTransactions: [],
            sharedProofTransactions: [],
            openCases: scaffold.openCases,
            latestPredictions: scaffold.latestPredictions,
            referredProfiles: scaffold.referredProfiles,
        } satisfies ProfileRiskContext;
    }

    if (entityType === 'transaction') {
        const { data: transaction, error } = await adminClient
            .from('transactions')
            .select('*')
            .eq('id', entityId)
            .single();

        if (error || !transaction) {
            throw new Error(error?.message || `Transaction ${entityId} not found`);
        }

        const profile = await fetchProfile(adminClient, transaction.user_id);
        const scaffold = await fetchUserRiskScaffolding(adminClient, transaction.user_id);
        const [relatedProfiles, sharedWalletTransactions, sharedProofTransactions] = await Promise.all([
            fetchProfilesSharingWallet(adminClient, transaction.wallet_address || profile.withdrawal_wallet_address, profile.id),
            fetchTransactionsSharingField(adminClient, 'wallet_address', transaction.wallet_address, profile.id),
            fetchTransactionsSharingField(adminClient, 'proof_url', transaction.proof_url, profile.id),
        ]);

        return {
            entityType,
            entityId,
            userId: transaction.user_id,
            profile,
            transaction,
            recentTransactions: scaffold.recentTransactions,
            recentTasks: scaffold.recentTasks,
            relatedProfiles,
            sharedWalletTransactions,
            sharedProofTransactions,
            openCases: scaffold.openCases,
            latestPredictions: scaffold.latestPredictions,
            referredProfiles: scaffold.referredProfiles,
        } satisfies TransactionRiskContext;
    }

    const { data: userTask, error } = await adminClient
        .from('user_tasks')
        .select('*')
        .eq('id', entityId)
        .single();

    if (error && isMissingRelationError(error, 'user_tasks')) {
        throw new Error('user_tasks table is not available in this Supabase schema');
    }

    if (error || !userTask) {
        throw new Error(error?.message || `User task ${entityId} not found`);
    }

    const profile = await fetchProfile(adminClient, userTask.user_id);
    const scaffold = await fetchUserRiskScaffolding(adminClient, userTask.user_id);
    const relatedProfiles = await fetchProfilesSharingWallet(adminClient, profile.withdrawal_wallet_address, profile.id);

    return {
        entityType,
        entityId,
        userId: userTask.user_id,
        profile,
        userTask,
        recentTransactions: scaffold.recentTransactions,
        recentTasks: scaffold.recentTasks,
        relatedProfiles,
        sharedWalletTransactions: [],
        sharedProofTransactions: [],
        openCases: scaffold.openCases,
        latestPredictions: scaffold.latestPredictions,
        referredProfiles: scaffold.referredProfiles,
    } satisfies UserTaskRiskContext;
}

async function callPythonRiskService(request: RiskInferenceRequest) {
    const baseUrl = process.env.AI_RISK_SERVICE_URL;
    if (!baseUrl) {
        return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PYTHON_RISK_TIMEOUT_MS);

    try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Risk service returned ${response.status}`);
        }

        return (await response.json()) as Partial<RiskScoringResult>;
    } finally {
        clearTimeout(timeout);
    }
}

function mergeScoringResult(
    fallback: RiskScoringResult,
    external: Partial<RiskScoringResult> | null
): RiskScoringResult {
    if (!external) {
        return fallback;
    }

    return {
        ...fallback,
        ...external,
        explanation: {
            ...fallback.explanation,
            ...(external.explanation || {}),
            topSignals: external.explanation?.topSignals || fallback.explanation.topSignals,
        },
        componentScores: {
            ...fallback.componentScores,
            ...(external.componentScores || {}),
        },
        ruleSignals: {
            ...fallback.ruleSignals,
            ...(external.ruleSignals || {}),
        },
        graphSignals: {
            ...fallback.graphSignals,
            ...(external.graphSignals || {}),
        },
        featureSections: external.featureSections || fallback.featureSections,
    };
}

async function upsertGraphEdges(adminClient: SupabaseClient, edges: RiskGraphEdgeInput[]) {
    if (edges.length === 0) {
        return;
    }

    const rows = edges.map((edge) => ({
        left_entity_type: edge.leftEntityType,
        left_entity_id: edge.leftEntityId,
        right_entity_type: edge.rightEntityType,
        right_entity_id: edge.rightEntityId,
        relation_type: edge.relationType,
        weight: edge.weight,
        metadata: edge.metadata || {},
        last_seen_at: new Date().toISOString(),
        first_seen_at: new Date().toISOString(),
    }));

    await adminClient.from('risk_graph_edges').upsert(rows, {
        onConflict: 'left_entity_type,left_entity_id,right_entity_type,right_entity_id,relation_type',
    });
}

async function persistRiskArtifacts(
    adminClient: SupabaseClient,
    context: RiskContextBundle,
    result: RiskScoringResult,
    sourceEventId?: number | null
): Promise<RiskPersistenceResult> {
    const { data: snapshot, error: snapshotError } = await adminClient
        .from('risk_feature_snapshots')
        .insert({
            entity_type: context.entityType,
            entity_id: context.entityId,
            user_id: context.userId,
            feature_version: 'v1',
            scalar_features: result.featureSections.scalarFeatures,
            rule_features: result.featureSections.ruleFeatures,
            graph_features: result.featureSections.graphFeatures,
            sequence_features: result.featureSections.sequenceFeatures,
            embedding_features: result.featureSections.embeddingFeatures,
            labels: result.featureSections.labels || {},
            source_event_id: sourceEventId || null,
        })
        .select('id')
        .single();

    if (snapshotError || !snapshot) {
        throw new Error(snapshotError?.message || 'Failed to create risk feature snapshot');
    }

    await upsertGraphEdges(adminClient, buildRiskGraphEdges(context));

    const { data: prediction, error: predictionError } = await adminClient
        .from('risk_predictions')
        .insert({
            entity_type: context.entityType,
            entity_id: context.entityId,
            user_id: context.userId,
            feature_snapshot_id: snapshot.id,
            model_family: result.modelFamily,
            model_name: result.modelName,
            model_version: result.modelVersion,
            ensemble_version: result.ensembleVersion || null,
            risk_score: result.riskScore,
            severity: result.severity,
            confidence: result.confidence,
            recommended_action: result.recommendedAction,
            explanation: result.explanation,
            component_scores: result.componentScores,
            rule_signals: result.ruleSignals,
            graph_signals: result.graphSignals,
        })
        .select('id')
        .single();

    if (predictionError || !prediction) {
        throw new Error(predictionError?.message || 'Failed to persist risk prediction');
    }

    let caseId: string | null = null;
    const shouldOpenCase = result.riskScore >= 0.4;

    if (shouldOpenCase) {
        const { data: existingCase } = await adminClient
            .from('risk_cases')
            .select('id, status')
            .eq('entity_type', context.entityType)
            .eq('entity_id', context.entityId)
            .in('status', ['open', 'investigating', 'escalated'])
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const payload = {
            user_id: context.userId,
            latest_prediction_id: prediction.id,
            priority: result.severity,
            current_risk_score: result.riskScore,
            title: `${context.entityType.toUpperCase()} ${context.entityId} flagged for ${result.recommendedAction.replace(/_/g, ' ')}`,
            summary: result.explanation.summary,
            recommended_action: result.recommendedAction,
        };

        if (existingCase?.id) {
            const { data: updatedCase } = await adminClient
                .from('risk_cases')
                .update(payload)
                .eq('id', existingCase.id)
                .select('id')
                .single();
            caseId = updatedCase?.id || existingCase.id;
        } else {
            const { data: createdCase } = await adminClient
                .from('risk_cases')
                .insert({
                    entity_type: context.entityType,
                    entity_id: context.entityId,
                    status: 'open',
                    ...payload,
                })
                .select('id')
                .single();
            caseId = createdCase?.id || null;
        }
    }

    if (context.entityType === 'transaction') {
        await adminClient
            .from('transactions')
            .update({
                risk_score: result.riskScore,
                risk_segment: result.severity,
                risk_recommended_action: result.recommendedAction,
                risk_last_scored_at: new Date().toISOString(),
                risk_case_id: caseId,
            })
            .eq('id', context.entityId);
    }

    return {
        snapshotId: snapshot.id,
        predictionId: prediction.id,
        caseId,
    };
}

async function syncProfileRiskProjection(
    adminClient: SupabaseClient,
    userId: string,
    currentResult: RiskScoringResult,
    caseId?: string | null
) {
    const [openCasesResult, predictionsResult] = await Promise.all([
        adminClient
            .from('risk_cases')
            .select('id, priority, current_risk_score, recommended_action')
            .eq('user_id', userId)
            .in('status', ['open', 'investigating', 'escalated'])
            .order('updated_at', { ascending: false })
            .limit(10),
        adminClient
            .from('risk_predictions')
            .select('risk_score, severity, recommended_action')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    const openCases = (openCasesResult.data || []) as Array<{
        id: string;
        priority: RiskSeverity;
        current_risk_score: number;
        recommended_action?: string | null;
    }>;
    const predictions = (predictionsResult.data || []) as Array<{
        risk_score: number;
        severity: RiskSeverity;
        recommended_action?: string | null;
    }>;

    let dominantScore = Number(currentResult.riskScore || 0);
    let dominantSeverity = currentResult.severity;
    let dominantAction = currentResult.recommendedAction;
    let dominantCaseId = caseId || null;

    for (const openCase of openCases) {
        const caseScore = Number(openCase.current_risk_score || 0);
        const caseSeverity = openCase.priority || riskSeverityFromScore(caseScore);
        if (caseScore > dominantScore || severityToWeight(caseSeverity) > severityToWeight(dominantSeverity)) {
            dominantScore = caseScore;
            dominantSeverity = caseSeverity;
            dominantAction = openCase.recommended_action || dominantAction;
            dominantCaseId = openCase.id;
        }
    }

    for (const prediction of predictions) {
        const predictionScore = Number(prediction.risk_score || 0);
        const predictionSeverity = prediction.severity || riskSeverityFromScore(predictionScore);
        if (predictionScore > dominantScore || severityToWeight(predictionSeverity) > severityToWeight(dominantSeverity)) {
            dominantScore = predictionScore;
            dominantSeverity = predictionSeverity;
            dominantAction = prediction.recommended_action || dominantAction;
        }
    }

    const reviewPriority = Number(
        Math.min(
            1,
            dominantScore * 0.8 +
                openCases.length * 0.08 +
                (deriveRiskHoldActive(dominantSeverity, dominantAction) ? 0.08 : 0)
        ).toFixed(6)
    );

    await adminClient
        .from('profiles')
        .update({
            risk_score: dominantScore,
            risk_segment: dominantSeverity,
            risk_review_priority: reviewPriority,
            risk_recommended_action: dominantAction,
            risk_last_scored_at: new Date().toISOString(),
            risk_case_id: dominantCaseId,
            risk_hold_active: deriveRiskHoldActive(dominantSeverity, dominantAction),
        })
        .eq('id', userId);
}

export async function scoreAndPersistEntity(
    adminClient: SupabaseClient,
    entityType: RiskEntityType,
    entityId: string,
    sourceEventId?: number | null
) {
    const context = await loadRiskContext(adminClient, entityType, entityId);
    if (!context.userId) {
        throw new Error(`Risk context for ${entityType}:${entityId} is missing userId`);
    }
    const featureSections = buildRiskFeatureSections(context);
    const fallback = scoreRiskFeatureSections(context, featureSections);
    const external = await callPythonRiskService({
        entityType,
        entityId,
        userId: context.userId,
        featureSections,
        metadata: {
            sourceEventId: sourceEventId || null,
            relatedProfileCount: context.relatedProfiles.length,
            openCaseCount: context.openCases.length,
        },
    });
    const result = mergeScoringResult(fallback, external);
    const persistence = await persistRiskArtifacts(adminClient, context, result, sourceEventId);
    await syncProfileRiskProjection(adminClient, context.userId, result, persistence.caseId);

    return {
        context,
        result,
        persistence,
    };
}

export async function processPendingRiskEvents(adminClient: SupabaseClient, limit = 20) {
    const { data: events, error } = await adminClient
        .from('risk_events')
        .select('*')
        .eq('processing_status', 'pending')
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) {
        throw new Error(error.message);
    }

    const processed: Array<Record<string, unknown>> = [];

    for (const event of events || []) {
        await adminClient
            .from('risk_events')
            .update({
                processing_status: 'processing',
            })
            .eq('id', event.id);

        try {
            const scoreResult = await scoreAndPersistEntity(
                adminClient,
                event.entity_type as RiskEntityType,
                String(event.entity_id),
                event.id
            );

            await adminClient
                .from('risk_events')
                .update({
                    processing_status: 'processed',
                    processed_at: new Date().toISOString(),
                    error_message: null,
                })
                .eq('id', event.id);

            processed.push({
                eventId: event.id,
                entityType: event.entity_type,
                entityId: event.entity_id,
                predictionId: scoreResult.persistence.predictionId,
                caseId: scoreResult.persistence.caseId,
                riskScore: scoreResult.result.riskScore,
                severity: scoreResult.result.severity,
            });
        } catch (processingError: any) {
            await adminClient
                .from('risk_events')
                .update({
                    processing_status: 'failed',
                    processed_at: new Date().toISOString(),
                    error_message: processingError?.message || 'Unknown processing error',
                })
                .eq('id', event.id);

            processed.push({
                eventId: event.id,
                entityType: event.entity_type,
                entityId: event.entity_id,
                error: processingError?.message || 'Unknown processing error',
            });
        }
    }

    return processed;
}
