---
source: /workspaces/Aura-sphere-/knowledge_vault/Backend/memory.md
filename: memory.md
---

# memory.md

---
category: Backend
source: packages/mempalace/memory.py
created: 2026-05-05T19:45:45.738168
size: 594 bytes
hash: db278af57ac2d97fcdf78374bdd95106
headers:
---

# memory.py

## Metadados
- **Categoria**: Backend
- **Caminho Original**: `packages/mempalace/memory.py`
- **Tamanho**: 594 bytes

## Conteúdo

from collections import defaultdict
from typing import List


class MemoryEngine:
    def __init__(self) -> None:
        self._store: dict[str, List[dict[str, str]]] = defaultdict(list)

    def add_memory(self, user_id: str, content: str, category: str = "chat") -> None:
        self._store[user_id].append({"content": content, "category": category})

    def search(self, user_id: str, query: str) -> List[dict[str, str]]:
        q = query.lower()
        return [
            item
            for item in self._store.get(user_id, [])
            if q in item["content"].lower()
        ]


## Tags
#categoria/backend

