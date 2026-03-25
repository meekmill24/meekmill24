from __future__ import annotations

import json
import os
import pickle
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
from fastapi import FastAPI

from captiv8_risk.features import build_feature_batch, pad_vector
from captiv8_risk.models.rules import RuleCalibrator
from captiv8_risk.schemas import (
    Explanation,
    RiskScoreRequest,
    RiskScoreResponse,
    RuntimeReloadRequest,
    RuntimeStatusResponse,
    TopSignal,
    TrainingJobRequest,
    TrainingJobResponse,
)
from captiv8_risk.train import train_from_dataset

try:
    import torch
    from captiv8_risk.models import FusionRiskModel, GraphSignalEncoder, TabularEncoder

    TORCH_AVAILABLE = True
except Exception:  # pragma: no cover - exercised via service fallback tests instead
    torch = None
    FusionRiskModel = None
    GraphSignalEncoder = None
    TabularEncoder = None
    TORCH_AVAILABLE = False

try:
    from xgboost import XGBClassifier

    XGBOOST_AVAILABLE = True
except Exception:  # pragma: no cover - optional training/runtime dependency
    XGBClassifier = None
    XGBOOST_AVAILABLE = False

APP_DIR = Path(__file__).resolve().parent
REPO_ROOT = APP_DIR.parent.parent
MODEL_DIR_ENV = "CAPTIV8_RISK_MODEL_DIR"
DEFAULT_RUNTIME_MODEL_DIR = REPO_ROOT / "tmp" / "risk-runtime" / "active"


