---
category: Integração
source: packages/bridge/agent/schemas.py
created: 2026-05-05T19:45:45.741168
size: 592 bytes
hash: 9651866df3be4472f73f5eb6d9b6fc06
headers:
---

# schemas.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/schemas.py`
- **Tamanho**: 592 bytes

## Conteúdo

"""Definições de esquemas de dados para o agente."""

from dataclasses import dataclass
from typing import Optional, Dict, List

@dataclass
class AgentProfile:
    user_id: str
    agent_id: str
    ai_name: str
    voice_id: Optional[str] = None
    onboarded: bool = False


@dataclass
class AgentTask:
    id: str
    description: str
    status: str = "pending"
    created_at: str = ""
    completed_at: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None


@dataclass
class AgentSession:
    user_id: str
    agent_id: str
    tasks: List[AgentTask]
    last_active: str


## Tags
#categoria/integração
