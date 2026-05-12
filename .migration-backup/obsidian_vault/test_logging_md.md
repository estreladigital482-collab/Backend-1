---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/test_logging.md
filename: test_logging.md
---

# test_logging.md

---
category: Integração
source: packages/bridge/agent/test_logging.py
created: 2026-05-05T19:45:45.741168
size: 6101 bytes
hash: 51dfc648e70808dd1fc71172951513db
headers:
---

# test_logging.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/test_logging.py`
- **Tamanho**: 6101 bytes

## Conteúdo

"""
Testes para o Sistema de Logging e Auditoria

Valida o funcionamento correto do sistema de logs.
"""

import pytest
import tempfile
import json
from pathlib import Path
from datetime import datetime, timedelta

from ..agent.logging import (
    AuditLogger, SecurityAuditor, LogEvent, LogLevel, LogEntry
)
from ..agent.config import LOG_CONFIG


class TestAuditLogger:
    """Testes para AuditLogger"""

    def setup_method(self):
        """Configura ambiente de teste"""
        self.temp_dir = Path(tempfile.mkdtemp())
        self.log_file = self.temp_dir / "test_audit.log"
        self.logger = AuditLogger(log_file=str(self.log_file))

    def teardown_method(self):
        """Limpa ambiente de teste"""
        if self.log_file.exists():
            self.log_file.unlink()
        self.temp_dir.rmdir()

    def test_log_event(self):
        """Testa logging de evento básico"""
        self.logger.log_event(
            event_type=LogEvent.AGENT_START,
            agent_id="test_agent",
            action="start",
            details={"version": "1.0"}
        )

        # Verificar se arquivo foi criado
        assert self.log_file.exists()

        # Verificar conteúdo
        with open(self.log_file, 'r') as f:
            lines = f.readlines()
            assert len(lines) == 1

            data = json.loads(lines[0])
            assert data["event_type"] == "agent_start"
            assert data["agent_id"] == "test_agent"
            assert data["action"] == "start"
            assert "version" in data["details"]

    def test_get_recent_logs(self):
        """Testa recuperação de logs recentes"""
        # Criar alguns logs
        for i in range(5):
            self.logger.log_event(
                event_type=LogEvent.ACTION_EXECUTED,
                agent_id=f"agent_{i}",
                action=f"action_{i}"
            )

        logs = self.logger.get_recent_logs(limit=3)
        assert len(logs) == 3

        # Verificar ordem (mais recentes primeiro)
        assert logs[0].agent_id == "agent_4"
        assert logs[2].agent_id == "agent_2"

    def test_get_audit_summary(self):
        """Testa geração de resumo de auditoria"""
        # Criar logs de teste
        self.logger.log_event(LogEvent.SECURITY_VIOLATION, action="test_violation")
        self.logger.log_event(LogEvent.ERROR, action="test_error", level=LogLevel.ERROR)
        self.logger.log_event(LogEvent.AGENT_START, agent_id="test_agent")

        summary = self.logger.get_audit_summary(hours=1)

        assert summary["total_events"] >= 3
        assert summary["security_events"] >= 1
        assert summary["errors"] >= 1
        assert "test_agent" in summary["agent_activity"]


class TestSecurityAuditor:
    """Testes para SecurityAuditor"""

    def setup_method(self):
        """Configura ambiente de teste"""
        self.temp_dir = Path(tempfile.mkdtemp())
        self.log_file = self.temp_dir / "test_security.log"
        self.audit_logger = AuditLogger(log_file=str(self.log_file))
        self.security_auditor = SecurityAuditor(self.audit_logger)

    def teardown_method(self):
        """Limpa ambiente de teste"""
        if self.log_file.exists():
            self.log_file.unlink()
        self.temp_dir.rmdir()

    def test_report_violation(self):
        """Testa relatório de violação"""
        self.security_auditor.report_violation(
            "test_violation",
            {"detail": "test"},
            agent_id="test_agent"
        )

        # Verificar log
        logs = self.audit_logger.get_recent_logs()
        violation_logs = [l for l in logs if l.event_type == "security_violation"]
        assert len(violation_logs) == 1
        assert violation_logs[0].action == "security_violation:test_violation"

    def test_check_rate_limits(self):
        """Testa verificação de limites de taxa"""
        agent_id = "test_agent"
        action = "test_action"

        # Deve passar inicialmente
        assert self.security_auditor.check_rate_limits(agent_id, action, max_per_hour=2)

        # Simular muitas ações (injetar logs diretamente)
        for i in range(3):
            self.audit_logger.log_event(
                LogEvent.ACTION_EXECUTED,
                agent_id=agent_id,
                action=action,
                timestamp=datetime.now().isoformat()
            )

        # Agora deve falhar
        assert not self.security_auditor.check_rate_limits(agent_id, action, max_per_hour=2)


class TestLogEntry:
    """Testes para LogEntry"""

    def test_to_dict(self):
        """Testa conversão para dicionário"""
        entry = LogEntry(
            timestamp="2024-01-01T00:00:00",
            level="INFO",
            event_type="test",
            agent_id="agent1",
            user_id="user1",
            session_id="session1",
            action="test_action",
            details={"key": "value"},
            metadata={"meta": "data"}
        )

        data = entry.to_dict()
        assert data["agent_id"] == "agent1"
        assert data["details"]["key"] == "value"

    def test_to_json(self):
        """Testa conversão para JSON"""
        entry = LogEntry(
            timestamp="2024-01-01T00:00:00",
            level="INFO",
            event_type="test",
            agent_id=None,
            user_id=None,
            session_id=None,
            action=None,
            details={},
            metadata={}
        )

        json_str = entry.to_json()
        data = json.loads(json_str)
        assert data["level"] == "INFO"
        assert data["event_type"] == "test"


if __name__ == "__main__":
    # Executar testes básicos
    test_logger = TestAuditLogger()
    test_logger.setup_method()

    try:
        test_logger.test_log_event()
        print("✓ Teste de log básico passou")

        test_logger.test_get_recent_logs()
        print("✓ Teste de recuperação de logs passou")

        test_logger.test_get_audit_summary()
        print("✓ Teste de resumo de auditoria passou")

    finally:
        test_logger.teardown_method()

    print("Todos os testes básicos passaram!")

## Tags
#categoria/integração