class HybridRiskService:
    def __init__(self) -> None:
        self.rule_calibrator = RuleCalibrator()
        self.fused_dim = 64
        self.tabular_dim = 16
        self.graph_dim = 8
        self.default_model_version = "0.1.0"
        self.default_model_name = "captiv8-neural-fusion"
        self.backend = "numpy-fallback"
        self.model_version = self.default_model_version
        self.model_name = self.default_model_name
        self.tabular_encoder = None
        self.graph_encoder = None
        self.fusion_model = None
        self.sklearn_fusion_model = None
        self.teacher_model = None
        self.teacher_backend = None
        self.model_manifest: Dict[str, str] = {}
        self.runtime_model_dir: Optional[str] = None

        if TORCH_AVAILABLE:
            self.tabular_encoder = TabularEncoder(input_dim=self.fused_dim, latent_dim=self.tabular_dim)
            self.graph_encoder = GraphSignalEncoder(input_dim=16, latent_dim=self.graph_dim)
            self.fusion_model = FusionRiskModel(
                fused_input_dim=self.fused_dim,
                tabular_dim=self.tabular_dim,
                graph_dim=self.graph_dim,
            )
            self._seed_weights()
            self.fusion_model.eval()
            self.tabular_encoder.eval()
            self.graph_encoder.eval()
            self.backend = "torch-seeded"

        self.reload()

    def _seed_weights(self) -> None:
        if not TORCH_AVAILABLE:
            return
        torch.manual_seed(7)
        for module in [self.tabular_encoder, self.graph_encoder, self.fusion_model]:
            for parameter in module.parameters():
                if parameter.ndim > 1:
                    torch.nn.init.xavier_uniform_(parameter)
                else:
                    torch.nn.init.zeros_(parameter)

    def _clear_loaded_artifacts(self) -> None:
        self.sklearn_fusion_model = None
        self.teacher_model = None
        self.teacher_backend = None
        self.model_manifest = {}
        self.runtime_model_dir = None
        self.model_version = self.default_model_version
        self.model_name = self.default_model_name

        if TORCH_AVAILABLE:
            self._seed_weights()
            self.backend = "torch-seeded"
            self.fusion_model.eval()
            self.tabular_encoder.eval()
            self.graph_encoder.eval()
        else:
            self.backend = "numpy-fallback"

    def _resolve_model_dir(self, explicit_model_dir: Optional[str] = None) -> Optional[str]:
        model_dir = explicit_model_dir or os.getenv(MODEL_DIR_ENV)
        if model_dir:
            return model_dir

        if DEFAULT_RUNTIME_MODEL_DIR.exists():
            return str(DEFAULT_RUNTIME_MODEL_DIR)

        return None

    def _load_artifacts(self, explicit_model_dir: Optional[str] = None) -> None:
        model_dir = self._resolve_model_dir(explicit_model_dir)
        if not model_dir:
            return

        manifest_path = Path(model_dir) / "manifest.json"
        if not manifest_path.exists():
            return

        with manifest_path.open("r", encoding="utf-8") as handle:
            manifest = json.load(handle)

        self.model_manifest = manifest
        self.runtime_model_dir = str(Path(model_dir))
        self.model_version = manifest.get("model_version", self.model_version)
        self.model_name = manifest.get("model_name", self.model_name)
        self.teacher_backend = manifest.get("teacher_backend")
        backend = manifest.get("backend")

        teacher_pickle_path = Path(model_dir) / "teacher_model.pkl"
        teacher_xgboost_path = Path(model_dir) / "teacher_model.json"
        if teacher_pickle_path.exists():
            with teacher_pickle_path.open("rb") as handle:
                self.teacher_model = pickle.load(handle)
        elif teacher_xgboost_path.exists() and XGBOOST_AVAILABLE:
            teacher_model = XGBClassifier()
            teacher_model.load_model(teacher_xgboost_path)
            self.teacher_model = teacher_model

        if backend == "torch" and TORCH_AVAILABLE:
            state_path = Path(model_dir) / "fusion_model.pt"
            if state_path.exists():
                state = torch.load(state_path, map_location="cpu")
                self.tabular_encoder.load_state_dict(state["tabular_encoder"])
                self.graph_encoder.load_state_dict(state["graph_encoder"])
                self.fusion_model.load_state_dict(state["fusion_model"])
                self.backend = "torch-artifact"
        elif backend == "sklearn":
            model_path = Path(model_dir) / "fusion_model.pkl"
            if model_path.exists():
                with model_path.open("rb") as handle:
                    self.sklearn_fusion_model = pickle.load(handle)
                self.backend = "sklearn-artifact"

    def reload(self, explicit_model_dir: Optional[str] = None) -> Dict[str, object]:
        self._clear_loaded_artifacts()
        self._load_artifacts(explicit_model_dir)
        return self.runtime_status()

    def runtime_status(self) -> Dict[str, object]:
        return {
            "status": "ok",
            "modelName": self.model_name,
            "modelVersion": self.model_version,
            "serviceMode": self.backend,
            "teacherBackend": self.teacher_backend,
            "runtimeModelDir": self.runtime_model_dir,
            "artifactManifest": self.model_manifest,
        }

    @staticmethod
    def _sigmoid(value: float) -> float:
        return float(1.0 / (1.0 + np.exp(-value)))

    def _score_with_torch(self, fused_vector: np.ndarray, graph_vector: np.ndarray, component_vector: np.ndarray) -> tuple[float, float]:
        fused = torch.tensor(pad_vector(fused_vector, self.fused_dim), dtype=torch.float32).unsqueeze(0)
        graph = torch.tensor(pad_vector(graph_vector, 16), dtype=torch.float32).unsqueeze(0)
        components = torch.tensor([component_vector.tolist()], dtype=torch.float32)

        with torch.no_grad():
            tabular_latent = self.tabular_encoder(fused)
            graph_latent = self.graph_encoder(graph)
            risk_logit, confidence_logit = self.fusion_model(fused, tabular_latent, graph_latent, components)

        neural_score = float(torch.sigmoid(risk_logit).item())
        confidence = float(torch.sigmoid(confidence_logit).item())
        return neural_score, confidence

    def _score_with_sklearn(self, fused_vector: np.ndarray, graph_vector: np.ndarray, component_vector: np.ndarray) -> tuple[float, float]:
        if self.sklearn_fusion_model is None:
            raise RuntimeError("sklearn fusion model is not loaded")

        fused = pad_vector(fused_vector, self.fused_dim)
        graph = pad_vector(graph_vector, 16)

        teacher_probability = float(np.mean(component_vector))
        if self.teacher_model is not None:
            teacher_input = fused.reshape(1, -1)
            if hasattr(self.teacher_model, "predict_proba"):
                teacher_probability = float(self.teacher_model.predict_proba(teacher_input)[0, 1])
            elif hasattr(self.teacher_model, "decision_function"):
                teacher_probability = self._sigmoid(float(self.teacher_model.decision_function(teacher_input)[0]))

        input_vector = np.concatenate(
            [fused, graph, component_vector.astype(np.float32), np.array([teacher_probability], dtype=np.float32)],
            axis=0,
        ).reshape(1, -1)

        if hasattr(self.sklearn_fusion_model, "predict_proba"):
            probability = float(self.sklearn_fusion_model.predict_proba(input_vector)[0, 1])
        else:
            margin = float(self.sklearn_fusion_model.decision_function(input_vector)[0])
            probability = self._sigmoid(margin)

        confidence = float(np.clip(0.6 + abs(probability - 0.5) * 0.75, 0.0, 1.0))
        return probability, confidence

    def _score_with_numpy(self, fused_vector: np.ndarray, graph_vector: np.ndarray, component_vector: np.ndarray) -> tuple[float, float]:
        fused = pad_vector(fused_vector, self.fused_dim)
        graph = pad_vector(graph_vector, 16)
        fused_mean = float(np.mean(fused))
        fused_energy = float(np.mean(np.abs(fused)))
        graph_mean = float(np.mean(graph))
        graph_spread = float(np.std(graph))
        component_mean = float(np.mean(component_vector))
        component_peak = float(np.max(component_vector))

        logit = (
            0.55 * component_mean
            + 0.35 * component_peak
            + 0.18 * fused_mean
            + 0.22 * fused_energy
            + 0.12 * graph_mean
            + 0.16 * graph_spread
            - 0.42
        )
        neural_score = self._sigmoid(logit)
        confidence = float(np.clip(0.58 + abs(neural_score - 0.5) * 0.7 + graph_spread * 0.1, 0.0, 1.0))
        return neural_score, confidence

    def _severity(self, score: float) -> str:
        if score >= 0.85:
            return "critical"
        if score >= 0.65:
            return "high"
        if score >= 0.4:
            return "medium"
        return "low"

    def _action(self, request: RiskScoreRequest, score: float) -> str:
        severity = self._severity(score)
        rules = request.featureSections.ruleFeatures
        if severity == "critical" and (rules.get("walletReuseFlag") or rules.get("proofReuseFlag")):
            return "freeze_and_manual_review"
        if severity == "critical":
            return "manual_review_immediately"
        if severity == "high" and request.entityType == "transaction" and (
            rules.get("rapidWithdrawalAfterDepositFlag") or rules.get("withdrawalWalletPresentFlag")
        ):
            return "payout_hold_and_review"
        if severity == "high":
            return "queue_priority_review"
        if severity == "medium":
            return "queue_review"
        return "allow_with_monitoring"

    def score(self, request: RiskScoreRequest) -> RiskScoreResponse:
        batch = build_feature_batch(request.featureSections)
        component_scores = self.rule_calibrator.score(
            request.featureSections.ruleFeatures,
            request.featureSections.graphFeatures,
            request.featureSections.scalarFeatures,
        )
        component_vector = np.array(
            [
                component_scores["rules"],
                component_scores["behavior"],
                component_scores["graph"],
                component_scores["account"],
            ],
            dtype=np.float32,
        )

        if self.backend.startswith("torch") and TORCH_AVAILABLE:
            neural_score, confidence = self._score_with_torch(batch.fused_vector, batch.graph_vector, component_vector)
        elif self.backend == "sklearn-artifact":
            neural_score, confidence = self._score_with_sklearn(batch.fused_vector, batch.graph_vector, component_vector)
        else:
            neural_score, confidence = self._score_with_numpy(batch.fused_vector, batch.graph_vector, component_vector)

        blended_score = float(
            np.clip(
                component_scores["rules"] * 0.34
                + component_scores["behavior"] * 0.24
                + component_scores["graph"] * 0.27
                + component_scores["account"] * 0.15
                + (neural_score - 0.5) * 0.2,
                0.0,
                1.0,
            )
        )
        severity = self._severity(blended_score)
        action = self._action(request, blended_score)

        top_signals: List[TopSignal] = [
            TopSignal(
                key="sharedProofTransactions",
                value=request.featureSections.graphFeatures.get("sharedProofTransactions", 0.0),
                weight=float(component_scores["graph"]),
                section="graph",
            ),
            TopSignal(
                key="sharedWalletUsers",
                value=request.featureSections.graphFeatures.get("sharedWalletUsers", 0.0),
                weight=float(component_scores["graph"] * 0.9),
                section="graph",
            ),
            TopSignal(
                key="entityAmountZScore",
                value=request.featureSections.scalarFeatures.get("entityAmountZScore", 0.0),
                weight=float(component_scores["behavior"] * 0.85),
                section="behavior",
            ),
            TopSignal(
                key="negativeBalanceFlag",
                value=request.featureSections.ruleFeatures.get("negativeBalanceFlag", False),
                weight=float(component_scores["account"] * 0.9),
                section="account",
            ),
            TopSignal(
                key="proofReuseFlag",
                value=request.featureSections.ruleFeatures.get("proofReuseFlag", False),
                weight=float(component_scores["rules"]),
                section="rules",
            ),
        ]

        return RiskScoreResponse(
            modelFamily="fusion",
            modelName="captiv8-neural-fusion",
            modelVersion="0.1.0",
            ensembleVersion="distilled-fusion-v1",
            riskScore=blended_score,
            severity=severity,
            confidence=float(np.clip(0.55 + confidence * 0.4 + abs(blended_score - 0.5) * 0.15, 0.0, 1.0)),
            recommendedAction=action,
            explanation=Explanation(
                summary=f"{request.entityType} {request.entityId} scored {severity.upper()} ({blended_score:.3f}) with {action}.",
                topSignals=top_signals,
                metadata={
                    "service_mode": self.backend,
                    "requested_entity_type": request.entityType,
                },
            ),
            componentScores={key: float(value) for key, value in component_scores.items()},
            ruleSignals=request.featureSections.ruleFeatures,
            graphSignals=request.featureSections.graphFeatures,
            featureSections=request.featureSections,
        )


app = FastAPI(title="Captiv8 Risk Service", version="0.1.0")
service = HybridRiskService()


@app.get("/healthz")
def healthz():
    runtime = service.runtime_status()
    return {
        **runtime,
        "model_name": runtime["modelName"],
        "model_version": runtime["modelVersion"],
        "service_mode": runtime["serviceMode"],
        "teacher_backend": runtime["teacherBackend"],
    }


@app.get("/runtime", response_model=RuntimeStatusResponse)
def runtime_status():
    return service.runtime_status()


@app.post("/reload-model", response_model=RuntimeStatusResponse)
def reload_model(request: RuntimeReloadRequest):
    return service.reload(request.modelDir)


@app.post("/score", response_model=RiskScoreResponse)
def score_risk(request: RiskScoreRequest):
    return service.score(request)


@app.post("/train", response_model=TrainingJobResponse)
def train_model(request: TrainingJobRequest):
    metrics, artifacts = train_from_dataset(request)
    return TrainingJobResponse(
        status="completed",
        metrics=metrics,
        artifacts=artifacts,
    )
