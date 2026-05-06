---
source: /workspaces/Aura-sphere-/packages/bridge/agent/logging.py
filename: logging.py
---

# logging.py

"""
Sistema de Logs e Auditoria - Task #4

Implementa logging estruturado e auditoria completa de todas as ações da IA,
inspirado no sistema de logging do AutoGen mas adaptado para segurança.
"""

import json
import logging
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum

# TODO: Importar PermissionLevel quando core.permissions for implementado
# from ..core.permissions import PermissionLevel

class LogLevel(Enum):
    """Níveis de log para auditoria"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"
    AUDIT = "AUDIT"  # Nível especial para auditoria

class LogEvent(Enum):
    """Tipos de eventos que podem ser logados"""
    AGENT_START = "agent_start"
    AGENT_STOP = "agent_stop"
    ACTION_EXECUTED = "action_executed"
    PERMISSION_CHECK = "permission_check"
    SANDBOX_EXECUTION = "sandbox_execution"
    LLM_CALL = "llm_call"
    MEMORY_ACCESS = "memory_access"
    SECURITY_VIOLATION = "security_violation"
    CORE_VALIDATION = "core_validation"
    USER_INTERACTION = "user_interaction"

@dataclass
class LogEntry:
    """Entrada de log estruturada"""
    timestamp: str
    level: str
    event_type: str
    agent_id: Optional[str]
    user_id: Optional[str]
    session_id: Optional[str]
    action: Optional[str]
    details: Dict[str, Any]
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return asdict(self)

    def to_json(self) -> str:
        """Converte para JSON"""
        return json.dumps(self.to_dict(), default=str, ensure_ascii=False)

class AuditLogger:
    """Logger de auditoria thread-safe"""

    def __init__(self, log_file: str = "logs/audit.log", max_file_size: int = 10*1024*1024):
        self.log_file = Path(log_file)
        self.max_file_size = max_file_size
        self._lock = threading.Lock()

        # Criar diretório se não existir
        self.log_file.parent.mkdir(parents=True, exist_ok=True)

        # Configurar logger padrão
        self.logger = logging.getLogger("aura_audit")
        self.logger.setLevel(logging.DEBUG)

        # Handler para arquivo
        file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)

        # Formato estruturado
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)

        # Evitar duplicatas
        if not self.logger.handlers:
            self.logger.addHandler(file_handler)

    def log_event(self, event_type: LogEvent, agent_id: Optional[str] = None,
                  user_id: Optional[str] = None, session_id: Optional[str] = None,
                  action: Optional[str] = None, details: Optional[Dict[str, Any]] = None,
                  metadata: Optional[Dict[str, Any]] = None, level: LogLevel = LogLevel.INFO) -> None:
        """
        Registra um evento de auditoria

        Args:
            event_type: Tipo do evento
            agent_id: ID do agente (se aplicável)
            user_id: ID do usuário
            session_id: ID da sessão
            action: Ação executada
            details: Detalhes específicos do evento
            metadata: Metadados adicionais
            level: Nível de severidade
        """

        entry = LogEntry(
            timestamp=datetime.now().isoformat(),
            level=level.value,
            event_type=event_type.value,
            agent_id=agent_id,
            user_id=user_id,
            session_id=session_id,
            action=action,
            details=details or {},
            metadata=metadata or {}
        )

        with self._lock:
            # Verificar tamanho do arquivo e rotacionar se necessário
            if self.log_file.exists() and self.log_file.stat().st_size > self.max_file_size:
                self._rotate_log_file()

            # Escrever no arquivo
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(entry.to_json() + '\n')

            # Log também no logger padrão
            log_method = getattr(self.logger, level.value.lower(), self.logger.info)
            log_method(f"[{event_type.value}] {action or 'N/A'} - Agent: {agent_id or 'N/A'} - User: {user_id or 'N/A'}")

    def _rotate_log_file(self) -> None:
        """Rotaciona o arquivo de log quando fica muito grande"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = self.log_file.with_suffix(f".{timestamp}.log")

        # Renomear arquivo atual
        self.log_file.rename(backup_file)

        # Criar novo arquivo
        self.log_file.touch()

        # Log da rotação
        self.logger.info(f"Log rotated: {backup_file}")

    def get_recent_logs(self, limit: int = 100, event_type: Optional[LogEvent] = None,
                       agent_id: Optional[str] = None) -> List[LogEntry]:
        """Recupera logs recentes com filtros"""

        logs = []

        if not self.log_file.exists():
            return logs

        with self._lock:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()[-limit:]  # Últimas N linhas

                for line in lines:
                    try:
                        data = json.loads(line.strip())
                        entry = LogEntry(**data)

                        # Aplicar filtros
                        if event_type and entry.event_type != event_type.value:
                            continue
                        if agent_id and entry.agent_id != agent_id:
                            continue

                        logs.append(entry)

                    except (json.JSONDecodeError, TypeError):
                        continue  # Pular linhas inválidas

        return logs

    def get_audit_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Gera resumo de auditoria para o período especificado"""

        cutoff_time = datetime.now().timestamp() - (hours * 3600)
        logs = self.get_recent_logs(limit=1000)

        summary = {
            "period_hours": hours,
            "total_events": len(logs),
            "events_by_type": {},
            "events_by_level": {},
            "security_events": 0,
            "errors": 0,
            "agent_activity": {},
            "user_activity": {}
        }

        for entry in logs:
            # Filtrar por tempo
            try:
                entry_time = datetime.fromisoformat(entry.timestamp).timestamp()
                if entry_time < cutoff_time:
                    continue
            except ValueError:
                continue

            # Contar por tipo
            summary["events_by_type"][entry.event_type] = \
                summary["events_by_type"].get(entry.event_type, 0) + 1

            # Contar por nível
            summary["events_by_level"][entry.level] = \
                summary["events_by_level"].get(entry.level, 0) + 1

            # Eventos de segurança
            if entry.event_type in ["security_violation", "core_validation"]:
                summary["security_events"] += 1

            # Erros
            if entry.level in ["ERROR", "CRITICAL"]:
                summary["errors"] += 1

            # Atividade por agente
            if entry.agent_id:
                summary["agent_activity"][entry.agent_id] = \
                    summary["agent_activity"].get(entry.agent_id, 0) + 1

            # Atividade por usuário
            if entry.user_id:
                summary["user_activity"][entry.user_id] = \
                    summary["user_activity"].get(entry.user_id, 0) + 1

        return summary

class SecurityAuditor:
    """Auditor de segurança que monitora violações"""

    def __init__(self, audit_logger: AuditLogger):
        self.audit_logger = audit_logger
        self.violation_counts = {}
        self._lock = threading.Lock()

    def report_violation(self, violation_type: str, details: Dict[str, Any],
                        agent_id: Optional[str] = None, user_id: Optional[str] = None) -> None:
        """Reporta uma violação de segurança"""

        with self._lock:
            # Incrementar contador
            self.violation_counts[violation_type] = \
                self.violation_counts.get(violation_type, 0) + 1

        # Log da violação
        self.audit_logger.log_event(
            event_type=LogEvent.SECURITY_VIOLATION,
            agent_id=agent_id,
            user_id=user_id,
            action=f"security_violation:{violation_type}",
            details={
                "violation_type": violation_type,
                "violation_count": self.violation_counts[violation_type],
                **details
            },
            level=LogLevel.CRITICAL
        )

    def check_rate_limits(self, agent_id: str, action: str,
                         max_per_hour: int = 100) -> bool:
        """Verifica se o agente excedeu limites de ação"""

        # Obter logs recentes do agente
        recent_logs = self.audit_logger.get_recent_logs(
            limit=500, agent_id=agent_id
        )

        # Contar ações similares na última hora
        cutoff_time = datetime.now().timestamp() - 3600
        action_count = 0

        for log in recent_logs:
            try:
                log_time = datetime.fromisoformat(log.timestamp).timestamp()
                if log_time >= cutoff_time and log.action == action:
                    action_count += 1
            except ValueError:
                continue

        if action_count >= max_per_hour:
            self.report_violation(
                "rate_limit_exceeded",
                {
                    "agent_id": agent_id,
                    "action": action,
                    "count": action_count,
                    "limit": max_per_hour
                },
                agent_id=agent_id
            )
            return False

        return True

# ========== INSTÂNCIA GLOBAL ==========

audit_logger = AuditLogger()
security_auditor = SecurityAuditor(audit_logger)

# ========== FUNÇÕES DE CONVENIÊNCIA ==========

def log_agent_action(agent_id: str, action: str, details: Optional[Dict[str, Any]] = None,
                    user_id: Optional[str] = None, level: LogLevel = LogLevel.INFO) -> None:
    """Log de ação do agente"""
    audit_logger.log_event(
        event_type=LogEvent.ACTION_EXECUTED,
        agent_id=agent_id,
        user_id=user_id,
        action=action,
        details=details or {},
        level=level
    )

def log_security_event(event: str, details: Dict[str, Any],
                      agent_id: Optional[str] = None, user_id: Optional[str] = None) -> None:
    """Log de evento de segurança"""
    audit_logger.log_event(
        event_type=LogEvent.SECURITY_VIOLATION,
        agent_id=agent_id,
        user_id=user_id,
        action=f"security:{event}",
        details=details,
        level=LogLevel.CRITICAL
    )

def log_llm_call(agent_id: str, model: str, tokens_used: int,
                prompt: str, response: str) -> None:
    """Log de chamada LLM"""
    audit_logger.log_event(
        event_type=LogEvent.LLM_CALL,
        agent_id=agent_id,
        action="llm_call",
        details={
            "model": model,
            "tokens_used": tokens_used,
            "prompt_length": len(prompt),
            "response_length": len(response)
        },
        level=LogLevel.INFO
    )

def get_audit_summary(hours: int = 24) -> Dict[str, Any]:
    """Obtém resumo de auditoria"""
    return audit_logger.get_audit_summary(hours)
