#!/bin/bash

# ============================================================
# Run Automation Suite - Executa os scripts principais de automação
# ============================================================
# Usage: ./scripts/run_automation.sh
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(dirname "$0")"
cd "$PROJECT_ROOT/.."

echo -e "${BOLD}🚀 Executando suite de automação Aura Sphere...${NC}\n"

ensure_node_modules() {
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 node_modules não encontrado. Instalando dependências...${NC}"
    npm ci
  fi
}

run_step() {
  local label="$1"
  shift
  echo -e "${BOLD}---\n${label}${NC}"
  if ! "$@"; then
    echo -e "${RED}❌ Falha no passo: ${label}${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Passo concluído: ${label}${NC}\n"
}

ensure_node_modules
run_step "Instalar hooks de git" bash scripts/setup-hooks.sh
run_step "Validar código (lint, tipos, testes, build)" bash scripts/validate.sh
run_step "Validar documentação e OpenAPI" bash scripts/doc-validate.sh
run_step "Executar health checks" bash scripts/monitor.sh
run_step "Rodar limpeza em modo dry-run" bash scripts/cleanup.sh --dry-run

echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✅ Suite de automação concluída com sucesso!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
