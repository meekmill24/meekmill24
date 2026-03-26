import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RiskFeatureSnapshot } from '@/lib/types';

const DEFAULT_ARTIFACT_BUCKET = process.env.AI_RISK_STORAGE_BUCKET || 'risk-artifacts';
const TRAINING_ROOT = path.join(process.cwd(), 'tmp', 'risk-artifacts');
const TRAINING_CWD = path.join(process.cwd(), 'ml');
const TRAINING_MIN_ROWS = Number(process.env.AI_RISK_MIN_TRAINING_ROWS || 12);
const RUNTIME_ROOT = path.join(process.cwd(), 'tmp', 'risk-runtime');

type RiskModelRegistryRow = {
    id: number;
    model_family: string;
    model_name: string;
    version: string;
    stage: 'candidate' | 'shadow' | 'champion' | 'archived';
    metrics?: Record<string, unknown> | null;
    config?: Record<string, unknown> | null;
    artifact_uri?: string | null;
    promoted_at?: string | null;
    created_at?: string;
};

type SupportedFeedbackLabel = 'clean' | 'fraud' | 'chargeback' | 'policy_violation' | 'needs_review';

interface FeedbackRow {
    id: number;
    label: SupportedFeedbackLabel;
    prediction_id?: number | null;
    case_id?: string | null;
    created_at: string;
}

interface PredictionRow {
    id: number;
    feature_snapshot_id?: number | null;
    entity_type: string;
    entity_id: string;
    model_name: string;
    model_version: string;
    risk_score: number;
    severity: string;
}

interface TrainingExampleRow {
    featureSections: {
        scalarFeatures: Record<string, number>;
        ruleFeatures: Record<string, unknown>;
        graphFeatures: Record<string, number>;
        sequenceFeatures: Record<string, number[]>;
        embeddingFeatures: Record<string, number[]>;
        labels: Record<string, unknown>;
    };
    label: number;
    metadata: Record<string, unknown>;
}

export interface ProcessTrainingRunResult {
    runId: number;
    runKey: string;
    status: 'completed' | 'failed';
    rowCount: number;
    modelRegistryId?: number;
    artifactUri?: string | null;
    metrics?: Record<string, unknown>;
    activation?: RiskRuntimeSyncResult;
    error?: string;
}

export interface RiskRuntimeStatus {
    runtimeModelDir: string;
    activationManifest: Record<string, unknown> | null;
    serviceConfigured: boolean;
    serviceReachable: boolean;
    serviceStatus: Record<string, unknown> | null;
    championModel: RiskModelRegistryRow | null;
}

export interface RiskRuntimeSyncResult {
    modelId: number;
    modelVersion: string;
    runtimeModelDir: string;
    syncedArtifacts: Record<string, string>;
    activationManifestPath: string;
    serviceConfigured: boolean;
    serviceReachable: boolean;
    serviceReloaded: boolean;
    serviceStatus: Record<string, unknown> | null;
    syncedAt: string;
}

function mapFeedbackLabelToBinary(label: SupportedFeedbackLabel) {
    if (label === 'clean') {
        return 0;
    }

    if (label === 'fraud' || label === 'chargeback' || label === 'policy_violation') {
        return 1;
    }

    return null;
}

function sanitizeRunKey(runKey: string) {
    return runKey.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 96);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getRuntimeActiveDir() {
    return process.env.AI_RISK_RUNTIME_MODEL_DIR || path.join(RUNTIME_ROOT, 'active');
}

function getRuntimeStagingRoot() {
    return path.join(RUNTIME_ROOT, 'models');
}

function parseSupabaseStorageUri(uri: string) {
    const match = /^supabase:\/\/([^/]+)\/(.+)$/.exec(uri);
    if (!match) {
        throw new Error(`Unsupported artifact URI: ${uri}`);
    }

    return {
        bucket: match[1],
        storagePath: match[2],
    };
}

function extractLastJsonObject(stdout: string) {
    const lines = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .reverse();

    for (const line of lines) {
        try {
            return JSON.parse(line) as Record<string, unknown>;
        } catch {
            continue;
        }
    }

    return null;
}

async function readJsonIfExists(filePath: string) {
    try {
        const contents = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(contents) as Record<string, unknown>;
    } catch {
        return null;
    }
}

