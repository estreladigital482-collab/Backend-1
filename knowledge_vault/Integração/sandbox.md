---
category: Integração
source: packages/bridge/core/sandbox.py
created: 2026-05-05T19:45:45.740168
size: 1206 bytes
hash: 308756e733f5f5ec83c2179719c08eea
headers:
---

# sandbox.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/core/sandbox.py`
- **Tamanho**: 1206 bytes

## Conteúdo

"""
Core Sandbox Adapter - Interface de sandbox do core.

Fornece uma camada de adaptação leve para permitir que módulos do core
consumam um manager de sandbox sem depender diretamente da implementação
de runtime.
"""

import asyncio
from typing import Any, Callable, Dict, Optional

from runtime.sandbox import SandboxManager as RuntimeSandboxManager


class SandboxManager:
    """Adaptador de sandbox para uso por módulos de agente e defesa."""

    def __init__(self):
        self.manager = RuntimeSandboxManager()
        self.sandbox_id = "core_sandbox"

    async def execute_in_sandbox(self, function: Callable[..., Any], task: Any) -> Any:
        """Executa uma função de tarefa dentro de um sandbox seguro."""
        if asyncio.iscoroutinefunction(function):
            return await function(task)

        result = function(task)
        if asyncio.iscoroutine(result):
            return await result

        return result

    def execute_code(self, code: str, inputs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Executa código Python em sandbox usando o runtime."""
        return self.manager.execute_in_sandbox(self.sandbox_id, code, inputs or {}, user_id="system")


## Tags
#categoria/integração
