#!/bin/bash

# 🚀 Aura Sphere Developer Toolkit
# Setup inicial + Workflow utilities
# Uso: ./scripts/dev_setup.sh

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    clear
    echo -e "${BOLD}${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     🚀 Aura Sphere Developer Toolkit Setup                 ║"
    echo "║                                                            ║"
    echo "║  Preparando ambiente para desenvolvimento                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

print_section() {
    echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_requirements() {
    print_section "1️⃣  Verificando Requisitos"
    
    local missing=""
    
    # Git
    if ! command -v git &> /dev/null; then
        missing="$missing\n  ❌ Git"
    else
        echo -e "${GREEN}✓ Git${NC}"
    fi
    
    # Python 3
    if ! command -v python3 &> /dev/null; then
        missing="$missing\n  ❌ Python3"
    else
        version=$(python3 --version | cut -d' ' -f2)
        echo -e "${GREEN}✓ Python3 ($version)${NC}"
    fi
    
    # Node (opcional)
    if command -v node &> /dev/null; then
        version=$(node --version)
        echo -e "${GREEN}✓ Node.js ($version)${NC}"
    else
        echo -e "${YELLOW}⚠ Node.js (opcional)${NC}"
    fi
    
    # Bun (opcional)
    if command -v bun &> /dev/null; then
        version=$(bun --version)
        echo -e "${GREEN}✓ Bun ($version)${NC}"
    else
        echo -e "${YELLOW}⚠ Bun (opcional)${NC}"
    fi
    
    if [ ! -z "$missing" ]; then
        echo -e "$missing"
        echo -e "\n${YELLOW}⚠ Instale os requisitos faltantes${NC}\n"
        return 1
    fi
    
    echo -e "\n${GREEN}✓ Todos os requisitos estão OK!${NC}"
    return 0
}

setup_git() {
    print_section "2️⃣  Configurando Git"
    
    local user_name=$(git config user.name || echo "")
    local user_email=$(git config user.email || echo "")
    
    if [ -z "$user_name" ] || [ -z "$user_email" ]; then
        echo -e "${YELLOW}Git não configurado localmente${NC}"
        echo -n "Nome (padrão: Aura Sphere Dev): "
        read -r name
        name="${name:=Aura Sphere Dev}"
        
        echo -n "Email (padrão: dev@aura-sphere.local): "
        read -r email
        email="${email:=dev@aura-sphere.local}"
        
        git config user.name "$name"
        git config user.email "$email"
        echo -e "${GREEN}✓ Git configurado${NC}\n"
    else
        echo -e "${GREEN}✓ Git já configurado:${NC}"
        echo "  Nome: $user_name"
        echo "  Email: $user_email\n"
    fi
}

setup_git_hooks() {
    print_section "3️⃣  Configurando Git Hooks"
    
    if [ -f "scripts/setup_git_hooks.sh" ]; then
        echo -e "Deseja instalar git hooks? (s/n): "
        read -r response
        
        if [[ "$response" =~ ^[Ss] ]]; then
            bash scripts/setup_git_hooks.sh
        else
            echo -e "${YELLOW}ℹ️  Pulando git hooks${NC}\n"
        fi
    else
        echo -e "${YELLOW}ℹ️  setup_git_hooks.sh não encontrado${NC}\n"
    fi
}

make_scripts_executable() {
    print_section "4️⃣  Tornando Scripts Executáveis"
    
    chmod +x scripts/auto_commit.sh 2>/dev/null && echo -e "${GREEN}✓ auto_commit.sh${NC}" || true
    chmod +x scripts/auto_commit.py 2>/dev/null && echo -e "${GREEN}✓ auto_commit.py${NC}" || true
    chmod +x scripts/setup_git_hooks.sh 2>/dev/null && echo -e "${GREEN}✓ setup_git_hooks.sh${NC}" || true
    chmod +x scripts/setup.sh 2>/dev/null && echo -e "${GREEN}✓ setup.sh${NC}" || true
    chmod +x scripts/dev.sh 2>/dev/null && echo -e "${GREEN}✓ dev.sh${NC}" || true
    
    echo ""
}

create_aliases() {
    print_section "5️⃣  Criando Aliases Git"
    
    echo -e "Aliases disponíveis:\n"
    
    # Auto-commit alias
    git config alias.acp '!bash scripts/auto_commit.sh' 2>/dev/null && \
        echo -e "${GREEN}✓${NC} git acp        → ./scripts/auto_commit.sh" || true
    
    # Sync alias
    git config alias.sync '!python scripts/auto_commit.py' 2>/dev/null && \
        echo -e "${GREEN}✓${NC} git sync       → python scripts/auto_commit.py" || true
    
    # Logs prettier
    git config alias.logs 'log --oneline --graph --all --decorate' 2>/dev/null && \
        echo -e "${GREEN}✓${NC} git logs       → Pretty logs" || true
    
    # Status curto
    git config alias.st 'status' 2>/dev/null && \
        echo -e "${GREEN}✓${NC} git st         → status" || true
    
    echo ""
}

setup_env_files() {
    print_section "6️⃣  Verificando Arquivos de Ambiente"
    
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        echo -e "${YELLOW}⚠️  .env não encontrado${NC}"
        echo -n "Criar .env a partir de .env.example? (s/n): "
        read -r response
        
        if [[ "$response" =~ ^[Ss] ]]; then
            cp .env.example .env
            echo -e "${GREEN}✓ .env criado${NC}"
            echo -e "${YELLOW}⚠️  IMPORTANTE: Edite .env e adicione suas API keys!${NC}\n"
        fi
    elif [ -f ".env" ]; then
        echo -e "${GREEN}✓ .env já existe${NC}\n"
    else
        echo -e "${YELLOW}⚠️  .env.example também não encontrado${NC}\n"
    fi
}

print_summary() {
    print_section "✨ Setup Completo!"
    
    echo -e "${BOLD}Comandos Úteis:${NC}\n"
    
    echo -e "  ${BOLD}Workflow Daily:${NC}"
    echo -e "    • ./scripts/auto_commit.sh   → Auto commit + push"
    echo -e "    • git acp (alias)            → Atalho para auto_commit.sh"
    echo -e "    • git sync (alias)           → Python version"
    echo -e ""
    
    echo -e "  ${BOLD}Desenvolvimento:${NC}"
    echo -e "    • ./scripts/setup.sh         → Setup inicial"
    echo -e "    • ./scripts/dev.sh           → Docker compose up"
    echo -e "    • git logs (alias)           → Ver histórico"
    echo -e "    • git st (alias)             → Status curto"
    echo -e ""
    
    echo -e "  ${BOLD}Estudo & Tarefas:${NC}"
    echo -e "    • STUDY_PLAN.md              → Lista de 850+ tarefas"
    echo -e "    • GIT_WORKFLOW.md            → Guia de workflow"
    echo -e "    • ARCHITECTURE.md            → Design do projeto"
    echo -e ""
    
    echo -e "${BOLD}Próximos Passos:${NC}\n"
    echo -e "  1. Edite ${BOLD}.env${NC} com suas API keys (OpenAI/Anthropic)"
    echo -e "  2. Rode ${BOLD}./scripts/dev.sh${NC} para iniciar containers"
    echo -e "  3. Abra primeira tarefa do ${BOLD}STUDY_PLAN.md${NC}"
    echo -e "  4. Use ${BOLD}./scripts/auto_commit.sh${NC} após mudanças"
    echo -e "  5. Estude repositórios em ${BOLD}external-repos/{{NC}\n"
    
    echo -e "${GREEN}📚 Documentação:${NC}\n"
    echo -e "  • README.md                → Overview"
    echo -e "  • ARCHITECTURE.md          → Design técnico"
    echo -e "  • SETUP.md                 → 如何配置"
    echo -e "  • STUDY_PLAN.md            → 850+ tarefas de aprendizado"
    echo -e "  • GIT_WORKFLOW.md          → Auto-commit guide"
    echo -e "  • MAINTENANCE.md           → Deploy & checklist"
    echo ""
}

main() {
    print_header
    
    # Verificar se está em repo git
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}⚠️  Este não é um repositório git!${NC}"
        echo -e "${YELLOW}Inicializando...${NC}\n"
        git init
        echo -e "${GREEN}✓ Repositório inicializado${NC}\n"
    fi
    
    # Executar setup
    check_requirements
    setup_git
    setup_git_hooks
    make_scripts_executable
    create_aliases
    setup_env_files
    print_summary
    
    echo -e "${BOLD}${GREEN}🎉 Tudo pronto para começar!${NC}\n"
}

# Trap Ctrl+C
trap 'echo -e "\n${YELLOW}⏹️  Setup cancelado${NC}\n"; exit 0' INT

# Run
main "$@"
