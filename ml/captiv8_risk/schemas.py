from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class FeatureSections(BaseModel):
    scalarFeatures: Dict[str, float] = Field(default_factory=dict)
    ruleFeatures: Dict[str, Any] = Field(default_factory=dict)
    graphFeatures: Dict[str, float] = Field(default_factory=dict)
    sequenceFeatures: Dict[str, List[float]] = Field(default_factory=dict)
    embeddingFeatures: Dict[str, List[float]] = Field(default_factory=dict)
    labels: Dict[str, Any] = Field(default_factory=dict)


class RiskScoreRequest(BaseModel):
    entityType: Literal["profile", "transaction", "user_task"]
    entityId: str
    userId: Optional[str] = None
    featureSections: FeatureSections
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TopSignal(BaseModel):
    key: str
    value: Any
    weight: float
    section: Literal["rules", "graph", "behavior", "account"]


class Explanation(BaseModel):
    summary: str
    topSignals: List[TopSignal] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RiskScoreResponse(BaseModel):
    modelFamily: str
    modelName: str
    modelVersion: str
    ensembleVersion: Optional[str] = None
    riskScore: float
    severity: Literal["low", "medium", "high", "critical"]
    confidence: float
    recommendedAction: str
    explanation: Explanation
    componentScores: Dict[str, float] = Field(default_factory=dict)
    ruleSignals: Dict[str, Any] = Field(default_factory=dict)
    graphSignals: Dict[str, float] = Field(default_factory=dict)
    featureSections: FeatureSections


class TrainingJobRequest(BaseModel):
    datasetPath: str
    outputDir: str
    epochs: int = 50
    learningRate: float = 1e-3
    randomSeed: int = 7


class TrainingJobResponse(BaseModel):
    status: str
    metrics: Dict[str, float] = Field(default_factory=dict)
    artifacts: Dict[str, str] = Field(default_factory=dict)


class RuntimeReloadRequest(BaseModel):
    modelDir: Optional[str] = None


class RuntimeStatusResponse(BaseModel):
    status: str
    modelName: str
    modelVersion: str
    serviceMode: str
    teacherBackend: Optional[str] = None
    runtimeModelDir: Optional[str] = None
    artifactManifest: Dict[str, Any] = Field(default_factory=dict)
