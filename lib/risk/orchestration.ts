import type { SupabaseClient } from '@supabase/supabase-js';
import { activateRiskModel, getRiskRuntimeStatus, processQueuedTrainingRuns, promoteRiskModel } from '@/lib/risk/training';
import type { ProcessTrainingRunResult } from '@/lib/risk/training';

const AUTOMATION_CONFIG_KEY = 'automation_config';
const SUPPORTED_FEEDBACK_LABELS = ['clean', 'fraud', 'chargeback', 'policy_violation'] as const;

export interface RiskAutomationConfig {
    minFeedbackSamplesForTraining: number;
    minHoursBetweenTrainingRuns: number;
    datasetLimit: number;
    maxEventBatchSize: number;
    maxEventBatchesPerCycle: number;
    maxTrainingRunsPerCycle: number;
    autoPromoteMinValidationAuc: number;
    autoPromoteValidationAucDelta: number;
}

export interface RiskAutomationCycleOptions {
    eventBatchSize?: number;
    maxEventBatches?: number;
    maxTrainingRuns?: number;
    forceQueueTraining?: boolean;
}

export interface TrainingQueueDecision {
    shouldQueue: boolean;
    reason: string;
    totalEligibleFeedbackCount: number;
    freshEligibleFeedbackCount: number;
    queuedOrRunningCount: number;
    hoursSinceLastCompletedRun: number | null;
}

export interface ShadowPromotionDecision {
    shouldPromote: boolean;
    reason: string;
    candidateValidationAuc: number | null;
    championValidationAuc: number | null;
}

export interface RiskAutomationCycleResult {
    config: RiskAutomationConfig;
    eventBatchesProcessed: number;
    eventsProcessed: number;
    eventBatchResults: Array<Record<string, unknown>>;
    trainingQueueDecision: TrainingQueueDecision;
    queuedTrainingRun: Record<string, unknown> | null;
    trainingResults: ProcessTrainingRunResult[];
    promotions: Array<Record<string, unknown>>;
    runtime: Awaited<ReturnType<typeof getRiskRuntimeStatus>>;
}

