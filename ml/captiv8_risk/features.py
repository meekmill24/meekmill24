from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Tuple

import numpy as np

from captiv8_risk.schemas import FeatureSections


@dataclass
class PreparedFeatureBatch:
    scalar_vector: np.ndarray
    graph_vector: np.ndarray
    rule_vector: np.ndarray
    fused_vector: np.ndarray


def _normalize_scalar(value: float, scale: float) -> float:
    if scale == 0:
        return 0.0
    return float(np.clip(value / scale, -5.0, 5.0))


def _sorted_items(values: Dict[str, float]) -> List[Tuple[str, float]]:
    return sorted(values.items(), key=lambda item: item[0])


def _rule_to_numeric(value) -> float:
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    if isinstance(value, (int, float)):
        return float(value)
    if value is None:
        return 0.0
    return 1.0


def build_feature_batch(sections: FeatureSections) -> PreparedFeatureBatch:
    scalar_values = [float(value) for _, value in _sorted_items(sections.scalarFeatures)]
    graph_values = [float(value) for _, value in _sorted_items(sections.graphFeatures)]
    rule_values = [_rule_to_numeric(value) for _, value in sorted(sections.ruleFeatures.items(), key=lambda item: item[0])]

    scalar_vector = np.array(
        [_normalize_scalar(value, max(abs(value), 1.0) if abs(value) < 1.0 else max(abs(value), 10.0)) for value in scalar_values],
        dtype=np.float32,
    )
    graph_vector = np.array([_normalize_scalar(value, max(abs(value), 1.0) + 1.0) for value in graph_values], dtype=np.float32)
    rule_vector = np.array(rule_values, dtype=np.float32)

    fused_features: List[float] = []
    fused_features.extend(scalar_vector.tolist())
    fused_features.extend(graph_vector.tolist())
    fused_features.extend(rule_vector.tolist())

    for _, values in sorted(sections.embeddingFeatures.items(), key=lambda item: item[0]):
        fused_features.extend([float(value) for value in values])

    for _, values in sorted(sections.sequenceFeatures.items(), key=lambda item: item[0]):
        if not values:
            fused_features.extend([0.0, 0.0, 0.0])
            continue

        arr = np.array(values, dtype=np.float32)
        fused_features.extend([
            float(np.mean(arr)),
            float(np.max(arr)),
            float(arr[0]),
        ])

    return PreparedFeatureBatch(
        scalar_vector=scalar_vector,
        graph_vector=graph_vector,
        rule_vector=rule_vector,
        fused_vector=np.array(fused_features, dtype=np.float32),
    )


def pad_vector(vector: np.ndarray, width: int) -> np.ndarray:
    if len(vector) >= width:
        return vector[:width]

    pad = np.zeros(width - len(vector), dtype=np.float32)
    return np.concatenate([vector, pad], axis=0)


def stack_vectors(vectors: Iterable[np.ndarray], width: int) -> np.ndarray:
    return np.stack([pad_vector(vector, width) for vector in vectors], axis=0)
