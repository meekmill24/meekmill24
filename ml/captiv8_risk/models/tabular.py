from __future__ import annotations

import torch
from torch import nn


class TabularEncoder(nn.Module):
    def __init__(self, input_dim: int, latent_dim: int = 16) -> None:
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.LayerNorm(32),
            nn.GELU(),
            nn.Linear(32, latent_dim),
            nn.Tanh(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.layers(x)
