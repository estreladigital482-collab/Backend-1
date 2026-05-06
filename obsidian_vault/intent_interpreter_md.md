---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/intent_interpreter.md
filename: intent_interpreter.md
---

# intent_interpreter.md

---
category: Integração
source: packages/bridge/agent/intent_interpreter.py
created: 2026-05-05T19:45:45.740168
size: 14769 bytes
hash: 9a2c736316e3f233bdce5d8d612b2759
headers:
---

# intent_interpreter.py

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/bridge/agent/intent_interpreter.py`
- **Tamanho**: 14769 bytes

## Conteúdo

"""
Módulo de Interpretação de Intenção - Analisa comandos do usuário

Este módulo analisa comandos do usuário para distinguir instruções diretas,
sugestões, ambiguidades e determinar o nível de risco das operações.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
import json
from pathlib import Path
import re


class IntentType(Enum):
    """Tipos de intenção identificados."""
    DIRECT_COMMAND = "direct_command"      # Comando direto e claro
    SUGGESTION = "suggestion"              # Sugestão ou recomendação
    QUESTION = "question"                  # Pergunta ou pedido de informação
    AMBIGUOUS = "ambiguous"                # Comando ambíguo
    APPROVAL = "approval"                  # Aprovação de algo
    REJECTION = "rejection"                # Rejeição de algo
    CLARIFICATION_REQUEST = "clarification_request"  # Pedido de esclarecimento


class RiskLevel(Enum):
    """Níveis de risco das operações."""
    LOW = "low"           # Operações seguras, sem impacto
    MEDIUM = "medium"     # Operações com impacto moderado
    HIGH = "high"         # Operações com alto impacto
    CRITICAL = "critical" # Operações irreversíveis ou perigosas


class UserIntent:
    """
    Representa uma intenção interpretada do usuário.
    """

    def __init__(self, intent_type: IntentType, confidence: float,
                 action: Optional[str] = None, parameters: Optional[Dict] = None,
                 risk_level: RiskLevel = RiskLevel.LOW,
                 requires_confirmation: bool = False,
                 ambiguities: Optional[List[str]] = None):
        self.intent_type = intent_type
        self.confidence = confidence
        self.action = action
        self.parameters = parameters or {}
        self.risk_level = risk_level
        self.requires_confirmation = requires_confirmation
        self.ambiguities = ambiguities or []
        self.timestamp = datetime.now().isoformat()


class IntentInterpreter:
    """
    Interpreta intenções do usuário a partir de comandos de texto.

    Funcionalidades:
    - Distingue comandos diretos de sugestões
    - Detecta ambiguidades e solicita esclarecimento
    - Avalia nível de risco das operações
    - Fornece confiança na interpretação
    """

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.intent_dir = data_dir / "intent_interpretation"
        self.intent_dir.mkdir(parents=True, exist_ok=True)

        self.interpretation_log = self.intent_dir / "interpretations.json"

        self.interpretations_history: List[Dict] = []

        # Padrões de reconhecimento
        self._initialize_patterns()

        self._load_state()

    def _initialize_patterns(self) -> None:
        """Inicializa padrões de reconhecimento de intenção."""

        self.intent_patterns = {
            IntentType.DIRECT_COMMAND: [
                r"^(faça|execute|rode|crie|delete|remova|altere|modifique)",
                r"^(quero que você)",
                r"^(preciso que)",
                r"^(por favor,? )?(faça|execute|implemente)",
                r"^(implemente|desenvolva|construa)",
                r"^(delete|remova|exclua) (o|a|os|as)",
                r"^(altere|modifique|atualize) (o|a|os|as)"
            ],
            IntentType.SUGGESTION: [
                r"^(talvez|possivelmente|considere|que tal)",
                r"^(você poderia|seria possível)",
                r"^(sugiro que|recomendo que)",
                r"^(o que acha de|que tal se)",
                r"^(pense em|considere implementar)"
            ],
            IntentType.QUESTION: [
                r"\?$",
                r"^(como|quando|onde|por que|qual|quais)",
                r"^(pode me explicar|pode me dizer)",
                r"^(o que é|como funciona)",
                r"^(me ajude a entender)"
            ],
            IntentType.APPROVAL: [
                r"^(sim|aprove|aceite|concordo|ok|beleza|tá bom)",
                r"^(pode prosseguir|vá em frente)",
                r"^(está certo|correto|perfeito)",
                r"^(aprove isso|aceite isso)"
            ],
            IntentType.REJECTION: [
                r"^(não|nega|rejeite|cancele|pare)",
                r"^(não faça|não execute)",
                r"^(espere|aguarde|pare aí)",
                r"^(melhor não|prefiro não)"
            ],
            IntentType.CLARIFICATION_REQUEST: [
                r"^(não entendi|não compreendi)",
                r"^(pode esclarecer|pode explicar)",
                r"^(o que você quer dizer)",
                r"^(não está claro|está confuso)"
            ]
        }

        # Palavras-chave de risco
        self.risk_keywords = {
            RiskLevel.CRITICAL: [
                "delete.*all", "drop.*database", "format.*disk", "shutdown.*system",
                "override.*core", "modify.*immutable", "bypass.*security",
                "disable.*validation", "remove.*backup", "delete.*logs"
            ],
            RiskLevel.HIGH: [
                "delete.*file", "modify.*config", "change.*permission",
                "update.*database", "restart.*service", "kill.*process"
            ],
            RiskLevel.MEDIUM: [
                "create.*file", "update.*code", "modify.*function",
                "change.*setting", "install.*package", "run.*command"
            ],
            RiskLevel.LOW: [
                "show.*info", "list.*files", "read.*file", "check.*status",
                "display.*help", "print.*version"
            ]
        }

        # Padrões de ambiguidade
        self.ambiguity_patterns = [
            r"(talvez|possivelmente|quiçá)",
            r"(ou|alternativamente)",
            r"(depende|se)",
            r"(não sei|não tenho certeza)",
            r"(qualquer|algum|um dos)"
        ]

    def interpret(self, user_input: str) -> UserIntent:
        """
        Interpreta a intenção do usuário a partir do input.
        """

        input_lower = user_input.lower().strip()

        # Detectar tipo de intenção
        intent_type, confidence = self._classify_intent(input_lower)

        # Extrair ação e parâmetros
        action, parameters = self._extract_action_and_params(user_input)

        # Avaliar nível de risco
        risk_level = self._assess_risk_level(user_input)

        # Detectar ambiguidades
        ambiguities = self._detect_ambiguities(user_input)

        # Determinar se requer confirmação
        requires_confirmation = self._requires_confirmation(intent_type, risk_level, ambiguities)

        # Criar objeto de intenção
        intent = UserIntent(
            intent_type=intent_type,
            confidence=confidence,
            action=action,
            parameters=parameters,
            risk_level=risk_level,
            requires_confirmation=requires_confirmation,
            ambiguities=ambiguities
        )

        # Registrar interpretação
        self._log_interpretation(user_input, intent)

        return intent

    def _classify_intent(self, input_text: str) -> tuple[IntentType, float]:
        """
        Classifica o tipo de intenção baseado em padrões.
        """

        scores = {}

        for intent_type, patterns in self.intent_patterns.items():
            max_score = 0.0
            for pattern in patterns:
                match = re.search(pattern, input_text, re.IGNORECASE)
                if match:
                    # Score baseado na posição da correspondência (início = mais provável)
                    position_score = 1.0 - (match.start() / max(len(input_text), 1))
                    pattern_score = min(1.0, len(match.group()) / 20.0)  # Normalizar por comprimento
                    score = (position_score + pattern_score) / 2
                    max_score = max(max_score, score)

            scores[intent_type] = max_score

        # Encontrar intenção com maior score
        if scores:
            best_intent = max(scores, key=scores.get)
            confidence = scores[best_intent]

            # Ajustar confiança baseado em contexto
            if len(input_text.split()) < 3:  # Inputs muito curtos são mais ambíguos
                confidence *= 0.7

            return best_intent, min(confidence, 1.0)

        # Fallback para ambíguo se nenhum padrão corresponder
        return IntentType.AMBIGUOUS, 0.3

    def _extract_action_and_params(self, user_input: str) -> tuple[Optional[str], Dict[str, Any]]:
        """
        Extrai ação e parâmetros do input do usuário.
        """

        # Implementação simplificada - em produção usaria NLP mais sofisticado
        words = user_input.lower().split()

        # Procurar por verbos de ação
        action_verbs = ["faça", "execute", "crie", "delete", "remova", "altere",
                       "modifique", "implemente", "rode", "teste", "verifique"]

        action = None
        for verb in action_verbs:
            if verb in words:
                action = verb
                break

        # Parâmetros simples baseados em palavras-chave
        parameters = {}

        if "arquivo" in user_input.lower() or "file" in user_input.lower():
            # Procurar por nome de arquivo
            file_match = re.search(r'[\w\.-]+\.(py|js|ts|md|txt|json)', user_input)
            if file_match:
                parameters["file"] = file_match.group()

        if "função" in user_input.lower() or "function" in user_input.lower():
            # Procurar por nome de função
            func_match = re.search(r'função\s+(\w+)|function\s+(\w+)', user_input, re.IGNORECASE)
            if func_match:
                parameters["function"] = func_match.group(1) or func_match.group(2)

        return action, parameters

    def _assess_risk_level(self, user_input: str) -> RiskLevel:
        """
        Avalia o nível de risco da operação solicitada.
        """

        input_lower = user_input.lower()

        # Verificar palavras-chave de risco crítico primeiro
        for keyword in self.risk_keywords[RiskLevel.CRITICAL]:
            if re.search(keyword, input_lower):
                return RiskLevel.CRITICAL

        # Depois alto risco
        for keyword in self.risk_keywords[RiskLevel.HIGH]:
            if re.search(keyword, input_lower):
                return RiskLevel.HIGH

        # Médio risco
        for keyword in self.risk_keywords[RiskLevel.MEDIUM]:
            if re.search(keyword, input_lower):
                return RiskLevel.MEDIUM

        # Default para baixo risco
        return RiskLevel.LOW

    def _detect_ambiguities(self, user_input: str) -> List[str]:
        """
        Detecta ambiguidades no input do usuário.
        """

        ambiguities = []
        input_lower = user_input.lower()

        for pattern in self.ambiguity_patterns:
            if re.search(pattern, input_lower):
                ambiguities.append(f"Detected ambiguity pattern: '{pattern}'")

        # Verificar se input é muito curto
        if len(user_input.split()) < 4:
            ambiguities.append("Input is very short and may be ambiguous")

        # Verificar múltiplas opções
        if " ou " in input_lower or " or " in input_lower:
            ambiguities.append("Multiple options detected - clarification needed")

        return ambiguities

    def _requires_confirmation(self, intent_type: IntentType, risk_level: RiskLevel,
                             ambiguities: List[str]) -> bool:
        """
        Determina se a operação requer confirmação do usuário.
        """

        # Sempre requer confirmação para operações críticas
        if risk_level == RiskLevel.CRITICAL:
            return True

        # Requer confirmação para operações de alto risco
        if risk_level == RiskLevel.HIGH:
            return True

        # Requer confirmação se houver ambiguidades
        if ambiguities:
            return True

        # Requer confirmação para comandos diretos de risco médio
        if intent_type == IntentType.DIRECT_COMMAND and risk_level == RiskLevel.MEDIUM:
            return True

        return False

    def validate_intent_safety(self, intent: UserIntent) -> tuple[bool, Optional[str]]:
        """
        Valida se a intenção interpretada é segura para execução.
        """

        # Rejeitar intenções com baixa confiança
        if intent.confidence < 0.5:
            return False, f"Intention confidence too low: {intent.confidence:.2f}"

        # Rejeitar intenções ambíguas sem confirmação
        if intent.intent_type == IntentType.AMBIGUOUS and not intent.requires_confirmation:
            return False, "Ambiguous intention requires confirmation"

        # Rejeitar operações críticas sem confirmação explícita
        if (intent.risk_level in [RiskLevel.CRITICAL, RiskLevel.HIGH] and
            not intent.requires_confirmation):
            return False, f"High-risk operation requires confirmation: {intent.risk_level.value}"

        return True, None

    def evaluate_user_override(self, intent: UserIntent) -> bool:
        """
        Avalia se o usuário está tentando sobrescrever decisões da IA.
        SEMPRE retorna True - usuário sempre tem prioridade.
        """
        return True

    def get_interpretation_history(self, limit: int = 50) -> List[Dict]:
        """Retorna histórico de interpretações."""
        return self.interpretations_history[-limit:]

    def _log_interpretation(self, user_input: str, intent: UserIntent) -> None:
        """Registra interpretação no histórico."""

        interpretation_entry = {
            "timestamp": intent.timestamp,
            "user_input": user_input,
            "intent_type": intent.intent_type.value,
            "confidence": intent.confidence,
            "action": intent.action,
            "parameters": intent.parameters,
            "risk_level": intent.risk_level.value,
            "requires_confirmation": intent.requires_confirmation,
            "ambiguities": intent.ambiguities
        }

        self.interpretations_history.append(interpretation_entry)
        self._save_state()

    def _load_state(self) -> None:
        """Carrega estado do interpretador."""

        if self.interpretation_log.exists():
            try:
                self.interpretations_history = json.loads(
                    self.interpretation_log.read_text(encoding='utf-8')
                )
            except Exception:
                self.interpretations_history = []

    def _save_state(self) -> None:
        """Persiste estado do interpretador."""

        self.intent_dir.mkdir(parents=True, exist_ok=True)

        self.interpretation_log.write_text(
            json.dumps(self.interpretations_history[-1000:], ensure_ascii=False, indent=2),
            encoding='utf-8'
        )


## Tags
#categoria/integração

