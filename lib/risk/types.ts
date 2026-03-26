import type {
    Profile,
    RiskCase,
    RiskEntityType,
    RiskPrediction,
    RiskSeverity,
    Transaction,
    UserTask,
} from '@/lib/types';

export interface RiskGraphEdgeInput {
    leftEntityType: string;
    leftEntityId: string;
    rightEntityType: string;
    rightEntityId: string;
    relationType: string;
    weight: number;
    metadata?: Record<string, unknown>;
}

export interface RiskFeatureSections {
    scalarFeatures: Record<string, number>;
    ruleFeatures: Record<string, number | boolean | string | null>;
    graphFeatures: Record<string, number>;
    sequenceFeatures: Record<string, number[]>;
    embeddingFeatures: Record<string, number[]>;
    labels?: Record<string, string | number | boolean | null>;
}

export interface BaseRiskContext {
    entityType: RiskEntityType;
    entityId: string;
    userId: string | null;
    profile: Profile | null;
    recentTransactions: Transaction[];
    recentTasks: UserTask[];
    relatedProfiles: Profile[];
    sharedWalletTransactions: Transaction[];
    sharedProofTransactions: Transaction[];
    openCases: RiskCase[];
    latestPredictions: RiskPrediction[];
    referredProfiles: Profile[];
}

export interface TransactionRiskContext extends BaseRiskContext {
    entityType: 'transaction';
    transaction: Transaction;
}

export interface ProfileRiskContext extends BaseRiskContext {
    entityType: 'profile';
}

export interface UserTaskRiskContext extends BaseRiskContext {
    entityType: 'user_task';
    userTask: UserTask;
}

export type RiskContextBundle =
    | TransactionRiskContext
    | ProfileRiskContext
    | UserTaskRiskContext;

export interface RiskInferenceRequest {
    entityType: RiskEntityType;
    entityId: string;
    userId: string | null;
    featureSections: RiskFeatureSections;
    metadata: Record<string, unknown>;
}

export interface RiskScoringResult {
    modelFamily: string;
    modelName: string;
    modelVersion: string;
    ensembleVersion?: string;
    riskScore: number;
    severity: RiskSeverity;
    confidence: number;
    recommendedAction: string;
    explanation: {
        summary: string;
        topSignals: Array<{
            key: string;
            value: number | string | boolean;
            weight: number;
            section: 'rules' | 'graph' | 'behavior' | 'account';
        }>;
        metadata?: Record<string, unknown>;
    };
    componentScores: Record<string, number>;
    ruleSignals: Record<string, number | boolean | string | null>;
    graphSignals: Record<string, number>;
    featureSections: RiskFeatureSections;
}

export interface RiskPersistenceResult {
    snapshotId: number;
    predictionId: number;
    caseId: string | null;
}
