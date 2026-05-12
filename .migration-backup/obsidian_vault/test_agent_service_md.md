---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/test_agent_service.md
filename: test_agent_service.md
---

# test_agent_service.md

---
category: Integração
source: packages/bridge/test_agent_service.py
created: 2026-05-05T19:45:45.742168
size: 2991 bytes
hash: 2e1e3472e9f5c3b7d6d9cb74755d1d21
headers:
---

# test_agent_service.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/test_agent_service.py`
- **Tamanho**: 2991 bytes

## Conteúdo

"""
Testes simples para o serviço de agente e seus componentes.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from agent import get_agent_service
from agent.tools import ToolBase, ToolExecutionResult


class DummyTool(ToolBase):
    def __init__(self):
        super().__init__(name="dummy", description="Dummy tool for testing")

    def execute(self, **kwargs) -> ToolExecutionResult:
        return ToolExecutionResult(
            tool_name=self.name,
            success=True,
            result=f"executed {kwargs}",
            error=None,
            metadata={"tested": True}
        )


def main():
    service = get_agent_service(user_id="tester", agent_id="aura-agent-test")

    print("Criando tarefas de sessão...")
    service.create_session_task_list([
        "Estudar 70 repositórios",
        "Comparar com backlog",
        "Implementar agente seguro"
    ])

    tasks = service.session_state.tasks
    service.complete_session_task(tasks[0].id)

    print("Registrando memória...")
    mem = service.store_memory("short_term", "Teste de memória de sessão", {"source": "test"})
    print(mem)

    print("Salvando versão candidata...")
    version = service.save_evolution_candidate(
        description="Candidate 1",
        metrics={"quality_score": 7.5, "stability": 0.8, "security": 0.9, "errors": 0}
    )
    print(version)

    print("Registrando ferramenta de teste...")
    service.register_tool(DummyTool())
    result = service.execute_tool("dummy", foo="bar")
    print(result)

    print("Criando arquivo de teste para patch...")
    target_file = Path(__file__).parent / "agent" / "data" / "test_patch_target.txt"
    target_file.parent.mkdir(parents=True, exist_ok=True)
    target_file.write_text("Original content\n", encoding="utf-8")

    print("Submetendo proposta de modificação...")
    proposal = service.submit_modification_proposal(
        description="Atualizar arquivo de teste de patch",
        target_files=["agent/data/test_patch_target.txt"],
        patch_summary="Substituir conteúdo do arquivo de teste",
        detailed_changes={"diff": "- Original content\n+ Updated content\n"},
        file_patches={"agent/data/test_patch_target.txt": "Updated content\n"},
        user_id="tester"
    )
    print(proposal)

    print("Aprovando proposta de modificação...")
    approved = service.approve_modification_proposal(
        proposal_id=proposal["id"],
        approved_by="tester",
        approval_comment="Aprovo a proposta offline"
    )
    print(approved)

    print("Verificando conteúdo do arquivo de teste...")
    print(target_file.read_text(encoding="utf-8"))

    print("Alterando modo offline...")
    service.set_offline_mode(False)
    print({"offline_mode": service.offline_mode})

    print("Status do supervisor:")
    print(service.get_supervisor_status())

    print("Relatório final:")
    print(service.get_session_report())


if __name__ == "__main__":
    main()


## Tags
#categoria/integração

