from __future__ import annotations

import argparse
import json
import pickle
from pathlib import Path
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

from captiv8_risk.features import stack_vectors
from captiv8_risk.models.rules import RuleCalibrator
from captiv8_risk.schemas import FeatureSections, TrainingJobRequest

try:
    import torch
    from torch import nn
    from torch.optim import AdamW
    from captiv8_risk.models import FusionRiskModel, GraphSignalEncoder, TabularEncoder

    TORCH_AVAILABLE = True
except Exception:  # pragma: no cover - exercised by fallback training tests
    torch = None
    nn = None
    AdamW = None
    FusionRiskModel = None
    GraphSignalEncoder = None
    TabularEncoder = None
    TORCH_AVAILABLE = False

try:
    from xgboost import XGBClassifier

    XGBOOST_AVAILABLE = True
except Exception:  # pragma: no cover - exercised by fallback training tests
    XGBClassifier = None
    XGBOOST_AVAILABLE = False

from sklearn.neural_network import MLPClassifier


def _safe_auc(labels: np.ndarray, scores: np.ndarray) -> float:
    if len(labels) < 2 or len(np.unique(labels)) < 2:
        return 0.5

    return float(roc_auc_score(labels, scores))


def _split_indices(labels: np.ndarray, random_seed: int) -> tuple[np.ndarray, np.ndarray]:
    indices = np.arange(len(labels))
    unique, counts = np.unique(labels, return_counts=True)
    if len(indices) < 8 or len(unique) < 2 or np.min(counts) < 2:
        return indices, indices

    train_idx, validation_idx = train_test_split(
        indices,
        test_size=max(0.25, min(0.4, 4 / len(indices))),
        stratify=labels,
        random_state=random_seed,
    )
    return np.asarray(train_idx), np.asarray(validation_idx)


def _load_dataset(dataset_path: str) -> pd.DataFrame:
    path = Path(dataset_path)
    if path.suffix == ".jsonl":
        return pd.read_json(path, lines=True)
    if path.suffix == ".json":
        return pd.read_json(path)
    return pd.read_csv(path)


def _sections_from_frame(frame: pd.DataFrame):
    for _, row in frame.iterrows():
        yield FeatureSections.model_validate(row["featureSections"])


def _build_teacher(request: TrainingJobRequest):
    if XGBOOST_AVAILABLE:
        return (
            XGBClassifier(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.08,
                subsample=0.9,
                colsample_bytree=0.9,
                objective="binary:logistic",
                eval_metric="logloss",
                random_state=request.randomSeed,
            ),
            "xgboost",
        )

    return (
        HistGradientBoostingClassifier(
            learning_rate=0.08,
            max_depth=4,
            max_iter=120,
            random_state=request.randomSeed,
        ),
        "hist-gradient-boosting",
    )


def _build_component_matrix(sections: list[FeatureSections]) -> np.ndarray:
    calibrator = RuleCalibrator()
    component_rows = []

    for section in sections:
        scores = calibrator.score(section.ruleFeatures, section.graphFeatures, section.scalarFeatures)
        component_rows.append(
            [
                scores["rules"],
                scores["behavior"],
                scores["graph"],
                scores["account"],
            ]
        )

    return np.asarray(component_rows, dtype=np.float32)


