---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/security.md
filename: security.md
---

# security.md

---
category: Integração
source: packages/bridge/agent/core/security.py
created: 2026-05-05T19:45:45.741168
size: 663 bytes
hash: 9daae7f7fa83fb7366e7c74b9eefdb11
headers:
---

# security.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/core/security.py`
- **Tamanho**: 663 bytes

## Conteúdo

"""Módulo de segurança do core do agente."""

from typing import Dict, Any

class SecurityManager:
    """Gerencia regras de segurança para componentes de agente."""

    def __init__(self) -> None:
        self.rules = {
            "allow_external_execution": False,
            "allow_data_exfiltration": False,
            "allow_remote_control": False,
        }

    def is_action_allowed(self, action: str, context: Dict[str, Any] | None = None) -> bool:
        if action == "read_only":
            return True
        return self.rules.get(action, False)

    def set_rule(self, action: str, allowed: bool) -> None:
        self.rules[action] = allowed


## Tags
#categoria/integração

