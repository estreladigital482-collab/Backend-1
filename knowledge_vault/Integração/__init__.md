---
category: Integração
source: packages/bridge/hive/bees/__init__.py
created: 2026-05-05T19:45:45.742168
size: 439 bytes
hash: 6af21c044f108566f92b845eff25e335
headers:
---

# __init__.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/hive/bees/__init__.py`
- **Tamanho**: 439 bytes

## Conteúdo

"""
Hive Bees Module
================

Módulo das abelhas do sistema de colmeia.
Inclui scouts, coordinators, workers e guards.
"""

from .scout import BeeScout
from .coordinator import BeeCoordinator, TaskPriority
from .worker import BeeWorker, TaskStatus
from .guard import BeeGuard, ThreatLevel

__all__ = [
    'BeeScout',
    'BeeCoordinator',
    'BeeWorker',
    'BeeGuard',
    'TaskPriority',
    'TaskStatus',
    'ThreatLevel'
]

## Tags
#categoria/integração
