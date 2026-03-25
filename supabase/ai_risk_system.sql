-- Captiv8 AI Risk System
-- Run this after the core schema and supporting SQL files.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS risk_segment TEXT NOT NULL DEFAULT 'low',
    ADD COLUMN IF NOT EXISTS risk_score DECIMAL(8,6) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS risk_review_priority DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS risk_recommended_action TEXT,
    ADD COLUMN IF NOT EXISTS risk_last_scored_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS risk_case_id UUID,
    ADD COLUMN IF NOT EXISTS risk_hold_active BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS risk_score DECIMAL(8,6) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS risk_segment TEXT NOT NULL DEFAULT 'low',
    ADD COLUMN IF NOT EXISTS risk_recommended_action TEXT,
    ADD COLUMN IF NOT EXISTS risk_last_scored_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS risk_case_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_risk_segment_check'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_risk_segment_check
            CHECK (risk_segment IN ('low', 'medium', 'high', 'critical'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_risk_segment_check'
    ) THEN
        ALTER TABLE public.transactions
            ADD CONSTRAINT transactions_risk_segment_check
            CHECK (risk_segment IN ('low', 'medium', 'high', 'critical'));
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin_actor()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN := false;
BEGIN
    SELECT
        COALESCE((to_jsonb(p) ->> 'is_admin')::boolean, false)
        OR COALESCE(to_jsonb(p) ->> 'role' = 'admin', false)
    INTO v_is_admin
    FROM public.profiles p
    WHERE p.id = auth.uid();

    RETURN COALESCE(v_is_admin, false);
END;
$$;

CREATE TABLE IF NOT EXISTS public.risk_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    CONSTRAINT risk_events_processing_status_check
        CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed'))
);

