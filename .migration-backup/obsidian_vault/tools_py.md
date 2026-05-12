---
source: /workspaces/Aura-sphere-/packages/bridge/agent/tools.py
filename: tools.py
---

# tools.py

"""
Agent Tools - Registro e execução controlada de ferramentas.
"""

from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

from .logging import log_agent_action, LogEvent, LogLevel


@dataclass
class ToolExecutionResult:
    tool_name: str
    success: bool
    result: Any
    error: Optional[str]
    metadata: Dict[str, Any] = field(default_factory=dict)


class ToolBase:
    """Base para ferramentas que podem ser usadas pelo agente."""

    def __init__(self, name: str, description: str, permission_scope: str = "tools"):
        self.name = name
        self.description = description
        self.permission_scope = permission_scope

    def execute(self, **kwargs: Any) -> ToolExecutionResult:
        raise NotImplementedError("ToolBase.execute deve ser implementado pelas ferramentas")


class ToolRegistry:
    """Registro de ferramentas e execução com auditoria."""

    def __init__(self):
        self.tools: Dict[str, ToolBase] = {}

    def register(self, tool: ToolBase) -> None:
        self.tools[tool.name] = tool
        log_agent_action(
            agent_id="aura-agent",
            action="tool_registered",
            details={"tool_name": tool.name, "description": tool.description},
            level=LogLevel.DEBUG
        )

    def get_tool(self, name: str) -> Optional[ToolBase]:
        return self.tools.get(name)

    def list_tools(self) -> List[Dict[str, str]]:
        return [
            {"name": tool.name, "description": tool.description}
            for tool in self.tools.values()
        ]

    def execute_tool(self, name: str, **kwargs: Any) -> ToolExecutionResult:
        tool = self.get_tool(name)

        if not tool:
            return ToolExecutionResult(
                tool_name=name,
                success=False,
                result=None,
                error=f"Ferramenta não encontrada: {name}",
                metadata={}
            )

        try:
            result = tool.execute(**kwargs)
            log_agent_action(
                agent_id="aura-agent",
                action="tool_executed",
                details={
                    "tool_name": name,
                    "success": result.success,
                    "metadata": result.metadata,
                },
                level=LogLevel.INFO if result.success else LogLevel.WARNING
            )
            return result

        except Exception as exc:
            error_message = str(exc)
            log_agent_action(
                agent_id="aura-agent",
                action="tool_execution_failed",
                details={"tool_name": name, "error": error_message},
                level=LogLevel.ERROR
            )
            return ToolExecutionResult(
                tool_name=name,
                success=False,
                result=None,
                error=error_message,
                metadata={}
            )

