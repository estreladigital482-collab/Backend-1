---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/demo_agent_service.md
filename: demo_agent_service.md
---

# demo_agent_service.md

---
category: Integração
source: packages/bridge/demo_agent_service.py
created: 2026-05-05T19:45:45.742168
size: 1289 bytes
hash: 1efb61b6c87092c8f87a71a7d420ead0
headers:
---

# demo_agent_service.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/demo_agent_service.py`
- **Tamanho**: 1289 bytes

## Conteúdo

"""
Demonstração rápida do AgentService.

Mostra como criar uma sessão, adicionar tarefas de evolução e gerar
um relatório de progresso com auditoria.
"""

from agent.service import get_agent_service


def main() -> None:
    service = get_agent_service(user_id="dev-user", agent_id="aura-agent")

    service.create_session_task_list([
        "Criar lista de sessão no backlog",
        "Implementar serviço de agente seguro",
        "Registrar ações do agente no audit log",
        "Gerar relatório de sessão para monitoramento"
    ])

    tasks = [task for task in service.session_state.tasks]
    if tasks:
        service.complete_session_task(tasks[0].id)
        service.complete_session_task(tasks[1].id)

    report = service.get_session_report()
    print("=== Relatório de Sessão ===")
    print(f"Session ID: {report['session_id']}")
    print(f"User ID: {report['user_id']}")
    print(f"Agent ID: {report['agent_id']}")
    print(f"Completed: {report['completed_tasks']} / {report['total_tasks']}")
    print("Tarefas:")
    for task in report["tasks"]:
        status = task["status"]
        print(f" - [{status}] {task['description']}")

    service.audit_session_summary()
    print("\nRelatório gravado no log de auditoria.")


if __name__ == "__main__":
    main()


## Tags
#categoria/integração