CREATE TABLE IF NOT EXISTS public.risk_feature_snapshots (
    id BIGSERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    feature_version TEXT NOT NULL DEFAULT 'v1',
    scalar_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    rule_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    graph_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    sequence_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    labels JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_event_id BIGINT REFERENCES public.risk_events(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.risk_graph_edges (
    id BIGSERIAL PRIMARY KEY,
    left_entity_type TEXT NOT NULL,
    left_entity_id TEXT NOT NULL,
    right_entity_type TEXT NOT NULL,
    right_entity_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (left_entity_type, left_entity_id, right_entity_type, right_entity_id, relation_type)
);

CREATE TABLE IF NOT EXISTS public.risk_predictions (
    id BIGSERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    feature_snapshot_id BIGINT REFERENCES public.risk_feature_snapshots(id) ON DELETE SET NULL,
    model_family TEXT NOT NULL DEFAULT 'fusion',
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    ensemble_version TEXT,
    risk_score DECIMAL(8,6) NOT NULL,
    severity TEXT NOT NULL,
    confidence DECIMAL(8,6) NOT NULL DEFAULT 0,
    recommended_action TEXT NOT NULL,
    explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    component_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    rule_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
    graph_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
    shadow_mode BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT risk_predictions_severity_check
        CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE TABLE IF NOT EXISTS public.risk_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    latest_prediction_id BIGINT REFERENCES public.risk_predictions(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    current_risk_score DECIMAL(8,6) NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    summary TEXT,
    recommended_action TEXT,
    assignee_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    disposition TEXT,
    resolution_notes TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    CONSTRAINT risk_cases_status_check
        CHECK (status IN ('open', 'investigating', 'escalated', 'resolved', 'dismissed')),
    CONSTRAINT risk_cases_priority_check
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    UNIQUE (entity_type, entity_id, status)
);

CREATE TABLE IF NOT EXISTS public.risk_feedback (
    id BIGSERIAL PRIMARY KEY,
    case_id UUID REFERENCES public.risk_cases(id) ON DELETE CASCADE,
    prediction_id BIGINT REFERENCES public.risk_predictions(id) ON DELETE SET NULL,
    reviewer_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    label TEXT NOT NULL,
    outcome TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT risk_feedback_label_check
        CHECK (label IN ('clean', 'fraud', 'needs_review', 'chargeback', 'policy_violation'))
);

CREATE TABLE IF NOT EXISTS public.risk_model_registry (
    id BIGSERIAL PRIMARY KEY,
    model_family TEXT NOT NULL,
    model_name TEXT NOT NULL,
    version TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'candidate',
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    artifact_uri TEXT,
    training_window_start TIMESTAMPTZ,
    training_window_end TIMESTAMPTZ,
    promoted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT risk_model_registry_stage_check
        CHECK (stage IN ('candidate', 'shadow', 'champion', 'archived')),
    UNIQUE (model_name, version)
);

CREATE TABLE IF NOT EXISTS public.risk_training_runs (
    id BIGSERIAL PRIMARY KEY,
    run_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'queued',
    model_registry_id BIGINT REFERENCES public.risk_model_registry(id) ON DELETE SET NULL,
    notes JSONB NOT NULL DEFAULT '{}'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_window_start TIMESTAMPTZ,
    data_window_end TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT risk_training_runs_status_check
        CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.risk_system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.risk_operation_runs (
    id BIGSERIAL PRIMARY KEY,
    operation_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT risk_operation_runs_status_check
        CHECK (status IN ('running', 'completed', 'failed'))
);

CREATE OR REPLACE VIEW public.risk_case_overview AS
SELECT
    rc.id,
    rc.entity_type,
    rc.entity_id,
    rc.user_id,
    rc.status,
    rc.priority,
    rc.current_risk_score,
    rc.title,
    rc.summary,
    rc.recommended_action,
    rc.assignee_user_id,
    rc.disposition,
    rc.opened_at,
    rc.updated_at,
    rp.severity,
    rp.confidence,
    rp.model_name,
    rp.model_version,
    rp.component_scores,
    rp.rule_signals,
    rp.graph_signals,
    p.username,
    p.display_name
FROM public.risk_cases rc
LEFT JOIN public.risk_predictions rp ON rp.id = rc.latest_prediction_id
LEFT JOIN public.profiles p ON p.id = rc.user_id;

CREATE INDEX IF NOT EXISTS idx_risk_events_pending
    ON public.risk_events (processing_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_events_entity
    ON public.risk_events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_feature_snapshots_entity
    ON public.risk_feature_snapshots (entity_type, entity_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_feature_snapshots_user
    ON public.risk_feature_snapshots (user_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_graph_edges_left
    ON public.risk_graph_edges (left_entity_type, left_entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_graph_edges_right
    ON public.risk_graph_edges (right_entity_type, right_entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_entity
    ON public.risk_predictions (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_user
    ON public.risk_predictions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_cases_status_priority
    ON public.risk_cases (status, priority, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_cases_user
    ON public.risk_cases (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_training_runs_status
    ON public.risk_training_runs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_operation_runs_type_status
    ON public.risk_operation_runs (operation_type, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_risk_hold_active
    ON public.profiles (risk_hold_active, risk_segment, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_segment
    ON public.transactions (risk_segment, risk_score DESC, created_at DESC);

ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_feature_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_training_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_operation_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'risk_predictions'
          AND policyname = 'Users can view own risk predictions'
    ) THEN
        CREATE POLICY "Users can view own risk predictions"
        ON public.risk_predictions
        FOR SELECT
        USING (auth.uid() = user_id OR public.is_admin_actor());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'risk_cases'
          AND policyname = 'Users can view own risk cases'
    ) THEN
        CREATE POLICY "Users can view own risk cases"
        ON public.risk_cases
        FOR SELECT
        USING (auth.uid() = user_id OR public.is_admin_actor());
    END IF;
END $$;

DO $$
DECLARE
    v_table TEXT;
BEGIN
    FOREACH v_table IN ARRAY ARRAY[
        'risk_events',
        'risk_feature_snapshots',
        'risk_graph_edges',
        'risk_predictions',
        'risk_cases',
        'risk_feedback',
        'risk_model_registry',
        'risk_training_runs',
        'risk_system_settings',
        'risk_operation_runs'
    ]
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = v_table
              AND policyname = 'Admins can manage ' || v_table
        ) THEN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR ALL USING (public.is_admin_actor()) WITH CHECK (public.is_admin_actor())',
                'Admins can manage ' || v_table,
                v_table
            );
        END IF;
    END LOOP;
END $$;

INSERT INTO public.risk_system_settings (key, value)
VALUES (
    'automation_config',
    jsonb_build_object(
        'minFeedbackSamplesForTraining', 24,
        'minHoursBetweenTrainingRuns', 12,
        'datasetLimit', 500,
        'maxEventBatchSize', 25,
        'maxEventBatchesPerCycle', 4,
        'maxTrainingRunsPerCycle', 1,
        'autoPromoteMinValidationAuc', 0.78,
        'autoPromoteValidationAucDelta', 0.015
    )
)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.enqueue_risk_event(
    p_event_type TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_user_id UUID,
    p_actor_user_id UUID,
    p_payload JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_id BIGINT;
BEGIN
    INSERT INTO public.risk_events (
        event_type,
        entity_type,
        entity_id,
        user_id,
        actor_user_id,
        payload
    )
    VALUES (
        p_event_type,
        p_entity_type,
        p_entity_id,
        p_user_id,
        p_actor_user_id,
        COALESCE(p_payload, '{}'::jsonb)
    )
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_risk_case_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_risk_cases_updated_at ON public.risk_cases;
CREATE TRIGGER trg_risk_cases_updated_at
BEFORE UPDATE ON public.risk_cases
FOR EACH ROW
EXECUTE FUNCTION public.touch_risk_case_timestamp();

CREATE OR REPLACE FUNCTION public.capture_transaction_risk_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_type TEXT;
    v_new JSONB;
BEGIN
    v_new := to_jsonb(NEW);

    v_event_type := CASE
        WHEN TG_OP = 'INSERT' THEN 'transaction.created'
        WHEN TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN 'transaction.status_changed'
        ELSE 'transaction.updated'
    END;

    PERFORM public.enqueue_risk_event(
        v_event_type,
        'transaction',
        NEW.id::text,
        NEW.user_id,
        auth.uid(),
        jsonb_build_object(
            'type', NEW.type,
            'status', NEW.status,
            'amount', NEW.amount,
            'network', v_new ->> 'network',
            'wallet_address', v_new ->> 'wallet_address',
            'proof_url', v_new ->> 'proof_url',
            'metadata', COALESCE(v_new -> 'metadata', '{}'::jsonb),
            'task_id', v_new ->> 'task_id'
        )
    );

    RETURN NEW;
END;
$$;

DO $$
DECLARE
    v_update_columns TEXT;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'transactions'
    ) THEN
        SELECT string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position)
        INTO v_update_columns
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'transactions'
          AND column_name = ANY (
              ARRAY[
                  'type',
                  'amount',
                  'status',
                  'description',
                  'proof_url',
                  'wallet_address',
                  'network',
                  'metadata',
                  'task_id'
              ]
          );

        EXECUTE 'DROP TRIGGER IF EXISTS trg_transactions_risk_event ON public.transactions';

        IF v_update_columns IS NULL THEN
            EXECUTE '
                CREATE TRIGGER trg_transactions_risk_event
                AFTER INSERT OR UPDATE ON public.transactions
                FOR EACH ROW
                EXECUTE FUNCTION public.capture_transaction_risk_event()
            ';
        ELSE
            EXECUTE format(
                '
                CREATE TRIGGER trg_transactions_risk_event
                AFTER INSERT OR UPDATE OF %s ON public.transactions
                FOR EACH ROW
                EXECUTE FUNCTION public.capture_transaction_risk_event()
                ',
                v_update_columns
            );
        END IF;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.capture_user_task_risk_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_type TEXT;
    v_new JSONB;
BEGIN
    v_new := to_jsonb(NEW);

    v_event_type := CASE
        WHEN TG_OP = 'INSERT' THEN 'user_task.created'
        WHEN TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN 'user_task.status_changed'
        ELSE 'user_task.updated'
    END;

    PERFORM public.enqueue_risk_event(
        v_event_type,
        'user_task',
        NEW.id::text,
        NEW.user_id,
        auth.uid(),
        jsonb_build_object(
            'status', v_new ->> 'status',
            'earned_amount', v_new ->> 'earned_amount',
            'cost_amount', v_new ->> 'cost_amount',
            'is_bundle', COALESCE((v_new ->> 'is_bundle')::boolean, false),
            'task_item_id', v_new ->> 'task_item_id'
        )
    );

    RETURN NEW;
END;
$$;

DO $$
DECLARE
    v_update_columns TEXT;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_tasks'
    ) THEN
        SELECT string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position)
        INTO v_update_columns
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_tasks'
          AND column_name = ANY (
              ARRAY[
                  'status',
                  'earned_amount',
                  'cost_amount',
                  'is_bundle',
                  'task_item_id'
              ]
          );

        EXECUTE 'DROP TRIGGER IF EXISTS trg_user_tasks_risk_event ON public.user_tasks';

        IF v_update_columns IS NULL THEN
            EXECUTE '
                CREATE TRIGGER trg_user_tasks_risk_event
                AFTER INSERT OR UPDATE ON public.user_tasks
                FOR EACH ROW
                EXECUTE FUNCTION public.capture_user_task_risk_event()
            ';
        ELSE
            EXECUTE format(
                '
                CREATE TRIGGER trg_user_tasks_risk_event
                AFTER INSERT OR UPDATE OF %s ON public.user_tasks
                FOR EACH ROW
                EXECUTE FUNCTION public.capture_user_task_risk_event()
                ',
                v_update_columns
            );
        END IF;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.capture_profile_risk_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new JSONB;
BEGIN
    v_new := to_jsonb(NEW);

    PERFORM public.enqueue_risk_event(
        CASE WHEN TG_OP = 'INSERT' THEN 'profile.created' ELSE 'profile.updated' END,
        'profile',
        NEW.id::text,
        NEW.id,
        auth.uid(),
        jsonb_build_object(
            'wallet_balance', v_new ->> 'wallet_balance',
            'profit', v_new ->> 'profit',
            'freeze_balance', v_new ->> 'freeze_balance',
            'level_id', v_new ->> 'level_id',
            'referred_by', v_new ->> 'referred_by',
            'withdrawal_wallet_address', v_new ->> 'withdrawal_wallet_address',
            'verification_status', COALESCE(v_new ->> 'verification_status', 'unknown'),
            'pending_bundle', COALESCE(v_new -> 'pending_bundle', 'null'::jsonb)
        )
    );

    RETURN NEW;
END;
$$;

DO $$
DECLARE
    v_update_columns TEXT;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
    ) THEN
        SELECT string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position)
        INTO v_update_columns
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = ANY (
              ARRAY[
                  'wallet_balance',
                  'profit',
                  'freeze_balance',
                  'level_id',
                  'referred_by',
                  'withdrawal_wallet_address',
                  'pending_bundle',
                  'verification_status'
              ]
          );

        EXECUTE 'DROP TRIGGER IF EXISTS trg_profiles_risk_event ON public.profiles';

        IF v_update_columns IS NULL THEN
            EXECUTE '
                CREATE TRIGGER trg_profiles_risk_event
                AFTER INSERT OR UPDATE ON public.profiles
                FOR EACH ROW
                EXECUTE FUNCTION public.capture_profile_risk_event()
            ';
        ELSE
            EXECUTE format(
                '
                CREATE TRIGGER trg_profiles_risk_event
                AFTER INSERT OR UPDATE OF %s ON public.profiles
                FOR EACH ROW
                EXECUTE FUNCTION public.capture_profile_risk_event()
                ',
                v_update_columns
            );
        END IF;
    END IF;
END $$;
