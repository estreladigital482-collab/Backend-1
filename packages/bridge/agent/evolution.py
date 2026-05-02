"""
Agent Evolution - Controle de versões candidatas e comparação de qualidade.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parents[1]
EVOLUTION_DIR = BASE_DIR / "data" / "versions"
EVOLUTION_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class AgentVersion:
    version_id: str
    description: str
    created_at: str
    metrics: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "version_id": self.version_id,
            "description": self.description,
            "created_at": self.created_at,
            "metrics": self.metrics,
            "metadata": self.metadata,
        }


class EvolutionManager:
    """Gerencia versões candidatas de evolução do agente."""

    def __init__(self, versions_dir: Optional[Path] = None):
        self.versions_dir = versions_dir or EVOLUTION_DIR
        self.versions_file = self.versions_dir / "versions.json"
        self.versions: List[AgentVersion] = []
        self._load()

    def _load(self) -> None:
        if self.versions_file.exists():
            try:
                data = json.loads(self.versions_file.read_text(encoding="utf-8"))
                self.versions = [AgentVersion(**item) for item in data]
            except Exception:
                self.versions = []

    def _persist(self) -> None:
        self.versions_file.write_text(
            json.dumps([version.to_dict() for version in self.versions], ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

    def add_version(self, description: str, metrics: Optional[Dict[str, Any]] = None,
                    metadata: Optional[Dict[str, Any]] = None) -> AgentVersion:
        version = AgentVersion(
            version_id=f"v{len(self.versions) + 1}",
            description=description,
            created_at=datetime.now().isoformat(),
            metrics=metrics or {},
            metadata=metadata or {}
        )
        self.versions.append(version)
        self._persist()
        return version

    def list_versions(self, limit: int = 20) -> List[AgentVersion]:
        return self.versions[-limit:]

    def score_version(self, version: AgentVersion) -> float:
        metrics = version.metrics
        base_score = float(metrics.get("quality_score", 0))
        stability = float(metrics.get("stability", 0))
        security = float(metrics.get("security", 0))
        errors = float(metrics.get("errors", 0))
        return base_score + stability * 0.5 + security * 0.7 - errors * 1.0

    def choose_best_version(self) -> Optional[AgentVersion]:
        if not self.versions:
            return None
        best = max(self.versions, key=self.score_version)
        return best

    def compare_versions(self, version_a: AgentVersion, version_b: AgentVersion) -> Dict[str, Any]:
        return {
            "version_a": version_a.version_id,
            "version_b": version_b.version_id,
            "score_a": self.score_version(version_a),
            "score_b": self.score_version(version_b),
            "better_version": version_a.version_id if self.score_version(version_a) >= self.score_version(version_b) else version_b.version_id,
        }