async function fetchRiskServiceStatus() {
    const baseUrl = process.env.AI_RISK_SERVICE_URL;
    if (!baseUrl) {
        return {
            serviceConfigured: false,
            serviceReachable: false,
            serviceStatus: null as Record<string, unknown> | null,
        };
    }

    try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/runtime`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Risk runtime returned ${response.status}`);
        }

        const payload = (await response.json()) as Record<string, unknown>;
        return {
            serviceConfigured: true,
            serviceReachable: true,
            serviceStatus: payload,
        };
    } catch {
        return {
            serviceConfigured: true,
            serviceReachable: false,
            serviceStatus: null as Record<string, unknown> | null,
        };
    }
}

async function requestRiskServiceReload(runtimeModelDir: string) {
    const baseUrl = process.env.AI_RISK_SERVICE_URL;
    if (!baseUrl) {
        return {
            serviceConfigured: false,
            serviceReachable: false,
            serviceReloaded: false,
            serviceStatus: null as Record<string, unknown> | null,
        };
    }

    try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/reload-model`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                modelDir: runtimeModelDir,
            }),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Risk runtime reload returned ${response.status}`);
        }

        const payload = (await response.json()) as Record<string, unknown>;
        return {
            serviceConfigured: true,
            serviceReachable: true,
            serviceReloaded: true,
            serviceStatus: payload,
        };
    } catch {
        return {
            serviceConfigured: true,
            serviceReachable: false,
            serviceReloaded: false,
            serviceStatus: null as Record<string, unknown> | null,
        };
    }
}

function extractUploadedArtifacts(model: RiskModelRegistryRow) {
    const config = isRecord(model.config) ? model.config : {};
    const uploadedArtifacts = isRecord(config.uploaded_artifacts)
        ? (config.uploaded_artifacts as Record<string, unknown>)
        : {};

    const entries = Object.entries(uploadedArtifacts).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
    if (entries.length > 0) {
        return Object.fromEntries(entries);
    }

    if (typeof model.artifact_uri === 'string' && model.artifact_uri.length > 0) {
        return {
            manifest: model.artifact_uri,
        };
    }

    throw new Error(`Risk model ${model.id} does not have any uploaded artifact references`);
}

async function ensureArtifactBucket(adminClient: SupabaseClient, bucketName: string) {
    const { data: buckets, error } = await adminClient.storage.listBuckets();
    if (error) {
        throw new Error(`Failed to list storage buckets: ${error.message}`);
    }

    if (buckets?.some((bucket) => bucket.name === bucketName)) {
        return;
    }

    const { error: createError } = await adminClient.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: '50MB',
    });

    if (createError && !/already exists/i.test(createError.message || '')) {
        throw new Error(`Failed to create storage bucket ${bucketName}: ${createError.message}`);
    }
}

async function uploadArtifacts(
    adminClient: SupabaseClient,
    bucketName: string,
    runKey: string,
    artifacts: Record<string, string>
) {
    await ensureArtifactBucket(adminClient, bucketName);

    const uploaded: Record<string, string> = {};
    for (const [artifactKey, artifactPath] of Object.entries(artifacts)) {
        const resolvedPath = path.resolve(artifactPath);
        const fileBuffer = await fs.readFile(resolvedPath);
        const storagePath = `training-runs/${sanitizeRunKey(runKey)}/${path.basename(resolvedPath)}`;

        const { error } = await adminClient.storage
            .from(bucketName)
            .upload(storagePath, fileBuffer, {
                upsert: true,
                contentType: path.extname(resolvedPath) === '.json' ? 'application/json' : 'application/octet-stream',
            });

        if (error) {
            throw new Error(`Failed to upload ${artifactKey}: ${error.message}`);
        }

        uploaded[artifactKey] = `supabase://${bucketName}/${storagePath}`;
    }

    return uploaded;
}

