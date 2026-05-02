#!/usr/bin/env python3
"""
Demonstração do Sistema de Logging e Auditoria

Este script demonstra o uso do sistema de logging implementado.
"""

import sys
import time
from pathlib import Path

# Adicionar caminho do projeto
sys.path.insert(0, str(Path(__file__).parent))

from agent.logging import (
    audit_logger, security_auditor, LogEvent, LogLevel,
    log_agent_action, log_security_event, log_llm_call, get_audit_summary
)


def demo_basic_logging():
    """Demonstra logging básico"""
    print("=== DEMONSTRAÇÃO: LOGGING BÁSICO ===\n")

    # Log de inicialização do agente
    log_agent_action(
        agent_id="demo_agent_001",
        action="agent_initialization",
        details={"version": "1.0.0", "capabilities": ["logging", "security"]}
    )
    print("✓ Log de inicialização registrado")

    # Log de ação do usuário
    audit_logger.log_event(
        event_type=LogEvent.USER_INTERACTION,
        user_id="user_demo",
        session_id="session_123",
        action="user_command",
        details={"command": "analyze_code", "target": "example.py"}
    )
    print("✓ Log de interação do usuário registrado")

    # Log de chamada LLM
    log_llm_call(
        agent_id="demo_agent_001",
        model="gpt-4",
        tokens_used=150,
        prompt="Analyze this Python code for security issues",
        response="The code appears to be secure with proper input validation."
    )
    print("✓ Log de chamada LLM registrado")


def demo_security_monitoring():
    """Demonstra monitoramento de segurança"""
    print("\n=== DEMONSTRAÇÃO: MONITORAMENTO DE SEGURANÇA ===\n")

    # Verificar rate limiting
    agent_id = "demo_agent_001"
    for i in range(3):
        can_proceed = security_auditor.check_rate_limits(
            agent_id, "api_call", max_per_hour=5
        )
        if can_proceed:
            log_agent_action(agent_id, f"api_call_{i}")
            print(f"✓ Chamada API {i+1} permitida")
        else:
            print(f"✗ Chamada API {i+1} bloqueada por rate limiting")
        time.sleep(0.1)  # Pequena pausa

    # Reportar violação de segurança
    security_auditor.report_violation(
        "unauthorized_access",
        {
            "resource": "/admin/panel",
            "ip_address": "192.168.1.100",
            "user_agent": "SuspiciousBot/1.0"
        },
        agent_id=agent_id,
        user_id="user_demo"
    )
    print("✓ Violação de segurança reportada")


def demo_audit_analysis():
    """Demonstra análise de auditoria"""
    print("\n=== DEMONSTRAÇÃO: ANÁLISE DE AUDITORIA ===\n")

    # Obter resumo de auditoria
    summary = get_audit_summary(hours=1)

    print("Resumo da última hora:")
    print(f"  Total de eventos: {summary['total_events']}")
    print(f"  Eventos de segurança: {summary['security_events']}")
    print(f"  Erros: {summary['errors']}")
    print(f"  Atividade por agente: {summary['agent_activity']}")
    print(f"  Atividade por usuário: {summary['user_activity']}")

    # Obter logs recentes
    recent_logs = audit_logger.get_recent_logs(limit=5)
    print(f"\nÚltimos {len(recent_logs)} logs:")
    for log in recent_logs:
        print(f"  [{log.timestamp}] {log.level} - {log.event_type}: {log.action}")


def demo_error_logging():
    """Demonstra logging de erros"""
    print("\n=== DEMONSTRAÇÃO: LOGGING DE ERROS ===\n")

    try:
        # Simular um erro
        raise ValueError("Exemplo de erro para demonstração")
    except Exception as e:
        audit_logger.log_event(
            event_type=LogEvent.CORE_VALIDATION,
            agent_id="demo_agent_001",
            action="error_handling_demo",
            details={
                "error_type": type(e).__name__,
                "error_message": str(e),
                "stack_trace": "simulated_stack_trace"
            },
            level=LogLevel.ERROR
        )
        print("✓ Erro registrado no sistema de auditoria")


def main():
    """Executa demonstração completa"""
    print("🚀 DEMONSTRAÇÃO DO SISTEMA DE LOGGING E AUDITORIA\n")
    print("Este script demonstra as funcionalidades do sistema implementado.\n")

    # Executar demonstrações
    demo_basic_logging()
    demo_security_monitoring()
    demo_audit_analysis()
    demo_error_logging()

    print("\n" + "="*60)
    print("🎉 DEMONSTRAÇÃO CONCLUÍDA!")
    print("O sistema de logging e auditoria está funcionando corretamente.")
    print("Verifique o arquivo logs/audit.log para ver os logs registrados.")
    print("="*60)


if __name__ == "__main__":
    main()