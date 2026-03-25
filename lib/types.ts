export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    phone: string;
    phone_number: string | null;
    role: 'user' | 'admin';
    level_id: number | null;
    referral_code: string;
    referred_by: string | null;
    wallet_balance: number;
    profit: number;
    total_earned: number;
    freeze_balance: number;
    referral_earned: number;
    avatar_url: string | null;
    total_earnings?: number;
    email: string;
    completed_count: number;
    current_set: number;
    last_reset_at: string;
    wallet_address?: string | null;
    security_pin?: string | null;
    language: string;
    currency: string;
    pending_bundle: any | null;
    notifications_enabled: boolean;
    wallet_network?: string | null;
    withdrawal_wallet_address?: string | null;
    security_settings?: {
        biometric?: boolean;
        twoFactor?: boolean;
        loginAlerts?: boolean;
    } | null;
    is_admin?: boolean;
    total_volume?: number;
    completed_tasks_count?: number;
    risk_segment?: RiskSeverity;
    risk_score?: number;
    risk_review_priority?: number;
    risk_recommended_action?: string | null;
    risk_last_scored_at?: string | null;
    risk_case_id?: string | null;
    risk_hold_active?: boolean;
    is_verified: boolean;
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    verification_doc_type?: 'id' | 'passport' | 'license' | null;
    verification_front_url?: string | null;
    verification_back_url?: string | null;
    withdrawal_password?: string | null;
    tasks_per_set_override?: number | null;
    sets_per_day_override?: number | null;
    level?: Level;
    created_at: string;
}

export interface Level {
    id: number;
    name: string;
    price: number;
    commission_rate: number;
    tasks_per_set: number;
    sets_per_day: number;
    description: string;
    badge_color: string;
}

export interface TaskItem {
    id: number;
    title: string;
    image_url: string;
    description: string;
    category: string;
    level_id?: number | null;
    is_active: boolean;
    created_at: string;
}

export interface UserTask {
    id: number;
    user_id: string;
    task_item_id: number;
    status: 'pending' | 'completed' | 'cancelled';
    earned_amount: number;
    cost_amount?: number;
    is_bundle?: boolean;
    completed_at: string | null;
    created_at: string;
    task_item?: TaskItem;
}

export interface ReferralCode {
    id: number;
    code: string;
    owner_id: string;
    uses_count: number;
    is_active: boolean;
    created_at: string;
    owner?: Profile;
}

export interface Transaction {
    id: number;
    user_id: string;
    type: 'deposit' | 'withdrawal' | 'commission' | 'freeze' | 'unfreeze';
    amount: number;
    description: string;
    status?: 'pending' | 'approved' | 'rejected';
    proof_url?: string | null;
    wallet_address?: string | null;
    network?: string | null;
    risk_score?: number;
    risk_segment?: RiskSeverity;
    risk_recommended_action?: string | null;
    risk_last_scored_at?: string | null;
    risk_case_id?: string | null;
    created_at: string;
}

export type RiskEntityType = 'profile' | 'transaction' | 'user_task';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskCaseStatus = 'open' | 'investigating' | 'escalated' | 'resolved' | 'dismissed';

export interface RiskEvent {
    id: number;
    event_type: string;
    entity_type: RiskEntityType;
    entity_id: string;
    user_id: string | null;
    actor_user_id: string | null;
    processing_status: 'pending' | 'processing' | 'processed' | 'failed';
    payload: Record<string, unknown>;
    created_at: string;
    processed_at?: string | null;
    error_message?: string | null;
}

export interface RiskFeatureSnapshot {
    id: number;
    entity_type: RiskEntityType;
    entity_id: string;
    user_id: string | null;
    feature_version: string;
    scalar_features: Record<string, unknown>;
    rule_features: Record<string, unknown>;
    graph_features: Record<string, unknown>;
    sequence_features: Record<string, unknown>;
    embedding_features: Record<string, unknown>;
    labels: Record<string, unknown>;
    source_event_id?: number | null;
    observed_at: string;
}

export interface RiskPrediction {
    id: number;
    entity_type: RiskEntityType;
    entity_id: string;
    user_id: string | null;
    feature_snapshot_id?: number | null;
    model_family: string;
    model_name: string;
    model_version: string;
    ensemble_version?: string | null;
    risk_score: number;
    severity: RiskSeverity;
    confidence: number;
    recommended_action: string;
    explanation: Record<string, unknown>;
    component_scores: Record<string, number>;
    rule_signals: Record<string, unknown>;
    graph_signals: Record<string, unknown>;
    shadow_mode: boolean;
    created_at: string;
}

export interface RiskCase {
    id: string;
    entity_type: RiskEntityType;
    entity_id: string;
    user_id: string | null;
    latest_prediction_id?: number | null;
    status: RiskCaseStatus;
    priority: RiskSeverity;
    current_risk_score: number;
    title: string;
    summary?: string | null;
    recommended_action?: string | null;
    assignee_user_id?: string | null;
    disposition?: string | null;
    resolution_notes?: string | null;
    opened_at: string;
    updated_at: string;
    closed_at?: string | null;
    severity?: RiskSeverity;
    confidence?: number | null;
    model_name?: string | null;
    model_version?: string | null;
    component_scores?: Record<string, number>;
    rule_signals?: Record<string, unknown>;
    graph_signals?: Record<string, unknown>;
    username?: string | null;
    display_name?: string | null;
}

export interface RiskFeedback {
    id: number;
    case_id: string;
    prediction_id?: number | null;
    reviewer_user_id?: string | null;
    label: 'clean' | 'fraud' | 'needs_review' | 'chargeback' | 'policy_violation';
    outcome?: string | null;
    notes?: string | null;
    created_at: string;
}

export interface RiskModelRegistryEntry {
    id: number;
    model_family: string;
    model_name: string;
    version: string;
    stage: 'candidate' | 'shadow' | 'champion' | 'archived';
    metrics: Record<string, unknown>;
    config: Record<string, unknown>;
    artifact_uri?: string | null;
    training_window_start?: string | null;
    training_window_end?: string | null;
    promoted_at?: string | null;
    created_at: string;
}

export interface RiskTrainingRun {
    id: number;
    run_key: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    model_registry_id?: number | null;
    notes: Record<string, unknown>;
    metrics: Record<string, unknown>;
    data_window_start?: string | null;
    data_window_end?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    created_at: string;
}