async function buildTrainingDatasetRows(adminClient: SupabaseClient, limit = 500) {
    const { data: feedbackRows, error: feedbackError } = await adminClient
        .from('risk_feedback')
        .select('id, label, prediction_id, case_id, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (feedbackError) {
        throw new Error(`Failed to load risk feedback: ${feedbackError.message}`);
    }

    const feedback = ((feedbackRows || []) as FeedbackRow[]).filter((row) => mapFeedbackLabelToBinary(row.label) !== null);
    const predictionIds = Array.from(new Set(feedback.map((row) => row.prediction_id).filter(Boolean))) as number[];

    if (predictionIds.length === 0) {
        return {
            rows: [] as TrainingExampleRow[],
            feedbackCount: feedback.length,
            windowStart: null as string | null,
            windowEnd: null as string | null,
        };
    }

    const { data: predictionRows, error: predictionError } = await adminClient
        .from('risk_predictions')
        .select('id, feature_snapshot_id, entity_type, entity_id, model_name, model_version, risk_score, severity')
        .in('id', predictionIds);

    if (predictionError) {
        throw new Error(`Failed to load risk predictions for training: ${predictionError.message}`);
    }

    const predictionsById = new Map<number, PredictionRow>(
        ((predictionRows || []) as PredictionRow[]).map((row) => [row.id, row])
    );
    const snapshotIds = Array.from(
        new Set(
            (predictionRows || [])
                .map((row: any) => row.feature_snapshot_id)
                .filter(Boolean)
        )
    ) as number[];

    const { data: snapshotRows, error: snapshotError } = await adminClient
        .from('risk_feature_snapshots')
        .select('*')
        .in('id', snapshotIds);

    if (snapshotError) {
        throw new Error(`Failed to load risk feature snapshots for training: ${snapshotError.message}`);
    }

    const snapshotsById = new Map<number, RiskFeatureSnapshot>(
        ((snapshotRows || []) as RiskFeatureSnapshot[]).map((row) => [row.id, row])
    );

    const rows: TrainingExampleRow[] = [];
    for (const row of feedback) {
        if (!row.prediction_id) {
            continue;
        }

        const prediction = predictionsById.get(row.prediction_id);
        const snapshot = prediction?.feature_snapshot_id ? snapshotsById.get(prediction.feature_snapshot_id) : null;
        const label = mapFeedbackLabelToBinary(row.label);

        if (!prediction || !snapshot || label === null) {
            continue;
        }

        rows.push({
            featureSections: {
                scalarFeatures: (snapshot.scalar_features || {}) as Record<string, number>,
                ruleFeatures: (snapshot.rule_features || {}) as Record<string, unknown>,
                graphFeatures: (snapshot.graph_features || {}) as Record<string, number>,
                sequenceFeatures: (snapshot.sequence_features || {}) as Record<string, number[]>,
                embeddingFeatures: (snapshot.embedding_features || {}) as Record<string, number[]>,
                labels: {
                    ...((snapshot.labels || {}) as Record<string, unknown>),
                    source_feedback_id: row.id,
                    source_feedback_label: row.label,
                    source_case_id: row.case_id,
                    source_prediction_id: prediction.id,
                    source_entity_type: prediction.entity_type,
                    source_entity_id: prediction.entity_id,
                    source_model_name: prediction.model_name,
                    source_model_version: prediction.model_version,
                    source_prediction_risk_score: prediction.risk_score,
                    source_prediction_severity: prediction.severity,
                },
            },
            label,
            metadata: {
                feedbackId: row.id,
                feedbackLabel: row.label,
                predictionId: prediction.id,
                predictionScore: prediction.risk_score,
                predictionSeverity: prediction.severity,
                entityType: prediction.entity_type,
                entityId: prediction.entity_id,
                observedAt: snapshot.observed_at,
                feedbackCreatedAt: row.created_at,
            },
        });
    }

    const orderedFeedbackDates = feedback.map((row) => row.created_at).sort();

    return {
        rows,
        feedbackCount: feedback.length,
        windowStart: orderedFeedbackDates[0] || null,
        windowEnd: orderedFeedbackDates[orderedFeedbackDates.length - 1] || null,
    };
}

async function writeTrainingDataset(runKey: string, rows: TrainingExampleRow[]) {
    const runDir = path.join(TRAINING_ROOT, sanitizeRunKey(runKey));
    await fs.mkdir(runDir, { recursive: true });

    const datasetPath = path.join(runDir, 'training.jsonl');
    const outputDir = path.join(runDir, 'artifacts');
    await fs.mkdir(outputDir, { recursive: true });

    const jsonl = rows.map((row) => JSON.stringify(row)).join('\n') + '\n';
    await fs.writeFile(datasetPath, jsonl, 'utf-8');

    return {
        runDir,
        datasetPath,
        outputDir,
    };
}

