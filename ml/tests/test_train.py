import json
from pathlib import Path

from captiv8_risk.train import train_from_dataset
from captiv8_risk.schemas import TrainingJobRequest


def test_train_from_dataset_writes_artifacts(tmp_path: Path):
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
                "scalarFeatures": {"entityAmountZScore": 2.6, "pendingTransactionCount": 2},
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
    metrics, artifacts = train_from_dataset(
        TrainingJobRequest(
            datasetPath=str(dataset_path),
            outputDir=str(output_dir),
            epochs=4,
            learningRate=1e-3,
            randomSeed=7,
        )
    )

    assert metrics["rows"] == 4.0
    assert metrics["fusion_validation_auc"] >= 0.5
    assert metrics["teacher_validation_auc"] >= 0.5
    assert "fusion_model" in artifacts
    assert "teacher_model" in artifacts
    assert "manifest" in artifacts
    assert (output_dir / "metrics.json").exists()
    assert Path(artifacts["teacher_model"]).exists()

    manifest = json.loads((output_dir / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["model_name"] == "captiv8-neural-fusion"
    assert manifest["backend"] in {"torch", "sklearn"}
    assert manifest["validation_rows"] >= 1
