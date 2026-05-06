"""
AbilityWrapper - Gerador seguro de wrappers para habilidades integradas
"""

import inspect
from typing import Callable, Any, Dict

class AbilityWrapper:
    """Cria wrappers seguros para funções/habilidades"""
    
    def __init__(self, func: Callable, safety_checks: Dict[str, Any] = None):
        self.func = func
        self.name = func.__name__
        self.signature = inspect.signature(func)
        self.docstring = func.__doc__
        self.safety_checks = safety_checks or {}
        
    def validate_parameters(self, **kwargs) -> bool:
        """Validar parâmetros antes de executar"""
        for param_name, param_value in kwargs.items():
            if param_name in self.safety_checks:
                check = self.safety_checks[param_name]
                if 'type' in check:
                    if not isinstance(param_value, check['type']):
                        raise TypeError(f"Parâmetro {param_name} deve ser {check['type']}")
                if 'max_length' in check:
                    if len(str(param_value)) > check['max_length']:
                        raise ValueError(f"Parâmetro {param_name} excede tamanho máximo")
        return True

    def execute(self, **kwargs) -> Any:
        """Executar função com validações"""
        self.validate_parameters(**kwargs)
        try:
            return self.func(**kwargs)
        except Exception as e:
            return {"error": str(e), "status": "failed"}

    def to_json(self) -> Dict:
        """Converter para JSON para armazenamento"""
        return {
            "name": self.name,
            "signature": str(self.signature),
            "docstring": self.docstring,
            "safety_checks": self.safety_checks
        }


# Exemplo de gerador automático
def generate_ability_wrapper(func: Callable, safety_profile: str = "standard") -> AbilityWrapper:
    """Gerar wrapper automático com perfil de segurança"""
    
    profiles = {
        "strict": {
            "timeout": 30,
            "max_memory": "100MB",
            "allowed_imports": [],
            "param_validation": True
        },
        "standard": {
            "timeout": 60,
            "max_memory": "500MB",
            "allowed_imports": ["requests", "json"],
            "param_validation": True
        },
        "permissive": {
            "timeout": 300,
            "max_memory": "1GB",
            "allowed_imports": "all",
            "param_validation": False
        }
    }
    
    profile = profiles.get(safety_profile, profiles["standard"])
    return AbilityWrapper(func, safety_checks=profile)