async function runLocalTrainer(runKey: string, datasetPath: string, outputDir: string, notes: Record<string, unknown>) {
    const pythonBin = process.env.AI_RISK_TRAIN_PYTHON_BIN || 'python3';
    const epochs = Number(notes.epochs || 12);
    const learningRate = Number(notes.learningRate || 0.001);
    const randomSeed = Number(notes.randomSeed || 7);

    const args = [
        '-m',
        'captiv8_risk.train',
        '--dataset-path',
        datasetPath,
        '--output-dir',
        outputDir,
        '--epochs',
        String(epochs),
        '--learning-rate',
        String(learningRate),
        '--random-seed',
        String(randomSeed),
    ];

    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];

    await new Promise<void>((resolve, reject) => {
        const child = spawn(pythonBin, args, {
            cwd: TRAINING_CWD,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        child.stdout.on('data', (chunk) => stdoutChunks.push(String(chunk)));
        child.stderr.on('data', (chunk) => stderrChunks.push(String(chunk)));
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(
                new Error(
                    `Risk trainer exited with code ${code}. ${stderrChunks.join('').trim() || stdoutChunks.join('').trim()}`
                )
            );
        });
    });

    const parsed = extractLastJsonObject(stdoutChunks.join(''));
    if (!parsed) {
        throw new Error(`Risk trainer did not emit machine-readable JSON for run ${runKey}`);
    }

    return parsed;
}

async function registerModelFromTrainingRun(
    adminClient: SupabaseClient,
    runId: number,
    runKey: string,
    metrics: Record<string, unknown>,
    uploadedArtifacts: Record<string, string>,
    dataWindowStart?: string | null,
    dataWindowEnd?: string | null
) {
    const modelVersion = `${sanitizeRunKey(runKey)}-${Date.now()}`;
    const { count: championCount, error: championCountError } = await adminClient
        .from('risk_model_registry')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'champion');

    if (championCountError) {
        throw new Error(`Failed to inspect champion model registry: ${championCountError.message}`);
    }

    const stage = (championCount || 0) === 0 ? 'champion' : 'shadow';
    const artifactUri = uploadedArtifacts.manifest || Object.values(uploadedArtifacts)[0] || null;

    const { data, error } = await adminClient
        .from('risk_model_registry')
        .insert({
            model_family: 'fusion',
            model_name: 'captiv8-neural-fusion',
            version: modelVersion,
            stage,
            metrics,
            config: {
                training_run_id: runId,
                uploaded_artifacts: uploadedArtifacts,
            },
            artifact_uri: artifactUri,
            training_window_start: dataWindowStart || null,
            training_window_end: dataWindowEnd || null,
            promoted_at: stage === 'champion' ? new Date().toISOString() : null,
        })
        .select('*')
        .single();

    if (error || !data) {
        throw new Error(error?.message || 'Failed to register trained risk model');
    }

    return data;
}

async function syncModelArtifactsToRuntime(adminClient: SupabaseClient, model: RiskModelRegistryRow) {
    const uploadedArtifacts = extractUploadedArtifacts(model);
    const stagingDir = path.join(getRuntimeStagingRoot(), sanitizeRunKey(`${model.model_name}-${model.version}`));
    const runtimeModelDir = getRuntimeActiveDir();

    await fs.rm(stagingDir, { recursive: true, force: true });
    await fs.mkdir(stagingDir, { recursive: true });

    const syncedArtifacts: Record<string, string> = {};
    for (const [artifactKey, artifactUri] of Object.entries(uploadedArtifacts)) {
        const { bucket, storagePath } = parseSupabaseStorageUri(artifactUri);
        const { data, error } = await adminClient.storage.from(bucket).download(storagePath);

        if (error || !data) {
            throw new Error(error?.message || `Failed to download runtime artifact ${artifactKey}`);
        }

        const localPath = path.join(stagingDir, path.basename(storagePath));
        const buffer = Buffer.from(await data.arrayBuffer());
        await fs.writeFile(localPath, buffer);
        syncedArtifacts[artifactKey] = localPath;
    }

    const syncedAt = new Date().toISOString();
    const activationManifestPath = path.join(stagingDir, 'activation.json');
    await fs.writeFile(
        activationManifestPath,
        JSON.stringify(
            {
                modelId: model.id,
                modelFamily: model.model_family,
                modelName: model.model_name,
                modelVersion: model.version,
                stage: model.stage,
                promotedAt: model.promoted_at || null,
                syncedAt,
                syncedArtifacts,
            },
            null,
            2
        ),
        'utf-8'
    );

    await fs.rm(runtimeModelDir, { recursive: true, force: true });
    await fs.mkdir(path.dirname(runtimeModelDir), { recursive: true });
    await fs.cp(stagingDir, runtimeModelDir, { recursive: true });

    return {
        runtimeModelDir,
        activationManifestPath: path.join(runtimeModelDir, 'activation.json'),
        syncedArtifacts: Object.fromEntries(
            Object.entries(syncedArtifacts).map(([artifactKey, localPath]) => [
                artifactKey,
                path.join(runtimeModelDir, path.basename(localPath)),
            ])
        ),
        syncedAt,
    };
}