const DEFAULT_AUTOMATION_CONFIG: RiskAutomationConfig = {
    minFeedbackSamplesForTraining: Number(process.env.AI_RISK_MIN_FEEDBACK_SAMPLES || 24),
    minHoursBetweenTrainingRuns: Number(process.env.AI_RISK_MIN_HOURS_BETWEEN_TRAINING || 12),
    datasetLimit: Number(process.env.AI_RISK_AUTOMATION_DATASET_LIMIT || 500),
    maxEventBatchSize: Number(process.env.AI_RISK_MAX_EVENT_BATCH_SIZE || 25),
    maxEventBatchesPerCycle: Number(process.env.AI_RISK_MAX_EVENT_BATCHES || 4),
    maxTrainingRunsPerCycle: Number(process.env.AI_RISK_MAX_TRAINING_RUNS || 1),
    autoPromoteMinValidationAuc: Number(process.env.AI_RISK_MIN_VALIDATION_AUC || 0.78),
    autoPromoteValidationAucDelta: Number(process.env.AI_RISK_MIN_VALIDATION_AUC_DELTA || 0.015),
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function toNumber(value: unknown, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAutomationConfig(value?: Record<string, unknown> | null): RiskAutomationConfig {
    const source = value || {};
    return {
        minFeedbackSamplesForTraining: Math.max(4, Math.floor(toNumber(source.minFeedbackSamplesForTraining, DEFAULT_AUTOMATION_CONFIG.minFeedbackSamplesForTraining))),
        minHoursBetweenTrainingRuns: Math.max(0, toNumber(source.minHoursBetweenTrainingRuns, DEFAULT_AUTOMATION_CONFIG.minHoursBetweenTrainingRuns)),
        datasetLimit: Math.max(25, Math.floor(toNumber(source.datasetLimit, DEFAULT_AUTOMATION_CONFIG.datasetLimit))),
        maxEventBatchSize: Math.max(1, Math.floor(toNumber(source.maxEventBatchSize, DEFAULT_AUTOMATION_CONFIG.maxEventBatchSize))),
        maxEventBatchesPerCycle: Math.max(1, Math.floor(toNumber(source.maxEventBatchesPerCycle, DEFAULT_AUTOMATION_CONFIG.maxEventBatchesPerCycle))),
        maxTrainingRunsPerCycle: Math.max(1, Math.floor(toNumber(source.maxTrainingRunsPerCycle, DEFAULT_AUTOMATION_CONFIG.maxTrainingRunsPerCycle))),
        autoPromoteMinValidationAuc: Math.max(0, Math.min(1, toNumber(source.autoPromoteMinValidationAuc, DEFAULT_AUTOMATION_CONFIG.autoPromoteMinValidationAuc))),
        autoPromoteValidationAucDelta: Math.max(0, Math.min(1, toNumber(source.autoPromoteValidationAucDelta, DEFAULT_AUTOMATION_CONFIG.autoPromoteValidationAucDelta))),
    };
}

function isMissingRelationError(error: unknown, relation: string) {
    const message = error instanceof Error ? error.message : String(error || '');
    return message.includes(relation) || message.includes(`relation "${relation}" does not exist`);
}

async function readAutomationConfig(adminClient: SupabaseClient) {
    try {
        const { data, error } = await adminClient
            .from('risk_system_settings')
            .select('value')
            .eq('key', AUTOMATION_CONFIG_KEY)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return normalizeAutomationConfig(isRecord(data?.value) ? data.value : null);
    } catch (error) {
        if (isMissingRelationError(error, 'risk_system_settings')) {
            return DEFAULT_AUTOMATION_CONFIG;
        }

        throw error;
    }
}

async function createOperationRun(adminClient: SupabaseClient, operationType: string, metadata: Record<string, unknown>) {
    try {
        const { data, error } = await adminClient
            .from('risk_operation_runs')
            .insert({
                operation_type: operationType,
                status: 'running',
                metadata,
                started_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (error) {
            throw error;
        }

        return data?.id ?? null;
    } catch (error) {
        if (isMissingRelationError(error, 'risk_operation_runs')) {
            return null;
        }

        throw error;
    }
}

async function completeOperationRun(
    adminClient: SupabaseClient,
    runId: number | null,
    status: 'completed' | 'failed',
    metadata: Record<string, unknown>
) {
    if (!runId) {
        return;
    }

    try {
        await adminClient
            .from('risk_operation_runs')
            .update({
                status,
                metadata,
                completed_at: new Date().toISOString(),
            })
            .eq('id', runId);
    } catch (error) {
        if (isMissingRelationError(error, 'risk_operation_runs')) {
            return;
        }

        throw error;
    }
}

function getMetricValue(metrics: Record<string, unknown> | null | undefined) {
    if (!metrics) {
        return null;
    }

    for (const key of ['fusion_validation_auc', 'validation_auc', 'fusion_auc']) {
        const parsed = Number(metrics[key]);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

export function decideTrainingQueue(state: {
    totalEligibleFeedbackCount: number;
    freshEligibleFeedbackCount: number;
    queuedOrRunningCount: number;
    hoursSinceLastCompletedRun: number | null;
}, config: RiskAutomationConfig): TrainingQueueDecision {
    if (state.queuedOrRunningCount > 0) {
        return {
            shouldQueue: false,
            reason: 'queued_or_running_exists',
            ...state,
        };
    }

    if (state.totalEligibleFeedbackCount < config.minFeedbackSamplesForTraining) {
        return {
            shouldQueue: false,
            reason: 'insufficient_total_feedback',
            ...state,
        };
    }

    if (state.hoursSinceLastCompletedRun === null) {
        return {
            shouldQueue: true,
            reason: 'bootstrap_training',
            ...state,
        };
    }

    if (
        state.hoursSinceLastCompletedRun < config.minHoursBetweenTrainingRuns &&
        state.freshEligibleFeedbackCount < config.minFeedbackSamplesForTraining
    ) {
        return {
            shouldQueue: false,
            reason: 'cooldown_window_active',
            ...state,
        };
    }

    if (state.freshEligibleFeedbackCount >= config.minFeedbackSamplesForTraining) {
        return {
            shouldQueue: true,
            reason: 'fresh_feedback_threshold_met',
            ...state,
        };
    }

    return {
        shouldQueue: false,
        reason: 'insufficient_fresh_feedback',
        ...state,
    };
}

export function decideShadowPromotion(state: {
    candidateValidationAuc: number | null;
    championValidationAuc: number | null;
}, config: RiskAutomationConfig): ShadowPromotionDecision {
    if (state.candidateValidationAuc === null) {
        return {
            shouldPromote: false,
            reason: 'candidate_validation_auc_missing',
            ...state,
        };
    }

    if (state.candidateValidationAuc < config.autoPromoteMinValidationAuc) {
        return {
            shouldPromote: false,
            reason: 'candidate_validation_auc_below_floor',
            ...state,
        };
    }

    if (state.championValidationAuc === null) {
        return {
            shouldPromote: true,
            reason: 'no_champion_validation_auc',
            ...state,
        };
    }

    if (state.candidateValidationAuc >= state.championValidationAuc + config.autoPromoteValidationAucDelta) {
        return {
            shouldPromote: true,
            reason: 'candidate_outperformed_champion',
            ...state,
        };
    }

    return {
        shouldPromote: false,
        reason: 'candidate_delta_below_threshold',
        ...state,
    };
}

async function loadTrainingQueueState(adminClient: SupabaseClient) {
    const [queuedResult, latestCompletedResult, totalFeedbackResult] = await Promise.all([
        adminClient
            .from('risk_training_runs')
            .select('*', { count: 'exact', head: true })
            .in('status', ['queued', 'running']),
        adminClient
            .from('risk_training_runs')
            .select('completed_at, created_at, data_window_end')
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        adminClient
            .from('risk_feedback')
            .select('*', { count: 'exact', head: true })
            .in('label', [...SUPPORTED_FEEDBACK_LABELS]),
    ]);

    const latestCompletedAt = latestCompletedResult.data?.completed_at || latestCompletedResult.data?.created_at || null;
    const baselineTimestamp = latestCompletedResult.data?.data_window_end || latestCompletedAt;

    let freshEligibleFeedbackCount = totalFeedbackResult.count || 0;
    if (baselineTimestamp) {
        const { count, error } = await adminClient
            .from('risk_feedback')
            .select('*', { count: 'exact', head: true })
            .in('label', [...SUPPORTED_FEEDBACK_LABELS])
            .gt('created_at', baselineTimestamp);

        if (error) {
            throw error;
        }

        freshEligibleFeedbackCount = count || 0;
    }

    const hoursSinceLastCompletedRun = latestCompletedAt
        ? (Date.now() - new Date(latestCompletedAt).getTime()) / (1000 * 60 * 60)
        : null;

    return {
        totalEligibleFeedbackCount: totalFeedbackResult.count || 0,
        freshEligibleFeedbackCount,
        queuedOrRunningCount: queuedResult.count || 0,
        hoursSinceLastCompletedRun,
    };
}

async function queueAutomatedTrainingRun(
    adminClient: SupabaseClient,
    config: RiskAutomationConfig,
    decision: TrainingQueueDecision
) {
    const runKey = `auto-${Date.now()}`;
    const { data, error } = await adminClient
        .from('risk_training_runs')
        .insert({
            run_key: runKey,
            status: 'queued',
            notes: {
                requested_by: 'automation',
                requested_at: new Date().toISOString(),
                datasetLimit: config.datasetLimit,
                queue_decision: decision.reason,
                automation_config: config,
            },
        })
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function maybeQueueAutomatedTrainingRun(
    adminClient: SupabaseClient,
    config: RiskAutomationConfig,
    forceQueueTraining = false
) {
    const state = await loadTrainingQueueState(adminClient);
    const decision = decideTrainingQueue(state, config);

    if (!forceQueueTraining && !decision.shouldQueue) {
        return {
            decision,
            trainingRun: null,
        };
    }

    const trainingRun = await queueAutomatedTrainingRun(adminClient, config, {
        ...decision,
        shouldQueue: true,
        reason: forceQueueTraining ? 'forced_queue' : decision.reason,
    });

    return {
        decision: {
            ...decision,
            shouldQueue: true,
            reason: forceQueueTraining ? 'forced_queue' : decision.reason,
        },
        trainingRun,
    };
}

async function maybePromoteQualifiedModel(
    adminClient: SupabaseClient,
    modelRegistryId: number,
    config: RiskAutomationConfig
) {
    const [{ data: candidate, error: candidateError }, { data: champion, error: championError }] = await Promise.all([
        adminClient.from('risk_model_registry').select('*').eq('id', modelRegistryId).single(),
        adminClient
            .from('risk_model_registry')
            .select('*')
            .eq('stage', 'champion')
            .neq('id', modelRegistryId)
            .order('promoted_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    if (candidateError || !candidate) {
        throw new Error(candidateError?.message || `Risk model ${modelRegistryId} not found`);
    }

    if (championError) {
        throw championError;
    }

    if (candidate.stage === 'champion') {
        return {
            promoted: false,
            reason: 'candidate_already_champion',
            candidateId: candidate.id,
            activation: null,
        };
    }

    const decision = decideShadowPromotion(
        {
            candidateValidationAuc: getMetricValue(isRecord(candidate.metrics) ? candidate.metrics : null),
            championValidationAuc: getMetricValue(isRecord(champion?.metrics) ? champion.metrics : null),
        },
        config
    );

    if (!decision.shouldPromote) {
        return {
            promoted: false,
            candidateId: candidate.id,
            activation: null,
            ...decision,
        };
    }

    const promotedModel = await promoteRiskModel(adminClient, candidate.id);
    const activation = await activateRiskModel(adminClient, candidate.id);

    return {
        promoted: true,
        candidateId: candidate.id,
        promotedModel,
        activation,
        ...decision,
    };
}

export async function runRiskAutomationCycle(
    adminClient: SupabaseClient,
    options: RiskAutomationCycleOptions = {}
): Promise<RiskAutomationCycleResult> {
    const baseConfig = await readAutomationConfig(adminClient);
    const config: RiskAutomationConfig = {
        ...baseConfig,
        maxEventBatchSize: options.eventBatchSize ? Math.max(1, Math.floor(options.eventBatchSize)) : baseConfig.maxEventBatchSize,
        maxEventBatchesPerCycle: options.maxEventBatches ? Math.max(1, Math.floor(options.maxEventBatches)) : baseConfig.maxEventBatchesPerCycle,
        maxTrainingRunsPerCycle: options.maxTrainingRuns ? Math.max(1, Math.floor(options.maxTrainingRuns)) : baseConfig.maxTrainingRunsPerCycle,
    };

    const operationRunId = await createOperationRun(adminClient, 'automation_cycle', {
        config,
        options,
    });

    try {
        const { processPendingRiskEvents } = await import('@/lib/risk/runtime');

        const eventBatchResults: Array<Record<string, unknown>> = [];
        let eventsProcessed = 0;
        let eventBatchesProcessed = 0;

        for (let index = 0; index < config.maxEventBatchesPerCycle; index += 1) {
            const processed = await processPendingRiskEvents(adminClient, config.maxEventBatchSize);
            eventBatchResults.push({
                batchNumber: index + 1,
                processed,
                count: processed.length,
            });
            eventsProcessed += processed.length;
            eventBatchesProcessed += 1;

            if (processed.length < config.maxEventBatchSize) {
                break;
            }
        }

        const queueResult = await maybeQueueAutomatedTrainingRun(
            adminClient,
            config,
            Boolean(options.forceQueueTraining)
        );
        const trainingResults = await processQueuedTrainingRuns(adminClient, config.maxTrainingRunsPerCycle);

        const promotions: Array<Record<string, unknown>> = [];
        for (const result of trainingResults) {
            if (result.status !== 'completed' || !result.modelRegistryId) {
                continue;
            }

            const promotion = await maybePromoteQualifiedModel(adminClient, result.modelRegistryId, config);
            promotions.push(promotion);
        }

        const runtime = await getRiskRuntimeStatus(adminClient);
        const finalResult: RiskAutomationCycleResult = {
            config,
            eventBatchesProcessed,
            eventsProcessed,
            eventBatchResults,
            trainingQueueDecision: queueResult.decision,
            queuedTrainingRun: queueResult.trainingRun,
            trainingResults,
            promotions,
            runtime,
        };

        await completeOperationRun(adminClient, operationRunId, 'completed', finalResult as unknown as Record<string, unknown>);
        return finalResult;
    } catch (error: any) {
        await completeOperationRun(adminClient, operationRunId, 'failed', {
            error: error?.message || 'Unknown automation cycle error',
            config,
            options,
        });
        throw error;
    }
}

export const __riskOrchestrationInternals = {
    decideTrainingQueue,
    decideShadowPromotion,
    normalizeAutomationConfig,
};
