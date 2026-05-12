---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/supervisor.md
filename: supervisor.md
---

# supervisor.md

---
category: Integração
source: packages/bridge/agent/supervisor.py
created: 2026-05-05T19:45:45.741168
size: 3506 bytes
hash: 01c19da0cfa8e6887a5185daf3f69e48
headers:
---

# supervisor.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/supervisor.py`
- **Tamanho**: 3506 bytes

## Conteúdo

"""
Agent Supervisor - Monitoramento externo e modo seguro.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from .logging import audit_logger, LogEvent, LogLevel


@dataclass
class SupervisorEvent:
    event_type: str
    details: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


class AgentSupervisor:
    """Supervisão de comportamento e gatilhos de modo seguro."""

    def __init__(self, thresholds: Optional[Dict[str, int]] = None):
        self.events: List[SupervisorEvent] = []
        self.thresholds = thresholds or {
            "security_violations": 3,
            "error_events": 5,
            "anomaly_events": 2,
        }
        self.safe_mode = False
        self.safe_mode_reason: Optional[str] = None
        self.safe_mode_since: Optional[str] = None

    def record_event(self, event_type: str, details: Optional[Dict[str, Any]] = None) -> None:
        event = SupervisorEvent(event_type=event_type, details=details or {})
        self.events.append(event)
        self._check_conditions(event)

    def _check_conditions(self, event: SupervisorEvent) -> None:
        if event.event_type == "security_violation":
            count = self._count_recent("security_violation", minutes=60)
            if count >= self.thresholds["security_violations"]:
                self.activate_safe_mode("security_violation_threshold_reached")

        if event.event_type == "error":
            count = self._count_recent("error", minutes=60)
            if count >= self.thresholds["error_events"]:
                self.activate_safe_mode("error_threshold_reached")

        if event.event_type == "anomaly":
            count = self._count_recent("anomaly", minutes=60)
            if count >= self.thresholds["anomaly_events"]:
                self.activate_safe_mode("anomaly_threshold_reached")

    def _count_recent(self, event_type: str, minutes: int = 60) -> int:
        cutoff = datetime.now() - timedelta(minutes=minutes)
        return sum(
            1 for event in self.events
            if event.event_type == event_type and datetime.fromisoformat(event.timestamp) >= cutoff
        )

    def activate_safe_mode(self, reason: str) -> None:
        if not self.safe_mode:
            self.safe_mode = True
            self.safe_mode_reason = reason
            self.safe_mode_since = datetime.now().isoformat()
            audit_logger.log_event(
                event_type=LogEvent.SECURITY_VIOLATION,
                agent_id="aura-agent",
                action="safe_mode_activated",
                details={"reason": reason},
                level=LogLevel.CRITICAL
            )

    def deactivate_safe_mode(self) -> None:
        if self.safe_mode:
            self.safe_mode = False
            audit_logger.log_event(
                event_type=LogEvent.USER_INTERACTION,
                agent_id="aura-agent",
                action="safe_mode_deactivated",
                details={"reason": "manual_review"},
                level=LogLevel.WARNING
            )
            self.safe_mode_reason = None
            self.safe_mode_since = None

    def status(self) -> Dict[str, Any]:
        return {
            "safe_mode": self.safe_mode,
            "reason": self.safe_mode_reason,
            "since": self.safe_mode_since,
            "event_count": len(self.events),
            "thresholds": self.thresholds,
        }


## Tags
#categoria/integração

