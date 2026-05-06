---
category: Integração
source: packages/bridge/agent/app.py
created: 2026-05-05T19:45:45.741168
size: 675 bytes
hash: 9026bdd8c37b0a0a923e59c7e60cbd73
headers:
---

# app.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/app.py`
- **Tamanho**: 675 bytes

## Conteúdo

"""Agente principal do Aura Sphere - ponto de entrada do agente."""

from .service import get_agent_service
from .service import AgentService

__all__ = ["get_agent_service", "AgentService", "create_agent_service"]


def create_agent_service(user_id: str = "dev-user", agent_id: str = "aura-agent") -> AgentService:
    """Cria uma instância de serviço de agente."""
    return get_agent_service(user_id=user_id, agent_id=agent_id)


def run_agent(user_id: str = "dev-user", agent_id: str = "aura-agent") -> AgentService:
    """Inicializa o agente e retorna o serviço configurado."""
    service = create_agent_service(user_id=user_id, agent_id=agent_id)
    return service


## Tags
#categoria/integração