def _train_torch_fusion(
    request: TrainingJobRequest,
    train_fused: np.ndarray,
    validation_fused: np.ndarray,
    train_graph: np.ndarray,
    validation_graph: np.ndarray,
    train_components: np.ndarray,
    validation_components: np.ndarray,
    train_labels: np.ndarray,
    validation_labels: np.ndarray,
    train_teacher_probs: np.ndarray,
    validation_teacher_probs: np.ndarray,
    output_dir: Path,
) -> tuple[Dict[str, float], Dict[str, str], Dict[str, str]]:
    fused = torch.tensor(train_fused, dtype=torch.float32)
    graph = torch.tensor(train_graph, dtype=torch.float32)
    components = torch.tensor(train_components, dtype=torch.float32)
    targets = torch.tensor(train_labels.astype(np.float32))
    teacher_targets = torch.tensor(train_teacher_probs)

    tabular_encoder = TabularEncoder(input_dim=64, latent_dim=16)
    graph_encoder = GraphSignalEncoder(input_dim=16, latent_dim=8)
    fusion_model = FusionRiskModel(fused_input_dim=64, tabular_dim=16, graph_dim=8)

    optimizer = AdamW(
        list(tabular_encoder.parameters()) + list(graph_encoder.parameters()) + list(fusion_model.parameters()),
        lr=request.learningRate,
    )
    bce = nn.BCEWithLogitsLoss()
    mse = nn.MSELoss()

    for _ in range(request.epochs):
        optimizer.zero_grad()
        tabular_latent = tabular_encoder(fused)
        graph_latent = graph_encoder(graph)
        risk_logit, confidence_logit = fusion_model(fused, tabular_latent, graph_latent, components)
        loss = bce(risk_logit, targets) + mse(torch.sigmoid(risk_logit), teacher_targets) + 0.2 * mse(torch.sigmoid(confidence_logit), teacher_targets)
        loss.backward()
        optimizer.step()

    with torch.no_grad():
        train_tabular_latent = tabular_encoder(fused)
        train_graph_latent = graph_encoder(graph)
        train_risk_logit, _ = fusion_model(fused, train_tabular_latent, train_graph_latent, components)
        train_probs = torch.sigmoid(train_risk_logit).cpu().numpy()

        validation_fused_tensor = torch.tensor(validation_fused, dtype=torch.float32)
        validation_graph_tensor = torch.tensor(validation_graph, dtype=torch.float32)
        validation_component_tensor = torch.tensor(validation_components, dtype=torch.float32)
        validation_tabular_latent = tabular_encoder(validation_fused_tensor)
        validation_graph_latent = graph_encoder(validation_graph_tensor)
        validation_risk_logit, _ = fusion_model(
            validation_fused_tensor,
            validation_tabular_latent,
            validation_graph_latent,
            validation_component_tensor,
        )
        validation_probs = torch.sigmoid(validation_risk_logit).cpu().numpy()

    torch.save(
        {
            "tabular_encoder": tabular_encoder.state_dict(),
            "graph_encoder": graph_encoder.state_dict(),
            "fusion_model": fusion_model.state_dict(),
        },
        output_dir / "fusion_model.pt",
    )

    metrics = {
        "teacher_train_auc": _safe_auc(train_labels, train_teacher_probs),
        "teacher_validation_auc": _safe_auc(validation_labels, validation_teacher_probs),
        "fusion_train_auc": _safe_auc(train_labels, train_probs),
        "fusion_validation_auc": _safe_auc(validation_labels, validation_probs),
        "fusion_auc": _safe_auc(validation_labels, validation_probs),
        "train_rows": float(len(train_labels)),
        "validation_rows": float(len(validation_labels)),
        "rows": float(len(train_labels) + len(validation_labels)),
    }
    artifacts = {"fusion_model": str(output_dir / "fusion_model.pt")}
    manifest = {
        "backend": "torch",
        "model_name": "captiv8-neural-fusion",
        "model_version": "0.1.0",
    }
    return metrics, artifacts, manifest


def _train_sklearn_fusion(
    request: TrainingJobRequest,
    train_fused: np.ndarray,
    validation_fused: np.ndarray,
    train_graph: np.ndarray,
    validation_graph: np.ndarray,
    train_components: np.ndarray,
    validation_components: np.ndarray,
    train_labels: np.ndarray,
    validation_labels: np.ndarray,
    train_teacher_probs: np.ndarray,
    validation_teacher_probs: np.ndarray,
    output_dir: Path,
) -> tuple[Dict[str, float], Dict[str, str], Dict[str, str]]:
    train_inputs = np.concatenate(
        [
            train_fused,
            train_graph,
            train_components,
            train_teacher_probs.reshape(-1, 1),
        ],
        axis=1,
    )
    validation_inputs = np.concatenate(
        [
            validation_fused,
            validation_graph,
            validation_components,
            validation_teacher_probs.reshape(-1, 1),
        ],
        axis=1,
    )

    fusion_model = MLPClassifier(
        hidden_layer_sizes=(48, 24),
        activation="relu",
        solver="lbfgs",
        learning_rate_init=request.learningRate,
        max_iter=max(300, request.epochs * 40),
        random_state=request.randomSeed,
    )
    fusion_model.fit(train_inputs, train_labels)
    train_probs = fusion_model.predict_proba(train_inputs)[:, 1]
    validation_probs = fusion_model.predict_proba(validation_inputs)[:, 1]

    with (output_dir / "fusion_model.pkl").open("wb") as handle:
        pickle.dump(fusion_model, handle)

    metrics = {
        "teacher_train_auc": _safe_auc(train_labels, train_teacher_probs),
        "teacher_validation_auc": _safe_auc(validation_labels, validation_teacher_probs),
        "fusion_train_auc": _safe_auc(train_labels, train_probs),
        "fusion_validation_auc": _safe_auc(validation_labels, validation_probs),
        "fusion_auc": _safe_auc(validation_labels, validation_probs),
        "train_rows": float(len(train_labels)),
        "validation_rows": float(len(validation_labels)),
        "rows": float(len(train_labels) + len(validation_labels)),
    }
    artifacts = {"fusion_model": str(output_dir / "fusion_model.pkl")}
    manifest = {
        "backend": "sklearn",
        "model_name": "captiv8-neural-fusion",
        "model_version": "0.1.0",
    }
    return metrics, artifacts, manifest


