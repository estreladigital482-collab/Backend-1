---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/session_manager.md
filename: session_manager.md
---

# session_manager.md

---
category: Integração
source: packages/bridge/agent/learning/session_manager.py
created: 2026-05-05T19:45:45.741168
size: 3093 bytes
hash: 50c8d79963c98c2d607c5442ec261870
headers:
---

# session_manager.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/learning/session_manager.py`
- **Tamanho**: 3093 bytes

## Conteúdo

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional


class SessionManager:
    """Controla sessão de aprendizado sob demanda e estado do modo de ensino."""

    def __init__(self, persistence_path: Optional[str] = None):
        path = Path(persistence_path) if persistence_path else Path(__file__).resolve().parent
        if path.is_dir() or str(path).endswith(('/', '\\')):
            path = path / "session_data.json"
        self.persistence_path = path
        self.learning_mode = False
        self.current_topic: Optional[str] = None
        self.current_session: Dict[str, Any] = {}
        self._load()

    def _load(self) -> None:
        if self.persistence_path.exists():
            try:
                with open(self.persistence_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.learning_mode = data.get("learning_mode", False)
                    self.current_topic = data.get("current_topic")
                    self.current_session = data.get("current_session", {})
            except Exception:
                self.learning_mode = False
                self.current_topic = None
                self.current_session = {}

    def save(self) -> None:
        self.persistence_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.persistence_path, "w", encoding="utf-8") as f:
            json.dump({
                "learning_mode": self.learning_mode,
                "current_topic": self.current_topic,
                "current_session": self.current_session,
            }, f, indent=2, ensure_ascii=False)

    def start_session(self, topic: str) -> None:
        self.learning_mode = True
        self.current_topic = topic.strip().lower()
        self.current_session = {
            "topic": topic.strip(),
            "started_at": datetime.utcnow().isoformat(),
            "status": "active",
            "history": [],
        }
        self.save()

    def pause_session(self) -> None:
        if self.learning_mode:
            self.current_session["status"] = "paused"
            self.save()

    def resume_session(self) -> None:
        if self.current_topic:
            self.learning_mode = True
            self.current_session["status"] = "active"
            self.save()

    def stop_session(self) -> None:
        self.learning_mode = False
        self.current_session["status"] = "stopped"
        self.current_session["ended_at"] = datetime.utcnow().isoformat()
        self.save()
        self.current_topic = None

    def add_session_entry(self, entry: str) -> None:
        if self.current_session is not None:
            entries = self.current_session.setdefault("history", [])
            entries.append({"timestamp": datetime.utcnow().isoformat(), "entry": entry})
            self.save()

    def get_state(self) -> Dict[str, Any]:
        return {
            "learning_mode": self.learning_mode,
            "current_topic": self.current_topic,
            "current_session": self.current_session,
        }


## Tags
#categoria/integração