async function readChampionModel(adminClient: SupabaseClient) {
    const { data, error } = await adminClient
        .from('risk_model_registry')
        .select('*')
        .eq('stage', 'champion')
        .order('promoted_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to load champion risk model: ${error.message}`);
    }

    return (data || null) as RiskModelRegistryRow | null;
}

async function updateRuntimeActivationMetadata(adminClient: SupabaseClient, modelId: number, activation: RiskRuntimeSyncResult) {
    const { data: model, error } = await adminClient
        .from('risk_model_registry')
        .select('config')
        .eq('id', modelId)
        .single();

    if (error) {
        throw new Error(`Failed to load runtime activation metadata for model ${modelId}: ${error.message}`);
    }

    const existingConfig = isRecord(model?.config) ? model.config : {};
    const nextConfig = {
        ...existingConfig,
        runtime_activation: {
            runtime_model_dir: activation.runtimeModelDir,
            synced_artifacts: activation.syncedArtifacts,
            activation_manifest_path: activation.activationManifestPath,
            synced_at: activation.syncedAt,
            service_configured: activation.serviceConfigured,
            service_reachable: activation.serviceReachable,
            service_reloaded: activation.serviceReloaded,
            service_status: activation.serviceStatus,
        },
    };

    const { error: updateError } = await adminClient
        .from('risk_model_registry')
        .update({
            config: nextConfig,
        })
        .eq('id', modelId);

    if (updateError) {
        throw new Error(`Failed to persist runtime activation metadata: ${updateError.message}`);
    }
}

export async function activateRiskModel(adminClient: SupabaseClient, modelId?: number): Promise<RiskRuntimeSyncResult> {
    let model: RiskModelRegistryRow | null = null;
    if (modelId) {
        const { data, error } = await adminClient.from('risk_model_registry').select('*').eq('id', modelId).single();
        if (error || !data) {
            throw new Error(error?.message || `Risk model ${modelId} not found`);
        }
        model = data as RiskModelRegistryRow;
    } else {
        model = await readChampionModel(adminClient);
    }

    if (!model) {
        throw new Error('No champion risk model available to activate');
    }

    const syncResult = await syncModelArtifactsToRuntime(adminClient, model);
    const runtimeReload = await requestRiskServiceReload(syncResult.runtimeModelDir);
    const activation: RiskRuntimeSyncResult = {
        modelId: model.id,
        modelVersion: model.version,
        runtimeModelDir: syncResult.runtimeModelDir,
        syncedArtifacts: syncResult.syncedArtifacts,
        activationManifestPath: syncResult.activationManifestPath,
        serviceConfigured: runtimeReload.serviceConfigured,
        serviceReachable: runtimeReload.serviceReachable,
        serviceReloaded: runtimeReload.serviceReloaded,
        serviceStatus: runtimeReload.serviceStatus,
        syncedAt: syncResult.syncedAt,
    };

    await updateRuntimeActivationMetadata(adminClient, model.id, activation);
    return activation;
}

export async function getRiskRuntimeStatus(adminClient?: SupabaseClient): Promise<RiskRuntimeStatus> {
    const runtimeModelDir = getRuntimeActiveDir();
    const [activationManifest, runtimeState] = await Promise.all([
        readJsonIfExists(path.join(runtimeModelDir, 'activation.json')),
        fetchRiskServiceStatus(),
    ]);

    const championModel = adminClient ? await readChampionModel(adminClient) : null;

    return {
        runtimeModelDir,
        activationManifest,
        serviceConfigured: runtimeState.serviceConfigured,
        serviceReachable: runtimeState.serviceReachable,
        serviceStatus: runtimeState.serviceStatus,
        championModel,
    };
}

export async function promoteRiskModel(adminClient: SupabaseClient, modelId: number) {
    const [{ data: targetModel, error: targetError }, { data: championModels, error: championError }] = await Promise.all([
        adminClient.from('risk_model_registry').select('*').eq('id', modelId).single(),
        adminClient.from('risk_model_registry').select('id').eq('stage', 'champion'),
    ]);

    if (targetError || !targetModel) {
        throw new Error(targetError?.message || `Risk model ${modelId} not found`);
    }

    if (championError) {
        throw new Error(championError.message);
    }

    const championIds = (championModels || []).map((entry: { id: number }) => entry.id).filter((id: number) => id !== modelId);
    if (championIds.length > 0) {
        const { error } = await adminClient
            .from('risk_model_registry')
            .update({ stage: 'archived' })
            .in('id', championIds);

        if (error) {
            throw new Error(`Failed to archive existing champion models: ${error.message}`);
        }
    }

    const { data, error } = await adminClient
        .from('risk_model_registry')
        .update({
            stage: 'champion',
            promoted_at: new Date().toISOString(),
        })
        .eq('id', modelId)
        .select('*')
        .single();

    if (error || !data) {
        throw new Error(error?.message || `Failed to promote risk model ${modelId}`);
    }

    return data;
}

