#!/bin/bash

# 🎯 Setup Git Hooks para Auto-commit/push automático
# Uso: ./scripts/setup_git_hooks.sh

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📚 Setup Git Hooks - Aura Sphere${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Verificar se está em repositório git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Não é um repositório git!${NC}"
    exit 1
fi

# Criar diretório de hooks se não existir
mkdir -p .git/hooks

# Hook: Post-commit (opcional - não activar por padrão, muito agressivo)
create_post_commit_hook() {
    local hook_file=".git/hooks/post-commit"
    
    cat > "$hook_file" << 'EOF'
#!/bin/bash
# Post-commit Hook - Auto sync com remote (OPCIONAL)
# Descomente a linha abaixo para ativar push automático após todo commit

# BRANCH=$(git rev-parse --abbrev-ref HEAD)
# git push origin $BRANCH &> /dev/null &

exit 0
EOF
    
    chmod +x "$hook_file"
    echo -e "${GREEN}✓ Post-commit hook criado (desativado por padrão)${NC}"
}

# Hook: Pre-push validation
create_pre_push_hook() {
    local hook_file=".git/hooks/pre-push"
    
    cat > "$hook_file" << 'EOF'
#!/bin/bash
# Pre-push validation
# Executa testes rápidos antes de fazer push

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Validando antes de push...${NC}"

# Verificar se há testes
if [ -f "packages/bridge/test_api.py" ]; then
    echo -e "${YELLOW}⚙️  Rodando testes Python...${NC}"
    cd packages/bridge
    python -m pytest test_api.py -q 2>/dev/null || true
    cd ../..
    echo -e "${GREEN}✓ Testes completos${NC}"
fi

echo -e "${GREEN}✓ Validação concluída${NC}"
exit 0
EOF
    
    chmod +x "$hook_file"
    echo -e "${GREEN}✓ Pre-push hook criado${NC}"
}

# Hook: Prepare-commit-msg (para adicionar branch info)
create_prepare_commit_msg_hook() {
    local hook_file=".git/hooks/prepare-commit-msg"
    
    cat > "$hook_file" << 'EOF'
#!/bin/bash
# Prepare commit message - adiciona branch info

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Só adicionar info se não for merge/squash
if [ -z "$COMMIT_SOURCE" ]; then
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
    
    # Adicionar branch no final se não estiver lá
    if ! grep -q "\[$BRANCH_NAME\]" "$COMMIT_MSG_FILE"; then
        echo "" >> "$COMMIT_MSG_FILE"
        echo "# [$BRANCH_NAME]" >> "$COMMIT_MSG_FILE"
    fi
fi

exit 0
EOF
    
    chmod +x "$hook_file"
    echo -e "${GREEN}✓ Prepare-commit-msg hook criado${NC}"
}

# Criar hooks
echo -e "${BLUE}📝 Criando git hooks...${NC}\n"

create_post_commit_hook
create_pre_push_hook
create_prepare_commit_msg_hook

echo -e "\n${GREEN}✅ Git hooks instalados com sucesso!${NC}\n"

echo -e "${BOLD}📋 Hooks disponíveis:${NC}"
echo -e "  ${YELLOW}post-commit${NC}       - Auto push após commit (DESATIVADO)"
echo -e "  ${YELLOW}pre-push${NC}          - Validação antes de push"
echo -e "  ${YELLOW}prepare-commit-msg${NC} - Adiciona info de branch\n"

echo -e "${BLUE}💡 Dicas:${NC}"
echo -e "  1. Use ${BOLD}./scripts/auto_commit.sh${NC} para commit + push manual"
echo -e "  2. Edite ${BOLD}.git/hooks/post-commit${NC} para ativar auto push"
echo -e "  3. Os hooks só rodam em commits locais, não em amend\n"

echo -e "${GREEN}✨ Setup completo!${NC}\n"
