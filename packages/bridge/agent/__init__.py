"""
Módulo Agent - Sistema de Agentes Seguros

Este módulo implementa a arquitetura de agentes da Aura Sphere,
com foco em segurança, auditoria e controle de permissões.
"""

from .logging import (
    AuditLogger,
    SecurityAuditor,
    LogEvent,
    LogLevel,
    audit_logger,
    security_auditor,
    log_agent_action,
    log_security_event,
    log_llm_call,
    get_audit_summary
)
from .service import (
    AgentService,
    SessionTask,
    SessionState,
    get_agent_service,
)
from .tools import ToolRegistry
from .memory import MemoryStore
from .evolution import EvolutionManager
from .supervisor import AgentSupervisor

__version__ = "0.1.0"
__all__ = [
    # Classes principais
    "AuditLogger",
    "SecurityAuditor",
    "AgentService",
    "SessionTask",
    "SessionState",

    # Tooling
    "ToolRegistry",
    "MemoryStore",
    "EvolutionManager",
    "AgentSupervisor",

    # Enums
    "LogEvent",
    "LogLevel",

    # Instâncias globais
    "audit_logger",
    "security_auditor",

    # Funções de conveniência
    "log_agent_action",
    "log_security_event",
    "log_llm_call",
    "get_audit_summary",
    "get_agent_service",
]