export async function processQueuedTrainingRuns(adminClient: SupabaseClient, limit = 1): Promise<ProcessTrainingRunResult[]> {
    const { data: runs, error } = await adminClient
        .from('risk_training_runs')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) {
        throw new Error(`Failed to load queued training runs: ${error.message}`);
    }

    const results: ProcessTrainingRunResult[] = [];
    for (const run of runs || []) {
        const runKey = String(run.run_key);

        await adminClient
            .from('risk_training_runs')
            .update({
                status: 'running',
                started_at: new Date().toISOString(),
                notes: {
                    ...(run.notes || {}),
                    worker_started_at: new Date().toISOString(),
                },
            })
            .eq('id', run.id);

        try {
            const dataset = await buildTrainingDatasetRows(adminClient, Number(run.notes?.datasetLimit || 500));
            if (dataset.rows.length < TRAINING_MIN_ROWS) {
                throw new Error(
                    `Insufficient labeled rows for training. Need at least ${TRAINING_MIN_ROWS}, found ${dataset.rows.length}.`
                );
            }

            const localArtifacts = await writeTrainingDataset(runKey, dataset.rows);
            const trainingResponse = await runLocalTrainer(runKey, localArtifacts.datasetPath, localArtifacts.outputDir, run.notes || {});
            const metrics = (trainingResponse.metrics || {}) as Record<string, unknown>;
            const artifacts = (trainingResponse.artifacts || {}) as Record<string, string>;
            const uploadedArtifacts = await uploadArtifacts(adminClient, DEFAULT_ARTIFACT_BUCKET, runKey, artifacts);
            const modelRegistryEntry = await registerModelFromTrainingRun(
                adminClient,
                run.id,
                runKey,
                metrics,
                uploadedArtifacts,
                dataset.windowStart,
                dataset.windowEnd
            );

            let activation: RiskRuntimeSyncResult | undefined;
            let activationError: string | null = null;
            if (modelRegistryEntry.stage === 'champion') {
                try {
                    activation = await activateRiskModel(adminClient, modelRegistryEntry.id);
                } catch (error: any) {
                    activationError = error?.message || 'Failed to activate champion risk model';
                }
            }

            await adminClient
                .from('risk_training_runs')
                .update({
                    status: 'completed',
                    model_registry_id: modelRegistryEntry.id,
                    metrics,
                    data_window_start: dataset.windowStart,
                    data_window_end: dataset.windowEnd,
                    completed_at: new Date().toISOString(),
                    notes: {
                        ...(run.notes || {}),
                        local_artifact_dir: localArtifacts.outputDir,
                        uploaded_artifacts: uploadedArtifacts,
                        feedback_count: dataset.feedbackCount,
                        labeled_rows: dataset.rows.length,
                        runtime_activation: activation || null,
                        runtime_activation_error: activationError,
                    },
                })
                .eq('id', run.id);

            results.push({
                runId: run.id,
                runKey,
                status: 'completed',
                rowCount: dataset.rows.length,
                modelRegistryId: modelRegistryEntry.id,
                artifactUri: modelRegistryEntry.artifact_uri,
                metrics,
                activation,
            });
        } catch (processingError: any) {
            await adminClient
                .from('risk_training_runs')
                .update({
                    status: 'failed',
                    completed_at: new Date().toISOString(),
                    notes: {
                        ...(run.notes || {}),
                        failure_message: processingError?.message || 'Unknown training error',
                    },
                })
                .eq('id', run.id);

            results.push({
                runId: run.id,
                runKey,
                status: 'failed',
                rowCount: 0,
                error: processingError?.message || 'Unknown training error',
            });
        }
    }

    return results;
}

export const __riskTrainingInternals = {
    mapFeedbackLabelToBinary,
    sanitizeRunKey,
    extractLastJsonObject,
    parseSupabaseStorageUri,
    extractUploadedArtifacts,
};
