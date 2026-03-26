import { describe, expect, it } from 'vitest';
import { __riskOrchestrationInternals } from '@/lib/risk/orchestration';

const config = __riskOrchestrationInternals.normalizeAutomationConfig({
    minFeedbackSamplesForTraining: 24,
    minHoursBetweenTrainingRuns: 12,
    datasetLimit: 500,
    maxEventBatchSize: 25,
    maxEventBatchesPerCycle: 4,
    maxTrainingRunsPerCycle: 1,
    autoPromoteMinValidationAuc: 0.78,
    autoPromoteValidationAucDelta: 0.015,
});

describe('risk automation queue decision', () => {
    it('queues bootstrap training when enough feedback exists and no prior run is present', () => {
        expect(
            __riskOrchestrationInternals.decideTrainingQueue(
                {
                    totalEligibleFeedbackCount: 28,
                    freshEligibleFeedbackCount: 28,
                    queuedOrRunningCount: 0,
                    hoursSinceLastCompletedRun: null,
                },
                config
            )
        ).toMatchObject({
            shouldQueue: true,
            reason: 'bootstrap_training',
        });
    });

    it('skips queueing while a queued or running training job already exists', () => {
        expect(
            __riskOrchestrationInternals.decideTrainingQueue(
                {
                    totalEligibleFeedbackCount: 40,
                    freshEligibleFeedbackCount: 40,
                    queuedOrRunningCount: 1,
                    hoursSinceLastCompletedRun: 18,
                },
                config
            )
        ).toMatchObject({
            shouldQueue: false,
            reason: 'queued_or_running_exists',
        });
    });

    it('respects the cooldown window unless enough fresh feedback has accumulated', () => {
        expect(
            __riskOrchestrationInternals.decideTrainingQueue(
                {
                    totalEligibleFeedbackCount: 100,
                    freshEligibleFeedbackCount: 12,
                    queuedOrRunningCount: 0,
                    hoursSinceLastCompletedRun: 4,
                },
                config
            )
        ).toMatchObject({
            shouldQueue: false,
            reason: 'cooldown_window_active',
        });
    });
});

describe('risk automation promotion decision', () => {
    it('promotes a shadow model when it clears the validation floor and beats the champion by the configured margin', () => {
        expect(
            __riskOrchestrationInternals.decideShadowPromotion(
                {
                    candidateValidationAuc: 0.84,
                    championValidationAuc: 0.80,
                },
                config
            )
        ).toMatchObject({
            shouldPromote: true,
            reason: 'candidate_outperformed_champion',
        });
    });

    it('keeps the challenger in shadow when the delta is too small', () => {
        expect(
            __riskOrchestrationInternals.decideShadowPromotion(
                {
                    candidateValidationAuc: 0.807,
                    championValidationAuc: 0.80,
                },
                config
            )
        ).toMatchObject({
            shouldPromote: false,
            reason: 'candidate_delta_below_threshold',
        });
    });
});
