from __future__ import annotations

import torch
from torch import nn


class FusionRiskModel(nn.Module):
    def __init__(self, fused_input_dim: int, tabular_dim: int, graph_dim: int) -> None:
        super().__init__()
        hidden_dim = 32
        self.classifier = nn.Sequential(
            nn.Linear(fused_input_dim + tabular_dim + graph_dim + 4, hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.GELU(),
            nn.Linear(hidden_dim // 2, 2),
        )

    def forward(
        self,
        fused_features: torch.Tensor,
        tabular_latent: torch.Tensor,
        graph_latent: torch.Tensor,
        component_scores: torch.Tensor,
    ) -> tuple[torch.Tensor, torch.Tensor]:
        logits = self.classifier(torch.cat([fused_features, tabular_latent, graph_latent, component_scores], dim=-1))
        risk_logit = logits[..., 0]
        confidence_logit = logits[..., 1]
        return risk_logit, confidence_logit
