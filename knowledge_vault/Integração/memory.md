---
category: Integração
source: packages/bridge/agent/memory.py
created: 2026-05-05T19:45:45.741168
size: 2812 bytes
hash: a5d4800c68ab1a4af0b2dd35504bda36
headers:
---

# memory.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/memory.py`
- **Tamanho**: 2812 bytes

## Conteúdo

"""
Agent Memory - Memória de curto, longo e evolução para o agente.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parents[1]
MEMORY_DIR = BASE_DIR / "data" / "memory"
MEMORY_DIR.mkdir(parents=True, exist_ok=True)
MEMORY_FILE = MEMORY_DIR / "memory_entries.json"


@dataclass
class MemoryEntry:
    entry_id: str
    layer: str
    content: str
    metadata: Dict[str, Any]
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "entry_id": self.entry_id,
            "layer": self.layer,
            "content": self.content,
            "metadata": self.metadata,
            "created_at": self.created_at,
        }


class MemoryStore:
    """Armazena entradas de memória e fornece busca simples."""

    def __init__(self, memory_file: Optional[Path] = None):
        self.memory_file = memory_file or MEMORY_FILE
        self.entries: List[MemoryEntry] = []
        self._load()

    def _load(self) -> None:
        if self.memory_file.exists():
            try:
                data = json.loads(self.memory_file.read_text(encoding="utf-8"))
                self.entries = [MemoryEntry(**entry) for entry in data]
            except Exception:
                self.entries = []

    def _persist(self) -> None:
        self.memory_file.write_text(
            json.dumps([entry.to_dict() for entry in self.entries], ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

    def add_entry(self, layer: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> MemoryEntry:
        entry = MemoryEntry(
            entry_id=f"mem_{len(self.entries) + 1}",
            layer=layer,
            content=content,
            metadata=metadata or {}
        )
        self.entries.append(entry)
        self._persist()
        return entry

    def list_entries(self, layer: Optional[str] = None, limit: int = 100) -> List[MemoryEntry]:
        results = [entry for entry in self.entries if layer is None or entry.layer == layer]
        return results[-limit:]

    def search(self, query: str, layer: Optional[str] = None, limit: int = 10) -> List[MemoryEntry]:
        query_lower = query.lower()
        results = [
            entry for entry in self.entries
            if (layer is None or entry.layer == layer) and query_lower in entry.content.lower()
        ]
        return results[:limit]

    def clear_layer(self, layer: str) -> int:
        before_count = len(self.entries)
        self.entries = [entry for entry in self.entries if entry.layer != layer]
        self._persist()
        return before_count - len(self.entries)


## Tags
#categoria/integração
