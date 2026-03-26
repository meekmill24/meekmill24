from captiv8_risk.features import build_feature_batch, pad_vector
from captiv8_risk.schemas import FeatureSections


def test_build_feature_batch_shapes():
    sections = FeatureSections(
        scalarFeatures={"a": 1.0, "b": 2.0},
        ruleFeatures={"flagA": True, "flagB": False},
        graphFeatures={"sharedWalletUsers": 3.0},
        sequenceFeatures={"recentTransactionAmounts": [10.0, 20.0, 30.0]},
        embeddingFeatures={"tabularLatent": [0.1, 0.2], "graphLatent": [0.3]},
    )

    batch = build_feature_batch(sections)

    assert batch.scalar_vector.shape[0] == 2
    assert batch.graph_vector.shape[0] == 1
    assert batch.rule_vector.shape[0] == 2
    assert batch.fused_vector.shape[0] >= 9


def test_pad_vector_extends_width():
    padded = pad_vector(__import__("numpy").array([1.0, 2.0], dtype="float32"), 5)
    assert padded.shape[0] == 5
    assert padded[0] == 1.0
    assert padded[1] == 2.0
