---
source: /workspaces/Aura-sphere-/packages/bridge/agent/config.py
filename: config.py
---

# config.py

"""
Configuração do Sistema de Logging e Auditoria

Arquivo de configuração centralizado para o sistema de logs.
"""

import os
from pathlib import Path
from typing import Dict, Any

# Diretório base do projeto
BASE_DIR = Path(__file__).parent.parent.parent.parent

# Configurações de logging
LOG_CONFIG = {
    "log_directory": BASE_DIR / "logs",
    "audit_log_file": "audit.log",
    "max_file_size": 10 * 1024 * 1024,  # 10MB
    "backup_count": 5,
    "log_level": "INFO",
    "enable_console_logging": True,
    "enable_file_logging": True,
    "enable_structured_logging": True,
}

# Configurações de auditoria
AUDIT_CONFIG = {
    "enable_audit_trail": True,
    "audit_retention_days": 90,
    "enable_security_monitoring": True,
    "rate_limit_max_per_hour": 100,
    "enable_anomaly_detection": True,
    "alert_thresholds": {
        "security_violations_per_hour": 5,
        "errors_per_hour": 10,
        "rate_limit_violations_per_hour": 3,
    }
}

# Configurações de segurança
SECURITY_CONFIG = {
    "enable_permission_checks": True,
    "enable_sandbox_validation": True,
    "enable_input_sanitization": True,
    "max_execution_time": 30,  # segundos
    "max_memory_usage": 100 * 1024 * 1024,  # 100MB
    "blocked_modules": [
        "os.system",
        "subprocess.call",
        "eval",
        "exec",
        "__import__",
    ]
}

def get_log_config() -> Dict[str, Any]:
    """Retorna configuração de logging"""
    return LOG_CONFIG.copy()

def get_audit_config() -> Dict[str, Any]:
    """Retorna configuração de auditoria"""
    return AUDIT_CONFIG.copy()

def get_security_config() -> Dict[str, Any]:
    """Retorna configuração de segurança"""
    return SECURITY_CONFIG.copy()

def ensure_log_directory() -> Path:
    """Garante que o diretório de logs existe"""
    log_dir = LOG_CONFIG["log_directory"]
    log_dir.mkdir(parents=True, exist_ok=True)
    return log_dir

# Criar diretório de logs na importação
ensure_log_directory()
