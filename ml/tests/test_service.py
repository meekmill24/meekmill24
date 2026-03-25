import json
from pathlib import Path

from fastapi.testclient import TestClient

from captiv8_risk.schemas import RiskScoreRequest, TrainingJobRequest
from captiv8_risk.service import MODEL_DIR_ENV, HybridRiskService, app
from captiv8_risk.train import train_from_dataset


client = TestClient(app)


def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["model_name"] == "captiv8-neural-fusion"
    assert payload["service_mode"] in {"numpy-fallback", "torch-seeded", "torch-artifact", "sklearn-artifact"}
    assert "teacher_backend" in payload


def test_score_endpoint_returns_risk_response():
    payload = {
        "entityType": "transaction",
        "entityId": "42",
        "userId": "user-1",
        "featureSections": {
            "scalarFeatures": {
                "entityAmountZScore": 3.4,
                "pendingTransactionCount": 4,
                "rejectedTransactionCount": 2,
                "taskCount24h": 7,
                "profileNegativeBalance": 1,
                "freezeBalance": 120,
            },
            "ruleFeatures": {
                "proofReuseFlag": True,
                "walletReuseFlag": True,
                "rapidWithdrawalAfterDepositFlag": True,
            },
            "graphFeatures": {
                "sharedWalletUsers": 3,
                "sharedProofTransactions": 2,
                "referralChildrenCount": 4,
                "openCaseCount": 1,
            },
            "sequenceFeatures": {
                "recentTransactionAmounts": [90, 110, 140],
            },
            "embeddingFeatures": {
                "tabularLatent": [0.2, 0.8, 0.9],
                "graphLatent": [0.7, 0.4, 0.9],
            },
        },
        "metadata": {},
    }

    response = client.post("/score", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["severity"] in {"medium", "high", "critical"}
    assert body["riskScore"] >= 0.4
    assert body["componentScores"]["rules"] > 0.2
    assert body["explanation"]["metadata"]["service_mode"] in {"numpy-fallback", "torch-seeded", "torch-artifact", "sklearn-artifact"}


def test_service_loads_persisted_artifact_backend(tmp_path: Path, monkeypatch):
    dataset_path = tmp_path / "training.jsonl"
    rows = [
        {
            "featureSections": {
                "scalarFeatures": {"entityAmountZScore": 3.2, "pendingTransactionCount": 4},
                "ruleFeatures": {"proofReuseFlag": True, "walletReuseFlag": True},
                "graphFeatures": {"sharedWalletUsers": 3.0, "sharedProofTransactions": 2.0},
                "sequenceFeatures": {"recentTransactionAmounts": [100.0, 110.0, 130.0]},
                "embeddingFeatures": {"tabularLatent": [0.2, 0.8], "graphLatent": [0.6]},
            },
            "label": 1,
        },
        {
            "featureSections": {
                "scalarFeatures": {"entityAmountZScore": 0.2, "pendingTransactionCount": 0},
                "ruleFeatures": {"proofReuseFlag": False, "walletReuseFlag": False},
                "graphFeatures": {"sharedWalletUsers": 0.0, "sharedProofTransactions": 0.0},
                "sequenceFeatures": {"recentTransactionAmounts": [20.0, 25.0, 30.0]},
                "embeddingFeatures": {"tabularLatent": [0.1, 0.2], "graphLatent": [0.1]},
            },
            "label": 0,
        },
        {
            "featureSections": {
                "scalarFeatures": {"entityAmountZScore": 2.8, "pendingTransactionCount": 3},
                "ruleFeatures": {"proofReuseFlag": True, "walletReuseFlag": False},
                "graphFeatures": {"sharedWalletUsers": 2.0, "sharedProofTransactions": 1.0},
                "sequenceFeatures": {"recentTransactionAmounts": [70.0, 75.0, 90.0]},
                "embeddingFeatures": {"tabularLatent": [0.4, 0.7], "graphLatent": [0.3]},
            },
            "label": 1,
        },
        {
            "featureSections": {
                "scalarFeatures": {"entityAmountZScore": 0.1, "pendingTransactionCount": 1},
                "ruleFeatures": {"proofReuseFlag": False, "walletReuseFlag": False},
                "graphFeatures": {"sharedWalletUsers": 0.0, "sharedProofTransactions": 0.0},
                "sequenceFeatures": {"recentTransactionAmounts": [18.0, 22.0, 24.0]},
                "embeddingFeatures": {"tabularLatent": [0.05, 0.1], "graphLatent": [0.05]},
            },
            "label": 0,
        },
    ]
    with dataset_path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row) + "\n")

    output_dir = tmp_path / "artifacts"
    train_from_dataset(
        TrainingJobRequest(
            datasetPath=str(dataset_path),
            outputDir=str(output_dir),
            epochs=4,
            learningRate=1e-3,
            randomSeed=7,
        )
    )

    monkeypatch.setenv(MODEL_DIR_ENV, str(output_dir))
    service = HybridRiskService()
    request = RiskScoreRequest.model_validate(
        {
            "entityType": "transaction",
            "entityId": "reload-42",
            "userId": "user-1",
            "featureSections": {
                "scalarFeatures": {
                    "entityAmountZScore": 3.4,
                    "pendingTransactionCount": 4,
                    "rejectedTransactionCount": 2,
                    "taskCount24h": 7,
                },
                "ruleFeatures": {
                    "proofReuseFlag": True,
                    "walletReuseFlag": True,
                    "rapidWithdrawalAfterDepositFlag": True,
                },
                "graphFeatures": {
                    "sharedWalletUsers": 3,
                    "sharedProofTransactions": 2,
                    "referralChildrenCount": 4,
                },
                "sequenceFeatures": {
                    "recentTransactionAmounts": [90, 110, 140],
                },
                "embeddingFeatures": {
                    "tabularLatent": [0.2, 0.8, 0.9],
                    "graphLatent": [0.7, 0.4, 0.9],
                },
            },
            "metadata": {},
        }
    )

    result = service.score(request)
    assert service.backend in {"sklearn-artifact", "torch-artifact"}
    assert result.riskScore >= 0.4


