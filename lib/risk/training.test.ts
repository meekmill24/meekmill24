import { describe, expect, it } from 'vitest';
import { __riskTrainingInternals } from '@/lib/risk/training';

describe('risk training helpers', () => {
    it('maps analyst labels into binary classes', () => {
        expect(__riskTrainingInternals.mapFeedbackLabelToBinary('clean')).toBe(0);
        expect(__riskTrainingInternals.mapFeedbackLabelToBinary('fraud')).toBe(1);
        expect(__riskTrainingInternals.mapFeedbackLabelToBinary('chargeback')).toBe(1);
        expect(__riskTrainingInternals.mapFeedbackLabelToBinary('policy_violation')).toBe(1);
        expect(__riskTrainingInternals.mapFeedbackLabelToBinary('needs_review')).toBeNull();
    });

    it('sanitizes run keys for local paths and storage prefixes', () => {
        expect(__riskTrainingInternals.sanitizeRunKey('manual run / 2026-03-25')).toBe('manual-run-2026-03-25');
    });

    it('extracts the last valid JSON object from mixed trainer output', () => {
        const parsed = __riskTrainingInternals.extractLastJsonObject(
            ['starting...', '{"status":"ignored"}', 'done', '{"status":"completed","metrics":{"fusion_auc":0.91}}'].join('\n')
        );

        expect(parsed).toEqual({
            status: 'completed',
            metrics: {
                fusion_auc: 0.91,
            },
        });
    });

    it('parses Supabase artifact URIs for runtime sync', () => {
        expect(__riskTrainingInternals.parseSupabaseStorageUri('supabase://risk-artifacts/training-runs/model-a/manifest.json')).toEqual({
            bucket: 'risk-artifacts',
            storagePath: 'training-runs/model-a/manifest.json',
        });
    });

    it('extracts uploaded artifact references from model registry config', () => {
        const artifacts = __riskTrainingInternals.extractUploadedArtifacts({
            id: 7,
            model_family: 'fusion',
            model_name: 'captiv8-neural-fusion',
            version: 'shadow-v7',
            stage: 'shadow',
            config: {
                uploaded_artifacts: {
                    manifest: 'supabase://risk-artifacts/training-runs/model-a/manifest.json',
                    fusion_model: 'supabase://risk-artifacts/training-runs/model-a/fusion_model.pkl',
                },
            },
            artifact_uri: null,
        });

        expect(artifacts).toEqual({
            manifest: 'supabase://risk-artifacts/training-runs/model-a/manifest.json',
            fusion_model: 'supabase://risk-artifacts/training-runs/model-a/fusion_model.pkl',
        });
    });
});
