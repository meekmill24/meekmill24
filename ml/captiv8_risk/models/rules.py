from __future__ import annotations

from typing import Dict


class RuleCalibrator:
    def __init__(self) -> None:
        self.rule_weights = {
            "proofReuseFlag": 0.28,
            "walletReuseFlag": 0.26,
            "rapidWithdrawalAfterDepositFlag": 0.16,
            "highAmountSpikeFlag": 0.12,
            "newAccountHighAmountFlag": 0.12,
            "pendingBurstFlag": 0.08,
            "referralClusterFlag": 0.08,
            "caseRecurrenceFlag": 0.08,
            "highVelocityTaskingFlag": 0.08,
            "negativeBalanceFlag": 0.08,
            "bundleDeficitFlag": 0.07,
        }

    def score(self, rule_features: Dict[str, object], graph_features: Dict[str, float], scalar_features: Dict[str, float]) -> Dict[str, float]:
        rules_score = 0.0
        for key, weight in self.rule_weights.items():
            if rule_features.get(key):
                rules_score += weight

        graph_score = min(
            1.0,
            (graph_features.get("sharedWalletUsers", 0.0) / 4.0) * 0.45
            + (graph_features.get("sharedProofTransactions", 0.0) / 3.0) * 0.4
            + (graph_features.get("referralChildrenCount", 0.0) / 8.0) * 0.15
            + (graph_features.get("openCaseCount", 0.0) / 3.0) * 0.2,
        )

        behavior_score = min(
            1.0,
            (scalar_features.get("entityAmountZScore", 0.0) / 4.0) * 0.25
            + (scalar_features.get("pendingTransactionCount", 0.0) / 5.0) * 0.35
            + (scalar_features.get("rejectedTransactionCount", 0.0) / 4.0) * 0.2
            + (scalar_features.get("taskCount24h", 0.0) / 10.0) * 0.2,
        )

        account_score = min(
            1.0,
            scalar_features.get("profileNegativeBalance", 0.0) * 0.45
            + scalar_features.get("hasPendingBundle", 0.0) * 0.15
            + scalar_features.get("recentPredictionScore", 0.0) * 0.2
            + min(scalar_features.get("freezeBalance", 0.0) / 200.0, 1.0) * 0.15,
        )

        return {
            "rules": min(rules_score, 1.0),
            "graph": min(graph_score, 1.0),
            "behavior": min(behavior_score, 1.0),
            "account": min(account_score, 1.0),
        }
