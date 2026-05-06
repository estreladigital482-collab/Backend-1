---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/test_logging_simple.md
filename: test_logging_simple.md
---

# test_logging_simple.md

---
category: Integração
source: packages/bridge/test_logging_simple.py
created: 2026-05-05T19:45:45.740168
size: 5693 bytes
hash: 118eaa04809f8a51d3f1191257a02907
headers:
  - Adicionar caminho do projeto
---

# test_logging_simple.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/test_logging_simple.py`
- **Tamanho**: 5693 bytes

## Conteúdo

"""
Testes Simples para o Sistema de Logging e Auditoria

Testes básicos sem dependências externas.
"""

import sys
import os
import tempfile
import json
from pathlib import Path
from datetime import datetime

# Adicionar caminho do projeto
sys.path.insert(0, str(Path(__file__).parent.parent))

from agent.logging import (
    AuditLogger, SecurityAuditor, LogEvent, LogLevel, LogEntry
)
from agent.config import LOG_CONFIG


def test_audit_logger():
    """Testa AuditLogger"""
    print("Testando AuditLogger...")

    # Criar logger temporário
    temp_dir = Path(tempfile.mkdtemp())
    log_file = temp_dir / "test_audit.log"
    logger = AuditLogger(log_file=str(log_file))

    try:
        # Testar log de evento
        logger.log_event(
            event_type=LogEvent.AGENT_START,
            agent_id="test_agent",
            action="start",
            details={"version": "1.0"}
        )

        # Verificar arquivo
        assert log_file.exists(), "Arquivo de log não foi criado"
        print("✓ Arquivo de log criado")

        # Verificar conteúdo
        with open(log_file, 'r') as f:
            lines = f.readlines()
            assert len(lines) == 1, f"Esperado 1 linha, encontrado {len(lines)}"

            data = json.loads(lines[0])
            assert data["event_type"] == "agent_start"
            assert data["agent_id"] == "test_agent"
            assert data["action"] == "start"
            assert "version" in data["details"]
        print("✓ Log de evento registrado corretamente")

        # Testar recuperação de logs
        logs = logger.get_recent_logs(limit=10)
        assert len(logs) == 1
        assert logs[0].agent_id == "test_agent"
        print("✓ Recuperação de logs funcionando")

        # Testar resumo de auditoria
        summary = logger.get_audit_summary(hours=1)
        assert summary["total_events"] >= 1
        assert "agent_activity" in summary
        print("✓ Resumo de auditoria gerado")

        print("✓ Todos os testes do AuditLogger passaram!")
        return True

    except Exception as e:
        print(f"✗ Erro no AuditLogger: {e}")
        return False
    finally:
        # Limpar
        if log_file.exists():
            log_file.unlink()
        temp_dir.rmdir()


def test_security_auditor():
    """Testa SecurityAuditor"""
    print("\nTestando SecurityAuditor...")

    temp_dir = Path(tempfile.mkdtemp())
    log_file = temp_dir / "test_security.log"
    audit_logger = AuditLogger(log_file=str(log_file))
    security_auditor = SecurityAuditor(audit_logger)

    try:
        # Testar relatório de violação
        security_auditor.report_violation(
            "test_violation",
            {"detail": "test"},
            agent_id="test_agent"
        )

        # Verificar log
        logs = audit_logger.get_recent_logs()
        violation_logs = [l for l in logs if l.event_type == "security_violation"]
        assert len(violation_logs) == 1
        assert violation_logs[0].action == "security_violation:test_violation"
        print("✓ Relatório de violação funcionando")

        # Testar rate limiting
        agent_id = "test_agent"
        action = "test_action"

        # Deve passar inicialmente
        assert security_auditor.check_rate_limits(agent_id, action, max_per_hour=2)
        print("✓ Rate limiting inicial funcionando")

        # Simular muitas ações
        for i in range(3):
            audit_logger.log_event(
                LogEvent.ACTION_EXECUTED,
                agent_id=agent_id,
                action=action
            )

        # Agora deve falhar
        assert not security_auditor.check_rate_limits(agent_id, action, max_per_hour=2)
        print("✓ Rate limiting com excesso funcionando")

        print("✓ Todos os testes do SecurityAuditor passaram!")
        return True

    except Exception as e:
        print(f"✗ Erro no SecurityAuditor: {e}")
        return False
    finally:
        if log_file.exists():
            log_file.unlink()
        temp_dir.rmdir()


def test_log_entry():
    """Testa LogEntry"""
    print("\nTestando LogEntry...")

    try:
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

        # Testar to_dict
        data = entry.to_dict()
        assert data["agent_id"] == "agent1"
        assert data["details"]["key"] == "value"
        print("✓ Conversão para dicionário funcionando")

        # Testar to_json
        json_str = entry.to_json()
        parsed = json.loads(json_str)
        assert parsed["level"] == "INFO"
        assert parsed["event_type"] == "test"
        print("✓ Conversão para JSON funcionando")

        print("✓ Todos os testes do LogEntry passaram!")
        return True

    except Exception as e:
        print(f"✗ Erro no LogEntry: {e}")
        return False


def main():
    """Executa todos os testes"""
    print("=== TESTES DO SISTEMA DE LOGGING ===\n")

    results = []
    results.append(test_audit_logger())
    results.append(test_security_auditor())
    results.append(test_log_entry())

    passed = sum(results)
    total = len(results)

    print(f"\n=== RESULTADO: {passed}/{total} testes passaram ===")

    if passed == total:
        print("🎉 Todos os testes passaram! Sistema de logging está funcionando.")
        return 0
    else:
        print("❌ Alguns testes falharam. Verificar implementação.")
        return 1


if __name__ == "__main__":
    sys.exit(main())

## Tags
#categoria/integração