def train_from_dataset(request: TrainingJobRequest) -> Tuple[Dict[str, float], Dict[str, str]]:
    dataset = _load_dataset(request.datasetPath)
    sections = list(_sections_from_frame(dataset))
    labels = dataset["label"].astype(int).to_numpy()
    component_matrix = _build_component_matrix(sections)

    fused_vectors = stack_vectors(
        [__import__("captiv8_risk.features", fromlist=["build_feature_batch"]).build_feature_batch(section).fused_vector for section in sections],
        width=64,
    )
    graph_vectors = stack_vectors(
        [__import__("captiv8_risk.features", fromlist=["build_feature_batch"]).build_feature_batch(section).graph_vector for section in sections],
        width=16,
    )

    teacher, teacher_backend = _build_teacher(request)
    train_idx, validation_idx = _split_indices(labels, request.randomSeed)
    train_fused = fused_vectors[train_idx]
    validation_fused = fused_vectors[validation_idx]
    train_graph = graph_vectors[train_idx]
    validation_graph = graph_vectors[validation_idx]
    train_components = component_matrix[train_idx]
    validation_components = component_matrix[validation_idx]
    train_labels = labels[train_idx]
    validation_labels = labels[validation_idx]

    teacher.fit(train_fused, train_labels)
    train_teacher_probs = teacher.predict_proba(train_fused)[:, 1].astype(np.float32)
    validation_teacher_probs = teacher.predict_proba(validation_fused)[:, 1].astype(np.float32)

    output_dir = Path(request.outputDir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if TORCH_AVAILABLE:
        metrics, artifacts, manifest = _train_torch_fusion(
            request=request,
            train_fused=train_fused,
            validation_fused=validation_fused,
            train_graph=train_graph,
            validation_graph=validation_graph,
            train_components=train_components,
            validation_components=validation_components,
            train_labels=train_labels,
            validation_labels=validation_labels,
            train_teacher_probs=train_teacher_probs,
            validation_teacher_probs=validation_teacher_probs,
            output_dir=output_dir,
        )
    else:
        metrics, artifacts, manifest = _train_sklearn_fusion(
            request=request,
            train_fused=train_fused,
            validation_fused=validation_fused,
            train_graph=train_graph,
            validation_graph=validation_graph,
            train_components=train_components,
            validation_components=validation_components,
            train_labels=train_labels,
            validation_labels=validation_labels,
            train_teacher_probs=train_teacher_probs,
            validation_teacher_probs=validation_teacher_probs,
            output_dir=output_dir,
        )

    if XGBOOST_AVAILABLE and teacher_backend == "xgboost":
        teacher_path = output_dir / "teacher_model.json"
        teacher.save_model(teacher_path)
    else:
        teacher_path = output_dir / "teacher_model.pkl"
        with teacher_path.open("wb") as handle:
            pickle.dump(teacher, handle)
    artifacts["teacher_model"] = str(teacher_path)

    with (output_dir / "metrics.json").open("w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2)
    artifacts["metrics"] = str(output_dir / "metrics.json")

    manifest["teacher_backend"] = teacher_backend
    manifest["training_rows"] = int(len(train_labels))
    manifest["validation_rows"] = int(len(validation_labels))
    metrics["rows"] = float(len(labels))
    with (output_dir / "manifest.json").open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
    artifacts["manifest"] = str(output_dir / "manifest.json")

    return metrics, artifacts


def main():
    parser = argparse.ArgumentParser(description="Train the Captiv8 risk fusion model locally.")
    parser.add_argument("--dataset-path", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--random-seed", type=int, default=7)
    args = parser.parse_args()

    metrics, artifacts = train_from_dataset(
        TrainingJobRequest(
            datasetPath=args.dataset_path,
            outputDir=args.output_dir,
            epochs=args.epochs,
            learningRate=args.learning_rate,
            randomSeed=args.random_seed,
        )
    )

    print(
        json.dumps(
            {
                "status": "completed",
                "metrics": metrics,
                "artifacts": artifacts,
            }
        )
    )


if __name__ == "__main__":
    main()
