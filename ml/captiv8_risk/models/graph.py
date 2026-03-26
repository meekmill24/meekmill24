from __future__ import annotations

import torch
from torch import nn


class GraphSignalEncoder(nn.Module):
    """
    Online inference receives graph-derived features rather than the full live graph,
    so this encoder projects ring / neighborhood signals into a differentiable latent.
    Offline challenger training can swap this for a full message-passing implementation
    while preserving the same latent interface into the fusion head.
    """

    def __init__(self, input_dim: int, latent_dim: int = 8) -> None:
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, latent_dim),
            nn.Tanh(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.layers(x)
