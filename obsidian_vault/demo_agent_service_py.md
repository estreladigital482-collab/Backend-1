---
source: /workspaces/Aura-sphere-/packages/bridge/demo_agent_service.py
filename: demo_agent_service.py
---

# demo_agent_service.py

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

