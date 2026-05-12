---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/policy.md
filename: policy.md
---

# policy.md

---
category: Integração
source: packages/bridge/agent/core/policy.py
created: 2026-05-05T19:45:45.741168
size: 568 bytes
hash: 4f1356db4debc09423e83b7b4bd78e16
headers:
---

# policy.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/core/policy.py`
- **Tamanho**: 568 bytes

## Conteúdo

"""Gerenciamento de políticas internas do agente."""

from typing import Dict, Any

class PolicyManager:
    """Gerencia políticas de execução e bloqueios do agente."""

    def __init__(self) -> None:
        self.policies: Dict[str, Any] = {
            "max_pending_tasks": 20,
            "block_unsafe_actions": True,
            "safe_mode": True,
        }

    def get_policy(self, key: str, default: Any = None) -> Any:
        return self.policies.get(key, default)

    def set_policy(self, key: str, value: Any) -> None:
        self.policies[key] = value


## Tags
#categoria/integração