def test_runtime_reload_endpoint_activates_artifact_backend(tmp_path: Path):
    dataset_path = tmp_path / "training.jsonl"
    rows = [
        {
            "featureSections": {
                "scalarFeatures": {"entityAmountZScore": 3.2, "pendingTransactionCount": 4},
                "ruleFeatures": {"proofReuseFlag": True, "walletReuseFlag": True},
                "graphFeatures": {"sharedWalletUsers": 3.0, "sharedProofTransactions": 2.0},
                "sequenceFeatures": {"recentTransactionAmounts": [100.0, 110.0, 130.0]},
                "embeddingFeatures": {"tabularLatent": [0.2, 0.8], "graphLatent": [0.6]},
            },
            "label": 1,
        },
        {
            "featureSections": {
                "scalarFeatures": {"entityAmountZScore": 0.2, "pendingTransactionCount": 0},
                "ruleFeatures": {"proofReuseFlag": False, "walletReuseFlag": False},
                "graphFeatures": {"sharedWalletUsers": 0.0, "sharedProofTransactions": 0.0},
                "sequenceFeatures": {"recentTransactionAmounts": [20.0, 25.0, 30.0]},
                "embeddingFeatures": {"tabularLatent": [0.1, 0.2], "graphLatent": [0.1]},
            },
            "label": 0,
        },
    ]
    with dataset_path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row) + "\n")

    output_dir = tmp_path / "runtime-artifacts"
    train_from_dataset(
        TrainingJobRequest(
            datasetPath=str(dataset_path),
            outputDir=str(output_dir),
            epochs=4,
            learningRate=1e-3,
            randomSeed=7,
        )
    )

    reload_response = client.post("/reload-model", json={"modelDir": str(output_dir)})
    assert reload_response.status_code == 200
    reload_payload = reload_response.json()
    assert reload_payload["serviceMode"] in {"sklearn-artifact", "torch-artifact"}
    assert reload_payload["runtimeModelDir"] == str(output_dir)
    assert reload_payload["artifactManifest"]["model_name"] == "captiv8-neural-fusion"
    assert reload_payload["teacherBackend"] in {"xgboost", "hist-gradient-boosting"}

    runtime_response = client.get("/runtime")
    assert runtime_response.status_code == 200
    runtime_payload = runtime_response.json()
    assert runtime_payload["serviceMode"] in {"sklearn-artifact", "torch-artifact"}
    assert runtime_payload["runtimeModelDir"] == str(output_dir)
    assert runtime_payload["teacherBackend"] in {"xgboost", "hist-gradient-boosting"}
